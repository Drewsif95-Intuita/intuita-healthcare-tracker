# NHS Acute-Trust Sales-Targeting — Methodology

*Current as of this build. Supersedes earlier drafts (this version reflects the evidence
layer, FDP, and the catchment bridge).*

## 1. Purpose and framing

The tool produces a **commercial prioritisation index** over the 134 English acute NHS
trusts: a ranked view of which trusts are most worth approaching now. It is **not a
performance or quality rating**. A high target score means a combination of (a) a real
operational problem to solve, (b) the budget likelihood to fund a solution, and (c) a
digital/transformation reason to engage. Clinical quality is used only as context.

## 2. Universe and identity

- **Universe:** the 134 trusts classified as acute in the NHS Oversight Framework (NOF).
- **Join key:** the ODS trust code. The ODS trust register (`nhs_trusts.csv`) provides the
  authoritative name→code map; NOF provides the acute classification and is the spine.
- Non-acute and independent-sector providers present in some source files are filtered out
  by joining to the NOF acute list.

## 3. Scoring model (Model A)

Original Model A pillar weights:

| Pillar | Original weight |
|---|---|
| Operational pain | 0.35 |
| Budget likelihood | 0.30 |
| Digital / capital | 0.20 |
| Buyer openness | 0.15 |

Buyer-openness has **no data source** in this MVP (no procurement feed pulled), so the live
**V0 score** drops it and **re-normalises** the remaining three weights to sum to 1.0. The
four-pillar version is the **target V1** model (activated once a procurement/CRM watchlist is
loaded). Both are shown explicitly in the app:

| Pillar | Re-normalised weight |
|---|---|
| Operational pain | 0.412 |
| Budget likelihood | 0.353 |
| Digital / capital | 0.235 |

### 3.1 Feature scoring

Every feature is converted to a **percentile rank within the 134 acute peers** (0–100),
oriented so that **higher always means a stronger commercial signal**:

- worse operational performance → higher pain score
- bigger scale / healthier finances → higher budget score
- lower digital maturity / productivity → higher digital-opportunity score

Percentile-within-peers makes metrics with completely different units (percentages, bed
counts, £, maturity 1–5) directly comparable, and is robust to outliers.

### 3.2 Features per pillar

**Operational pain** (from the Acute Provider Table, latest month; trend from the monthly
series): A&E 4-hour performance, A&E 12-hour, cancer 62-day combined, cancer Faster
Diagnostic Standard, diagnostics proportion waiting >6 weeks, RTT % waiting >52 weeks, RTT
% within 18 weeks. Orientation per metric is defined in `config.py` (`PAIN_FEATURES`).

**Budget likelihood:** scale = TAC operating income (patient care + other operating income,
2024/25; beds (KH03) as a fallback for the 3 trusts unmatched in TAC); financial health =
TAC **actual** operating margin (operating surplus/deficit as % of income). This replaces the
earlier beds-proxy and NOF *planned* figure with the proper measures.

**Digital / capital:** digital-maturity gap = inverted DMA overall score (lower maturity =
more opportunity); productivity gap = inverted NOF implied productivity (OF0085); capital trigger
= provider operational capital envelope 2026-30 (all 134 trusts) — bigger envelope = stronger
transformation trigger.

### 3.3 Pillar and target

Pillar score = mean of its feature scores (0–100). Target = `0.412·Pain + 0.353·Budget +
0.235·Digital`, on a 0–100 scale.

### 3.4 Distress adjustment

Trusts in **NOF adjusted segment 4** (intensive support / mandated intervention — the most
distressed oversight tier) receive a fixed distress **penalty** and are **capped at Band C**.
This stops a high-pain, financially distressed trust from surfacing as a top target without
the funding caveat. They are surfaced as "qualify funding route" rather than "call now".
(The Recovery Support Programme flag, OF5007, was empty in the supplied extract, so segment 4
is used as the distress signal.)

### 3.5 Bands

`A >= 72`, `B >= 62`, `C >= 52`, `D < 52`. **These thresholds are uncalibrated.** Because the
pillars are percentile ranks, the target distribution centres around ~48, so the top band is
deliberately tight. For the MVP the **ranking** is the dependable output; band cut-offs (and
ideally the weights) should be calibrated against commercial win/loss history.

## 4. Trend

For each trust, a composite "badness" index (mean of oriented pain features) is computed per
month over the recent window; the slope classifies the trust as Worsening / Improving /
Volatile / Flat. This is a direction heuristic, not a forecast.

## 5. Confidence / data completeness (separate from the score)

Confidence is **not** part of the target score — it reflects data completeness only, so weak
data can never inflate a ranking. It is the share of the **active scored sources** present per
trust — operational pain (>=6/7 metrics), TAC operating income, TAC operating margin, capital
allocation, DMA and NOF segment — so it now tracks the sources that actually drive the score
(High >= 0.9, Medium >= 0.6, Low otherwise) and lists what is missing.

## 5a. Opportunity vs pursuit (ranking)

The scorecard separates two numbers so distressed trusts never confuse the sales list:
`raw_opportunity_score` (the weighted pillars before any funding adjustment) and `target` (the
funding-adjusted score, after the segment-4 distress penalty). `pursuit_rank` orders trusts for
sales: all non-distressed trusts first (by score), then segment-4 "qualify funding" trusts as a
block below them — so a high-pain distressed trust cannot sit near the top of the pursuit list.

## 5b. Derived sales outputs (play, trigger, next action)

Beyond the score, the build derives the "so what do I do" layer for each trust:

- **`top_pain`** — the single worst-ranked operational-pain feature for the trust (the headline
  problem to lead a conversation with).
- **`sales_play`** — mapped from the *domain* of that worst feature:

  | Worst-pain domain | Sales play |
  |---|---|
  | UEC (A&E 4hr/12hr) | UEC / A&E flow |
  | RTT (52/18-week) | Elective recovery / RTT |
  | Cancer (62-day / FDS) | Cancer / diagnostics pathway |
  | Diagnostics (>6-week) | Cancer / diagnostics pathway |
  | *(none / other)* | Operational improvement |

- **`trigger`** (the "why now") — `Segment 4 (intensive support) — qualify funding route` if
  distressed; otherwise `"{top_pain} worsening"` if the trend is Worsening, else
  `"{top_pain} under pressure"`.
- **`next_action`** — mapped from band and distress: distressed → **Qualify funding**; otherwise
  A → **Call**, B → **Enrich**, C → **Monitor**, D → **No action**.

### Illustrative sales-enablement fields
Trust 360 also shows a sales-enablement block (recommended first conversation, likely buyer
persona, relevant service offer, route to market, known contacts, last touched). The
conversation / persona / offer are **heuristics mapped from the sales play**; route to market,
CRM contacts and "last touched" are **placeholders pending the procurement/CRM integration**
(the buyer-openness pillar) and are labelled "not loaded" in the app. They are presentation
scaffolding, not scored inputs or sourced data.

## 6. Evidence layer (shown, not scored)

The following are wired into the prototype as **evidence on the relevant pages but are not
inputs to the target score** — a deliberate choice to keep rankings stable and auditable
until calibration. Each can be folded into a pillar with a one-line change in `config.py`.

- **DQMI** (data-quality index) -> Data Quality page, per-trust scores + weak datasets.
- **SHMI** (mortality) -> Trust 360 regulatory card.
- **FDP** (live on the Federated Data Platform; 106 live, 79 realising benefits) -> Digital page
  transformation trigger ("Live · benefits") and the "Digital programme" funding route. Per the
  source caveat, FDP-live is treated as a transformation *trigger only*, not a maturity/EPR measure.
- **CQC** (Overall + Well-led, 133/134) -> Trust 360 + Data Quality. Extracted from the 1 GB CQC ratings ODS via a streaming parser (`cqc_extract.py`); the file carries the Provider ODS code, so the join is exact, not fuzzy.
- **In-year finance (Q3 2025/26)** -> Trust 360: YTD variance % of turnover, forecast-deficit and DSF flags (132/134 trusts). TAC is annual/backward-looking; this adds current pressure. Evidence only for now; a candidate to fold into Budget at calibration.
- **Catchment** (see section 7) -> Geography page population/age/ethnicity context.

## 7. Catchment bridge (modelled, nearest-site-v1)

A trust->population mapping built from public geography:

1. The ONS Postcode Directory (NSPL) gives every live English postcode a 2021 LSOA and grid
   reference. LSOA centroid = mean grid reference of its postcodes (33,755 LSOAs).
2. Each acute trust's sites (ODS sites file) are geocoded by postcode.
3. Every LSOA is assigned to the trust owning the **nearest site** (Voronoi/nearest-neighbour
   over OS coordinates).
4. Census 2021 age (TS007a) and ethnicity (TS021) are summed over each trust's LSOAs ->
   catchment population, 65+ share, minority-ethnic share.

**Validation:** total assigned population = 56,490,091, reconciling to England's 2021 Census
population — confirming every LSOA is assigned exactly once.

**Limitations:** geographic proxy, not patient flow; specialist trusts (orthopaedic, neuro,
eye) are understated because their real catchment is referral-based and national. Deprivation
(IMD) is not included — it needs the separate IMD 2025 file.

## 8. Data sources summary

**Scored** (drive the target): NOF (universe, planned finance, productivity, segment-4 distress),
Acute Provider Table (operational pain + trend), TAC finance (operating income + actual margin),
Capital allocations (capital trigger), DMA (digital maturity). Beds (KH03) is the scale fallback.

**Evidence** (shown, not scored): DQMI, SHMI, CQC (Overall + Well-led), FDP (live + benefits),
Q3 in-year finance (variance / forecast deficit / DSF), and the modelled catchment (NSPL + ODS
sites + Census 2021 + IMD 2025).

**Join key:** ODS trusts (`nhs_trusts.csv`, name → 3-letter code).

**Reviewed but not used:** Discharge (trust-level data too patchy), ERIC (no backlog column in the
extract), NHP/RAAC (the PDF is a policy-narrative paper, not a scheme→trust register), Staff
survey / WLMDS (low marginal value). **Still open:** buyer-openness needs a procurement/CRM source.

The exact files, loaders, columns and field mappings are in **Appendix A**.

## 9. Outputs

`sales_scorecard.csv` (gold), `feature_table.csv` (audit), `catchment_bridge.csv` and
`catchment_summary.csv` (incl. IMD decile), `cqc_ratings_extracted.csv`,
`fdp_live_organisations_extracted.csv`, the `nhs_targeting_transform` pipeline, the
`nhs_targeting_ingest` package, and the interactive prototype.

## 10. Calibration plan (the key open item)

Before the bands drive real sales effort: backtest against CRM win/loss outcomes; tune band
cut-offs and, if warranted, pillar weights to maximise precision@top-20–30; then optionally
fold the evidence-layer signals (DQMI/SHMI/FDP) and TAC operating income into the scored
pillars, and add a procurement feed to populate the buyer-openness pillar.

---

## Appendix A — Inputs: files, loaders and field mappings

This appendix is the reproducibility contract: it tells another tool exactly which file each
step expects, how it is found, which columns/codes are read, and what it feeds. Loaders locate
files by **glob pattern** inside a single input directory, and return an empty frame if a file
is absent (graceful degradation), so exact filenames don't matter — only that the pattern
matches. All joins are on the **3-letter ODS trust code**.

### A.1 Directory layout

```
<input_dir>/        # all source extracts live here (any filenames matching the patterns below)
<out_dir>/          # pipeline writes sales_scorecard.csv + feature_table.csv here
```

The catchment and CQC steps are **one-off precomputes**: they read large raw files (NSPL,
Census, IMD, the CQC ODS) and write small CSVs (`catchment_*`, `cqc_ratings_extracted.csv`)
back into `<input_dir>`, which the main `build` step then consumes like any other source.

### A.2 Run order

```bash
pip install pandas openpyxl scipy odfpy

# one-off precomputes (write CSVs into <input_dir>)
python -m nhs_targeting_transform.cqc_extract --ods cqc_ratings.ods --out <input_dir>
python -m nhs_targeting_transform.catchment  --nspl NSPL_*.zip --sites nhs-trust_sites.csv \
        --census <input_dir> --input <input_dir> --out <input_dir>

# main scoring build (reads everything, writes the gold scorecard)
python -m nhs_targeting_transform.build --input <input_dir> --out <out_dir>
```

### A.3 Scored sources

| Source | Expected file (glob) | Loader (`nhs_targeting_transform…`) | Key columns / codes | Feeds |
|---|---|---|---|---|
| NHS Oversight Framework (acute) | `*oversight-framework-acute*.csv` | `loaders.load_nof` | metric codes **OF0079** planned surplus/deficit %, **OF0085** implied productivity, **OF5000** adjusted segment (4 = distressed), **OF5007** RSP flag (empty in extract) | universe + budget(planned) + digital(productivity) + distress |
| Acute Provider Table | `*acute-provider-timeseries*.csv` | `loaders.load_apt` | the 7 pain metrics (see A.6), monthly time series | pain pillar + trend |
| Beds (KH03) | `*Beds-Open-Overnight*.xlsx` | `loaders.load_beds` | total available beds | **scale fallback** only |
| Digital Maturity (DMA) | `*Digital*Maturity*Results*Data*File*.xlsx` | `loaders.load_dma` (needs name→code map) | mean of maturity columns → `dma_overall` | digital pillar |
| TAC finance (cleaned) | `tac_key_financial_metrics_summary.csv` | `loaders.load_tac_finance` | `nhs_code`, `patient_care_income_cy_k`, `other_operating_income_cy_k`, `operating_surplus_deficit_cy_k` | budget pillar (income = scale, margin = health) |
| Capital allocations (cleaned) | `capital_provider_operational_allocations_matched_providers_only.csv` | `loaders.load_capital_alloc` | `matched_nhs_code`, `allocation_total_2026_30_k` | digital pillar (capital trigger) |

### A.4 Evidence sources (shown, not scored)

| Source | Expected file (glob) | Loader | Key columns | Feeds |
|---|---|---|---|---|
| DQMI | `DQMI_*.csv` or `*DQMI*CSV*v*.csv` | `loaders.load_dqmi` | `DQMI`, `Dataset` (weak if <60) | Data Quality page |
| SHMI | `*trust_level_SHMI*.csv` or `*SHMI_data_at_trust_level*.csv` | `loaders.load_shmi` | `SHMI_VALUE`, `SHMI_BANDING` | Trust 360 |
| CQC (extracted) | `cqc_ratings_extracted.csv` ← produced by `cqc_extract.py` from `cqc_ratings.ods` | `loaders.load_cqc` | `trust_code`, `cqc_overall`, `cqc_well_led` | Trust 360 + Data Quality |
| FDP (cleaned) | `fdp_live_organisations_extracted.csv` | `loaders.load_fdp_clean` | `matched_nhs_code`, `fdp_live`, `fdp_reporting_benefits` | Digital page |
| Q3 in-year finance (cleaned) | `financial_performance_q3*positions.csv` | `loaders.load_q3_finance` | `matched_nhs_code`, `var_pct_of_turnover_num`, `forecast_outturn_exc_dsf_m_num`, `forecasting_receipt_of_dsf` | Finance + Trust 360 |

### A.5 Join key & catchment inputs

| Source | Expected file | Loader / step | Key columns | Feeds |
|---|---|---|---|---|
| ODS trusts | `nhs_trusts.csv` | `loaders.load_ods_name_map` | trust name → 3-letter ODS code | the join key for all name-keyed sources |
| ODS sites | `nhs-trust_sites.csv` | `catchment.build_catchment` | col 9 = site postcode, col 14 = parent trust code | site geocoding |
| ONS Postcode Directory | `NSPL_*.zip` (inner `NSPL_*_UK.csv`) | `catchment._stream_nspl` | `pcds`, `lsoa21`, `oseast1m`, `osnrth1m`, `ctry`, `doterm` | LSOA centroids → nearest-site catchment |
| Census 2021 — age | `census2021-ts007a-lsoa.csv` | `catchment.build_catchment` | `geography code`, `Age: Total`, 65+ age bands | catchment population, 65+ share |
| Census 2021 — ethnicity | `census2021-ts021-lsoa.csv` | `catchment.build_catchment` | `geography code`, ethnic-group total + White | catchment minority-ethnic % |
| IMD 2025 | `File_5_IoD2025_Scores*.xlsx` (sheet `IoD2025 Scores`) | catchment IMD step | `LSOA code (2021)`, `Index of Multiple Deprivation (IMD) Score` | population-weighted deprivation decile |

### A.6 Operational-pain metrics (from the Acute Provider Table)

Each is percentile-ranked within peers and oriented so higher = more pain:

| Metric (column) | Orientation | Domain |
|---|---|---|
| A&E 4 hour performance | good (inverted) | UEC |
| A&E 12 hour performance | bad | UEC |
| Cancer 62 Day Combined Performance | good (inverted) | Cancer |
| Cancer Faster Diagnostic Standard | good (inverted) | Cancer |
| Diagnostics proportion waiting over 6 weeks | bad | Diagnostics |
| Percentage waiting more than 52 weeks for elective treatment | bad | RTT |
| Percentage waiting within 18 weeks for elective treatment | good (inverted) | RTT |

### A.7 Output columns (`sales_scorecard.csv`)

`code`, `name`, `region`, `icb`, pillar scores `pain` / `budget` / `digital`,
`raw_opportunity_score`, `target`, `band`, `pursuit_rank`, `distress`, `segment`, `trend`,
`top_pain`, `sales_play`, `trigger`, `next_action`, `confidence` (+ reason), finance
`op_income_k` / `op_margin_pct` / `capital_k`, evidence `dqmi` / `shmi` / `cqc_overall` /
`cqc_well_led` / `cqc_below_good` / `fdp_live` / `fdp_benefits` / `q3_var_pct` /
`q3_forecast_deficit` / `q3_dsf`. `feature_table.csv` holds the raw inputs behind every score.
