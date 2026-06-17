"""
Configuration for the NHS sales-targeting transform (silver -> gold scoring).

Everything tunable lives here: where to find each source file, the pillar weights,
and the feature definitions (which metric, from which source, oriented which way).
"""
from __future__ import annotations

# --- where to find the extracted source files (glob patterns within the input dir) ---
FILE_PATTERNS = {
    "nof_acute": "*oversight-framework-acute*.csv",
    "apt_timeseries": "*acute-provider-timeseries*.csv",
    "beds": "*Beds-Open-Overnight*.xlsx",
    "dma": "*Digital*Maturity*Results*Data*File*.xlsx",
    "tac_list": "*TAC-data-published*.xlsx",   # used for name->code enrichment
}

# --- pillar weights (Model A). Buyer openness has no data in this MVP, so the three
#     populated pillars are re-normalised to sum to 1.0 and buyer is reported as deferred.
RAW_WEIGHTS = {"budget": 0.30, "pain": 0.35, "digital": 0.20, "buyer": 0.15}
ACTIVE_PILLARS = ["budget", "pain", "digital"]
_active_total = sum(RAW_WEIGHTS[p] for p in ACTIVE_PILLARS)        # 0.85
WEIGHTS = {p: RAW_WEIGHTS[p] / _active_total for p in ACTIVE_PILLARS}  # 0.353 / 0.412 / 0.235

# --- band thresholds (same as the prototype; calibration is a later step) ---
BAND_CAPACITY = {"A": 12, "B": 18, "C": 30}   # accounts per tier (team capacity); D = the remainder
# Bands are a capacity-based prioritisation grouping, not a win-probability. A/B/C are the top N
# non-distressed trusts by score; edit these counts to match how many accounts the team can work.
DISTRESS_PENALTY = 8.0       # subtracted from target for distressed trusts
DISTRESS_BAND_CAP = "C"      # distressed trusts cannot be better than this band

# --- PAIN features: Acute Provider Table metric name -> orientation -------------------
#   orientation 'good' = higher value is better performance (invert to get pain)
#   orientation 'bad'  = higher value is worse performance (more pain directly)
PAIN_FEATURES = {
    "A&E 4 hour performance": ("good", "UEC", "A&E 4-hour"),
    "A&E 12 hour performance": ("bad", "UEC", "A&E 12-hour"),
    "Cancer 62 Day Combined Performance": ("good", "Cancer", "Cancer 62-day"),
    "Cancer Faster Diagnostic Standard": ("good", "Cancer", "Cancer FDS"),
    "Diagnostics proportion waiting over 6 weeks": ("bad", "Diagnostics", "Diagnostics 6-wk"),
    "Percentage waiting more than 52 weeks for elective treatment": ("bad", "RTT", "RTT 52-week"),
    "Percentage waiting within 18 weeks for elective treatment": ("good", "RTT", "RTT 18-week"),
}

# --- BUDGET features ------------------------------------------------------------------
# scale comes from beds (KH03); financial health from NOF planned surplus/deficit.
NOF_FINANCE_METRIC = "OF0079"      # Planned surplus/deficit (%), higher = healthier
NOF_PRODUCTIVITY_METRIC = "OF0085" # Implied productivity level (used in digital pillar)

# --- DISTRESS signals (from NOF) ------------------------------------------------------
NOF_RSP_METRIC = "OF5007"          # In Recovery Support Programme? (flag)
NOF_SEGMENT_METRIC = "OF5000"      # Adjusted segment (4 = most distressed)

# --- sales play mapping by worst-pain domain ------------------------------------------
PLAY_BY_DOMAIN = {
    "UEC": "UEC / A&E flow",
    "RTT": "Elective recovery / RTT",
    "Cancer": "Cancer / diagnostics pathway",
    "Diagnostics": "Cancer / diagnostics pathway",
}

TREND_MONTHS = 6      # window for the pain-trend classification
