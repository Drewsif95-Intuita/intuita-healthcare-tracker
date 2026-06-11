"""
Command-line entrypoint for the NHS sales-targeting bronze ingestion.

Examples
--------
    # list the registry
    python -m nhs_targeting_ingest.cli list

    # resolve URLs only, no download (great for first-run debugging)
    python -m nhs_targeting_ingest.cli fetch --v1 --probe

    # pull the whole v1 spine into ./data/bronze
    python -m nhs_targeting_ingest.cli fetch --v1 --out ./data

    # pull specific sources
    python -m nhs_targeting_ingest.cli fetch --source ae rtt diagnostics
"""

from __future__ import annotations
import argparse
import sys
from typing import List

from .sources import REGISTRY, BY_KEY, V1_KEYS, Source
from .provenance import Store
from .discovery import make_session
from .fetch import fetch_source


def _selected(args) -> List[Source]:
    if args.all:
        return list(REGISTRY)
    if args.v1:
        return [BY_KEY[k] for k in V1_KEYS]
    if args.source:
        bad = [s for s in args.source if s not in BY_KEY]
        if bad:
            sys.exit(f"Unknown source(s): {', '.join(bad)}. Run `list` to see valid keys.")
        return [BY_KEY[s] for s in args.source]
    sys.exit("Nothing selected. Use --v1, --all, or --source KEY [KEY ...].")


def cmd_list(_args) -> None:
    print(f"{'KEY':<22} {'V1':<3} {'EASE':<5} {'METHOD':<14} NAME")
    print("-" * 100)
    for s in REGISTRY:
        print(f"{s.key:<22} {'yes' if s.v1 else '-':<3} {s.ease:<5} {s.method:<14} {s.name}")
    print(f"\n{len(REGISTRY)} sources · {len(V1_KEYS)} in the v1 spine")


def cmd_fetch(args) -> None:
    sources = _selected(args)
    store = Store(args.out)
    session = make_session()
    mode = "PROBE (resolve only)" if args.probe else ("DRY-RUN" if args.dry_run else "FETCH")
    print(f"[{mode}] {len(sources)} source(s) -> {store.bronze}\n")

    counts = {}
    for s in sources:
        m = fetch_source(s, store, session, probe=args.probe,
                         dry_run=args.dry_run, api_days=args.api_days)
        counts[m.status] = counts.get(m.status, 0) + 1
        line = f"  {m.status.upper():<11} {s.key:<22}"
        if m.resolved_url:
            line += f" -> {m.resolved_url}"
        if m.error:
            line += f"   [{m.error}]"
        print(line)

    print("\nSummary: " + ", ".join(f"{k}={v}" for k, v in sorted(counts.items())))
    print(f"Log: {store.log_path}")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="nhs_targeting_ingest",
                                description="Bronze-layer ingestion for the NHS sales-targeting report.")
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="List the source registry.").set_defaults(func=cmd_list)

    f = sub.add_parser("fetch", help="Fetch sources into the bronze layer.")
    sel = f.add_mutually_exclusive_group(required=True)
    sel.add_argument("--v1", action="store_true", help="Fetch the v1 spine.")
    sel.add_argument("--all", action="store_true", help="Fetch every source.")
    sel.add_argument("--source", nargs="+", metavar="KEY", help="Fetch specific source key(s).")
    f.add_argument("--out", default="./data", help="Output root (bronze/ created beneath). Default ./data")
    f.add_argument("--probe", action="store_true", help="Resolve URLs only; do not download.")
    f.add_argument("--dry-run", action="store_true", help="Plan only; no network for downloads.")
    f.add_argument("--api-days", type=int, default=30, help="Look-back window (days) for procurement APIs.")
    f.set_defaults(func=cmd_fetch)
    return p


def main(argv: List[str] | None = None) -> None:
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
