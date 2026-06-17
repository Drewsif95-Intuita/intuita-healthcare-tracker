# data/ — source inputs

Put the source files to be scored in this folder. **Contents are gitignored** (size + Open
Government Licence data is better linked than re-hosted), so this folder is usually empty in the
repo except for this README.

The pipeline finds files by **glob pattern**, not exact filename — so a file just has to *match*
the pattern (e.g. any file containing `acute-provider-timeseries` and ending `.csv`). The exact
patterns, the loader that reads each, where to download it, and how often it changes are all in
[`../REFRESH.md`](../REFRESH.md). The full field-level mapping is in
[`../docs/METHODOLOGY.md`](../docs/METHODOLOGY.md) Appendix A.

Quick list of what to drop here for a full build:

```
*oversight-framework-acute*.csv            NHS Oversight Framework (universe, finance, productivity, distress)
*acute-provider-timeseries*.csv            Acute Provider Table (operational pain + trend)
tac_key_financial_metrics_summary.csv      TAC finance (income + margin)         [pre-cleaned]
capital_*matched_providers_only.csv        Capital allocations                    [pre-cleaned]
*Digital*Maturity*Results*Data*File*.xlsx  Digital Maturity Assessment
*Beds-Open-Overnight*.xlsx                 Beds (scale fallback)
DQMI_*.csv                                 Data Quality Maturity Index
*trust_level_SHMI*.csv                     SHMI (mortality)
cqc_ratings.ods                            CQC ratings (extracted in-repo by cqc_extract.py)
fdp_live_organisations_extracted.csv       FDP live + benefits                    [pre-cleaned]
financial_performance_q3*positions.csv     Q3 in-year finance                     [pre-cleaned]
nhs_trusts.csv                             ODS trusts (the name -> code join key)
nhs-trust_sites.csv                        ODS trust sites (catchment)
NSPL_*.zip                                 ONS postcode directory (catchment)
census2021-ts007a-lsoa.csv                 Census 2021 age (catchment)
census2021-ts021-lsoa.csv                  Census 2021 ethnicity (catchment)
File_5_IoD2025_Scores*.xlsx                Index of Deprivation 2025 (catchment)
```

`[pre-cleaned]` files arrive already tidied (with a `matched_nhs_code` column) from a step that is
not in this repo — see the warning in `../REFRESH.md`.
