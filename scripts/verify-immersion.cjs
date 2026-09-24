const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output = path.join(process.env.TEMP, 'shft-immersion');
fs.mkdirSync(output, { recursive: true });
const wait = page => page.waitForTimeout(1900);

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height, touch] of [['desktop', 1440, 900, false], ['mobile', 375, 812, true]]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
      const page = await context.newPage();
      const errors = [], transitions = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.text().startsWith('SHFT_TRANSITION ')) transitions.push(JSON.parse(message.text().slice(16)));
      });
      await page.addInitScript(() => {
        window.addEventListener('pagereveal', event => {
          window.shftFirstReveal = { children: document.querySelector('#root')?.childElementCount, ready: document.querySelector('.site')?.classList.contains('is-ready') };
          if (!event.viewTransition) return;
          event.viewTransition.ready.then(() => console.log('SHFT_TRANSITION ' + JSON.stringify({
            path: location.pathname,
            animation: getComputedStyle(document.documentElement, '::view-transition-new(root)').animationName,
            oldDuration: getComputedStyle(document.documentElement, '::view-transition-old(root)').animationDuration,
            newDuration: getComputedStyle(document.documentElement, '::view-transition-new(root)').animationDuration,
            blend: getComputedStyle(document.documentElement, '::view-transition-new(root)').mixBlendMode,
          }))).catch(() => {});
        });
      });
      await page.goto('http://127.0.0.1:5174/');
      await page.waitForTimeout(4000);
      const moveTo = async progress => {
        await page.locator('.community-scene').evaluate((element, p) => window.scrollTo(0, scrollY + element.getBoundingClientRect().top + p * (element.offsetHeight - innerHeight)), progress);
        await wait(page);
        return page.locator('.community-scene').evaluate(element => ({
          depth: new DOMMatrix(getComputedStyle(element.querySelector('.community-depth')).transform).m42,
          particles: new DOMMatrix(getComputedStyle(element.querySelector('.community-particles')).transform).m42,
          rails: [...element.querySelectorAll('.community-stream-track')].map(track => {
            const bounds = track.getBoundingClientRect();
            return { y: new DOMMatrix(getComputedStyle(track).transform).m42, top: bounds.top, bottom: bounds.bottom };
          }),
        }));
      };
      const early = await moveTo(.05), late = await moveTo(.9), reversed = await moveTo(.3);
      assert.ok(late.depth < early.depth && late.particles < early.particles, 'background descends with scroll');
      assert.ok(reversed.depth > late.depth, 'background reverses on upward scroll');
      early.rails.forEach((rail, index) => {
        assert.ok(late.rails[index].y < rail.y - 50, 'every rail follows downward scrolling');
        assert.ok(reversed.rails[index].y > late.rails[index].y + 30, 'every rail reverses');
      });
      for (const progress of [0, .5, 1]) {
        const state = await moveTo(progress);
        state.rails.forEach(rail => { assert.ok(rail.top <= 20 && rail.bottom >= height - 20, 'rail covers viewport without blank ends'); });
      }
      await moveTo(.45);
      await page.screenshot({ path: path.join(output, `${name}-community.png`) });
      await moveTo(.98);
      const handoffLate = await page.locator('.community-handoff').evaluate(e => +getComputedStyle(e).opacity);
      await moveTo(.6);
      const handoffEarly = await page.locator('.community-handoff').evaluate(e => +getComputedStyle(e).opacity);
      assert.ok(handoffLate > .8 && handoffEarly < .05, 'community-to-pricing light handoff reverses');
      await page.locator('#pricing').evaluate(e => scrollTo(0, scrollY + e.getBoundingClientRect().top - innerHeight * .65));
      await wait(page);
      await page.screenshot({ path: path.join(output, `${name}-handoff.png`) });
      for (const progress of [.35, .73]) {
        await page.locator('.training-system').evaluate((e, p) => { const wrapper = e.parentElement; scrollTo(0, scrollY + wrapper.getBoundingClientRect().top + p * (wrapper.offsetHeight - innerHeight)); }, progress);
        await wait(page);
        const screens = await page.locator('.phone-screen').evaluateAll(es => es.map(e => ({ loaded: e.complete && e.naturalWidth > 0, scale: new DOMMatrix(getComputedStyle(e).transform).m11, alpha: +getComputedStyle(e).opacity, x: new DOMMatrix(getComputedStyle(e).transform).m41, width: e.offsetWidth })));
        assert.ok(screens.every(e => e.loaded), 'all phone snapshots decoded before push');
        assert.ok(screens.every(e => Math.abs(e.scale - 1) < .002), 'push keeps every screen at full size, no exposed underscale border');
        assert.ok(await page.locator('.chapter').evaluateAll(es => Math.max(...es.map(e => +getComputedStyle(e).opacity)) > .25), 'chapter copy never blanks during a screen push');
        const active = screens.filter(e => e.alpha > .5 && e.x < e.width && e.x + e.width > 0).sort((a, b) => a.x - b.x);
        assert.ok(active[0].x <= 1 && active.at(-1).x + active.at(-1).width >= active[0].width - 1, 'screens cover phone throughout push');
        assert.equal(await page.locator('.phone-screen').first().evaluate(e => getComputedStyle(e).transitionDuration), '0s', 'no CSS opacity transition trails scroll-linked GSAP');
        await page.screenshot({ path: path.join(output, `${name}-push-${progress}.png`) });
      }
      await page.locator('#pricing').evaluate(element => window.scrollTo(0, scrollY + element.getBoundingClientRect().top));
      await wait(page);
      assert.equal(await page.locator('#pricing .pricing-plan').count(), 2);
      assert.equal(await page.locator('.motion-toggle').count(), 0);
      assert.equal(await page.locator('.after-hours').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
      await page.screenshot({ path: path.join(output, `${name}-pricing.png`), fullPage: false });
      assert.ok(await page.evaluate(() => +getComputedStyle(document.querySelector('.community-particles')).zIndex < +getComputedStyle(document.querySelector('.community-streams')).zIndex), 'particles remain behind all carousel media');
      const accent = await page.evaluate(() => ['.hero-title .sage', '.community-reveal em', '.pricing-heading em', '.final-cta h2 em'].map(selector => getComputedStyle(document.querySelector(selector)).color));
      assert.ok(accent.every(color => color === accent[0]), `one accent across hero/community/pricing/final: ${accent}`);
      const question = page.locator('.pricing-note a');
      await question.scrollIntoViewIfNeeded();
      await wait(page);
      assert.ok(await question.evaluate(link => {
        const r = link.getBoundingClientRect();
        return r.height >= 48 && [[.1,.2],[.5,.5],[.9,.8]].every(([x,y]) => link.contains(document.elementFromPoint(r.left + r.width*x, r.top+r.height*y)));
      }), 'plan question has unobstructed generous click target');
      await question.click();
      await page.waitForURL('**/support/');
      await wait(page);
      await page.goBack();
      await wait(page);
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      await wait(page);
      await page.screenshot({ path: path.join(output, `${name}-footer.png`) });
      assert.equal(await page.locator('.ap-signature img').getAttribute('src'), '/media/ap-signature.png');
      assert.equal(await page.locator('.footer-top img').getAttribute('src'), '/media/tpainn-github-avatar.png');
      await page.locator('.footer-legal a[href="/support/"]').click();
      await page.waitForURL('**/support/');
      await wait(page);
      await page.locator('.legal-header a[href="/privacy/"]').click();
      await page.waitForURL('**/privacy/');
      await wait(page);
      await page.goBack();
      await wait(page);
      assert.ok(page.url().endsWith('/support/'));
      await page.locator('.legal-brand').click();
      await page.waitForURL('http://127.0.0.1:5174/');
      await page.waitForTimeout(2200);
      const reveal = await page.evaluate(() => window.shftFirstReveal);
      assert.ok(reveal.children > 0 && reveal.ready, 'first incoming frame contains committed app with loader already dismissed');
      console.log(JSON.stringify({ viewport: name, capturedTransitions: transitions }));
      assert.ok(transitions.length >= 4, 'native transitions run on links and history return');
      assert.ok(transitions.every(event => event.animation === 'shft-page-in'), 'authored animation active');
      assert.ok(transitions.every(event => event.oldDuration === '1.4s' && event.newDuration === '1.4s' && event.blend === 'normal'), 'opaque cinematic page push uses supplied timing on links and history');
      assert.equal(await page.locator('.hero-title .line').first().evaluate(e => getComputedStyle(e).clipPath), 'none', 'internal arrival does not replay an opening mask after page transition');
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ viewport: name, parallax: 'pass', reverse: 'pass', railCoverage: 'pass', pricing: 'pass', footerArtwork: 'unchanged', transitions, runtimeErrors: errors }));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
