"""
Per-source orchestration: resolve -> download -> hash -> manifest, dispatching on
the source's collection method. One source failing never aborts the run.
"""

from __future__ import annotations
import os
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import requests

from .sources import Source
from .provenance import Store, Manifest, sha256_bytes, utc_now_iso
from .discovery import discover_latest_link, polite_sleep, DEFAULT_TIMEOUT
from . import apis


def _filename_from_url(url: str, fallback: str) -> str:
    name = os.path.basename(urlparse(url).path)
    return name or fallback


def _base_manifest(src: Source, run_id: str, status: str) -> Manifest:
    return Manifest(
        run_id=run_id, source_key=src.key, source_name=src.name, publisher=src.publisher,
        pillar=src.pillar, cadence=src.cadence, ease=src.ease, method=src.method,
        landing_page=src.landing_page, v1=src.v1, status=status,
        retrieved_at=utc_now_iso(), notes=src.notes,
    )


def fetch_source(
    src: Source,
    store: Store,
    session: requests.Session,
    probe: bool = False,
    dry_run: bool = False,
    api_days: int = 30,
) -> Manifest:
    run_id = utc_now_iso()

    # --- manual bridge: don't auto-fetch a data feed -----------------------
    if src.method == "manual_bridge":
        m = _base_manifest(src, run_id, "manual")
        m.resolved_url = src.landing_page
        m.error = "Requires a maintained curated bridge; snapshot landing page for evidence only."
        if not (probe or dry_run):
            try:
                resp = session.get(src.landing_page, timeout=DEFAULT_TIMEOUT)
                data = resp.text.encode("utf-8")
                path = store.write_download(src.key, "landing_snapshot.html", data)
                m.http_status = resp.status_code
                m.filename = "landing_snapshot.html"
                m.rel_path = store.rel(path)
                m.size_bytes = len(data)
                m.sha256 = sha256_bytes(data)
            except Exception as e:  # noqa: BLE001
                m.status = "failed"
                m.error = f"{type(e).__name__}: {e}"
        store.write_manifest(m)
        return m

    # --- API sources -------------------------------------------------------
    if src.method in ("ocds_api", "cqc_api"):
        m = _base_manifest(src, run_id, "downloaded")
        fn = {"find_a_tender": "find_a_tender.json",
              "contracts_finder": "contracts_finder.json",
              "cqc": "cqc_providers.json"}.get(src.key, f"{src.key}.json")
        m.resolved_url = src.landing_page
        if probe or dry_run:
            m.status = "skipped"
            m.error = "probe/dry-run: API call not made"
            store.write_manifest(m)
            return m
        try:
            fetcher = apis.API_DISPATCH[src.key]
            data = fetcher(session, days=api_days) if src.key != "cqc" else fetcher(session)
            new_hash = sha256_bytes(data)
            if store.last_hash(src.key) == new_hash:
                m.status, m.sha256 = "unchanged", new_hash
            else:
                path = store.write_download(src.key, fn, data)
                m.filename, m.rel_path = fn, store.rel(path)
                m.size_bytes, m.sha256 = len(data), new_hash
                store.set_last_hash(src.key, new_hash)
        except Exception as e:  # noqa: BLE001
            m.status, m.error = "failed", f"{type(e).__name__}: {e}"
        store.write_manifest(m)
        return m

    # --- html_discover / direct -------------------------------------------
    m = _base_manifest(src, run_id, "downloaded")
    try:
        if dry_run:
            m.status = "skipped"
            m.resolved_url = src.landing_page
            m.error = ("dry-run: would resolve latest file from landing page"
                       if src.method == "html_discover" else "dry-run: would download direct URL")
            store.write_manifest(m)
            return m

        if src.method == "direct":
            resolved = src.landing_page
            m.resolved_url = resolved
        else:  # html_discover
            resolved, http_status, candidates = discover_latest_link(
                session, src.landing_page, src.file_exts, src.link_keywords)
            m.resolved_url = resolved
            m.http_status = http_status
            if not resolved:
                m.status = "failed"
                m.error = ("No matching file link found on landing page — tune file_exts / "
                           "link_keywords in sources.py (run with --probe to inspect).")
                store.write_manifest(m)
                return m

        if probe:
            m.status = "skipped"
            m.error = "probe: file not downloaded"
            store.write_manifest(m)
            return m

        resp = session.get(resolved, timeout=DEFAULT_TIMEOUT)
        resp.raise_for_status()
        data = resp.content
        new_hash = sha256_bytes(data)
        m.http_status = resp.status_code
        if store.last_hash(src.key) == new_hash:
            m.status, m.sha256 = "unchanged", new_hash
        else:
            fn = _filename_from_url(resolved, f"{src.key}.bin")
            path = store.write_download(src.key, fn, data)
            m.filename, m.rel_path = fn, store.rel(path)
            m.size_bytes, m.sha256 = len(data), new_hash
            store.set_last_hash(src.key, new_hash)
    except Exception as e:  # noqa: BLE001
        m.status, m.error = "failed", f"{type(e).__name__}: {e}"

    store.write_manifest(m)
    polite_sleep()
    return m
