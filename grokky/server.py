"""Dashboard server: FastAPI + Server-Sent Events."""
from __future__ import annotations

import asyncio
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import llm
from .events import bus, sse
from .office import ROOT, Office

app = FastAPI(title="GROKKY HQ")
office = Office()
app.mount("/assets", StaticFiles(directory=ROOT / "assets"), name="assets")


class Mission(BaseModel):
    goal: str
    only: list[str] | None = None
    squad: str | None = None


@app.get("/")
def index():
    return FileResponse(ROOT / "web" / "index.html")


@app.get("/api/roles")
def roles():
    return {
        "demo": llm.demo_mode(),
        "model": llm.model_name("boss"),
        "squads": office.squads,
        "roles": [{"id": r.id, "name": r.name, "color": r.color, "tools": r.tools, "avatar": r.avatar,
                   "job": r.prompt.strip().splitlines()[0]} for r in office.roles.values()],
    }


@app.post("/api/mission")
async def mission(m: Mission):
    if office.running:
        raise HTTPException(409, "A mission is already running")
    if m.squad and m.squad not in office.squads:
        raise HTTPException(400, f"Unknown squad {m.squad}")
    asyncio.create_task(office.run(m.goal, m.only, m.squad or None))
    return {"ok": True}


@app.get("/api/events")
async def events():
    q = bus.subscribe()

    async def gen():
        try:
            for ev in bus.history[-200:]:
                yield sse(ev)
            while True:
                try:
                    ev = await asyncio.wait_for(q.get(), timeout=15)
                    yield sse(ev)
                except asyncio.TimeoutError:
                    yield ": ping\n\n"
        finally:
            bus.unsubscribe(q)

    return StreamingResponse(gen(), media_type="text/event-stream")


@app.get("/api/reports")
def reports():
    d = ROOT / "reports"
    return sorted([p.name for p in d.glob("*.md")], reverse=True) if d.exists() else []


@app.get("/api/reports/{name}")
def report(name: str):
    p = (ROOT / "reports" / name).resolve()
    if p.parent != (ROOT / "reports").resolve() or not p.exists():
        raise HTTPException(404)
    return PlainTextResponse(p.read_text(encoding="utf-8"))
