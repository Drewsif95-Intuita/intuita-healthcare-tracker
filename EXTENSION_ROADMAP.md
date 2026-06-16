# Extension Roadmap — Where to Take This Next, and Why

The tool is a credible V0: it answers "which trusts are an interesting commercial
opportunity?" well. The extensions below move it toward answering "which trusts are
**actionable now**?" — the full sales question. Ordered by value-for-effort.

## Tier 1 — Turns the prototype into a usable sales engine

### 1. Buyer-openness pillar (the biggest commercial gap)
**What:** load procurement / route-to-market signals (Find a Tender, Contracts Finder, board
papers, framework presence, CRM contact strength) to populate the deferred fourth pillar.
**Why it matters:** today the tool finds trusts with a *problem* and the *budget*, but cannot
say which will actually go to market. Buyer openness is the difference between a good-fit
target and an actionable one. A `procurement_watchlist.csv` template is already in the bundle;
the loader hook is the only build step. This single addition takes the model from three live
pillars to the full four-pillar V1.

**Supplier spend (£25k transparency) as a complementary buyer signal.** Every NHS body
publishes monthly "spend over £25k" data (supplier, amount, expense type/area). Collected
across the acute trusts and classified by supplier category, it reveals who a trust already
buys from — existing analytics/BI/consultancy/managed-service relationships (route-to-market
warmth and competitor presence), IT/digital spend (a digital trigger), and agency/consultancy
spend (operational pressure + appetite to buy external help). It complements tender data
(which shows *future* intent) with *actual* purchasing behaviour. Caveats: published
per-organisation in inconsistent formats/encodings, so it needs an ingestion + supplier-name
normalisation + categorisation layer; the signal is the supplier *category mix*, not raw totals.

### 2. Band calibration against CRM win/loss history
**What:** backtest scores against real outcomes; tune band thresholds (and possibly weights)
to maximise precision in the top 20–30; consider rank-based bands.
**Why it matters:** because the pillars are percentile ranks, the target centres near ~48 and
the A/B/C/D cut-offs are currently uncalibrated — the *ranking* is trustworthy but the *letters*
are not. Calibration is what lets the bands safely become an official pursuit list rather than
a prompt for manual review.

### 3. Fold the evidence layer into the score (deliberately, post-calibration)
**What:** promote signals currently shown but not scored — CQC (regulatory pressure), Q3
in-year finance (current pressure, DSF), DQMI (data-quality need) — into the relevant pillars.
**Why it matters:** these are live and validated in the bundle but held out to keep V0 stable.
Once weights are calibrated, folding them in sharpens the score with information already on
screen — e.g. CQC "Requires improvement" as a board-urgency boost, Q3 deterioration as a
budget-risk signal.

## Tier 2 — Sharper, more defensible scoring

### 4. Split "Digital / capital" into *need* vs *trigger*
**What:** separate digital **need** (low DMA, poor interoperability, weak DQMI, workflow
friction) from transformation **trigger** (FDP live/benefits, capital envelope, EPR
procurement). Score a trust highly only when it has **both**.
**Why it matters:** low maturity alone is a weak "why now"; a trust with both an unmet need
*and* a funded reason to act is a far stronger prospect. The current pillar blends the two.

**EPR (Electronic Patient Record) status is the strongest single digital signal to add here.**
An EPR is the core clinical system that replaces paper records; whether a trust has a mature
EPR, an ageing one, none at all, or a live procurement is a major differentiator. It splits
cleanly across the need/trigger divide: *no EPR / ageing EPR* = high digital **need**; *live
EPR procurement or deployment* = transformation **trigger**. Sources, in order of accessibility:
NHS England's Frontline Digitisation / EPR programme status (published target lists and
statements); **Find a Tender / Contracts Finder** for live EPR procurements; the **spend over
£25k** data above for payments to EPR vendors (Epic, Oracle Health/Cerner, System C, Dedalus,
Altera) as a proxy for an active programme; and, if budget allows, a subscription database such
as **Digital Health Intelligence** or **KLAS/CDMI** for an authoritative per-trust EPR
supplier/version list. Note (per the FDP caveat) that EPR status is distinct from FDP-live and
from DMA — it deserves its own feature.

### 5. Domain-weight operational pain
**What:** average pain *within* domain (UEC, cancer, RTT, diagnostics) before combining, so
domains are weighted equally rather than by how many metrics each contributes.
**Why it matters:** today UEC, cancer and RTT (two metrics each) outweigh diagnostics (one).
Domain-weighting makes the pain pillar reflect clinical priorities rather than a quirk of
metric counts, and lets you tilt toward the domains Intuita actually sells into.

### 6. Budget depth: in-year finance, liquidity and capital intensity
**What:** add the wired Q3 variance/DSF into Budget, plus cash/liquidity proxies and
per-capita (not just absolute) capital.
**Why it matters:** TAC is annual and backward-looking; in-year data catches deterioration
early. Per-capita capital measures *intensity* alongside deal *size*, countering the current
large-trust bias (target correlates ~0.65 with operating income).

## Tier 3 — Coverage and reach

### 7. Re-engineer the dropped/blocked estates & flow sources
**What:** obtain better-formatted **ERIC** (estates backlog), **Discharge** (flow) and an
**NHP/RAAC** scheme→trust register. Each was set aside for a concrete data reason (no backlog
column / patchy trust data / policy-narrative PDF), not lack of value.
**Why it matters:** estates backlog is a direct capital-opportunity signal; discharge delay
underpins UEC/flow propositions; NHP/RAAC is a strong "why now" capital trigger.

### 8. True patient-flow catchment
**What:** replace the nearest-site geographic proxy with patient-origin data (SUS/HES by LSOA).
**Why it matters:** the current catchment is sound for relative scale and demographics but
understates specialist trusts (orthopaedic, neuro, eye) whose real catchment is referral-based
and national. Patient-flow data gives true market share and fixes those outliers.

### 9. Other provider types with peer-specific scoring
**What:** extend beyond acute to mental-health, community and ambulance trusts, each scored
*within its own peer group*.
**Why it matters:** widens the addressable market while preserving the core principle —
trusts are only ever compared on commercial dimensions against genuine peers, never on raw
performance across different provider types.

## Tier 4 — Productionisation

### 10. Refresh automation, freshness tracking and CRM integration
**What:** scheduled source refresh with per-source freshness/version stamps; push the shortlist
and Trust 360 into the CRM; capture outcomes back to feed calibration (closing the loop with #2).
**Why it matters:** turns a point-in-time prototype into a living tool, and the captured
outcomes are exactly what the calibration in Tier 1 needs to keep improving.

---

### Suggested sequence
**Now:** buyer-openness watchlist (#1) → it unlocks the missing pillar with data you can
assemble manually. **Next:** calibration (#2) once any CRM history exists. **Then:** the
scoring refinements (#4–#6), which are small, localised changes to `config.py`/`build.py`.
Coverage and productionisation (Tiers 3–4) follow as the tool earns its place in the workflow.
