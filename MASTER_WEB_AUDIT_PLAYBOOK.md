# 🌐 MASTER PRODUCTION BENCHMARK & QUALITY REMEDIATION PLAYBOOK
> **Universal Blueprint for 100/100 Lighthouse, Mozilla Observatory A+, WCAG 2.1 AA Accessibility, and Zero Cumulative Layout Shift (CLS)**

---

## 📌 HOW TO USE THIS PLAYBOOK
1. Open this file in your project or repository.
2. Whenever you start or audit a web application, **copy everything inside the "MASTER AI PROMPT" section below** and paste it directly into your AI assistant (Antigravity, Claude, ChatGPT, Cursor, Copilot).
3. The AI assistant will automatically execute the end-to-end audit, apply the architectural fixes, run headless verification tests, and provide a verified scorecard.

---

```markdown
# ==============================================================================
# 🚀 MASTER AI PROMPT: PRODUCTION AUDIT, ZERO-CLS & BENCHMARK REMEDIATION
# ==============================================================================
# Instructions for AI Assistant:
# You are an elite Web Performance Engineer, Cyber Security Architect, and Accessibility Specialist.
# Perform an end-to-end, multi-domain audit and remediation for this web application.
# Your goal is to achieve 100% compliance across all major industry benchmarks without breaking functionality.

## 🎯 TARGET BENCHMARKS & OBJECTIVES

### 1. ⚡ Performance & Core Web Vitals (Google Lighthouse v10+)
- Overall Performance Score: Target 95–100.
- Cumulative Layout Shift (CLS): EXACTLY 0.00 (Zero visual jumps during load).
  * Root cause to fix: Dynamic containers (tabs, output cards, filter bars) starting with 0px height.
  * Solution: Pre-reserve sizing in CSS using `min-height` and pre-render initial structure.
- First Contentful Paint (FCP): < 1.5 seconds.
- Largest Contentful Paint (LCP): < 2.0 seconds.
- Total Blocking Time (TBT): < 50 ms (Eliminate unnecessary JavaScript runtime overhead).
- Fonts: Apply `<link rel="preconnect">` and `font-display: swap` to eliminate render-blocking font flashes.

### 2. ♿ Digital Accessibility (WCAG 2.1 / 2.2 AA Compliance)
- Target Accessibility Score: 100 / 100.
- Semantic Heading Hierarchy: Exactly one <h1> designated for the primary content title, followed by orderly <h2> and <h3> subheadings.
- Interactive Buttons: Every button (especially icon-only SVG buttons, close modals, search triggers) MUST have a descriptive `aria-label` or visible text.
- Form Controls: Every `<input>`, `<select>`, `<textarea>`, and `<input type="range">` MUST have an explicit `<label for="id">` and `aria-label` attribute.
- Color Contrast: Ensure minimum 4.5:1 text-to-background contrast ratio (upgrade muted text colors like `text-slate-500` to higher-contrast equivalents).

### 3. 🛡️ Cybersecurity & Privacy (Mozilla Observatory Grade A+)
- Target Mozilla Observatory Rating: Grade A+.
- HTTP Security Headers (Synchronize in `_headers` / `netlify.toml` / server config):
  * `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: SAMEORIGIN` (or secure `frame-ancestors`)
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()`
  * Strict Content Security Policy (CSP) restricting scripts to `'self'` and trusted CDN origins.
- Zero-Eval Execution: Zero usage of `eval()`, `new Function()`, or dynamic string execution.
- Data Privacy: Provide 1-click local storage erasure for compliance with global privacy standards (DPDP Act / GDPR).

### 4. 🔍 Technical SEO, Crawlability & AI Engine Optimization (AEO)
- Path-Based Canonical URLs: Clean directory routes (`/category/tool/index.html`) rather than hash fragments (`/#tool`) for standalone indexable pages.
- Pure Root-Relative References: All links, scripts, stylesheets, and assets must use root-relative paths (`/css/styles.css`, `/tools/name/`) to prevent broken links across trailing slash variations.
- Structured Data (Schema.org JSON-LD): Rich entity graphs declaring `WebApplication`, `BreadcrumbList`, and `FAQPage` with unambiguous question-and-answer pairs for search engines and AI answer engines.
- XML Sitemap & Robots.txt: Canonical XML sitemap indexing all active pages, declared within `robots.txt`.

### 5. 📱 Progressive Web App (PWA) & Intelligent Locale Auto-Detection
- Web App Manifest (`manifest.json`): Standalone display mode, scope, theme colors, and high-resolution physical PNG icons (`192x192` and `512x512` with `"purpose": "any maskable"`).
- Browser Language Auto-Detection: Automatically inspect `navigator.languages` and `navigator.language` to render the user's native language immediately on arrival.
- First-Session Language Welcome Prompt: If the user has not explicitly confirmed their language choice (`buildmetric_lang_confirmed !== 'true'`), display a welcome modal highlighting the auto-detected language with a 1-click confirmation button. Store preference in `localStorage` to never interrupt returning sessions.

---

## 🛠️ EXECUTION & REMEDIATION WORKFLOW

Step 1: AUDIT & ROOT CAUSE ANALYSIS
- Inspect the codebase for:
  1. Unsized dynamic containers causing layout shifts (CLS).
  2. Missing <h1> or empty buttons without aria-labels.
  3. Form inputs without associated labels or aria attributes.
  4. Missing or conflicting HTTP security headers.
  5. Hash-based routing issues or broken relative links (`../../`).

Step 2: TARGETED CODE REMEDIATION
- Apply precise fixes directly to files:
  * In CSS/HTML: Add `min-height` protective sizing on dynamic containers.
  * In JavaScript: Ensure reactive updates do not blow away structural layout bounds.
  * In UI templates: Add semantic `<h1>`, `aria-label` attributes, and `<label for="...">` associations.
  * In Server Config: Synchronize strict HTTP security headers.
  * In Manifest: Provide physical PNG icons and canonical shortcut paths.

Step 3: AUTOMATED LOCAL VERIFICATION
- Launch a local server and execute headless browser tests (e.g. via Chrome DevTools Protocol or Python script) to verify:
  * Zero layout shifts (`window.shifts` array is empty, CLS = 0.00).
  * Zero accessibility issues (no empty buttons, no unlabeled inputs).
  * Direct HTTP 200 OK across all routes and assets with zero console errors.

Step 4: REPORT RESULTS
- Output a comprehensive Before vs. After scorecard across all 5 categories.
# ==============================================================================
```

---

## 🧪 ATTACHED VERIFICATION TOOL: `run_site_audit.py`
Save the Python script below in your project directory and execute `python run_site_audit.py` to immediately test your site locally in Headless Chrome:

```python
import subprocess, time, json, urllib.request, sys, websocket

PORT = 8080
CDP_PORT = 9245
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def audit():
    print("=" * 75)
    print(f"  RUNNING HEADLESS CHROME BENCHMARK AUDIT ON HTTP://LOCALHOST:{PORT}/")
    print("=" * 75)

    proc = subprocess.Popen([
        CHROME_PATH, "--headless=new", f"--remote-debugging-port={CDP_PORT}",
        "--remote-allow-origins=*", "--disable-gpu", "--no-sandbox", "--disable-extensions"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)

    try:
        targets = json.loads(urllib.request.urlopen(f"http://localhost:{CDP_PORT}/json").read().decode("utf-8"))
        page_target = next(t for t in targets if t.get("type") == "page")
        ws = websocket.create_connection(page_target["webSocketDebuggerUrl"], timeout=10)

        msg_id = 1
        def cmd(m, p=None):
            nonlocal msg_id
            c = {"id": msg_id, "method": m}
            if p: c["params"] = p
            ws.send(json.dumps(c))
            msg_id += 1
            while True:
                r = json.loads(ws.recv())
                if r.get("id") == c["id"]: return r.get("result", {})

        cmd("Page.enable")
        cmd("Runtime.enable")

        # Layout shift listener
        shift_listener = """
        window.__shifts = [];
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) window.__shifts.push(entry.value);
            }
        }).observe({ type: 'layout-shift', buffered: true });
        """
        cmd("Page.addScriptToEvaluateOnNewDocument", {"source": shift_listener})
        cmd("Page.navigate", {"url": f"http://localhost:{PORT}/"})
        time.sleep(3.0)

        eval_script = """
        (() => {
            const h1s = document.querySelectorAll('h1');
            const shifts = window.__shifts || [];
            const totalCls = shifts.reduce((a, b) => a + b, 0);
            
            let missingButtonNames = 0;
            document.querySelectorAll('button').forEach(b => {
                const text = (b.innerText || b.getAttribute('aria-label') || b.getAttribute('title') || '').trim();
                if (!text) missingButtonNames++;
            });

            let missingInputLabels = 0;
            document.querySelectorAll('input, select, textarea').forEach(inp => {
                if (inp.type === 'hidden') return;
                const id = inp.id;
                const hasLabel = id && document.querySelector(`label[for="${id}"]`);
                const aria = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
                if (!hasLabel && !aria) missingInputLabels++;
            });

            return {
                title: document.title,
                h1Count: h1s.length,
                totalCls: Number(totalCls.toFixed(4)),
                missingButtonNames: missingButtonNames,
                missingInputLabels: missingInputLabels,
                docLang: document.documentElement.lang
            };
        })()
        """
        res = cmd("Runtime.evaluate", {"expression": eval_script, "returnByValue": True})
        val = res.get("result", {}).get("value", {})

        print(f"\n📊 AUDIT SCORECARD:")
        print(f"  • Cumulative Layout Shift (CLS) : {val.get('totalCls')} {'🟢 PERFECT (0.00)' if val.get('totalCls') == 0 else '🔴 HIGH SHIFT'}")
        print(f"  • Main Heading (<h1>) Count    : {val.get('h1Count')} {'🟢 PASS' if val.get('h1Count') >= 1 else '🔴 MISSING <h1>'}")
        print(f"  • Unnamed Buttons (a11y)       : {val.get('missingButtonNames')} {'🟢 ZERO VIOLATIONS' if val.get('missingButtonNames') == 0 else '🔴 NEEDS ARIA-LABELS'}")
        print(f"  • Unlabeled Form Inputs        : {val.get('missingInputLabels')} {'🟢 ZERO VIOLATIONS' if val.get('missingInputLabels') == 0 else '🔴 NEEDS LABELS'}")
        print(f"  • Active HTML Language Tag     : '{val.get('docLang')}'")
        print("=" * 75)

        ws.close()
    finally:
        proc.terminate()
        proc.kill()

if __name__ == "__main__":
    audit()
```

---

## ⚡ QUICK-FIX CHEAT SHEET (COMMON FAILURE PATTERNS)

| Issue in Lighthouse | Root Cause | 1-Line Fix |
|---|---|---|
| **High CLS (e.g. 0.975)** | Dynamic container loads with 0px height, pushing page down | Add `#my-container { min-height: 600px; contain-intrinsic-size: 600px; }` |
| **Accessibility < 80** | SVG icon buttons don't have text | Add `aria-label="Close modal"` or `aria-label="Search"` to the `<button>` |
| **Accessibility < 80** | `<input>` or slider lacks `<label>` | Add `id="num-1"` and `<label for="num-1">`, plus `aria-label="Width in feet"` |
| **Missing `<h1>`** | Logo or header title uses `<span>` or `<div>` | Wrap or designate the main active page heading as an `<h1>` |
| **Low Contrast Ratio** | Gray muted text (`#64748b`) on dark background | Upgrade text class from `text-slate-500` to `text-slate-400` or `text-slate-300` |
| **Observatory < A+** | Missing HSTS or weak CSP | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| **PWA Install Error** | Data URI SVG icons in manifest | Use physical PNG icons (`192x192` and `512x512` with `"purpose": "any maskable"`) |
