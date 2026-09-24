const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const output = path.join(process.env.TEMP, 'shft-audit', 'sections');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      await page.goto('http://127.0.0.1:5174/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      for (const selector of ['.hero', '.statement', '.problem-section', '.feature-section', '.process-section', '.proof-section', '.social-section', '.pricing-section', '.faq-section', '.final-section', '.site-footer']) {
        const section = page.locator(selector);
        const top = await section.evaluate(element => scrollY + element.getBoundingClientRect().top);
        await page.evaluate(y => scrollTo(0, y), top);
        await page.waitForTimeout(850);
        await page.screenshot({ path: path.join(output, `${name}-${selector.slice(1)}.png`) });
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
})();
