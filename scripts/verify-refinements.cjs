const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 375]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 500, isMobile: width < 500 });
      await page.goto('http://127.0.0.1:5174/');
      await page.waitForTimeout(4000);
      await page.locator('#pricing').evaluate(e => scrollTo(0, scrollY + e.getBoundingClientRect().top));
      await page.waitForTimeout(1800);
      assert.match(await page.locator('#pricing').innerText(), /\$0[\s\S]*\$2\.99/);
      assert.equal(await page.locator('.community-particles i').count(), 56);
      for (const hash of ['#system', '#app', '#pricing', '#top']) {
        await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(1800);
        await page.locator(`.footer-nav a[href="${hash}"]`).click();
        await page.waitForTimeout(1600);
        const top = await page.locator(hash).evaluate(e => (e.parentElement.classList.contains('pin-spacer') ? e.parentElement : e).getBoundingClientRect().top);
        assert.ok(Math.abs(top) < 3, `${width} ${hash} lands exactly at section: ${top}`);
      }
      await page.locator('.hero-actions a').first().click();
      await page.waitForTimeout(200);
      await page.keyboard.press('Home');
      await page.waitForTimeout(1700);
      assert.ok(await page.evaluate(() => scrollY < 3), 'keyboard interrupts anchor glide');
      await page.locator('#pricing').evaluate(e => scrollTo(0, scrollY + e.getBoundingClientRect().top));
      await page.waitForTimeout(1800);
      assert.equal(await page.locator('.pricing-plan').first().evaluate(e => getComputedStyle(e).opacity), '1');
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(1800);
      assert.equal(await page.locator('.pricing-plan').first().evaluate(e => getComputedStyle(e).opacity), '0', 'text conceals after leaving section');
      await page.locator('#pricing').evaluate(e => scrollTo(0, scrollY + e.getBoundingClientRect().top));
      await page.waitForTimeout(1800);
      assert.equal(await page.locator('.pricing-plan').first().evaluate(e => getComputedStyle(e).opacity), '1', 'text replays on return');
      for (const sign of [-1, 1]) {
        await page.locator('#pricing').evaluate((e, sign) => scrollTo(0, scrollY + e.getBoundingClientRect().top + sign * 60), sign);
        await page.waitForTimeout(1800);
        await page.mouse.wheel(0, -sign * 24);
        await page.waitForTimeout(180);
        const movingTop = await page.locator('#pricing').evaluate(e => e.getBoundingClientRect().top);
        assert.ok(Math.abs(movingTop) < 20, `${width} magnet responds during input, without idle delay: ${movingTop}`);
        await page.waitForTimeout(700);
        const top = await page.locator('#pricing').evaluate(e => e.getBoundingClientRect().top);
        assert.ok(Math.abs(top) < 3, `${width} soft magnet reaches edge promptly: ${top}`);
        await page.mouse.wheel(0, -sign * 24);
        await page.waitForTimeout(700);
        const continuedTop = await page.locator('#pricing').evaluate(e => e.getBoundingClientRect().top);
        assert.ok(Math.abs(continuedTop) > 15, `${width} continued input escapes magnet: ${continuedTop}`);
      }
      await page.locator('.community-scene').evaluate(e => scrollTo(0, scrollY + e.getBoundingClientRect().top - innerHeight * .35));
      await page.waitForTimeout(900);
      assert.ok(Number(await page.locator('.community-reveal').evaluate(e => getComputedStyle(e).opacity)) > .9, `${width} heading is present before section reaches top`);
      for (const progress of [0, .5, .95]) {
        await page.locator('.community-scene').evaluate((e, progress) => scrollTo(0, scrollY + e.getBoundingClientRect().top + progress * (e.offsetHeight - innerHeight)), progress);
        await page.waitForTimeout(1800);
        const videos = await page.locator('.community-stream-tile').evaluateAll(tiles => tiles.map(tile => {
          const rect = tile.getBoundingClientRect();
          const visibleHeight = Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0);
          const visibleWidth = Math.min(rect.right, innerWidth) - Math.max(rect.left, 0);
          const player = tile.querySelector('video');
          return { visible: visibleHeight >= Math.min(32, rect.height * .08) && visibleWidth >= Math.min(24, rect.width * .08), paused: player.paused, ready: player.readyState, src: player.currentSrc };
        }));
        assert.ok(videos.filter(video => video.visible).length >= 4, `${width} multiple video rows visible`);
        videos.forEach(video => assert.equal(video.paused, !video.visible, `${width} playback matches visibility at ${progress}: ${video.src} ready=${video.ready}`));
      }
      console.log(`${width}: anchors, input interruption, repeat reveals, immediate escapable magnets, early heading and all visible videos PASS`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
