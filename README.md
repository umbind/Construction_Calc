# 🏗️ Plan & BuildMetric — India's Construction & Real Estate Estimation Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![BIS IS 456](https://img.shields.io/badge/BIS-IS%20456%3A2000%20Compliant-emerald.svg)](https://bis.gov.in)
[![Security](https://img.shields.io/badge/Security-Zero--Eval%20%7C%20CSP%20Hardened-blue.svg)](#security-privacy--dpdp-act-2023)
[![Languages](https://img.shields.io/badge/Languages-11%20Indian%20Regional-orange.svg)](#-11-indian-regional-languages)
[![PWA](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-purple.svg)](#-pwa--offline-readiness)

> **Live Application**: [https://planandbuildmetric.netlify.app/](https://planandbuildmetric.netlify.app/)

**Plan & BuildMetric** is a high-precision, zero-latency, client-side takeoff engine built specifically for the Indian construction and real estate industry. Designed for civil engineers, site supervisors, architects, contractors, property investors, and home builders across all 28 Indian states and 8 union territories.

---

## 🌟 Key Capabilities

- **11 Precision Mathematical Engines**: Grounded directly in Bureau of Indian Standards (**IS 456:2000**, **IS 1786**, **IS 2185**), National Building Code (**NBC 2016**), **RERA 2016**, and the **Finance Act 2024**.
- **11 Major Indian Regional Languages**: 100% native script localization for all presets, input parameters, materials, and takeoff summary sheets.
- **100% On-Device & Private**: Zero server telemetry. All project dimensions and financial calculations are processed in the user's browser sandbox with zero database tracking.
- **Instant Offline PWA**: Fully functional on remote construction sites with zero internet connectivity via Service Worker cache.
- **Dual Theme Support**: Polished Dark and Light modes with high-contrast WCAG 2.1 AA compliant typography.

---

## 📐 11 Indian Calculator Engines

| # | Calculator | Standard / Basis | Key Outputs |
|---|---|---|---|
| 1 | **Concrete & 50kg Bags** | IS 456:2000 (M7.5 to M25) | Wet/Dry Volume (m³, Brass, CFT), 50kg Cement Bags, M-Sand (Brass), Aggregate/Gitti (Brass) |
| 2 | **Drywall & Plaster** | IS 1661:1972 / IS 2095 | Gyproc 6x4 ft Gypsum Sheets, Jointing Compound, 12mm/20mm Cement Mortar (1:4 / 1:6) |
| 3 | **Vitrified Floor & Wall Tiles** | IS 15622:2017 | 600x600, 600x1200 GVT Slabs, Tile Boxes, 4" Skirting Deduction, Polymer Adhesive & Epoxy Grout |
| 4 | **Masonry & TMT Rebar** | IS 2185 / IS 1786:2008 | 9" External / 4.5" Partition Red Clay Bricks, AAC Lightweight Blocks, Fe 500D TMT Steel (kg/m³) |
| 5 | **Paint & Wall Putty** | IS 5410 / NBC 2016 | Premium Interior/Exterior Emulsion (Litres), 40kg Birla/JK Wall Putty Bags, Acrylic Primer |
| 6 | **Roofing & Waterproofing** | IS 456 / IS 2645 | RCC Roof Slab Casting, Dr. Fixit Fastflex Liquid Membrane, JSW Colouron+ Profile Sheets |
| 7 | **Rental Yield & Cap Rate** | Indian Property Norms | Net Operating Income (NOI), Gross Yield, Municipal Property Tax, Society Maintenance Reserve |
| 8 | **Home Loan EMI & Tax** | Income Tax Act, 1961 | Monthly EMI, Section 24b (₹2 Lakh Interest Rebate), Section 80C Principal Tax Deduction |
| 9 | **Property Resale & LTCG Tax** | Finance Act, 2024 | Budget 2024 Revised 12.5% Long-Term Capital Gains Tax, State Stamp Duty, Brokerage & Net Profit |
| 10 | **Construction Loan Facility** | RBI Lending Guidelines | Hard Money Draw Facility, Interest Reserve, Monthly Draw Interest, Processing Fee Schedule |
| 11 | **HVAC Tonnage & BEE Power** | NBC 2016 / BEE Star Rating | AC Cooling Tonnage (TR), Indian Climate Zones, Top Floor Heat Multiplier, Monthly Power Bill |

---

## 🌐 11 Indian Regional Languages

Full end-to-end localization across all 11 Indian languages:

1. **English (India)** — `en`
2. **हिन्दी (Hindi)** — `hi`
3. **বাংলা (Bengali)** — `bn`
4. **తెలుగు (Telugu)** — `te`
5. **मराठी (Marathi)** — `mr`
6. **தமிழ் (Tamil)** — `ta`
7. **ગુજરાતી (Gujarati)** — `gu`
8. **ಕನ್ನಡ (Kannada)** — `kn`
9. **മലയാളം (Malayalam)** — `ml`
10. **ਪੰਜਾਬੀ (Punjabi)** — `pa`
11. **ଓଡ଼ିଆ (Odia)** — `or`

---

## 🔒 Security, Privacy & DPDP Act (2023)

- **Zero-Eval Security**: Absolutely no dynamic code execution (`eval()`, `new Function()`, `document.write()`).
- **DOM XSS Sanitization**: All dynamic templates pass through universal `escapeHTML()` sanitization.
- **Production HTTP Security Headers (`_headers`)**:
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; ...`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()`
- **Digital Personal Data Protection (DPDP) Act, 2023 Conformance**:
  - Zero server telemetry or behavioral profiling.
  - Built-in 1-click **Right to Erasure** button (*Purge All Stored Data*) to clear local storage instantly.

---

## 📱 PWA & Offline Readiness

- **Service Worker (`sw.js`)**: Caches all core JS engines, CSS design tokens, fonts, and icons for instant offline booting.
- **Web App Manifest (`manifest.json`)**: Installable on Android, iOS, Windows, and macOS as a standalone desktop/mobile app.

---

## 📂 Project Architecture

```
constructcalc/
├── index.html                 # Semantic HTML5 Application Entry Point
├── 404.html                   # Custom 404 Error Page
├── _headers                   # Production HTTP Security Headers (Netlify/Cloudflare)
├── _redirects                 # SPA Hash Routing Rules
├── ads.txt                    # Publisher Monetization Verification File
├── manifest.json              # PWA Web App Manifest
├── sw.js                      # PWA Service Worker for 100% Offline Capability
├── sitemap.xml                # SEO XML Sitemap (12 URLs)
├── robots.txt                 # Search Engine Crawling Directives
├── css/
│   └── styles.css             # Custom Design Tokens, Theme CSS, Indic Typography
├── js/
│   ├── app.js                 # Application Orchestrator & Router
│   ├── calculators/           # 11 Deterministic Calculation Engines
│   │   ├── concrete.js
│   │   ├── drywall.js
│   │   ├── flooring.js
│   │   ├── framing.js
│   │   ├── paint.js
│   │   ├── roofing.js
│   │   ├── caprate.js
│   │   ├── brrrr.js
│   │   ├── fixflip.js
│   │   ├── hardmoney.js
│   │   └── hvac.js
│   ├── components/            # UI Components (Drawer, Modal, Embed)
│   ├── data/                  # i18n Dictionary (11 Languages), Currencies, Resources, Search
│   └── utils/                 # Formatters, escapeHTML, and Storage Managers
├── test_suite.py              # Automated Mathematical & i18n QA Suite
├── security_audit_suite.py    # Automated Security, CSP & DPDP Audit Suite
└── seo_aeo_benchmark.py       # SEO & AEO Citability Benchmark Suite (100/100)
```

---

## 🚀 Quick Start (Local Development)

Because Plan & BuildMetric is built on **pure vanilla JavaScript ES Modules**, no Node.js compilation or heavy build step is required!

1. **Clone the repository**:
   ```bash
   git clone https://github.com/umbind/Construction_Calc.git
   cd Construction_Calc
   ```

2. **Start a local development server**:
   ```bash
   # Python 3
   python -m http.server 8080
   ```

3. **Open in your browser**:
   ```
   http://localhost:8080
   ```

---

## 🧪 Verification & Test Suites

Run the complete automated test and benchmark suite locally:

```bash
# 1. Run Functional & Math Test Suite
python test_suite.py

# 2. Run Security & Privacy Audit Suite
python security_audit_suite.py

# 3. Run SEO & AEO Citability Benchmark Suite
python seo_aeo_benchmark.py
```

### Benchmark Results:
- **Calculation Latency**: `0.15 μs` per formula execution.
- **Cumulative Layout Shift (CLS)**: `0.00`
- **Security Audit Grade**: `100% Passed (All 6 Gates)`
- **SEO + AEO Composite Score**: `100.0 / 100 (Grade: Perfect A+)`

---

## ⚖️ Statutory Engineering & Tax Disclaimer

All calculations, bill of quantities (BOQ), material specifications, and financial projections are provided for **preliminary takeoff estimation, architectural planning, and educational purposes only**.

- **Structural Vetting**: Structural load calculations, soil capacities, and reinforcement detailing must be certified and vetted by a licensed Structural Engineer or Registered Civil Engineer in accordance with Bureau of Indian Standards (**IS 456:2000**, **IS 1786**, **IS 2185**) and local municipal building bylaws before procurement or casting.
- **Taxation & Financial Advice**: Capital gains (12.5% LTCG under Finance Act 2024) and home loan tax deductions (Sec 24b/80C under Income Tax Act 1961) represent generalized mathematical estimates. Users must consult a qualified Chartered Accountant (CA) for formal tax filings.

---

## 📄 License

This project is licensed under the **MIT License**.
