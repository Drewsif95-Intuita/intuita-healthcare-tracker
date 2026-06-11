"""
Provenance and raw-snapshot handling.

Implements the register's source-handling rules:
  2. Store every raw download unchanged with extract timestamp and file hash.
  5. Add source freshness/confidence fields to every curated output.

Layout written to disk (bronze layer):

    <out>/bronze/<source_key>/<YYYY-MM-DD>/<filename>
    <out>/bronze/<source_key>/<YYYY-MM-DD>/_manifest.json     # per-download metadata
    <out>/bronze/_ingest_log.jsonl                            # append-only run log
    <out>/bronze/_state.json                                  # last sha256 per source (idempotency)
"""

from __future__ import annotations
import hashlib
import json
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def sha256_bytes(data: bytes) -> str:
    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()


@dataclass
class Manifest:
    run_id: str
    source_key: str
    source_name: str
    publisher: str
    pillar: str
    cadence: str
    ease: str
    method: str
    landing_page: str
    v1: bool
    status: str                      # downloaded | unchanged | skipped | manual | failed
    retrieved_at: str
    resolved_url: Optional[str] = None
    http_status: Optional[int] = None
    filename: Optional[str] = None
    rel_path: Optional[str] = None
    size_bytes: Optional[int] = None
    sha256: Optional[str] = None
    publication_hint: Optional[str] = None
    error: Optional[str] = None
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class Store:
    """Manages the bronze directory: paths, manifests, the run log and the idempotency state."""

    def __init__(self, out_root: str | Path):
        self.bronze = Path(out_root) / "bronze"
        self.bronze.mkdir(parents=True, exist_ok=True)
        self.log_path = self.bronze / "_ingest_log.jsonl"
        self.state_path = self.bronze / "_state.json"
        self._state = self._load_state()

    # ---- idempotency state ------------------------------------------------
    def _load_state(self) -> Dict[str, str]:
        if self.state_path.exists():
            try:
                return json.loads(self.state_path.read_text())
            except json.JSONDecodeError:
                return {}
        return {}

    def last_hash(self, source_key: str) -> Optional[str]:
        return self._state.get(source_key)

    def set_last_hash(self, source_key: str, sha: str) -> None:
        self._state[source_key] = sha
        self.state_path.write_text(json.dumps(self._state, indent=2))

    # ---- writing a download ----------------------------------------------
    def dest_dir(self, source_key: str) -> Path:
        d = self.bronze / source_key / today_str()
        d.mkdir(parents=True, exist_ok=True)
        return d

    def write_download(self, source_key: str, filename: str, data: bytes) -> Path:
        dest = self.dest_dir(source_key) / filename
        dest.write_bytes(data)
        return dest

    def write_manifest(self, m: Manifest) -> None:
        # per-download manifest beside the file (or in today's folder if no file)
        folder = self.dest_dir(m.source_key)
        (folder / "_manifest.json").write_text(json.dumps(m.to_dict(), indent=2))
        # append to the global run log
        with self.log_path.open("a") as f:
            f.write(json.dumps(m.to_dict()) + "\n")

    def rel(self, path: Path) -> str:
        try:
            return str(path.relative_to(self.bronze.parent))
        except ValueError:
            return str(path)
