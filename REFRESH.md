# REFRESH.md — per-source runbook

The operational companion to `AGENTS.md`. For each source: where to get it, the filename pattern
to drop into `data/`, the loader that reads it, how often it changes, and whether it arrives raw
or needs upstream cleaning. Files are matched by **glob pattern**, so exact names don't matter.

## Run sequence (same-shape refresh)

```bash
pip install -r nhs_targeting_transform/requirements.txt

# precompute only the steps whose sources changed:
python -m nhs_targeting_transform.cqc_extract --ods data/cqc_ratings.ods --out data
python -m nhs_targeting_transform.catchment   --nspl data/NSPL_*.zip --sites data/nhs-trust_sites.csv --census data --input data --out outputs

# always:
python -m nhs_targeting_transform.build --input data --out outputs
python validate.py
```

## Scored sources (drive the target — handle with care)

| Source | Pattern in `data/` | Loader | Cadence | Raw / cleaned | Where to get it |
|---|---|---|---|---|---|
| NHS Oversight Framework (acute) | `*oversight-framework-acute*.csv` | `load_nof` | ~Quarterly | Raw | england.nhs.uk/nhs-oversight-framework/segmentation-and-league-tables/ |
| Acute Provider Table (pain + trend) | `*acute-provider-timeseries*.csv` | `load_apt` | **Monthly** | Raw | england.nhs.uk/statistics/statistical-work-areas/acute-provider-table/ |
| TAC finance (income + margin) | `tac_key_financial_metrics_summary.csv` | `load_tac_finance` | **Annual** | **Pre-cleaned** ⚠ | england.nhs.uk/financial-accounting-and-reporting/nhs-providers-tac-data-publications/ |
| Capital allocations (trigger) | `capital_*matched_providers_only.csv` | `load_capital_alloc` | Multi-year | **Pre-cleaned** ⚠ | england.nhs.uk/publication/ (capital allocations) |
| Digital Maturity (DMA) | `*Digital*Maturity*Results*Data*File*.xlsx` | `load_dma` | Infrequent | Raw | digital.nhs.uk/data-and-information/digital-maturity-assessment-report-2024-and-2025-results/report |
| Beds (KH03, scale fallback) | `*Beds-Open-Overnight*.xlsx` | `load_beds` | Quarterly | Raw | england.nhs.uk/statistics/statistical-work-areas/bed-availability-and-occupancy/ |

## Evidence sources (shown, not scored)

| Source | Pattern in `data/` | Loader | Cadence | Raw / cleaned | Where to get it |
|---|---|---|---|---|---|
| DQMI (data quality) | `DQMI_*.csv` / `*DQMI*CSV*v*.csv` | `load_dqmi` | Quarterly | Raw | digital.nhs.uk/.../data-services/data-quality |
| SHMI (mortality) | `*trust_level_SHMI*.csv` | `load_shmi` | Quarterly | Raw | digital.nhs.uk/data-and-information/publications/statistical/shmi |
| CQC ratings | `cqc_ratings.ods` → `cqc_ratings_extracted.csv` | `cqc_extract.py` then `load_cqc` | Monthly-ish | In-repo extract | cqc.org.uk/about-us/transparency/using-cqc-data |
| FDP (live + benefits) | `fdp_live_organisations_extracted.csv` | `load_fdp_clean` | Periodic | **Pre-cleaned** ⚠ | england.nhs.uk/digitaltechnology/nhs-federated-data-platform/impact/fdp-uptake-and-benefits/ |
| Q3 in-year finance | `financial_performance_q3*positions.csv` | `load_q3_finance` | Quarterly | **Pre-cleaned** ⚠ | england.nhs.uk/publication/ (financial performance) |

## Catchment inputs (structural — refresh rarely)

| Source | Pattern in `data/` | Cadence | Where to get it |
|---|---|---|---|
| ODS trusts (join key) | `nhs_trusts.csv` | Rare | digital.nhs.uk/services/organisation-data-service (CSV downloads) |
| ODS trust sites | `nhs-trust_sites.csv` | Rare | digital.nhs.uk/services/organisation-data-service |
| ONS postcode directory | `NSPL_*.zip` | ~Quarterly | geoportal.statistics.gov.uk (NSPL) |
| Census 2021 — age | `census2021-ts007a-lsoa.csv` | 2021 (static) | ons.gov.uk census 2021 |
| Census 2021 — ethnicity | `census2021-ts021-lsoa.csv` | 2021 (static) | ons.gov.uk census 2021 |
| Index of Deprivation 2025 | `File_5_IoD2025_Scores*.xlsx` | Multi-year | gov.uk/government/statistics/english-indices-of-deprivation-2025 |

## ⚠ The pre-cleaned files

TAC, capital, Q3 and FDP arrive **already tidied** with a `matched_nhs_code` column, produced by a
cleaning step that is **not in this repo**. On refresh you must supply the equivalent cleaned file
(same columns) or reproduce that cleaning before the loader can read it. If `validate.py` shows
income or Q3 coverage collapsing, this is the usual cause.

## Deliberately out of scope / possible future additions

- **Buyer openness / live procurement intent** — *excluded by design.* There is no reliable,
  easily-refreshed trust-level source, and chasing it would make the model hard to re-run. Only
  revisit if procurement data (Find a Tender / Contracts Finder / supplier spend) becomes easy
  to source; see `docs/EXTENSION_ROADMAP.md`.
- **EPR status** — a strong potential digital signal, parked for now (no clean trust-level
  source found yet). Sources to revisit are in `docs/EXTENSION_ROADMAP.md`.

## Expected coverage (sanity check after a build)

`validate.py` enforces: pain/budget/digital present for ≥95% of trusts, operating income ≥90%
(hard); DMA ≥70%, CQC ≥85%, DQMI/SHMI ≥70%, Q3 ≥80%, FDP/capital ≥50% (soft); catchment total
≈56.5m. A big drop in any of these after a refresh means a renamed column or a missing file.
