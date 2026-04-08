# Thank You Page + PDF Delivery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a branded post-purchase thank you page that shows a full PDF preview of the purchased ebook and provides a download button, with PDFs generated from existing HTML ebook files via Puppeteer.

**Architecture:** A single `thank-you.html` reads a `?product=` URL param to determine which ebook to show, embeds the PDF in a full-height `<iframe>`, and provides download buttons above and below. Three PDFs are generated once via a Puppeteer script and committed as static assets. Stripe payment links are pointed at this page with the appropriate param.

**Tech Stack:** Vanilla HTML/CSS/JS · Puppeteer 24 (already installed) · Static hosting on Vercel

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `scripts/generate-pdfs.mjs` | Create | Puppeteer script — renders each HTML ebook to A4 PDF |
| `ebook-trade-lifecycle.pdf` | Generated | $50 product PDF — static asset |
| `ebook-interview-playbook.pdf` | Generated | $75 product PDF — static asset |
| `ebook-systems-handbook.pdf` | Generated | $100 product PDF — static asset |
| `thank-you.html` | Create | Single thank you + PDF delivery page, MDMI theme |
| `vercel.json` | Modify | Add `/thank-you` → `thank-you.html` clean URL rewrite |

---

### Task 1: Create PDF generation script

**Files:**
- Create: `scripts/generate-pdfs.mjs`

- [ ] **Step 1: Write the script**

Create `scripts/generate-pdfs.mjs` with this exact content:

```js
import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const EBOOKS = [
  { html: 'ebook-trade-lifecycle.html',    pdf: 'ebook-trade-lifecycle.pdf'    },
  { html: 'ebook-interview-playbook.html', pdf: 'ebook-interview-playbook.pdf' },
  { html: 'ebook-systems-handbook.html',   pdf: 'ebook-systems-handbook.pdf'   },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const { html, pdf } of EBOOKS) {
  const htmlPath = `file://${join(ROOT, html)}`;
  const pdfPath  = join(ROOT, pdf);
  console.log(`Generating ${pdf}...`);
  const page = await browser.newPage();
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await page.close();
  const sizeMB = (statSync(pdfPath).size / 1024 / 1024).toFixed(1);
  console.log(`  ✓  ${pdf}  (${sizeMB} MB)`);
}

await browser.close();
console.log('\nAll PDFs generated.');
```

- [ ] **Step 2: Run the script and verify all three PDFs are created**

```bash
cd "/Users/eyuabuhay/Website building " && node scripts/generate-pdfs.mjs
```

Expected output (sizes will vary):
```
Generating ebook-trade-lifecycle.pdf...
  ✓  ebook-trade-lifecycle.pdf  (X.X MB)
Generating ebook-interview-playbook.pdf...
  ✓  ebook-interview-playbook.pdf  (X.X MB)
Generating ebook-systems-handbook.pdf...
  ✓  ebook-systems-handbook.pdf  (X.X MB)

All PDFs generated.
```

If any PDF fails, check: does the HTML file path exist? Run `ls ebook-*.html` to confirm.

- [ ] **Step 3: Verify each PDF has content (non-trivial file size)**

```bash
ls -lh "/Users/eyuabuhay/Website building "/ebook-*.pdf
```

Each PDF should be at least 200 KB. If a file is 0 bytes or under 10 KB, the generation failed — re-run the script.

- [ ] **Step 4: Commit**

```bash
cd "/Users/eyuabuhay/Website building " && git add scripts/generate-pdfs.mjs ebook-trade-lifecycle.pdf ebook-interview-playbook.pdf ebook-systems-handbook.pdf && git commit -m "feat: add PDF generation script and generated ebook PDFs"
```

---

### Task 2: Create thank-you.html

**Files:**
- Create: `thank-you.html`

- [ ] **Step 1: Create the file**

Create `thank-you.html` in the project root with this exact content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You | MD Market Insights</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:          #060A12;
      --panel:       rgba(255,255,255,0.04);
      --panel-hover: rgba(255,255,255,0.065);
      --blue:        hsl(210 85% 45%);
      --blue-dk:     hsl(210 90% 35%);
      --blue-lt:     hsl(210 80% 62%);
      --blue-glow:   rgba(14, 100, 196, 0.2);
      --text:        #E0E8F6;
      --muted:       #697A96;
      --dim:         #384560;
      --border:      rgba(255,255,255,0.07);
      --border-hi:   rgba(255,255,255,0.12);
      --r:           12px;
      --r-lg:        18px;
      --max:         1160px;
      --pad:         48px;
    }
    @media (max-width: 640px) { :root { --pad: 20px; } }

    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      font-weight: 400;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--dim); border-radius: 3px; }
    a { text-decoration: none; color: inherit; }
    img { max-width: 100%; }
    .wrap { width: 100%; max-width: var(--max); margin: 0 auto; padding: 0 var(--pad); }

    /* ── NAV ── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 16px var(--pad);
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(6,10,18,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      transition: background 0.3s;
    }
    nav.scrolled { background: rgba(6,10,18,0.97); }
    .nav-logo img { height: 28px; width: auto; }
    .nav-label {
      font-size: 11px; font-weight: 500; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--muted);
      position: absolute; left: 50%; transform: translateX(-50%);
    }
    .nav-link {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 500; color: var(--muted);
      transition: color 0.2s;
    }
    .nav-link:hover { color: var(--text); }

    /* ── CONFIRMATION HERO ── */
    .confirm {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 120px var(--pad) 80px;
      position: relative; overflow: hidden;
    }
    .confirm-grid {
      position: absolute; inset: -64px;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 75% 65% at 50% 50%, black 20%, transparent 100%);
      animation: gridScroll 22s linear infinite;
    }
    @keyframes gridScroll {
      from { transform: translateY(0); }
      to   { transform: translateY(60px); }
    }
    .confirm-orb {
      position: absolute; border-radius: 50%; pointer-events: none;
    }
    .confirm-orb-1 {
      width: 600px; height: 600px; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(14,100,196,0.10) 0%, transparent 70%);
    }
    .confirm-orb-2 {
      width: 320px; height: 320px; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(14,100,196,0.06) 0%, transparent 70%);
    }
    .confirm-inner {
      position: relative; z-index: 1;
      text-align: center; max-width: 640px;
    }
    .check-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 16px;
      border: 1px solid rgba(14,200,120,0.28);
      border-radius: 100px;
      background: rgba(14,200,120,0.07);
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.07em; text-transform: uppercase;
      color: hsl(155 65% 58%);
      margin-bottom: 32px;
    }
    .check-icon {
      width: 18px; height: 18px;
      background: hsl(155 60% 46%);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .confirm-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: clamp(28px, 4.5vw, 48px);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.12;
      margin-bottom: 14px;
    }
    .confirm-sub {
      font-size: 15px; color: var(--muted);
      margin-bottom: 6px;
    }
    .confirm-price {
      font-size: 13px; color: var(--dim);
      margin-bottom: 40px;
    }

    /* ── DOWNLOAD BUTTON ── */
    .btn-download {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 14px 32px;
      background: var(--blue);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 14px; font-weight: 600; letter-spacing: 0.02em;
      border-radius: var(--r);
      position: relative; overflow: hidden;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s;
    }
    .btn-download::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, transparent 55%);
      pointer-events: none;
    }
    .btn-download:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 32px -6px rgba(14,100,196,0.55);
    }
    .btn-download:active { transform: translateY(-1px); }

    /* ── PDF PREVIEW ── */
    .preview-section {
      padding: 0 var(--pad) 88px;
    }
    .preview-inner { max-width: var(--max); margin: 0 auto; }
    .preview-label {
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: var(--dim); text-align: center;
      margin-bottom: 20px;
    }
    .preview-frame {
      width: 100%; height: 82vh;
      border: 1px solid var(--border-hi);
      border-radius: var(--r-lg);
      overflow: hidden;
      background: var(--panel);
    }
    .preview-frame iframe {
      width: 100%; height: 100%; border: none; display: block;
    }
    .download-bottom {
      text-align: center; margin-top: 32px;
    }

    /* ── FOOTER ── */
    footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 32px var(--pad);
      border-top: 1px solid var(--border);
      gap: 16px;
    }
    footer img { height: 24px; width: auto; opacity: 0.6; }
    .footer-copy { font-size: 12px; color: var(--dim); }
    .footer-links { display: flex; gap: 24px; }
    .footer-links a { font-size: 13px; color: var(--muted); transition: color 0.2s; }
    .footer-links a:hover { color: var(--text); }

    @media (max-width: 640px) {
      .nav-label { display: none; }
      .preview-frame { height: 60vh; }
      footer { flex-direction: column; text-align: center; }
    }
  </style>
</head>
<body>

<!-- ── NAV ── -->
<nav id="nav">
  <a href="mdmi-ebooks.html" class="nav-logo">
    <img src="https://assets.cdn.filesafe.space/xCQugdhsWhyGDJYa7LiX/media/69af2fa04a2d885504e73aeb.png" alt="MD Market Insights">
  </a>
  <span class="nav-label">Purchase Confirmed</span>
  <a class="nav-link" href="mdmi-ebooks.html">
    All Guides
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </a>
</nav>

<!-- ── CONFIRMATION ── -->
<section class="confirm">
  <div class="confirm-grid"></div>
  <div class="confirm-orb confirm-orb-1"></div>
  <div class="confirm-orb confirm-orb-2"></div>
  <div class="confirm-inner">
    <div class="check-badge">
      <span class="check-icon">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      Purchase Confirmed
    </div>

    <!-- Product block (shown when param is valid) -->
    <div id="product-block">
      <h1 class="confirm-title" id="product-title">Your guide is ready.</h1>
      <p class="confirm-sub">Preview the full PDF below, then download your copy.</p>
      <p class="confirm-price" id="product-price"></p>
      <a class="btn-download" id="download-top" href="#" download>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Download PDF
      </a>
    </div>

    <!-- Fallback block (shown when param is missing or invalid) -->
    <div id="fallback-block" style="display:none;">
      <h1 class="confirm-title">Thank you for your purchase.</h1>
      <p class="confirm-sub" style="margin-bottom:36px;">Check your email for access details, or return to browse all guides.</p>
      <a class="btn-download" href="mdmi-ebooks.html">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Browse All Guides
      </a>
    </div>
  </div>
</section>

<!-- ── PDF PREVIEW ── -->
<section class="preview-section" id="preview-section">
  <div class="preview-inner">
    <p class="preview-label">Full Preview — Scroll through all pages</p>
    <div class="preview-frame">
      <iframe id="pdf-frame" src="" title="Ebook PDF Preview" loading="lazy"></iframe>
    </div>
    <div class="download-bottom">
      <a class="btn-download" id="download-bottom" href="#" download>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Download PDF
      </a>
    </div>
  </div>
</section>

<!-- ── FOOTER ── -->
<footer>
  <img src="https://assets.cdn.filesafe.space/xCQugdhsWhyGDJYa7LiX/media/69af2fa04a2d885504e73aeb.png" alt="MD Market Insights">
  <span class="footer-copy">© 2025 MD Market Insights. All rights reserved.</span>
  <div class="footer-links">
    <a href="https://course.mdmarketinsights.com" target="_blank" rel="noopener">Flagship Course</a>
    <a href="mdmi-ebooks.html">All Guides</a>
  </div>
</footer>

<script>
  const PRODUCTS = {
    'trade-lifecycle': {
      title: 'Trade Lifecycle Mastery Blueprint',
      price: '$50 · One-time purchase',
      pdf:   'ebook-trade-lifecycle.pdf',
    },
    'interview-playbook': {
      title: 'Front Office Interview & Positioning Playbook',
      price: '$75 · One-time purchase',
      pdf:   'ebook-interview-playbook.pdf',
    },
    'systems-handbook': {
      title: 'Institutional Capital Markets Systems & Architecture Handbook',
      price: '$100 · One-time purchase',
      pdf:   'ebook-systems-handbook.pdf',
    },
  };

  const param   = new URLSearchParams(window.location.search).get('product');
  const product = PRODUCTS[param];

  if (product) {
    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-price').textContent = product.price;
    document.getElementById('pdf-frame').src             = product.pdf;
    document.getElementById('download-top').href         = product.pdf;
    document.getElementById('download-top').setAttribute('download', product.pdf);
    document.getElementById('download-bottom').href      = product.pdf;
    document.getElementById('download-bottom').setAttribute('download', product.pdf);
  } else {
    document.getElementById('product-block').style.display   = 'none';
    document.getElementById('preview-section').style.display = 'none';
    document.getElementById('fallback-block').style.display  = 'block';
  }

  // Nav scroll style
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
</script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/eyuabuhay/Website building " && git add thank-you.html && git commit -m "feat: add thank-you page with PDF preview and download"
```

---

### Task 3: Update vercel.json

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Add the /thank-you rewrite**

Current `vercel.json`:
```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/toms",     "destination": "/toms-course.html" },
    { "source": "/client",   "destination": "/client.html" },
    { "source": "/admin",    "destination": "/admin.html" },
    { "source": "/skillsite","destination": "/skillsite.html" }
  ]
}
```

Replace with:
```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/toms",       "destination": "/toms-course.html" },
    { "source": "/client",     "destination": "/client.html" },
    { "source": "/admin",      "destination": "/admin.html" },
    { "source": "/skillsite",  "destination": "/skillsite.html" },
    { "source": "/thank-you",  "destination": "/thank-you.html" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/eyuabuhay/Website building " && git add vercel.json && git commit -m "feat: add /thank-you clean URL rewrite"
```

---

### Task 4: Visual verification

**Files:** none modified

- [ ] **Step 1: Check if server is running on port 3003, start if not**

```bash
lsof -ti:3003 && echo "already running" || (cd "/Users/eyuabuhay/Website building " && node scripts/serve-mdmi-ebooks.mjs &)
```

Wait 2 seconds for it to start.

- [ ] **Step 2: Screenshot the trade-lifecycle variant ($50)**

```bash
cd "/Users/eyuabuhay/Website building " && node scripts/screenshot.mjs "http://localhost:3003/thank-you.html?product=trade-lifecycle" thankyou-p1
```

Read the saved screenshot from `temporary screenshots/` and verify:
- Dark navy background (`#060A12`)
- MDMI logo in nav
- Green "Purchase Confirmed" badge visible
- Title reads "Trade Lifecycle Mastery Blueprint"
- Price reads "$50 · One-time purchase"
- Blue "Download PDF" button present
- PDF iframe loads below (may show browser PDF viewer or blank if PDF is loading)

- [ ] **Step 3: Screenshot the interview-playbook variant ($75)**

```bash
cd "/Users/eyuabuhay/Website building " && node scripts/screenshot.mjs "http://localhost:3003/thank-you.html?product=interview-playbook" thankyou-p2
```

Verify title is "Front Office Interview & Positioning Playbook" and price is "$75 · One-time purchase".

- [ ] **Step 4: Screenshot the fallback (no param)**

```bash
cd "/Users/eyuabuhay/Website building " && node scripts/screenshot.mjs "http://localhost:3003/thank-you.html" thankyou-fallback
```

Verify: fallback block is shown ("Thank you for your purchase"), no iframe/preview section visible, "Browse All Guides" button present.

- [ ] **Step 5: Fix any visual issues found, re-screenshot until clean**

Compare against the design spec layout. Common fixes:
- If grid background not visible: check `.confirm-grid` CSS `animation` property
- If iframe doesn't show PDF: browser may block `file://` PDF in iframe — this is fine in dev, works on Vercel with HTTPS
- If font looks wrong: confirm Google Fonts link is loading (requires network)

- [ ] **Step 6: Final commit if any fixes were made**

```bash
cd "/Users/eyuabuhay/Website building " && git add thank-you.html && git commit -m "fix: thank-you page visual adjustments"
```

---

## Stripe Configuration (manual — no code changes needed)

After deployment, update each Stripe Payment Link in the dashboard:

**Stripe Dashboard → Payment Links → [select link] → Edit → After payment → Custom success URL**

| Product | Success URL |
|---|---|
| $50 — Trade Lifecycle | `https://[your-domain]/thank-you?product=trade-lifecycle` |
| $75 — Interview Playbook | `https://[your-domain]/thank-you?product=interview-playbook` |
| $100 — Systems Handbook | `https://[your-domain]/thank-you?product=systems-handbook` |

Replace `[your-domain]` with the live domain (e.g. `mdmarketinsights.com`). The existing buy links in `mdmi-ebooks.html` do not need to change — Stripe handles the redirect internally.

---

## Self-Review Checklist

- [x] **Spec coverage:** PDF generation ✓ · thank-you.html with MDMI theme ✓ · iframe full PDF preview ✓ · download buttons (top + bottom) ✓ · URL param routing for 3 products ✓ · fallback for missing param ✓ · vercel.json rewrite ✓ · Stripe instructions ✓
- [x] **Placeholder scan:** No TBDs, all code blocks complete, all file paths exact
- [x] **Type consistency:** `product.pdf` used consistently for both iframe `src` and download `href` · `PRODUCTS` map keys match `?product=` param values used in Stripe URLs
