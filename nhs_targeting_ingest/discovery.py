"""
HTTP session and landing-page link discovery.

Per the register's rule 1, we treat the landing page as canonical and discover the
latest file link at run time rather than hard-coding monthly URLs. Discovery is a
best-effort heuristic driven by per-source `link_keywords` / `file_exts`; on first
run use the CLI `--probe` flag to confirm the resolved URL and tune the hints in
sources.py if a site's markup differs.
"""

from __future__ import annotations
import re
import time
from typing import List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

USER_AGENT = (
    "IntuitaNHSTargeting/0.1 (+data-ingestion; respects robots & site terms; "
    "contact: data@intuita.example)"
)
DEFAULT_TIMEOUT = 60
DEFAULT_DELAY = 1.5  # polite delay between requests (seconds)

# crude month/year detector to prefer the most recent-looking link
_DATE_RE = re.compile(
    r"(20\d{2})[-_ ]?(0[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?",
    re.IGNORECASE,
)
_MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": USER_AGENT})
    retry_adapter = requests.adapters.HTTPAdapter(max_retries=requests.adapters.Retry(
        total=4, backoff_factor=1.0,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
    ))
    s.mount("https://", retry_adapter)
    s.mount("http://", retry_adapter)
    return s


def _recency_key(text: str) -> Tuple[int, int]:
    """Higher = more recent. Returns (year, month) parsed from a string, else (0, 0)."""
    best = (0, 0)
    for m in _DATE_RE.finditer(text):
        year = int(m.group(1))
        mon_raw = (m.group(2) or "").lower()
        mon = int(mon_raw) if mon_raw.isdigit() else _MONTHS.get(mon_raw[:3], 0)
        if (year, mon) > best:
            best = (year, mon)
    return best


def discover_latest_link(
    session: requests.Session,
    landing_page: str,
    file_exts: List[str],
    link_keywords: List[str],
) -> Tuple[Optional[str], int, List[str]]:
    """
    Return (best_url, http_status, candidate_urls).
    Strategy: collect <a> links whose href ends in a wanted extension; keep those whose
    href/text contains any keyword (if keywords given); prefer the most recent-looking.
    """
    resp = session.get(landing_page, timeout=DEFAULT_TIMEOUT)
    status = resp.status_code
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    exts = tuple(e.lower() for e in file_exts)
    kws = [k.lower() for k in link_keywords]

    candidates: List[Tuple[Tuple[int, int], str]] = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("#", "mailto:", "javascript:")):
            continue
        absolute = urljoin(landing_page, href)
        path = urlparse(absolute).path.lower()
        if not path.endswith(exts):
            continue
        haystack = (absolute + " " + a.get_text(" ", strip=True)).lower()
        if kws and not any(k in haystack for k in kws):
            continue
        candidates.append((_recency_key(haystack), absolute))

    if not candidates:
        return None, status, []

    # de-dupe preserving best recency, then sort newest first
    seen = {}
    for rk, url in candidates:
        if url not in seen or rk > seen[url]:
            seen[url] = rk
    ordered = sorted(seen.items(), key=lambda kv: kv[1], reverse=True)
    best_url = ordered[0][0]
    return best_url, status, [u for u, _ in ordered]


def polite_sleep(delay: float = DEFAULT_DELAY) -> None:
    time.sleep(delay)
