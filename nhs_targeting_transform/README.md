# NHS Sales-Targeting — Transform & Scoring (silver → gold)

Turns the manually-pulled public extracts into the gold **`sales_scorecard`** the
prototype consumes: a per-acute-trust target score, three pillar sub-scores, band,
distress flag, pain trend, top-pain driver, sales play, next action and a confidence
rating — all reproducible from the source files.

It scored **134 acute trusts** in testing against the real extracts.

## What it uses (and why these four)

| Pillar | Source(s) | Feature(s) |
|---|---|---|
| **Operational pain (41.2%)** | Acute Provider Table (monthly) | A&E 4hr/12hr, Cancer 62-day/FDS, Diagnostics >6wk, RTT 52-wk/18-wk — percentile-ranked within acute peers |
| **Budget likelihood (35.3%)** | Beds (KH03) + NOF | scale = total available beds; financial health = NOF planned surplus/deficit (OF0079) |
| **Digital / capital (23.5%)** | DMA + NOF | digital-maturity gap (lower DMA = more opportunity) + implied-productivity gap (OF0085) |
| Distress flag | NOF | adjusted segment (OF5000) = 4 → held out of Band A, penalty applied, "qualify funding" |
| Trust universe + join key | NOF acute | 134 acute trusts, ODS Trust_code |

Pillar scores are percentile ranks within the acute peer group, oriented so higher
always means a stronger commercial signal. The target is the re-normalised weighted
sum of the three populated pillars (buyer-openness is deferred — see below).

## Run it

```bash
pip install pandas openpyxl
# point --input at a folder containing the extracted source files (flat is fine)
python -m nhs_targeting_transform.build --input ./data/bronze --out ./gold
```

Outputs `gold/sales_scorecard.csv` (the deliverable) and `gold/feature_table.csv`
(the raw inputs behind every score, for auditing). The loaders locate each file by
glob pattern (see `config.py`), so exact filenames don't matter as long as the files
are present.

## MVP simplifications (deliberate, documented)

These are the honest shortcuts taken to get a working engine on the data in hand:

1. **Buyer openness (15%) is deferred** — no procurement source was pulled, so the
   three populated pillars are re-normalised to sum to 1.0 (Pain 0.412 / Budget 0.353
   / Digital 0.235). Buyer-openness shows as deferred and is reflected in confidence.
2. **Scale = beds, not operating income.** TAC carries income but joins on trust *name*
   and needs the SubCode definitions to pick the right lines; beds (KH03) is a clean
   size proxy for v1. Swapping in TAC operating income is the obvious refinement.
3. **Financial health = NOF planned surplus/deficit** (a plan figure). In-year actuals
   are a later add.
4. **Digital = maturity + productivity gap.** EPR status, FDP and NHP remain curated /
   out of scope here (no clean national feed), as the register notes.
5. **Distress = NOF segment 4.** The Recovery Support Programme flag (OF5007) was empty
   in this extract; segment 4 is the official most-distressed tier (36 trusts here).
6. **Pain trend** is a per-trust slope over the recent Acute-Provider-Table window — a
   v1 heuristic for direction, not a forecast.
7. **Bands need calibrating.** Because pillars are percentiles, the target centres
   around ~48, so fixed cutoffs (A≥72…) give a tight top band. For the MVP the
   **ranking** is the reliable output; calibrate band cutoffs (and ideally the weights)
   against commercial history — precision@top-20–30 — before they drive real effort.

## Files

- `config.py` — file patterns, weights, the pain-feature definitions + orientation, distress metrics.
- `loaders.py` — per-source readers (NOF spine, APT, beds, DMA) with name→code matching.
- `scoring.py` — percentile scoring, pillars, bands, distress cap, trend, confidence.
- `build.py` — orchestration + CLI; writes the scorecard and feature table.

## Next steps

- Wire `sales_scorecard.csv` into the prototype in place of the synthetic data.
- Add procurement (keyless OCDS) to populate buyer-openness.
- Swap beds → TAC operating income; add in-year finance; add the LSOA→trust catchment
  bridge to lift Geography from region to catchment level.
- Calibrate bands/weights against CRM outcomes.
