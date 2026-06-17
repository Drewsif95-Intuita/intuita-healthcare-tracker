# Worked Examples, Sources & Methodology Verification

This document accompanies `METHODOLOGY.md`. It (1) lists every source and where it comes
from, (2) walks through how two real trusts' scores are built number-by-number, and (3)
records an independent verification of the scoring pipeline.

---

## 1. Sources used — and where they come from

All data is public. "Scored" sources feed the target score; "evidence" sources are shown on
the pages but do not change the score; the rest are join keys, fallbacks, or context.

| Source | Provides | Status | Publisher / where from |
|---|---|---|---|
| NHS Oversight Framework (NOF) | acute-trust universe + ODS key, planned finance, productivity, **segment-4 distress** | **Scored** | NHS England — Oversight Framework segmentation publication |
| Acute Provider Table | A&E 4hr/12hr, cancer 62-day/FDS, diagnostics >6wk, RTT 52/18-wk + monthly trend | **Scored** | NHS England — Acute Provider Table (statistical work areas) |
| TAC finance (cleaned) | operating income (scale) + **actual** operating margin (health) | **Scored** | NHS England — Trust Accounts Consolidation (TAC) annual accounts |
| Capital allocations (cleaned, code-matched) | provider operational capital envelope 2026-30 (Digital/Capital trigger) | **Scored** | NHS England — Provider & ICB capital allocations |
| Digital Maturity Assessment (DMA) | digital-maturity gap | **Scored** | NHS England Digital — Digital Maturity Assessment results |
| Beds (KH03) | scale fallback where TAC income missing (3 trusts) | **Fallback** | NHS England — Bed Availability and Occupancy (KH03) |
| DQMI | per-trust data-quality index + weak datasets (Data Quality page) | Evidence | NHS England Digital — Data Quality Maturity Index |
| SHMI | mortality (Trust 360) | Evidence | NHS England Digital — Summary Hospital-level Mortality Indicator |
| FDP live list (cleaned, with benefits flag) | transformation trigger: 106 live, 79 realising benefits | Evidence | NHS England — Federated Data Platform uptake & benefits |
| ODS trusts (`nhs_trusts.csv`) | authoritative name→code register | Join key | NHS England Digital — Organisation Data Service (ODS) |
| ODS sites (`nhs-trust_sites.csv`) | site postcodes + parent trust (catchment foundation) | Catchment | NHS England Digital — Organisation Data Service (ODS) |
| ONS Postcode Directory (NSPL May 2025) | postcode → LSOA + grid reference | Catchment | ONS — Open Geography Portal (NSPL) |
| Census 2021 — TS007a / TS021 (LSOA) | catchment age and ethnicity | Catchment | ONS — Census 2021 bulk / Nomis (LSOA) |
| A&E, RTT, Cancer, Diagnostics (raw) | their headline numbers arrive via the Acute Provider Table | Represented | NHS England — respective monthly statistics |
| Financial Performance Q3 PDF | in-year provider position | Available, **not wired** | NHS England — Financial performance report 2025/26 Q3 (provider names need alias review) |
| CQC ratings + directory | regulatory rating | **Blocked** | Care Quality Commission — needs a CQC-provider→ODS bridge |
| IMD 2025 | deprivation decile | **Blocked** | GOV.UK / MHCLG — not yet supplied (would complete Geography deprivation) |
| Procurement (Find a Tender / Contracts Finder) | buyer openness — *considered, then excluded by design* | **Out of scope** | Cabinet Office / GOV.UK OCDS APIs |

---

## 2. Worked examples (real data)

Every feature is converted to a **percentile rank within the 134 acute peers** (0–100),
oriented so higher always means a stronger commercial signal. Pillars are the mean of their
features; target = `0.412·Pain + 0.353·Budget + 0.235·Digital`, minus an 8-point distress
penalty for NOF segment-4 trusts (who are also capped at Band C).

### Example A — University Hospitals of North Midlands (RJE) · Band A

**Operational pain** (each metric → oriented percentile within peers):

| Metric | Raw value | Orientation | Pain sub-score |
|---|---|---|---|
| A&E 4-hour performance | 0.682 | good (invert) | 89 |
| A&E 12-hour | 0.140 | bad | 82 |
| Cancer 62-day | 0.732 | good (invert) | 54 |
| Cancer FDS | 0.810 | good (invert) | 54 |
| Diagnostics >6 weeks | 0.218 | bad | 70 |
| RTT >52 weeks | 0.018 | bad | 81 |
| RTT within 18 weeks | 0.647 | good (invert) | 52 |
| **Pain pillar = mean** | | | **68.8** |

**Budget:** operating income £1,293m → scale percentile **84**; actual operating margin +1.64%
→ finance percentile **85**. Budget pillar = mean = **84.3**.

**Digital / capital:** DMA 2.37 → maturity-gap **54**; low productivity → gap **90**; capital
envelope £110m → trigger **72**. Digital pillar = mean = **71.8**.

**Target** = 0.412·68.8 + 0.353·84.3 + 0.235·71.8 = **75.0**. Not distressed (segment 3) → no
penalty → **Band A**. This is the top-ranked target: a large, financially healthy trust with
high operational pain and a real digital opportunity.

### Example B — Nottingham University Hospitals (RX1) · distressed, capped at Band C

| Metric | Raw value | Orientation | Pain sub-score |
|---|---|---|---|
| A&E 4-hour performance | 0.669 | good (invert) | 90 |
| A&E 12-hour | 0.147 | bad | 86 |
| Cancer 62-day | 0.650 | good (invert) | 86 |
| Cancer FDS | 0.658 | good (invert) | 95 |
| Diagnostics >6 weeks | 0.361 | bad | 90 |
| RTT >52 weeks | 0.019 | bad | 83 |
| RTT within 18 weeks | 0.635 | good (invert) | 62 |
| **Pain pillar = mean** | | | **84.6** |

**Budget:** income £1,885m → scale **96**; margin +1.14% → **83** → Budget **89.2**.
**Digital:** DMA 2.46 → gap 45; productivity gap 72; capital £205m → 94 → Digital **70.2**.

**Target (pre-penalty)** = 0.412·84.6 + 0.353·89.2 + 0.235·70.2 = **82.8**. Nottingham is in
**NOF segment 4** (intensive support), so it takes the −8 distress penalty → **74.8** and is
**capped at Band C**. By raw opportunity it would be a top target, but the model deliberately
holds it back and flags "qualify funding route first" — exactly the behaviour the distress
rule is designed for.

---

## 3. Methodology verification

I re-derived all 134 trusts' scores **independently** from the raw feature table (percentile
ranks, orientations, pillar means, weights, distress penalty, bands) and compared to the
shipped `sales_scorecard.csv`:

- **Reconciliation:** max absolute difference **0.10 points** (mean 0.034); budget and digital
  pillars matched **exactly**; the small residuals are rounding only. The pipeline computes
  what the methodology describes — no material discrepancy found.
- **Orientation checks (all pass):** the best A&E-4hr performer gets a UEC pain sub-score of 0;
  the worst RTT-52-week trust gets 100; the highest-margin trust gets a finance sub-score of 100.
- **Distress cap (verified):** Nottingham's 82.8 → 74.8 and Band C, with zero segment-4 trusts
  anywhere in Bands A or B.

### Observations from the re-parse (design choices, not errors)

These are correct as built but worth a reviewer's eye:

1. **Pain weights metrics, not domains.** The pain pillar averages 7 metrics equally, so UEC,
   cancer and RTT (2 metrics each) carry more weight than diagnostics (1 metric). If domains
   should be equal, average within domain first.
2. **Equal sub-weights inside Budget and Digital.** Budget = ½ scale + ½ margin; Digital = ⅓
   maturity-gap + ⅓ productivity-gap + ⅓ capital. These splits are assumptions, not calibrated.
3. **Capital and income both scale with trust size,** so large trusts are advantaged on Budget
   and Digital. That is defensible for *deal size*, but a per-capita or per-bed variant would
   measure *intensity* instead — a reasonable alternative to test.
4. **"Lower digital maturity = more opportunity"** is a modelling assumption; some buyers are
   the *more* mature trusts. Worth validating against win history.
5. **Bands are uncalibrated.** Percentile pillars centre the target near ~48, so the cut-offs
   (A≥72…) are arbitrary until backtested. **Trust the ranking, not the band letters, for now.**
6. **3 trusts use the beds fallback** for scale (no TAC income match); FDP-live is a trigger
   only, not a maturity measure (per source caveat).

**Bottom line:** the scoring is implemented correctly and transparently against the methodology;
the open question for review is not correctness but **calibration and the weighting choices** in
points 1–4, which should be settled against commercial win/loss history.
