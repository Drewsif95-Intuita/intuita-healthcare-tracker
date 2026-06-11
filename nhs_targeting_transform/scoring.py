"""
Scoring engine: turn the per-trust feature table into pillar scores, a target score,
band, distress flag, pain trend and a confidence rating.

Each feature is scored 0-100 by its percentile rank *within the acute peer group*
(register rule: score within trust type), oriented so a higher score always means a
stronger commercial signal for that pillar. Pillars are the mean of their features;
the target is the re-normalised weighted sum of the three populated pillars.
"""
from __future__ import annotations
import numpy as np
import pandas as pd

from . import config


def pct(series: pd.Series, higher_attractive: bool = True) -> pd.Series:
    """Percentile rank 0-100 within the peer group."""
    r = series.rank(pct=True) * 100
    return r if higher_attractive else 100 - r


def _badness(value: float, orientation: str) -> float:
    if pd.isna(value):
        return np.nan
    return value if orientation == "bad" else (1 - value)


def pain_scores(apt_wide: pd.DataFrame) -> pd.DataFrame:
    """Per-feature pain score (0-100, higher = more pain) for each trust."""
    out = {}
    for metric, (orient, _domain, _label) in config.PAIN_FEATURES.items():
        if metric not in apt_wide.columns:
            continue
        col = apt_wide[metric]
        # pain rises with value for 'bad' metrics, falls with value for 'good' metrics
        out[metric] = pct(col, higher_attractive=(orient == "bad"))
    return pd.DataFrame(out)


def classify_trend(apt: pd.DataFrame, code: str) -> str:
    """Classify the trust's composite pain trend over the recent window."""
    sub = apt[apt["code"] == code]
    if sub.empty:
        return "Flat"
    # composite monthly badness across the pain features
    rows = []
    for date, g in sub.groupby("Date"):
        vals = []
        for metric, (orient, _d, _l) in config.PAIN_FEATURES.items():
            v = g.loc[g["metric"] == metric, "value"]
            if not v.empty and pd.notna(v.iloc[0]):
                vals.append(_badness(v.iloc[0], orient))
        if vals:
            rows.append((date, float(np.mean(vals))))
    if len(rows) < 3:
        return "Flat"
    rows.sort()
    rows = rows[-config.TREND_MONTHS:]
    y = np.array([r[1] for r in rows])
    x = np.arange(len(y))
    slope = np.polyfit(x, y, 1)[0]            # change in badness per month
    vol = float(np.std(y - np.polyval(np.polyfit(x, y, 1), x)))
    if vol > 0.02:
        return "Volatile"
    if slope > 0.002:
        return "Worsening"
    if slope < -0.002:
        return "Improving"
    return "Flat"


def band_for(score: float, distress: bool) -> str:
    for b, thr in config.BANDS:
        if score >= thr:
            band = b
            break
    else:
        band = "D"
    if distress:
        order = ["A", "B", "C", "D"]
        if order.index(band) < order.index(config.DISTRESS_BAND_CAP):
            band = config.DISTRESS_BAND_CAP
    return band


def next_action(band: str, distress: bool) -> str:
    if distress:
        return "Qualify funding"
    return {"A": "Call", "B": "Enrich", "C": "Monitor", "D": "No action"}[band]


def confidence(present: int, expected: int, missing: list[str]) -> tuple[str, str]:
    ratio = present / expected if expected else 0
    if ratio >= 0.9:
        lvl = "High"
    elif ratio >= 0.6:
        lvl = "Medium"
    else:
        lvl = "Low"
    base = f"{present}/{expected} features present"
    if missing:
        base += "; missing: " + ", ".join(missing)
    base += "; buyer-openness deferred (no procurement source in MVP)"
    return lvl, base
