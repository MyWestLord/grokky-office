"""CLI:  python -m grokky serve | run "goal" | roles | loop "goal" --every 60"""
from __future__ import annotations

import argparse
import asyncio
import os

from dotenv import load_dotenv

load_dotenv()

from . import llm  # noqa: E402
from .events import bus  # noqa: E402


def main():
    ap = argparse.ArgumentParser(prog="grokky", description="GROKKY HQ — an office of Grok agents")
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("serve", help="start the visual office dashboard")
    s.add_argument("--port", type=int, default=int(os.getenv("OFFICE_PORT", 8042)))
    s.add_argument("--host", default="127.0.0.1")
    r = sub.add_parser("run", help="run one mission in the terminal")
    r.add_argument("goal")
    r.add_argument("--only", nargs="*", help="only these role ids")
    lp = sub.add_parser("loop", help="run the same mission every N minutes")
    lp.add_argument("goal")
    lp.add_argument("--every", type=int, default=60, help="minutes")
    lp.add_argument("--only", nargs="*")
    sub.add_parser("roles", help="list the team")
    a = ap.parse_args()

    if a.cmd == "serve":
        import uvicorn

        print(f"\n  GROKKY HQ is open → http://{a.host}:{a.port}   ({'DEMO mode' if llm.demo_mode() else 'model ' + llm.model_name()})\n")
        uvicorn.run("grokky.server:app", host=a.host, port=a.port, log_level="warning")
        return

    from .office import Office

    office = Office()
    if a.cmd == "roles":
        for r in office.roles.values():
            print(f"  {r.id:<12} {r.name:<18} tools={','.join(r.tools) or '-'}")
        return
    bus.echo = True
    if a.cmd == "run":
        p = asyncio.run(office.run(a.goal, a.only))
        print(f"\n  ✓ Report saved: {p}\n")
    elif a.cmd == "loop":
        async def forever():
            while True:
                p = await office.run(a.goal, a.only)
                print(f"\n  ✓ Report saved: {p}  — next run in {a.every} min\n")
                await asyncio.sleep(a.every * 60)
        asyncio.run(forever())


if __name__ == "__main__":
    main()
