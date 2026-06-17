# Interaction Model & Methodology Transparency — Build Spec

For the team building this into the live site. The prototype (`nhs_targeting_prototype.jsx`)
implements a working reference of everything below; this document is the spec to build it
properly into the product, plus the intended extensions.

Two goals drive the interaction design:
1. **Prove the methodology** — every score must be explainable *in place*, not only in a doc.
2. **Drillable, cross-filtered exploration** — selecting something in one view filters/highlights
   the others, so a user can move from the whole market to a single trust without losing context.

---

## 1. Methodology transparency (the key requirement)

Three layers, from quick to deep — already in the prototype:

| Layer | Where | Content |
|---|---|---|
| **Definitions** | Glossary page + ⓘ icon on every metric label | what the metric is, why it matters commercially, its source (data-driven from one `GLOSSARY` object so tooltip and page never drift) |
| **Calculation, per trust** | ⓘ next to each pillar bar and the target score on Trust 360 | the *actual working* for this trust, e.g. `Budget 84.3 = mean of two peer percentiles — operating income (£1,293m) and operating margin (+1.6%)`; target `0.41×68.8 + 0.35×84.3 + 0.24×71.8 = 75` |
| **Method, full** | Methodology page (in-app) + `METHODOLOGY.md` | percentile-within-peers, orientations, weights, distress, confidence, catchment, and Appendix A (files → loaders → fields) |

**Build notes**
- The calculation tooltips read values already in the trust record (`pain`, `budget`,
  `digital`, `rawOpp`, `target`, `finance.income/margin/capital`, `dmaRaw`, `topPain`), so they
  are exact, not narrated. Keep them in sync with the scoring code — ideally generate the
  tooltip strings from the same constants as the scorer.
- Pillar weights shown on Trust 360 are **Pain 0.41 / Budget 0.35 / Digital 0.24** (three
  pillars, summing to 1). Do **not** revert to the old 0.30/0.35/0.20/0.15 four-pillar display —
  that earlier design included a "buyer openness" pillar that has since been removed from scope.
- Consider promoting the per-trust calculation to a small expandable "How this score was built"
  panel on Trust 360 for stakeholders who want the full breakdown rather than a hover.

## 2. Cross-filtering & drilldown

### Implemented in the prototype (reference behaviour)
- **Global band filter** held as one piece of state (`bandFilter`), lifted to the app shell.
- **Triggers** (anything that sets it):
  - Clicking a row in **Band distribution** (Overview) → filter to that band; click again to clear.
  - Clicking the **A-band priority KPI** (Overview) → filter to Band A.
  - The **filter chip in the top bar** shows the active band and clears it on click.
- **Effects** (everything reacts):
  - **Overview scatter** dims non-matching bubbles (highlight, keeps map context).
  - **"Where to start"** panel lists the selected band's trusts.
  - **Detail pages** (Shortlist, Finance, Operational Pain, Digital, Data Quality, Geography)
    **hard-filter** to the selected band.
  - Band distribution highlights the selected row and dims the others.
- **Row → Trust 360**: clicking any trust (scatter bubble, shortlist row, table row, or
  "where to start" item) opens its Trust 360.

The deliberate split: the **Overview is a map** (filter = highlight/dim, never hide, so the
market context is preserved); **detail pages are lists** (filter = hard-filter to the subset).

### Recommended extensions for the site (same pattern, more dimensions)
Build these as additional filters that compose with the band filter (a small filter-state
object rather than a single value):

1. **Region / ICB filter** — clicking a slice of the Geography "Region mix" (or an ICB)
   filters the report to that geography. High value for territory-based BD ownership.
2. **Pain-domain filter** — clicking a domain (UEC / Cancer / RTT / Diagnostics) on the
   Operational Pain page filters to trusts whose lead pain is that domain — directly maps to a
   sales play.
3. **Trend filter** — the "Worsening trend" KPI becomes clickable (filter to worsening trusts),
   like the A-band KPI.
4. **Distress toggle** — show / hide / isolate segment-4 "qualify funding" trusts.
5. **Selected-trust highlight** — when a trust is chosen, highlight it across every chart
   (e.g. outline its bubble on the Overview scatter) so users keep their place.
6. **Active-filter bar** — surface all active filters as removable chips in the top bar
   (band, region, domain, trend), each clearable; one "clear all".
7. **Shareable state** — persist the filter set in the URL query string so a filtered view
   (e.g. "Band B, North West, UEC") can be sent to a colleague.

### Implementation guidance
- Lift filter state to the shell; pass `filters` + `setFilters` down. Detail pages render
  `data.filter(matchesFilters)`; the Overview renders all data and styles by `matchesFilters`.
- Keep filters **composable and additive** (AND across dimensions). Every filter should be
  clearable individually and collectively.
- Charts use Recharts `ResponsiveContainer`; size their grid columns with `minmax(0, …)` and
  `minWidth: 0` so they measure width correctly inside CSS grid (otherwise bubbles can collapse).
- Tooltips are plain hover `state` components — fine for web; add `title` attributes or an
  accessible popover for keyboard/screen-reader support in the production build.
