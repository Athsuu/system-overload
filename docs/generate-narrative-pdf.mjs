import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdPath = path.join(__dirname, 'narrative.md');
const pdfPath = path.join(__dirname, 'Zero-Archive-Narrative-Bible.pdf');

const md = readFileSync(mdPath, 'utf8');

/** Strip the markdown H1 — rendered on the cover instead. */
const bodyMd = md.replace(/^# .+\n+/, '');

marked.setOptions({ gfm: true, breaks: false });

const bodyHtml = marked.parse(bodyMd);

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Zero Archive — Narrative Bible v0.7</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
    }

    * { box-sizing: border-box; }

    body {
      font-family: "Segoe UI", system-ui, sans-serif;
      font-size: 10.2pt;
      line-height: 1.55;
      color: #d4d4dc;
      background: #0a0a0f;
      margin: 0;
      padding: 0;
    }

    /* —— Cover —— */
    .cover {
      page-break-after: always;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 48px 32px;
      background:
        radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 77, 0, 0.08) 0%, transparent 55%),
        #0a0a0f;
      position: relative;
    }

    .cover::before {
      content: "";
      position: absolute;
      inset: 24px;
      border: 1px solid rgba(197, 160, 89, 0.25);
      pointer-events: none;
    }

    .cover-hex {
      font-size: 9pt;
      letter-spacing: 0.35em;
      color: rgba(197, 160, 89, 0.5);
      margin-bottom: 28px;
    }

    .cover h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 26pt;
      font-weight: 400;
      color: #c5a059;
      letter-spacing: 0.06em;
      margin: 0 0 8px;
      text-transform: uppercase;
    }

    .cover .edition {
      font-size: 11pt;
      color: #ff6b2b;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 40px;
    }

    .cover .tagline {
      max-width: 420px;
      font-size: 11pt;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.7;
      margin-bottom: 48px;
    }

    .cover-meta {
      font-size: 8.5pt;
      color: rgba(255, 255, 255, 0.35);
      letter-spacing: 0.08em;
      line-height: 2;
    }

    .cover-meta strong { color: rgba(197, 160, 89, 0.7); }

    /* —— Content —— */
    .content {
      padding: 0 4px;
    }

    .content > h2 {
      font-family: Georgia, serif;
      font-size: 15pt;
      font-weight: 400;
      color: #c5a059;
      letter-spacing: 0.04em;
      margin: 36px 0 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 107, 43, 0.35);
      page-break-after: avoid;
    }

    .content > h2:first-child { margin-top: 0; }

    .content h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #ff8c5a;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin: 22px 0 10px;
      page-break-after: avoid;
    }

    .content p {
      margin: 0 0 10px;
      color: #c8c8d0;
    }

    .content strong { color: #f0ebe0; }

    .content em { color: #a8d4f0; font-style: italic; }

    .content hr {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin: 24px 0;
    }

    .content blockquote {
      margin: 12px 0 16px;
      padding: 12px 16px;
      background: rgba(56, 189, 248, 0.06);
      border-left: 3px solid rgba(56, 189, 248, 0.45);
      color: rgba(168, 212, 240, 0.9);
      font-size: 9.5pt;
    }

    .content blockquote p { margin: 0; color: inherit; }

    .content ul, .content ol {
      margin: 8px 0 14px;
      padding-left: 22px;
      color: #c8c8d0;
    }

    .content li { margin-bottom: 5px; }

    .content li::marker { color: #ff6b2b; }

    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 18px;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    .content th {
      background: rgba(197, 160, 89, 0.12);
      color: #c5a059;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid rgba(197, 160, 89, 0.2);
      letter-spacing: 0.04em;
      font-size: 8.5pt;
      text-transform: uppercase;
    }

    .content td {
      padding: 7px 10px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      vertical-align: top;
      color: #b8b8c4;
    }

    .content tr:nth-child(even) td {
      background: rgba(255, 255, 255, 0.02);
    }

    .content code {
      font-family: "Cascadia Code", "Consolas", monospace;
      font-size: 8.5pt;
      background: rgba(255, 255, 255, 0.06);
      color: #ff8c5a;
      padding: 1px 5px;
      border-radius: 2px;
    }

  </style>
</head>
<body>

<section class="cover">
  <p class="cover-hex">⬡ ⬡ ⬡</p>
  <h1>Zero Archive</h1>
  <p class="edition">Narrative Bible · v0.6</p>
  <p class="tagline">
    Document de référence pour la direction créative.<br />
  Textes in-game en anglais · Ce document en français.
  </p>
  <p class="cover-meta">
    <strong>Kernel</strong> · <strong>TRACE</strong> · <strong>Breach</strong> · <strong>Quarantaine</strong><br />
    Méta progression v4 · Dark Hex Terminal<br />
    Généré depuis <code style="background:transparent;color:#c5a059;">docs/narrative.md</code>
  </p>
</section>

<main class="content">
${bodyHtml}
</main>

</body>
</html>`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
});
await browser.close();

console.log(`PDF created: ${pdfPath}`);
