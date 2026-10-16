"""GROKKY HQ — the office: a Boss Grokbot plans, delegates, reviews and reports."""
from __future__ import annotations

import asyncio
import datetime as dt
import json
import os
import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml

from . import llm
from .events import bus

ROOT = Path(__file__).resolve().parent.parent


@dataclass
class Role:
    id: str
    name: str
    prompt: str
    tools: list[str] = field(default_factory=list)
    outfit: str = "hoodie"
    color: str = "#2fe38a"

    @property
    def avatar(self) -> str:
        return f"/assets/avatars/{self.id}.png"


def _expand(v):
    if isinstance(v, str):
        return re.sub(r"\$\{(\w+)\}", lambda m: os.getenv(m.group(1), ""), v)
    return v


class Office:
    def __init__(self, config: str | Path = ROOT / "office.yaml"):
        cfg = yaml.safe_load(Path(config).read_text(encoding="utf-8"))
        self.cfg = {k: _expand(v) for k, v in cfg.get("office", {}).items()}
        self.rules = cfg.get("rules", "")
        self.roles = {r["id"]: Role(**{k: r[k] for k in ("id", "name", "prompt", "tools", "outfit", "color") if k in r}) for r in cfg["roles"]}
        self.boss = self.roles["boss"]
        self.workers = {k: v for k, v in self.roles.items() if k != "boss"}
        self.running = False

    # ------------------------------------------------------------ helpers
    def system_for(self, role: Role) -> str:
        return f"{self.rules}\n\nROLE_ID={role.id}\nYOUR ROLE: {role.name}\n{role.prompt}\nToday is {dt.date.today():%Y-%m-%d}."

    async def _ask(self, role: Role, user: str, kind="worker", tools=None) -> str:
        return await asyncio.to_thread(llm.ask, self.system_for(role), user, role.tools if tools is None else tools, kind)

    # ------------------------------------------------------------ 1. plan
    async def plan(self, goal: str, only: list[str] | None = None) -> list[dict]:
        roster = "\n".join(f"- {r.id}: {r.name} — {r.prompt.strip().splitlines()[0]}" for r in self.workers.values())
        await bus.emit("boss", "planning", f"Planning: {goal}")
        raw = await self._ask(self.boss, (
            "PLAN_TASKS\nOwner goal:\n" + goal + "\n\nYour team:\n" + roster +
            "\n\nPick the roles that are useful for this goal (usually 4-10) and write ONE specific task for each."
            ' Reply ONLY with JSON: {"tasks":[{"role":"<id>","task":"<task>"}]}'), kind="boss", tools=[])
        tasks = []
        m = re.search(r"\{.*\}", raw or "", re.S)
        if m:
            try:
                tasks = [t for t in json.loads(m.group(0)).get("tasks", []) if t.get("role") in self.workers]
            except json.JSONDecodeError:
                tasks = []
        if not tasks:  # fallback / demo mode: everyone works on the goal
            tasks = [{"role": rid, "task": f"Work on this goal from your role's angle: {goal}"} for rid in self.workers]
        if only:
            tasks = [t for t in tasks if t["role"] in only] or [{"role": r, "task": goal} for r in only if r in self.workers]
        for t in tasks:
            await bus.emit(t["role"], "assigned", t["task"])
        return tasks

    # ------------------------------------------------------------ 2. work + 3. review
    async def work(self, task: dict, goal: str, sem: asyncio.Semaphore) -> dict:
        role = self.workers[task["role"]]
        async with sem:
            await bus.emit(role.id, "working", task["task"])
            out = await self._ask(role, f"Owner goal: {goal}\n\nYour task from The Boss: {task['task']}")
            await bus.emit(role.id, "submitted", out)
            revisions = 0
            while self.cfg.get("review", True) and revisions <= int(self.cfg.get("max_revisions", 1)):
                await bus.emit("boss", "reviewing", f"Checking {role.name}…", target=role.id)
                verdict = await self._ask(self.boss, (
                    f"REVIEW the report from {role.name}.\nTask: {task['task']}\n\nReport:\n{out[:12000]}\n\n"
                    'Is it specific, sourced and useful? Reply ONLY JSON: {"verdict":"APPROVED"|"REVISE","feedback":"..."}'),
                    kind="boss", tools=[])
                v = _json(verdict)
                if v.get("verdict", "APPROVED").upper().startswith("APPROVED") or revisions == int(self.cfg.get("max_revisions", 1)):
                    await bus.emit(role.id, "approved", v.get("feedback", "Approved."))
                    break
                revisions += 1
                await bus.emit(role.id, "revising", v.get("feedback", ""))
                out = await self._ask(role, f"Owner goal: {goal}\nTask: {task['task']}\n\nYour previous report:\n{out}\n\nBoss feedback: {v.get('feedback')}\nRewrite the report and fix it.")
                await bus.emit(role.id, "submitted", out)
            return {"role": role.id, "name": role.name, "task": task["task"], "output": out}

    # ------------------------------------------------------------ 4. brief
    async def brief(self, goal: str, results: list[dict]) -> str:
        await bus.emit("boss", "writing", "Writing the Daily Brief…")
        body = "\n\n".join(f"## {r['name']}\n{r['output'][:6000]}" for r in results)
        return await self._ask(self.boss, (
            f"DAILY BRIEF\nOwner goal: {goal}\n\nTeam reports:\n{body}\n\n"
            "Write the Daily Brief for the owner: TL;DR (3 lines), key findings per department, "
            "decisions to make today, next actions with owner role, risks. Markdown."), kind="boss", tools=[])

    # ------------------------------------------------------------ full run
    async def run(self, goal: str, only: list[str] | None = None) -> Path:
        if self.running:
            raise RuntimeError("A mission is already running")
        self.running = True
        try:
            await bus.emit("boss", "mission", goal)
            tasks = await self.plan(goal, only)
            sem = asyncio.Semaphore(int(self.cfg.get("max_parallel", 6)))
            results = await asyncio.gather(*(self.work(t, goal, sem) for t in tasks))
            brief = await self.brief(goal, results)
            path = save_report(goal, results, brief)
            await bus.emit("boss", "done", brief, report=str(path.name))
            return path
        except Exception as e:  # surface errors on the dashboard
            await bus.emit("boss", "error", f"{type(e).__name__}: {e}")
            raise
        finally:
            self.running = False


def _json(s: str) -> dict:
    m = re.search(r"\{.*\}", s or "", re.S)
    try:
        return json.loads(m.group(0)) if m else {}
    except json.JSONDecodeError:
        return {}


def save_report(goal: str, results: list[dict], brief: str) -> Path:
    d = ROOT / "reports"
    d.mkdir(exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y-%m-%d_%H-%M")
    p = d / f"{stamp}.md"
    parts = [f"# GROKKY HQ report — {stamp}", f"**Goal:** {goal}", "", brief, "", "---", ""]
    parts += [f"## {r['name']}\n_Task: {r['task']}_\n\n{r['output']}\n" for r in results]
    p.write_text("\n".join(parts), encoding="utf-8")
    return p
