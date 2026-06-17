# Response to external review (V0.2)

> **Later note:** buyer openness has since been **removed from scope** — the model is now three
> pillars (pain / budget / digital). Mentions of a fourth pillar, a procurement watchlist or a
> "V1" below are retained only as a record of the review response at the time.

Point-by-point status against the review. "Done" = changed in this build; "Scaffolded" =
mechanism in place, needs your data; "Needs file/decision" = blocked on input.

## Must-fix items
| # | Reviewer item | Status | Notes |
|---|---|---|---|
| 1 | Label score as V0 excluding buyer openness | **Done** | Methodology page now shows CURRENT V0 (0.41 Pain / 0.35 Budget / 0.24 Digital) and TARGET V1 (4-pillar) explicitly; Trust 360 caption updated. |
| 2 | Relabel Procurement page as not loaded / planned | **Done** | Page retitled "Procurement & Sales Intent — Planned", kicker "NOT LOADED", amber banner stating buyer openness is not in the score. |
| 3 | Add procurement / buyer-openness watchlist | **Scaffolded** | `procurement_watchlist_TEMPLATE.csv` added; drop in real notices/CRM to activate the pillar. |
| 4 | Add raw_opportunity_score + pursuit rank so segment-4 trusts do not confuse ranking | **Done** | Scorecard now has `raw_opportunity_score`, `target` (funding-adjusted) and `pursuit_rank` (distressed grouped below all non-distressed; first distressed now at rank 99). |
| 5 | Rebuild confidence to reflect active scored sources (TAC, capital) | **Done** | Confidence now = completeness over pain, TAC income, TAC margin, capital, DMA, segment (117 High / 17 Medium). |
| 6 | Wire in Q3 financial performance | **Done (evidence)** | The cleaned file already carries a `matched_nhs_code` column (132/134). Wired as in-year evidence: YTD variance % of turnover, forecast-deficit flag and DSF flag, shown on Trust 360. Not yet folded into the Budget score (kept stable pre-calibration). |
| 7 | Add CQC bridge + rating fields | **Done (evidence)** | Streamed the 1 GB CQC ratings ODS (odfpy OOMs on it) and extracted trust-level Overall + Well-led for 133/134 — and the file carries the Provider ODS code, so no fuzzy bridge needed. Shown on Trust 360 and Data Quality. 97 Good / 31 Requires improvement / 5 Outstanding. |
| 8 | Add IMD 2025 to geography | **Done** | IMD 2025 (File 5 scores) ranked to national deciles and population-weighted across each catchment; Geography deprivation column + scatter now live (decile range 2.3-7.7). |
| 9 | Fix README/source-table inconsistencies | **Done** | Capital removed from the "Dropped" row (it is scored); FDP file reference updated. |
| 10 | Remove stale "synthetic data" wording | **Done** | Removed from the React file (0 occurrences); Geography note rewritten. |

## Packaging
- **Done** `METHODOLOGY.md` now exists (the README link resolved to a missing file before).
- **Done** Richer `fdp_live_organisations_extracted.csv` (with `fdp_reporting_benefits`, `match_confidence`) added; bundle no longer relies only on the thin FDP CSV.

## V1 "should-fix" (not yet done — flagged for the next iteration)
Pain domain-weighting; split Digital into "need" vs "trigger"; fold DQMI into score as a
data-quality need; revisit ERIC/Discharge; NHP/RAAC manual bridge; in-year finance (Q3, DSF,
cash); rank-based band calibration against CRM history. These are model-shaping decisions best
made with you rather than unilaterally.


## Re-examined this round (leaving procurement aside)
| Source | Outcome | Reason |
|---|---|---|
| Q3 in-year finance | **Wired (evidence)** | clean join via `matched_nhs_code` (132/134) |
| Discharge Ready Date | **Deferred** | trust-level data too patchy (median 0% delayed not credible) |
| NHP / RAAC | **Deferred** | the supplied PDF is the policy *narrative* paper, not a scheme→trust register |
| ERIC estates | **Deferred** | cleaned trust extract has no backlog/risk column, only spend |
| CQC ratings | **Done** | streamed via `cqc_extract.py` (iterparse over the 1 GB content.xml); 133/134, keyed by Provider ODS code |
| IMD 2025 | **Done** | supplied (File 5); population-weighted catchment deprivation decile now on Geography |
