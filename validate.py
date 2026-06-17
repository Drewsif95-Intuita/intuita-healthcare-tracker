#!/usr/bin/env python3
"""
validate.py — post-build sanity checks for the NHS sales-targeting model.

Run this AFTER a refresh (after `python -m nhs_targeting_transform.build ...`).
It reads the generated artefacts in outputs/ and FAILS LOUDLY if a source has
silently dropped out, a column has been renamed to nulls, or the universe has
changed shape. This is the main defence against "silent drift" — a refreshed
file with a changed column that quietly skews scores with no error.

Usage:
    python validate.py                 # checks ./outputs
    python validate.py path/to/outputs # checks a custom directory

Exit code 0 = all hard checks passed (warnings may still print).
Exit code 1 = at least one hard check failed — do NOT publish this build.
"""
import sys
import os
import pandas as pd

OUT = sys.argv[1] if len(sys.argv) > 1 else "outputs"

# Expectations. Tune the thresholds if the universe or sourcing legitimately changes
# (and record the change in docs/METHODOLOGY.md so the doc never drifts from reality).
EXPECT_TRUSTS = 134
TRUSTS_TOLERANCE = 4                       # warn outside 130-138
CATCHMENT_TOTAL = 56_490_091               # England acute catchment, reconciles to ONS
CATCHMENT_TOLERANCE = 0.02                 # +/- 2%
BANDS = {"A", "B", "C", "D"}

# Coverage floors: fraction of trusts that MUST have a non-null value.
# Scored inputs are hard (failing them invalidates the build); evidence inputs are soft.
HARD_COVERAGE = {           # column: min fraction present
    "pain": 0.95,
    "budget": 0.95,
    "digital": 0.95,
    "op_income_k": 0.90,
}
SOFT_COVERAGE = {           # evidence layer — warn, don't fail
    "capital_k": 0.50, "dma_overall": 0.70, "cqc_overall": 0.85,
    "dqmi": 0.70, "shmi": 0.70, "q3_var_pct": 0.80, "fdp_live": 0.50,
}

errors, warnings = [], []


def hard(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def main():
    sc_path = os.path.join(OUT, "sales_scorecard.csv")
    if not os.path.exists(sc_path):
        hard(f"sales_scorecard.csv not found in {OUT}/ — did the build run?")
        return report()

    df = pd.read_csv(sc_path)

    # 1) universe shape
    n = len(df)
    if n == 0:
        hard("scorecard is empty.")
        return report()
    if abs(n - EXPECT_TRUSTS) > TRUSTS_TOLERANCE:
        warn(f"trust count is {n}, expected ~{EXPECT_TRUSTS}. Check the universe filter / NOF load.")
    print(f"  trusts: {n}")

    # 2) every trust must have a valid band and a target
    if "band" not in df.columns:
        hard("no 'band' column.")
    else:
        bad = set(df["band"].dropna().unique()) - BANDS
        if bad:
            hard(f"unexpected band values: {bad}")
        if df["band"].isna().any():
            hard(f"{int(df['band'].isna().sum())} trust(s) have no band.")
    if "target" in df.columns and df["target"].isna().any():
        hard(f"{int(df['target'].isna().sum())} trust(s) have no target score.")

    # 3) coverage checks
    print("  coverage:")
    for col, floor in {**HARD_COVERAGE, **SOFT_COVERAGE}.items():
        if col not in df.columns:
            (hard if col in HARD_COVERAGE else warn)(f"column '{col}' is missing entirely.")
            continue
        frac = df[col].notna().mean()
        flag = "" if frac >= floor else ("  <-- FAIL" if col in HARD_COVERAGE else "  <-- low")
        print(f"    {col:<16} {frac*100:5.1f}% present (floor {floor*100:.0f}%){flag}")
        if frac < floor:
            (hard if col in HARD_COVERAGE else warn)(
                f"'{col}' present for {frac*100:.0f}% of trusts (floor {floor*100:.0f}%). "
                f"Likely a renamed column or a dropped source.")

    # 4) catchment reconciliation
    cs_path = os.path.join(OUT, "catchment_summary.csv")
    if os.path.exists(cs_path):
        cs = pd.read_csv(cs_path)
        if "catch_pop" in cs.columns:
            total = cs["catch_pop"].sum()
            lo, hi = CATCHMENT_TOTAL * (1 - CATCHMENT_TOLERANCE), CATCHMENT_TOTAL * (1 + CATCHMENT_TOLERANCE)
            ok = lo <= total <= hi
            print(f"  catchment total: {int(total):,} (expect ~{CATCHMENT_TOTAL:,})")
            if not ok:
                warn(f"catchment total {int(total):,} is outside +/-{CATCHMENT_TOLERANCE*100:.0f}% "
                     f"of {CATCHMENT_TOTAL:,}. Check NSPL / Census inputs.")
    else:
        warn("catchment_summary.csv not found — catchment step may not have run.")

    return report()


def report():
    print()
    for w in warnings:
        print(f"  WARNING: {w}")
    if errors:
        print()
        for e in errors:
            print(f"  ERROR:   {e}")
        print(f"\nVALIDATION FAILED — {len(errors)} error(s), {len(warnings)} warning(s). Do not publish this build.")
        sys.exit(1)
    print(f"\nVALIDATION PASSED — 0 errors, {len(warnings)} warning(s).")
    sys.exit(0)


if __name__ == "__main__":
    print(f"Validating build in {OUT}/ ...")
    main()
