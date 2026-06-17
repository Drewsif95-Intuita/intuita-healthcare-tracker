"""
Build the gold `sales_scorecard` from the source extracts.

Usage:
    python -m nhs_targeting_transform.build --input /path/to/extracts --out ./gold
"""
from __future__ import annotations
import argparse
import os
import numpy as np
import pandas as pd

from . import config, loaders as L, scoring as S


def build(input_dir: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    # ---- load ----
    nof, quarter = L.load_nof(input_dir)
    dim = L.nof_trust_dim(nof)
    name_to_code = dict(zip(dim["name_norm"], dim["Trust_code"]))
    name_to_code.update(L.load_ods_name_map(input_dir))  # authoritative ODS map wins
    fdp = L.load_fdp_clean(input_dir)                     # FDP live + benefits-realising
    apt = L.load_apt(input_dir)
    apt_wide = L.apt_latest_wide(apt)
    beds = L.load_beds(input_dir)
    dma = L.load_dma(input_dir, name_to_code)
    finance = L.nof_metric(nof, config.NOF_FINANCE_METRIC)
    productivity = L.nof_metric(nof, config.NOF_PRODUCTIVITY_METRIC)
    segment = pd.to_numeric(L.nof_metric_raw(nof, config.NOF_SEGMENT_METRIC), errors="coerce")
    dqmi = L.load_dqmi(input_dir)        # evidence (Data Quality page); not in target
    shmi = L.load_shmi(input_dir)        # evidence (quality); not in target
    q3 = L.load_q3_finance(input_dir)    # evidence: in-year (Q3) financial position
    cqc = L.load_cqc(input_dir)          # evidence: CQC overall + well-led ratings

    codes = dim["Trust_code"].tolist()

    # ---- feature table (raw, aligned to acute trusts) ----
    feat = pd.DataFrame(index=codes)
    for metric in config.PAIN_FEATURES:
        feat[metric] = apt_wide[metric].reindex(codes) if metric in apt_wide else np.nan
    feat["beds"] = beds.reindex(codes)
    feat["dma_overall"] = dma.reindex(codes)
    feat["finance_planned_sd"] = finance.reindex(codes)
    feat["productivity"] = productivity.reindex(codes)
    feat["segment"] = segment.reindex(codes)
    tac = L.load_tac_finance(input_dir)              # operating income + actual margin
    capital = L.load_capital_alloc(input_dir)        # provider capital envelope 2026-30
    feat["op_income_k"] = tac["op_income_k"].reindex(codes)
    feat["op_margin_pct"] = tac["op_margin_pct"].reindex(codes)
    feat["capital_k"] = capital.reindex(codes)
    # scale: operating income preferred, beds as fallback for unmatched trusts
    feat["scale_basis"] = feat["op_income_k"].fillna(feat["beds"])

    # ---- pillar scores ----
    pain = S.pain_scores(apt_wide).reindex(codes)
    pillar_pain = pain.mean(axis=1)

    # Budget: scale (operating income, beds fallback) + financial health (actual operating margin)
    scale_score = S.pct(feat["scale_basis"])                # bigger = more attractive
    finance_score = S.pct(feat["op_margin_pct"])            # healthier actual margin = more attractive
    pillar_budget = pd.concat([scale_score, finance_score], axis=1).mean(axis=1)

    # Digital/capital: maturity gap + productivity gap + capital-envelope trigger
    dma_gap = S.pct(feat["dma_overall"], higher_attractive=False)     # lower maturity = more opportunity
    prod_gap = S.pct(feat["productivity"], higher_attractive=False)   # lower productivity = more opportunity
    capital_trigger = S.pct(feat["capital_k"])                        # bigger capital envelope = stronger trigger
    pillar_digital = pd.concat([dma_gap, prod_gap, capital_trigger], axis=1).mean(axis=1)

    w = config.WEIGHTS
    target = (w["pain"] * pillar_pain + w["budget"] * pillar_budget + w["digital"] * pillar_digital)

    # ---- per-trust assembly ----
    rows = []
    for code in codes:
        d = dim.set_index("Trust_code").loc[code]
        distressed = bool(feat.loc[code, "segment"] == 4)
        raw_opp = round(float(target.get(code, np.nan)), 1)   # opportunity before funding adjustment
        if pd.isna(raw_opp):
            continue
        tgt = round(raw_opp - config.DISTRESS_PENALTY, 1) if distressed else raw_opp  # funding-adjusted (pursuit)
        band = "D"  # placeholder; capacity-based band assigned after ranking (below)

        # worst pain feature -> top pain + play
        prow = pain.loc[code].dropna()
        if not prow.empty:
            worst_metric = prow.idxmax()
            _orient, domain, label = config.PAIN_FEATURES[worst_metric]
        else:
            domain, label = "UEC", "operational pressure"
        play = config.PLAY_BY_DOMAIN.get(domain, "Operational improvement")
        trend = S.classify_trend(apt, code)

        if distressed:
            trigger = "Segment 4 (intensive support) — qualify funding route"
        elif trend == "Worsening":
            trigger = f"{label} worsening"
        else:
            trigger = f"{label} under pressure"

        na = S.next_action(band, distressed)

        # confidence = completeness over the ACTIVE SCORED sources (V0 data completeness)
        scored = {
            "pain (>=6/7)": pain.loc[code].notna().sum() >= 6,
            "TAC income": pd.notna(feat.loc[code, "op_income_k"]),
            "TAC margin": pd.notna(feat.loc[code, "op_margin_pct"]),
            "capital": pd.notna(feat.loc[code, "capital_k"]),
            "DMA": pd.notna(feat.loc[code, "dma_overall"]),
            "segment": pd.notna(feat.loc[code, "segment"]),
        }
        present, expected = sum(scored.values()), len(scored)
        missing = [k for k, ok in scored.items() if not ok]
        conf_lvl, conf_reason = S.confidence(present, expected, missing)

        rows.append({
            "code": code, "name": d["Trust_name"], "region": d["Region"],
            "subtype": d["Trust_subtype"],
            "budget": round(float(pillar_budget.get(code, np.nan)), 1),
            "pain": round(float(pillar_pain.get(code, np.nan)), 1),
            "digital": round(float(pillar_digital.get(code, np.nan)), 1),
            "buyer": None,
            "raw_opportunity_score": raw_opp, "target": tgt, "band": band,
            "distress": distressed,
            "distress_reason": "NOF segment 4" if distressed else "",
            "trend": trend, "top_pain": label, "sales_play": play,
            "trigger": trigger, "next_action": na,
            "confidence": conf_lvl, "confidence_reason": conf_reason,
            # transparency: raw inputs
            "beds": None if pd.isna(feat.loc[code, "beds"]) else round(float(feat.loc[code, "beds"])),
            "dma_overall": None if pd.isna(feat.loc[code, "dma_overall"]) else round(float(feat.loc[code, "dma_overall"]), 2),
            "finance_planned_sd_pct": None if pd.isna(feat.loc[code, "finance_planned_sd"]) else round(float(feat.loc[code, "finance_planned_sd"]), 2),
            "segment": None if pd.isna(feat.loc[code, "segment"]) else int(feat.loc[code, "segment"]),
            "dqmi": (None if code not in dqmi.index or pd.isna(dqmi.loc[code, "dqmi"]) else dqmi.loc[code, "dqmi"]),
            "dq_weak": (";".join(dqmi.loc[code, "weak"]) if code in dqmi.index and dqmi.loc[code, "weak"] else ""),
            "shmi": (None if code not in shmi.index or pd.isna(shmi.loc[code, "shmi"]) else shmi.loc[code, "shmi"]),
            "shmi_band": (shmi.loc[code, "shmi_band"] if code in shmi.index else ""),
            "cqc_overall": (cqc.loc[code, "cqc_overall"] if code in cqc.index else ""),
            "cqc_well_led": (cqc.loc[code, "cqc_well_led"] if code in cqc.index else ""),
            "cqc_below_good": ("Yes" if code in cqc.index and bool(cqc.loc[code, "cqc_below_good"]) else "No"),
            "q3_var_pct": (None if code not in q3.index or pd.isna(q3.loc[code, "ytd_var_pct"]) else q3.loc[code, "ytd_var_pct"]),
            "q3_forecast_deficit": ("Yes" if code in q3.index and q3.loc[code, "forecast_deficit"] is True else ("No" if code in q3.index else "")),
            "q3_dsf": ("Yes" if code in q3.index and bool(q3.loc[code, "dsf_flag"]) else "No"),
            "fdp_live": ("Yes" if code in fdp.index and bool(fdp.loc[code, "fdp_live"]) else "No"),
            "fdp_benefits": ("Yes" if code in fdp.index and bool(fdp.loc[code, "fdp_benefits"]) else "No"),
            "op_income_k": (None if pd.isna(feat.loc[code, "op_income_k"]) else round(float(feat.loc[code, "op_income_k"]))),
            "op_margin_pct": (None if pd.isna(feat.loc[code, "op_margin_pct"]) else round(float(feat.loc[code, "op_margin_pct"]), 2)),
            "capital_k": (None if pd.isna(feat.loc[code, "capital_k"]) else round(float(feat.loc[code, "capital_k"]))),
        })

    scorecard = pd.DataFrame(rows)
    # pursuit order: non-distressed first (by score), then distressed (qualify-funding) below
    scorecard = scorecard.sort_values(["distress", "target"], ascending=[True, False]).reset_index(drop=True)
    scorecard["pursuit_rank"] = range(1, len(scorecard) + 1)
    # capacity-based bands (needs the full ranking) + matching next action
    scorecard["band"] = S.assign_capacity_bands(scorecard)
    scorecard["next_action"] = [S.next_action(b, d) for b, d in zip(scorecard["band"], scorecard["distress"])]
    scorecard.attrs["nof_quarter"] = quarter
    return scorecard, feat


def main(argv=None):
    p = argparse.ArgumentParser(description="Build the NHS sales-targeting gold scorecard.")
    p.add_argument("--input", required=True, help="Directory of extracted source files.")
    p.add_argument("--out", default="./gold", help="Output directory.")
    args = p.parse_args(argv)

    scorecard, feat = build(args.input)
    os.makedirs(args.out, exist_ok=True)
    sc_path = os.path.join(args.out, "sales_scorecard.csv")
    ft_path = os.path.join(args.out, "feature_table.csv")
    scorecard.to_csv(sc_path, index=False)
    feat.to_csv(ft_path)

    print(f"NOF quarter: {scorecard.attrs.get('nof_quarter')}")
    print(f"Scored {len(scorecard)} acute trusts -> {sc_path}")
    print("Band distribution:", scorecard["band"].value_counts().reindex(['A','B','C','D']).to_dict())
    print("Distressed (segment 4):", int(scorecard["distress"].sum()))
    print("Confidence:", scorecard["confidence"].value_counts().to_dict())
    print("\nTop 15 targets:")
    cols = ["code", "name", "target", "band", "pain", "budget", "digital",
            "trend", "top_pain", "sales_play", "next_action", "confidence"]
    with pd.option_context("display.max_rows", None, "display.width", 200,
                           "display.max_colwidth", 26):
        print(scorecard[cols].head(15).to_string(index=False))


if __name__ == "__main__":
    main()
