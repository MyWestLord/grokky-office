"""Thin wrapper around the xAI Grok API (OpenAI-compatible Responses API).

Real mode : set XAI_API_KEY (get one at https://console.x.ai)
Demo mode : no key -> realistic fake outputs, so the dashboard works out of the box.
"""
from __future__ import annotations

import os
import random
import time

XAI_BASE_URL = os.getenv("XAI_BASE_URL", "https://api.x.ai/v1")


def model_name(kind: str = "boss") -> str:
    if kind == "worker":
        return os.getenv("GROK_WORKER_MODEL") or os.getenv("GROK_MODEL") or "grok-4.7"
    return os.getenv("GROK_MODEL") or "grok-4.7"


def demo_mode() -> bool:
    return not os.getenv("XAI_API_KEY")


_client = None


def client():
    global _client
    if _client is None:
        from openai import OpenAI  # imported lazily so demo mode needs no key

        _client = OpenAI(api_key=os.environ["XAI_API_KEY"], base_url=XAI_BASE_URL, timeout=600)
    return _client


def ask(system: str, user: str, tools: list[str] | None = None, kind: str = "worker") -> str:
    """One Grok call. `tools` are xAI server-side tools: web_search, x_search, code_interpreter."""
    if demo_mode():
        return _fake(system, user)
    kwargs = {}
    if tools:
        kwargs["tools"] = [{"type": t} for t in tools]
    resp = client().responses.create(
        model=model_name(kind),
        input=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        **kwargs,
    )
    return (resp.output_text or "").strip()


# ----------------------------------------------------------------- demo mode
_FAKE = {
    "x-research": "**TL;DR:** CT is 72% bullish, narrative = AI agents + memecoins.\n\n| Handle | Post | Why it matters |\n|---|---|---|\n| @onchain_owl | whale added 2.1M | smart money accumulating |\n| @devtoolsd | agent SDK v2 shipped | dev activity up |\n\n**Narratives:** AI agents, Grok integrations, low-cap rotation.\n**Risks:** paid shills, thin liquidity, copycat tickers.",
    "engineering": "**TL;DR:** shipped `watcher.py`, a cron that pulls new posts and alerts on keywords.\n\n```python\n# watcher.py\nimport time, requests\nKEYWORDS = ['grok', 'agent']\nwhile True:\n    print('scanning...')\n    time.sleep(60)\n```\nRun: `python watcher.py`",
    "trenches": "**TL;DR:** 3 tokens on the watchlist, none safe enough to ape.\n\n| Ticker | Chain | Narrative | Red flags | Conviction |\n|---|---|---|---|---|\n| $GROKKY | SOL | AI mascot | new LP | 6/10 |\n| $AGENT | BASE | agents | top 10 hold 40% | 4/10 |\n\nPaper trade only. Not financial advice.",
    "wall-st": "**TL;DR:** risk-on, AI infra leads.\n\n| Ticker | Thesis | Catalyst | Risk |\n|---|---|---|---|\n| NVDA | AI capex | earnings | valuation |\n| PLTR | gov AI | contracts | multiple |\n\nPaper trade: NVDA entry 180 / stop 168 / target 205. Not financial advice.",
    "content": "**TL;DR:** 3 posts + 1 thread drafted.\n\n1. I gave Grok a body and now it runs an office.\n2. My agents worked 24h. I worked 0.\n3. POV: your intern cloned himself 13 times.\n\n**Thread:** 1/ I built GROKKY HQ...",
    "whale-watch": "**TL;DR:** 2 large inflows, 1 exchange deposit.\n\n| Who | What | Size | When |\n|---|---|---|---|\n| 0x7a..f3 | buy | 2.1M | 2h ago |\n| 0xd4..2e | to CEX | 120K | 5h ago |\n\nConfidence: medium.",
    "seo": "**TL;DR:** 15 keywords, best cluster = 'grok ai agent'.\n\n| Keyword | Intent | Difficulty |\n|---|---|---|\n| grok ai agent | info | low |\n| grok api tutorial | info | medium |\n| ai agent office | commercial | low |",
    "creative": "**TL;DR:** 3 concepts. Winner: 'The Office That Never Sleeps'.\n\nPrompt: cute glossy white blob mascot with black pill eyes, neon office, 3D toy render, 4:5.",
    "pr": "**TL;DR:** press release + 10 targets.\n\n**GROKKY HQ launches an office of AI agents powered by Grok**\n\nPitch: Hi Sarah, saw your piece on AI agents...",
    "community": "**TL;DR:** 7-day calendar ready.\n\nMon: GM + meme, Tue: AMA, Wed: agent demo, Thu: contest, Fri: recap.\nFUD playbook: acknowledge, show receipts, never argue.",
    "pm": "**TL;DR:** 2-week plan, 4 milestones.\n\n| Task | Owner | Priority | Deadline |\n|---|---|---|---|\n| Launch post | content | P0 | Day 1 |\n| Landing page | engineering | P0 | Day 3 |",
    "analyst": "**TL;DR:** AI-agent mindshare +34% WoW.\n\n| KPI | Value |\n|---|---|\n| Mentions/day | 12.4K |\n| Engagement rate | 3.1% |",
    "qa": "**TL;DR:** 4 claims checked, 1 unverified.\n\n| Claim | Verdict | Source |\n|---|---|---|\n| SDK v2 shipped | true | docs |\n| airdrop cancelled | false | no source |",
}


def _fake(system: str, user: str) -> str:
    time.sleep(random.uniform(1.2, 3.5))
    if "PLAN_TASKS" in user:
        return ""  # boss planner falls back to default assignment in demo mode
    if "REVIEW" in user:
        return '{"verdict": "APPROVED", "feedback": "Solid work. Ship it."}' if random.random() > 0.2 else '{"verdict": "REVISE", "feedback": "Add more numbers and sources."}'
    if "DAILY BRIEF" in user:
        return "# GROKKY HQ — Daily Brief\n\n**TL;DR:** the team covered research, code, markets, content and growth.\n\n- X sentiment 72% bullish\n- 2 PRs shipped\n- Watchlist: 3 tokens (paper only)\n- 3 posts + 1 thread ready for approval\n\n_Demo mode: add XAI_API_KEY to get real results._"
    for rid, txt in _FAKE.items():
        if f"ROLE_ID={rid}" in system:
            return txt
    return "Done."
