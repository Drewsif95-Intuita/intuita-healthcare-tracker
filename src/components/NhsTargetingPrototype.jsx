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
/* Per-trust detail now comes from the real scored data (see TRUSTS_RAW). */

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

const TRUSTS_RAW = [
 {
  "code": "RJE",
  "name": "University Hospitals of North Midlands NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Teaching",
  "beds": 1418,
  "scale": 1418,
  "budget": 84.3,
  "pain": 68.8,
  "digital": 71.8,
  "buyer": null,
  "target": 75.0,
  "rawOpp": 75.0,
  "pursuitRank": 1,
  "band": "A",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 4-hour",
   "A&E 12-hour",
   "RTT 52-week"
  ],
  "trigger": "A&E 4-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour under pressure.",
  "drivers": {
   "uec": 86,
   "rtt": 67,
   "diag": 70,
   "cancer": 53,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1293,
   "margin": 1.64,
   "capital": 109.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.37,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.268,
  "shmiBand": "1.0",
  "imd": 5.3,
  "rural": null,
  "pop": 653,
  "age65": 18.4,
  "eth": 9.8,
  "lsoas": 406,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   27.1,
   26.3,
   24.3,
   25.0,
   26.9,
   26.8,
   25.6,
   24.5,
   26.7,
   23.6,
   21.8,
   22.9
  ]
 },
 {
  "code": "RX1",
  "name": "Nottingham University Hospitals NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Teaching",
  "beds": 1795,
  "scale": 1795,
  "budget": 89.2,
  "pain": 84.7,
  "digital": 70.2,
  "buyer": null,
  "target": 74.9,
  "rawOpp": 82.9,
  "pursuitRank": 99,
  "band": "C",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "A&E 4-hour",
   "Diagnostics 6-wk"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 88,
   "rtt": 73,
   "diag": 90,
   "cancer": 91,
   "dq": null
  },
  "finance": {
   "surplus": -2.0,
   "income": 1885,
   "margin": 1.14,
   "capital": 204.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 49,
  "dmaRaw": 2.46,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -2.9,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.125,
  "shmiBand": "2.0",
  "imd": 5.6,
  "rural": null,
  "pop": 838,
  "age65": 15.1,
  "eth": 19.2,
  "lsoas": 495,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   24.3,
   24.4,
   25.6,
   27.7,
   26.5,
   33.1,
   30.6,
   30.4,
   32.5,
   29.9,
   27.8,
   23.9
  ]
 },
 {
  "code": "RTG",
  "name": "University Hospitals of Derby and Burton NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Teaching",
  "beds": 1591,
  "scale": 1591,
  "budget": 89.1,
  "pain": 78.3,
  "digital": 47.4,
  "buyer": null,
  "target": 74.8,
  "rawOpp": 74.8,
  "pursuitRank": 2,
  "band": "A",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "Diagnostics 6-wk"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 73,
   "rtt": 77,
   "diag": 81,
   "cancer": 84,
   "dq": null
  },
  "finance": {
   "surplus": -2.4,
   "income": 1352,
   "margin": 2.37,
   "capital": 98.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 51,
  "dmaRaw": 2.53,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.5,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.891,
  "shmiBand": "2.0",
  "imd": 5.7,
  "rural": null,
  "pop": 900,
  "age65": 17.0,
  "eth": 12.1,
  "lsoas": 536,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.9,
   22.4,
   22.6,
   23.4,
   23.3,
   23.5,
   24.1,
   24.7,
   27.5,
   25.4,
   23.5,
   19.9
  ]
 },
 {
  "code": "R1H",
  "name": "Barts Health NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 2212,
  "scale": 2212,
  "budget": 97.7,
  "pain": 55.1,
  "digital": 52.7,
  "buyer": null,
  "target": 69.6,
  "rawOpp": 69.6,
  "pursuitRank": 3,
  "band": "B",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 12-hour",
   "RTT 18-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 67,
   "rtt": 58,
   "diag": 80,
   "cancer": 27,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 2652,
   "margin": 3.19,
   "capital": 232.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 60,
  "dmaRaw": 3.0,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.6,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.025,
  "shmiBand": "2.0",
  "imd": 3.9,
  "rural": null,
  "pop": 725,
  "age65": 7.7,
  "eth": 58.7,
  "lsoas": 388,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.2,
   22.2,
   21.7,
   23.0,
   23.1,
   22.8,
   23.0,
   23.1,
   23.1,
   21.0,
   19.6,
   18.8
  ]
 },
 {
  "code": "RHQ",
  "name": "Sheffield Teaching Hospitals NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 1639,
  "scale": 1639,
  "budget": 76.2,
  "pain": 65.5,
  "digital": 57.0,
  "buyer": null,
  "target": 67.3,
  "rawOpp": 67.3,
  "pursuitRank": 4,
  "band": "B",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer 62-day",
   "RTT 52-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 43,
   "rtt": 64,
   "diag": 97,
   "cancer": 74,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1765,
   "margin": 0.15,
   "capital": 110.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 50,
  "dmaRaw": 2.5,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 2,
  "dqmi": 89,
  "dqWeak": [],
  "shmi": 0.936,
  "shmiBand": "2.0",
  "imd": 4.8,
  "rural": null,
  "pop": 738,
  "age65": 15.8,
  "eth": 17.0,
  "lsoas": 457,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   26.2,
   24.0,
   25.3,
   26.2,
   26.0,
   26.1,
   25.5,
   26.4,
   29.0,
   25.5,
   24.2,
   15.1
  ]
 },
 {
  "code": "RTH",
  "name": "Oxford University Hospitals NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Teaching",
  "beds": 1103,
  "scale": 1103,
  "budget": 87.7,
  "pain": 51.0,
  "digital": 62.8,
  "buyer": null,
  "target": 66.7,
  "rawOpp": 66.7,
  "pursuitRank": 5,
  "band": "B",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Cancer 62-day",
   "RTT 52-week",
   "Diagnostics 6-wk"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 9,
   "rtt": 72,
   "diag": 66,
   "cancer": 65,
   "dq": null
  },
  "finance": {
   "surplus": -1.0,
   "income": 1752,
   "margin": 1.64,
   "capital": 174.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 46,
  "dmaRaw": 2.3,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.9,
  "shmiBand": "2.0",
  "imd": 7.3,
  "rural": null,
  "pop": 971,
  "age65": 15.4,
  "eth": 15.0,
  "lsoas": 571,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.3,
   20.6,
   19.7,
   22.2,
   21.1,
   20.1,
   20.3,
   20.4,
   21.1,
   20.0,
   19.9,
   8.8
  ]
 },
 {
  "code": "RWA",
  "name": "Hull University Teaching Hospitals NHS Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 1199,
  "scale": 1199,
  "budget": 71.1,
  "pain": 78.8,
  "digital": 69.7,
  "buyer": null,
  "target": 65.9,
  "rawOpp": 73.9,
  "pursuitRank": 100,
  "band": "C",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "Cancer 62-day",
   "RTT 52-week",
   "RTT 18-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 47,
   "rtt": 97,
   "diag": 87,
   "cancer": 88,
   "dq": null
  },
  "finance": {
   "surplus": -1.4,
   "income": 993,
   "margin": 0.57,
   "capital": 103.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 48,
  "dmaRaw": 2.4,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.9,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 95,
  "dqWeak": [],
  "shmi": 1.074,
  "shmiBand": "2.0",
  "imd": 5.2,
  "rural": null,
  "pop": 632,
  "age65": 18.2,
  "eth": 5.6,
  "lsoas": 397,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   30.1,
   30.5,
   29.7,
   30.8,
   30.3,
   28.6,
   30.1,
   31.2,
   33.3,
   28.4,
   26.1,
   15.7
  ]
 },
 {
  "code": "RAJ",
  "name": "Mid and South Essex NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Large",
  "beds": 1834,
  "scale": 1834,
  "budget": 73.4,
  "pain": 86.1,
  "digital": 50.3,
  "buyer": null,
  "target": 65.2,
  "rawOpp": 73.2,
  "pursuitRank": 101,
  "band": "C",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "Cancer 62-day"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 57,
   "rtt": 100,
   "diag": 96,
   "cancer": 97,
   "dq": null
  },
  "finance": {
   "surplus": -5.6,
   "income": 1703,
   "margin": -0.18,
   "capital": 181.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 49,
  "dmaRaw": 2.44,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -4.2,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.107,
  "shmiBand": "2.0",
  "imd": 6.1,
  "rural": null,
  "pop": 1088,
  "age65": 16.9,
  "eth": 12.1,
  "lsoas": 652,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   31.9,
   31.4,
   29.1,
   30.4,
   30.2,
   30.9,
   30.8,
   32.6,
   33.9,
   31.8,
   31.8,
   17.4
  ]
 },
 {
  "code": "RAL",
  "name": "Royal Free London NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 1529,
  "scale": 1529,
  "budget": 83.8,
  "pain": 44.7,
  "digital": 68.1,
  "buyer": null,
  "target": 64.0,
  "rawOpp": 64.0,
  "pursuitRank": 6,
  "band": "B",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 12-hour",
   "Cancer FDS",
   "RTT 52-week"
  ],
  "trigger": "A&E 12-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour under pressure.",
  "drivers": {
   "uec": 45,
   "rtt": 52,
   "diag": 51,
   "cancer": 34,
   "dq": null
  },
  "finance": {
   "surplus": -2.0,
   "income": 1878,
   "margin": 0.59,
   "capital": 281.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 45,
  "dmaRaw": 2.24,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -0.2,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 89,
  "dqWeak": [],
  "shmi": 0.862,
  "shmiBand": "2.0",
  "imd": 4.5,
  "rural": null,
  "pop": 983,
  "age65": 11.6,
  "eth": 43.6,
  "lsoas": 557,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   24.1,
   23.3,
   22.0,
   21.6,
   20.3,
   19.4,
   19.6,
   19.0,
   19.4,
   17.7,
   16.6,
   15.0
  ]
 },
 {
  "code": "RR8",
  "name": "Leeds Teaching Hospitals NHS Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 1931,
  "scale": 1931,
  "budget": 83.2,
  "pain": 41.4,
  "digital": 73.0,
  "buyer": null,
  "target": 63.6,
  "rawOpp": 63.6,
  "pursuitRank": 7,
  "band": "B",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "Cancer 62-day",
   "A&E 4-hour"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 33,
   "rtt": 53,
   "diag": 25,
   "cancer": 45,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 2125,
   "margin": 0.52,
   "capital": 180.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 50,
  "dmaRaw": 2.49,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.9,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 41,
  "dqWeak": [],
  "shmi": 1.124,
  "shmiBand": "2.0",
  "imd": 4.8,
  "rural": null,
  "pop": 627,
  "age65": 13.3,
  "eth": 20.8,
  "lsoas": 378,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.1,
   21.5,
   19.9,
   20.0,
   19.4,
   19.6,
   19.2,
   19.2,
   20.0,
   18.2,
   16.4,
   13.8
  ]
 },
 {
  "code": "RJZ",
  "name": "King's College Hospital NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 1477,
  "scale": 1477,
  "budget": 79.4,
  "pain": 57.2,
  "digital": 49.9,
  "buyer": null,
  "target": 63.3,
  "rawOpp": 63.3,
  "pursuitRank": 8,
  "band": "B",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "RTT 52-week",
   "Diagnostics 6-wk"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 54,
   "rtt": 53,
   "diag": 64,
   "cancer": 61,
   "dq": null
  },
  "finance": {
   "surplus": -4.1,
   "income": 1936,
   "margin": 0.17,
   "capital": 155.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 50,
  "dmaRaw": 2.51,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.2,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 0.965,
  "shmiBand": "2.0",
  "imd": 5.7,
  "rural": null,
  "pop": 505,
  "age65": 11.9,
  "eth": 35.0,
  "lsoas": 289,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   26.1,
   25.6,
   26.7,
   26.7,
   27.9,
   27.7,
   26.8,
   25.8,
   26.5,
   23.3,
   20.0,
   17.2
  ]
 },
 {
  "code": "RTD",
  "name": "The Newcastle Upon Tyne Hospitals NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 1562,
  "scale": 1562,
  "budget": 89.8,
  "pain": 34.5,
  "digital": 72.8,
  "buyer": null,
  "target": 63.0,
  "rawOpp": 63.0,
  "pursuitRank": 9,
  "band": "B",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer 62-day",
   "Diagnostics 6-wk",
   "RTT 52-week"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 19,
   "rtt": 27,
   "diag": 49,
   "cancer": 49,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1773,
   "margin": 1.95,
   "capital": 137.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.36,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 0.853,
  "shmiBand": "3.0",
  "imd": 5.0,
  "rural": null,
  "pop": 483,
  "age65": 16.0,
  "eth": 13.3,
  "lsoas": 302,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   17.1,
   17.7,
   16.7,
   18.2,
   18.9,
   18.1,
   19.0,
   19.5,
   21.0,
   17.1,
   16.2,
   11.0
  ]
 },
 {
  "code": "RGN",
  "name": "North West Anglia NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Large",
  "beds": 1108,
  "scale": 1108,
  "budget": 70.3,
  "pain": 61.0,
  "digital": 54.9,
  "buyer": null,
  "target": 62.8,
  "rawOpp": 62.8,
  "pursuitRank": 10,
  "band": "B",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "RTT 18-week",
   "Cancer 62-day"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 64,
   "rtt": 54,
   "diag": 91,
   "cancer": 49,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 781,
   "margin": 1.09,
   "capital": 54.9,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 41,
  "dmaRaw": 2.04,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.2,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 1.0,
  "shmiBand": "2.0",
  "imd": 6.0,
  "rural": null,
  "pop": 291,
  "age65": 15.9,
  "eth": 13.3,
  "lsoas": 170,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   25.9,
   25.3,
   24.1,
   25.6,
   26.5,
   24.1,
   23.7,
   24.6,
   27.1,
   24.0,
   23.1,
   18.5
  ]
 },
 {
  "code": "RXQ",
  "name": "Buckinghamshire Healthcare NHS Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Multi-Service",
  "beds": 532,
  "scale": 532,
  "budget": 62.0,
  "pain": 53.6,
  "digital": 76.6,
  "buyer": null,
  "target": 62.0,
  "rawOpp": 62.0,
  "pursuitRank": 11,
  "band": "B",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "Diagnostics 6-wk",
   "Cancer 62-day"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 53,
   "rtt": 30,
   "diag": 68,
   "cancer": 71,
   "dq": null
  },
  "finance": {
   "surplus": -1.8,
   "income": 710,
   "margin": 0.58,
   "capital": 106.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 45,
  "dmaRaw": 2.26,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 86,
  "dqWeak": [],
  "shmi": 0.807,
  "shmiBand": "3.0",
  "imd": 7.6,
  "rural": null,
  "pop": 630,
  "age65": 15.6,
  "eth": 18.1,
  "lsoas": 386,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.0,
   22.1,
   22.9,
   24.1,
   22.4,
   21.9,
   22.6,
   22.6,
   23.1,
   22.2,
   19.6,
   17.1
  ]
 },
 {
  "code": "RYR",
  "name": "University Hospitals Sussex NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Teaching",
  "beds": 1967,
  "scale": 1967,
  "budget": 69.6,
  "pain": 67.3,
  "digital": 75.0,
  "buyer": null,
  "target": 61.9,
  "rawOpp": 69.9,
  "pursuitRank": 102,
  "band": "C",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "RTT 52-week",
   "A&E 4-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 70,
   "rtt": 98,
   "diag": 1,
   "cancer": 67,
   "dq": null
  },
  "finance": {
   "surplus": -1.6,
   "income": 1698,
   "margin": -0.76,
   "capital": 227.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 38,
  "dmaRaw": 1.9,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 1.023,
  "shmiBand": "2.0",
  "imd": 6.4,
  "rural": null,
  "pop": 1024,
  "age65": 18.2,
  "eth": 9.5,
  "lsoas": 618,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   24.1,
   23.3,
   23.2,
   25.1,
   25.4,
   24.3,
   22.9,
   23.4,
   25.5,
   23.8,
   20.2,
   20.3
  ]
 },
 {
  "code": "RH8",
  "name": "Royal Devon University Healthcare NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Large",
  "beds": 1160,
  "scale": 1160,
  "budget": 62.0,
  "pain": 64.6,
  "digital": 56.6,
  "buyer": null,
  "target": 61.8,
  "rawOpp": 61.8,
  "pursuitRank": 12,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 4-hour",
   "RTT 52-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 55,
   "rtt": 73,
   "diag": 86,
   "cancer": 56,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1215,
   "margin": -1.45,
   "capital": 155.2,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 50,
  "dmaRaw": 2.51,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 85,
  "dqWeak": [],
  "shmi": 0.955,
  "shmiBand": "2.0",
  "imd": 5.8,
  "rural": null,
  "pop": 555,
  "age65": 21.5,
  "eth": 4.3,
  "lsoas": 324,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.2,
   22.8,
   23.0,
   23.2,
   24.5,
   23.4,
   21.7,
   21.4,
   24.1,
   21.8,
   21.4,
   17.7
  ]
 },
 {
  "code": "RHM",
  "name": "University Hospital Southampton NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Teaching",
  "beds": 1284,
  "scale": 1284,
  "budget": 71.9,
  "pain": 46.0,
  "digital": 71.9,
  "buyer": null,
  "target": 61.2,
  "rawOpp": 61.2,
  "pursuitRank": 13,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "Cancer FDS"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 16,
   "rtt": 73,
   "diag": 54,
   "cancer": 45,
   "dq": null
  },
  "finance": {
   "surplus": -1.0,
   "income": 1454,
   "margin": -0.21,
   "capital": 158.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 48,
  "dmaRaw": 2.41,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -2.8,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 93,
  "dqWeak": [],
  "shmi": 0.81,
  "shmiBand": "3.0",
  "imd": 6.0,
  "rural": null,
  "pop": 608,
  "age65": 17.3,
  "eth": 11.1,
  "lsoas": 373,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.1,
   19.5,
   17.7,
   18.1,
   19.0,
   20.0,
   19.5,
   19.7,
   19.5,
   16.9,
   16.5,
   10.7
  ]
 },
 {
  "code": "RC9",
  "name": "Bedfordshire Hospitals NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Medium",
  "beds": 1137,
  "scale": 1137,
  "budget": 64.9,
  "pain": 53.9,
  "digital": 68.3,
  "buyer": null,
  "target": 61.1,
  "rawOpp": 61.1,
  "pursuitRank": 14,
  "band": "C",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "RTT 18-week",
   "Cancer 62-day"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 24,
   "rtt": 51,
   "diag": 87,
   "cancer": 70,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 911,
   "margin": 0.11,
   "capital": 143.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 40,
  "dmaRaw": 2.0,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -1.4,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 96,
  "dqWeak": [],
  "shmi": 0.978,
  "shmiBand": "2.0",
  "imd": 5.7,
  "rural": null,
  "pop": 574,
  "age65": 13.5,
  "eth": 29.4,
  "lsoas": 338,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.6,
   21.6,
   22.1,
   21.0,
   22.0,
   22.3,
   22.0,
   21.3,
   24.0,
   21.3,
   20.4,
   12.3
  ]
 },
 {
  "code": "RRV",
  "name": "University College London Hospitals NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 899,
  "scale": 899,
  "budget": 93.6,
  "pain": 39.1,
  "digital": 50.9,
  "buyer": null,
  "target": 61.1,
  "rawOpp": 61.1,
  "pursuitRank": 15,
  "band": "C",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "RTT 52-week",
   "RTT 18-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 10,
   "rtt": 68,
   "diag": 79,
   "cancer": 19,
   "dq": null
  },
  "finance": {
   "surplus": 0.7,
   "income": 1780,
   "margin": 2.79,
   "capital": 219.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 68,
  "dmaRaw": 3.39,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.1,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 85,
  "dqWeak": [],
  "shmi": 0.829,
  "shmiBand": "3.0",
  "imd": 4.5,
  "rural": null,
  "pop": 202,
  "age65": 10.2,
  "eth": 44.4,
  "lsoas": 114,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.4,
   17.4,
   16.6,
   16.3,
   17.5,
   17.0,
   17.5,
   18.7,
   20.1,
   18.0,
   16.7,
   9.1
  ]
 },
 {
  "code": "RD8",
  "name": "Milton Keynes University Hospital NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Teaching",
  "beds": 615,
  "scale": 615,
  "budget": 52.8,
  "pain": 71.8,
  "digital": 54.4,
  "buyer": null,
  "target": 61.0,
  "rawOpp": 61.0,
  "pursuitRank": 16,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "Cancer 62-day",
   "A&E 4-hour"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 55,
   "rtt": 83,
   "diag": 62,
   "cancer": 82,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 445,
   "margin": 1.03,
   "capital": 68.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 41,
  "dmaRaw": 2.07,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.121,
  "shmiBand": "2.0",
  "imd": 6.1,
  "rural": null,
  "pop": 222,
  "age65": 12.4,
  "eth": 27.3,
  "lsoas": 126,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   26.2,
   23.4,
   23.0,
   24.1,
   24.7,
   25.5,
   25.6,
   22.6,
   26.5,
   22.9,
   20.7,
   17.7
  ]
 },
 {
  "code": "RM3",
  "name": "Northern Care Alliance NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 1598,
  "scale": 1598,
  "budget": 61.1,
  "pain": 66.3,
  "digital": 84.7,
  "buyer": null,
  "target": 60.8,
  "rawOpp": 68.8,
  "pursuitRank": 103,
  "band": "C",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "A&E 12-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 71,
   "rtt": 95,
   "diag": 40,
   "cancer": 46,
   "dq": null
  },
  "finance": {
   "surplus": -3.1,
   "income": 2013,
   "margin": -2.7,
   "capital": 211.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 39,
  "dmaRaw": 1.93,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 0.964,
  "shmiBand": "2.0",
  "imd": 3.8,
  "rural": null,
  "pop": 801,
  "age65": 13.7,
  "eth": 26.7,
  "lsoas": 473,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.4,
   22.6,
   21.4,
   22.3,
   21.7,
   22.7,
   22.2,
   22.6,
   22.8,
   21.3,
   19.0,
   19.1
  ]
 },
 {
  "code": "RJ7",
  "name": "St George's University Hospitals NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 889,
  "scale": 889,
  "budget": 75.9,
  "pain": 37.6,
  "digital": 77.2,
  "buyer": null,
  "target": 60.5,
  "rawOpp": 60.5,
  "pursuitRank": 17,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "Cancer FDS",
   "Cancer 62-day"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": 29,
   "rtt": 49,
   "diag": 23,
   "cancer": 42,
   "dq": null
  },
  "finance": {
   "surplus": -3.3,
   "income": 1328,
   "margin": 0.51,
   "capital": 147.2,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 46,
  "dmaRaw": 2.29,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.854,
  "shmiBand": "3.0",
  "imd": 6.2,
  "rural": null,
  "pop": 127,
  "age65": 8.3,
  "eth": 33.9,
  "lsoas": 72,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.0,
   17.8,
   18.7,
   21.8,
   21.2,
   19.4,
   18.4,
   16.4,
   18.8,
   17.2,
   16.3,
   13.3
  ]
 },
 {
  "code": "RBD",
  "name": "Dorset County Hospital NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Small",
  "beds": 365,
  "scale": 365,
  "budget": 56.7,
  "pain": 65.6,
  "digital": 56.8,
  "buyer": null,
  "target": 60.4,
  "rawOpp": 60.4,
  "pursuitRank": 18,
  "band": "C",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Cancer 62-day",
   "Diagnostics 6-wk",
   "RTT 18-week"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 49,
   "rtt": 62,
   "diag": 72,
   "cancer": 99,
   "dq": null
  },
  "finance": {
   "surplus": -3.2,
   "income": 353,
   "margin": 5.01,
   "capital": 50.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 43,
  "dmaRaw": 2.17,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.015,
  "shmiBand": "2.0",
  "imd": 5.4,
  "rural": null,
  "pop": 260,
  "age65": 23.5,
  "eth": 4.8,
  "lsoas": 150,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.2,
   21.4,
   21.7,
   23.5,
   24.2,
   28.0,
   22.5,
   22.9,
   23.8,
   20.6,
   27.8,
   16.2
  ]
 },
 {
  "code": "RM1",
  "name": "Norfolk and Norwich University Hospitals NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Teaching",
  "beds": 995,
  "scale": 995,
  "budget": 83.9,
  "pain": 47.3,
  "digital": 46.3,
  "buyer": null,
  "target": 60.0,
  "rawOpp": 60.0,
  "pursuitRank": 19,
  "band": "C",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "RTT 52-week",
   "Cancer 62-day",
   "RTT 18-week"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 13,
   "rtt": 77,
   "diag": 49,
   "cancer": 51,
   "dq": null
  },
  "finance": {
   "surplus": -0.3,
   "income": 1083,
   "margin": 2.2,
   "capital": 86.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.36,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 95,
  "dqWeak": [],
  "shmi": 1.164,
  "shmiBand": "1.0",
  "imd": 5.7,
  "rural": null,
  "pop": 686,
  "age65": 21.2,
  "eth": 5.6,
  "lsoas": 414,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   25.9,
   25.4,
   23.2,
   24.0,
   24.2,
   22.2,
   21.2,
   20.8,
   22.3,
   19.7,
   17.5,
   10.1
  ]
 },
 {
  "code": "RA9",
  "name": "Torbay and South Devon NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Multi-Service",
  "beds": 385,
  "scale": 385,
  "budget": 31.4,
  "pain": 75.9,
  "digital": 74.7,
  "buyer": null,
  "target": 59.9,
  "rawOpp": 59.9,
  "pursuitRank": 20,
  "band": "C",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "A&E 4-hour",
   "Cancer 62-day",
   "Diagnostics 6-wk"
  ],
  "trigger": "A&E 4-hour worsening",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour worsening.",
  "drivers": {
   "uec": 74,
   "rtt": 59,
   "diag": 92,
   "cancer": 88,
   "dq": null
  },
  "finance": {
   "surplus": -5.5,
   "income": 729,
   "margin": -5.84,
   "capital": 82.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 30,
  "dmaRaw": 1.51,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 0.951,
  "shmiBand": "2.0",
  "imd": 5.2,
  "rural": null,
  "pop": 302,
  "age65": 23.0,
  "eth": 3.3,
  "lsoas": 191,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   24.1,
   23.4,
   24.8,
   25.0,
   25.6,
   22.3,
   22.0,
   20.5,
   25.8,
   23.5,
   25.9,
   22.8
  ]
 },
 {
  "code": "RGT",
  "name": "Cambridge University Hospitals NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Teaching",
  "beds": 1127,
  "scale": 1127,
  "budget": 71.5,
  "pain": 62.9,
  "digital": 36.5,
  "buyer": null,
  "target": 59.7,
  "rawOpp": 59.7,
  "pursuitRank": 21,
  "band": "C",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "A&E 4-hour",
   "Diagnostics 6-wk",
   "RTT 52-week"
  ],
  "trigger": "A&E 4-hour worsening",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour worsening.",
  "drivers": {
   "uec": 76,
   "rtt": 71,
   "diag": 83,
   "cancer": 32,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1627,
   "margin": -0.42,
   "capital": 158.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 59,
  "dmaRaw": 2.94,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.4,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 2,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 0.986,
  "shmiBand": "2.0",
  "imd": 6.9,
  "rural": null,
  "pop": 626,
  "age65": 14.9,
  "eth": 13.9,
  "lsoas": 356,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.8,
   19.7,
   21.1,
   20.6,
   22.1,
   20.5,
   19.6,
   21.1,
   24.0,
   21.8,
   21.0,
   21.5
  ]
 },
 {
  "code": "RWP",
  "name": "Worcestershire Acute Hospitals NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Large",
  "beds": 942,
  "scale": 942,
  "budget": 76.0,
  "pain": 77.9,
  "digital": 36.5,
  "buyer": null,
  "target": 59.5,
  "rawOpp": 67.5,
  "pursuitRank": 104,
  "band": "C",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "Cancer 62-day",
   "Cancer FDS",
   "A&E 4-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 75,
   "rtt": 69,
   "diag": 75,
   "cancer": 92,
   "dq": null
  },
  "finance": {
   "surplus": -6.5,
   "income": 807,
   "margin": 2.22,
   "capital": 70.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 53,
  "dmaRaw": 2.64,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -1.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 95,
  "dqWeak": [],
  "shmi": 1.107,
  "shmiBand": "2.0",
  "imd": 6.1,
  "rural": null,
  "pop": 374,
  "age65": 20.8,
  "eth": 5.0,
  "lsoas": 230,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   25.9,
   25.3,
   25.6,
   25.3,
   27.6,
   26.6,
   26.2,
   26.7,
   29.2,
   25.4,
   24.7,
   20.9
  ]
 },
 {
  "code": "RKB",
  "name": "University Hospitals Coventry and Warwickshire NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Teaching",
  "beds": 1150,
  "scale": 1150,
  "budget": 86.9,
  "pain": 54.4,
  "digital": 26.5,
  "buyer": null,
  "target": 59.3,
  "rawOpp": 59.3,
  "pursuitRank": 22,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "RTT 52-week",
   "A&E 12-hour"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": 63,
   "rtt": 91,
   "diag": 26,
   "cancer": 23,
   "dq": null
  },
  "finance": {
   "surplus": -1.6,
   "income": 1126,
   "margin": 2.6,
   "capital": 70.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 58,
  "dmaRaw": 2.91,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 1.208,
  "shmiBand": "1.0",
  "imd": 4.5,
  "rural": null,
  "pop": 314,
  "age65": 12.7,
  "eth": 32.9,
  "lsoas": 184,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.4,
   21.5,
   20.1,
   19.7,
   20.3,
   22.0,
   20.7,
   20.8,
   21.6,
   19.8,
   16.9,
   18.1
  ]
 },
 {
  "code": "R0A",
  "name": "Manchester University NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 2275,
  "scale": 2275,
  "budget": 88.9,
  "pain": 39.5,
  "digital": 46.9,
  "buyer": null,
  "target": 58.7,
  "rawOpp": 58.7,
  "pursuitRank": 23,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "A&E 4-hour",
   "RTT 52-week"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": 32,
   "rtt": 57,
   "diag": 28,
   "cancer": 35,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 3099,
   "margin": 1.01,
   "capital": 200.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 68,
  "dmaRaw": 3.41,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 1.042,
  "shmiBand": "2.0",
  "imd": 4.1,
  "rural": null,
  "pop": 681,
  "age65": 11.4,
  "eth": 33.7,
  "lsoas": 385,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.6,
   22.5,
   22.2,
   23.0,
   23.2,
   21.7,
   20.9,
   19.6,
   20.4,
   17.7,
   16.0,
   13.3
  ]
 },
 {
  "code": "RVJ",
  "name": "North Bristol NHS Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Large",
  "beds": 1066,
  "scale": 1066,
  "budget": 85.8,
  "pain": 35.1,
  "digital": 56.3,
  "buyer": null,
  "target": 58.0,
  "rawOpp": 58.0,
  "pursuitRank": 24,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer 62-day",
   "A&E 4-hour",
   "Cancer FDS"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 50,
   "rtt": 16,
   "diag": 3,
   "cancer": 55,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1051,
   "margin": 2.98,
   "capital": 75.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 43,
  "dmaRaw": 2.14,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 2,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 0.95,
  "shmiBand": "2.0",
  "imd": 6.5,
  "rural": null,
  "pop": 826,
  "age65": 15.5,
  "eth": 11.5,
  "lsoas": 494,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.7,
   18.6,
   17.8,
   18.0,
   18.8,
   19.2,
   17.9,
   19.2,
   21.7,
   18.6,
   16.6,
   16.6
  ]
 },
 {
  "code": "RN3",
  "name": "Great Western Hospitals NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Medium",
  "beds": 614,
  "scale": 614,
  "budget": 56.2,
  "pain": 69.1,
  "digital": 40.5,
  "buyer": null,
  "target": 57.8,
  "rawOpp": 57.8,
  "pursuitRank": 25,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "RTT 52-week",
   "A&E 4-hour"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": 79,
   "rtt": 88,
   "diag": 28,
   "cancer": 61,
   "dq": null
  },
  "finance": {
   "surplus": -1.9,
   "income": 565,
   "margin": 0.59,
   "capital": 38.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 42,
  "dmaRaw": 2.09,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.4,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.981,
  "shmiBand": "2.0",
  "imd": 6.7,
  "rural": null,
  "pop": 616,
  "age65": 17.1,
  "eth": 10.5,
  "lsoas": 368,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.0,
   20.2,
   21.6,
   22.9,
   23.9,
   22.8,
   23.3,
   21.4,
   25.2,
   22.6,
   20.5,
   21.3
  ]
 },
 {
  "code": "RJ1",
  "name": "Guy's and St Thomas' NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 1292,
  "scale": 1292,
  "budget": 83.2,
  "pain": 43.7,
  "digital": 42.2,
  "buyer": null,
  "target": 57.3,
  "rawOpp": 57.3,
  "pursuitRank": 26,
  "band": "C",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer 62-day",
   "A&E 4-hour"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 28,
   "rtt": 34,
   "diag": 88,
   "cancer": 47,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 3171,
   "margin": 0.42,
   "capital": 419.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 56,
  "dmaRaw": 2.79,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.949,
  "shmiBand": "2.0",
  "imd": 5.3,
  "rural": null,
  "pop": 1121,
  "age65": 9.8,
  "eth": 39.5,
  "lsoas": 658,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.3,
   21.5,
   22.2,
   21.0,
   23.0,
   23.0,
   21.7,
   21.6,
   23.8,
   22.1,
   20.2,
   12.1
  ]
 },
 {
  "code": "RVV",
  "name": "East Kent Hospitals University NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Teaching",
  "beds": 1127,
  "scale": 1127,
  "budget": 63.6,
  "pain": 76.8,
  "digital": 46.9,
  "buyer": null,
  "target": 57.1,
  "rawOpp": 65.1,
  "pursuitRank": 105,
  "band": "C",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "RTT 18-week",
   "A&E 12-hour",
   "Diagnostics 6-wk"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 51,
   "rtt": 94,
   "diag": 93,
   "cancer": 78,
   "dq": null
  },
  "finance": {
   "surplus": -6.3,
   "income": 1104,
   "margin": -0.94,
   "capital": 139.9,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 49,
  "dmaRaw": 2.43,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -2.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 35,
  "dqWeak": [],
  "shmi": 1.119,
  "shmiBand": "2.0",
  "imd": 4.9,
  "rural": null,
  "pop": 691,
  "age65": 19.1,
  "eth": 9.8,
  "lsoas": 412,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   21.5,
   21.9,
   21.2,
   23.2,
   24.2,
   24.4,
   23.9,
   25.9,
   28.2,
   25.8,
   24.8,
   16.1
  ]
 },
 {
  "code": "RJ2",
  "name": "Lewisham and Greenwich NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Large",
  "beds": 1059,
  "scale": 1059,
  "budget": 78.6,
  "pain": 53.0,
  "digital": 31.2,
  "buyer": null,
  "target": 56.9,
  "rawOpp": 56.9,
  "pursuitRank": 27,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "A&E 12-hour",
   "Cancer 62-day"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 49,
   "rtt": 61,
   "diag": 50,
   "cancer": 50,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 908,
   "margin": 2.02,
   "capital": 85.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 53,
  "dmaRaw": 2.67,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 87,
  "dqWeak": [],
  "shmi": 0.896,
  "shmiBand": "2.0",
  "imd": 4.5,
  "rural": null,
  "pop": 201,
  "age65": 9.2,
  "eth": 46.0,
  "lsoas": 117,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   25.8,
   23.7,
   22.4,
   22.1,
   21.6,
   21.0,
   20.9,
   19.9,
   23.9,
   21.2,
   18.4,
   16.1
  ]
 },
 {
  "code": "RP4",
  "name": "Great Ormond Street Hospital for Children NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Specialist",
  "beds": 224,
  "scale": 224,
  "budget": 68.4,
  "pain": 40.5,
  "digital": 67.2,
  "buyer": null,
  "target": 56.6,
  "rawOpp": 56.6,
  "pursuitRank": 28,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "Diagnostics 6-wk",
   "RTT 18-week"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 51,
   "diag": 57,
   "cancer": 1,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 776,
   "margin": 0.95,
   "capital": 112.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 43,
  "dmaRaw": 2.16,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -1.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 4.8,
  "rural": null,
  "pop": 159,
  "age65": 9.8,
  "eth": 53.5,
  "lsoas": 86,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   15.5,
   13.9,
   15.6,
   13.0,
   14.1,
   14.1,
   13.3,
   12.8,
   13.3,
   13.1,
   11.9,
   11.4
  ]
 },
 {
  "code": "RH5",
  "name": "Somerset NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Multi-Service",
  "beds": 1315,
  "scale": 1315,
  "budget": 61.1,
  "pain": 54.8,
  "digital": 49.4,
  "buyer": null,
  "target": 55.8,
  "rawOpp": 55.8,
  "pursuitRank": 29,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "Cancer FDS",
   "A&E 4-hour"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 40,
   "rtt": 66,
   "diag": 63,
   "cancer": 54,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1164,
   "margin": -1.5,
   "capital": 142.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 54,
  "dmaRaw": 2.7,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 2,
  "dqmi": 75,
  "dqWeak": [],
  "shmi": 1.012,
  "shmiBand": "2.0",
  "imd": 5.6,
  "rural": null,
  "pop": 679,
  "age65": 21.6,
  "eth": 3.7,
  "lsoas": 409,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.9,
   20.6,
   20.0,
   21.5,
   21.6,
   20.7,
   20.0,
   20.8,
   22.5,
   20.2,
   18.7,
   14.6
  ]
 },
 {
  "code": "RHU",
  "name": "Portsmouth Hospitals University NHS Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Large",
  "beds": 1178,
  "scale": 1178,
  "budget": 54.2,
  "pain": 73.7,
  "digital": 60.4,
  "buyer": null,
  "target": 55.7,
  "rawOpp": 63.7,
  "pursuitRank": 106,
  "band": "C",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "RTT 52-week",
   "Diagnostics 6-wk",
   "Cancer FDS"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 45,
   "rtt": 91,
   "diag": 96,
   "cancer": 74,
   "dq": null
  },
  "finance": {
   "surplus": -2.8,
   "income": 959,
   "margin": -1.81,
   "capital": 63.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": null,
  "dmaRaw": null,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -2.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 70,
  "dqWeak": [],
  "shmi": 0.951,
  "shmiBand": "2.0",
  "imd": 6.3,
  "rural": null,
  "pop": 629,
  "age65": 17.9,
  "eth": 7.8,
  "lsoas": 390,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: DMA; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   24.6,
   25.2,
   25.6,
   27.2,
   27.0,
   26.9,
   26.8,
   26.5,
   29.1,
   26.5,
   24.0,
   15.2
  ]
 },
 {
  "code": "RF4",
  "name": "Barking, Havering and Redbridge University Hospitals NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 963,
  "scale": 963,
  "budget": 62.5,
  "pain": 61.2,
  "digital": 69.3,
  "buyer": null,
  "target": 55.6,
  "rawOpp": 63.6,
  "pursuitRank": 107,
  "band": "C",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "A&E 12-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 46,
   "rtt": 52,
   "diag": null,
   "cancer": 85,
   "dq": null
  },
  "finance": {
   "surplus": -2.3,
   "income": 1007,
   "margin": -0.67,
   "capital": 86.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 44,
  "dmaRaw": 2.2,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -4.9,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 89,
  "dqWeak": [],
  "shmi": 0.935,
  "shmiBand": "2.0",
  "imd": 5.3,
  "rural": null,
  "pop": 685,
  "age65": 12.3,
  "eth": 40.9,
  "lsoas": 380,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   16.0,
   16.6,
   16.4,
   15.8,
   16.0,
   16.8,
   21.0,
   22.4,
   24.5,
   22.9,
   21.8,
   15.1
  ]
 },
 {
  "code": "RWH",
  "name": "East and North Hertfordshire Teaching NHS Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Large",
  "beds": 0,
  "scale": 0,
  "budget": 54.4,
  "pain": 47.8,
  "digital": 67.7,
  "buyer": null,
  "target": 54.8,
  "rawOpp": 54.8,
  "pursuitRank": 30,
  "band": "C",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer FDS",
   "A&E 12-hour"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 43,
   "rtt": 27,
   "diag": 99,
   "cancer": 47,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 717,
   "margin": -0.28,
   "capital": 91.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": null,
  "dmaRaw": null,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 2,
  "dqmi": 93,
  "dqWeak": [],
  "shmi": 0.912,
  "shmiBand": "2.0",
  "imd": 6.6,
  "rural": null,
  "pop": 383,
  "age65": 14.6,
  "eth": 17.6,
  "lsoas": 230,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: DMA; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.3,
   22.3,
   25.1,
   22.6,
   23.4,
   22.6,
   22.4,
   22.9,
   24.0,
   23.3,
   21.7,
   15.4
  ]
 },
 {
  "code": "RWE",
  "name": "University Hospitals of Leicester NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Teaching",
  "beds": 1901,
  "scale": 1901,
  "budget": 57.3,
  "pain": 68.7,
  "digital": 54.5,
  "buyer": null,
  "target": 53.3,
  "rawOpp": 61.3,
  "pursuitRank": 108,
  "band": "C",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "RTT 18-week",
   "Cancer FDS",
   "Cancer 62-day"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 40,
   "rtt": 90,
   "diag": 41,
   "cancer": 90,
   "dq": null
  },
  "finance": {
   "surplus": -3.8,
   "income": 1786,
   "margin": -3.09,
   "capital": 219.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 48,
  "dmaRaw": 2.41,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.8,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.987,
  "shmiBand": "2.0",
  "imd": 5.6,
  "rural": null,
  "pop": 1094,
  "age65": 15.7,
  "eth": 28.2,
  "lsoas": 619,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.4,
   24.4,
   26.0,
   28.6,
   27.1,
   26.7,
   25.1,
   24.1,
   26.5,
   23.6,
   21.8,
   15.0
  ]
 },
 {
  "code": "RA7",
  "name": "University Hospitals Bristol and Weston NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Teaching",
  "beds": 1094,
  "scale": 1094,
  "budget": 54.0,
  "pain": 37.6,
  "digital": 79.1,
  "buyer": null,
  "target": 53.1,
  "rawOpp": 53.1,
  "pursuitRank": 31,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer 62-day",
   "A&E 4-hour",
   "Cancer FDS"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 35,
   "rtt": 31,
   "diag": 32,
   "cancer": 50,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1347,
   "margin": -2.9,
   "capital": 145.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 38,
  "dmaRaw": 1.91,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.88,
  "shmiBand": "2.0",
  "imd": 5.9,
  "rural": null,
  "pop": 236,
  "age65": 14.3,
  "eth": 11.8,
  "lsoas": 141,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.1,
   18.0,
   16.9,
   17.5,
   18.0,
   17.8,
   17.3,
   17.4,
   18.7,
   17.2,
   17.1,
   13.7
  ]
 },
 {
  "code": "RL4",
  "name": "The Royal Wolverhampton NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Large",
  "beds": 873,
  "scale": 873,
  "budget": 68.0,
  "pain": 56.6,
  "digital": 58.2,
  "buyer": null,
  "target": 53.0,
  "rawOpp": 61.0,
  "pursuitRank": 109,
  "band": "C",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "A&E 12-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 42,
   "rtt": 89,
   "diag": 18,
   "cancer": 58,
   "dq": null
  },
  "finance": {
   "surplus": -3.3,
   "income": 1041,
   "margin": 0.15,
   "capital": 112.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 52,
  "dmaRaw": 2.6,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -0.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 0.956,
  "shmiBand": "2.0",
  "imd": 4.3,
  "rural": null,
  "pop": 411,
  "age65": 15.4,
  "eth": 28.4,
  "lsoas": 252,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.2,
   17.7,
   18.7,
   19.4,
   19.2,
   19.7,
   18.7,
   19.3,
   19.5,
   18.0,
   17.8,
   15.0
  ]
 },
 {
  "code": "RTR",
  "name": "South Tees Hospitals NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 996,
  "scale": 996,
  "budget": 67.1,
  "pain": 48.3,
  "digital": 39.6,
  "buyer": null,
  "target": 52.9,
  "rawOpp": 52.9,
  "pursuitRank": 32,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer 62-day",
   "Cancer FDS",
   "RTT 52-week"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 30,
   "rtt": 54,
   "diag": 37,
   "cancer": 66,
   "dq": null
  },
  "finance": {
   "surplus": -2.0,
   "income": 1042,
   "margin": -0.03,
   "capital": 65.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 53,
  "dmaRaw": 2.67,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.007,
  "shmiBand": "2.0",
  "imd": 4.8,
  "rural": null,
  "pop": 401,
  "age65": 19.3,
  "eth": 6.5,
  "lsoas": 253,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   20.3,
   20.0,
   18.6,
   20.7,
   20.8,
   20.0,
   19.5,
   18.8,
   20.5,
   17.9,
   17.0,
   13.3
  ]
 },
 {
  "code": "RK5",
  "name": "Sherwood Forest Hospitals NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Medium",
  "beds": 767,
  "scale": 767,
  "budget": 69.8,
  "pain": 53.4,
  "digital": 23.3,
  "buyer": null,
  "target": 52.1,
  "rawOpp": 52.1,
  "pursuitRank": 33,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 4-hour",
   "Cancer 62-day",
   "RTT 18-week"
  ],
  "trigger": "A&E 4-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour under pressure.",
  "drivers": {
   "uec": 61,
   "rtt": 57,
   "diag": 42,
   "cancer": 48,
   "dq": null
  },
  "finance": {
   "surplus": -1.8,
   "income": 582,
   "margin": 3.97,
   "capital": 44.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 52,
  "dmaRaw": 2.59,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -2.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 87,
  "dqWeak": [],
  "shmi": 1.069,
  "shmiBand": "2.0",
  "imd": 4.9,
  "rural": null,
  "pop": 363,
  "age65": 18.0,
  "eth": 6.9,
  "lsoas": 219,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.1,
   18.0,
   18.7,
   19.4,
   20.4,
   20.8,
   19.7,
   21.3,
   20.3,
   18.7,
   17.7,
   18.9
  ]
 },
 {
  "code": "RQM",
  "name": "Chelsea and Westminster Hospital NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 877,
  "scale": 877,
  "budget": 74.3,
  "pain": 46.6,
  "digital": 27.8,
  "buyer": null,
  "target": 52.0,
  "rawOpp": 52.0,
  "pursuitRank": 34,
  "band": "C",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "Diagnostics 6-wk",
   "RTT 52-week"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 31,
   "rtt": 53,
   "diag": 65,
   "cancer": 46,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1036,
   "margin": 0.65,
   "capital": 108.2,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 62,
  "dmaRaw": 3.1,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.746,
  "shmiBand": "3.0",
  "imd": 4.8,
  "rural": null,
  "pop": 515,
  "age65": 10.4,
  "eth": 46.7,
  "lsoas": 288,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   17.6,
   18.3,
   18.1,
   18.3,
   17.3,
   17.6,
   17.2,
   17.0,
   19.3,
   17.0,
   17.2,
   13.4
  ]
 },
 {
  "code": "RA2",
  "name": "Royal Surrey NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Medium",
  "beds": 539,
  "scale": 539,
  "budget": 52.5,
  "pain": 43.6,
  "digital": 64.6,
  "buyer": null,
  "target": 51.7,
  "rawOpp": 51.7,
  "pursuitRank": 35,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 4-hour",
   "RTT 52-week",
   "RTT 18-week"
  ],
  "trigger": "A&E 4-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour under pressure.",
  "drivers": {
   "uec": 47,
   "rtt": 57,
   "diag": 46,
   "cancer": 26,
   "dq": null
  },
  "finance": {
   "surplus": -0.9,
   "income": 625,
   "margin": -0.16,
   "capital": 72.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": null,
  "dmaRaw": null,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 0.81,
  "shmiBand": "3.0",
  "imd": 7.7,
  "rural": null,
  "pop": 402,
  "age65": 15.6,
  "eth": 14.7,
  "lsoas": 239,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: DMA; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.6,
   23.3,
   23.9,
   21.6,
   20.8,
   20.4,
   18.8,
   18.5,
   20.7,
   17.2,
   16.4,
   15.7
  ]
 },
 {
  "code": "RDU",
  "name": "Frimley Health NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Large",
  "beds": 1520,
  "scale": 1520,
  "budget": 59.2,
  "pain": 40.7,
  "digital": 59.4,
  "buyer": null,
  "target": 51.6,
  "rawOpp": 51.6,
  "pursuitRank": 36,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "A&E 4-hour",
   "RTT 52-week"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": 44,
   "rtt": 67,
   "diag": 37,
   "cancer": 13,
   "dq": null
  },
  "finance": {
   "surplus": -1.9,
   "income": 1121,
   "margin": -1.68,
   "capital": 143.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 55,
  "dmaRaw": 2.76,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.067,
  "shmiBand": "2.0",
  "imd": 7.0,
  "rural": null,
  "pop": 468,
  "age65": 13.2,
  "eth": 29.5,
  "lsoas": 276,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   20.1,
   19.5,
   19.0,
   19.7,
   21.0,
   20.3,
   19.7,
   17.6,
   19.0,
   16.7,
   15.7,
   15.6
  ]
 },
 {
  "code": "RTX",
  "name": "University Hospitals of Morecambe Bay NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 0,
  "scale": 0,
  "budget": 26.2,
  "pain": 60.9,
  "digital": 71.6,
  "buyer": null,
  "target": 51.2,
  "rawOpp": 51.2,
  "pursuitRank": 37,
  "band": "D",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "A&E 4-hour",
   "Cancer 62-day",
   "RTT 52-week"
  ],
  "trigger": "A&E 4-hour worsening",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour worsening.",
  "drivers": {
   "uec": 72,
   "rtt": 46,
   "diag": 43,
   "cancer": 74,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 603,
   "margin": -5.19,
   "capital": 84.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 43,
  "dmaRaw": 2.17,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.8,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 1.041,
  "shmiBand": "2.0",
  "imd": 6.8,
  "rural": null,
  "pop": 66,
  "age65": 20.5,
  "eth": 6.6,
  "lsoas": 40,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   20.7,
   19.9,
   17.8,
   18.6,
   19.5,
   18.4,
   18.0,
   18.8,
   21.7,
   20.3,
   19.7,
   20.4
  ]
 },
 {
  "code": "RWD",
  "name": "United Lincolnshire Teaching Hospitals NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Large",
  "beds": 1155,
  "scale": 1155,
  "budget": 49.2,
  "pain": 63.9,
  "digital": 64.6,
  "buyer": null,
  "target": 50.9,
  "rawOpp": 58.9,
  "pursuitRank": 110,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer FDS",
   "Cancer 62-day"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 24,
   "rtt": 60,
   "diag": 100,
   "cancer": 89,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 900,
   "margin": -2.28,
   "capital": 129.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 41,
  "dmaRaw": 2.03,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": true,
  "q3Var": -0.2,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 1.075,
  "shmiBand": "2.0",
  "imd": 5.2,
  "rural": null,
  "pop": 676,
  "age65": 20.3,
  "eth": 4.3,
  "lsoas": 381,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   25.1,
   24.8,
   25.4,
   25.2,
   26.4,
   25.5,
   25.3,
   27.0,
   29.7,
   27.9,
   26.5,
   11.6
  ]
 },
 {
  "code": "RBN",
  "name": "Mersey and West Lancashire Teaching Hospitals NHS Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 1265,
  "scale": 1265,
  "budget": 58.7,
  "pain": 51.2,
  "digital": 38.3,
  "buyer": null,
  "target": 50.8,
  "rawOpp": 50.8,
  "pursuitRank": 38,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "A&E 12-hour",
   "RTT 52-week",
   "Cancer FDS"
  ],
  "trigger": "A&E 12-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour under pressure.",
  "drivers": {
   "uec": 71,
   "rtt": 52,
   "diag": 44,
   "cancer": 35,
   "dq": null
  },
  "finance": {
   "surplus": -4.4,
   "income": 1000,
   "margin": -1.19,
   "capital": 88.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 58,
  "dmaRaw": 2.9,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.997,
  "shmiBand": "2.0",
  "imd": 5.2,
  "rural": null,
  "pop": 273,
  "age65": 18.0,
  "eth": 5.2,
  "lsoas": 178,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   20.6,
   20.7,
   20.8,
   21.3,
   20.7,
   19.8,
   19.2,
   19.0,
   20.3,
   18.2,
   17.2,
   20.4
  ]
 },
 {
  "code": "RJL",
  "name": "Northern Lincolnshire and Goole NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Medium",
  "beds": 676,
  "scale": 676,
  "budget": 42.4,
  "pain": 79.9,
  "digital": 46.1,
  "buyer": null,
  "target": 50.7,
  "rawOpp": 58.7,
  "pursuitRank": 111,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "Cancer FDS",
   "A&E 12-hour",
   "RTT 52-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 81,
   "rtt": 84,
   "diag": 84,
   "cancer": 72,
   "dq": null
  },
  "finance": {
   "surplus": -2.4,
   "income": 615,
   "margin": -1.5,
   "capital": 85.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 46,
  "dmaRaw": 2.29,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 1.012,
  "shmiBand": "2.0",
  "imd": 5.2,
  "rural": null,
  "pop": 319,
  "age65": 19.4,
  "eth": 5.5,
  "lsoas": 202,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   30.4,
   29.2,
   27.3,
   26.3,
   28.0,
   26.7,
   26.6,
   28.4,
   31.3,
   27.1,
   24.2,
   21.5
  ]
 },
 {
  "code": "RN7",
  "name": "Dartford and Gravesham NHS Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Small",
  "beds": 592,
  "scale": 592,
  "budget": 60.3,
  "pain": 45.3,
  "digital": 45.6,
  "buyer": null,
  "target": 50.7,
  "rawOpp": 50.7,
  "pursuitRank": 39,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "RTT 52-week",
   "Cancer 62-day"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": 30,
   "rtt": 71,
   "diag": 19,
   "cancer": 49,
   "dq": null
  },
  "finance": {
   "surplus": -4.9,
   "income": 489,
   "margin": 2.08,
   "capital": 44.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 40,
  "dmaRaw": 2.01,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -2.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 1.082,
  "shmiBand": "2.0",
  "imd": 4.9,
  "rural": null,
  "pop": 177,
  "age65": 13.9,
  "eth": 21.7,
  "lsoas": 103,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   20.3,
   20.2,
   18.4,
   19.9,
   19.0,
   19.9,
   19.2,
   18.2,
   19.7,
   17.9,
   16.5,
   13.2
  ]
 },
 {
  "code": "RK9",
  "name": "University Hospitals Plymouth NHS Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Teaching",
  "beds": 1135,
  "scale": 1135,
  "budget": 46.4,
  "pain": 62.0,
  "digital": 70.5,
  "buyer": null,
  "target": 50.5,
  "rawOpp": 58.5,
  "pursuitRank": 112,
  "band": "D",
  "distress": true,
  "trend": "Flat",
  "topPain": [
   "A&E 12-hour",
   "A&E 4-hour",
   "RTT 52-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 92,
   "rtt": 57,
   "diag": 52,
   "cancer": 42,
   "dq": null
  },
  "finance": {
   "surplus": -2.2,
   "income": 1092,
   "margin": -3.95,
   "capital": 138.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 49,
  "dmaRaw": 2.43,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.248,
  "shmiBand": "1.0",
  "imd": 5.1,
  "rural": null,
  "pop": 370,
  "age65": 18.7,
  "eth": 4.7,
  "lsoas": 220,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   24.1,
   23.4,
   21.5,
   23.0,
   23.8,
   24.8,
   23.0,
   24.4,
   25.8,
   23.3,
   21.0,
   25.1
  ]
 },
 {
  "code": "REF",
  "name": "Royal Cornwall Hospitals NHS Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Large",
  "beds": 745,
  "scale": 745,
  "budget": 53.9,
  "pain": 46.4,
  "digital": 49.8,
  "buyer": null,
  "target": 49.9,
  "rawOpp": 49.9,
  "pursuitRank": 40,
  "band": "D",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "A&E 12-hour",
   "Cancer FDS",
   "Cancer 62-day"
  ],
  "trigger": "A&E 12-hour worsening",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour worsening.",
  "drivers": {
   "uec": 64,
   "rtt": 21,
   "diag": 38,
   "cancer": 58,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 734,
   "margin": -0.73,
   "capital": 87.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 53,
  "dmaRaw": 2.67,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 96,
  "dqWeak": [],
  "shmi": 1.048,
  "shmiBand": "2.0",
  "imd": 4.7,
  "rural": null,
  "pop": 537,
  "age65": 22.1,
  "eth": 3.2,
  "lsoas": 316,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   16.4,
   16.3,
   14.5,
   16.6,
   17.0,
   16.6,
   17.2,
   16.6,
   20.2,
   18.4,
   17.2,
   19.4
  ]
 },
 {
  "code": "R0D",
  "name": "University Hospitals Dorset NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Teaching",
  "beds": 1122,
  "scale": 1122,
  "budget": 37.4,
  "pain": 56.0,
  "digital": 56.6,
  "buyer": null,
  "target": 49.6,
  "rawOpp": 49.6,
  "pursuitRank": 41,
  "band": "D",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "A&E 4-hour",
   "Cancer FDS",
   "Cancer 62-day"
  ],
  "trigger": "A&E 4-hour worsening",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour worsening.",
  "drivers": {
   "uec": 69,
   "rtt": 41,
   "diag": 27,
   "cancer": 73,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 912,
   "margin": -8.11,
   "capital": 125.9,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.36,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.879,
  "shmiBand": "2.0",
  "imd": 6.7,
  "rural": null,
  "pop": 234,
  "age65": 20.3,
  "eth": 7.0,
  "lsoas": 142,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.9,
   18.7,
   18.2,
   18.2,
   19.1,
   18.4,
   18.5,
   18.8,
   22.9,
   20.5,
   19.2,
   20.6
  ]
 },
 {
  "code": "RXK",
  "name": "Sandwell and West Birmingham Hospitals NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Large",
  "beds": 639,
  "scale": 639,
  "budget": 31.4,
  "pain": 59.2,
  "digital": 60.3,
  "buyer": null,
  "target": 49.6,
  "rawOpp": 49.6,
  "pursuitRank": 42,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "Diagnostics 6-wk",
   "RTT 18-week"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 57,
   "rtt": 46,
   "diag": 75,
   "cancer": 67,
   "dq": null
  },
  "finance": {
   "surplus": -1.8,
   "income": 818,
   "margin": -17.21,
   "capital": 103.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 45,
  "dmaRaw": 2.24,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.9,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.031,
  "shmiBand": "2.0",
  "imd": 3.2,
  "rural": null,
  "pop": 758,
  "age65": 12.2,
  "eth": 49.8,
  "lsoas": 434,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.5,
   21.3,
   19.9,
   19.8,
   21.4,
   22.4,
   22.4,
   22.8,
   25.3,
   22.6,
   21.1,
   17.5
  ]
 },
 {
  "code": "RXF",
  "name": "Mid Yorkshire Teaching NHS Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 1152,
  "scale": 1152,
  "budget": 64.9,
  "pain": 46.9,
  "digital": 62.7,
  "buyer": null,
  "target": 49.0,
  "rawOpp": 57.0,
  "pursuitRank": 113,
  "band": "D",
  "distress": true,
  "trend": "Flat",
  "topPain": [
   "A&E 4-hour",
   "Diagnostics 6-wk",
   "A&E 12-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 64,
   "rtt": 29,
   "diag": 71,
   "cancer": 36,
   "dq": null
  },
  "finance": {
   "surplus": -1.0,
   "income": 860,
   "margin": 0.3,
   "capital": 78.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 46,
  "dmaRaw": 2.31,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.6,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 1.153,
  "shmiBand": "2.0",
  "imd": 5.0,
  "rural": null,
  "pop": 260,
  "age65": 16.8,
  "eth": 7.3,
  "lsoas": 158,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   16.9,
   16.9,
   16.7,
   17.6,
   18.4,
   18.7,
   18.1,
   18.5,
   19.9,
   19.3,
   18.2,
   18.8
  ]
 },
 {
  "code": "RWF",
  "name": "Maidstone and Tunbridge Wells NHS Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Large",
  "beds": 736,
  "scale": 736,
  "budget": 76.4,
  "pain": 22.8,
  "digital": 53.1,
  "buyer": null,
  "target": 48.8,
  "rawOpp": 48.8,
  "pursuitRank": 43,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "Cancer FDS",
   "A&E 12-hour",
   "A&E 4-hour"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 36,
   "rtt": 10,
   "diag": 8,
   "cancer": 30,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 831,
   "margin": 2.04,
   "capital": 86.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 52,
  "dmaRaw": 2.61,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -1.7,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.882,
  "shmiBand": "2.0",
  "imd": 6.4,
  "rural": null,
  "pop": 454,
  "age65": 16.3,
  "eth": 10.5,
  "lsoas": 270,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   14.4,
   14.2,
   14.9,
   15.0,
   14.0,
   14.3,
   13.1,
   13.3,
   14.2,
   13.2,
   11.6,
   14.5
  ]
 },
 {
  "code": "RD1",
  "name": "Royal United Hospitals Bath NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Medium",
  "beds": 567,
  "scale": 567,
  "budget": 60.6,
  "pain": 50.9,
  "digital": 59.9,
  "buyer": null,
  "target": 48.4,
  "rawOpp": 56.4,
  "pursuitRank": 114,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "A&E 4-hour",
   "Cancer 62-day",
   "Cancer FDS"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 62,
   "rtt": 26,
   "diag": 48,
   "cancer": 67,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 619,
   "margin": 0.71,
   "capital": 83.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.36,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.7,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 47,
  "dqWeak": [],
  "shmi": 1.103,
  "shmiBand": "2.0",
  "imd": 7.6,
  "rural": null,
  "pop": 122,
  "age65": 17.3,
  "eth": 8.0,
  "lsoas": 73,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   25.6,
   24.3,
   24.1,
   26.7,
   29.3,
   26.5,
   26.3,
   24.4,
   26.9,
   22.3,
   18.9,
   19.0
  ]
 },
 {
  "code": "RXP",
  "name": "County Durham and Darlington NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Multi-Service",
  "beds": 1001,
  "scale": 1001,
  "budget": 72.6,
  "pain": 54.6,
  "digital": 35.4,
  "buyer": null,
  "target": 48.4,
  "rawOpp": 56.4,
  "pursuitRank": 115,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "A&E 12-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 47,
   "rtt": 44,
   "diag": 31,
   "cancer": 85,
   "dq": null
  },
  "finance": {
   "surplus": 0.3,
   "income": 765,
   "margin": 1.84,
   "capital": 57.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 59,
  "dmaRaw": 2.94,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.6,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.276,
  "shmiBand": "1.0",
  "imd": 4.3,
  "rural": null,
  "pop": 695,
  "age65": 19.0,
  "eth": 3.8,
  "lsoas": 440,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.9,
   18.0,
   18.0,
   19.6,
   20.7,
   22.8,
   22.4,
   22.1,
   23.3,
   18.4,
   19.1,
   15.9
  ]
 },
 {
  "code": "RCB",
  "name": "York and Scarborough Teaching Hospitals NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 906,
  "scale": 906,
  "budget": 43.1,
  "pain": 64.9,
  "digital": 60.6,
  "buyer": null,
  "target": 48.2,
  "rawOpp": 56.2,
  "pursuitRank": 116,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "RTT 18-week",
   "RTT 52-week",
   "Cancer FDS"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 36,
   "rtt": 87,
   "diag": 72,
   "cancer": 68,
   "dq": null
  },
  "finance": {
   "surplus": -1.9,
   "income": 895,
   "margin": -3.27,
   "capital": 107.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 48,
  "dmaRaw": 2.41,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.3,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 0.927,
  "shmiBand": "2.0",
  "imd": 6.5,
  "rural": null,
  "pop": 365,
  "age65": 20.7,
  "eth": 4.2,
  "lsoas": 220,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   26.5,
   26.7,
   26.7,
   28.0,
   28.3,
   27.6,
   26.6,
   28.7,
   29.7,
   24.2,
   22.0,
   14.0
  ]
 },
 {
  "code": "R1K",
  "name": "London North West University Healthcare NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 1103,
  "scale": 1103,
  "budget": 56.3,
  "pain": 49.0,
  "digital": 34.2,
  "buyer": null,
  "target": 48.1,
  "rawOpp": 48.1,
  "pursuitRank": 44,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 12-hour",
   "RTT 18-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 50,
   "rtt": 54,
   "diag": 89,
   "cancer": 23,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1114,
   "margin": -2.16,
   "capital": 159.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 62,
  "dmaRaw": 3.1,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.854,
  "shmiBand": "3.0",
  "imd": 4.5,
  "rural": null,
  "pop": 573,
  "age65": 11.1,
  "eth": 64.6,
  "lsoas": 313,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.9,
   20.6,
   19.3,
   20.2,
   21.0,
   20.8,
   20.6,
   21.4,
   25.1,
   22.1,
   18.8,
   16.1
  ]
 },
 {
  "code": "RPC",
  "name": "Queen Victoria Hospital NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Specialist",
  "beds": 51,
  "scale": 51,
  "budget": 44.6,
  "pain": 44.6,
  "digital": 58.2,
  "buyer": null,
  "target": 47.8,
  "rawOpp": 47.8,
  "pursuitRank": 45,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "RTT 52-week",
   "Diagnostics 6-wk"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 68,
   "diag": 35,
   "cancer": 26,
   "dq": null
  },
  "finance": {
   "surplus": -1.3,
   "income": 118,
   "margin": 1.71,
   "capital": 18.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 33,
  "dmaRaw": 1.63,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 97,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 7.6,
  "rural": null,
  "pop": 29,
  "age65": 17.7,
  "eth": 5.4,
  "lsoas": 17,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.1,
   21.3,
   20.5,
   19.8,
   21.8,
   17.8,
   19.3,
   20.1,
   19.3,
   19.1,
   14.8,
   17.1
  ]
 },
 {
  "code": "RQW",
  "name": "The Princess Alexandra Hospital NHS Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Small",
  "beds": 498,
  "scale": 498,
  "budget": 36.7,
  "pain": 59.7,
  "digital": 43.0,
  "buyer": null,
  "target": 47.7,
  "rawOpp": 47.7,
  "pursuitRank": 46,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Cancer 62-day",
   "Diagnostics 6-wk",
   "RTT 52-week"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 27,
   "rtt": 64,
   "diag": 81,
   "cancer": 77,
   "dq": null
  },
  "finance": {
   "surplus": -1.2,
   "income": 430,
   "margin": -0.78,
   "capital": 64.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 39,
  "dmaRaw": 1.97,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.095,
  "shmiBand": "2.0",
  "imd": 6.4,
  "rural": null,
  "pop": 324,
  "age65": 14.7,
  "eth": 14.0,
  "lsoas": 196,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   30.0,
   29.8,
   27.6,
   28.1,
   24.3,
   23.5,
   24.8,
   23.9,
   25.5,
   23.0,
   21.5,
   13.0
  ]
 },
 {
  "code": "RNN",
  "name": "North Cumbria Integrated Care NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Medium",
  "beds": 650,
  "scale": 650,
  "budget": 28.1,
  "pain": 79.7,
  "digital": 54.6,
  "buyer": null,
  "target": 47.6,
  "rawOpp": 55.6,
  "pursuitRank": 117,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "A&E 4-hour",
   "Cancer FDS",
   "Cancer 62-day"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 85,
   "rtt": 66,
   "diag": 74,
   "cancer": 92,
   "dq": null
  },
  "finance": {
   "surplus": -5.3,
   "income": 620,
   "margin": -4.87,
   "capital": 52.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 41,
  "dmaRaw": 2.04,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.014,
  "shmiBand": "2.0",
  "imd": 5.2,
  "rural": null,
  "pop": 424,
  "age65": 20.7,
  "eth": 2.4,
  "lsoas": 270,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   26.1,
   26.5,
   27.3,
   30.1,
   30.5,
   30.8,
   32.9,
   30.6,
   31.4,
   27.5,
   25.8,
   24.4
  ]
 },
 {
  "code": "RVR",
  "name": "Epsom and St Helier University Hospitals NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 802,
  "scale": 802,
  "budget": 31.8,
  "pain": 44.6,
  "digital": 76.0,
  "buyer": null,
  "target": 47.5,
  "rawOpp": 47.5,
  "pursuitRank": 47,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "A&E 12-hour",
   "A&E 4-hour",
   "RTT 52-week"
  ],
  "trigger": "A&E 12-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour under pressure.",
  "drivers": {
   "uec": 84,
   "rtt": 40,
   "diag": 25,
   "cancer": 20,
   "dq": null
  },
  "finance": {
   "surplus": -6.9,
   "income": 761,
   "margin": -7.29,
   "capital": 110.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 44,
  "dmaRaw": 2.21,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 40,
  "dqWeak": [],
  "shmi": 1.132,
  "shmiBand": "2.0",
  "imd": 7.5,
  "rural": null,
  "pop": 640,
  "age65": 14.3,
  "eth": 26.8,
  "lsoas": 380,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   20.6,
   20.1,
   18.8,
   21.0,
   21.4,
   21.9,
   19.8,
   18.4,
   18.5,
   16.8,
   15.6,
   22.4
  ]
 },
 {
  "code": "RTP",
  "name": "Surrey and Sussex Healthcare NHS Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Medium",
  "beds": 695,
  "scale": 695,
  "budget": 41.9,
  "pain": 52.8,
  "digital": 44.3,
  "buyer": null,
  "target": 47.0,
  "rawOpp": 47.0,
  "pursuitRank": 48,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 12-hour",
   "Cancer 62-day"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 45,
   "rtt": 49,
   "diag": 78,
   "cancer": 51,
   "dq": null
  },
  "finance": {
   "surplus": -4.5,
   "income": 522,
   "margin": -0.99,
   "capital": 78.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 55,
  "dmaRaw": 2.76,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -2.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.921,
  "shmiBand": "2.0",
  "imd": 6.9,
  "rural": null,
  "pop": 368,
  "age65": 15.0,
  "eth": 16.1,
  "lsoas": 216,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.5,
   18.1,
   17.8,
   17.7,
   17.6,
   16.8,
   18.1,
   21.4,
   20.8,
   19.2,
   20.6,
   15.3
  ]
 },
 {
  "code": "RR7",
  "name": "Gateshead Health NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Medium",
  "beds": 491,
  "scale": 491,
  "budget": 47.4,
  "pain": 41.6,
  "digital": 55.5,
  "buyer": null,
  "target": 46.9,
  "rawOpp": 46.9,
  "pursuitRank": 49,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "A&E 4-hour"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 35,
   "rtt": 11,
   "diag": 19,
   "cancer": 90,
   "dq": null
  },
  "finance": {
   "surplus": -2.8,
   "income": 444,
   "margin": 0.55,
   "capital": 47.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 41,
  "dmaRaw": 2.06,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 1.09,
  "shmiBand": "2.0",
  "imd": 4.4,
  "rural": null,
  "pop": 156,
  "age65": 17.1,
  "eth": 6.0,
  "lsoas": 102,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.9,
   18.1,
   17.7,
   19.3,
   19.8,
   18.6,
   15.5,
   19.0,
   26.1,
   20.3,
   18.7,
   13.9
  ]
 },
 {
  "code": "RXL",
  "name": "Blackpool Teaching Hospitals NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 776,
  "scale": 776,
  "budget": 41.3,
  "pain": 78.7,
  "digital": 32.9,
  "buyer": null,
  "target": 46.7,
  "rawOpp": 54.7,
  "pursuitRank": 118,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "A&E 12-hour",
   "Cancer FDS",
   "Cancer 62-day"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 62,
   "rtt": 86,
   "diag": 67,
   "cancer": 94,
   "dq": null
  },
  "finance": {
   "surplus": -5.4,
   "income": 730,
   "margin": -2.48,
   "capital": 72.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.36,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 1.136,
  "shmiBand": "2.0",
  "imd": 5.1,
  "rural": null,
  "pop": 533,
  "age65": 20.1,
  "eth": 5.8,
  "lsoas": 343,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   26.3,
   27.7,
   28.3,
   28.6,
   30.5,
   29.3,
   28.0,
   27.5,
   31.1,
   28.7,
   24.4,
   21.9
  ]
 },
 {
  "code": "RNS",
  "name": "Northampton General Hospital NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Medium",
  "beds": 778,
  "scale": 778,
  "budget": 29.3,
  "pain": 77.8,
  "digital": 51.8,
  "buyer": null,
  "target": 46.6,
  "rawOpp": 54.6,
  "pursuitRank": 119,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer FDS",
   "RTT 18-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 64,
   "rtt": 73,
   "diag": 99,
   "cancer": 87,
   "dq": null
  },
  "finance": {
   "surplus": -6.8,
   "income": 575,
   "margin": -3.3,
   "capital": 65.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 53,
  "dmaRaw": 2.66,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.94,
  "shmiBand": "2.0",
  "imd": 6.1,
  "rural": null,
  "pop": 418,
  "age65": 14.9,
  "eth": 14.6,
  "lsoas": 237,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.7,
   22.8,
   24.2,
   26.5,
   28.3,
   29.3,
   27.5,
   28.2,
   30.8,
   28.3,
   26.8,
   18.4
  ]
 },
 {
  "code": "RXW",
  "name": "The Shrewsbury and Telford Hospital NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Medium",
  "beds": 879,
  "scale": 879,
  "budget": 41.4,
  "pain": 45.7,
  "digital": 54.2,
  "buyer": null,
  "target": 46.2,
  "rawOpp": 46.2,
  "pursuitRank": 50,
  "band": "D",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "A&E 4-hour",
   "A&E 12-hour",
   "Cancer 62-day"
  ],
  "trigger": "A&E 4-hour worsening",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour worsening.",
  "drivers": {
   "uec": 93,
   "rtt": 14,
   "diag": 46,
   "cancer": 30,
   "dq": null
  },
  "finance": {
   "surplus": -6.8,
   "income": 724,
   "margin": -2.45,
   "capital": 102.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 40,
  "dmaRaw": 1.99,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 93,
  "dqWeak": [],
  "shmi": 0.947,
  "shmiBand": "2.0",
  "imd": 5.3,
  "rural": null,
  "pop": 366,
  "age65": 18.8,
  "eth": 6.2,
  "lsoas": 225,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   29.3,
   27.0,
   25.4,
   25.1,
   23.9,
   22.6,
   21.8,
   23.3,
   24.7,
   21.6,
   20.3,
   25.8
  ]
 },
 {
  "code": "RAX",
  "name": "Kingston and Richmond NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Medium",
  "beds": 460,
  "scale": 460,
  "budget": 49.2,
  "pain": 42.3,
  "digital": 48.1,
  "buyer": null,
  "target": 46.1,
  "rawOpp": 46.1,
  "pursuitRank": 51,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 12-hour",
   "Diagnostics 6-wk",
   "Cancer FDS"
  ],
  "trigger": "A&E 12-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour under pressure.",
  "drivers": {
   "uec": 58,
   "rtt": 32,
   "diag": 59,
   "cancer": 29,
   "dq": null
  },
  "finance": {
   "surplus": -2.2,
   "income": 507,
   "margin": 0.25,
   "capital": 76.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 42,
  "dmaRaw": 2.1,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.728,
  "shmiBand": "3.0",
  "imd": 7.6,
  "rural": null,
  "pop": 483,
  "age65": 13.1,
  "eth": 26.7,
  "lsoas": 283,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   17.2,
   18.0,
   19.1,
   18.2,
   20.0,
   20.4,
   20.7,
   22.1,
   22.0,
   21.1,
   17.1,
   17.5
  ]
 },
 {
  "code": "RCX",
  "name": "The Queen Elizabeth Hospital, King's Lynn, NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Small",
  "beds": 508,
  "scale": 508,
  "budget": 6.4,
  "pain": 84.8,
  "digital": 71.1,
  "buyer": null,
  "target": 45.9,
  "rawOpp": 53.9,
  "pursuitRank": 120,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "Cancer 62-day",
   "RTT 18-week",
   "A&E 4-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 82,
   "rtt": 79,
   "diag": 85,
   "cancer": 93,
   "dq": null
  },
  "finance": {
   "surplus": -7.3,
   "income": 325,
   "margin": -24.52,
   "capital": 46.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 36,
  "dmaRaw": 1.81,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.2,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 1.217,
  "shmiBand": "1.0",
  "imd": 4.4,
  "rural": null,
  "pop": 99,
  "age65": 20.8,
  "eth": 4.6,
  "lsoas": 58,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   32.3,
   31.1,
   33.1,
   34.7,
   31.9,
   29.8,
   30.1,
   30.6,
   32.8,
   29.3,
   27.9,
   22.8
  ]
 },
 {
  "code": "RDE",
  "name": "East Suffolk and North Essex NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Large",
  "beds": 1298,
  "scale": 1298,
  "budget": 59.2,
  "pain": 57.5,
  "digital": 39.6,
  "buyer": null,
  "target": 45.9,
  "rawOpp": 53.9,
  "pursuitRank": 121,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "Cancer 62-day",
   "Cancer FDS"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 47,
   "rtt": 54,
   "diag": 34,
   "cancer": 84,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1219,
   "margin": -1.98,
   "capital": 114.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 53,
  "dmaRaw": 2.64,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.9,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 1.081,
  "shmiBand": "2.0",
  "imd": 5.6,
  "rural": null,
  "pop": 765,
  "age65": 19.8,
  "eth": 8.7,
  "lsoas": 454,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   21.4,
   21.3,
   20.3,
   22.4,
   23.2,
   27.2,
   26.5,
   24.6,
   25.0,
   22.6,
   20.7,
   16.0
  ]
 },
 {
  "code": "RXR",
  "name": "East Lancashire Hospitals NHS Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Large",
  "beds": 967,
  "scale": 967,
  "budget": 37.8,
  "pain": 46.8,
  "digital": 56.4,
  "buyer": null,
  "target": 45.9,
  "rawOpp": 45.9,
  "pursuitRank": 52,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 12-hour",
   "Cancer 62-day",
   "Cancer FDS"
  ],
  "trigger": "A&E 12-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour under pressure.",
  "drivers": {
   "uec": 57,
   "rtt": 30,
   "diag": 20,
   "cancer": 67,
   "dq": null
  },
  "finance": {
   "surplus": -5.7,
   "income": 829,
   "margin": -4.11,
   "capital": 54.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.33,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -3.4,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 1.199,
  "shmiBand": "1.0",
  "imd": 4.0,
  "rural": null,
  "pop": 601,
  "age65": 15.9,
  "eth": 21.4,
  "lsoas": 365,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.8,
   18.6,
   20.0,
   19.7,
   18.8,
   18.8,
   18.6,
   17.6,
   18.7,
   18.2,
   16.7,
   17.4
  ]
 },
 {
  "code": "RLQ",
  "name": "Wye Valley NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Multi-Service",
  "beds": 315,
  "scale": 315,
  "budget": 47.1,
  "pain": 41.8,
  "digital": 49.9,
  "buyer": null,
  "target": 45.6,
  "rawOpp": 45.6,
  "pursuitRank": 53,
  "band": "D",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "A&E 4-hour",
   "A&E 12-hour",
   "Diagnostics 6-wk"
  ],
  "trigger": "A&E 4-hour worsening",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour worsening.",
  "drivers": {
   "uec": 75,
   "rtt": 35,
   "diag": 39,
   "cancer": 17,
   "dq": null
  },
  "finance": {
   "surplus": -7.0,
   "income": 394,
   "margin": 0.67,
   "capital": 39.9,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 43,
  "dmaRaw": 2.17,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 1.101,
  "shmiBand": "2.0",
  "imd": 5.9,
  "rural": null,
  "pop": 301,
  "age65": 19.7,
  "eth": 9.6,
  "lsoas": 178,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   25.4,
   23.9,
   22.6,
   22.8,
   22.5,
   19.9,
   18.4,
   18.2,
   20.0,
   19.2,
   17.5,
   22.1
  ]
 },
 {
  "code": "RYJ",
  "name": "Imperial College Healthcare NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 1095,
  "scale": 1095,
  "budget": 69.9,
  "pain": 24.2,
  "digital": 46.7,
  "buyer": null,
  "target": 45.6,
  "rawOpp": 45.6,
  "pursuitRank": 54,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer 62-day",
   "A&E 12-hour",
   "RTT 18-week"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 25,
   "rtt": 19,
   "diag": 16,
   "cancer": 32,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 1876,
   "margin": -1.04,
   "capital": 267.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 63,
  "dmaRaw": 3.13,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.712,
  "shmiBand": "3.0",
  "imd": 4.6,
  "rural": null,
  "pop": 605,
  "age65": 10.5,
  "eth": 47.9,
  "lsoas": 354,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.4,
   18.6,
   19.4,
   19.6,
   19.4,
   18.2,
   17.6,
   17.8,
   18.1,
   16.0,
   14.0,
   12.3
  ]
 },
 {
  "code": "RAS",
  "name": "The Hillingdon Hospitals NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Small",
  "beds": 460,
  "scale": 460,
  "budget": 54.3,
  "pain": 39.8,
  "digital": 41.2,
  "buyer": null,
  "target": 45.2,
  "rawOpp": 45.2,
  "pursuitRank": 55,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer 62-day",
   "RTT 18-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 27,
   "rtt": 39,
   "diag": 69,
   "cancer": 39,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 432,
   "margin": 1.45,
   "capital": 90.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 61,
  "dmaRaw": 3.06,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 2,
  "dqmi": 93,
  "dqWeak": [],
  "shmi": 0.953,
  "shmiBand": "2.0",
  "imd": 5.6,
  "rural": null,
  "pop": 278,
  "age65": 12.3,
  "eth": 47.9,
  "lsoas": 154,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   24.6,
   24.2,
   23.5,
   23.1,
   26.1,
   22.0,
   22.0,
   22.2,
   21.1,
   19.5,
   18.2,
   12.6
  ]
 },
 {
  "code": "RNZ",
  "name": "Salisbury NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Small",
  "beds": 472,
  "scale": 472,
  "budget": 32.6,
  "pain": 52.9,
  "digital": 50.6,
  "buyer": null,
  "target": 45.2,
  "rawOpp": 45.2,
  "pursuitRank": 56,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "Cancer 62-day",
   "A&E 4-hour",
   "A&E 12-hour"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 73,
   "rtt": 14,
   "diag": 40,
   "cancer": 79,
   "dq": null
  },
  "finance": {
   "surplus": -3.5,
   "income": 417,
   "margin": -1.38,
   "capital": 52.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 41,
  "dmaRaw": 2.07,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.9,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.914,
  "shmiBand": "2.0",
  "imd": 6.4,
  "rural": null,
  "pop": 342,
  "age65": 18.4,
  "eth": 7.1,
  "lsoas": 204,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   21.4,
   19.6,
   19.2,
   20.5,
   22.5,
   21.2,
   19.1,
   21.6,
   23.5,
   21.0,
   20.2,
   20.4
  ]
 },
 {
  "code": "RWJ",
  "name": "Stockport NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Medium",
  "beds": 669,
  "scale": 669,
  "budget": 29.4,
  "pain": 57.1,
  "digital": 48.3,
  "buyer": null,
  "target": 45.2,
  "rawOpp": 45.2,
  "pursuitRank": 57,
  "band": "D",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "A&E 12-hour",
   "A&E 4-hour",
   "RTT 18-week"
  ],
  "trigger": "A&E 12-hour worsening",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour worsening.",
  "drivers": {
   "uec": 87,
   "rtt": 54,
   "diag": 53,
   "cancer": 32,
   "dq": null
  },
  "finance": {
   "surplus": -9.4,
   "income": 515,
   "margin": -2.75,
   "capital": 75.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 45,
  "dmaRaw": 2.23,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 95,
  "dqWeak": [],
  "shmi": 0.905,
  "shmiBand": "2.0",
  "imd": 5.5,
  "rural": null,
  "pop": 411,
  "age65": 16.5,
  "eth": 12.9,
  "lsoas": 261,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.6,
   22.4,
   23.1,
   21.4,
   22.1,
   20.4,
   20.4,
   20.1,
   21.1,
   19.3,
   19.3,
   23.1
  ]
 },
 {
  "code": "RXN",
  "name": "Lancashire Teaching Hospitals NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 880,
  "scale": 880,
  "budget": 36.7,
  "pain": 67.7,
  "digital": 52.4,
  "buyer": null,
  "target": 45.2,
  "rawOpp": 53.2,
  "pursuitRank": 122,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "RTT 18-week",
   "A&E 12-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 78,
   "rtt": 80,
   "diag": 94,
   "cancer": 32,
   "dq": null
  },
  "finance": {
   "surplus": -3.7,
   "income": 867,
   "margin": -5.72,
   "capital": 120.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 48,
  "dmaRaw": 2.4,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.7,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 0.912,
  "shmiBand": "2.0",
  "imd": 5.5,
  "rural": null,
  "pop": 308,
  "age65": 16.8,
  "eth": 13.2,
  "lsoas": 188,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   27.0,
   27.4,
   25.6,
   27.8,
   29.1,
   27.2,
   28.5,
   27.2,
   28.3,
   26.4,
   23.2,
   21.1
  ]
 },
 {
  "code": "RBQ",
  "name": "Liverpool Heart and Chest Hospital NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Specialist",
  "beds": 173,
  "scale": 173,
  "budget": 53.3,
  "pain": 41.8,
  "digital": 38.3,
  "buyer": null,
  "target": 45.0,
  "rawOpp": 45.0,
  "pursuitRank": 58,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "Diagnostics 6-wk"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 11,
   "diag": 17,
   "cancer": 85,
   "dq": null
  },
  "finance": {
   "surplus": 3.7,
   "income": 269,
   "margin": 4.24,
   "capital": 26.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 58,
  "dmaRaw": 2.89,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Outstanding",
  "cqcWellLed": "Outstanding",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 98,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 3.3,
  "rural": null,
  "pop": 32,
  "age65": 14.6,
  "eth": 15.3,
  "lsoas": 19,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   11.3,
   16.3,
   14.2,
   15.4,
   15.8,
   12.8,
   9.0,
   10.2,
   17.7,
   19.7,
   17.4,
   22.8
  ]
 },
 {
  "code": "RN5",
  "name": "Hampshire Hospitals NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Large",
  "beds": 954,
  "scale": 954,
  "budget": 35.7,
  "pain": 66.4,
  "digital": 55.2,
  "buyer": null,
  "target": 44.9,
  "rawOpp": 52.9,
  "pursuitRank": 123,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "A&E 4-hour",
   "RTT 52-week",
   "Diagnostics 6-wk"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 61,
   "rtt": 74,
   "diag": 77,
   "cancer": 59,
   "dq": null
  },
  "finance": {
   "surplus": -2.2,
   "income": 703,
   "margin": -3.13,
   "capital": 78.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 42,
  "dmaRaw": 2.1,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 0.867,
  "shmiBand": "2.0",
  "imd": 7.6,
  "rural": null,
  "pop": 385,
  "age65": 17.3,
  "eth": 8.6,
  "lsoas": 234,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   24.9,
   23.5,
   24.1,
   24.4,
   26.5,
   27.0,
   26.7,
   26.2,
   29.6,
   23.5,
   21.9,
   20.7
  ]
 },
 {
  "code": "RAE",
  "name": "Bradford Teaching Hospitals NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 702,
  "scale": 702,
  "budget": 44.5,
  "pain": 34.3,
  "digital": 63.6,
  "buyer": null,
  "target": 44.8,
  "rawOpp": 44.8,
  "pursuitRank": 59,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 12-hour",
   "RTT 18-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 32,
   "rtt": 29,
   "diag": 69,
   "cancer": 24,
   "dq": null
  },
  "finance": {
   "surplus": -0.4,
   "income": 657,
   "margin": -1.53,
   "capital": 80.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 49,
  "dmaRaw": 2.47,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -3.3,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.135,
  "shmiBand": "2.0",
  "imd": 3.2,
  "rural": null,
  "pop": 377,
  "age65": 11.9,
  "eth": 44.2,
  "lsoas": 215,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.6,
   19.6,
   18.5,
   20.2,
   19.3,
   18.0,
   18.2,
   18.4,
   20.2,
   18.9,
   16.7,
   13.4
  ]
 },
 {
  "code": "RTE",
  "name": "Gloucestershire Hospitals NHS Foundation Trust",
  "region": "South West",
  "icb": "South West",
  "subtype": "Acute - Large",
  "beds": 852,
  "scale": 852,
  "budget": 47.3,
  "pain": 44.6,
  "digital": 40.0,
  "buyer": null,
  "target": 44.5,
  "rawOpp": 44.5,
  "pursuitRank": 60,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "Diagnostics 6-wk"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 42,
   "rtt": 9,
   "diag": 63,
   "cancer": 74,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 868,
   "margin": -2.39,
   "capital": 131.2,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 52,
  "dmaRaw": 2.61,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": null,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.038,
  "shmiBand": "2.0",
  "imd": 6.7,
  "rural": null,
  "pop": 619,
  "age65": 18.4,
  "eth": 7.3,
  "lsoas": 377,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.6,
   18.5,
   19.1,
   19.9,
   19.7,
   19.3,
   19.1,
   19.4,
   22.1,
   19.6,
   18.5,
   15.5
  ]
 },
 {
  "code": "RNA",
  "name": "The Dudley Group NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Medium",
  "beds": 0,
  "scale": 0,
  "budget": 70.1,
  "pain": 30.0,
  "digital": 30.5,
  "buyer": null,
  "target": 44.2,
  "rawOpp": 44.2,
  "pursuitRank": 61,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "A&E 12-hour",
   "Diagnostics 6-wk"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": 28,
   "rtt": 34,
   "diag": 36,
   "cancer": 25,
   "dq": null
  },
  "finance": {
   "surplus": -3.6,
   "income": 622,
   "margin": 2.64,
   "capital": 29.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 62,
  "dmaRaw": 3.11,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -0.8,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.97,
  "shmiBand": "2.0",
  "imd": 5.1,
  "rural": null,
  "pop": 301,
  "age65": 18.0,
  "eth": 13.7,
  "lsoas": 189,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.9,
   17.7,
   16.5,
   15.7,
   16.4,
   16.5,
   17.8,
   18.2,
   19.5,
   18.0,
   14.7,
   13.1
  ]
 },
 {
  "code": "RFS",
  "name": "Chesterfield Royal Hospital NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Small",
  "beds": 589,
  "scale": 589,
  "budget": 41.3,
  "pain": 58.7,
  "digital": 56.1,
  "buyer": null,
  "target": 44.0,
  "rawOpp": 52.0,
  "pursuitRank": 124,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "Cancer FDS"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 27,
   "rtt": 87,
   "diag": 51,
   "cancer": 65,
   "dq": null
  },
  "finance": {
   "surplus": -3.5,
   "income": 428,
   "margin": 0.02,
   "capital": 36.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.33,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 93,
  "dqWeak": [],
  "shmi": 0.941,
  "shmiBand": "2.0",
  "imd": 5.3,
  "rural": null,
  "pop": 296,
  "age65": 20.7,
  "eth": 2.9,
  "lsoas": 190,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.4,
   23.2,
   21.3,
   23.6,
   25.9,
   24.0,
   24.1,
   23.2,
   25.8,
   21.6,
   18.6,
   12.7
  ]
 },
 {
  "code": "RMC",
  "name": "Bolton NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Medium",
  "beds": 650,
  "scale": 650,
  "budget": 42.3,
  "pain": 50.4,
  "digital": 32.2,
  "buyer": null,
  "target": 43.3,
  "rawOpp": 43.3,
  "pursuitRank": 62,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "A&E 4-hour",
   "RTT 18-week",
   "A&E 12-hour"
  ],
  "trigger": "A&E 4-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour under pressure.",
  "drivers": {
   "uec": 71,
   "rtt": 64,
   "diag": 10,
   "cancer": 37,
   "dq": null
  },
  "finance": {
   "surplus": -1.3,
   "income": 531,
   "margin": -0.99,
   "capital": 40.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 48,
  "dmaRaw": 2.39,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -2.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 1.139,
  "shmiBand": "2.0",
  "imd": 4.2,
  "rural": null,
  "pop": 417,
  "age65": 15.2,
  "eth": 23.8,
  "lsoas": 250,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   17.2,
   18.6,
   19.8,
   20.0,
   19.5,
   18.8,
   18.5,
   18.9,
   20.0,
   20.3,
   17.4,
   19.7
  ]
 },
 {
  "code": "RGP",
  "name": "James Paget University Hospitals NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Teaching",
  "beds": 0,
  "scale": 0,
  "budget": 14.7,
  "pain": 75.6,
  "digital": 61.5,
  "buyer": null,
  "target": 42.8,
  "rawOpp": 50.8,
  "pursuitRank": 125,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "Diagnostics 6-wk"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 52,
   "rtt": 99,
   "diag": 90,
   "cancer": 69,
   "dq": null
  },
  "finance": {
   "surplus": -5.6,
   "income": 363,
   "margin": -4.01,
   "capital": 46.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 45,
  "dmaRaw": 2.23,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.2,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 37,
  "dqWeak": [],
  "shmi": 1.133,
  "shmiBand": "2.0",
  "imd": 4.3,
  "rural": null,
  "pop": 213,
  "age65": 22.7,
  "eth": 3.9,
  "lsoas": 131,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   26.1,
   27.0,
   24.7,
   27.2,
   25.0,
   25.6,
   24.1,
   24.1,
   27.2,
   24.9,
   24.7,
   16.8
  ]
 },
 {
  "code": "RXC",
  "name": "East Sussex Healthcare NHS Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Large",
  "beds": 726,
  "scale": 726,
  "budget": 35.6,
  "pain": 44.2,
  "digital": 50.6,
  "buyer": null,
  "target": 42.7,
  "rawOpp": 42.7,
  "pursuitRank": 63,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 12-hour",
   "Cancer 62-day"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 44,
   "rtt": 42,
   "diag": 55,
   "cancer": 41,
   "dq": null
  },
  "finance": {
   "surplus": -1.5,
   "income": 721,
   "margin": -3.42,
   "capital": 106.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 42,
  "dmaRaw": 2.1,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.045,
  "shmiBand": "2.0",
  "imd": 5.3,
  "rural": null,
  "pop": 486,
  "age65": 22.5,
  "eth": 6.3,
  "lsoas": 296,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.3,
   18.5,
   18.3,
   18.2,
   17.5,
   16.9,
   17.8,
   17.7,
   20.0,
   18.5,
   17.7,
   15.7
  ]
 },
 {
  "code": "RP5",
  "name": "Doncaster and Bassetlaw Teaching Hospitals NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Teaching",
  "beds": 831,
  "scale": 831,
  "budget": 29.6,
  "pain": 57.7,
  "digital": 35.1,
  "buyer": null,
  "target": 42.5,
  "rawOpp": 42.5,
  "pursuitRank": 64,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "Diagnostics 6-wk"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 43,
   "rtt": 81,
   "diag": 76,
   "cancer": 41,
   "dq": null
  },
  "finance": {
   "surplus": -2.8,
   "income": 632,
   "margin": -4.22,
   "capital": 105.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 52,
  "dmaRaw": 2.59,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.137,
  "shmiBand": "2.0",
  "imd": 4.1,
  "rural": null,
  "pop": 307,
  "age65": 17.4,
  "eth": 5.2,
  "lsoas": 195,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   20.3,
   19.2,
   20.0,
   23.6,
   26.1,
   20.1,
   20.6,
   21.3,
   23.3,
   20.6,
   18.8,
   15.1
  ]
 },
 {
  "code": "RRJ",
  "name": "The Royal Orthopaedic Hospital NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Specialist",
  "beds": 107,
  "scale": 107,
  "budget": 28.2,
  "pain": 50.6,
  "digital": 49.7,
  "buyer": null,
  "target": 42.5,
  "rawOpp": 42.5,
  "pursuitRank": 65,
  "band": "D",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "RTT 18-week"
  ],
  "trigger": "Cancer FDS worsening",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS worsening.",
  "drivers": {
   "uec": null,
   "rtt": 44,
   "diag": 4,
   "cancer": 81,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 150,
   "margin": -0.63,
   "capital": 18.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 34,
  "dmaRaw": 1.69,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 100,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 5.3,
  "rural": null,
  "pop": 179,
  "age65": 16.4,
  "eth": 23.3,
  "lsoas": 109,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   16.6,
   15.5,
   17.7,
   15.2,
   16.9,
   17.3,
   14.1,
   17.8,
   18.5,
   17.4,
   18.3,
   18.8
  ]
 },
 {
  "code": "REM",
  "name": "Liverpool University Hospitals NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 1533,
  "scale": 1533,
  "budget": 44.8,
  "pain": 60.6,
  "digital": 40.3,
  "buyer": null,
  "target": 42.2,
  "rawOpp": 50.2,
  "pursuitRank": 126,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "A&E 12-hour",
   "RTT 18-week",
   "Cancer FDS"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 79,
   "rtt": 61,
   "diag": 34,
   "cancer": 55,
   "dq": null
  },
  "finance": {
   "surplus": -4.5,
   "income": 1377,
   "margin": -11.21,
   "capital": 129.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 52,
  "dmaRaw": 2.61,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -2.2,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 0.969,
  "shmiBand": "2.0",
  "imd": 4.8,
  "rural": null,
  "pop": 382,
  "age65": 17.3,
  "eth": 7.0,
  "lsoas": 248,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.1,
   21.5,
   20.4,
   21.0,
   21.9,
   20.9,
   21.0,
   21.7,
   23.6,
   20.7,
   19.5,
   21.0
  ]
 },
 {
  "code": "RL1",
  "name": "The Robert Jones and Agnes Hunt Orthopaedic Hospital NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Specialist",
  "beds": 132,
  "scale": 132,
  "budget": 29.0,
  "pain": 44.6,
  "digital": 57.1,
  "buyer": null,
  "target": 42.0,
  "rawOpp": 42.0,
  "pursuitRank": 66,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "Cancer FDS"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 77,
   "diag": 13,
   "cancer": 28,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 167,
   "margin": -0.55,
   "capital": 20.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 44,
  "dmaRaw": 2.2,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 2,
  "dqmi": 99,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 5.2,
  "rural": null,
  "pop": 106,
  "age65": 20.2,
  "eth": 5.8,
  "lsoas": 67,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   30.0,
   16.7,
   18.3,
   24.4,
   27.1,
   26.3,
   21.6,
   19.0,
   21.0,
   30.8,
   21.6,
   12.4
  ]
 },
 {
  "code": "RJN",
  "name": "East Cheshire NHS Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Small",
  "beds": 332,
  "scale": 332,
  "budget": 18.6,
  "pain": 72.7,
  "digital": 54.6,
  "buyer": null,
  "target": 41.3,
  "rawOpp": 49.3,
  "pursuitRank": 127,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "A&E 4-hour",
   "A&E 12-hour",
   "RTT 18-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 95,
   "rtt": 89,
   "diag": 47,
   "cancer": 47,
   "dq": null
  },
  "finance": {
   "surplus": -8.6,
   "income": 236,
   "margin": -2.37,
   "capital": 29.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 33,
  "dmaRaw": 1.67,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -3.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 82,
  "dqWeak": [],
  "shmi": 1.217,
  "shmiBand": "1.0",
  "imd": 7.0,
  "rural": null,
  "pop": 294,
  "age65": 19.6,
  "eth": 5.6,
  "lsoas": 178,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.0,
   27.0,
   30.4,
   28.4,
   28.8,
   26.7,
   26.0,
   26.4,
   29.8,
   25.7,
   23.9,
   31.5
  ]
 },
 {
  "code": "RGM",
  "name": "Royal Papworth Hospital NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Specialist",
  "beds": 244,
  "scale": 244,
  "budget": 41.6,
  "pain": 37.5,
  "digital": 46.4,
  "buyer": null,
  "target": 41.1,
  "rawOpp": 41.1,
  "pursuitRank": 67,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "RTT 52-week"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 14,
   "diag": 21,
   "cancer": 69,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 336,
   "margin": 0.57,
   "capital": 22.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 43,
  "dmaRaw": 2.14,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Outstanding",
  "cqcWellLed": "Outstanding",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 98,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 5.4,
  "rural": null,
  "pop": 174,
  "age65": 18.0,
  "eth": 9.4,
  "lsoas": 100,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   28.0,
   40.9,
   27.9,
   43.2,
   25.7,
   39.8,
   18.3,
   31.6,
   11.0,
   31.2,
   32.9,
   30.0
  ]
 },
 {
  "code": "RVW",
  "name": "North Tees and Hartlepool NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Medium",
  "beds": 577,
  "scale": 577,
  "budget": 55.8,
  "pain": 37.3,
  "digital": 25.8,
  "buyer": null,
  "target": 41.1,
  "rawOpp": 41.1,
  "pursuitRank": 68,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "RTT 52-week"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 7,
   "rtt": 37,
   "diag": 12,
   "cancer": 81,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 487,
   "margin": 1.13,
   "capital": 78.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 60,
  "dmaRaw": 3.0,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 95,
  "dqWeak": [],
  "shmi": 0.954,
  "shmiBand": "2.0",
  "imd": 4.6,
  "rural": null,
  "pop": 242,
  "age65": 17.0,
  "eth": 7.0,
  "lsoas": 153,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   15.6,
   16.9,
   16.7,
   17.1,
   16.8,
   16.2,
   15.9,
   16.2,
   18.7,
   18.4,
   15.1,
   7.6
  ]
 },
 {
  "code": "RFF",
  "name": "Barnsley Hospital NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Small",
  "beds": 508,
  "scale": 508,
  "budget": 44.5,
  "pain": 35.8,
  "digital": 44.7,
  "buyer": null,
  "target": 40.9,
  "rawOpp": 40.9,
  "pursuitRank": 69,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Cancer 62-day",
   "Cancer FDS",
   "RTT 52-week"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 15,
   "rtt": 27,
   "diag": 14,
   "cancer": 76,
   "dq": null
  },
  "finance": {
   "surplus": -1.0,
   "income": 360,
   "margin": 0.61,
   "capital": 33.2,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 52,
  "dmaRaw": 2.59,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 96,
  "dqWeak": [],
  "shmi": 0.936,
  "shmiBand": "2.0",
  "imd": 4.7,
  "rural": null,
  "pop": 50,
  "age65": 17.0,
  "eth": 4.1,
  "lsoas": 30,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   15.7,
   18.1,
   15.6,
   15.9,
   15.8,
   16.8,
   16.2,
   17.3,
   19.5,
   15.4,
   15.5,
   10.3
  ]
 },
 {
  "code": "RPA",
  "name": "Medway NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Medium",
  "beds": 642,
  "scale": 642,
  "budget": 37.2,
  "pain": 54.9,
  "digital": 54.1,
  "buyer": null,
  "target": 40.5,
  "rawOpp": 48.5,
  "pursuitRank": 128,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "RTT 18-week",
   "A&E 12-hour",
   "Cancer FDS"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Elective recovery / RTT",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 68,
   "rtt": 61,
   "diag": 22,
   "cancer": 52,
   "dq": null
  },
  "finance": {
   "surplus": -9.1,
   "income": 519,
   "margin": -1.68,
   "capital": 81.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 51,
  "dmaRaw": 2.56,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -8.8,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 29,
  "dqWeak": [],
  "shmi": 1.256,
  "shmiBand": "1.0",
  "imd": 5.2,
  "rural": null,
  "pop": 563,
  "age65": 15.4,
  "eth": 13.2,
  "lsoas": 337,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   25.2,
   23.5,
   22.9,
   23.0,
   22.4,
   20.9,
   18.4,
   20.8,
   19.7,
   17.6,
   16.8,
   18.9
  ]
 },
 {
  "code": "R0B",
  "name": "South Tyneside and Sunderland NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Large",
  "beds": 1121,
  "scale": 1121,
  "budget": 52.3,
  "pain": 29.0,
  "digital": 37.4,
  "buyer": null,
  "target": 39.2,
  "rawOpp": 39.2,
  "pursuitRank": 70,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer 62-day",
   "A&E 4-hour"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 23,
   "rtt": 6,
   "diag": 60,
   "cancer": 43,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 819,
   "margin": -1.44,
   "capital": 74.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 69,
  "dmaRaw": 3.44,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.1,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "\u2014",
  "cqcWellLed": "\u2014",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 1.18,
  "shmiBand": "1.0",
  "imd": 3.5,
  "rural": null,
  "pop": 320,
  "age65": 17.3,
  "eth": 6.4,
  "lsoas": 214,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   17.0,
   17.8,
   19.0,
   19.2,
   16.2,
   16.3,
   15.7,
   16.9,
   18.6,
   16.8,
   15.3,
   11.4
  ]
 },
 {
  "code": "RRF",
  "name": "Wrightington, Wigan and Leigh NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Medium",
  "beds": 422,
  "scale": 422,
  "budget": 27.8,
  "pain": 64.7,
  "digital": 45.8,
  "buyer": null,
  "target": 39.2,
  "rawOpp": 47.2,
  "pursuitRank": 129,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "A&E 12-hour",
   "RTT 52-week",
   "RTT 18-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 74,
   "rtt": 86,
   "diag": 60,
   "cancer": 37,
   "dq": null
  },
  "finance": {
   "surplus": -1.6,
   "income": 581,
   "margin": -3.97,
   "capital": 59.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 49,
  "dmaRaw": 2.47,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -0.5,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 67,
  "dqWeak": [],
  "shmi": 1.026,
  "shmiBand": "2.0",
  "imd": 5.0,
  "rural": null,
  "pop": 384,
  "age65": 16.8,
  "eth": 8.6,
  "lsoas": 229,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.3,
   24.7,
   25.3,
   25.7,
   26.1,
   25.8,
   26.1,
   26.9,
   28.2,
   24.5,
   20.0,
   21.8
  ]
 },
 {
  "code": "RCD",
  "name": "Harrogate and District NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Small",
  "beds": 311,
  "scale": 311,
  "budget": 43.5,
  "pain": 28.8,
  "digital": 50.6,
  "buyer": null,
  "target": 39.1,
  "rawOpp": 39.1,
  "pursuitRank": 71,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 4-hour",
   "Cancer FDS"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 25,
   "rtt": 9,
   "diag": 93,
   "cancer": 21,
   "dq": null
  },
  "finance": {
   "surplus": -1.4,
   "income": 402,
   "margin": 0.51,
   "capital": 35.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 48,
  "dmaRaw": 2.41,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -5.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.018,
  "shmiBand": "2.0",
  "imd": 6.0,
  "rural": null,
  "pop": 577,
  "age65": 17.1,
  "eth": 13.9,
  "lsoas": 357,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.4,
   19.4,
   17.9,
   18.1,
   18.5,
   18.8,
   19.4,
   20.3,
   21.9,
   18.3,
   16.7,
   11.7
  ]
 },
 {
  "code": "R1F",
  "name": "Isle of Wight NHS Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Multi-Service",
  "beds": 299,
  "scale": 299,
  "budget": 22.6,
  "pain": 59.4,
  "digital": 27.9,
  "buyer": null,
  "target": 39.0,
  "rawOpp": 39.0,
  "pursuitRank": 72,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 12-hour",
   "Diagnostics 6-wk",
   "RTT 18-week"
  ],
  "trigger": "A&E 12-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour under pressure.",
  "drivers": {
   "uec": 73,
   "rtt": 43,
   "diag": 82,
   "cancer": 51,
   "dq": null
  },
  "finance": {
   "surplus": -2.3,
   "income": 283,
   "margin": -1.98,
   "capital": 50.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.36,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 96,
  "dqWeak": [],
  "shmi": 0.986,
  "shmiBand": "2.0",
  "imd": 3.9,
  "rural": null,
  "pop": 85,
  "age65": 25.9,
  "eth": 3.1,
  "lsoas": 54,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.5,
   23.3,
   22.1,
   21.5,
   19.9,
   22.7,
   21.6,
   24.5,
   26.1,
   22.9,
   21.2,
   19.7
  ]
 },
 {
  "code": "RJ6",
  "name": "Croydon Health Services NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Medium",
  "beds": 491,
  "scale": 491,
  "budget": 1.5,
  "pain": 44.6,
  "digital": 80.8,
  "buyer": null,
  "target": 37.9,
  "rawOpp": 37.9,
  "pursuitRank": 73,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 12-hour",
   "Cancer FDS",
   "A&E 4-hour"
  ],
  "trigger": "A&E 12-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour under pressure.",
  "drivers": {
   "uec": 59,
   "rtt": 33,
   "diag": 31,
   "cancer": 49,
   "dq": null
  },
  "finance": {
   "surplus": -2.2,
   "income": null,
   "margin": null,
   "capital": 84.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 40,
  "dmaRaw": 2.0,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.079,
  "shmiBand": "2.0",
  "imd": 5.0,
  "rural": null,
  "pop": 370,
  "age65": 11.1,
  "eth": 50.5,
  "lsoas": 217,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "4/6 features present; missing: TAC income, TAC margin; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.5,
   20.3,
   22.0,
   22.3,
   25.7,
   24.1,
   21.4,
   20.4,
   22.2,
   19.2,
   15.6,
   17.6
  ]
 },
 {
  "code": "RJC",
  "name": "South Warwickshire University NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Teaching",
  "beds": 483,
  "scale": 483,
  "budget": 33.0,
  "pain": 36.3,
  "digital": 45.4,
  "buyer": null,
  "target": 37.3,
  "rawOpp": 37.3,
  "pursuitRank": 74,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer 62-day",
   "A&E 4-hour",
   "Cancer FDS"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": 28,
   "rtt": 28,
   "diag": 15,
   "cancer": 64,
   "dq": null
  },
  "finance": {
   "surplus": 0.5,
   "income": 513,
   "margin": -2.18,
   "capital": 42.9,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 52,
  "dmaRaw": 2.6,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -0.6,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 95,
  "dqWeak": [],
  "shmi": 1.014,
  "shmiBand": "2.0",
  "imd": 6.3,
  "rural": null,
  "pop": 599,
  "age65": 17.7,
  "eth": 11.7,
  "lsoas": 359,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   20.2,
   19.3,
   20.3,
   21.9,
   23.2,
   20.3,
   17.4,
   18.0,
   19.6,
   16.5,
   16.4,
   12.1
  ]
 },
 {
  "code": "RRK",
  "name": "University Hospitals Birmingham NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Teaching",
  "beds": 2886,
  "scale": 2886,
  "budget": 2.2,
  "pain": 54.4,
  "digital": 59.2,
  "buyer": null,
  "target": 37.1,
  "rawOpp": 37.1,
  "pursuitRank": 75,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 4-hour",
   "A&E 12-hour"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 80,
   "rtt": 25,
   "diag": 95,
   "cancer": 38,
   "dq": null
  },
  "finance": {
   "surplus": -0.2,
   "income": null,
   "margin": null,
   "capital": 196.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.33,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -1.1,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.933,
  "shmiBand": "2.0",
  "imd": 4.3,
  "rural": null,
  "pop": 1001,
  "age65": 13.8,
  "eth": 34.0,
  "lsoas": 591,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "4/6 features present; missing: TAC income, TAC margin; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   29.9,
   29.4,
   27.8,
   27.6,
   26.8,
   26.3,
   25.7,
   24.5,
   26.7,
   24.2,
   22.2,
   21.5
  ]
 },
 {
  "code": "RET",
  "name": "The Walton Centre NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Specialist",
  "beds": 158,
  "scale": 158,
  "budget": 51.1,
  "pain": 14.6,
  "digital": 54.2,
  "buyer": null,
  "target": 36.8,
  "rawOpp": 36.8,
  "pursuitRank": 76,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "RTT 18-week",
   "RTT 52-week",
   "Cancer 62-day"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 33,
   "diag": 2,
   "cancer": 2,
   "dq": null
  },
  "finance": {
   "surplus": 3.4,
   "income": 213,
   "margin": 3.02,
   "capital": 31.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 45,
  "dmaRaw": 2.27,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.1,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Outstanding",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 99,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 2.3,
  "rural": null,
  "pop": 5,
  "age65": 17.0,
  "eth": 6.5,
  "lsoas": 3,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   7.8,
   8.8,
   7.5,
   8.8,
   7.7,
   7.6,
   7.7,
   7.6,
   7.5,
   7.5,
   7.3,
   8.2
  ]
 },
 {
  "code": "RNQ",
  "name": "Kettering General Hospital NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Small",
  "beds": 575,
  "scale": 575,
  "budget": 22.2,
  "pain": 59.7,
  "digital": 52.8,
  "buyer": null,
  "target": 36.8,
  "rawOpp": 44.8,
  "pursuitRank": 130,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer FDS",
   "Cancer 62-day"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "Cancer / diagnostics pathway",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 43,
   "rtt": 38,
   "diag": 98,
   "cancer": 79,
   "dq": null
  },
  "finance": {
   "surplus": -9.5,
   "income": 461,
   "margin": -3.62,
   "capital": 55.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 47,
  "dmaRaw": 2.34,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -2.5,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 96,
  "dqWeak": [],
  "shmi": 0.963,
  "shmiBand": "2.0",
  "imd": 5.9,
  "rural": null,
  "pop": 294,
  "age65": 16.2,
  "eth": 9.4,
  "lsoas": 167,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.4,
   20.0,
   22.4,
   21.9,
   22.9,
   24.8,
   25.2,
   27.0,
   30.2,
   25.2,
   23.6,
   15.4
  ]
 },
 {
  "code": "RTK",
  "name": "Ashford and St Peter's Hospitals NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Medium",
  "beds": 527,
  "scale": 527,
  "budget": 27.9,
  "pain": 52.6,
  "digital": 22.7,
  "buyer": null,
  "target": 36.8,
  "rawOpp": 36.8,
  "pursuitRank": 77,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "A&E 12-hour",
   "RTT 18-week",
   "RTT 52-week"
  ],
  "trigger": "A&E 12-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 12-hour under pressure.",
  "drivers": {
   "uec": 70,
   "rtt": 67,
   "diag": 56,
   "cancer": 19,
   "dq": null
  },
  "finance": {
   "surplus": -1.4,
   "income": 493,
   "margin": -2.71,
   "capital": 64.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 59,
  "dmaRaw": 2.96,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 0.92,
  "shmiBand": "2.0",
  "imd": 6.9,
  "rural": null,
  "pop": 452,
  "age65": 14.2,
  "eth": 25.5,
  "lsoas": 266,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   19.5,
   19.6,
   18.8,
   18.9,
   18.6,
   18.3,
   18.6,
   18.8,
   21.0,
   18.5,
   18.1,
   19.4
  ]
 },
 {
  "code": "RBT",
  "name": "Mid Cheshire Hospitals NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Small",
  "beds": 559,
  "scale": 559,
  "budget": 19.5,
  "pain": 63.0,
  "digital": 48.1,
  "buyer": null,
  "target": 36.1,
  "rawOpp": 44.1,
  "pursuitRank": 131,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "A&E 4-hour",
   "A&E 12-hour",
   "RTT 18-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 90,
   "rtt": 68,
   "diag": 30,
   "cancer": 47,
   "dq": null
  },
  "finance": {
   "surplus": -9.6,
   "income": 448,
   "margin": -4.19,
   "capital": 46.2,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 53,
  "dmaRaw": 2.66,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -3.7,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 88,
  "dqWeak": [],
  "shmi": 0.941,
  "shmiBand": "2.0",
  "imd": 6.3,
  "rural": null,
  "pop": 209,
  "age65": 18.1,
  "eth": 5.1,
  "lsoas": 127,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   26.4,
   26.4,
   27.1,
   28.1,
   26.5,
   26.6,
   25.9,
   23.1,
   25.2,
   24.0,
   20.7,
   24.6
  ]
 },
 {
  "code": "REP",
  "name": "Liverpool Women's NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Specialist",
  "beds": 110,
  "scale": 110,
  "budget": 3.8,
  "pain": 65.4,
  "digital": 31.3,
  "buyer": null,
  "target": 35.6,
  "rawOpp": 35.6,
  "pursuitRank": 78,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "Cancer 62-day",
   "RTT 18-week"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 19,
   "rtt": 91,
   "diag": 16,
   "cancer": 87,
   "dq": null
  },
  "finance": {
   "surplus": -19.6,
   "income": 179,
   "margin": -13.52,
   "capital": 26.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 50,
  "dmaRaw": 2.5,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -5.8,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 93,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 3.2,
  "rural": null,
  "pop": 408,
  "age65": 14.3,
  "eth": 13.8,
  "lsoas": 258,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   28.0,
   29.0,
   25.3,
   26.2,
   26.1,
   29.1,
   23.2,
   23.7,
   24.2,
   19.3,
   17.3,
   18.1
  ]
 },
 {
  "code": "RMP",
  "name": "Tameside and Glossop Integrated Care NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Small",
  "beds": 476,
  "scale": 476,
  "budget": 30.7,
  "pain": 35.2,
  "digital": 42.6,
  "buyer": null,
  "target": 35.4,
  "rawOpp": 35.4,
  "pursuitRank": 79,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "A&E 4-hour",
   "A&E 12-hour",
   "Cancer FDS"
  ],
  "trigger": "A&E 4-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour under pressure.",
  "drivers": {
   "uec": 88,
   "rtt": 5,
   "diag": 5,
   "cancer": 28,
   "dq": null
  },
  "finance": {
   "surplus": -9.3,
   "income": 378,
   "margin": -1.22,
   "capital": 49.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 43,
  "dmaRaw": 2.14,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.101,
  "shmiBand": "2.0",
  "imd": 4.0,
  "rural": null,
  "pop": 88,
  "age65": 15.9,
  "eth": 15.3,
  "lsoas": 55,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   17.1,
   17.2,
   16.6,
   16.6,
   16.1,
   17.1,
   16.4,
   16.8,
   18.2,
   16.1,
   13.9,
   24.0
  ]
 },
 {
  "code": "RHW",
  "name": "Royal Berkshire NHS Foundation Trust",
  "region": "South East",
  "icb": "South East",
  "subtype": "Acute - Large",
  "beds": 665,
  "scale": 665,
  "budget": 35.3,
  "pain": 22.0,
  "digital": 55.1,
  "buyer": null,
  "target": 34.5,
  "rawOpp": 34.5,
  "pursuitRank": 80,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 4-hour",
   "Cancer 62-day"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 28,
   "rtt": 8,
   "diag": 43,
   "cancer": 20,
   "dq": null
  },
  "finance": {
   "surplus": -3.2,
   "income": 674,
   "margin": -3.1,
   "capital": 148.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 45,
  "dmaRaw": 2.24,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 95,
  "dqWeak": [],
  "shmi": 1.104,
  "shmiBand": "2.0",
  "imd": 7.6,
  "rural": null,
  "pop": 636,
  "age65": 14.7,
  "eth": 20.2,
  "lsoas": 376,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   15.6,
   15.1,
   14.2,
   15.3,
   16.6,
   14.7,
   14.7,
   14.1,
   15.9,
   13.7,
   12.6,
   12.7
  ]
 },
 {
  "code": "RP6",
  "name": "Moorfields Eye Hospital NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Specialist",
  "beds": 9,
  "scale": 9,
  "budget": 58.2,
  "pain": 3.4,
  "digital": 53.1,
  "buyer": null,
  "target": 34.4,
  "rawOpp": 34.4,
  "pursuitRank": 81,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "RTT 52-week",
   "Cancer FDS"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 1,
   "rtt": 5,
   "diag": 7,
   "cancer": 3,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 366,
   "margin": 5.4,
   "capital": 55.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 48,
  "dmaRaw": 2.4,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 2.1,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 5.3,
  "rural": null,
  "pop": 242,
  "age65": 10.0,
  "eth": 37.7,
  "lsoas": 140,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   2.9,
   3.0,
   6.0,
   8.5,
   10.9,
   4.4,
   2.6,
   3.6,
   3.6,
   17.2,
   4.0,
   1.6
  ]
 },
 {
  "code": "RPY",
  "name": "The Royal Marsden NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Specialist",
  "beds": 214,
  "scale": 214,
  "budget": 57.4,
  "pain": 13.1,
  "digital": 35.7,
  "buyer": null,
  "target": 34.1,
  "rawOpp": 34.1,
  "pursuitRank": 82,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer 62-day",
   "RTT 52-week",
   "Diagnostics 6-wk"
  ],
  "trigger": "Cancer 62-day under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 7,
   "diag": 7,
   "cancer": 23,
   "dq": null
  },
  "finance": {
   "surplus": 0.8,
   "income": 694,
   "margin": 0.22,
   "capital": 97.9,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 50,
  "dmaRaw": 2.51,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.3,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Outstanding",
  "cqcWellLed": "Outstanding",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 7.4,
  "rural": null,
  "pop": 62,
  "age65": 13.0,
  "eth": 36.3,
  "lsoas": 38,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   9.4,
   10.2,
   8.2,
   9.5,
   9.1,
   9.4,
   9.0,
   9.8,
   10.5,
   9.2,
   8.7,
   7.5
  ]
 },
 {
  "code": "RBL",
  "name": "Wirral University Teaching Hospital NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 817,
  "scale": 817,
  "budget": 36.2,
  "pain": 49.8,
  "digital": 37.0,
  "buyer": null,
  "target": 34.0,
  "rawOpp": 42.0,
  "pursuitRank": 132,
  "band": "D",
  "distress": true,
  "trend": "Improving",
  "topPain": [
   "A&E 12-hour",
   "A&E 4-hour",
   "RTT 18-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 83,
   "rtt": 47,
   "diag": 24,
   "cancer": 32,
   "dq": null
  },
  "finance": {
   "surplus": -4.5,
   "income": 540,
   "margin": -2.05,
   "capital": 59.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 58,
  "dmaRaw": 2.91,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 91,
  "dqWeak": [],
  "shmi": 1.0,
  "shmiBand": "2.0",
  "imd": 5.9,
  "rural": null,
  "pop": 212,
  "age65": 20.6,
  "eth": 4.2,
  "lsoas": 138,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.3,
   20.8,
   21.6,
   22.5,
   24.1,
   22.7,
   22.4,
   23.7,
   24.6,
   20.5,
   18.4,
   23.2
  ]
 },
 {
  "code": "RKE",
  "name": "Whittington Health NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Multi-Service",
  "beds": 300,
  "scale": 300,
  "budget": 29.8,
  "pain": 27.1,
  "digital": 52.2,
  "buyer": null,
  "target": 34.0,
  "rawOpp": 34.0,
  "pursuitRank": 83,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Diagnostics 6-wk",
   "A&E 12-hour",
   "Cancer 62-day"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 31,
   "rtt": 20,
   "diag": 57,
   "cancer": 16,
   "dq": null
  },
  "finance": {
   "surplus": -0.3,
   "income": 500,
   "margin": -2.47,
   "capital": 92.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 40,
  "dmaRaw": 2.0,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -1.5,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Good",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.927,
  "shmiBand": "2.0",
  "imd": 4.3,
  "rural": null,
  "pop": 334,
  "age65": 9.7,
  "eth": 36.8,
  "lsoas": 197,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   16.7,
   16.0,
   17.5,
   16.7,
   17.5,
   19.8,
   18.7,
   19.5,
   20.9,
   16.4,
   14.9,
   13.7
  ]
 },
 {
  "code": "RBK",
  "name": "Walsall Healthcare NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Small",
  "beds": 504,
  "scale": 504,
  "budget": 54.6,
  "pain": 22.7,
  "digital": 20.2,
  "buyer": null,
  "target": 33.4,
  "rawOpp": 33.4,
  "pursuitRank": 84,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer 62-day",
   "RTT 18-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 11,
   "rtt": 9,
   "diag": 84,
   "cancer": 17,
   "dq": null
  },
  "finance": {
   "surplus": -6.3,
   "income": 482,
   "margin": 1.06,
   "capital": 40.2,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 51,
  "dmaRaw": 2.56,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 1.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.938,
  "shmiBand": "2.0",
  "imd": 4.1,
  "rural": null,
  "pop": 297,
  "age65": 15.7,
  "eth": 27.0,
  "lsoas": 178,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   15.9,
   16.4,
   16.7,
   16.7,
   17.3,
   18.3,
   18.6,
   19.3,
   23.1,
   16.9,
   15.1,
   9.4
  ]
 },
 {
  "code": "RFR",
  "name": "The Rotherham NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Small",
  "beds": 498,
  "scale": 498,
  "budget": 48.6,
  "pain": 30.0,
  "digital": 16.5,
  "buyer": null,
  "target": 33.4,
  "rawOpp": 33.4,
  "pursuitRank": 85,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "A&E 4-hour",
   "RTT 52-week",
   "Cancer 62-day"
  ],
  "trigger": "A&E 4-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour under pressure.",
  "drivers": {
   "uec": 43,
   "rtt": 40,
   "diag": 6,
   "cancer": 19,
   "dq": null
  },
  "finance": {
   "surplus": -1.1,
   "income": 408,
   "margin": 0.86,
   "capital": 43.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 57,
  "dmaRaw": 2.87,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -1.2,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.085,
  "shmiBand": "2.0",
  "imd": 4.0,
  "rural": null,
  "pop": 396,
  "age65": 16.7,
  "eth": 7.2,
  "lsoas": 249,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   18.3,
   16.7,
   16.2,
   17.1,
   14.8,
   16.6,
   15.0,
   16.5,
   17.2,
   15.7,
   14.3,
   14.9
  ]
 },
 {
  "code": "RGR",
  "name": "West Suffolk NHS Foundation Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Small",
  "beds": 526,
  "scale": 526,
  "budget": 14.6,
  "pain": 44.4,
  "digital": 41.3,
  "buyer": null,
  "target": 33.2,
  "rawOpp": 33.2,
  "pursuitRank": 86,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "A&E 4-hour",
   "A&E 12-hour"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 57,
   "rtt": 57,
   "diag": 45,
   "cancer": 19,
   "dq": null
  },
  "finance": {
   "surplus": -4.9,
   "income": 428,
   "margin": -6.58,
   "capital": 60.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 55,
  "dmaRaw": 2.74,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.9,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 89,
  "dqWeak": [],
  "shmi": 0.949,
  "shmiBand": "2.0",
  "imd": 6.1,
  "rural": null,
  "pop": 248,
  "age65": 20.4,
  "eth": 6.0,
  "lsoas": 149,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   27.7,
   26.8,
   25.9,
   25.1,
   25.0,
   24.6,
   22.1,
   22.6,
   22.8,
   19.2,
   15.9,
   17.5
  ]
 },
 {
  "code": "RWG",
  "name": "West Hertfordshire Teaching Hospitals NHS Trust",
  "region": "East",
  "icb": "East",
  "subtype": "Acute - Teaching",
  "beds": 733,
  "scale": 733,
  "budget": 23.9,
  "pain": 36.6,
  "digital": 29.7,
  "buyer": null,
  "target": 30.5,
  "rawOpp": 30.5,
  "pursuitRank": 87,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "Cancer FDS",
   "RTT 52-week"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 14,
   "rtt": 34,
   "diag": 78,
   "cancer": 41,
   "dq": null
  },
  "finance": {
   "surplus": -0.6,
   "income": 598,
   "margin": -7.3,
   "capital": 90.4,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 61,
  "dmaRaw": 3.04,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 0.96,
  "shmiBand": "2.0",
  "imd": 7.4,
  "rural": null,
  "pop": 364,
  "age65": 14.1,
  "eth": 21.5,
  "lsoas": 214,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   16.1,
   15.4,
   15.7,
   16.6,
   18.3,
   18.8,
   17.3,
   18.2,
   19.5,
   17.0,
   16.0,
   8.4
  ]
 },
 {
  "code": "RJR",
  "name": "Countess of Chester Hospital NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Small",
  "beds": 560,
  "scale": 560,
  "budget": 28.8,
  "pain": 53.7,
  "digital": 24.4,
  "buyer": null,
  "target": 30.0,
  "rawOpp": 38.0,
  "pursuitRank": 133,
  "band": "D",
  "distress": true,
  "trend": "Volatile",
  "topPain": [
   "A&E 12-hour",
   "A&E 4-hour",
   "RTT 18-week"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 97,
   "rtt": 51,
   "diag": 54,
   "cancer": 13,
   "dq": null
  },
  "finance": {
   "surplus": -9.4,
   "income": 410,
   "margin": -1.83,
   "capital": 34.3,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 60,
  "dmaRaw": 3.0,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.4,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Requires improvement",
  "cqcWellLed": "Requires improvement",
  "cqcBelowGood": true,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.9,
  "shmiBand": "2.0",
  "imd": 6.4,
  "rural": null,
  "pop": 253,
  "age65": 18.3,
  "eth": 5.4,
  "lsoas": 162,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   27.4,
   27.0,
   27.4,
   26.8,
   27.9,
   26.2,
   25.3,
   25.4,
   27.4,
   23.3,
   20.7,
   28.8
  ]
 },
 {
  "code": "RTF",
  "name": "Northumbria Healthcare NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Large",
  "beds": 939,
  "scale": 939,
  "budget": 44.3,
  "pain": 8.6,
  "digital": 45.2,
  "buyer": null,
  "target": 29.8,
  "rawOpp": 29.8,
  "pursuitRank": 88,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "Diagnostics 6-wk"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 2,
   "rtt": 3,
   "diag": 4,
   "cancer": 22,
   "dq": null
  },
  "finance": {
   "surplus": 1.4,
   "income": 882,
   "margin": -3.03,
   "capital": 97.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 55,
  "dmaRaw": 2.74,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Outstanding",
  "cqcWellLed": "Outstanding",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 94,
  "dqWeak": [],
  "shmi": 0.992,
  "shmiBand": "2.0",
  "imd": 5.5,
  "rural": null,
  "pop": 444,
  "age65": 20.5,
  "eth": 4.2,
  "lsoas": 278,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   9.2,
   8.9,
   7.9,
   9.6,
   8.8,
   8.9,
   8.7,
   9.0,
   9.5,
   8.8,
   8.4,
   4.6
  ]
 },
 {
  "code": "RCF",
  "name": "Airedale NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Small",
  "beds": 409,
  "scale": 409,
  "budget": 7.1,
  "pain": 37.6,
  "digital": 47.6,
  "buyer": null,
  "target": 29.2,
  "rawOpp": 29.2,
  "pursuitRank": 89,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "A&E 4-hour",
   "A&E 12-hour",
   "Cancer 62-day"
  ],
  "trigger": "A&E 4-hour under pressure",
  "play": "UEC / A&E flow",
  "why": "A&E 4-hour under pressure.",
  "drivers": {
   "uec": 83,
   "rtt": 16,
   "diag": 22,
   "cancer": 21,
   "dq": null
  },
  "finance": {
   "surplus": -5.5,
   "income": 311,
   "margin": -10.95,
   "capital": 49.1,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 42,
  "dmaRaw": 2.09,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.3,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 0.951,
  "shmiBand": "2.0",
  "imd": 5.8,
  "rural": null,
  "pop": 103,
  "age65": 19.4,
  "eth": 15.6,
  "lsoas": 59,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   14.6,
   14.9,
   13.0,
   16.8,
   16.3,
   16.6,
   18.8,
   18.8,
   17.6,
   17.9,
   15.7,
   24.1
  ]
 },
 {
  "code": "RAN",
  "name": "Royal National Orthopaedic Hospital NHS Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Specialist",
  "beds": 175,
  "scale": 175,
  "budget": 19.2,
  "pain": 23.6,
  "digital": 52.7,
  "buyer": null,
  "target": 28.9,
  "rawOpp": 28.9,
  "pursuitRank": 90,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "Cancer FDS",
   "Diagnostics 6-wk",
   "RTT 18-week"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 16,
   "diag": 29,
   "cancer": 29,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": 225,
   "margin": -2.18,
   "capital": 42.6,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 35,
  "dmaRaw": 1.74,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 5.0,
  "rural": null,
  "pop": 2,
  "age65": 11.9,
  "eth": 45.8,
  "lsoas": 1,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   14.3,
   14.4,
   10.0,
   9.8,
   10.6,
   11.6,
   11.9,
   15.3,
   15.5,
   13.4,
   14.0,
   12.6
  ]
 },
 {
  "code": "RBV",
  "name": "The Christie NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Specialist",
  "beds": 187,
  "scale": 187,
  "budget": 46.5,
  "pain": 6.7,
  "digital": 39.8,
  "buyer": null,
  "target": 28.5,
  "rawOpp": 28.5,
  "pursuitRank": 91,
  "band": "D",
  "distress": false,
  "trend": "Worsening",
  "topPain": [
   "Cancer 62-day",
   "Diagnostics 6-wk",
   "Cancer FDS"
  ],
  "trigger": "Cancer 62-day worsening",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer 62-day worsening.",
  "drivers": {
   "uec": null,
   "rtt": 1,
   "diag": 9,
   "cancer": 11,
   "dq": null
  },
  "finance": {
   "surplus": 1.4,
   "income": 543,
   "margin": -0.53,
   "capital": 79.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 46,
  "dmaRaw": 2.29,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 95,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 5.1,
  "rural": null,
  "pop": 33,
  "age65": 12.9,
  "eth": 18.5,
  "lsoas": 20,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   8.0,
   11.1,
   8.9,
   9.4,
   8.9,
   7.8,
   6.5,
   4.7,
   8.2,
   11.1,
   7.0,
   6.0
  ]
 },
 {
  "code": "RQ3",
  "name": "Birmingham Women's and Children's NHS Foundation Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Specialist",
  "beds": 0,
  "scale": 0,
  "budget": 0.7,
  "pain": 37.3,
  "digital": 51.3,
  "buyer": null,
  "target": 27.7,
  "rawOpp": 27.7,
  "pursuitRank": 92,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "RTT 18-week",
   "Diagnostics 6-wk",
   "RTT 52-week"
  ],
  "trigger": "RTT 18-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 18-week under pressure.",
  "drivers": {
   "uec": 9,
   "rtt": 53,
   "diag": 73,
   "cancer": 18,
   "dq": null
  },
  "finance": {
   "surplus": 0.0,
   "income": null,
   "margin": null,
   "capital": 55.5,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 40,
  "dmaRaw": 1.99,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": -1.3,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 86,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 2.8,
  "rural": null,
  "pop": 74,
  "age65": 10.8,
  "eth": 59.1,
  "lsoas": 41,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "4/6 features present; missing: TAC income, TAC margin; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   22.6,
   19.2,
   22.4,
   21.0,
   16.7,
   22.1,
   18.1,
   21.5,
   22.4,
   20.3,
   15.5,
   15.8
  ]
 },
 {
  "code": "REN",
  "name": "The Clatterbridge Cancer Centre NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Specialist",
  "beds": 95,
  "scale": 95,
  "budget": 47.0,
  "pain": 11.9,
  "digital": 26.2,
  "buyer": null,
  "target": 27.7,
  "rawOpp": 27.7,
  "pursuitRank": 93,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "Cancer FDS",
   "Cancer 62-day",
   "RTT 52-week"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": null,
   "rtt": 1,
   "diag": 1,
   "cancer": 28,
   "dq": null
  },
  "finance": {
   "surplus": 0.3,
   "income": 321,
   "margin": 1.14,
   "capital": 48.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 72,
  "dmaRaw": 3.59,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 100,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": null,
  "rural": null,
  "pop": null,
  "age65": null,
  "eth": null,
  "lsoas": null,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "Medium",
   "why": "5/6 features present; missing: pain (>=6/7); buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   8.0,
   9.4,
   9.1,
   3.3,
   5.8,
   8.0,
   5.8,
   5.6,
   5.6,
   8.6,
   3.6,
   6.5
  ]
 },
 {
  "code": "RWW",
  "name": "Warrington and Halton Teaching Hospitals NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Teaching",
  "beds": 638,
  "scale": 638,
  "budget": 13.9,
  "pain": 47.9,
  "digital": 44.9,
  "buyer": null,
  "target": 27.2,
  "rawOpp": 35.2,
  "pursuitRank": 134,
  "band": "D",
  "distress": true,
  "trend": "Worsening",
  "topPain": [
   "A&E 12-hour",
   "Cancer FDS",
   "A&E 4-hour"
  ],
  "trigger": "Segment 4 (intensive support) \u2014 qualify funding route",
  "play": "UEC / A&E flow",
  "why": "Segment 4 (intensive support) \u2014 qualify funding route.",
  "drivers": {
   "uec": 76,
   "rtt": 45,
   "diag": 13,
   "cancer": 40,
   "dq": null
  },
  "finance": {
   "surplus": -7.7,
   "income": 392,
   "margin": -4.97,
   "capital": 60.9,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 57,
  "dmaRaw": 2.84,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": -3.4,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 4,
  "dqmi": 93,
  "dqWeak": [],
  "shmi": 1.056,
  "shmiBand": "2.0",
  "imd": 5.7,
  "rural": null,
  "pop": 497,
  "age65": 16.4,
  "eth": 9.1,
  "lsoas": 308,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   21.5,
   22.1,
   21.9,
   22.3,
   21.5,
   20.4,
   19.9,
   20.4,
   20.1,
   19.8,
   18.5,
   23.9
  ]
 },
 {
  "code": "RWY",
  "name": "Calderdale and Huddersfield NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Large",
  "beds": 817,
  "scale": 817,
  "budget": 40.7,
  "pain": 15.6,
  "digital": 26.6,
  "buyer": null,
  "target": 27.1,
  "rawOpp": 27.1,
  "pursuitRank": 94,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "Diagnostics 6-wk",
   "A&E 12-hour"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 10,
   "rtt": 9,
   "diag": 33,
   "cancer": 20,
   "dq": null
  },
  "finance": {
   "surplus": -6.7,
   "income": 636,
   "margin": -2.17,
   "capital": 76.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 55,
  "dmaRaw": 2.76,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.1,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 92,
  "dqWeak": [],
  "shmi": 1.152,
  "shmiBand": "2.0",
  "imd": 4.9,
  "rural": null,
  "pop": 740,
  "age65": 16.2,
  "eth": 20.0,
  "lsoas": 442,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   13.6,
   13.8,
   13.3,
   13.8,
   11.8,
   11.8,
   13.3,
   13.4,
   14.7,
   12.6,
   10.2,
   8.2
  ]
 },
 {
  "code": "RBS",
  "name": "Alder Hey Children's NHS Foundation Trust",
  "region": "North West",
  "icb": "North West",
  "subtype": "Acute - Specialist",
  "beds": 213,
  "scale": 213,
  "budget": 45.5,
  "pain": 17.8,
  "digital": 14.3,
  "buyer": null,
  "target": 26.8,
  "rawOpp": 26.8,
  "pursuitRank": 95,
  "band": "D",
  "distress": false,
  "trend": "Flat",
  "topPain": [
   "RTT 52-week",
   "RTT 18-week",
   "Diagnostics 6-wk"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 2,
   "rtt": 45,
   "diag": 11,
   "cancer": 2,
   "dq": null
  },
  "finance": {
   "surplus": 1.6,
   "income": 455,
   "margin": 0.2,
   "capital": 45.0,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 69,
  "dmaRaw": 3.47,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": true,
  "q3Var": 0.1,
  "q3ForecastDeficit": false,
  "q3Dsf": false,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 1,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 3.5,
  "rural": null,
  "pop": 140,
  "age65": 15.3,
  "eth": 6.4,
  "lsoas": 90,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   8.3,
   8.1,
   9.8,
   9.7,
   8.5,
   8.7,
   7.8,
   8.0,
   11.3,
   7.8,
   7.8,
   7.7
  ]
 },
 {
  "code": "RCU",
  "name": "Sheffield Children's NHS Foundation Trust",
  "region": "North East and Yorkshire",
  "icb": "North East and Yorkshire",
  "subtype": "Acute - Specialist",
  "beds": 166,
  "scale": 166,
  "budget": 30.4,
  "pain": 21.4,
  "digital": 29.1,
  "buyer": null,
  "target": 26.4,
  "rawOpp": 26.4,
  "pursuitRank": 96,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "RTT 52-week",
   "Diagnostics 6-wk",
   "RTT 18-week"
  ],
  "trigger": "RTT 52-week under pressure",
  "play": "Elective recovery / RTT",
  "why": "RTT 52-week under pressure.",
  "drivers": {
   "uec": 1,
   "rtt": 42,
   "diag": 61,
   "cancer": 1,
   "dq": null
  },
  "finance": {
   "surplus": -1.1,
   "income": 344,
   "margin": -0.99,
   "capital": 30.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 53,
  "dmaRaw": 2.63,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "\u2014",
  "fdpBenefits": false,
  "q3Var": 0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 96,
  "dqWeak": [],
  "shmi": null,
  "shmiBand": "",
  "imd": 5.8,
  "rural": null,
  "pop": 33,
  "age65": 16.9,
  "eth": 15.0,
  "lsoas": 20,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   17.1,
   17.3,
   10.0,
   11.0,
   11.3,
   11.5,
   9.8,
   13.2,
   10.8,
   8.7,
   7.1,
   2.6
  ]
 },
 {
  "code": "RQX",
  "name": "Homerton Healthcare NHS Foundation Trust",
  "region": "London",
  "icb": "London",
  "subtype": "Acute - Teaching",
  "beds": 321,
  "scale": 321,
  "budget": 29.4,
  "pain": 19.7,
  "digital": 32.5,
  "buyer": null,
  "target": 26.1,
  "rawOpp": 26.1,
  "pursuitRank": 97,
  "band": "D",
  "distress": false,
  "trend": "Improving",
  "topPain": [
   "Cancer FDS",
   "RTT 52-week",
   "A&E 4-hour"
  ],
  "trigger": "Cancer FDS under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Cancer FDS under pressure.",
  "drivers": {
   "uec": 17,
   "rtt": 21,
   "diag": 10,
   "cancer": 25,
   "dq": null
  },
  "finance": {
   "surplus": -4.6,
   "income": 506,
   "margin": -2.57,
   "capital": 87.7,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 58,
  "dmaRaw": 2.89,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -2.6,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 89,
  "dqWeak": [],
  "shmi": 0.779,
  "shmiBand": "3.0",
  "imd": 3.5,
  "rural": null,
  "pop": 521,
  "age65": 7.5,
  "eth": 48.4,
  "lsoas": 291,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   14.7,
   13.4,
   14.0,
   13.5,
   12.6,
   12.1,
   11.5,
   12.2,
   12.2,
   11.2,
   10.5,
   10.6
  ]
 },
 {
  "code": "RLT",
  "name": "George Eliot Hospital NHS Trust",
  "region": "Midlands",
  "icb": "Midlands",
  "subtype": "Acute - Small",
  "beds": 427,
  "scale": 427,
  "budget": 12.9,
  "pain": 28.8,
  "digital": 25.3,
  "buyer": null,
  "target": 22.4,
  "rawOpp": 22.4,
  "pursuitRank": 98,
  "band": "D",
  "distress": false,
  "trend": "Volatile",
  "topPain": [
   "Diagnostics 6-wk",
   "RTT 18-week",
   "A&E 12-hour"
  ],
  "trigger": "Diagnostics 6-wk under pressure",
  "play": "Cancer / diagnostics pathway",
  "why": "Diagnostics 6-wk under pressure.",
  "drivers": {
   "uec": 19,
   "rtt": 30,
   "diag": 58,
   "cancer": 23,
   "dq": null
  },
  "finance": {
   "surplus": -4.1,
   "income": 281,
   "margin": -3.59,
   "capital": 25.8,
   "cash": null,
   "agency": null
  },
  "procurement": [],
  "dma": 51,
  "dmaRaw": 2.54,
  "dmaChg": null,
  "epr": "\u2014",
  "fdp": "Live",
  "fdpBenefits": false,
  "q3Var": -0.0,
  "q3ForecastDeficit": false,
  "q3Dsf": true,
  "nhp": "\u2014",
  "eric": null,
  "capAlloc": null,
  "dspt": "\u2014",
  "cqc": "Good",
  "cqcWellLed": "Good",
  "cqcBelowGood": false,
  "cqcAge": null,
  "miss": null,
  "segment": 3,
  "dqmi": 90,
  "dqWeak": [],
  "shmi": 1.071,
  "shmiBand": "2.0",
  "imd": 6.3,
  "rural": null,
  "pop": 18,
  "age65": 11.5,
  "eth": 16.5,
  "lsoas": 11,
  "board": "\u2014",
  "route": "\u2014",
  "crm": "\u2014",
  "conf": {
   "lvl": "High",
   "why": "6/6 features present; buyer-openness deferred (no procurement source in MVP)"
  },
  "spark": [
   23.3,
   22.5,
   18.2,
   20.4,
   20.6,
   18.0,
   19.7,
   20.5,
   21.7,
   18.9,
   13.9,
   8.6
  ]
 }
];

const TRUSTS = TRUSTS_RAW.map((t) => {
  const e = { ...t, bandValue: t.band };
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
  { pillar: "Budget likelihood", items: [["TAC annual accounts", "public"], ["Capital allocations", "public"], ["ERIC estates", "public"], ["NOF deficit flag", "public"], ["In-year finance (Q3)", "public"]] },
  { pillar: "Operational pain", items: [["Acute Provider Table", "public"], ["A&E", "public"], ["RTT", "public"], ["Cancer", "public"], ["Diagnostics (DM01)", "public"], ["DQMI", "public"], ["Beds (KH03) / cancelled ops", "deferred"]] },
  { pillar: "Digital / capital", items: [["DMA results", "public"], ["FDP uptake", "public"], ["Capital allocations", "public"], ["NHP / RAAC bridge", "planned"], ["EPR status", "planned"]] },
  { pillar: "Buyer openness (NOT in V0 score)", items: [["Find a Tender", "planned"], ["Contracts Finder", "planned"], ["Board-paper signals", "planned"], ["Route to market", "planned"], ["CRM contacts", "planned"]] },
  { pillar: "Population (context only)", items: [["Census 2021 population", "public"], ["Catchment bridge (NSPL)", "curated"], ["Ethnicity (Census)", "public"], ["IMD 2025 deprivation", "public"], ["Rurality (RUC)", "deferred"]] },
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
  const fin = t.finance || {};
  const f = (x) => (x === null || x === undefined ? "\u2014" : x);
  const rows = [
    { k: "Pain", v: t.pain, w: "41%", c: C.bright,
      info: "Pain " + t.pain + " = mean of 7 peer-ranked pain metrics (each a percentile within the 134 acute trusts, 0\u2013100). Worst driver: " + f(t.topPain) + "." },
    { k: "Budget", v: t.budget, w: "35%", c: C.purple,
      info: "Budget " + t.budget + " = mean of two peer percentiles \u2014 operating income (\u00a3" + f(fin.income) + "m) and operating margin (" + f(fin.margin) + "%)." },
    { k: "Digital", v: t.digital, w: "24%", c: C.mid,
      info: "Digital " + t.digital + " = mean of three peer percentiles \u2014 digital-maturity gap (DMA " + f(t.dmaRaw) + "/5), productivity gap and capital envelope (\u00a3" + f(fin.capital) + "m)." },
    { k: "Buyer", v: t.buyer, w: "\u2014", c: "#9B6FD0",
      info: "Buyer openness is NOT in the V0 score \u2014 no procurement source is loaded yet (planned fourth pillar for V1)." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {rows.map((r) => (
        <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 64, fontSize: 11, color: C.muted, display: "flex", alignItems: "center" }}>{r.k}<InfoDot info={r.info} /></span>
          <span style={{ width: 30, fontSize: 11, color: C.muted, opacity: .7 }}>{r.w}</span>
          <div style={{ flex: 1, height: h, background: C.line, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${r.v || 0}%`, height: "100%", background: r.c, borderRadius: 999 }} />
          </div>
          <span style={{ width: 26, fontSize: 11, fontWeight: 600, color: C.ink, textAlign: "right" }}>{r.v === null || r.v === undefined ? "\u2014" : r.v}</span>
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
function Overview({ data, onPick, bandFilter, setBandFilter }) {
  const kpis = [
    { label: "Trusts in scope", value: data.length, sub: "acute · England", info: "All 134 acute trusts in England — the scored universe." },
    { label: "A-band priority", value: data.filter((d) => d.bandValue === "A").length, sub: "click to filter \u2192", colour: C.bandA, band: "A", info: "Trusts in the top commercial band. Click to filter the report to them." },
    { label: "Avg target score", value: (data.reduce((a, d) => a + d.target, 0) / data.length).toFixed(1), sub: "weighted index", info: "Mean target score. Pillars are percentile ranks within peers, so this centres near ~48 by design — compare the ranking, not the absolute value." },
    { label: "Worsening trend", value: data.filter((d) => d.trend === "Worsening").length, sub: "pain accelerating", colour: C.bad, info: "Real signal from the Acute Provider Table: trusts whose composite operational-pain index has risen over recent months (a positive slope)." },
    { label: "Active procurement", value: "\u2014", sub: "not loaded · planned (V1)", colour: C.muted, gap: true, info: "DATA GAP \u2014 this is not a real zero. No procurement / CRM feed is loaded yet, so buyer openness (the planned V1 pillar) cannot be counted. See the Procurement page." },
  ];
  const scatter = data.map((d) => ({ ...d, x: d.budget, y: d.pain, z: (d.scale || 600) }));
  const topCodes = new Set([...data].filter((d) => !d.distress).sort((a, b) => b.target - a.target).slice(0, 5).map((d) => d.code));

  return (
    <div>
      <PageHead
        kicker="Page 1 · Market prioritisation"
        title="Target Overview"
        blurb="Where does pain meet buyability? Top-right is the sweet spot — a clear problem to solve and a credible route to fund it. Bubble size is operating income; colour is commercial band."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 18 }}>
        {kpis.map((k) => {
          const sel = k.band && bandFilter === k.band;
          return (
            <div key={k.label} onClick={() => k.band && setBandFilter(sel ? null : k.band)}
              style={{ ...card(), cursor: k.band ? "pointer" : "default", outline: sel ? `2px solid ${C.purple}` : "none", outlineOffset: -1 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, display: "flex", alignItems: "center" }}>{k.label}{k.info && <InfoDot info={k.info} />}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: k.colour || C.ink, fontFamily: "Poppins", lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: k.gap ? C.warn : C.muted, marginTop: 6, fontWeight: k.gap ? 600 : 400 }}>{k.sub}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)", gap: 16 }}>
        <div style={{ ...card(), minWidth: 0 }}>
          <SectionTitle>Budget likelihood × Operational pain</SectionTitle>
          <div style={{ height: 500, position: "relative", minWidth: 0 }}>
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
                      fillOpacity={!bandFilter || d.bandValue === bandFilter ? 1 : 0.12}
                      stroke={d.distress ? C.bad : "#fff"} strokeWidth={d.distress ? 2.5 : 1} />
                  ))}
                  <LabelList dataKey="code" content={(p) => {
                    const d = scatter[p.index]; if (!d || !topCodes.has(d.code)) return null;
                    const short = d.name.replace(/ NHS Foundation Trust| NHS Trust/i, "").replace(/^University Hospitals of |^University Hospitals |^The /i, "").trim();
                    return <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={C.ink}>{short}</text>;
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
            Only the five top-ranked targets are labelled to keep the view clear — hover any bubble for its name and score. Bubble size = operating income; colour = commercial band; red ring = severe-distress flag.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card()}>
            <SectionTitle info="Click a band to filter the scatter, the shortlist and the rest of the report. Click it again (or the chip in the top bar) to clear.">Band distribution</SectionTitle>
            {["A", "B", "C", "D"].map((b) => {
              const n = data.filter((d) => d.bandValue === b).length;
              const sel = bandFilter === b;
              return (
                <div key={b} onClick={() => setBandFilter(sel ? null : b)}
                  style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderRadius: 8, padding: "4px 5px", margin: "0 -5px 5px", background: sel ? C.bg : "transparent", opacity: bandFilter && !sel ? 0.45 : 1 }}>
                  <Pill b={b} small />
                  <div style={{ flex: 1, height: 9, background: C.line, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${(n / data.length) * 100}%`, height: "100%", background: BAND_META[b].colour, borderRadius: 999 }} />
                  </div>
                  <span style={{ width: 18, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{n}</span>
                </div>
              );
            })}
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4 }}>Click a band to filter the report.</div>
          </div>
          <div style={card()}>
            <SectionTitle>{bandFilter ? "Band " + bandFilter + " trusts" : "Where to start"}</SectionTitle>
            {data.filter((d) => d.bandValue === (bandFilter || "A")).sort((a, b) => b.target - a.target).slice(0, 12).map((d) => (
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
      <div style={{ fontSize: 11, color: C.muted }}>Budget {d.budget} · Pain {d.pain} · {d.scale ? d.scale + ' beds' : '—'}</div>
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
            <span>{t.scale ? t.scale.toLocaleString() + ' beds' : '—'} · scale proxy</span>
            <span>{t.beds} beds</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: T.colour }}><T.Icon size={14} />{t.trend} ({T.note})</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .4, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>Target score<InfoDot info={"0.41\u00d7" + t.pain + " (pain) + 0.35\u00d7" + t.budget + " (budget) + 0.24\u00d7" + t.digital + " (digital) = " + t.rawOpp + (t.distress ? "  \u2212 8 distress penalty = " + t.target : "") + ". Each pillar is ranked within the 134 acute peers."} /></div>
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
          <SectionTitle info="The three live scoring pillars (0–100, ranked within the 134 acute peers). The V0 target blends them 0.41 pain / 0.35 budget / 0.24 digital; buyer openness is not yet loaded.">Component scores</SectionTitle>
          <Bars t={t} h={9} />
          <div style={{ marginTop: 10, fontSize: 11, color: C.muted, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
            V0 target = 0.41·Pain + 0.35·Budget + 0.24·Digital{t.distress ? " − distress penalty" : ""} · buyer openness not yet loaded
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
          <SectionTitle info="External signals that create urgency or a board-level mandate to act — used as context and conversation openers, not as part of the score.">Regulatory & triggers</SectionTitle>
          <Fact label="CQC overall" value={t.cqc || "—"} tone={t.cqc === "Inadequate" ? "bad" : t.cqc === "Requires improvement" ? "warn" : t.cqc === "Outstanding" || t.cqc === "Good" ? "good" : "neutral"} />
          <Fact label="CQC well-led" value={t.cqcWellLed || "—"} tone={t.cqcWellLed === "Inadequate" ? "bad" : t.cqcWellLed === "Requires improvement" ? "warn" : t.cqcWellLed === "Outstanding" || t.cqcWellLed === "Good" ? "good" : "neutral"} />
          <Fact label="SHMI (mortality)" value={t.shmi != null ? `${t.shmi}${t.shmiBand ? " · band " + t.shmiBand.replace(".0", "") : ""}` : "—"} tone={t.shmi == null ? "neutral" : t.shmi > 1.1 ? "bad" : t.shmi > 1.0 ? "warn" : "good"} />
          <Fact label="Data quality (DQMI)" value={t.dqmi != null ? `${t.dqmi} / 100` : "—"} tone={t.dqmi == null ? "neutral" : t.dqmi < 60 ? "bad" : t.dqmi < 80 ? "warn" : "good"} />
          <Fact label="NOF segment" value={t.segment != null ? `Segment ${t.segment}` : "—"} tone={t.distress ? "bad" : "neutral"} icon={<Zap size={13} />} />
          <Fact label="Trend" value={`${t.trend} (12-mo)`} tone={t.trend === "Worsening" ? "bad" : t.trend === "Improving" ? "good" : "neutral"} />
          <Src detail="SHMI trust-level (NHS England Digital, rolling 12-mo) · DQMI (monthly) · NOF segmentation">CQC ratings · SHMI · DQMI · NOF segment · operational trend</Src>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* finance */}
        <div style={card()}>
          <SectionTitle><Wallet size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Finance & buying signals</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Metric label="Surplus / deficit" value={t.finance.margin == null ? "—" : `${t.finance.margin > 0 ? "+" : ""}${t.finance.margin.toFixed(1)}%`} tone={t.finance.surplus < -5 ? "bad" : t.finance.surplus < 0 ? "warn" : "good"} />
            <Metric label="Operating income" value={t.finance.income != null ? "£" + t.finance.income.toLocaleString() + "m" : "—"} sub="TAC 2024/25 · scale" />
            <Metric label="Digital maturity (DMA)" value={t.dmaRaw != null ? t.dmaRaw + " / 5" : "—"} sub="lower = more opportunity" />
            <Metric label="NOF segment" value={t.segment != null ? "Segment " + t.segment : "—"} sub={t.distress ? "intensive support" : "oversight tier"} tone={t.distress ? "bad" : "neutral"} />
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
            <SrcDot k="public" />TAC annual accounts. In-year (Q3 2025/26): {t.q3Var != null ? <b style={{ color: t.q3Var < -1 ? C.bad : t.q3Var < 0 ? C.warn : C.good }}>{t.q3Var > 0 ? "+" : ""}{t.q3Var}% var</b> : <span style={{ color: C.muted }}>—</span>}{t.q3ForecastDeficit ? " · forecast deficit" : ""}{t.q3Dsf ? " · DSF" : ""}
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

// ---- glossary: definition (d), why it matters commercially (w), source (s), category (cat) ----
const GLOSSARY = {
  "Operational pain": { cat: "Score & pillars", d: "Composite of A&E, cancer, RTT and diagnostics performance, each ranked against the 134 acute peers.", w: "A trust with high pain has a clear, board-level problem to solve — the natural opening for a sales conversation.", s: "NHS England Acute Provider Table" },
  "Budget likelihood": { cat: "Score & pillars", d: "Operating income (scale) plus actual operating margin (financial health), ranked against peers.", w: "Shows whether a trust can actually fund a solution. A problem without budget is not a near-term opportunity.", s: "TAC annual accounts" },
  "Digital / capital": { cat: "Score & pillars", d: "Digital-maturity gap + productivity gap + capital-investment envelope.", w: "Signals both a need for digital/data help and a funded reason to act now.", s: "DMA + capital allocations" },
  "Target score": { cat: "Score & pillars", d: "Weighted blend of the three live pillars (0.41 pain / 0.35 budget / 0.24 digital), with a distress adjustment.", w: "The overall commercial-attractiveness ranking. Trust the ranking more than the band letters until calibrated.", s: "Derived" },
  "Commercial band": { cat: "Score & pillars", d: "A–D tier from the target score (A = priority target).", w: "A quick tier for triage. Thresholds are uncalibrated, so use the ranking as the primary guide.", s: "Derived" },
  "Pursuit rank": { cat: "Sales mechanics", d: "Sales-priority order: non-distressed trusts first, then segment-4 'qualify funding' trusts below.", w: "The order in which to work the list — keeps distressed trusts from cluttering the top.", s: "Derived" },
  "Confidence": { cat: "Sales mechanics", d: "Completeness of the active scored data sources for this trust (pain, TAC, capital, DMA, segment).", w: "A high score built on thin data warrants a manual check before committing BD effort.", s: "Derived" },
  "Operating income": { cat: "Finance", d: "Total operating income from the trust's annual accounts.", w: "A proxy for trust scale and the potential size of a deal.", s: "TAC annual accounts" },
  "Surplus / deficit": { cat: "Finance", d: "Operating surplus or deficit as a percentage of income (actual, not planned).", w: "Financial health: a healthy margin means freedom to fund discretionary projects; a deficit makes spend harder to approve.", s: "TAC annual accounts" },
  "In-year finance (Q3)": { cat: "Finance", d: "Year-to-date variance vs plan (% of turnover), plus forecast-deficit and deficit-support-funding flags.", w: "Catches current-year financial deterioration that backward-looking annual accounts miss.", s: "NHS England Q3 financial performance" },
  "Capital envelope": { cat: "Finance", d: "Provider operational capital allocation 2026–30.", w: "A funded capacity to undertake transformation — a stronger 'why now' than low digital maturity alone.", s: "NHS England capital allocations" },
  "Digital maturity (DMA)": { cat: "Digital", d: "Digital Maturity Assessment overall score (1–5).", w: "Low maturity means a larger digital/data opportunity — but on its own it is a weak 'why now'; pair it with a trigger.", s: "NHS England Digital DMA" },
  "FDP (Federated Data Platform)": { cat: "Digital", d: "Whether the trust is live on NHS England's Federated Data Platform, and whether it is realising benefits.", w: "An active data-platform programme to attach to — a transformation trigger, not a measure of overall maturity.", s: "NHS England FDP" },
  "CQC overall": { cat: "Quality & regulation", d: "Care Quality Commission overall rating (Outstanding → Inadequate).", w: "A 'Requires improvement' or 'Inadequate' rating creates board-level urgency and a mandate to invest in improvement — a genuine opening (used as context, not a stick).", s: "Care Quality Commission" },
  "CQC well-led": { cat: "Quality & regulation", d: "CQC rating of leadership and governance.", w: "Weak well-led ratings often trigger governance, data and assurance work — directly relevant to BI and analytics propositions.", s: "Care Quality Commission" },
  "SHMI (mortality)": { cat: "Quality & regulation", d: "Summary Hospital-level Mortality Indicator: ratio of observed to expected deaths (≈1.0 is as-expected; band 1 is higher-than-expected).", w: "A high SHMI draws regulatory and clinical scrutiny, often prompting data, coding and pathway work.", s: "NHS England Digital SHMI" },
  "Data quality (DQMI)": { cat: "Quality & regulation", d: "Data Quality Maturity Index: completeness and validity of a trust's central data submissions (0–100).", w: "Low DQMI is a direct signal for data-validation, submissions and reporting work — a core Intuita proposition.", s: "NHS England Digital DQMI" },
  "NOF segment": { cat: "Quality & regulation", d: "NHS Oversight Framework segment 1–4; segment 4 = intensive support (most distressed).", w: "Segment 4 means mandated intervention and constrained spend — qualify the funding route before investing BD effort.", s: "NHS Oversight Framework" },
  "Trend": { cat: "Quality & regulation", d: "Direction of the operational-pain index over the last 12 months.", w: "Improving = 'help us sustain this'; worsening = 'help us fix this' — it shapes the pitch.", s: "Acute Provider Table (monthly)" },
  "Catchment population": { cat: "Geography", d: "Modelled nearest-site catchment population (postcode directory + Census 2021).", w: "The scale of the population served — context for demand and deal size. A geographic proxy, not patient-flow.", s: "ONS NSPL + Census 2021" },
  "IMD deprivation decile": { cat: "Geography", d: "Population-weighted Index of Multiple Deprivation 2025 decile across the catchment (1 = most deprived).", w: "Deprivation drives demand complexity and health-inequality priorities — a strong narrative variable for access propositions.", s: "MHCLG IMD 2025" },
};

const InfoDot = ({ info }) => {
  const [show, setShow] = useState(false);
  if (!info) return null;
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 5, verticalAlign: "middle" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={12} style={{ color: C.muted, cursor: "help", flexShrink: 0 }} />
      {show && (
        <span style={{ position: "absolute", bottom: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)",
          width: 240, background: C.ink, color: "#fff", fontSize: 11, fontWeight: 400, lineHeight: 1.5,
          padding: "9px 11px", borderRadius: 9, boxShadow: "0 6px 18px rgba(0,0,0,0.28)", zIndex: 80, textAlign: "left", whiteSpace: "normal" }}>
          {info}
        </span>
      )}
    </span>
  );
};

const Fact = ({ label, value, tone = "neutral", icon }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
    <span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 5 }}>{icon}{label}{GLOSSARY[label] && <InfoDot info={GLOSSARY[label].w} />}</span>
    <span style={{ fontSize: 12.5, fontWeight: 600, color: tone === "bad" ? C.bad : tone === "warn" ? C.warn : tone === "good" ? C.good : C.ink, textAlign: "right", maxWidth: 150 }}>{value}</span>
  </div>
);
const Metric = ({ label, value, sub, tone = "neutral" }) => (
  <div>
    <div style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center" }}>{label}{GLOSSARY[label] && <InfoDot info={GLOSSARY[label].w} />}</div>
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
  const families = [["uec", "UEC 4-hr"], ["rtt", "RTT 18-wk"], ["diag", "Diagnostics"], ["cancer", "Cancer 62-day"]];
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
    { label: "Combined op. income", value: `£${(data.reduce((a, d) => a + ((d.finance && d.finance.income) || 0), 0) / 1000).toFixed(1)}bn`, sub: "TAC operating income (2024/25)" },
    { label: "In deficit", value: data.filter((d) => d.finance.surplus < 0).length, sub: "running a deficit", colour: C.warn },
    { label: "Improving trend", value: data.filter((d) => d.trend === "Improving").length, sub: "pain easing (12-mo)", colour: C.good },
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
              {[["name", "Trust"], ["income", "Op. income (£m)"], ["margin", "Op. margin"], ["capital", "Capital 26-30 (£m)"], ["route", "Funding route"], ["budget", "Budget score"]].map(([k, l]) => (
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
                  <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>{d.finance.income != null ? d.finance.income.toLocaleString() : "—"}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600, color: d.finance.margin == null ? C.muted : d.finance.margin < -1 ? C.bad : d.finance.margin < 0 ? C.warn : C.good }}>{d.finance.margin == null ? "—" : d.finance.margin.toFixed(1) + "%"}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right" }}>{d.finance.capital != null ? d.finance.capital.toLocaleString() : "—"}</td>
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

const BarCell = ({ v, c }) => (v == null || Number.isNaN(Number(v))) ? <span style={{ fontSize: 11, color: C.muted }}>—</span> : (
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
    if (d.fdp === "Live") out.push([d.fdpBenefits ? "FDP · benefits" : "FDP live", "good"]);
    if (d.finance && d.finance.capital >= 150) out.push(["Capital envelope", "brand"]);
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
<span style={{ fontSize: 12, color: C.muted }}>—</span>
                </td>
                <td style={{ padding: "11px 14px" }}><Chip label={d.epr} tone={eprTone(d.epr)} /></td>
                <td style={{ padding: "11px 14px" }}><Chip label={d.fdp === "—" ? "None" : d.fdpBenefits ? "Live · benefits" : "Live"} tone={d.fdp === "Live" ? "good" : "off"} /></td>
                <td style={{ padding: "11px 14px", fontSize: 12 }}>
                  {d.finance && d.finance.capital != null ? <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>£{d.finance.capital.toLocaleString()}m</span> : <NotYet label="—" />}
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
  const sorted = [...data].sort((a, b) => (a.dqmi ?? 101) - (b.dqmi ?? 101)); // worst DQMI first = best DQ proposition
  const dqOpp = (d) => (d.dqmi != null && d.dqmi < 60) || (d.dqWeak && d.dqWeak.length > 0);
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
                <td style={{ padding: "11px 14px", minWidth: 130 }}><BarCell v={d.dqmi} c={d.dqmi < 60 ? C.bad : d.dqmi < 80 ? C.warn : C.good} /></td>
                <td style={{ padding: "11px 14px", maxWidth: 210 }}>
                  {d.dqWeak.length ? (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {d.dqWeak.map((w) => <Chip key={w} label={w} tone="warn" />)}
                    </div>
                  ) : <span style={{ color: C.good, fontSize: 12, fontWeight: 600 }}>None flagged</span>}
                </td>
                <td style={{ padding: "11px 14px" }}>{d.dspt && d.dspt !== "—" ? <Chip label={d.dspt} tone={dsptTone(d.dspt)} /> : <NotYet label="Not in v1" />}</td>
                <td style={{ padding: "11px 14px" }}>{d.cqc && d.cqc !== "—" ? <span style={{ fontSize: 12, fontWeight: 600, color: d.cqc.includes("Inadequate") ? C.bad : d.cqc.includes("Requires") ? C.warn : C.good }}>{d.cqc}</span> : <NotYet label="—" />}</td>
                <td style={{ padding: "11px 14px", fontSize: 12 }}>
{d.cqcAge != null ? <span style={{ color: d.cqcAge > 12 ? C.warn : C.muted }}>{d.cqcAge} mo{d.cqcAge > 12 ? " · stale" : ""}</span> : <NotYet label="Not in v1" />}
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
      <PageHead kicker="Page 8 · Buyer openness · NOT LOADED" title="Procurement & Sales Intent — Planned"
        blurb="This pillar answers whether there is a route in, via tender notices, board-paper signals, framework presence and CRM relationships. It is the planned fourth pillar of the V1 score." />
      <div style={{ background: "#FFF4E5", border: "1px solid #F0C36D", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12.5, color: "#7A5B00", lineHeight: 1.5 }}>
        <b>Planned — not loaded.</b> No live procurement or CRM feed is connected, so buyer openness is <b>not part of the current V0 score</b>. The cards below are illustrative placeholders. Drop a <code>procurement_watchlist.csv</code> (Find a Tender / Contracts Finder / CRM enrichment) into the pipeline to activate this pillar.
      </div>
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
  const pts = data.filter((d) => d.pop != null && d.imd != null).map((d) => ({ ...d, x: d.pop, y: d.imd, z: (d.scale || 600) }));
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
          <SectionTitle info="Each bubble is a trust. X = modelled catchment population; Y = population-weighted IMD 2025 deprivation decile (1 = most deprived, plotted higher). Bubble size = beds.">Catchment population × deprivation</SectionTitle>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 20, bottom: 36, left: 8 }}>
                <CartesianGrid stroke={C.line} />
                <XAxis type="number" dataKey="x" name="Catchment" tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "Catchment population (000s) →", position: "bottom", offset: 14, fontSize: 12, fill: C.ink }} />
                <YAxis type="number" dataKey="y" domain={[1, 10]} reversed tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "← more deprived   (IMD 2025 decile)", angle: -90, position: "insideLeft", fontSize: 11, fill: C.ink }} />
                <ZAxis type="number" dataKey="z" range={[120, 800]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<GeoTip />} />
                <Scatter data={pts} onClick={(e) => e && onPick(e.code)} cursor="pointer">
                  {pts.map((d) => <Cell key={d.code} fill={REGION_COLOUR[d.region] || C.mid} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Bubble size = beds (scale). Modelled nearest-site catchment from NSPL + Census 2021; deprivation is the population-weighted IMD 2025 decile (1 = most deprived).</div>
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
            In production this page carries a true geographic map with drive-time catchment isochrones. Population, age and ethnicity here come from the modelled nearest-site catchment (NSPL + Census 2021); region grouping is shown for orientation.
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
            {[...data].sort((a, b) => (b.pop || 0) - (a.pop || 0)).map((d, i) => (
              <tr key={d.code} onClick={() => onPick(d.code)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer", background: i % 2 ? "#FCFBFE" : "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F0FA")} onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 ? "#FCFBFE" : "#fff")}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: C.ink }}>{d.name}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{d.icb}</td>
                <td style={{ padding: "10px 14px", fontSize: 12.5 }}>{d.pop != null ? d.pop + "k" : "—"}</td>
                <td style={{ padding: "10px 14px" }}>{d.imd != null ? <span style={{ fontSize: 12, fontWeight: 600, color: d.imd <= 3 ? C.bad : d.imd <= 5 ? C.warn : C.good }}>Decile {d.imd}</span> : <NotYet />}</td>
                <td style={{ padding: "10px 14px", fontSize: 12.5 }}>{d.age65 != null ? d.age65 + "%" : "—"}</td>
                <td style={{ padding: "10px 14px", fontSize: 12.5 }}>{d.eth != null ? d.eth + "%" : "—"}</td>
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
      <div style={{ fontSize: 11, color: C.muted }}>{d.region} · {d.pop != null ? d.pop + "k catchment" : "catchment n/a"}</div>
      <div style={{ fontSize: 11, color: C.muted }}>65+ {d.age65 != null ? d.age65 + "%" : "—"} · {d.eth != null ? d.eth + "% minority" : ""}{d.imd != null ? " · IMD decile " + d.imd : ""}</div>
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
        <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 700, letterSpacing: .5, color: C.purple, marginBottom: 6 }}>CURRENT V0 SCORE — LIVE</div>
          <div style={{ fontFamily: "Poppins", fontSize: 15, fontWeight: 600, color: C.ink, textAlign: "center", marginBottom: 10 }}>
            0.41 · Operational pain&nbsp; + &nbsp;0.35 · Budget likelihood&nbsp; + &nbsp;0.24 · Digital / capital&nbsp; − &nbsp;severe-distress penalty
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
            Buyer openness has no data source yet, so Model A 0.15 weight is re-normalised across the three live pillars (0.35/0.30/0.20 to 0.41/0.35/0.24). <b style={{ color: C.ink }}>Procurement / buyer openness is NOT part of the current score.</b>
          </div>
          <div style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 700, letterSpacing: .5, color: C.muted, marginBottom: 6 }}>TARGET V1 SCORE — WHEN BUYER OPENNESS IS LOADED</div>
          <div style={{ fontFamily: "Poppins", fontSize: 14, fontWeight: 600, color: C.muted, textAlign: "center" }}>
            0.35 · Pain&nbsp; + &nbsp;0.30 · Budget&nbsp; + &nbsp;0.20 · Digital / capital&nbsp; + &nbsp;0.15 · Buyer openness&nbsp; − &nbsp;distress
          </div>
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
const SectionTitle = ({ children, info }) => <div style={{ fontFamily: "Poppins", fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 14, display: "flex", alignItems: "center" }}>{children}{info && <InfoDot info={info} />}</div>;
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
const Glossary = () => {
  const cats = ["Score & pillars", "Finance", "Digital", "Quality & regulation", "Geography", "Sales mechanics"];
  const byCat = {};
  Object.entries(GLOSSARY).forEach(([term, e]) => { (byCat[e.cat] = byCat[e.cat] || []).push([term, e]); });
  return (
    <div>
      <PageHead kicker="Reference" title="Glossary"
        blurb="Every metric in the tool — what it is, why it matters commercially, and where it comes from. Hover the information icons anywhere in the app for the short version." />
      {cats.filter((c) => byCat[c]).map((c) => (
        <div key={c} style={{ ...card(), marginBottom: 16 }}>
          <SectionTitle>{c}</SectionTitle>
          {byCat[c].map(([term, e]) => (
            <div key={term} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, padding: "12px 0", borderTop: `1px solid ${C.line}` }}>
              <div>
                <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 13, color: C.ink }}>{term}</div>
                <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3 }}>{e.s}</div>
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>{e.d}</div>
                <div style={{ fontSize: 12, color: C.purple, lineHeight: 1.5, marginTop: 5 }}><b>Why it matters:</b> {e.w}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

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
  { id: "glossary", label: "Glossary", Icon: FileText },
  { id: "trust", label: "Trust 360", Icon: Building2, hidden: true },
];

export default function App() {
  const [page, setPage] = useState("overview");
  const [active, setActive] = useState(TRUSTS[0].code);
  const [bandFilter, setBandFilter] = useState(null);
  const filtered = useMemo(() => bandFilter ? TRUSTS.filter((t) => t.bandValue === bandFilter) : TRUSTS, [bandFilter]);
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
          Built on real public NHS &amp; ONS data. Not an official NHS performance rating — a commercial account-prioritisation tool.
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
            <FilterChip label={bandFilter ? ("Band " + bandFilter + "  \u2715") : "All bands"} active={!!bandFilter} onClick={() => bandFilter && setBandFilter(null)} /><FilterChip label="Q1 2026/27" />
          </div>
        </div>

        <div style={{ padding: "26px 28px 60px" }}>
          {page === "overview" && <Overview data={TRUSTS} onPick={goTrust} bandFilter={bandFilter} setBandFilter={setBandFilter} />}
          {page === "shortlist" && <Shortlist data={filtered} onPick={goTrust} />}
          {page === "finance" && <Finance data={filtered} onPick={goTrust} />}
          {page === "pain" && <OperationalPain data={filtered} onPick={goTrust} />}
          {page === "digital" && <DigitalCapital data={filtered} onPick={goTrust} />}
          {page === "dq" && <DataQuality data={filtered} onPick={goTrust} />}
          {page === "procurement" && <Procurement data={TRUSTS} onPick={goTrust} />}
          {page === "geography" && <Geography data={filtered} onPick={goTrust} />}
          {page === "method" && <Methodology />}
          {page === "glossary" && <Glossary />}
          {page === "trust" && <Trust360 t={trust} onBack={() => setPage("shortlist")} />}
        </div>
      </main>
    </div>
  );
}

const FilterChip = ({ label, active, onClick }) => (
  <span onClick={onClick} style={{
    fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 999, cursor: onClick ? "pointer" : "default",
    background: active ? C.purple : "#fff", color: active ? "#fff" : C.muted,
    border: `1px solid ${active ? C.purple : C.line}`,
  }}>{label}</span>
);
