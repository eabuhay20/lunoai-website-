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
