"""Tiny event bus: the office emits events, the dashboard listens over SSE."""
from __future__ import annotations

import asyncio
import json
import time


class Bus:
    def __init__(self):
        self.subs: set[asyncio.Queue] = set()
        self.history: list[dict] = []
        self.echo = False  # CLI prints events when True

    async def emit(self, role: str, kind: str, text: str = "", **extra):
        ev = {"t": time.time(), "role": role, "kind": kind, "text": text, **extra}
        self.history = (self.history + [ev])[-500:]
        if self.echo:
            short = text.replace("\n", " ")[:110]
            print(f"  [{role:>12}] {kind:<10} {short}")
        for q in list(self.subs):
            q.put_nowait(ev)

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self.subs.add(q)
        return q

    def unsubscribe(self, q):
        self.subs.discard(q)


bus = Bus()


def sse(ev: dict) -> str:
    return f"data: {json.dumps(ev, ensure_ascii=False)}\n\n"
