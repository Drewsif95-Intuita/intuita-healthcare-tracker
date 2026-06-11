"""
Source registry for the NHS sales-targeting ingestion pipeline.

This is the machine-readable version of 02_Data_Sources_Register.md. Each entry
describes WHERE the data lives (landing page / API) and HOW to collect it, but not
the exact monthly file URL — per the register's rule 1, the pipeline treats landing
pages as canonical and discovers the latest file at run time.

Collection methods
------------------
- html_discover : GET the landing page, find the latest matching file link, download it.
- direct        : the configured URL is itself the file to download.
- ocds_api      : query an OCDS procurement API (Find a Tender / Contracts Finder).
- cqc_api       : query the CQC API (requires a subscription key).
- manual_bridge : no clean trust-code feed; snapshot the page for evidence and flag
                  that a curated bridge table must be maintained by hand.

`link_keywords` / `file_exts` are first-run-tunable hints for html_discover: on the
first real run, use `--probe` to confirm the resolved URL and adjust these if needed.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass(frozen=True)
class Source:
    key: str                      # short stable id, used in paths and the CLI
    name: str
    publisher: str
    pillar: str
    cadence: str
    ease: str                     # A / B / C / D from the register
    method: str                   # html_discover | direct | ocds_api | cqc_api | manual_bridge
    landing_page: str
    v1: bool                      # part of the suggested v1 spine
    file_exts: List[str] = field(default_factory=lambda: [".csv", ".xlsx", ".xls", ".zip"])
    link_keywords: List[str] = field(default_factory=list)   # substrings to match in link text/href
    notes: str = ""


# Order roughly follows the register; v1 spine first for convenience.
REGISTRY: List[Source] = [
    # ---- Foundation -------------------------------------------------------
    Source(
        key="ods", name="ODS organisation reference (trusts & sites)",
        publisher="NHS England Digital", pillar="Foundation",
        cadence="Nightly / on demand", ease="A", method="html_discover",
        landing_page="https://digital.nhs.uk/services/organisation-data-service/data-search-and-export/csv-downloads/other-nhs-organisations",
        v1=True, file_exts=[".csv", ".zip"],
        link_keywords=["trust", "etr", "ets", "succ", "organisation"],
        notes="Golden key. Store original AND current mapped ODS codes for historical trends. "
              "ORD API (https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations) is an alternative.",
    ),
    # ---- Operational pain (v1) -------------------------------------------
    Source(
        key="nof", name="NHS Oversight Framework (segmentation & league tables)",
        publisher="NHS England", pillar="Operational pain / buying constraint",
        cadence="Quarterly", ease="B", method="html_discover",
        landing_page="https://www.england.nhs.uk/nhs-oversight-framework/segmentation-and-league-tables/",
        v1=True, link_keywords=["segment", "league", "oversight", "csv"],
        notes="Core spine but not the only targeting source. Score within trust type.",
    ),
    Source(
        key="acute_provider_table", name="Acute Provider Table",
        publisher="NHS England", pillar="Operational pain",
        cadence="Monthly", ease="B", method="html_discover",
        landing_page="https://www.england.nhs.uk/statistics/statistical-work-areas/acute-provider-table/",
        v1=True, link_keywords=["acute", "provider", "table", "time series", "timeseries"],
        notes="Convenience layer for the front page; keep underlying A&E/RTT/cancer/diagnostics for audit.",
    ),
    Source(
        key="ae", name="A&E Attendances and Emergency Admissions",
        publisher="NHS England", pillar="Operational pain",
        cadence="Monthly", ease="B", method="html_discover",
        landing_page="https://www.england.nhs.uk/statistics/statistical-work-areas/ae-waiting-times-and-activity/",
        v1=True, link_keywords=["a&e", "ae", "attendance", "monthly", "provider"],
        notes="From Apr 2026 A&E 4-hour perf in the acute provider table uses acute trust footprint; "
              "maintain a mapping layer.",
    ),
    Source(
        key="rtt", name="Consultant-led Referral to Treatment (RTT) waiting times",
        publisher="NHS England", pillar="Operational pain",
        cadence="Monthly", ease="B", method="html_discover",
        landing_page="https://www.england.nhs.uk/statistics/statistical-work-areas/rtt-waiting-times/",
        v1=True, file_exts=[".zip", ".csv", ".xlsx", ".xls"],
        link_keywords=["rtt", "full", "provider", "csv", "zip"],
        notes="Files are revised periodically; keep raw snapshots + publication month + a revision flag.",
    ),
    Source(
        key="diagnostics", name="Monthly Diagnostics Waiting Times & Activity (DM01)",
        publisher="NHS England", pillar="Operational pain",
        cadence="Monthly", ease="B", method="html_discover",
        landing_page="https://www.england.nhs.uk/statistics/statistical-work-areas/diagnostics-waiting-times-and-activity/",
        v1=True, link_keywords=["diagnostic", "dm01", "provider", "monthly"],
        notes="Store test/modality dimension; trust/provider monthly grain.",
    ),
    Source(
        key="cancer", name="Cancer Waiting Times",
        publisher="NHS England", pillar="Operational pain",
        cadence="Monthly / quarterly", ease="B", method="html_discover",
        landing_page="https://www.england.nhs.uk/statistics/statistical-work-areas/cancer-waiting-times/",
        v1=True, link_keywords=["cancer", "cwt", "provider", "monthly"],
        notes="Handle standards changes explicitly; do NOT draw naive long trends across definition changes.",
    ),
    Source(
        key="dqmi", name="Data Quality Maturity Index (DQMI)",
        publisher="NHS England Digital", pillar="Data quality / operational pain",
        cadence="Monthly", ease="B", method="html_discover",
        landing_page="https://digital.nhs.uk/data-and-information/data-tools-and-services/data-services/data-quality",
        v1=True, link_keywords=["dqmi", "data quality", "maturity"],
        notes="Direct evidence for validation / submissions-assurance sales plays.",
    ),
    # ---- Buying capacity (v1) --------------------------------------------
    Source(
        key="tac", name="Trust Accounts Consolidation (TAC) annual accounts",
        publisher="NHS England", pillar="Buying capacity",
        cadence="Annual", ease="B", method="html_discover",
        landing_page="https://www.england.nhs.uk/financial-accounting-and-reporting/nhs-providers-tac-data-publications/",
        v1=True, file_exts=[".xlsx", ".xls", ".csv", ".zip"],
        link_keywords=["tac", "trust", "foundation", "consolidation", "data"],
        notes="Trust-level comparison and scale/headroom; not for in-year monthly performance.",
    ),
    Source(
        key="eric", name="ERIC estates returns",
        publisher="NHS England Digital", pillar="Buying capacity / transformation trigger",
        cadence="Annual", ease="B", method="html_discover",
        landing_page="https://digital.nhs.uk/data-and-information/publications/statistical/estates-returns-information-collection",
        v1=True, file_exts=[".csv", ".xlsx", ".zip"],
        link_keywords=["eric", "estates", "data"],
        notes="Wide dataset; build a metric catalogue and treat some fields as caveated/experimental.",
    ),
    # ---- Transformation trigger (v1) -------------------------------------
    Source(
        key="cqc", name="CQC care directory with ratings",
        publisher="Care Quality Commission", pillar="Transformation trigger / quality pressure",
        cadence="Monthly file (API optional)", ease="B", method="html_discover",
        landing_page="https://www.cqc.org.uk/about-us/transparency/using-cqc-data",
        v1=True, file_exts=[".csv", ".xlsx", ".zip"],
        link_keywords=["care directory", "ratings", "directory", "providers", "locations"],
        notes="KEYLESS by default: downloads the monthly 'care directory with ratings' file. "
              "The authenticated daily API (set method='cqc_api', needs CQC_API_KEY) is an optional "
              "freshness upgrade. Link locations to trusts carefully.",
    ),
    Source(
        key="dma", name="Digital Maturity Assessment results",
        publisher="NHS England Digital", pillar="Transformation trigger",
        cadence="Annual", ease="B", method="html_discover",
        landing_page="https://digital.nhs.uk/data-and-information/digital-maturity-assessment-report-2024-and-2025-results/report",
        v1=True, file_exts=[".csv", ".xlsx"],
        link_keywords=["dma", "digital maturity", "results", "data"],
        notes="Integrated trusts may have multiple care-setting entries; compare within care setting.",
    ),
    Source(
        key="nhp", name="New Hospital Programme & RAAC scheme list",
        publisher="GOV.UK / DHSC", pillar="Transformation trigger / buying capacity",
        cadence="Ad hoc", ease="C/D", method="manual_bridge",
        landing_page="https://www.gov.uk/government/publications/new-hospital-programme-review-outcome/new-hospital-programme-plan-for-implementation",
        v1=True,
        notes="NOT a clean trust-code feed. Snapshot the page for evidence; maintain a curated "
              "scheme->ODS bridge (see bridges/nhp_scheme_bridge_template.csv).",
    ),
    # ---- Buyer openness (v1) ---------------------------------------------
    Source(
        key="find_a_tender", name="Find a Tender (OCDS API)",
        publisher="Cabinet Office / GOV.UK", pillar="Buyer openness",
        cadence="Near-real-time / weekly", ease="B/C", method="ocds_api",
        landing_page="https://www.find-tender.service.gov.uk/Developer/Documentation",
        v1=True,
        notes="OCDS API + keyword search. Buyer->trust matching needs an alias table + confidence "
              "(see bridges/buyer_alias_template.csv).",
    ),
    Source(
        key="contracts_finder", name="Contracts Finder (V2 API)",
        publisher="Cabinet Office / GOV.UK", pillar="Buyer openness",
        cadence="Near-real-time / weekly", ease="B/C", method="ocds_api",
        landing_page="https://www.contractsfinder.service.gov.uk/apidocumentation/V2",
        v1=True,
        notes="Lower-value notices, awards, renewals. Same NHS buyer aliasing + de-duplication.",
    ),
    # ---- Enrichment / context (post-v1) ----------------------------------
    Source(
        key="wlmds", name="Waiting List Minimum Data Set (WLMDS)",
        publisher="NHS England", pillar="Operational pain / inequality",
        cadence="Weekly data, monthly publish", ease="B/C", method="html_discover",
        landing_page="https://www.england.nhs.uk/statistics/statistical-work-areas/rtt-waiting-times/wlmds/",
        v1=False, link_keywords=["wlmds", "waiting list", "demographic"],
        notes="Management information, not headline RTT. Use as trend/enrichment.",
    ),
    Source(
        key="discharge_ready_date", name="Discharge Ready Date",
        publisher="NHS England", pillar="Operational pain",
        cadence="Monthly", ease="B/C", method="html_discover",
        landing_page="https://www.england.nhs.uk/statistics/statistical-work-areas/discharge-delays/discharge-ready-date/",
        v1=False, link_keywords=["discharge", "ready date", "provider"],
        notes="Surface quality caveats / acceptable-data filters in the model.",
    ),
    Source(
        key="capital_allocations", name="Provider & ICB capital allocations",
        publisher="NHS England", pillar="Buying capacity / transformation trigger",
        cadence="Annual / multi-year", ease="B/C", method="html_discover",
        landing_page="https://www.england.nhs.uk/publication/",
        v1=False, file_exts=[".xlsx", ".csv"],
        link_keywords=["capital", "allocation", "planning"],
        notes="Check year labels carefully; bridge provider names to ODS.",
    ),
    Source(
        key="fdp", name="NHS Federated Data Platform uptake & benefits",
        publisher="NHS England", pillar="Transformation trigger",
        cadence="Quarterly", ease="B/C", method="html_discover",
        landing_page="https://www.england.nhs.uk/digitaltechnology/nhs-federated-data-platform/impact/fdp-uptake-and-benefits/",
        v1=False, link_keywords=["fdp", "uptake", "benefit", "trust"],
        notes="Often embedded in HTML/lists; store snapshot dates. May need HTML table parsing.",
    ),
    Source(
        key="dspt", name="Data Security & Protection Toolkit status",
        publisher="DSP Toolkit", pillar="Transformation trigger / governance",
        cadence="Annual self-assessment", ease="C", method="manual_bridge",
        landing_page="https://www.dsptoolkit.nhs.uk/OrganisationSearch",
        v1=False,
        notes="Public search; automation needs an export workflow or a controlled scrape.",
    ),
    Source(
        key="staff_survey", name="NHS Staff Survey local benchmark data",
        publisher="NHS Staff Survey / NHS England", pillar="Operational pain / readiness",
        cadence="Annual", ease="B", method="html_discover",
        landing_page="https://www.nhsstaffsurveys.com/results/local-results/",
        v1=False, link_keywords=["benchmark", "local", "results"],
        notes="Narrative only; do not over-weight as a direct buying signal.",
    ),
    Source(
        key="shmi", name="Summary Hospital-level Mortality Indicator (SHMI)",
        publisher="NHS England Digital", pillar="Operational pain / quality",
        cadence="Monthly", ease="B", method="html_discover",
        landing_page="https://digital.nhs.uk/data-and-information/publications/statistical/shmi",
        v1=False, link_keywords=["shmi", "mortality", "data"],
        notes="Rolling 12-month indicator; cite methodology.",
    ),
    Source(
        key="hcai", name="Healthcare-associated infections monthly data",
        publisher="UKHSA / GOV.UK", pillar="Operational pain / quality",
        cadence="Monthly", ease="B", method="html_discover",
        landing_page="https://www.gov.uk/government/collections/healthcare-associated-infections-hcai-guidance-data-and-analysis",
        v1=False, link_keywords=["hcai", "infection", "monthly", "data"],
        notes="Definitions vary by infection type.",
    ),
    Source(
        key="lfpse", name="Patient safety data / LFPSE",
        publisher="NHS England", pillar="Operational pain / data quality",
        cadence="Quarterly", ease="B", method="html_discover",
        landing_page="https://www.england.nhs.uk/statistics/statistical-work-areas/patient-safety-data/",
        v1=False, link_keywords=["patient safety", "lfpse", "data"],
        notes="Use recording lag / reporting patterns as data-maturity indicators, not harm measures.",
    ),
    Source(
        key="imd", name="English Indices of Deprivation 2025",
        publisher="GOV.UK / MHCLG", pillar="Population complexity",
        cadence="Periodic", ease="A/B", method="html_discover",
        landing_page="https://www.gov.uk/government/statistics/english-indices-of-deprivation-2025",
        v1=False, file_exts=[".csv", ".xlsx"],
        link_keywords=["imd", "indices", "deprivation", "lsoa", "file 1", "v2"],
        notes="Use v2 corrected files. Needs an LSOA->trust catchment bridge.",
    ),
    Source(
        key="ons_pop", name="ONS LSOA mid-year population estimates",
        publisher="ONS", pillar="Population complexity",
        cadence="Annual / revised", ease="B", method="html_discover",
        landing_page="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/lowersuperoutputareamidyearpopulationestimates",
        v1=False, file_exts=[".xlsx", ".zip"],
        link_keywords=["lsoa", "mid-year", "population", "estimate"],
        notes="Large files; ingest once per release, store as parquet downstream. Join via LSOA catchment bridge.",
    ),
]

BY_KEY = {s.key: s for s in REGISTRY}
V1_KEYS = [s.key for s in REGISTRY if s.v1]
