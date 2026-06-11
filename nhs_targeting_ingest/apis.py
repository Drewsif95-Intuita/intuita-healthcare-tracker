"""
API clients for the procurement and regulatory sources.

These wrap the Find a Tender (OCDS), Contracts Finder (V2) and CQC APIs. Exact
endpoint paths and parameters should be confirmed against each provider's developer
documentation (linked in sources.py) on first run — the base URLs here are the
documented entry points but the APIs evolve, so they are overridable via env vars.

Environment variables
----------------------
  CQC_API_KEY              CQC subscription (primary) key — required for cqc_api.
  FTS_API_BASE             override Find a Tender OCDS base URL.
  CONTRACTS_FINDER_API_BASE  override Contracts Finder search URL.

NHS-relevant keyword set is configurable; buyer->ODS matching is deliberately NOT
done here — it belongs in a silver-layer step using bridges/buyer_alias_template.csv
with a confidence score (register rule 4).
"""

from __future__ import annotations
import json
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import requests

# Keywords that flag a notice as relevant to a data/BI/EPR/PMO proposition.
PROCUREMENT_KEYWORDS = [
    "electronic patient record", "EPR", "data platform", "business intelligence",
    "analytics", "data warehouse", "reporting", "Power BI", "Tableau", "dashboard",
    "PMO", "programme management", "digital maturity", "interoperability",
    "data quality", "information governance", "population health",
]

FTS_API_BASE = os.environ.get(
    "FTS_API_BASE",
    "https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages",
)
CONTRACTS_FINDER_API_BASE = os.environ.get(
    "CONTRACTS_FINDER_API_BASE",
    "https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search",
)
CQC_API_BASE = os.environ.get("CQC_API_BASE", "https://api.service.cqc.org.uk/public/v1")


def _since(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_find_a_tender(session: requests.Session, days: int = 30,
                        timeout: int = 60) -> bytes:
    """
    Pull recent OCDS release packages from Find a Tender, filtered by updated date.
    Returns the combined JSON as bytes (raw snapshot). Keyword filtering is applied
    downstream; we keep the raw payload here to stay faithful to the source.
    """
    params = {"updatedFrom": _since(days), "updatedTo": _since(0)}
    out: List[Dict[str, Any]] = []
    url: Optional[str] = FTS_API_BASE
    pages = 0
    while url and pages < 20:
        resp = session.get(url, params=params if pages == 0 else None, timeout=timeout)
        resp.raise_for_status()
        payload = resp.json()
        out.append(payload)
        # OCDS packages expose pagination via a 'links.next' cursor
        url = (payload.get("links") or {}).get("next")
        pages += 1
    return json.dumps({"fetched_at": _since(0), "pages": out}, indent=2).encode("utf-8")


def fetch_contracts_finder(session: requests.Session, days: int = 30,
                           timeout: int = 60) -> bytes:
    """Pull recent OCDS notices from Contracts Finder."""
    body = {
        "publishedFrom": _since(days),
        "publishedTo": _since(0),
        "size": 100,
    }
    resp = session.post(CONTRACTS_FINDER_API_BASE, json=body, timeout=timeout)
    resp.raise_for_status()
    return json.dumps(resp.json(), indent=2).encode("utf-8")


def fetch_cqc_providers(session: requests.Session, timeout: int = 60) -> bytes:
    """
    Pull the CQC provider list (paginated). Requires CQC_API_KEY. Locations/ratings
    can be expanded similarly; kept to providers here for the v1 trust linkage.
    """
    key = os.environ.get("CQC_API_KEY")
    if not key:
        raise RuntimeError(
            "CQC_API_KEY not set. Get a key from the CQC API portal and export it, "
            "or use the monthly 'care directory with ratings' download as a fallback."
        )
    headers = {"Ocp-Apim-Subscription-Key": key}
    providers: List[Dict[str, Any]] = []
    page, total_pages = 1, 1
    while page <= total_pages and page <= 200:
        resp = session.get(
            f"{CQC_API_BASE}/providers",
            params={"page": page, "perPage": 1000, "primaryInspectionCategoryCode": "H1"},
            headers=headers, timeout=timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        providers.extend(data.get("providers", []))
        total_pages = data.get("totalPages", 1)
        page += 1
    return json.dumps({"fetched_at": _since(0), "providers": providers}, indent=2).encode("utf-8")


API_DISPATCH = {
    "find_a_tender": fetch_find_a_tender,
    "contracts_finder": fetch_contracts_finder,
    "cqc": fetch_cqc_providers,
}
