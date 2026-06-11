"""
Catchment bridge (modelled, site-based).

Builds a trust -> LSOA assignment from NHS site postcodes and the ONS Postcode
Directory (NSPL), then aggregates Census 2021 to a per-trust catchment.

Method (method_version = nearest-site-v1):
  1. NSPL gives every live English postcode an LSOA (2021) and a grid reference.
  2. Each LSOA centroid = mean grid reference of its postcodes.
  3. Each acute trust's sites are geocoded via their postcodes.
  4. Every LSOA is assigned to the trust owning the *nearest site* (a Voronoi /
     nearest-neighbour catchment over OS grid coordinates).
  5. Census age (TS007a) and ethnicity (TS021) are summed over each trust's LSOAs.

Honest limitations
  - This is a geographic proxy, not patient-flow. A true catchment needs patient-
    origin data (SUS/HES by LSOA). Specialist trusts (orthopaedic, neuro, eye) are
    understated here because their real catchment is referral-based and national.
  - Deprivation is not included (needs IMD 2025, a separate file).

Validation: total assigned population reconciles to England 2021 (~56.5m).

Usage:
    python -m nhs_targeting_transform.catchment \
        --nspl /path/NSPL_MAY_2025_UK.zip --sites /path/nhs-trust_sites.csv \
        --census /path/bronze --input /path/bronze --out ./gold
"""
from __future__ import annotations
import argparse
import io
import os
import zipfile
import numpy as np
import pandas as pd

from . import loaders as L


def _stream_nspl(nspl_path: str, site_postcodes: set):
    """One pass over NSPL: LSOA centroids + coords for the wanted site postcodes."""
    opener = (lambda: zipfile.ZipFile(nspl_path).open(
        [n for n in zipfile.ZipFile(nspl_path).namelist() if n.lower().endswith(".csv")][0])) \
        if nspl_path.lower().endswith(".zip") else (lambda: open(nspl_path, "rb"))
    cols = ["pcds", "lsoa21", "oseast1m", "osnrth1m", "ctry", "doterm"]
    se, sn, ct = {}, {}, {}
    site_xy = {}
    with opener() as fh:
        reader = pd.read_csv(io.TextIOWrapper(fh, encoding="utf-8", errors="replace"),
                             usecols=cols, dtype=str, chunksize=300000)
        for chunk in reader:
            c = chunk[(chunk["ctry"] == "E92000001") & (chunk["doterm"].isna())]
            c = c[c["oseast1m"].notna() & c["lsoa21"].str.startswith("E0", na=False)]
            e = pd.to_numeric(c["oseast1m"], errors="coerce")
            n = pd.to_numeric(c["osnrth1m"], errors="coerce")
            g = pd.DataFrame({"lsoa": c["lsoa21"].values, "e": e.values, "n": n.values}).dropna()
            agg = g.groupby("lsoa").agg(se=("e", "sum"), sn=("n", "sum"), ct=("e", "size"))
            for ls, r in agg.iterrows():
                se[ls] = se.get(ls, 0) + r.se
                sn[ls] = sn.get(ls, 0) + r.sn
                ct[ls] = ct.get(ls, 0) + r.ct
            pk = c["pcds"].str.upper().str.replace(" ", "", regex=False)
            for _, rr in c[pk.isin(site_postcodes)].iterrows():
                try:
                    site_xy[rr["pcds"].upper().replace(" ", "")] = (float(rr["oseast1m"]), float(rr["osnrth1m"]))
                except (TypeError, ValueError):
                    continue
    keys = list(ct.keys())
    centroids = np.array([[se[k] / ct[k], sn[k] / ct[k]] for k in keys])
    return keys, centroids, site_xy


def build_catchment(nspl_path, sites_path, census_dir, acute_codes):
    from scipy.spatial import cKDTree
    sites = pd.read_csv(sites_path, header=None, dtype=str)[[9, 14]].rename(columns={9: "pc", 14: "parent"})
    sites = sites[sites["parent"].isin(acute_codes) & sites["pc"].notna()].copy()
    sites["pckey"] = sites["pc"].str.upper().str.replace(" ", "", regex=False)
    pc_to_trust = dict(zip(sites["pckey"], sites["parent"]))

    keys, centroids, site_xy = _stream_nspl(nspl_path, set(pc_to_trust))
    pts, labs = [], []
    for pck, xy in site_xy.items():
        pts.append(xy)
        labs.append(pc_to_trust[pck])
    pts, labs = np.array(pts), np.array(labs)
    _, idx = cKDTree(pts).query(centroids, k=1)
    bridge = pd.DataFrame({"lsoa_code": keys, "trust_code": labs[idx]})
    bridge["method_version"] = "nearest-site-v1"
    lsoa_trust = dict(zip(bridge["lsoa_code"], bridge["trust_code"]))

    age = pd.read_csv(os.path.join(census_dir, "census2021-ts007a-lsoa.csv"))
    age["trust"] = age["geography code"].map(lsoa_trust)
    age = age.dropna(subset=["trust"])
    old = [c for c in age.columns if c.startswith("Age: Aged") and
           any(b in c for b in ["65 to 69", "70 to 74", "75 to 79", "80 to 84", "85 to 89", "90 years"])]
    age["pop65"] = age[old].sum(axis=1)
    pop = age.groupby("trust").agg(catch_pop=("Age: Total", "sum"), pop65=("pop65", "sum"),
                                   lsoas=("Age: Total", "size"))
    pop["age65pct"] = (pop["pop65"] / pop["catch_pop"] * 100).round(1)

    eth = pd.read_csv(os.path.join(census_dir, "census2021-ts021-lsoa.csv"))
    eth["trust"] = eth["geography code"].map(lsoa_trust)
    eth = eth.dropna(subset=["trust"])
    tot = [c for c in eth.columns if "Total" in c][0]
    white = [c for c in eth.columns if c.strip().endswith(": White") or "group: White" in c][0]
    eg = eth.groupby("trust").agg(tot=(tot, "sum"), white=(white, "sum"))
    eg["minoritypct"] = ((eg["tot"] - eg["white"]) / eg["tot"] * 100).round(1)

    summary = pop.join(eg["minoritypct"]).reset_index().rename(columns={"trust": "trust_code"})
    return bridge, summary


def main(argv=None):
    p = argparse.ArgumentParser(description="Build the modelled site-based catchment bridge.")
    p.add_argument("--nspl", required=True, help="NSPL zip or csv (ONS Postcode Directory).")
    p.add_argument("--sites", required=True, help="nhs-trust_sites.csv (ODS sites).")
    p.add_argument("--census", required=True, help="Directory with census2021-ts*-lsoa.csv files.")
    p.add_argument("--input", required=True, help="Directory with the NOF acute file (trust universe).")
    p.add_argument("--out", default="./gold")
    args = p.parse_args(argv)
    nof, _ = L.load_nof(args.input)
    acute = set(L.nof_trust_dim(nof)["Trust_code"])
    bridge, summary = build_catchment(args.nspl, args.sites, args.census, acute)
    os.makedirs(args.out, exist_ok=True)
    bridge.to_csv(os.path.join(args.out, "catchment_bridge.csv"), index=False)
    summary.to_csv(os.path.join(args.out, "catchment_summary.csv"), index=False)
    print(f"LSOAs assigned: {len(bridge)} | trusts: {summary['trust_code'].nunique()}")
    print(f"Total catchment population: {int(summary['catch_pop'].sum()):,} (England 2021 ≈ 56.5m)")


if __name__ == "__main__":
    main()
