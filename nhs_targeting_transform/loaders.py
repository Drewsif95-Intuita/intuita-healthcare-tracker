"""
Loaders: read each raw extract and return a tidy, trust-code-keyed frame.

Design notes
------------
- The NOF acute file is the spine: it defines the acute-trust universe (134 trusts)
  and the join key (ODS Trust_code), and carries finance + distress signals.
- The Acute Provider Table gives the seven pain toplines as a monthly time series.
- Beds (KH03) and DMA need header-row handling / name matching; helpers below cope
  with the preamble rows and the name->code join.
"""
from __future__ import annotations
import glob
import os
import re
import io
import zipfile
import pandas as pd

from . import config


def _find(input_dir: str, key: str) -> str:
    pat = os.path.join(input_dir, config.FILE_PATTERNS[key])
    hits = glob.glob(pat)
    if not hits:
        raise FileNotFoundError(f"No file for '{key}' matching {config.FILE_PATTERNS[key]} in {input_dir}")
    return sorted(hits)[-1]


def normalise_name(name: str) -> str:
    """Normalise a trust name for fuzzy code matching."""
    if not isinstance(name, str):
        return ""
    s = name.upper()
    s = re.sub(r"[^A-Z0-9 ]", " ", s)
    for stop in [" NHS ", " FOUNDATION ", " TRUST ", " UNIVERSITY ", " HOSPITALS ",
                 " HOSPITAL ", " NHSFT ", " FT "]:
        s = s.replace(stop, " ")
    return re.sub(r"\s+", " ", s).strip()


# --------------------------------------------------------------------------- NOF
def load_nof(input_dir: str) -> pd.DataFrame:
    """Long NOF acute frame, latest quarter only."""
    df = pd.read_csv(_find(input_dir, "nof_acute"), dtype=str, encoding="utf-8-sig")
    df.columns = [c.strip() for c in df.columns]
    # latest quarter
    def qkey(q):
        m = re.search(r"Q(\d)\s+(\d{4})", q)
        return (int(m.group(2)), int(m.group(1))) if m else (0, 0)
    latest = sorted(df["Quarter"].unique(), key=qkey)[-1]
    df = df[df["Quarter"] == latest].copy()
    df["Value_num"] = pd.to_numeric(df["Value"], errors="coerce")
    return df, latest


def nof_trust_dim(nof: pd.DataFrame) -> pd.DataFrame:
    dim = (nof[["Trust_code", "Trust_name", "Region", "Trust_subtype"]]
           .drop_duplicates("Trust_code").reset_index(drop=True))
    dim["name_norm"] = dim["Trust_name"].map(normalise_name)
    return dim


def nof_metric(nof: pd.DataFrame, metric_id: str) -> pd.Series:
    """Return a Series indexed by Trust_code for a given OF metric (numeric Value)."""
    sub = nof[nof["Metric_ID"] == metric_id]
    # prefer the raw-units row (not the 'score' duplicate) — take first non-null per trust
    return sub.groupby("Trust_code")["Value_num"].first()


def nof_metric_raw(nof: pd.DataFrame, metric_id: str) -> pd.Series:
    sub = nof[nof["Metric_ID"] == metric_id]
    return sub.groupby("Trust_code")["Value"].first()


# --------------------------------------------------------------------------- APT
def load_apt(input_dir: str) -> pd.DataFrame:
    df = pd.read_csv(_find(input_dir, "apt_timeseries"), dtype=str, encoding="utf-8-sig")
    df.columns = [c.strip() for c in df.columns]
    df = df.rename(columns={"Provider.Code": "code", "Provider.Name": "name",
                            "Metric.Name": "metric", "Metric.Value": "value"})
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df[df["code"].str.len() == 3]  # trust ODS codes are 3 chars; drops 'Eng' etc.
    return df


def apt_latest_wide(apt: pd.DataFrame) -> pd.DataFrame:
    """One row per trust code with the latest value of each pain metric."""
    latest = (apt.sort_values("Date").groupby(["code", "metric"]).tail(1))
    wide = latest.pivot_table(index="code", columns="metric", values="value", aggfunc="first")
    return wide


# --------------------------------------------------------------------------- Beds (scale)
def load_beds(input_dir: str) -> pd.Series:
    """Total available beds per trust code (scale proxy). Handles KH03 preamble rows."""
    path = _find(input_dir, "beds")
    raw = pd.read_excel(path, sheet_name="NHS Trust by Sector", header=None, dtype=object)
    # find the header row: the one containing a cell like 'Org Code' / 'Code'
    hdr_row = None
    for i in range(min(20, len(raw))):
        cells = [str(c).strip().lower() for c in raw.iloc[i].tolist()]
        if any(c in ("org code", "code", "organisation code") for c in cells):
            hdr_row = i
            break
    if hdr_row is None:
        return pd.Series(dtype=float)
    df = pd.read_excel(path, sheet_name="NHS Trust by Sector", header=hdr_row, dtype=object)
    df.columns = [str(c).strip() for c in df.columns]
    code_col = next((c for c in df.columns if c.lower() in ("org code", "code", "organisation code")), None)
    # total available beds: the column mentioning 'Total' + 'Available', else first 'Total'
    cand = [c for c in df.columns if "available" in c.lower() and "total" in c.lower()]
    if not cand:
        cand = [c for c in df.columns if c.lower().strip() == "total" or "general & acute" in c.lower()]
    if not code_col or not cand:
        return pd.Series(dtype=float)
    beds = pd.to_numeric(df[cand[0]], errors="coerce")
    out = pd.Series(beds.values, index=df[code_col].astype(str).str.strip())
    return out[out.index.str.len() == 3].groupby(level=0).max()


# --------------------------------------------------------------------------- DMA (digital)
def load_dma(input_dir: str, name_to_code: dict) -> pd.Series:
    """Overall DMA maturity (mean of pillar scores) per trust code, acute care setting."""
    path = _find(input_dir, "dma")
    raw = pd.read_excel(path, sheet_name="SC - 2025 Pillar Summary", header=None, dtype=object)
    hdr_row = None
    for i in range(min(20, len(raw))):
        cells = [str(c).strip().lower() for c in raw.iloc[i].tolist()]
        if "provider" in cells and "care setting" in cells:
            hdr_row = i
            break
    if hdr_row is None:
        return pd.Series(dtype=float)
    df = pd.read_excel(path, sheet_name="SC - 2025 Pillar Summary", header=hdr_row, dtype=object)
    df.columns = [str(c).strip() for c in df.columns]
    if "Care Setting" in df.columns:
        df = df[df["Care Setting"].astype(str).str.strip().str.lower() == "acute"]
    pillar_cols = ["Well Led", "Ensure Smart Foundations", "Safe Practice",
                   "Support Workforce", "Empower People", "Improve Care", "Healthy Populations"]
    have = [c for c in pillar_cols if c in df.columns]
    df["dma_overall"] = df[have].apply(pd.to_numeric, errors="coerce").mean(axis=1)
    df["name_norm"] = df["Provider"].map(normalise_name)
    df["code"] = df["name_norm"].map(name_to_code)
    out = df.dropna(subset=["code"]).groupby("code")["dma_overall"].mean()
    return out


# --------------------------------------------------------------------------- DQMI
def load_dqmi(input_dir: str):
    """Overall DQMI (0-100) per acute trust + list of weak datasets (<60)."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "DQMI_*.csv")) or _g.glob(os.path.join(input_dir, "*DQMI*CSV*v*.csv"))
    if not hits:
        return pd.DataFrame(columns=["dqmi", "weak"])
    df = pd.read_csv(sorted(hits)[-1], dtype=str, encoding="utf-8-sig")
    df.columns = [c.strip() for c in df.columns]
    df = df[df["Org Type"].str.contains("NHS TRUST", case=False, na=False)]
    df["DQMI_n"] = pd.to_numeric(df["DQMI"], errors="coerce")
    rows = {}
    for code, g in df.groupby("Data Provider Code"):
        if len(code) != 3:
            continue
        overall = g["DQMI_n"].mean()
        weak = sorted(g.loc[g["DQMI_n"] < 60, "Dataset"].dropna().unique().tolist())
        rows[code] = {"dqmi": None if pd.isna(overall) else round(float(overall), 1), "weak": weak}
    return pd.DataFrame.from_dict(rows, orient="index")


# --------------------------------------------------------------------------- SHMI
def load_shmi(input_dir: str):
    """Latest trust-level SHMI value + banding per provider code."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "*trust_level_SHMI*.csv")) or _g.glob(os.path.join(input_dir, "*SHMI_data_at_trust_level*.csv"))
    if not hits:
        return pd.DataFrame(columns=["shmi", "shmi_band"])
    df = pd.read_csv(sorted(hits)[-1], dtype=str, encoding="utf-8-sig")
    df.columns = [c.strip().lstrip("\ufeff") for c in df.columns]
    df["v"] = pd.to_numeric(df["SHMI_VALUE"], errors="coerce")
    if "PUBLICATION_MONTH" in df.columns:
        df = df.sort_values("PUBLICATION_MONTH").groupby("PROVIDER_CODE").tail(1)
    out = {}
    for _, r in df.iterrows():
        c = r["PROVIDER_CODE"]
        if isinstance(c, str) and len(c) == 3:
            out[c] = {"shmi": None if pd.isna(r["v"]) else round(float(r["v"]), 3),
                      "shmi_band": r.get("SHMI_BANDING", "")}
    return pd.DataFrame.from_dict(out, orient="index")


# --------------------------------------------------------------------------- Capital allocations
def load_capital(input_dir: str, name_to_code: dict) -> pd.Series:
    """Provider operational capital (£) per trust code, via name match."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "*capital-allocations*.xlsx"))
    if not hits:
        return pd.Series(dtype=float)
    raw = pd.read_excel(sorted(hits)[-1], sheet_name="Provider Op Cap", header=None, dtype=object)
    hdr = None
    for i in range(min(15, len(raw))):
        cells = [str(c).strip().lower() for c in raw.iloc[i].tolist()]
        if any("provider" in c or "organisation" in c or c == "code" for c in cells) and any(c for c in cells if c not in ("", "none")):
            hdr = i
            break
    if hdr is None:
        return pd.Series(dtype=float)
    df = pd.read_excel(sorted(hits)[-1], sheet_name="Provider Op Cap", header=hdr, dtype=object)
    df.columns = [str(c).strip() for c in df.columns]
    name_col = next((c for c in df.columns if "provider" in c.lower() or "organisation" in c.lower() or "name" in c.lower()), None)
    num_cols = [c for c in df.columns if df[c].apply(lambda v: isinstance(v, (int, float))).sum() > len(df) * 0.5]
    if not name_col or not num_cols:
        return pd.Series(dtype=float)
    val_col = num_cols[-1]  # typically the total / final-year allocation
    df["code"] = df[name_col].map(lambda s: name_to_code.get(normalise_name(s)) if isinstance(s, str) else None)
    df["v"] = pd.to_numeric(df[val_col], errors="coerce")
    return df.dropna(subset=["code"]).groupby("code")["v"].sum()


# --------------------------------------------------------------------------- ODS (authoritative name->code)
def load_ods_name_map(input_dir: str) -> dict:
    """Authoritative normalised-name -> ODS code map from the ODS trust register."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "nhs_trusts.csv"))
    if not hits:
        return {}
    df = pd.read_csv(hits[0], header=None, dtype=str)
    out = {}
    for _, r in df.iterrows():
        code, name = r[0], r[1]
        if isinstance(code, str) and isinstance(name, str):
            out[normalise_name(name)] = code.strip()
    return out


# --------------------------------------------------------------------------- FDP (transformation trigger)
def load_fdp(input_dir: str, name_to_code: dict) -> set:
    """Set of trust codes live on the NHS Federated Data Platform."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "fdp_live_trusts.csv"))
    if not hits:
        return set()
    df = pd.read_csv(hits[0], dtype=str)
    codes = set()
    for _, r in df.iterrows():
        c = r.get("ods_code")
        if not isinstance(c, str) or not c:
            c = name_to_code.get(normalise_name(r.get("trust_name", "")))
        if c:
            codes.add(c)
    return codes


# --------------------------------------------------------------------------- TAC finance (cleaned)
def load_tac_finance(input_dir: str) -> pd.DataFrame:
    """Operating income (£k) and operating margin (%) per trust code, from cleaned TAC summary."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "tac_key_financial_metrics_summary.csv"))
    if not hits:
        return pd.DataFrame(columns=["op_income_k", "op_margin_pct"])
    df = pd.read_csv(hits[0])
    inc = pd.to_numeric(df.get("patient_care_income_cy_k"), errors="coerce").fillna(0) \
        + pd.to_numeric(df.get("other_operating_income_cy_k"), errors="coerce").fillna(0)
    sd = pd.to_numeric(df.get("operating_surplus_deficit_cy_k"), errors="coerce")
    out = pd.DataFrame({"code": df["nhs_code"], "op_income_k": inc,
                        "op_margin_pct": (sd / inc.replace(0, pd.NA) * 100).round(2)})
    out = out[out["op_income_k"] > 0].set_index("code")
    return out[~out.index.duplicated()]


# --------------------------------------------------------------------------- Capital allocation (cleaned)
def load_capital_alloc(input_dir: str) -> pd.Series:
    """Total provider operational capital 2026-30 (£k) per trust code."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "capital_provider_operational_allocations_matched_providers_only.csv"))
    if not hits:
        return pd.Series(dtype=float)
    df = pd.read_csv(hits[0])
    df = df.dropna(subset=["matched_nhs_code"])
    v = pd.to_numeric(df["allocation_total_2026_30_k"], errors="coerce")
    return pd.Series(v.values, index=df["matched_nhs_code"]).groupby(level=0).sum()


# --------------------------------------------------------------------------- FDP (cleaned, with benefits)
def load_fdp_clean(input_dir: str) -> pd.DataFrame:
    """FDP live + benefits-realising flags per trust code."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "fdp_live_organisations_extracted.csv"))
    if not hits:
        return pd.DataFrame(columns=["fdp_live", "fdp_benefits"])
    df = pd.read_csv(hits[0]).dropna(subset=["matched_nhs_code"])
    def tf(s):
        return s.astype(str).str.lower().isin(["true", "yes", "1"])
    df = df.assign(fdp_live=tf(df["fdp_live"]), fdp_benefits=tf(df["fdp_reporting_benefits"]))
    return df.groupby("matched_nhs_code").agg(fdp_live=("fdp_live", "max"), fdp_benefits=("fdp_benefits", "max"))


# --------------------------------------------------------------------------- Q3 in-year finance
def load_q3_finance(input_dir: str) -> pd.DataFrame:
    """In-year (Q3) financial position per trust: variance % of turnover, forecast deficit, DSF."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "financial_performance_q3*positions.csv"))
    if not hits:
        return pd.DataFrame(columns=["ytd_var_pct", "forecast_deficit", "dsf_flag"])
    df = pd.read_csv(hits[0], dtype=str)
    df = df.dropna(subset=["matched_nhs_code"])
    df = df[df["row_type"].astype(str).str.lower().str.contains("provider", na=False)] if "row_type" in df.columns else df
    out = {}
    for _, r in df.iterrows():
        c = r["matched_nhs_code"]
        if not isinstance(c, str) or len(c) != 3:
            continue
        var = pd.to_numeric(r.get("var_pct_of_turnover_num"), errors="coerce")
        fc = pd.to_numeric(r.get("forecast_outturn_exc_dsf_m_num"), errors="coerce")
        out[c] = {"ytd_var_pct": None if pd.isna(var) else round(float(var), 2),
                  "forecast_deficit": bool(fc < 0) if pd.notna(fc) else None,
                  "dsf_flag": str(r.get("forecasting_receipt_of_dsf", "")).strip().lower() == "yes"}
    return pd.DataFrame.from_dict(out, orient="index")


# --------------------------------------------------------------------------- Discharge (flow)
def load_discharge(input_dir: str) -> pd.Series:
    """Latest 'no longer meeting criteria to reside' (NCTR) proportion per trust — a flow-pressure proxy."""
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "Discharge-Ready-Date*.csv"))
    if not hits:
        return pd.Series(dtype=float)
    df = pd.read_csv(hits[0], dtype=str)
    df = df[df["Code"].str.match(r"^R\w\w$", na=False)]
    measures = df["Measure"].dropna().unique()
    pick = next((m for m in measures if m.strip().lower().startswith("% of patients discharged where") and "no delay" in m.lower()), None)
    if pick is None:
        return pd.Series(dtype=float)
    sub = df[df["Measure"] == pick].copy()
    v = pd.to_numeric(sub["Value"], errors="coerce")
    sub["v"] = (100 - v) if v.max() > 1.5 else (1 - v) * 100   # convert "% no delay" -> % delayed
    if "Date" in sub.columns:
        sub = sub.sort_values("Date").groupby("Code").tail(1)
    return pd.Series(sub["v"].values, index=sub["Code"]).groupby(level=0).mean()


# --------------------------------------------------------------------------- CQC (from pre-extracted CSV)
def load_cqc(input_dir: str) -> pd.DataFrame:
    """Trust-level CQC overall + well-led rating (pre-extracted from the CQC ratings ODS).

    The raw CQC ratings file is a ~1 GB-when-unzipped ODS; it is streamed once into
    cqc_ratings_extracted.csv (see scripts/extract_cqc.py) which this loader reads.
    """
    import glob as _g
    hits = _g.glob(os.path.join(input_dir, "cqc_ratings_extracted.csv"))
    if not hits:
        return pd.DataFrame(columns=["cqc_overall", "cqc_well_led", "cqc_below_good"])
    df = pd.read_csv(hits[0], dtype=str).dropna(subset=["trust_code"]).set_index("trust_code")
    df["cqc_below_good"] = df["cqc_overall"].isin(["Requires improvement", "Inadequate"])
    return df[["cqc_overall", "cqc_well_led", "cqc_below_good"]]
