# NHS Acute-Trust Sales-Targeting Tool

A commercial prioritisation tool that ranks England's **134 acute NHS trusts** by how
attractive they are to approach now — combining where each trust has the most **operational
pain**, the **budget likelihood** to fund a solution, and **digital / transformation**
signals — so a sales team can focus effort where money, urgency and change overlap.

> **This is a commercial prioritisation index, _not_ an NHS performance or quality rating.**
> A high score means a strong commercial opportunity (a clear problem + a credible route to
> fund it), not that a hospital is "good" or "bad". Trusts in formal distress are deliberately
> held back from the top band and flagged "qualify funding first".

![Target Overview](screenshots/01_target_overview.png)

---

## Contents

| Section | |
|---|---|
| [What it is](#what-it-is) | the product in one screen |
| [The interactive prototype](#the-interactive-prototype) | how to view / run the app |
| [Methodology](#methodology-summary) | how the score is built |
| [Data sources](#data-sources) | what's used and where it comes from |
| [Repository structure](#repository-structure) | what's in this repo |
| [Reproducing the outputs](#reproducing-the-outputs) | the pipeline commands |
| [Documentation](#documentation) | the full doc set |
| [Known limitations](#known-limitations) | read before relying on it |
| [Data & licensing](#data--licensing) | attribution |

---

## What it is

A ten-plus-page interactive prototype backed by a reproducible Python pipeline that turns
public NHS and ONS data into a scored, rankable target list. Every trust gets a target score,
a commercial band (A–D), three pillar scores, a distress-adjusted pursuit rank, a confidence
level, and a rich Trust 360 profile (finance, operational pain, digital/capital, regulatory,
catchment). Key metrics carry hover **info-tooltips** explaining why each matters commercially,
and a **Glossary** page documents every term.

**At a glance:** 134 acute trusts · 3 scoring pillars — pain, budget, digital
· evidence layer of CQC, SHMI, DQMI, FDP and a modelled population catchment · all from public
sources.

## The interactive prototype

`src/components/NhsTargetingPrototype.jsx` is a **single-file React component**. The processed
data is inlined in the file, so it runs with no backend.

- **Stack:** React + Vite, [`recharts`](https://recharts.org) for charts, and
  [`lucide-react`](https://lucide.dev) for icons.
- **Local app:** this repo already contains the Vite wrapper used for GitHub Pages.

```bash
npm install
npm run dev
```

The production build is emitted to `dist`:

```bash
npm run build
```

GitHub Pages deployment is handled by `.github/workflows/static.yml`. Configure the repository
Pages source to **GitHub Actions**, then pushes to `main` will publish the tracker.

The `screenshots/` folder shows every page rendered on the real data, so the app can be
reviewed without building it.

## Methodology (summary)

Every metric is converted to a **percentile rank within the 134 acute peers** (0–100),
oriented so higher always means a stronger commercial signal. Pillars are the mean of their
features; the target is their weighted sum:

```
Target = 0.41 · Operational pain  +  0.35 · Budget likelihood  +  0.24 · Digital / capital
              − severe-distress adjustment
```

| Pillar | Weight | Built from |
|---|---|---|
| Operational pain | 0.41 | A&E 4hr/12hr, cancer 62-day/FDS, diagnostics >6wk, RTT 52/18-wk |
| Budget likelihood | 0.35 | operating income (scale) + actual operating margin (health) |
| Digital / capital | 0.24 | digital-maturity gap + productivity gap + capital-envelope trigger |

The weights sum to 1 (pain carries the most, then budget, then digital). The model measures
opportunity *attractiveness*, not live buying intent — there is no procurement/CRM data in it.
Trusts in NHS Oversight Framework **segment 4** take a distress penalty and are capped at
Band C. **Confidence is scored separately** from the target, so weak data can never inflate a
ranking. Full detail, worked examples and an independent verification are in
[`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) and [`docs/WORKED_EXAMPLES_AND_SOURCES.md`](docs/WORKED_EXAMPLES_AND_SOURCES.md).

## Data sources

All data is public. "Scored" sources drive the target; "evidence" sources are shown on the
pages but do not change the score.

| Status | Source | Publisher |
|---|---|---|
| **Scored** | NHS Oversight Framework (universe, finance, productivity, distress) | NHS England |
| **Scored** | Acute Provider Table (operational pain) | NHS England |
| **Scored** | TAC annual accounts (operating income + margin) | NHS England |
| **Scored** | Provider capital allocations 2026–30 | NHS England |
| **Scored** | Digital Maturity Assessment | NHS England Digital |
| **Evidence** | CQC ratings (Overall + Well-led) | Care Quality Commission |
| **Evidence** | SHMI (mortality), DQMI (data quality) | NHS England Digital |
| **Evidence** | Federated Data Platform (live + benefits) | NHS England |
| **Evidence** | In-year finance (Q3 variance, forecast, DSF) | NHS England |
| **Catchment** | ODS sites + NSPL + Census 2021 + IMD 2025 | NHS England Digital / ONS / MHCLG |

See [`docs/WORKED_EXAMPLES_AND_SOURCES.md`](docs/WORKED_EXAMPLES_AND_SOURCES.md) for the full provenance
table and [`docs/REVIEW_RESPONSE_v2.md`](docs/REVIEW_RESPONSE_v2.md) for sources reviewed but not used
(NHP, ERIC, Discharge) and why.

## Repository structure

```
.
├── README.md            ← you are here (the front door)
├── AGENTS.md            ← how an AI agent should REFRESH the model (read first)
├── REFRESH.md           ← per-source runbook: cadence, where to get each file, expected coverage
├── validate.py          ← post-build checks; fails loudly on data drift
│
├── data/                ← INPUTS — drop source files here (gitignored); see data/README.md
│
├── nhs_targeting_transform/   ← THE PIPELINE (run as `python -m nhs_targeting_transform.…`)
│   ├── config.py              ← weights + feature definitions
│   ├── loaders.py             ← per-source readers (glob-matched)
│   ├── scoring.py             ← percentile pillars, distress, bands, confidence
│   ├── build.py               ← orchestration + CLI → outputs/sales_scorecard.csv
│   ├── catchment.py           ← NSPL + sites + Census + IMD → catchment files
│   ├── cqc_extract.py         ← streams the large CQC ODS → ratings CSV
│   └── requirements.txt
│
├── outputs/             ← GENERATED ARTEFACTS (the model output)
│   ├── sales_scorecard.csv          ← 134 trusts scored
│   ├── feature_table.csv            ← raw inputs behind every score (audit)
│   ├── catchment_bridge.csv         ← LSOA→trust assignments
│   ├── catchment_summary.csv        ← per-trust population / age / ethnicity / IMD
│   ├── cqc_ratings_extracted.csv    ← trust-level CQC Overall + Well-led
│   └── fdp_live_organisations_extracted.csv
│
├── src/components/NhsTargetingPrototype.jsx
│                                      ← the interactive app (single-file React, data inlined)
├── screenshots/         ← the report pages rendered on real data
└── docs/                ← all methodology & design docs
    ├── METHODOLOGY.md               ← authoritative scoring logic + Appendix A (files→loaders→fields)
    ├── WORKED_EXAMPLES_AND_SOURCES.md
    ├── TARGET_EXAMPLES.md
    ├── EXTENSION_ROADMAP.md
    ├── INTERACTION_MODEL.md
    └── REVIEW_RESPONSE_v2.md
```

## Reproducing / refreshing the outputs

**Refreshing the model is running this pipeline against new files — not a chat session.** If you
are an AI assistant asked to refresh it, read [`AGENTS.md`](AGENTS.md) first; per-source detail is
in [`REFRESH.md`](REFRESH.md).

```bash
pip install -r nhs_targeting_transform/requirements.txt

# one-off precomputes (only if those sources changed)
python -m nhs_targeting_transform.cqc_extract --ods data/cqc_ratings.ods --out data
python -m nhs_targeting_transform.catchment   --nspl data/NSPL_*.zip --sites data/nhs-trust_sites.csv \
        --census data --input data --out outputs

# main scoring build → outputs/sales_scorecard.csv + feature_table.csv
python -m nhs_targeting_transform.build --input data --out outputs

# verify the build before publishing
python validate.py
```

Loaders locate each file by glob pattern, so exact filenames don't matter as long as a matching
file is present. Source data is **not** committed (size + licensing — see below); put your copy in
`data/`. A few inputs (TAC, capital, Q3, FDP) arrive pre-cleaned upstream — see the warning in
`REFRESH.md`.

## Documentation

| Document | What's in it |
|---|---|
| [`AGENTS.md`](AGENTS.md) | **how to refresh the model** — read first if you're picking this up |
| [`REFRESH.md`](REFRESH.md) | per-source runbook: pattern, loader, cadence, where to get it, expected coverage |
| [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) | the scoring model, weights, distress, confidence, catchment + Appendix A (files→loaders→fields) |
| [`docs/WORKED_EXAMPLES_AND_SOURCES.md`](docs/WORKED_EXAMPLES_AND_SOURCES.md) | full source provenance, two number-by-number worked traces, independent verification |
| [`docs/TARGET_EXAMPLES.md`](docs/TARGET_EXAMPLES.md) | three example targets with data-driven rationale |
| [`docs/EXTENSION_ROADMAP.md`](docs/EXTENSION_ROADMAP.md) | where to take it next, in value-for-effort order |
| [`docs/INTERACTION_MODEL.md`](docs/INTERACTION_MODEL.md) | build spec for in-app methodology tooltips + cross-filter/drilldown |
| [`docs/REVIEW_RESPONSE_v2.md`](docs/REVIEW_RESPONSE_v2.md) | response to external review; status of every source |

In-app, the **Glossary** page and the hover info-tooltips on each metric document terms for
non-specialist readers.

## Screenshots

> Note: these images are from an earlier build and predate the removal of buyer openness — the
> live app no longer has a Procurement page, an "Active procurement" tile, or a Buyer pillar bar.

| | |
|---|---|
| ![Trust 360](screenshots/10_trust_360.png) | ![Finance](screenshots/03_finance_buying.png) |
| Trust 360 — full profile with metric tooltips | Finance & buying signals |
| ![Geography](screenshots/08_geography_context.png) | ![Glossary](screenshots/11_glossary.png) |
| Geography — catchment + IMD deprivation | Glossary — every metric explained |

## Known limitations

1. **Bands are a capacity-based prioritisation policy, not a win-probability.** A = top 12, B =
   next 18, C = next 30 (plus distressed trusts, capped there), D = the rest — counts set in
   `config.py` to match team capacity. They map to an action (pursue / develop / nurture /
   deprioritise); the underlying **ranking** is the dependable part, and bands self-adjust on
   each refresh because they follow rank position.
2. **Opportunity, not live intent.** The score answers "is this an interesting opportunity?"
   (a clear problem + budget + a digital reason), not "are they buying right now?" — there is
   no procurement/CRM data in the model, by design.
3. **Evidence vs scored.** CQC, SHMI, DQMI, FDP, Q3 finance and catchment are shown but not in
   the score, to keep rankings stable pre-calibration.
4. **Catchment is a geographic proxy**, not patient-flow; it understates specialist trusts.
5. **Large-trust bias:** the score correlates with operating income (bigger trusts → bigger
   potential deals); pair with a per-capita view where intensity matters.

The [roadmap](docs/EXTENSION_ROADMAP.md) addresses each of these.

## Data & licensing

The processed outputs derive from public data published under the **Open Government Licence
v3.0** (NHS England, NHS England Digital, ONS, Care Quality Commission, MHCLG) — attribute
accordingly if you redistribute. Census 2021 data © ONS. IMD 2025 © MHCLG. CQC ratings © Care
Quality Commission. Raw source files are **not** committed here; only derived/processed
extracts and code are. Add a `LICENSE` file for your own code before making the repo public.

---

*Built for Intuita. A commercial account-prioritisation prototype on real public NHS & ONS
data — not an official NHS performance rating.*
