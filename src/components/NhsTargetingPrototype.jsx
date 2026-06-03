import React, { useState, useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, ReferenceLine,
  ReferenceArea, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, LabelList,
} from "recharts";
import {
  LayoutGrid, ListOrdered, Building2, Activity, Wallet, Cpu, Search,
  TrendingDown, TrendingUp, Minus, Zap, AlertTriangle, Target, ChevronRight,
  MapPin, FileText, Stethoscope, ArrowUpRight, Info,
  Database, ExternalLink, ShieldCheck, ScrollText, Layers,
  PoundSterling, ShoppingCart, Globe2, Gauge, Network,
} from "lucide-react";

/* ============================================================================
   INTUITA BRAND
   purple #4A1A8A · mid #6B3FA0 · bright #B30FE2 · dark grey #333333 · bg #F2F0F5
============================================================================ */
const C = {
  purple: "#4A1A8A", mid: "#6B3FA0", bright: "#B30FE2",
  ink: "#333333", bg: "#F2F0F5", paper: "#FFFFFF",
  // band colours
  bandA: "#4A1A8A", bandB: "#6B3FA0", bandC: "#B084D6", bandD: "#C9C3D6",
  // semantic
  good: "#1F9E7A", warn: "#E0992A", bad: "#D1495B",
  line: "#E6E1EE", muted: "#8A8395",
};

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');`;

/* ============================================================================
   SYNTHETIC DATA  — illustrative only, fictional trusts, embedded stories
   Each trust scored on the four pillars (0–100). Stories baked in:
   - Northgate: textbook A-band (high pain + funded + active EPR trigger)
   - Calderfield: high pain BUT severe distress → held out of A despite pain
   - St Aldwyn's: well-funded, low pain → C/D (buyable but no reason to buy)
   - Pennine Vale: NHP/RAAC capital trigger drives digital score
   - Wessex Bay: data-quality lead, DQMI weak
============================================================================ */
const WEIGHTS = { budget: 0.30, pain: 0.35, digital: 0.20, buyer: 0.15 };

function score(t) {
  const raw =
    WEIGHTS.budget * t.budget + WEIGHTS.pain * t.pain +
    WEIGHTS.digital * t.digital + WEIGHTS.buyer * t.buyer;
  return Math.round((raw - (t.distress ? 8 : 0)) * 10) / 10;
}
function band(s, distress) {
  if (distress && s < 70) return "C";
  if (s >= 72) return "A";
  if (s >= 62) return "B";
  if (s >= 52) return "C";
  return "D";
}

/* Extended per-trust detail for the deeper pages — derived to stay consistent
   with each trust's story (digital, capital, governance, buyer, catchment). */
const DETAIL = {
  RNG: { dma: 87, dmaChg: 6, epr: "Optimising (post go-live)", fdp: "Live", nhp: "—", eric: 41, capAlloc: 78, dspt: "Standards Met", cqcAge: 8, miss: 0, pop: 640, imd: 3, age65: 17, eth: 34, rural: 5, board: "EPR benefits-realisation plan in board papers", route: "HSSF", crm: "Warm — CIO contact" },
  RWV: { dma: 57, dmaChg: 2, epr: "Live (stable)", fdp: "Signed", nhp: "—", eric: 33, capAlloc: 30, dspt: "Approaching Standards", cqcAge: 14, miss: 3, pop: 360, imd: 6, age65: 24, eth: 9, rural: 38, board: "Data-quality improvement plan referenced", route: "—", crm: "Cold" },
  RCF: { dma: 62, dmaChg: -3, epr: "Procuring", fdp: "—", nhp: "RAAC remediation", eric: 86, capAlloc: 22, dspt: "Not Met", cqcAge: 4, miss: 5, pop: 410, imd: 2, age65: 19, eth: 22, rural: 11, board: "CQC recovery / improvement plan", route: "—", crm: "Cold — under scrutiny" },
  RAL: { dma: 55, dmaChg: 1, epr: "Live (stable)", fdp: "Signed", nhp: "—", eric: 24, capAlloc: 47, dspt: "Standards Met", cqcAge: 18, miss: 0, pop: 520, imd: 8, age65: 21, eth: 14, rural: 22, board: "—", route: "Known framework", crm: "Warm but no live need" },
  RPV: { dma: 90, dmaChg: 4, epr: "Live (advanced)", fdp: "Live", nhp: "Wave + RAAC", eric: 79, capAlloc: 92, dspt: "Standards Met", cqcAge: 10, miss: 1, pop: 480, imd: 4, age65: 20, eth: 18, rural: 14, board: "New Hospital Programme PMO mobilising", route: "HSSF / NHP route", crm: "Warm — programme director" },
  RME: { dma: 60, dmaChg: 0, epr: "Procuring", fdp: "Signed", nhp: "—", eric: 36, capAlloc: 33, dspt: "Approaching Standards", cqcAge: 12, miss: 2, pop: 430, imd: 5, age65: 26, eth: 11, rural: 31, board: "Cancer-pathway recovery plan", route: "—", crm: "Cold" },
  RHB: { dma: 73, dmaChg: 3, epr: "Live (stable)", fdp: "Live", nhp: "—", eric: 44, capAlloc: 52, dspt: "Standards Met", cqcAge: 9, miss: 0, pop: 700, imd: 4, age65: 18, eth: 28, rural: 9, board: "Productivity & efficiency programme", route: "HSSF", crm: "Warm — active tender" },
  RKD: { dma: 70, dmaChg: 2, epr: "Live (stable)", fdp: "Signed", nhp: "—", eric: 58, capAlloc: 58, dspt: "Standards Met", cqcAge: 11, miss: 1, pop: 820, imd: 3, age65: 22, eth: 12, rural: 16, board: "UEC recovery plan", route: "HSSF", crm: "Lukewarm" },
  RTQ: { dma: 49, dmaChg: 1, epr: "Legacy / planning", fdp: "—", nhp: "—", eric: 28, capAlloc: 22, dspt: "Approaching Standards", cqcAge: 16, miss: 2, pop: 250, imd: 7, age65: 28, eth: 6, rural: 52, board: "—", route: "—", crm: "Cold" },
  RBX: { dma: 84, dmaChg: 5, epr: "Optimising", fdp: "Live", nhp: "—", eric: 71, capAlloc: 79, dspt: "Standards Met", cqcAge: 8, miss: 0, pop: 980, imd: 4, age65: 14, eth: 46, rural: 2, board: "Data-platform tender live", route: "HSSF / Find a Tender", crm: "Warm — multiple contacts" },
  RLV: { dma: 46, dmaChg: -1, epr: "Legacy / planning", fdp: "—", nhp: "—", eric: 18, capAlloc: 18, dspt: "Not Met", cqcAge: 20, miss: 3, pop: 230, imd: 6, age65: 23, eth: 13, rural: 28, board: "—", route: "—", crm: "Cold" },
  RSF: { dma: 67, dmaChg: 2, epr: "Live (stable)", fdp: "Signed", nhp: "—", eric: 41, capAlloc: 41, dspt: "Standards Met", cqcAge: 13, miss: 1, pop: 520, imd: 6, age65: 22, eth: 16, rural: 24, board: "Workforce & change programme", route: "Known framework", crm: "Lukewarm" },
};

/* Confidence layer (kept SEPARATE from the target score) + weak-dataset detail.
   conf reasons describe why confidence is High/Medium/Low for that record. */
const CONF = {
  RNG: { lvl: "High", why: "CQC current, finance current, live procurement confirmed; EPR status curated" },
  RWV: { lvl: "Medium", why: "Operational data current; CQC ageing; no procurement signal to corroborate buyer intent" },
  RCF: { lvl: "High", why: "CQC very recent, finance current; distress signals well-evidenced" },
  RAL: { lvl: "Low", why: "CQC 18mo old; no procurement; buyer intent largely inferred" },
  RPV: { lvl: "High", why: "NHP scheme confirmed public; capital and procurement corroborated" },
  RME: { lvl: "Medium", why: "Cancer/diagnostics current; procurement fuzzy buyer match; EPR inferred" },
  RHB: { lvl: "High", why: "Live tender confirmed (exact buyer match); finance current" },
  RKD: { lvl: "Medium", why: "Operational data current; procurement planning-stage; EPR curated" },
  RTQ: { lvl: "Low", why: "Small provider, several fields sparse; no buyer signal" },
  RBX: { lvl: "High", why: "Two live tenders (exact match); EPR and FDP corroborated" },
  RLV: { lvl: "Low", why: "Multiple missing submissions; buyer intent inferred only" },
  RSF: { lvl: "Medium", why: "Stable data; board signal curated; CRM relationship unconfirmed" },
};
const DQ_WEAK = {
  RNG: ["Diagnostics"], RWV: ["RTT", "SUS", "Diagnostics"], RCF: ["Patient safety", "Workforce", "SUS"],
  RAL: [], RPV: ["Workforce"], RME: ["MHSDS link", "Cancer"], RHB: [], RKD: ["RTT"],
  RTQ: ["SUS", "Diagnostics"], RBX: [], RLV: ["RTT", "SUS", "Patient safety"], RSF: ["Workforce"],
};

function nextActionOf(t) {
  if (t.distress) return "Qualify funding";
  if (t.bandValue === "A") return "Call";
  if (t.bandValue === "B") return "Enrich";
  if (t.bandValue === "C") return "Monitor";
  return "No action";
}
function fundingRoutesOf(t) {
  const r = [];
  if (t.procurement.some((p) => p.d === "live")) r.push("Existing procurement");
  if (t.nhp !== "—" || t.eric >= 70 || t.capAlloc >= 75) r.push("Capital-backed");
  if (t.finance.agency >= 7 || /productivity|elective|discharge|flow/i.test(t.play)) r.push("ROI-led");
  if (t.epr.startsWith("Optimising") || t.epr.startsWith("Procuring") || t.fdp === "Live" || t.dma < 55) r.push("Digital programme");
  if (t.crm.startsWith("Warm")) r.push("Relationship-led");
  return r.length ? r : ["None evident"];
}

const TRUSTS = [
  {
    code: "RNG", name: "Northgate University Hospitals", region: "North West",
    icb: "Greater Mersey ICB", income: 1180, beds: 1140,
    budget: 74, pain: 86, digital: 88, buyer: 78, distress: false, trend: "Worsening",
    cqc: "Requires improvement", cqcWellLed: "Requires improvement",
    topPain: ["UEC flow", "RTT 52-week backlog", "Diagnostics 6-wk waits"],
    trigger: "Live EPR optimisation programme", play: "UEC / A&E flow",
    why: "Persistent ED flow pressure with a fresh EPR go-live creates a clear post-implementation reporting and command-centre window. Income scale supports a full engagement.",
    drivers: { uec: 24, rtt: 71, diag: 19, cancer: 78, dq: 62 },
    finance: { surplus: -4.2, capital: 61, cash: 38, agency: 6.1 },
    procurement: [{ k: "Data platform / analytics", v: "£2.4m", d: "live" }, { k: "EPR optimisation", v: "£0.9m", d: "awarded 3mo" }],
    spark: [82, 84, 83, 85, 86, 87, 86, 88, 89, 90, 91, 92],
  },
  {
    code: "RWV", name: "Wessex Bay NHS Foundation Trust", region: "South West",
    icb: "Dorset & Coast ICB", income: 690, beds: 720,
    budget: 66, pain: 79, digital: 58, buyer: 71, distress: false, trend: "Worsening",
    cqc: "Good", cqcWellLed: "Good",
    topPain: ["DQMI weakness", "Diagnostics", "Patient-safety recording lag"],
    trigger: "Inconsistent NOF submissions", play: "Data quality & submissions",
    why: "Submission gaps and a falling DQMI trend make a credible data-quality and assurance lead, ahead of operational propositions. Mid-scale but financially stable.",
    drivers: { uec: 58, rtt: 61, diag: 27, cancer: 72, dq: 41 },
    finance: { surplus: 1.1, capital: 28, cash: 55, agency: 3.4 },
    procurement: [{ k: "BI / reporting", v: "£0.6m", d: "early engagement" }],
    spark: [70, 71, 72, 71, 73, 74, 76, 75, 77, 78, 79, 80],
  },
  {
    code: "RCF", name: "Calderfield Acute NHS Trust", region: "Yorkshire & Humber",
    icb: "West Riding ICB", income: 540, beds: 610,
    budget: 41, pain: 90, digital: 64, buyer: 38, distress: true, trend: "Worsening",
    cqc: "Inadequate", cqcWellLed: "Inadequate",
    topPain: ["UEC 12-hr waits", "RTT backlog", "CQC well-led"],
    trigger: "Adverse CQC well-led report", play: "CQC / quality improvement",
    why: "Very high operational pain, but a persistent large deficit, low cash proxy and segment-4 status apply the severe-distress penalty. Qualify funding route before BD effort.",
    drivers: { uec: 18, rtt: 74, diag: 31, cancer: 66, dq: 55 },
    finance: { surplus: -11.8, capital: 14, cash: 12, agency: 9.7 },
    procurement: [],
    spark: [76, 78, 79, 81, 82, 84, 85, 86, 87, 88, 89, 90],
  },
  {
    code: "RAL", name: "St Aldwyn's Hospitals NHS FT", region: "South East",
    icb: "Thames Valley ICB", income: 980, beds: 900,
    budget: 88, pain: 49, digital: 52, buyer: 44, distress: false, trend: "Improving",
    cqc: "Good", cqcWellLed: "Outstanding",
    topPain: ["Workforce morale", "Minor diagnostics"],
    trigger: "No recent procurement", play: "Workforce & change readiness",
    why: "Strong balance sheet and outstanding governance, but limited operational pain and no active buying signal. Buyable but currently no compelling reason to engage.",
    drivers: { uec: 71, rtt: 49, diag: 61, cancer: 84, dq: 78 },
    finance: { surplus: 4.6, capital: 47, cash: 71, agency: 2.1 },
    procurement: [],
    spark: [56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45],
  },
  {
    code: "RPV", name: "Pennine Vale NHS Trust", region: "North West",
    icb: "Pennine ICB", income: 760, beds: 680,
    budget: 79, pain: 72, digital: 91, buyer: 74, distress: false, trend: "Flat",
    cqc: "Requires improvement", cqcWellLed: "Good",
    topPain: ["Estate pressure", "RTT", "Beds / flow"],
    trigger: "NHP scheme + high RAAC backlog", play: "New hospital / estates transformation",
    why: "Active New Hospital Programme scheme with significant RAAC and ERIC backlog opens a multi-year capital reporting, PMO and benefits-tracking opportunity. Strong capital momentum.",
    drivers: { uec: 52, rtt: 64, diag: 48, cancer: 75, dq: 70 },
    finance: { surplus: 0.4, capital: 88, cash: 49, agency: 4.0 },
    procurement: [{ k: "Capital PMO / programme", v: "£3.1m", d: "live" }, { k: "Data architecture", v: "£1.2m", d: "planning" }],
    spark: [73, 72, 74, 73, 72, 73, 72, 71, 72, 73, 72, 72],
  },
  {
    code: "RME", name: "Meridian Coast NHS FT", region: "East of England",
    income: 620, icb: "Eastern Counties ICB", beds: 560,
    budget: 63, pain: 77, digital: 60, buyer: 67, distress: false, trend: "Volatile",
    cqc: "Good", cqcWellLed: "Requires improvement",
    topPain: ["Cancer 62-day", "Diagnostics", "Cancelled ops"],
    trigger: "Cancer pathway under scrutiny", play: "Cancer / diagnostics pathway",
    why: "Weak 62-day cancer and diagnostics backlog with volatile recent trend supports a pathway-tracking and breach-prevention proposition.",
    drivers: { uec: 61, rtt: 58, diag: 33, cancer: 51, dq: 64 },
    finance: { surplus: -1.9, capital: 33, cash: 44, agency: 5.2 },
    procurement: [{ k: "Pathway analytics", v: "£0.5m", d: "early engagement" }],
    spark: [68, 72, 67, 74, 69, 76, 71, 78, 73, 75, 74, 77],
  },
  {
    code: "RHB", name: "Harborne Bridge NHS Trust", region: "Midlands",
    icb: "Central Midlands ICB", income: 870, beds: 820,
    budget: 71, pain: 68, digital: 73, buyer: 81, distress: false, trend: "Improving",
    cqc: "Good", cqcWellLed: "Good",
    topPain: ["RTT", "Productivity", "Agency spend"],
    trigger: "Active analytics procurement", play: "Finance & productivity",
    why: "Manageable deficit at large scale with high agency spend and a live analytics tender — a strong ROI-led productivity story with a visible route to market.",
    drivers: { uec: 64, rtt: 56, diag: 59, cancer: 79, dq: 72 },
    finance: { surplus: -2.3, capital: 52, cash: 51, agency: 7.8 },
    procurement: [{ k: "Productivity / analytics", v: "£1.4m", d: "live" }],
    spark: [62, 63, 64, 65, 66, 67, 67, 68, 68, 69, 69, 70],
  },
  {
    code: "RKD", name: "Kendrick Royal Infirmary NHS FT", region: "North East",
    icb: "Tyne & Wear ICB", income: 1020, beds: 990,
    budget: 76, pain: 81, digital: 70, buyer: 59, distress: false, trend: "Worsening",
    cqc: "Requires improvement", cqcWellLed: "Requires improvement",
    topPain: ["UEC flow", "Discharge delays", "Beds occupancy"],
    trigger: "High occupancy + discharge delays", play: "UEC / A&E flow",
    why: "Large trust with deteriorating flow, high occupancy and delayed-discharge pressure. Funded and at scale — a command-centre and discharge-optimisation lead.",
    drivers: { uec: 21, rtt: 68, diag: 44, cancer: 74, dq: 66 },
    finance: { surplus: -3.1, capital: 58, cash: 42, agency: 6.6 },
    procurement: [{ k: "UEC / flow analytics", v: "£0.8m", d: "planning" }],
    spark: [74, 75, 76, 77, 78, 79, 80, 80, 81, 82, 83, 84],
  },
  {
    code: "RTQ", name: "Tregarth Quay NHS Trust", region: "South West",
    icb: "Western Peninsula ICB", income: 410, beds: 430,
    budget: 47, pain: 63, digital: 49, buyer: 35, distress: false, trend: "Flat",
    cqc: "Good", cqcWellLed: "Good",
    topPain: ["Diagnostics", "RTT"],
    trigger: "Small scale, limited signals", play: "Elective recovery / RTT",
    why: "Moderate pain but smaller income and no buying signal. Keep on watchlist; revisit after next NOF and finance refresh.",
    drivers: { uec: 66, rtt: 60, diag: 41, cancer: 80, dq: 69 },
    finance: { surplus: -0.6, capital: 22, cash: 47, agency: 4.4 },
    procurement: [],
    spark: [60, 61, 60, 62, 61, 63, 62, 63, 62, 63, 63, 64],
  },
  {
    code: "RBX", name: "Beaumont Cross NHS FT", region: "London",
    icb: "Inner London ICB", income: 1340, beds: 1210,
    budget: 82, pain: 75, digital: 84, buyer: 72, distress: false, trend: "Worsening",
    cqc: "Good", cqcWellLed: "Good",
    topPain: ["RTT 52-week", "Cancer", "Diagnostics"],
    trigger: "Live EPR + data platform tender", play: "EPR optimisation & reporting",
    why: "Tertiary-scale trust mid-EPR with a live data-platform tender and a worsening elective trend. Excellent fit for EPR optimisation and adoption analytics.",
    drivers: { uec: 57, rtt: 53, diag: 36, cancer: 62, dq: 74 },
    finance: { surplus: 2.0, capital: 79, cash: 63, agency: 4.9 },
    procurement: [{ k: "Data platform", v: "£4.2m", d: "live" }, { k: "EPR reporting", v: "£1.1m", d: "live" }],
    spark: [80, 81, 80, 82, 81, 83, 82, 84, 83, 85, 84, 86],
  },
  {
    code: "RLV", name: "Lowervale Community Acute NHS Trust", region: "Midlands",
    icb: "Severn Vale ICB", income: 360, beds: 380,
    budget: 44, pain: 58, digital: 46, buyer: 31, distress: false, trend: "Improving",
    cqc: "Good", cqcWellLed: "Good",
    topPain: ["Minor RTT", "Diagnostics"],
    trigger: "No clear trigger", play: "—",
    why: "Limited pain, small scale and no buyer signal. Deprioritise unless a known relationship or tender emerges.",
    drivers: { uec: 70, rtt: 65, diag: 57, cancer: 82, dq: 75 },
    finance: { surplus: 0.9, capital: 18, cash: 53, agency: 3.0 },
    procurement: [],
    spark: [56, 55, 54, 55, 54, 53, 54, 53, 52, 53, 52, 51],
  },
  {
    code: "RSF", name: "Sherbourne Fields NHS FT", region: "South East",
    icb: "Weald & Downs ICB", income: 730, beds: 700,
    budget: 69, pain: 70, digital: 67, buyer: 64, distress: false, trend: "Flat",
    cqc: "Good", cqcWellLed: "Good",
    topPain: ["RTT", "Workforce", "Diagnostics"],
    trigger: "Workforce + change programme", play: "Workforce & change readiness",
    why: "Steady mid-scale trust with workforce-engagement pressure and a transformation programme. A develop-band account to enrich with contact intelligence.",
    drivers: { uec: 63, rtt: 57, diag: 52, cancer: 77, dq: 71 },
    finance: { surplus: -0.8, capital: 41, cash: 50, agency: 5.5 },
    procurement: [{ k: "Workforce analytics", v: "£0.4m", d: "planning" }],
    spark: [69, 70, 69, 70, 71, 70, 69, 70, 71, 70, 70, 70],
  },
].map((t) => {
  const s = score(t);
  const e = { ...t, ...DETAIL[t.code], conf: CONF[t.code], dqWeak: DQ_WEAK[t.code] || [], target: s, bandValue: band(s, t.distress) };
  e.nextAction = nextActionOf(e);
  e.fundingRoutes = fundingRoutesOf(e);
  return e;
});

const BAND_META = {
  A: { label: "A · Priority target", colour: C.bandA, action: "Assign owner · build account plan · contact this campaign" },
  B: { label: "B · Develop", colour: C.bandB, action: "Monitor · enrich CRM/contact intel · prepare targeted outreach" },
  C: { label: "C · Nurture", colour: C.bandC, action: "Watchlist · revisit after next NOF / finance / procurement refresh" },
  D: { label: "D · Deprioritise", colour: C.bandD, action: "No BD effort unless a known relationship or live tender exists" },
};

const TREND_ICON = {
  Worsening: { Icon: TrendingUp, colour: C.bad, note: "pain rising" },
  Improving: { Icon: TrendingDown, colour: C.good, note: "pain easing" },
  Flat: { Icon: Minus, colour: C.muted, note: "stable" },
  Volatile: { Icon: Zap, colour: C.warn, note: "unstable" },
};

/* ============================================================================
   SCORING METHODOLOGY  — pillars, sub-components, penalty, bands, peer rule
   (mirrors the blueprint Scoring Model sheet)
============================================================================ */
const PILLARS = [
  { key: "budget", label: "Budget likelihood", weight: 0.30, colour: C.purple,
    q: "Can this organisation realistically fund or justify external support?",
    sub: [
      ["Scale", 0.25, "Operating income percentile within trust type"],
      ["Current financial health", 0.20, "TAC surplus/deficit trend + NOF deficit flag + finance variance"],
      ["Capital momentum", 0.20, "Capital additions trend + NHP/RAAC/major scheme flag"],
      ["Liquidity proxy", 0.15, "Cash & equivalents vs expenditure; receivables/payables"],
      ["ICB / system context", 0.10, "ICB allocation growth, system deficit/overspend"],
      ["Procurement activity", 0.10, "Digital/data/BI/PMO notices or awards in last 24 months"],
      ["Severe-distress penalty", -0.15, "Persistent large deficit, low cash, segment 4, adverse well-led"],
    ] },
  { key: "pain", label: "Operational pain", weight: 0.35, colour: C.bright,
    q: "Is there a clear problem we can help solve?",
    sub: [
      ["UEC / A&E", null, "4-hour performance, 12-hour waits, admissions, occupancy"],
      ["Elective / RTT", null, "Incomplete pathways, 18-week, 52-week waits"],
      ["Cancer", null, "FDS, 31-day, 62-day standards"],
      ["Diagnostics", null, "Proportion waiting >6 weeks, modality backlog"],
      ["Quality & safety", null, "CQC, SHMI, HCAI, LFPSE patient safety"],
      ["Data quality", null, "DQMI provider/dataset score and trend"],
    ] },
  { key: "digital", label: "Digital / capital opportunity", weight: 0.20, colour: C.mid,
    q: "Is there a transformation event or data/digital reason to engage now?",
    sub: [
      ["Capital programme trigger", 0.35, "NHP / RAAC / major rebuild / Hospital 2.0 relevance"],
      ["Digital maturity / EPR gap", 0.25, "EPR status, DMA, GDE/exemplar context, usability"],
      ["Workflow / data friction", 0.20, "Poor UEC/RTT/beds/diagnostics/DQMI or staff-survey signals"],
      ["Market trigger", 0.20, "Active data-platform, BI, analytics or EPR-optimisation procurement"],
    ] },
  { key: "buyer", label: "Buyer openness", weight: 0.15, colour: "#9B6FD0",
    q: "Is there evidence the organisation goes to market or has an access route?",
    sub: [
      ["Procurement activity", null, "Find a Tender + Contracts Finder notices, value, recency"],
      ["Board-paper signals", null, "Digital strategy, EPR programme, improvement plans"],
      ["Framework route", null, "Known route to market / framework presence"],
      ["CRM engagement", null, "Known contacts and relationship strength (manual)"],
    ] },
];

const BANDS_RULE = [
  ["A · Priority target", "≥ 72", C.bandA, "High pain plus credible budget, timing and buyer signals"],
  ["B · Develop", "62 – 71.9", C.bandB, "Clear pain and fit, but one part of the case is weaker"],
  ["C · Nurture", "52 – 61.9", C.bandC, "Interesting but not yet urgent or not clearly fundable"],
  ["D · Deprioritise", "< 52", C.bandD, "Low fit, no clear pain or buyer signal, or severe-distress risk"],
];

/* Source register — drawn from the blueprint Source Register sheet.
   "asat" / "fresh" are illustrative freshness states for the prototype. */
const SOURCES = [
  { ds: "ODS organisation data", pub: "NHS England Digital", grp: "Master data", pri: "Must-have", grain: "Trust / site", refresh: "Nightly / API", dest: "DimTrust, DimSite, BridgeTrustSite", asat: "01 Jun 2026", fresh: "fresh", url: "https://digital.nhs.uk/services/organisation-data-service", note: "Golden source for trust/site identity and organisational change." },
  { ds: "NHS Oversight Framework (segmentation & league tables)", pub: "NHS England", grp: "Oversight / performance", pri: "Must-have", grain: "Trust-quarter + trust-metric-quarter", refresh: "Quarterly", dest: "FactNOFMetric, FactNOFLeague", asat: "Q4 2025/26", fresh: "fresh", url: "https://www.england.nhs.uk/nhs-oversight-framework/segmentation-and-league-tables/", note: "Core performance spine. Peer groups kept separate." },
  { ds: "Acute provider table", pub: "NHS England", grp: "Operational pain", pri: "Must-have (MVP)", grain: "Acute provider-month", refresh: "Monthly", dest: "FactAcuteProviderMonthly", asat: "Apr 2026", fresh: "fresh", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/acute-provider-table/", note: "Fastest topline for acute performance — ideal for MVP." },
  { ds: "A&E attendances & emergency admissions", pub: "NHS England", grp: "Operational pain", pri: "Must-have", grain: "Provider-month", refresh: "Monthly", dest: "FactAEMonthly", asat: "Apr 2026", fresh: "fresh", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/ae-waiting-times-and-activity/", note: "UEC command-centre, flow and breach-prediction propositions." },
  { ds: "RTT waiting times / WLMDS", pub: "NHS England", grp: "Operational pain", pri: "Must-have", grain: "Provider-month (weekly optional)", refresh: "Monthly / weekly", dest: "FactRTTMonthly, FactWLMDSWeekly", asat: "Mar 2026", fresh: "lag", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/rtt-waiting-times/", note: "Elective recovery, PTL, theatre productivity." },
  { ds: "Cancer waiting times", pub: "NHS England", grp: "Operational pain", pri: "Must-have", grain: "Provider-month/quarter", refresh: "Monthly / quarterly", dest: "FactCancerMonthly", asat: "Mar 2026", fresh: "lag", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/cancer-waiting-times/", note: "Cancer pathway performance; watch standards-change breaks." },
  { ds: "Diagnostics waiting times & activity (DM01)", pub: "NHS England", grp: "Operational pain", pri: "Must-have", grain: "Provider-month", refresh: "Monthly", dest: "FactDiagnosticsMonthly", asat: "Apr 2026", fresh: "fresh", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/diagnostics-waiting-times-and-activity/", note: "Diagnostic bottlenecks and CDC benefits tracking." },
  { ds: "Bed availability & occupancy (KH03)", pub: "NHS England", grp: "Operational pain", pri: "High", grain: "Provider-quarter / daily", refresh: "Quarterly / daily", dest: "FactBedsQuarterly", asat: "Q3 2025/26", fresh: "lag", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/bed-availability-and-occupancy/", note: "Flow, discharge and bed-utilisation reporting." },
  { ds: "Discharge Ready Date / discharge delays", pub: "NHS England", grp: "Operational pain", pri: "High", grain: "Trust-month", refresh: "Monthly", dest: "FactDischargeMonthly", asat: "Apr 2026", fresh: "fresh", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/discharge-delays/", note: "Bed-flow and discharge improvement proposition." },
  { ds: "Cancelled elective operations", pub: "NHS England", grp: "Operational pain", pri: "High", grain: "Provider-quarter", refresh: "Quarterly", dest: "FactCancelledOpsQuarterly", asat: "Q3 2025/26", fresh: "lag", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/cancelled-elective-operations/", note: "Theatre resilience; COVID collection gap flagged." },
  { ds: "Trust Accounts Consolidation (TAC)", pub: "NHS England", grp: "Budget likelihood", pri: "Must-have", grain: "Trust-year", refresh: "Annual", dest: "FactTACAnnual", asat: "FY 2024/25", fresh: "annual", url: "https://www.england.nhs.uk/financial-accounting-and-reporting/nhs-providers-tac-data-publications/", note: "Best public annual budget proxy and spend profile." },
  { ds: "Current-year financial performance reports", pub: "NHS England", grp: "Budget likelihood", pri: "High", grain: "Provider/ICB-quarter", refresh: "Quarterly", dest: "FactFinanceQuarterly", asat: "Q3 2025/26", fresh: "lag", url: "https://www.england.nhs.uk/publications/financial-performance-reports/", note: "Adds live financial position to annual accounts." },
  { ds: "CQC ratings (API & data downloads)", pub: "Care Quality Commission", grp: "Quality / regulatory", pri: "High", grain: "Provider / location snapshot", refresh: "Daily / API", dest: "FactCQCSnapshot", asat: "29 May 2026", fresh: "fresh", url: "https://www.cqc.org.uk/about-us/transparency/using-cqc-data", note: "Regulatory trigger; discount stale ratings by age." },
  { ds: "Data Quality Maturity Index (DQMI)", pub: "NHS England Digital", grp: "Data quality", pri: "High", grain: "Provider/dataset-month", refresh: "Monthly", dest: "FactDQMIMonthly", asat: "Mar 2026", fresh: "lag", url: "https://digital.nhs.uk/data-and-information/data-tools-and-services/data-services/data-quality", note: "Data-quality, submissions assurance and source-system offers." },
  { ds: "NHS Staff Survey local results", pub: "NHS Staff Survey", grp: "Workforce / change", pri: "High", grain: "Organisation-year", refresh: "Annual", dest: "FactStaffSurveyAnnual", asat: "2025", fresh: "annual", url: "https://www.nhsstaffsurveys.com/results/local-results/", note: "Workforce/culture and change-readiness signal." },
  { ds: "LFPSE patient safety data", pub: "NHS England", grp: "Quality / safety", pri: "High", grain: "Trust-quarter", refresh: "Quarterly", dest: "FactPatientSafetyQuarterly", asat: "Q3 2025/26", fresh: "lag", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/patient-safety-data/", note: "Safety reporting maturity and governance story." },
  { ds: "SHMI (mortality indicator)", pub: "NHS England Digital", grp: "Quality / safety", pri: "High", grain: "Trust rolling 12-month", refresh: "Monthly", dest: "FactSHMIMonthly", asat: "Feb 2026", fresh: "lag", url: "https://digital.nhs.uk/data-and-information/publications/statistical/shmi", note: "Quality improvement and clinical analytics context." },
  { ds: "HCAI monthly datasets", pub: "UKHSA / GOV.UK", grp: "Quality / safety", pri: "High", grain: "Trust-month", refresh: "Monthly", dest: "FactHCAIMonthly", asat: "Apr 2026", fresh: "fresh", url: "https://www.gov.uk/government/statistics/mrsa-mssa-gram-negative-bacteraemia-and-cdi-monthly-data-2025-to-2026", note: "Infection-control and safety analytics context." },
  { ds: "ERIC estates returns", pub: "NHS England / GOV.UK", grp: "Capital / complexity", pri: "High", grain: "Trust/site-year", refresh: "Annual", dest: "FactERICAnnual", asat: "FY 2024/25", fresh: "annual", url: "https://www.gov.uk/government/statistics/estates-returns-information-collection-summary-page-and-dataset-for-eric-202425", note: "Estate pressure, capital need and transformation trigger." },
  { ds: "Digitising the Frontline / DMA / EPR context", pub: "NHS England", grp: "Digital trigger", pri: "High", grain: "Programme / trust", refresh: "Programme updates", dest: "FactDigitalProgramme", asat: "May 2026", fresh: "review", url: "https://www.england.nhs.uk/digitaltechnology/digitising-the-frontline/", note: "EPR optimisation, reporting redesign, adoption analytics." },
  { ds: "New Hospital Programme", pub: "DHSC / GOV.UK", grp: "Capital trigger", pri: "High", grain: "Scheme / trust / site", refresh: "Ad-hoc policy update", dest: "FactCapitalProgramme", asat: "Jan 2026", fresh: "review", url: "https://www.gov.uk/government/publications/new-hospital-programme-review-outcome/new-hospital-programme-plan-for-implementation", note: "Major transformation trigger; curated scheme-to-trust bridge required." },
  { ds: "Find a Tender", pub: "Cabinet Office / GOV.UK", grp: "Buyer openness", pri: "High", grain: "Notice", refresh: "Near-real-time", dest: "FactProcurementNotice", asat: "31 May 2026", fresh: "fresh", url: "https://www.find-tender.service.gov.uk/Developer/Documentation", note: "Digital/data/analytics tender signals and route-to-market." },
  { ds: "Contracts Finder", pub: "Cabinet Office / GOV.UK", grp: "Buyer openness", pri: "High", grain: "Notice", refresh: "Near-real-time", dest: "FactProcurementNotice", asat: "31 May 2026", fresh: "fresh", url: "https://www.contractsfinder.service.gov.uk/apidocumentation/V2", note: "Complements Find a Tender for smaller/lower-value notices." },
  { ds: "English Indices of Deprivation 2025", pub: "MHCLG / GOV.UK", grp: "Context / complexity", pri: "Medium", grain: "LSOA", refresh: "Periodic", dest: "FactSocioeconomicAnnual", asat: "2025", fresh: "annual", url: "https://www.gov.uk/government/statistics/english-indices-of-deprivation-2025", note: "Structural context; map to trusts via site/ICB bridge with caution." },
  { ds: "ONS population estimates / projections", pub: "ONS", grp: "Context / complexity", pri: "Medium", grain: "LSOA / LA / health geog.", refresh: "Annual / periodic", dest: "FactSocioeconomicAnnual", asat: "2024", fresh: "annual", url: "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates", note: "Demand context, age burden and market size." },
  { ds: "Fingertips public health profiles", pub: "OHID", grp: "Context / complexity", pri: "Medium", grain: "Local authority / profile", refresh: "Regular", dest: "FactSocioeconomicAnnual", asat: "2025", fresh: "review", url: "https://fingertips.phe.org.uk/", note: "Demand, inequality and prevention-pressure narrative." },
  { ds: "NHS provider / system directories", pub: "NHS England", grp: "Sales context", pri: "Medium", grain: "Trust / ICB", refresh: "Web updates", dest: "DimTrustEnrichment", asat: "May 2026", fresh: "review", url: "https://www.england.nhs.uk/publication/nhs-provider-directory/", note: "Contact and governance context for CRM and board-paper links." },
];

const FRESH_META = {
  fresh: { label: "Current", colour: C.good },
  lag: { label: "Within cadence", colour: C.warn },
  annual: { label: "Annual cycle", colour: C.mid },
  review: { label: "Manual review", colour: C.muted },
};

/* v1 build coverage by pillar — live (confirmed feed) / curated (manual) / deferred (post-v1) */
const COVERAGE_V1 = [
  { pillar: "Budget likelihood", items: [["TAC annual accounts", "public"], ["Capital allocations", "public"], ["ERIC estates", "public"], ["NOF deficit flag", "public"], ["In-year finance trend", "deferred"]] },
  { pillar: "Operational pain", items: [["Acute Provider Table", "public"], ["A&E", "public"], ["RTT", "public"], ["Cancer", "public"], ["Diagnostics (DM01)", "public"], ["DQMI", "public"], ["Beds (KH03) / cancelled ops", "deferred"]] },
  { pillar: "Digital / capital", items: [["DMA results", "public"], ["FDP uptake", "public"], ["ERIC", "public"], ["NHP / RAAC bridge", "curated"], ["EPR status", "curated"]] },
  { pillar: "Buyer openness", items: [["Find a Tender", "public"], ["Contracts Finder", "public"], ["Board-paper signals", "curated"], ["Route to market", "curated"], ["CRM contacts", "curated"]] },
  { pillar: "Population (context only)", items: [["IMD 2025", "public"], ["ONS population", "public"], ["Catchment bridge", "curated"], ["Ethnicity (Census)", "deferred"], ["Rurality (RUC)", "deferred"]] },
];

/* Collection-ease rating (A–D) from the datasource register, keyed by dataset. */
const EASE = {
  "ODS organisation data": "A", "NHS Oversight Framework (segmentation & league tables)": "B", "Acute provider table": "B",
  "A&E attendances & emergency admissions": "B", "RTT waiting times / WLMDS": "B", "Cancer waiting times": "B",
  "Diagnostics waiting times & activity (DM01)": "B", "Bed availability & occupancy (KH03)": "B", "Discharge Ready Date / discharge delays": "B/C",
  "Cancelled elective operations": "B", "Trust Accounts Consolidation (TAC)": "B", "Current-year financial performance reports": "B",
  "CQC ratings (API & data downloads)": "B/C", "Data Quality Maturity Index (DQMI)": "B", "NHS Staff Survey local results": "B",
  "LFPSE patient safety data": "B", "SHMI (mortality indicator)": "B", "HCAI monthly datasets": "B", "ERIC estates returns": "B",
  "Digitising the Frontline / DMA / EPR context": "B", "New Hospital Programme": "C/D", "Find a Tender": "B/C", "Contracts Finder": "B/C",
  "English Indices of Deprivation 2025": "A/B", "ONS population estimates / projections": "B", "Fingertips public health profiles": "B",
  "NHS provider / system directories": "C",
};
const EASE_COLOUR = { A: C.good, "A/B": C.good, B: C.mid, "B/C": C.warn, C: C.warn, "C/D": C.bad, D: C.bad };
const V1_SET = new Set([
  "ODS organisation data", "NHS Oversight Framework (segmentation & league tables)", "Acute provider table",
  "A&E attendances & emergency admissions", "RTT waiting times / WLMDS", "Cancer waiting times",
  "Diagnostics waiting times & activity (DM01)", "Data Quality Maturity Index (DQMI)", "Trust Accounts Consolidation (TAC)",
  "CQC ratings (API & data downloads)", "ERIC estates returns", "Digitising the Frontline / DMA / EPR context",
  "New Hospital Programme", "Find a Tender", "Contracts Finder",
]);

const LIMITATIONS = [
  ["Peer-group comparability", "Critical", "Acute, MH/community and ambulance trusts have different metrics and distributions.", "Score within trust type; only compare on commercial dimensions after normalisation."],
  ["Financial pain vs budget likelihood", "Critical", "A deficit trust can still buy if work is funded or ROI-led; a healthy trust may have no reason to buy.", "Separate budget likelihood, severe-distress penalty and operational pain."],
  ["Catchment definition", "High", "Trust site/HQ geography is not the same as patient catchment.", "Use site-weighted or ICB/LA proxy and label the method clearly."],
  ["Organisational change", "High", "Mergers, closures and site changes break trend lines.", "Use ODS succession/history; store source code and current code."],
  ["Publication cadence mismatch", "High", "Monthly, quarterly and annual data won't align to one as-at date.", "Store AsAtDate, PeriodType, PublicationDate and latest-source-family logic."],
  ["Data revisions", "High", "NHS statistics are revised and definitions change.", "Track source file, retrieval timestamp, checksum and transformation notes."],
  ["CQC recency", "High", "Ratings may be old; API/download refresh methods differ.", "Show rating age and discount stale ratings."],
  ["Procurement matching", "High", "Buyer names in tender APIs are inconsistent.", "Maintain buyer alias table with match confidence and manual overrides."],
  ["TAC interpretation", "Medium", "Accounting-standard changes can affect trends.", "Use TAC for comparison and document major accounting changes."],
  ["IMD use", "Medium", "IMD 2025 is structural context, not current-year demand.", "Use as narrative modifier, not a direct performance penalty."],
  ["Digital-maturity data gaps", "Medium", "A stable public trust-level DMA download may not always exist.", "Triangulate via EPR/DMA, GDE context, NHP, ERIC, procurement and annual reports."],
];

const SEVERITY_COLOUR = { Critical: C.bad, High: C.warn, Medium: C.mid };

/* Maps Trust 360 sections to their source families, for inline provenance tags */
const SECTION_SOURCE = {
  finance: "TAC · annual + finance reports · quarterly",
  procurement: "Find a Tender + Contracts Finder · near-real-time",
  pain: "Acute provider table, A&E, RTT, cancer, DM01 · monthly",
  cqc: "CQC · daily/API",
  trend: "NOF + operational facts · composite",
  pillars: "FactTargetScore · gold scoring layer",
};

/* ============================================================================
   SMALL UI PRIMITIVES
============================================================================ */
const Pill = ({ b, small }) => (
  <span style={{
    background: BAND_META[b].colour, color: b === "D" ? C.ink : "#fff",
    fontSize: small ? 11 : 12, fontWeight: 600, padding: small ? "2px 8px" : "3px 10px",
    borderRadius: 999, letterSpacing: 0.2, whiteSpace: "nowrap",
  }}>{small ? b : BAND_META[b].label}</span>
);

const Bars = ({ t, h = 7 }) => {
  const rows = [
    { k: "Budget", v: t.budget, w: "30%", c: C.purple },
    { k: "Pain", v: t.pain, w: "35%", c: C.bright },
    { k: "Digital", v: t.digital, w: "20%", c: C.mid },
    { k: "Buyer", v: t.buyer, w: "15%", c: "#9B6FD0" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {rows.map((r) => (
        <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 52, fontSize: 11, color: C.muted }}>{r.k}</span>
          <span style={{ width: 30, fontSize: 11, color: C.muted, opacity: .7 }}>{r.w}</span>
          <div style={{ flex: 1, height: h, background: C.line, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${r.v}%`, height: "100%", background: r.c, borderRadius: 999 }} />
          </div>
          <span style={{ width: 26, fontSize: 11, fontWeight: 600, color: C.ink, textAlign: "right" }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
};

const Spark = ({ data, colour }) => {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={34}>
      <LineChart data={d} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
        <Line type="monotone" dataKey="v" stroke={colour} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

/* ============================================================================
   PAGE 1 — TARGET OVERVIEW
============================================================================ */
function Overview({ data, onPick }) {
  const kpis = [
    { label: "Trusts in scope", value: data.length, sub: "acute · England" },
    { label: "A-band priority", value: data.filter((d) => d.bandValue === "A").length, sub: "ready for outreach", colour: C.bandA },
    { label: "Avg target score", value: (data.reduce((a, d) => a + d.target, 0) / data.length).toFixed(1), sub: "weighted index" },
    { label: "Worsening trend", value: data.filter((d) => d.trend === "Worsening").length, sub: "pain accelerating", colour: C.bad },
    { label: "Active procurement", value: data.filter((d) => d.procurement.length).length, sub: "live buying signal", colour: C.good },
  ];
  const scatter = data.map((d) => ({ ...d, x: d.budget, y: d.pain, z: d.income }));

  return (
    <div>
      <PageHead
        kicker="Page 1 · Market prioritisation"
        title="Target Overview"
        blurb="Where does pain meet buyability? Top-right is the sweet spot — a clear problem to solve and a credible route to fund it. Bubble size is operating income; colour is commercial band."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 18 }}>
        {kpis.map((k) => (
          <div key={k.label} style={card()}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: k.colour || C.ink, fontFamily: "Poppins", lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16 }}>
        <div style={card()}>
          <SectionTitle>Budget likelihood × Operational pain</SectionTitle>
          <div style={{ height: 420, position: "relative" }}>
            <QuadLabel top="14px" right="30px" text="Pursue now" tone={C.purple} />
            <QuadLabel top="14px" left="56px" text="Pain — qualify funding" tone={C.bad} />
            <QuadLabel bottom="52px" right="30px" text="Budget — no trigger" tone={C.muted} />
            <QuadLabel bottom="52px" left="56px" text="Low priority" tone={C.muted} />
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 8 }}>
                <ReferenceArea x1={60} x2={100} y1={70} y2={100} fill={C.bandA} fillOpacity={0.06} />
                <CartesianGrid stroke={C.line} />
                <XAxis type="number" dataKey="x" domain={[30, 100]} name="Budget"
                  tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "Budget likelihood →", position: "bottom", offset: 14, fontSize: 12, fill: C.ink }} />
                <YAxis type="number" dataKey="y" domain={[40, 100]} name="Pain"
                  tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "Operational pain →", angle: -90, position: "insideLeft", fontSize: 12, fill: C.ink }} />
                <ZAxis type="number" dataKey="z" range={[120, 900]} />
                <ReferenceLine x={60} stroke={C.muted} strokeDasharray="4 4" />
                <ReferenceLine y={70} stroke={C.muted} strokeDasharray="4 4" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTip />} />
                <Scatter data={scatter} onClick={(e) => e && onPick(e.code)} cursor="pointer">
                  {scatter.map((d) => (
                    <Cell key={d.code} fill={BAND_META[d.bandValue].colour}
                      stroke={d.distress ? C.bad : "#fff"} strokeWidth={d.distress ? 2.5 : 1} />
                  ))}
                  <LabelList dataKey="code" content={(p) => {
                    const d = scatter[p.index]; if (!d) return null;
                    if (d.bandValue !== "A" && !d.distress) return null;
                    return <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize={10} fontWeight={600} fill={d.distress ? C.bad : C.ink}>{d.name.split(" ")[0]}</text>;
                  }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 6, fontSize: 11, color: C.muted }}>
            {Object.entries(BAND_META).map(([k, v]) => (
              <span key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: v.colour, display: "inline-block" }} />{v.label}
              </span>
            ))}
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, border: `2px solid ${C.bad}`, display: "inline-block" }} />severe-distress flag
            </span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${C.line}` }}>
            Priority bubbles are labelled directly. A high score backed by stale or inferred data carries lower confidence — see the confidence column on the Shortlist and the badge on Trust 360.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card()}>
            <SectionTitle>Band distribution</SectionTitle>
            {["A", "B", "C", "D"].map((b) => {
              const n = data.filter((d) => d.bandValue === b).length;
              return (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                  <Pill b={b} small />
                  <div style={{ flex: 1, height: 9, background: C.line, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${(n / data.length) * 100}%`, height: "100%", background: BAND_META[b].colour, borderRadius: 999 }} />
                  </div>
                  <span style={{ width: 18, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{n}</span>
                </div>
              );
            })}
          </div>
          <div style={card()}>
            <SectionTitle>Where to start</SectionTitle>
            {data.filter((d) => d.bandValue === "A").sort((a, b) => b.target - a.target).map((d) => (
              <button key={d.code} onClick={() => onPick(d.code)} style={rowBtn()}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.play} · {d.region}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "Poppins", fontWeight: 700, color: C.purple }}>{d.target}</span>
                  <ChevronRight size={16} color={C.muted} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const QuadLabel = ({ text, tone, ...pos }) => (
  <div style={{ position: "absolute", zIndex: 2, fontSize: 10.5, fontWeight: 600, color: tone, opacity: 0.8,
    textTransform: "uppercase", letterSpacing: 0.4, pointerEvents: "none", ...pos }}>{text}</div>
);
const ScatterTip = ({ payload }) => {
  if (!payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tip()}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: 11, color: C.muted }}>Target {d.target} · Band {d.bandValue}</div>
      <div style={{ fontSize: 11, color: C.muted }}>Budget {d.budget} · Pain {d.pain} · £{d.income}m</div>
      {d.distress && <div style={{ fontSize: 11, color: C.bad, marginTop: 3 }}>⚠ severe-distress penalty applied</div>}
    </div>
  );
};

/* ============================================================================
   PAGE 2 — TARGET SHORTLIST
============================================================================ */
function Shortlist({ data, onPick }) {
  const [sort, setSort] = useState("target");
  const sorted = [...data].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b[sort] - a[sort]));
  const head = [
    ["name", "Trust"], ["target", "Score"], ["band", "Band"], ["pillars", "Component scores"],
    ["pain", "Top pain"], ["trend", "Trend"], ["why", "Why now"], ["play", "Sales play"],
    ["action", "Next action"],
  ];
  return (
    <div>
      <PageHead kicker="Page 2 · Account action" title="Target Shortlist"
        blurb="The ranked working list. Each row carries its own evidence — component scores, top pain, trend, the suggested proposition, the next best action and how strong the underlying evidence is — so a BDR can qualify without reading raw NHS metrics." />
      <div style={{ ...card(), padding: 0, overflowX: "auto", overflowY: "hidden" }}>
        <table style={{ width: "100%", minWidth: 1120, borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8FC", borderBottom: `2px solid ${C.line}` }}>
              {head.map(([k, l]) => (
                <th key={k} onClick={() => ["target", "pain", "name"].includes(k) && setSort(k)}
                  style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 600, color: C.muted,
                    textTransform: "uppercase", letterSpacing: .4, cursor: ["target", "pain", "name"].includes(k) ? "pointer" : "default" }}>
                  {l}{sort === k && " ↓"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => {
              const T = TREND_ICON[d.trend];
              return (
                <tr key={d.code} onClick={() => onPick(d.code)}
                  style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer", background: i % 2 ? "#FCFBFE" : "#fff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F0FA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 ? "#FCFBFE" : "#fff")}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: C.ink }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{d.code} · {d.region}</div>
                    {d.distress && <div style={{ marginTop: 5 }}><DistressFlag small /></div>}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontFamily: "Poppins", fontSize: 19, fontWeight: 700, color: C.purple }}>{d.target}</span>
                    <div style={{ marginTop: 3, fontSize: 10.5, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 999, background: CONF_COLOUR[d.conf.lvl], display: "inline-block" }} />{d.conf.lvl} confidence
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}><Pill b={d.bandValue} small /></td>
                  <td style={{ padding: "12px 14px", minWidth: 130 }}>
                    <MiniPillars t={d} />
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12 }}>{d.topPain[0]}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: T.colour, fontSize: 12, fontWeight: 500 }}>
                      <T.Icon size={14} />{d.trend}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", maxWidth: 220, fontSize: 12, color: C.ink }}>{d.trigger}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 500, color: C.mid }}>{d.play}</td>
                  <td style={{ padding: "12px 14px" }}><Chip label={d.nextAction} tone={NEXT_TONE[d.nextAction]} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10 }}><Src>Next action derived from band + distress · Evidence = data-confidence layer (freshness, match quality, inferred fields), held separate from the target score</Src></div>
    </div>
  );
}

const MiniPillars = ({ t }) => {
  const segs = [{ v: t.budget, c: C.purple }, { v: t.pain, c: C.bright }, { v: t.digital, c: C.mid }, { v: t.buyer, c: "#9B6FD0" }];
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {segs.map((s, i) => (
        <div key={i} title={s.v} style={{ flex: 1, height: 28, background: C.line, borderRadius: 3, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
          <div style={{ width: "100%", height: `${s.v}%`, background: s.c }} />
        </div>
      ))}
    </div>
  );
};

/* ============================================================================
   PAGE 3 — TRUST 360
============================================================================ */
function Trust360({ t, onBack }) {
  const T = TREND_ICON[t.trend];
  const painData = [
    { k: "UEC 4-hr", v: t.drivers.uec },
    { k: "RTT 18-wk", v: t.drivers.rtt },
    { k: "Diagnostics", v: t.drivers.diag },
    { k: "Cancer 62-day", v: t.drivers.cancer },
    { k: "Data quality", v: t.drivers.dq },
  ];
  return (
    <div>
      <button onClick={onBack} style={{ ...rowBtn(), width: "auto", padding: "6px 12px", marginBottom: 14, border: `1px solid ${C.line}`, borderRadius: 8 }}>
        <span style={{ fontSize: 12, color: C.mid, fontWeight: 600 }}>← Back to shortlist</span>
      </button>

      {/* header */}
      <div style={{ ...card(), display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: "Poppins", fontSize: 26, fontWeight: 700, color: C.ink, margin: 0 }}>{t.name}</h2>
            <Pill b={t.bandValue} />
          </div>
          <div style={{ display: "flex", gap: 16, color: C.muted, fontSize: 13, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={14} />{t.region} · {t.icb}</span>
            <span>ODS {t.code}</span>
            <span>£{t.income}m income</span>
            <span>{t.beds} beds</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: T.colour }}><T.Icon size={14} />{t.trend} ({T.note})</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>Target score</div>
          <div style={{ fontFamily: "Poppins", fontSize: 48, fontWeight: 700, color: C.purple, lineHeight: 1 }}>{t.target}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: C.muted }}>Confidence</span><Confidence c={t.conf} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", marginTop: 8 }}>
            <Chip label={`Next: ${t.nextAction}`} tone={NEXT_TONE[t.nextAction]} />
          </div>
          {t.distress && <div style={{ marginTop: 8 }}><DistressFlag /></div>}
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.muted, margin: "-6px 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
        <Info size={12} />Confidence reflects data quality, not opportunity size — held separate from the score. {t.conf.why}.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* pillars */}
        <div style={card()}>
          <SectionTitle>Component scores</SectionTitle>
          <Bars t={t} h={9} />
          <div style={{ marginTop: 10, fontSize: 11, color: C.muted, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
            Target = 0.30·Budget + 0.35·Pain + 0.20·Digital + 0.15·Buyer{t.distress ? " − distress penalty" : ""}
          </div>
          <Src>{SECTION_SOURCE.pillars}</Src>
        </div>
        {/* pain profile */}
        <div style={card()}>
          <SectionTitle>Pain profile <span style={{ fontWeight: 400, color: C.muted, fontSize: 11 }}>(lower = worse)</span></SectionTitle>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={painData} layout="vertical" margin={{ left: 4, right: 12, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="k" width={86} tick={{ fontSize: 11, fill: C.ink }} />
                <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={14}>
                  {painData.map((p, i) => (
                    <Cell key={i} fill={p.v < 40 ? C.bad : p.v < 65 ? C.warn : C.good} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Src>{SECTION_SOURCE.pain}</Src>
        </div>
        {/* regulatory / digital */}
        <div style={card()}>
          <SectionTitle>Regulatory & triggers</SectionTitle>
          <Fact label="CQC overall" value={t.cqc} tone={t.cqc.includes("Inadequate") ? "bad" : t.cqc.includes("Requires") ? "warn" : "good"} />
          <Fact label="CQC well-led" value={t.cqcWellLed} tone={t.cqcWellLed.includes("Inadequate") ? "bad" : t.cqcWellLed.includes("Requires") ? "warn" : "good"} />
          <Fact label="Timing trigger" value={t.trigger} icon={<Zap size={13} />} />
          <Fact label="Trend" value={`${t.trend} (12-mo)`} tone={t.trend === "Worsening" ? "bad" : t.trend === "Improving" ? "good" : "neutral"} />
          <Src>{SECTION_SOURCE.cqc} · NHP/RAAC/EPR programme registers</Src>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* finance */}
        <div style={card()}>
          <SectionTitle><Wallet size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Finance & buying signals</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Metric label="Surplus / deficit" value={`${t.finance.surplus > 0 ? "+" : ""}£${t.finance.surplus}m`} tone={t.finance.surplus < -5 ? "bad" : t.finance.surplus < 0 ? "warn" : "good"} />
            <Metric label="Capital additions" value={`${t.finance.capital} pct`} sub="percentile" />
            <Metric label="Cash proxy" value={`${t.finance.cash} pct`} sub="liquidity" tone={t.finance.cash < 25 ? "bad" : "neutral"} />
            <Metric label="Agency / temp spend" value={`${t.finance.agency} pct`} sub="of income" tone={t.finance.agency > 7 ? "warn" : "neutral"} />
          </div>
          <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: .4 }}>Procurement signals</div>
            {t.procurement.length ? t.procurement.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                <span style={{ color: C.ink }}>{p.k}</span>
                <span style={{ color: C.mid, fontWeight: 600 }}>{p.v} · {p.d}</span>
              </div>
            )) : <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>No relevant notices in last 24 months</div>}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
            <SrcDot k="public" />Figures are TAC annual accounts. <NotYet label="In-year finance trend — planned" />
          </div>
          <Src detail="Trust Accounts Consolidation (annual) + NOF deficit flag · Find a Tender + Contracts Finder for procurement · in-year quarterly financial performance reports are planned post-v1">{SECTION_SOURCE.finance} · {SECTION_SOURCE.procurement}</Src>
        </div>
        {/* 12-mo trend */}
        <div style={card()}>
          <SectionTitle><Activity size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Pain index · 12-month trend</SectionTitle>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={t.spark.map((v, i) => ({ m: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i], v }))} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.muted }} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} domain={[40, 100]} />
                <Tooltip content={<SimpleTip />} />
                <Line type="monotone" dataKey="v" stroke={C.bright} strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Composite operational-pain index. 3-month acceleration shown by slope.</div>
          <Src>{SECTION_SOURCE.trend}</Src>
        </div>
      </div>

      {/* narrative + play */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div style={{ ...card(), borderLeft: `4px solid ${C.bright}` }}>
          <SectionTitle><FileText size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Why this trust · why now</SectionTitle>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: C.ink, margin: "0 0 12px" }}>{t.why}</p>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .4, marginBottom: 6 }}>Top pain drivers</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {t.topPain.map((p) => (
              <span key={p} style={{ background: C.bg, color: C.purple, fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 6 }}>{p}</span>
            ))}
          </div>
        </div>
        <div style={{ ...card(), background: C.purple, color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: .8, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>Suggested sales play</div>
          <div style={{ fontFamily: "Poppins", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{t.play}</div>
          <div style={{ fontSize: 13, lineHeight: 1.5, opacity: .92 }}>{BAND_META[t.bandValue].action}</div>
          <button style={{ marginTop: 16, background: "#fff", color: C.purple, border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Stethoscope size={15} />Build account plan <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      {/* sales enablement */}
      <div style={{ ...card(), marginTop: 16 }}>
        <SectionTitle><Target size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Sales enablement</SectionTitle>
        {(() => {
          const k = PLAY_KIT[t.play] || { persona: "Executive sponsor", offer: t.play, proof: "Relevant Intuita case study", convo: t.topPain[0] };
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              <Inline label="Recommended first conversation" value={k.convo} sc="curated" />
              <Inline label="Likely buyer persona" value={k.persona} sc="curated" />
              <Inline label="Relevant service offer" value={k.offer} sc="curated" />
              <Inline label="Proof point / case study" value={k.proof} sc="curated" />
              <Inline label="Funding route" value={t.fundingRoutes.join(" · ")} sc="public" />
              <Inline label="Route to market" value={t.route} sc="curated" />
              <Inline label="Known contacts" value={t.crm.startsWith("Cold") ? "—" : t.crm} sc="crm" emptyLabel="No contacts loaded" />
              <Inline label="Last touched" value="—" sc="crm" emptyLabel="No contact logged" />
              <Inline label="Next touch" value={t.nextAction === "No action" ? "—" : `${t.nextAction} (this campaign)`} sc="crm" emptyLabel="None scheduled" />
            </div>
          );
        })()}
        <Src detail="Personas, offers and proof points are mapped from the sales play; funding route is derived from public finance/procurement signals; contacts, CRM status and touch history come from CRM (manual) and are blank until CRM is connected">Play-mapped persona/offer/proof · funding route derived · contacts &amp; touch history from CRM (manual)</Src>
      </div>
    </div>
  );
}

const Fact = ({ label, value, tone = "neutral", icon }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
    <span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 5 }}>{icon}{label}</span>
    <span style={{ fontSize: 12.5, fontWeight: 600, color: tone === "bad" ? C.bad : tone === "warn" ? C.warn : tone === "good" ? C.good : C.ink, textAlign: "right", maxWidth: 150 }}>{value}</span>
  </div>
);
const Metric = ({ label, value, sub, tone = "neutral" }) => (
  <div>
    <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
    <div style={{ fontFamily: "Poppins", fontSize: 20, fontWeight: 700, color: tone === "bad" ? C.bad : tone === "warn" ? C.warn : tone === "good" ? C.good : C.ink }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: C.muted }}>{sub}</div>}
  </div>
);
const SimpleTip = ({ payload, label }) => payload && payload.length ? (
  <div style={tip()}><b>{label}</b> · pain index {payload[0].value}</div>
) : null;

/* ============================================================================
   PAGE 4 — OPERATIONAL PAIN (heatmap across trusts)
============================================================================ */
function OperationalPain({ data, onPick }) {
  const families = [["uec", "UEC 4-hr"], ["rtt", "RTT 18-wk"], ["diag", "Diagnostics"], ["cancer", "Cancer 62-day"], ["dq", "Data quality"]];
  const heat = (v) => (v < 35 ? C.bad : v < 50 ? "#E6783F" : v < 65 ? C.warn : v < 80 ? "#7FB85A" : C.good);
  const sorted = [...data].sort((a, b) => b.pain - a.pain);
  return (
    <div>
      <PageHead kicker="Page 5 · Pitch shaping" title="Operational Pain"
        blurb="Service-line diagnostic across the market. The worst-performing domains map directly to a sales play, so red cells are the strongest propositions." />
      <div style={{ ...card(), display: "flex", gap: 24, alignItems: "center", marginBottom: 14, padding: "12px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.ink }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: C.bad, display: "inline-block" }} />
          <b>Cell colour = service performance</b> <span style={{ color: C.muted }}>(lower number = worse performance)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.ink }}>
          <span style={{ fontFamily: "Poppins", fontWeight: 700, color: C.bright }}>72</span>
          <b>Sales pain score = opportunity</b> <span style={{ color: C.muted }}>(higher = stronger opportunity from weak performance)</span>
        </div>
      </div>
      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8FC", borderBottom: `2px solid ${C.line}` }}>
              <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>Trust</th>
              {families.map(([k, l]) => (
                <th key={k} style={{ padding: "12px 8px", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>{l}</th>
              ))}
              <th style={{ padding: "12px 14px", fontSize: 11, color: C.bright, textTransform: "uppercase", letterSpacing: .4 }}>Sales pain score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.code} onClick={() => onPick(d.code)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F0FA")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: C.ink }}>{d.name}<span style={{ fontWeight: 400, color: C.muted, fontSize: 11 }}> · {d.region}</span></td>
                {families.map(([k]) => (
                  <td key={k} style={{ padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ background: heat(d.drivers[k]), color: "#fff", fontWeight: 600, fontSize: 12, borderRadius: 5, padding: "8px 0" }}>{d.drivers[k]}</div>
                  </td>
                ))}
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <span style={{ fontFamily: "Poppins", fontSize: 17, fontWeight: 700, color: C.bright }}>{d.pain}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: C.muted, alignItems: "center", flexWrap: "wrap" }}>
        <span>Performance scale:</span>
        {[["Severe", C.bad], ["Poor", "#E6783F"], ["Concern", C.warn], ["Fair", "#7FB85A"], ["Good", C.good]].map(([l, c]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: c, display: "inline-block" }} />{l}
          </span>
        ))}
        <span style={{ marginLeft: 8, fontStyle: "italic" }}>Every cell also shows its value, so the ranking does not rely on colour alone (colour-vision safe).</span>
      </div>
    </div>
  );
}

/* ============================================================================
   PAGE 4 — FINANCE & BUYING SIGNALS
============================================================================ */
function Finance({ data, onPick }) {
  const [sort, setSort] = useState("budget");
  const sorted = [...data].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : b[sort] - a[sort]);
  const fmt = (v) => `${v > 0 ? "+" : ""}£${v}m`;
  const kpis = [
    { label: "Addressable income", value: `£${(data.reduce((a, d) => a + d.income, 0) / 1000).toFixed(1)}bn`, sub: "combined operating income" },
    { label: "In deficit", value: data.filter((d) => d.finance.surplus < 0).length, sub: "running a deficit", colour: C.warn },
    { label: "Capital-backed", value: data.filter((d) => d.capAlloc >= 60).length, sub: "strong capital envelope", colour: C.good },
    { label: "Severe-distress flag", value: data.filter((d) => d.distress).length, sub: "qualify funding first", colour: C.bad },
  ];
  return (
    <div>
      <PageHead kicker="Page 4 · Buying capacity" title="Finance & Buying Signals"
        blurb="Can they fund the work? Budget likelihood blends scale, financial health, capital momentum and liquidity — a deficit alone never disqualifies a trust if the work is capital-backed or ROI-led. The severe-distress flag marks where funding must be qualified before BD effort." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        {kpis.map((k) => (
          <div key={k.label} style={card()}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.colour || C.ink, fontFamily: "Poppins", lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8FC", borderBottom: `2px solid ${C.line}` }}>
              {[["name", "Trust"], ["income", "Income"], ["surplus", "Surplus / deficit"], ["capAlloc", "Capital envelope"], ["cash", "Cash proxy"], ["agency", "Agency spend"], ["route", "Funding route"], ["budget", "Budget score"]].map(([k, l]) => (
                <th key={k} onClick={() => ["budget", "income", "capAlloc", "name"].includes(k) && setSort(k)}
                  style={{ textAlign: k === "name" || k === "route" ? "left" : "right", padding: "11px 14px", fontSize: 10.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: .4, cursor: ["budget", "income", "capAlloc", "name"].includes(k) ? "pointer" : "default" }}>
                  {l}{sort === k && " ↓"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => {
              const liveProc = d.procurement.filter((p) => p.d === "live");
              return (
                <tr key={d.code} onClick={() => onPick(d.code)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer", background: i % 2 ? "#FCFBFE" : "#fff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F0FA")} onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 ? "#FCFBFE" : "#fff")}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: 600, color: C.ink }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{d.region}</div>
                    {d.distress && <div style={{ marginTop: 5 }}><DistressFlag small /></div>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>£{d.income}m</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600, color: d.finance.surplus < -5 ? C.bad : d.finance.surplus < 0 ? C.warn : C.good }}>{fmt(d.finance.surplus)}</td>
                  <td style={{ padding: "11px 14px", minWidth: 110 }}><BarCell v={d.capAlloc} c={C.purple} /></td>
                  <td style={{ padding: "11px 14px", minWidth: 90 }}><BarCell v={d.cash} c={d.cash < 25 ? C.bad : C.mid} /></td>
                  <td style={{ padding: "11px 14px", textAlign: "right", color: d.finance.agency > 7 ? C.warn : C.ink }}>{d.finance.agency}%</td>
                  <td style={{ padding: "11px 14px", maxWidth: 230 }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {d.fundingRoutes.map((r, j) => <Chip key={j} label={r} tone={r === "None evident" ? "off" : r === "Existing procurement" ? "good" : "brand"} />)}
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "right" }}><span style={{ fontFamily: "Poppins", fontSize: 17, fontWeight: 700, color: C.purple }}>{d.budget}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10 }}><Src>{SECTION_SOURCE.finance} · provider/ICB capital allocations · {SECTION_SOURCE.procurement}</Src></div>
    </div>
  );
}

const BarCell = ({ v, c }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
    <div style={{ flex: 1, height: 7, background: C.line, borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${v}%`, height: "100%", background: c, borderRadius: 999 }} />
    </div>
    <span style={{ width: 22, textAlign: "right", fontSize: 11, fontWeight: 600, color: C.ink }}>{v}</span>
  </div>
);

/* ============================================================================
   PAGE 6 — DIGITAL & CAPITAL
============================================================================ */
function DigitalCapital({ data, onPick }) {
  const sorted = [...data].sort((a, b) => b.digital - a.digital);
  const triggers = (d) => {
    const out = [];
    if (d.nhp !== "—") out.push(["NHP / RAAC", "good"]);
    if (d.fdp === "Live") out.push(["FDP live", "good"]);
    else if (d.fdp === "Signed") out.push(["FDP signed", "brand"]);
    if (d.epr.startsWith("Optimising")) out.push(["EPR optimisation", "good"]);
    else if (d.epr.startsWith("Procuring")) out.push(["EPR procuring", "warn"]);
    if (d.capAlloc >= 75) out.push(["Capital envelope", "brand"]);
    if (d.eric >= 70) out.push(["High estate backlog", "warn"]);
    return out;
  };
  return (
    <div>
      <PageHead kicker="Page 6 · Transformation trigger" title="Digital & Capital"
        blurb="Why now? Transformation events are the difference between 'someday' and 'this year' demand. Digital maturity (DMA), EPR and FDP status, New Hospital Programme placement, RAAC and estate backlog together tell you which trusts are mid-change and open to external support." />
      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8FC", borderBottom: `2px solid ${C.line}` }}>
              {[["Trust", null], ["Digital maturity", "public"], ["YoY", null], ["EPR status", "curated"], ["FDP", "public"], ["Capital / NHP", "public"], ["Estate backlog", "public"], ["Active triggers", "inferred"]].map(([h, sc]) => (
                <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 10.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {sc && <span title={`Source confidence: ${sc}`} style={{ width: 7, height: 7, borderRadius: 999, background: SRC_CONF[sc], display: "inline-block" }} />}{h}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => (
              <tr key={d.code} onClick={() => onPick(d.code)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer", background: i % 2 ? "#FCFBFE" : "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F0FA")} onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 ? "#FCFBFE" : "#fff")}>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ fontWeight: 600, color: C.ink }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.region}</div>
                </td>
                <td style={{ padding: "11px 14px", minWidth: 120 }}><BarCell v={d.dma} c={d.dma >= 75 ? C.good : d.dma >= 55 ? C.mid : C.warn} /></td>
                <td style={{ padding: "11px 14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: d.dmaChg > 0 ? C.good : d.dmaChg < 0 ? C.bad : C.muted }}>
                    {d.dmaChg > 0 ? <TrendingUp size={13} /> : d.dmaChg < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}{d.dmaChg > 0 ? "+" : ""}{d.dmaChg}
                  </span>
                </td>
                <td style={{ padding: "11px 14px" }}><Chip label={d.epr} tone={eprTone(d.epr)} /></td>
                <td style={{ padding: "11px 14px" }}><Chip label={d.fdp === "—" ? "None" : d.fdp} tone={d.fdp === "Live" ? "good" : d.fdp === "Signed" ? "brand" : "off"} /></td>
                <td style={{ padding: "11px 14px", fontSize: 12 }}>
                  {d.nhp !== "—" ? <Chip label={d.nhp} tone="brand" /> : <span style={{ color: C.muted }}>£{Math.round(d.income * d.capAlloc / 100)}m envelope</span>}
                </td>
                <td style={{ padding: "11px 14px", minWidth: 100 }}><BarCell v={d.eric} c={d.eric >= 70 ? C.bad : d.eric >= 45 ? C.warn : C.mid} /></td>
                <td style={{ padding: "11px 14px", maxWidth: 200 }}>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {triggers(d).slice(0, 3).map(([l, t], j) => <Chip key={j} label={l} tone={t} />)}
                    {triggers(d).length === 0 && <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>none</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: C.muted, alignItems: "center", flexWrap: "wrap" }}>
        <b style={{ color: C.ink, fontWeight: 600 }}>Source confidence:</b>
        {[["Confirmed public source", "public"], ["Inferred from procurement", "inferred"], ["Curated / manual", "curated"], ["CRM confirmed", "crm"]].map(([l, k]) => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: SRC_CONF[k], display: "inline-block" }} />{l}
          </span>
        ))}
        <span style={{ fontStyle: "italic" }}>No single national EPR-status file exists — EPR is triangulated/curated, not a confirmed feed.</span>
      </div>
      <div style={{ marginTop: 10 }}><Src>DMA results file · FDP uptake · New Hospital Programme · ERIC estates · capital allocations · {SECTION_SOURCE.procurement}</Src></div>
    </div>
  );
}

/* ============================================================================
   PAGE 7 — DATA QUALITY & GOVERNANCE
============================================================================ */
function DataQuality({ data, onPick }) {
  const sorted = [...data].sort((a, b) => a.drivers.dq - b.drivers.dq); // worst DQMI first = best DQ proposition
  const dqOpp = (d) => d.drivers.dq < 50 || d.miss >= 3 || d.dspt === "Not Met";
  return (
    <div>
      <PageHead kicker="Page 7 · Data-quality proposition" title="Data Quality & Governance"
        blurb="Where can reporting, validation and submissions assurance solve a board-level problem? Weak DQMI, missing submissions and below-target DSP Toolkit status are the clearest openings for a data-quality-led engagement — sorted worst-first, because worst is the strongest pitch." />
      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8FC", borderBottom: `2px solid ${C.line}` }}>
              {["Trust", "DQMI score", "Weak datasets", "DSP Toolkit", "CQC rating", "Rating age", "DQ opportunity"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 10.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => (
              <tr key={d.code} onClick={() => onPick(d.code)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer", background: i % 2 ? "#FCFBFE" : "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F0FA")} onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 ? "#FCFBFE" : "#fff")}>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ fontWeight: 600, color: C.ink }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.region}</div>
                </td>
                <td style={{ padding: "11px 14px", minWidth: 130 }}><BarCell v={d.drivers.dq} c={d.drivers.dq < 50 ? C.bad : d.drivers.dq < 65 ? C.warn : C.good} /></td>
                <td style={{ padding: "11px 14px", maxWidth: 210 }}>
                  {d.dqWeak.length ? (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {d.dqWeak.map((w) => <Chip key={w} label={w} tone="warn" />)}
                    </div>
                  ) : <span style={{ color: C.good, fontSize: 12, fontWeight: 600 }}>None flagged</span>}
                </td>
                <td style={{ padding: "11px 14px" }}><Chip label={d.dspt} tone={dsptTone(d.dspt)} /></td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: d.cqc.includes("Inadequate") ? C.bad : d.cqc.includes("Requires") ? C.warn : C.good, fontWeight: 600 }}>{d.cqc}</td>
                <td style={{ padding: "11px 14px", fontSize: 12 }}>
                  <span style={{ color: d.cqcAge > 12 ? C.warn : C.muted }}>{d.cqcAge} mo{d.cqcAge > 12 ? " · stale" : ""}</span>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  {dqOpp(d) ? <Chip label="Strong" tone="good" /> : <Chip label="Limited" tone="off" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10 }}><Src>DQMI (per-dataset) · DSP Toolkit · {SECTION_SOURCE.cqc} · submission-completeness checks (silver layer)</Src></div>
    </div>
  );
}

/* ============================================================================
   PAGE 8 — PROCUREMENT & SALES INTENT
============================================================================ */
function Procurement({ data, onPick }) {
  const sorted = [...data].sort((a, b) => b.buyer - a.buyer);
  return (
    <div>
      <PageHead kicker="Page 8 · Buyer openness" title="Procurement & Sales Intent"
        blurb="Is there a route in? Live tender notices, board-paper signals, framework presence and known relationships indicate whether a trust actually goes to market — and how warm the approach is likely to be. This is the difference between a good-fit target and an actionable one." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {sorted.map((d) => (
          <div key={d.code} onClick={() => onPick(d.code)} style={{ ...card(), cursor: "pointer", borderLeft: `4px solid ${d.buyer >= 70 ? C.good : d.buyer >= 55 ? C.mid : C.bandD}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 600, color: C.ink }}>{d.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{d.region} · {d.icb}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>Buyer openness</div>
                <div style={{ fontFamily: "Poppins", fontSize: 24, fontWeight: 700, color: C.purple, lineHeight: 1 }}>{d.buyer}</div>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: .4, marginBottom: 5 }}>Procurement notices</div>
              {d.procurement.length ? d.procurement.map((p, j) => {
                const tm = noticeTiming(p);
                return (
                  <div key={j} style={{ padding: "6px 0", borderBottom: j < d.procurement.length - 1 ? `1px solid ${C.line}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                      <span style={{ color: C.ink, fontWeight: 600 }}>{p.k}</span>
                      <span style={{ color: p.d === "live" ? C.good : C.mid, fontWeight: 600 }}>{p.v} · {p.d}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 3, fontSize: 11, color: C.muted }}>
                      <span>Notice {tm.notice}</span>
                      <span>{tm.dl}</span>
                      <span>{tm.end}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Buyer match
                        <span style={{ fontWeight: 600, color: tm.mc === "Exact" ? C.good : tm.mc === "High" ? C.mid : C.warn }}>{tm.mc}</span>
                      </span>
                    </div>
                  </div>
                );
              }) : <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>No notices in last 24 months</div>}
            </div>
            <div style={{ display: "flex", gap: 14, borderTop: `1px solid ${C.line}`, paddingTop: 10, flexWrap: "wrap" }}>
              <Inline label="Board signal" value={d.board} sc="curated" />
              <Inline label="Route to market" value={d.route} sc="curated" />
              <div style={{ flex: 1, minWidth: 130 }}>
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: .4, marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                  <SrcDot k="crm" />CRM
                </div>
                <Chip label={d.crm} tone={crmTone(d.crm)} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: C.muted, alignItems: "center", flexWrap: "wrap" }}>
        <b style={{ color: C.ink, fontWeight: 600 }}>Source confidence:</b>
        {["public", "inferred", "curated", "crm"].map((k) => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><SrcDot k={k} />{SRC_CONF_LABEL[k]}</span>
        ))}
        <span style={{ fontStyle: "italic" }}>Notices are confirmed; board signals, route and CRM are curated/manual — expect these sparse until CRM and board-paper inputs are loaded.</span>
      </div>
      <div style={{ marginTop: 10 }}><Src detail="Find a Tender OCDS API + Contracts Finder V2 API (near-real-time) with an NHS buyer alias table and match-confidence score · board-paper signals, framework/route and CRM are curated/manual inputs">Find a Tender + Contracts Finder (buyer alias + match confidence) · board signals, route &amp; CRM curated</Src></div>
    </div>
  );
}

/* Synthesises notice timing + buyer-match confidence from notice stage.
   In production these come from the procurement APIs and the buyer alias table. */
function noticeTiming(p) {
  if (p.d === "live") return { notice: "Apr 2026", dl: "Deadline Jul 2026", end: "—", mc: "Exact" };
  if (p.d.startsWith("awarded")) return { notice: "Feb 2026", dl: "Awarded", end: "Contract ends 2029", mc: "Exact" };
  if (p.d === "planning") return { notice: "—", dl: "Expected Q3 2026", end: "—", mc: "High" };
  return { notice: "—", dl: "Early engagement", end: "—", mc: "Fuzzy" };
}

const Inline = ({ label, value, sc, emptyLabel = "Not yet loaded" }) => (
  <div style={{ flex: 1, minWidth: 130 }}>
    <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: .4, marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
      {sc && <SrcDot k={sc} />}{label}
    </div>
    {value === "—" || value == null
      ? <NotYet label={emptyLabel} />
      : <div style={{ fontSize: 12, color: C.ink, fontWeight: 500, lineHeight: 1.35 }}>{value}</div>}
  </div>
);

/* ============================================================================
   PAGE 9 — GEOGRAPHY & SYSTEM CONTEXT
============================================================================ */
function Geography({ data, onPick }) {
  const pts = data.map((d) => ({ ...d, x: d.pop, y: d.imd, z: d.income }));
  const REGION_COLOUR = {
    "North West": C.purple, "North East": C.bright, "Yorkshire & Humber": C.mid, "Midlands": "#9B6FD0",
    "East of England": "#C77DFF", "London": "#7B2CBF", "South East": "#5A189A", "South West": "#B084D6",
  };
  return (
    <div>
      <PageHead kicker="Page 9 · Population & inequality" title="Geography & System Context"
        blurb="Who do they serve? Catchment scale and deprivation shape demand, access and inequality narratives — and let you tailor the pitch in trust-specific language. Catchment here is a modelled, site-based estimate (see Methodology), not an official trust boundary." />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={card()}>
          <SectionTitle>Catchment population × deprivation</SectionTitle>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 20, bottom: 36, left: 8 }}>
                <CartesianGrid stroke={C.line} />
                <XAxis type="number" dataKey="x" name="Catchment" tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "Catchment population (000s) →", position: "bottom", offset: 14, fontSize: 12, fill: C.ink }} />
                <YAxis type="number" dataKey="y" domain={[1, 10]} reversed tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "← more deprived   (weighted IMD decile)", angle: -90, position: "insideLeft", fontSize: 11, fill: C.ink }} />
                <ZAxis type="number" dataKey="z" range={[120, 800]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<GeoTip />} />
                <Scatter data={pts} onClick={(e) => e && onPick(e.code)} cursor="pointer">
                  {pts.map((d) => <Cell key={d.code} fill={REGION_COLOUR[d.region] || C.mid} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Bubble size = operating income. Lower decile = more deprived catchment.</div>
        </div>
        <div style={card()}>
          <SectionTitle>Region mix</SectionTitle>
          {Object.entries(data.reduce((a, d) => { a[d.region] = (a[d.region] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]).map(([r, n]) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: REGION_COLOUR[r] || C.mid, display: "inline-block" }} />
              <span style={{ flex: 1, fontSize: 12.5, color: C.ink }}>{r}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{n}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>
            In production this page carries a true geographic map with drive-time catchment isochrones. Region grouping shown here as a synthetic placeholder.
          </div>
        </div>
      </div>
      <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8FC", borderBottom: `2px solid ${C.line}` }}>
              {[["Trust", null], ["ICB", "public"], ["Catchment", "curated"], ["Deprivation", "public"], ["65+ share", "public"], ["Minority ethnic", "deferred"], ["Rural", "deferred"]].map(([h, sc]) => (
                <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 10.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: .4 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{sc && <SrcDot k={sc} />}{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...data].sort((a, b) => a.imd - b.imd).map((d, i) => (
              <tr key={d.code} onClick={() => onPick(d.code)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer", background: i % 2 ? "#FCFBFE" : "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F0FA")} onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 ? "#FCFBFE" : "#fff")}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: C.ink }}>{d.name}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{d.icb}</td>
                <td style={{ padding: "10px 14px", fontSize: 12.5 }}>{d.pop}k</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: d.imd <= 3 ? C.bad : d.imd <= 6 ? C.warn : C.good }}>Decile {d.imd}</span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12.5 }}>{d.age65}%</td>
                <td style={{ padding: "10px 14px" }}><NotYet /></td>
                <td style={{ padding: "10px 14px" }}><NotYet /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10 }}><Src detail="IMD 2025 (MHCLG, periodic) · ONS LSOA population (annual) · Census 2021 ethnicity via Nomis and Rural-Urban Classification are planned for after v1 · catchment is a modelled site-based bridge">IMD 2025 · ONS population · modelled site-based catchment · ethnicity &amp; rurality planned post-v1</Src></div>
    </div>
  );
}

const GeoTip = ({ payload }) => {
  if (!payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tip()}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{d.region} · {d.pop}k catchment</div>
      <div style={{ fontSize: 11, color: C.muted }}>IMD decile {d.imd} · 65+ {d.age65}%</div>
    </div>
  );
};

/* ============================================================================
   PAGE 10 — METHODOLOGY & SOURCE AUDIT
============================================================================ */
function Methodology() {
  const [group, setGroup] = useState("All");
  const [mode, setMode] = useState("Simple");
  const groups = ["All", ...Array.from(new Set(SOURCES.map((s) => s.grp)))];
  const rows = group === "All" ? SOURCES : SOURCES.filter((s) => s.grp === group);
  const counts = {
    total: SOURCES.length,
    must: SOURCES.filter((s) => s.pri.startsWith("Must")).length,
    fresh: SOURCES.filter((s) => s.fresh === "fresh").length,
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <PageHead kicker="Page 10 · Governance & credibility"
          title="Methodology & Source Audit"
          blurb="Every score is reproducible and attributable. This page sets out how the target score is built and, for analysts, the full source audit and limitations. The score is a commercial prioritisation index — not an official NHS performance rating." />
        <div style={{ display: "flex", gap: 6, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 999, padding: 4 }}>
          {[["Simple", "Sales & leadership"], ["Full", "Analyst / governance"]].map(([m, sub]) => (
            <button key={m} onClick={() => setMode(m)} title={sub} style={{
              border: "none", borderRadius: 999, padding: "7px 14px", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
              background: mode === m ? C.purple : "transparent", color: mode === m ? "#fff" : C.muted,
            }}>{m === "Simple" ? "Simple methodology" : "Full source audit"}</button>
          ))}
        </div>
      </div>

      {/* SCORING METHODOLOGY */}
      <div style={{ ...card(), marginBottom: 16 }}>
        <SectionTitle><ScrollText size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />How the target score is built</SectionTitle>
        <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 18, fontFamily: "Poppins", fontSize: 15, fontWeight: 600, color: C.purple, textAlign: "center" }}>
          Target Score = 0.30 · Budget likelihood&nbsp; + &nbsp;0.35 · Operational pain&nbsp; + &nbsp;0.20 · Digital / capital&nbsp; + &nbsp;0.15 · Buyer openness&nbsp; − &nbsp;severe-distress penalty
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {PILLARS.map((p) => (
            <div key={p.key} style={{ border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: p.colour, color: "#fff", padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</span>
                  <span style={{ fontFamily: "Poppins", fontWeight: 700 }}>{Math.round(p.weight * 100)}%</span>
                </div>
                <div style={{ fontSize: 11, opacity: .9, marginTop: 3, lineHeight: 1.35 }}>{p.q}</div>
              </div>
              <div style={{ padding: "10px 12px" }}>
                {p.sub.map(([name, w, desc]) => (
                  <div key={name} style={{ padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: w < 0 ? C.bad : C.ink }}>{name}</span>
                      {w !== null && <span style={{ fontSize: 11, fontWeight: 600, color: w < 0 ? C.bad : C.mid }}>{w < 0 ? "" : "+"}{w.toFixed(2)}</span>}
                    </div>
                    <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.35, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BANDS + PEER RULE */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={card()}>
          <SectionTitle>Commercial bands</SectionTitle>
          {BANDS_RULE.map(([label, range, colour, meaning]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ background: colour, color: colour === C.bandD ? C.ink : "#fff", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, minWidth: 132, textAlign: "center" }}>{label}</span>
              <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 13, color: C.ink, minWidth: 72 }}>{range}</span>
              <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{meaning}</span>
            </div>
          ))}
        </div>
        <div style={{ ...card(), borderLeft: `4px solid ${C.purple}` }}>
          <SectionTitle><Layers size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Peer-group rule</SectionTitle>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: C.ink, margin: "0 0 10px" }}>
            Acute, mental-health/community and ambulance trusts are <b>scored within their own peer group first</b>. They are never compared on raw performance metrics — only on commercial dimensions after normalisation.
          </p>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: C.muted, margin: 0 }}>
            This release covers <b>acute trusts in England</b> only. Other provider types are added later with peer-specific scoring, not folded into these comparisons.
          </p>
        </div>
      </div>

      {/* DATA COVERAGE (v1) */}
      <div style={{ ...card(), marginBottom: 16 }}>
        <SectionTitle><Database size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Data coverage — v1</SectionTitle>
        <div style={{ fontSize: 12, color: C.muted, marginTop: -8, marginBottom: 14 }}>
          What feeds each pillar at first release. Confirmed feeds are live; curated inputs are hand-maintained; deferred sources are planned for after the spine is working. Fields that aren't yet available are shown as placeholders in the report, never as blanks or zeros.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {COVERAGE_V1.map((p) => (
            <div key={p.pillar} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 8 }}>{p.pillar}</div>
              {p.items.map(([label, st]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 11.5, color: st === "deferred" ? C.muted : C.ink }}>
                  <SrcDot k={st} /><span>{label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 11, color: C.muted, flexWrap: "wrap" }}>
          {["public", "curated", "deferred"].map((k) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><SrcDot k={k} />{k === "public" ? "Confirmed feed (live)" : k === "curated" ? "Curated / manual" : "Deferred to post-v1"}</span>
          ))}
        </div>
      </div>

      {/* SOURCE REGISTER */}
      {mode === "Full" && (<>
      <div style={{ ...card(), padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "16px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <SectionTitle><Database size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Source register</SectionTitle>
            <div style={{ fontSize: 12, color: C.muted, marginTop: -8, marginBottom: 12 }}>
              {counts.total} public datasets · {V1_SET.size} in the v1 spine · every extract carries publisher, grain, cadence, as-at date, destination table and a collection-ease rating (A easiest → D needs a curated bridge).
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {groups.map((g) => (
              <button key={g} onClick={() => setGroup(g)} style={{
                fontSize: 11.5, fontWeight: 500, padding: "5px 11px", borderRadius: 999, cursor: "pointer",
                background: group === g ? C.purple : "#fff", color: group === g ? "#fff" : C.muted,
                border: `1px solid ${group === g ? C.purple : C.line}`,
              }}>{g}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "#FAF8FC", borderBottom: `2px solid ${C.line}` }}>
                {["Dataset", "Publisher", "Group", "Priority", "v1", "Ease", "Grain", "Refresh", "As at", "Status", "Destination table", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: .4, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => {
                const fm = FRESH_META[s.fresh];
                return (
                  <tr key={s.ds} style={{ borderBottom: `1px solid ${C.line}`, background: i % 2 ? "#FCFBFE" : "#fff" }}>
                    <td style={{ padding: "9px 12px", maxWidth: 240 }}>
                      <div style={{ fontWeight: 600, color: C.ink }}>{s.ds}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.35, marginTop: 2 }}>{s.note}</div>
                    </td>
                    <td style={{ padding: "9px 12px", color: C.ink, whiteSpace: "nowrap" }}>{s.pub}</td>
                    <td style={{ padding: "9px 12px", color: C.muted, whiteSpace: "nowrap" }}>{s.grp}</td>
                    <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: s.pri.startsWith("Must") ? C.purple : C.muted }}>{s.pri}</span>
                    </td>
                    <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                      {V1_SET.has(s.ds) ? <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: C.purple, padding: "2px 7px", borderRadius: 999 }}>v1</span> : <span style={{ fontSize: 11, color: C.muted }}>later</span>}
                    </td>
                    <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                      <span title="Collection ease (A easiest → D needs a curated bridge)" style={{ fontSize: 11, fontWeight: 700, color: EASE_COLOUR[EASE[s.ds]] || C.muted }}>{EASE[s.ds] || "—"}</span>
                    </td>
                    <td style={{ padding: "9px 12px", color: C.muted, fontSize: 11.5 }}>{s.grain}</td>
                    <td style={{ padding: "9px 12px", color: C.muted, fontSize: 11.5, whiteSpace: "nowrap" }}>{s.refresh}</td>
                    <td style={{ padding: "9px 12px", color: C.ink, fontSize: 11.5, whiteSpace: "nowrap" }}>{s.asat}</td>
                    <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: fm.colour }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: fm.colour, display: "inline-block" }} />{fm.label}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", color: C.mid, fontSize: 11, fontFamily: "Poppins" }}>{s.dest}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <a href={s.url} target="_blank" rel="noreferrer" title={s.url}
                        style={{ color: C.bright, display: "inline-flex" }} onClick={(e) => e.stopPropagation()}>
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIMITATIONS */}
      <div style={card()}>
        <SectionTitle><ShieldCheck size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Limitations & controls</SectionTitle>
        <div style={{ fontSize: 12, color: C.muted, marginTop: -8, marginBottom: 14 }}>
          What public data can and cannot prove. These appear here so the team uses the scores responsibly.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {LIMITATIONS.map(([issue, sev, why, mit]) => (
            <div key={issue} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", borderLeft: `4px solid ${SEVERITY_COLOUR[sev]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{issue}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: SEVERITY_COLOUR[sev], padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: .4 }}>{sev}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45, marginBottom: 6 }}>{why}</div>
              <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.45 }}><b style={{ color: C.mid }}>Mitigation:</b> {mit}</div>
            </div>
          ))}
        </div>
      </div>
      </>)}

      {mode === "Simple" && (
        <div style={{ ...card(), display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 12.5 }}>
          <Info size={15} />
          The full source register ({counts.total} datasets, freshness, destination tables) and the detailed limitations are available in the <b style={{ color: C.ink, margin: "0 4px" }}>Full source audit</b> view — kept out of the sales view to stay focused.
        </div>
      )}
    </div>
  );
}
const card = () => ({ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, boxShadow: "0 1px 2px rgba(74,26,138,0.04)" });
const tip = () => ({ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 14px rgba(74,26,138,0.12)" });
const rowBtn = () => ({ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", borderBottom: `1px solid ${C.line}`, padding: "10px 0", cursor: "pointer", textAlign: "left" });
const SectionTitle = ({ children }) => <div style={{ fontFamily: "Poppins", fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 14 }}>{children}</div>;
const Src = ({ children, detail }) => (
  <div title={detail || "Full reference (publisher, cadence, as-at, link) on the Methodology & Sources page"}
    style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12, paddingTop: 8, borderTop: `1px dashed ${C.line}`, fontSize: 10.5, color: C.muted, cursor: "help" }}>
    <Database size={11} /><span style={{ textTransform: "uppercase", letterSpacing: .3, fontWeight: 600 }}>Source</span>
    <span style={{ opacity: .85 }}>{children}</span>
    <Info size={10} style={{ marginLeft: 2, opacity: .6 }} />
  </div>
);
const Chip = ({ label, tone = "neutral" }) => {
  const map = { good: C.good, warn: C.warn, bad: C.bad, brand: C.mid, neutral: C.muted, off: C.bandD };
  const c = map[tone];
  const solid = tone !== "neutral" && tone !== "off";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
      background: solid ? c : "#fff", color: solid ? "#fff" : (tone === "off" ? C.muted : C.ink),
      border: solid ? "none" : `1px solid ${tone === "off" ? C.line : C.line}`, whiteSpace: "nowrap",
    }}>{label}</span>
  );
};
const eprTone = (e) => e.startsWith("Optimising") || e.includes("advanced") ? "good" : e.startsWith("Live") ? "brand" : e.startsWith("Procuring") ? "warn" : "off";
const dsptTone = (d) => d === "Standards Met" ? "good" : d === "Approaching Standards" ? "warn" : "bad";
const crmTone = (c) => c.startsWith("Warm") ? "good" : c.startsWith("Lukewarm") ? "warn" : "off";
const CONF_COLOUR = { High: C.good, Medium: C.warn, Low: C.bad };
const SRC_CONF = { public: C.good, inferred: C.warn, curated: C.mid, crm: C.bright, deferred: "#B9B3C4" };
const SRC_CONF_LABEL = { public: "Confirmed public source", inferred: "Inferred from procurement", curated: "Curated / manual", crm: "CRM confirmed", deferred: "Not in v1 — planned" };
const SrcDot = ({ k }) => <span title={`Source: ${SRC_CONF_LABEL[k]}`} style={{ width: 8, height: 8, borderRadius: 999, background: SRC_CONF[k], display: "inline-block", flexShrink: 0 }} />;
const NotYet = ({ label = "Not in v1" }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#F4F2F7", color: C.muted, border: `1px dashed #C9C3D6`, fontSize: 11, fontWeight: 500, padding: "2px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
    <span style={{ width: 6, height: 6, borderRadius: 999, background: "#B9B3C4", display: "inline-block" }} />{label}
  </span>
);
const Confidence = ({ c, showWhy }) => (
  <span title={c.why} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
    <span style={{ width: 8, height: 8, borderRadius: 999, background: CONF_COLOUR[c.lvl], display: "inline-block" }} />
    <span style={{ fontSize: 12, fontWeight: 600, color: CONF_COLOUR[c.lvl] }}>{c.lvl}</span>
    {showWhy && <span style={{ fontSize: 11, color: C.muted }}>· {c.why}</span>}
  </span>
);
const NEXT_TONE = { "Call": "good", "Qualify funding": "warn", "Enrich": "brand", "Monitor": "neutral", "No action": "off" };
const PLAY_KIT = {
  "UEC / A&E flow": { persona: "COO / Chief Operating Officer", offer: "UEC command centre, flow analytics, discharge optimisation", proof: "A&E flow dashboard + discharge-delay model", convo: "Winter/flow pressure and the cost of 12-hour breaches" },
  "EPR optimisation & reporting": { persona: "CIO / CCIO", offer: "Post-go-live reporting, adoption analytics, benefits realisation", proof: "EPR benefits-tracking pack (PBIP/Git versioned)", convo: "Realising the value already invested in the EPR" },
  "EPR optimisation": { persona: "CIO / CCIO", offer: "Post-go-live reporting, adoption analytics, benefits realisation", proof: "EPR benefits-tracking pack", convo: "Realising the value already invested in the EPR" },
  "New hospital / estates transformation": { persona: "SRO / Programme Director", offer: "Capital PMO, benefits tracking, estates analytics", proof: "Capital programme PMO dashboard", convo: "Evidencing the NHP business case and tracking delivery" },
  "Data quality & submissions": { persona: "Chief Data Officer / Head of Information", offer: "Submissions assurance, validation, DQMI remediation", proof: "Statutory-returns QA dashboard (RTT/A&E/cancer)", convo: "De-risking national submissions and DQMI trend" },
  "Cancer / diagnostics pathway": { persona: "Cancer / Elective Director", offer: "Pathway tracking, breach prevention, PTL analytics", proof: "62-day breach-prevention model", convo: "Protecting the 62-day standard and diagnostic backlog" },
  "Finance & productivity": { persona: "CFO / Director of Finance", offer: "Productivity analytics, agency reduction, model hospital", proof: "Productivity & agency-spend dashboard", convo: "ROI-led efficiency against the in-year gap" },
  "Workforce & change readiness": { persona: "Chief People Officer", offer: "Workforce analytics, change-readiness, adoption", proof: "People-team digital adoption dashboard", convo: "Turning staff-survey signals into a change plan" },
  "Elective recovery / RTT": { persona: "Chief Operating Officer", offer: "PTL analytics, theatre productivity, RTT recovery", proof: "Elective recovery / PTL dashboard", convo: "52-week reduction and theatre utilisation" },
};
const DistressFlag = ({ small }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FCEEF0", color: C.bad, border: `1px solid ${C.bad}`, fontSize: small ? 10.5 : 11.5, fontWeight: 600, padding: small ? "2px 8px" : "3px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
    <AlertTriangle size={small ? 11 : 12} />High pain · funding route required
  </span>
);
const PageHead = ({ kicker, title, blurb }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.bright, textTransform: "uppercase", letterSpacing: 1 }}>{kicker}</div>
    <h1 style={{ fontFamily: "Poppins", fontSize: 30, fontWeight: 700, color: C.ink, margin: "2px 0 6px" }}>{title}</h1>
    <p style={{ fontSize: 14, color: C.muted, maxWidth: 880, lineHeight: 1.5, margin: 0 }}>{blurb}</p>
  </div>
);

/* ============================================================================
   APP SHELL
============================================================================ */
const NAV = [
  { id: "overview", label: "Target Overview", Icon: LayoutGrid },
  { id: "shortlist", label: "Target Shortlist", Icon: ListOrdered },
  { id: "finance", label: "Finance & Buying", Icon: PoundSterling },
  { id: "pain", label: "Operational Pain", Icon: Activity },
  { id: "digital", label: "Digital & Capital", Icon: Cpu },
  { id: "dq", label: "Data Quality & Governance", Icon: Gauge },
  { id: "procurement", label: "Procurement & Intent", Icon: ShoppingCart },
  { id: "geography", label: "Geography & Context", Icon: Globe2 },
  { id: "method", label: "Methodology & Sources", Icon: ScrollText },
  { id: "trust", label: "Trust 360", Icon: Building2, hidden: true },
];

export default function App() {
  const [page, setPage] = useState("overview");
  const [active, setActive] = useState(TRUSTS[0].code);
  const trust = useMemo(() => TRUSTS.find((t) => t.code === active), [active]);
  const goTrust = (code) => { setActive(code); setPage("trust"); };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: C.bg, minHeight: "100vh", color: C.ink, display: "flex" }}>
      <style>{FONT_LINK}</style>

      {/* sidebar */}
      <aside style={{ width: 232, background: C.purple, color: "#fff", padding: "22px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.bright, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={17} color="#fff" />
          </div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 16, letterSpacing: .3 }}>Intuita</div>
        </div>
        <div style={{ fontSize: 11, opacity: .65, marginBottom: 26, paddingLeft: 1 }}>NHS Trust Targeting</div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.filter((n) => !n.hidden).map((n) => {
            const on = page === n.id;
            return (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 9,
                background: on ? "rgba(255,255,255,0.16)" : "transparent", border: "none", color: "#fff",
                fontSize: 13.5, fontWeight: on ? 600 : 400, cursor: "pointer", textAlign: "left",
              }}>
                <n.Icon size={17} style={{ opacity: on ? 1 : .8 }} />{n.label}
              </button>
            );
          })}
          <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "10px 0" }} />
          <button onClick={() => setPage("trust")} style={{
            display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 9,
            background: page === "trust" ? "rgba(255,255,255,0.16)" : "transparent", border: "none", color: "#fff",
            fontSize: 13.5, fontWeight: page === "trust" ? 600 : 400, cursor: "pointer", textAlign: "left",
          }}>
            <Building2 size={17} style={{ opacity: page === "trust" ? 1 : .8 }} />Trust 360
          </button>
        </nav>

        <div style={{ marginTop: "auto", fontSize: 10.5, lineHeight: 1.5, opacity: .6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}><Info size={12} />Prototype</div>
          Synthetic, illustrative data. Not an official NHS performance rating — a commercial account-prioritisation tool.
        </div>
      </aside>

      {/* topbar + content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: C.paper, borderBottom: `1px solid ${C.line}`, padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, borderRadius: 9, padding: "7px 12px", width: 320 }}>
            <Search size={15} color={C.muted} />
            <span style={{ fontSize: 13, color: C.muted }}>Search trust, region, ICB or play…</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <FilterChip label="Acute" active /><FilterChip label="England" active />
            <FilterChip label="All bands" /><FilterChip label="Q1 2026/27" />
          </div>
        </div>

        <div style={{ padding: "26px 28px 60px" }}>
          {page === "overview" && <Overview data={TRUSTS} onPick={goTrust} />}
          {page === "shortlist" && <Shortlist data={TRUSTS} onPick={goTrust} />}
          {page === "finance" && <Finance data={TRUSTS} onPick={goTrust} />}
          {page === "pain" && <OperationalPain data={TRUSTS} onPick={goTrust} />}
          {page === "digital" && <DigitalCapital data={TRUSTS} onPick={goTrust} />}
          {page === "dq" && <DataQuality data={TRUSTS} onPick={goTrust} />}
          {page === "procurement" && <Procurement data={TRUSTS} onPick={goTrust} />}
          {page === "geography" && <Geography data={TRUSTS} onPick={goTrust} />}
          {page === "method" && <Methodology />}
          {page === "trust" && <Trust360 t={trust} onBack={() => setPage("shortlist")} />}
        </div>
      </main>
    </div>
  );
}

const FilterChip = ({ label, active }) => (
  <span style={{
    fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 999, cursor: "pointer",
    background: active ? C.purple : "#fff", color: active ? "#fff" : C.muted,
    border: `1px solid ${active ? C.purple : C.line}`,
  }}>{label}</span>
);
