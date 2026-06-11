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

Scored: NOF, Acute Provider Table, TAC finance (operating income + actual margin), Capital
allocations, DMA. Beds (KH03) is a scale fallback. Evidence: DQMI, SHMI, FDP (with benefits),
catchment (NSPL + ODS sites + Census 2021). Join key: ODS trusts. Represented via the Acute
Provider Table: raw A&E, RTT, Cancer, Diagnostics. Available but not wired: Financial
Performance Q3 PDF (provider names need alias review). Dropped (with reasons): Discharge
(region/ICB grain), ERIC (no clean backlog column), Staff survey / WLMDS (low marginal value).
Blocked: CQC (needs provider->ODS bridge), IMD 2025 (not supplied). Buyer-openness still needs
a procurement/CRM source.

## 9. Outputs

`sales_scorecard.csv` (gold), `feature_table.csv` (audit), `catchment_bridge.csv` and
`catchment_summary.csv`, `fdp_live_trusts.csv`, the `nhs_targeting_transform` pipeline, the
`nhs_targeting_ingest` package, and the interactive prototype.

## 10. Calibration plan (the key open item)

Before the bands drive real sales effort: backtest against CRM win/loss outcomes; tune band
cut-offs and, if warranted, pillar weights to maximise precision@top-20–30; then optionally
fold the evidence-layer signals (DQMI/SHMI/FDP) and TAC operating income into the scored
pillars, and add a procurement feed to populate the buyer-openness pillar.
