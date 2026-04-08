# Thank You Page + PDF Delivery — Design Spec
**Date:** 2026-04-08  
**Status:** Approved

---

## Overview

After a customer completes a Stripe purchase for one of the three MD Market Insights ebooks, they are redirected to a branded thank you page that confirms their purchase, shows the full ebook as an embedded PDF preview, and offers a download button.

---

## Files Created / Modified

| File | Action | Purpose |
|---|---|---|
| `thank-you.html` | Create | Single thank you + delivery page |
| `scripts/generate-pdfs.mjs` | Create | Puppeteer script to render each HTML ebook to PDF |
| `ebook-trade-lifecycle.pdf` | Generated | $50 product PDF |
| `ebook-interview-playbook.pdf` | Generated | $75 product PDF |
| `ebook-systems-handbook.pdf` | Generated | $100 product PDF |
| `vercel.json` | Modify | Add `/thank-you` → `thank-you.html` rewrite |

---

## Product Map

| URL param | Title | Price | PDF file |
|---|---|---|---|
| `trade-lifecycle` | Trade Lifecycle Mastery Blueprint | $50 | `ebook-trade-lifecycle.pdf` |
| `interview-playbook` | Front Office Interview & Positioning Playbook | $75 | `ebook-interview-playbook.pdf` |
| `systems-handbook` | Institutional Capital Markets Systems & Architecture Handbook | $100 | `ebook-systems-handbook.pdf` |

---

## Page Layout

```
┌──────────────────────────────────────┐
│  NAV  [MDMI logo]                    │
├──────────────────────────────────────┤
│  ✓  Thank you, your purchase is      │
│     confirmed.                       │
│                                      │
│  "Trade Lifecycle Mastery Blueprint" │
│  $50 · One-time purchase             │
│                                      │
│  [  Download PDF  ]                  │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │   Full PDF Preview (iframe)    │  │
│  │   ~80vh tall, full-width       │  │
│  │   Scrollable — all pages       │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│  [  Download PDF  ]   (repeated)     │
├──────────────────────────────────────┤
│  FOOTER                              │
└──────────────────────────────────────┘
```

---

## Theme

- Matches `mdmi-ebooks.html` exactly: dark navy background, Inter + Plus Jakarta Sans fonts
- Same MDMI logo (filesafe CDN URL)
- Same nav structure and footer
- Success confirmation uses a checkmark badge styled to match the existing chip/badge pattern
- Download button: same `.btn-buy` blue gradient style from the ebooks page
- Mobile-first responsive

---

## JS Logic (`thank-you.html`)

- Reads `?product=` URL param on page load
- Looks up the product in a hardcoded map
- Injects: title, price, PDF `src` (iframe), PDF `href` (download link with `download` attribute)
- Fallback: if param is missing or unrecognized, show generic "Thank you for your purchase — check your email" message and link back to ebooks page

---

## PDF Generation (`scripts/generate-pdfs.mjs`)

- Uses Puppeteer (already installed)
- For each ebook HTML file, launches a headless browser, navigates to it via `file://` path, calls `page.pdf()` with A4 format, `printBackground: true`, zero margins
- Output files saved to project root
- Run once: `node scripts/generate-pdfs.mjs`
- PDFs are static committed assets — no server-side generation needed

---

## Stripe Configuration (manual — no code)

After deploying, update each Payment Link in the Stripe Dashboard:  
**Payment Links → [select link] → Edit → After payment tab → Custom success URL**

| Product | Success URL |
|---|---|
| $50 — Trade Lifecycle | `https://[domain]/thank-you?product=trade-lifecycle` |
| $75 — Interview Playbook | `https://[domain]/thank-you?product=interview-playbook` |
| $100 — Systems Handbook | `https://[domain]/thank-you?product=systems-handbook` |

Replace `[domain]` with the live domain (e.g., `mdmarketinsights.com`).

---

## What's Out of Scope

- Purchase verification (confirming the user actually paid) — ebooks are already public HTML; URL params provide the same level of access control
- Email delivery of PDFs
- Backend / server-side logic of any kind
