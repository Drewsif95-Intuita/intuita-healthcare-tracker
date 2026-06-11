"""
Extract trust-level CQC ratings from the CQC ratings ODS.

The CQC ratings file is an OpenDocument Spreadsheet whose content.xml is ~1 GB
uncompressed — far too large for odfpy to load into memory. This streams it with
ElementTree.iterparse (clearing each row), keeps only NHS-trust providers, and
writes a small `cqc_ratings_extracted.csv` of trust-level Overall + Well-led ratings
that the main pipeline's `loaders.load_cqc` reads.

Usage:
    python -m nhs_targeting_transform.cqc_extract --ods cqc_ratings.ods --out ./gold
"""
from __future__ import annotations
import argparse
import os
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter
import pandas as pd

TABLE = "{urn:oasis:names:tc:opendocument:xmlns:table:1.0}"
TEXT = "{urn:oasis:names:tc:opendocument:xmlns:text:1.0}"
# column indices in the CQC ratings ODS (long format: one row per location x domain)
DOM, RAT, PUB, ODS, PROV = 18, 19, 20, 24, 25


def extract(ods_path: str) -> pd.DataFrame:
    z = zipfile.ZipFile(ods_path)
    data = defaultdict(lambda: {"Overall": Counter(), "Well-led": Counter(), "pub": []})
    header_seen = False
    with z.open("content.xml") as f:
        for _ev, el in ET.iterparse(f, events=("end",)):
            if el.tag != TABLE + "table-row":
                continue
            cells = []
            for c in el.findall(TABLE + "table-cell"):
                rep = min(int(c.get(TABLE + "number-columns-repeated", "1")), 50)
                cells.extend(["".join(t.text or "" for t in c.iter(TEXT + "p")).strip()] * rep)
                if len(cells) > 30:
                    break
            if len(cells) > PROV:
                if not header_seen and cells[DOM] == "Domain":
                    header_seen = True
                elif header_seen:
                    ods, pn, dom, rat = cells[ODS].strip(), cells[PROV].upper(), cells[DOM], cells[RAT].strip()
                    if len(ods) == 3 and "NHS" in pn and ("TRUST" in pn or "FOUNDATION" in pn) and rat:
                        if dom in ("Overall", "Well-led"):
                            data[ods][dom][rat] += 1
                        if dom == "Overall" and cells[PUB]:
                            data[ods]["pub"].append(cells[PUB])
            el.clear()
    rows = []
    for ods, d in data.items():
        rows.append({
            "trust_code": ods,
            "cqc_overall": d["Overall"].most_common(1)[0][0] if d["Overall"] else "",
            "cqc_well_led": d["Well-led"].most_common(1)[0][0] if d["Well-led"] else "",
            "cqc_latest_pub": sorted(d["pub"])[-1] if d["pub"] else "",
        })
    return pd.DataFrame(rows)


def main(argv=None):
    p = argparse.ArgumentParser(description="Stream the CQC ratings ODS to a trust-level CSV.")
    p.add_argument("--ods", required=True, help="cqc_ratings.ods (raw CQC ratings export).")
    p.add_argument("--out", default="./gold")
    args = p.parse_args(argv)
    df = extract(args.ods)
    os.makedirs(args.out, exist_ok=True)
    path = os.path.join(args.out, "cqc_ratings_extracted.csv")
    df.to_csv(path, index=False)
    print(f"Extracted {len(df)} NHS-trust providers -> {path}")
    print("Overall distribution:", df["cqc_overall"].value_counts().to_dict())


if __name__ == "__main__":
    main()
