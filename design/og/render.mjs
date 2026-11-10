// Renders the share card (design/og/og.html) to public/media/og-shft-v2.jpg at 1200x630.
// Run from the landing repo root with the app repo's Playwright: node design/og/render.mjs
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(resolve('design/og/og.html')).href); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
await p.screenshot({ path: 'public/media/og-shft-v2.jpg', type: 'jpeg', quality: 90 });
await p.setViewportSize({ width: 1200, height: 630 }); await b.close(); console.log('rendered');
