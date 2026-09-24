const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const media = path.join(__dirname, '..', 'public', 'media');
const size = name => fs.statSync(path.join(media, name)).size;
const sum = names => names.reduce((total, name) => total + size(name), 0);
const hasFastStart = name => {
  const bytes = fs.readFileSync(path.join(media, name));
  return bytes.indexOf('moov') < bytes.indexOf('mdat');
};

(async () => {
  const posters = Array.from({ length: 8 }, (_, index) => `community-flow-${String(index + 1).padStart(2, '0')}.webp`);
  const clips = Array.from({ length: 8 }, (_, index) => `community-flow-${String(index + 1).padStart(2, '0')}-compact.mp4`);
  assert.ok(sum(posters) < 300 * 1024, 'social posters stay below 300 KB total');
  assert.ok(sum(clips) < 2.5 * 1024 * 1024, 'social clips stay below 2.5 MB total');
  assert.ok(size('hero-motion-desktop-pingpong.mp4') < 2.2 * 1024 * 1024, 'desktop hero stays below 2.2 MB');
  assert.ok(size('hero-motion-mobile-pingpong.mp4') < 400 * 1024, 'mobile hero stays below 400 KB');
  [...clips, 'hero-motion-desktop-pingpong.mp4', 'hero-motion-mobile-pingpong.mp4'].forEach(name => assert.ok(hasFastStart(name), `${name} streams before full download`));

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5174/');
    await page.waitForTimeout(1500);
    const initialClips = await page.evaluate(() => performance.getEntriesByType('resource').filter(entry => /community-flow-\d+-compact\.mp4/.test(entry.name)).length);
    assert.equal(initialClips, 0, 'below-the-fold clips do not load initially');

    await page.locator('.social-section').evaluate(element => scrollTo(0, scrollY + element.getBoundingClientRect().top));
    await page.waitForTimeout(1500);
    const loadedClips = await page.evaluate(() => performance.getEntriesByType('resource').filter(entry => /community-flow-\d+-compact\.mp4/.test(entry.name)).length);
    assert.ok(loadedClips >= 1 && loadedClips <= 2, `only nearby clips load on demand: ${loadedClips}`);
    console.log(JSON.stringify({ posterKB: Math.round(sum(posters) / 1024), socialVideoKB: Math.round(sum(clips) / 1024), initialSocialClips: initialClips, clipsAfterScroll: loadedClips }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
