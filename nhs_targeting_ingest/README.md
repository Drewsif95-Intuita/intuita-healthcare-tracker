# NHS Sales-Targeting — Bronze Ingestion

Python package that pulls the public datasets in `02_Data_Sources_Register.md` into an
immutable **bronze** layer, with full provenance, ready for silver/gold transformation
and the Power BI scoring model.

It implements the register's source-handling rules: landing pages are canonical and the
latest file is discovered at run time (rule 1); every raw download is stored unchanged
with an extract timestamp and SHA-256 hash (rule 2); and curated/manual sources are
clearly flagged (rules 4 & 6). ODS conforming, silver typing and the gold scorecard are
the *next* layer and out of scope for this package.

## Install

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r nhs_targeting_ingest/requirements.txt   # requests, beautifulsoup4
```

## Usage

```bash
# see the registry (26 sources, 15 in the v1 spine)
python -m nhs_targeting_ingest.cli list

# FIRST RUN: resolve the latest file URL for each source WITHOUT downloading.
# Use this to confirm link discovery is picking the right file, and to tune
# file_exts / link_keywords in sources.py where a site's markup differs.
python -m nhs_targeting_ingest.cli fetch --v1 --probe --out ./data

# pull the v1 spine for real
python -m nhs_targeting_ingest.cli fetch --v1 --out ./data

# pull individual sources
python -m nhs_targeting_ingest.cli fetch --source ae rtt diagnostics --out ./data

# everything (including post-v1 enrichment sources)
python -m nhs_targeting_ingest.cli fetch --all --out ./data
```

`--dry-run` plans the run with no network at all; `--probe` resolves URLs (and so does
hit the landing pages) but downloads nothing.

## Output layout (bronze)

```
data/bronze/
  <source_key>/<YYYY-MM-DD>/<original_filename>     # raw, unchanged
  <source_key>/<YYYY-MM-DD>/_manifest.json          # provenance for that download
  _ingest_log.jsonl                                 # append-only log of every attempt
  _state.json                                       # last sha256 per source (idempotency)
```

Each manifest records: resolved URL, landing page, retrieved-at (UTC), HTTP status,
filename, size, SHA-256, ease rating, cadence, pillar, v1 flag and status
(`downloaded` / `unchanged` / `skipped` / `manual` / `failed`). Re-running skips files
whose hash is unchanged, so it's safe to schedule.

## Collection methods

| Method | Sources | Behaviour |
|---|---|---|
| `html_discover` | most NHS/ONS/GOV.UK datasets **and CQC** | GET the landing page, find the newest matching file link, download it — no auth |
| `ocds_api` | Find a Tender, Contracts Finder | recent OCDS notices over a look-back window (`--api-days`) — **open APIs, no key required** |
| `cqc_api` | CQC (optional upgrade only) | daily provider list via the CQC API — needs `CQC_API_KEY`; off by default |
| `manual_bridge` | NHP/RAAC, DSPT | no clean trust-code feed: snapshots the page for evidence and flags that a curated bridge must be maintained by hand |

**The v1 spine runs with no API keys at all.** CQC defaults to the monthly "care directory
with ratings" file download; Find a Tender and Contracts Finder use open OCDS APIs that
require no key (confirm against their docs). The CQC API key is only needed if you switch
the `cqc` entry back to `method='cqc_api'` for daily freshness.

## Configuration / environment variables

All optional — the v1 spine needs none of these:

```bash
export CQC_API_KEY="..."                 # ONLY if you switch cqc to method='cqc_api' for daily freshness
export FTS_API_BASE="..."                # optional: override Find a Tender OCDS endpoint
export CONTRACTS_FINDER_API_BASE="..."   # optional: override Contracts Finder endpoint
```

## Curated bridges (maintain by hand)

Two starter templates live in `bridges/` (register rule 4):

- `buyer_alias_template.csv` — maps procurement buyer names to ODS codes with a
  match-confidence (`Exact` / `High` / `Fuzzy`). The pipeline does **not** auto-match
  buyers to trusts; that belongs in a silver step using this table.
- `nhp_scheme_bridge_template.csv` — maps New Hospital Programme / RAAC schemes to ODS
  codes with an evidence URL and `as_at` date.

## First-run notes (please confirm in your environment)

This package was written to the register's spec but the actual NHS/gov.uk pulls could
not be executed where it was built (network allowlist). On first run:

1. Run `--probe` for the `html_discover` sources and check the resolved URLs are the
   files you expect; adjust `link_keywords` / `file_exts` in `sources.py` if a page's
   markup differs. The discovery heuristic prefers the most recent-looking link.
2. Confirm the **OCDS endpoint paths** for Find a Tender and Contracts Finder against
   their developer docs (linked in `sources.py`) — set the `*_API_BASE` env vars if they
   differ from the documented defaults.
3. **CQC is keyless by default** (monthly care-directory file). Only set `CQC_API_KEY`
   and switch the `cqc` entry to `method='cqc_api'` if you want daily freshness instead
   of monthly.
4. Watch the **April-2026 A&E acute-footprint change** and the **RTT revisions** — both
   are why we keep dated raw snapshots and a publication/revision flag.
5. Respect each site's robots/terms and the built-in polite delay; the APIs are the
   right tool for procurement rather than scraping.

## Suggested pull order

Start with the A/B-ease v1 spine (no auth, landing-page downloads):

```
ods → nof → acute_provider_table → ae → rtt → cancer → diagnostics → dqmi → tac → eric → dma
```

Then the machinery-heavy ones: `cqc` (auth), `find_a_tender` + `contracts_finder`
(buyer aliasing), and the `nhp` curated bridge.

## Next layer (not in this package)

- **Silver:** conform to ODS code (predecessor/successor handling), type/clean, attach
  `as_at` / `publication_date` / `period_type`, compute per-source freshness.
- **Gold:** the `sales_scorecard` fact the Power BI model imports — target score, four
  component scores, band, top drivers, why-now, sales play, trend, plus the separate
  confidence rating. The prototype defines that output contract.
