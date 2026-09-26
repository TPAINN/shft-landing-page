const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const output = path.join(process.env.TEMP, 'shft-audit');
const motionOnly = process.argv.includes('--motion-only');
fs.mkdirSync(output, { recursive: true });
const pause = (page, ms = 1000) => page.waitForTimeout(ms);
const source = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8');
const media = [...source.matchAll(/["'](\/media\/[^"']+\.(?:mp4|png|jpg|jpeg|webp|avif))["']/g)].map(match => match[1]);
const communityClips = media.filter(file => file.endsWith('-compact.mp4'));
assert.equal(communityClips.length, 20);
assert.equal(new Set(communityClips).size, 20, 'no repeated reel source');
for (const file of [...media, ...communityClips.map(file => file.replace('-compact.mp4', '.webp'))]) {
  assert.ok(fs.existsSync(path.join(__dirname, '../public', file)), `real media file: ${file}`);
}
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const visibilityBody = source.match(/const onVisibilityChange = \(\) => \{([\s\S]*?)\n    \};/)[1];
let pauses = 0, schedules = 0;
const checkVisibility = new Function('document', 'pauseAll', 'schedulePlayback', visibilityBody);
checkVisibility({ hidden: true }, () => pauses++, () => schedules++);
assert.equal(pauses, 1, 'hidden tab pauses synchronously without RAF');
assert.equal(schedules, 0);
checkVisibility({ hidden: false }, () => pauses++, () => schedules++);
assert.equal(schedules, 1);
async function scene(page, selector, progress = 0) {
  await page.evaluate(({ selector, progress }) => {
    const element = document.querySelector(selector);
    const extent = element.parentElement.classList.contains('pin-spacer') ? element.parentElement : element;
    const rect = extent.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + rect.top + progress * Math.max(0, rect.height - innerHeight));
  }, { selector, progress });
  await pause(page, 1500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const reference = await browser.newPage({ viewport: { width: 512, height: 512 } });
    await reference.setContent('<body style="margin:0;background:#08130e">' + fs.readFileSync('C:/Users/Administrator/Documents/GitHub/Shft/bryllim-assets/wrist-curl/frame-2.svg', 'utf8') + '</body>');
    await reference.screenshot({ path: path.join(output, 'wrist-reference.png') });
    await reference.close();
    for (const [name, width, height, touch] of [['desktop', 1440, 900, false], ['mobile', 375, 812, true], ['small', 320, 812, true], ['large-mobile', 414, 812, true], ['tablet', 768, 812, true]]) {
      if (motionOnly && name !== 'desktop' && name !== 'mobile') continue;
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
      await pause(page, 2500);
      assert.ok((await page.locator('.hero-motion video').evaluate(video => video.currentSrc)).endsWith(width <= 820 ? 'hero-motion-mobile-pingpong.mp4' : 'hero-motion-desktop-pingpong.mp4'), 'adaptive hero source');
      if (name === 'desktop' || name === 'mobile') {
        const hero = page.locator('.hero-motion video');
        const frameErrors = await hero.evaluate(async video => {
          video.pause();
          const canvas = document.createElement('canvas');
          canvas.width = 96; canvas.height = 171;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          const capture = async time => {
            await new Promise(resolve => { video.addEventListener('seeked', resolve, { once: true }); video.currentTime = time; });
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            return context.getImageData(0, 0, canvas.width, canvas.height).data;
          };
          const difference = (a, b) => a.reduce((sum, value, index) => sum + (index % 4 === 3 ? 0 : Math.abs(value - b[index])), 0) / (canvas.width * canvas.height * 3);
          const atOne = await capture(1 + .001);
          const atTwo = await capture(2 + .001);
          const backAtOne = await capture(video.duration - 1 + .001);
          const backAtTwo = await capture(video.duration - 2 + .001);
          const frameOne = await capture(1 / 30 + .001);
          const finalFrame = await capture(video.duration - 1 / 30 + .001);
          const beforeTurn = await capture(105 / 30 + .001);
          const afterTurn = await capture(107 / 30 + .001);
          video.currentTime = video.duration - .15;
          await video.play();
          return { mirrored: [difference(atOne, backAtOne), difference(atTwo, backAtTwo)], moving: difference(atOne, atTwo), endpoints: difference(frameOne, finalFrame), turn: difference(beforeTurn, afterTurn), duration: video.duration };
        });
        assert.ok(frameErrors.moving > .5, `${name} hero has visible motion`);
        frameErrors.mirrored.forEach(error => assert.ok(error < frameErrors.moving * .4, `${name} reverse retraces forward frames: ${JSON.stringify(frameErrors)}`));
        assert.ok(frameErrors.endpoints < 1.5 && frameErrors.turn < 1.5, `${name} ping-pong endpoints are continuous: ${JSON.stringify(frameErrors)}`);
        await pause(page, 600);
        assert.ok(await hero.evaluate(video => !video.paused && video.currentTime < 1 && video.playbackRate === 1 && video.loop), `${name} native playback wraps and continues normally`);
        console.log(JSON.stringify({ viewport: name, heroPingPong: frameErrors }));
      }
      assert.equal(await page.locator('.motion-toggle').count(), 0, 'manual motion toggle removed');
      assert.equal(await page.locator('#pricing .pricing-plan').count(), 2, 'two pricing tiers');
      assert.match(await page.locator('#pricing').textContent(), /\$0[\s\S]*\$2\.99[\s\S]*not available yet/);
      for (const [selector, progress] of [['.hero', 0], ['.manifesto', .7], ['.training-system', .5], ['.community-scene', .45], ['.pricing-section', .3], ['.final-cta', 0]]) {
        if (motionOnly) continue;
        await scene(page, selector, progress);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `${name} ${selector}: horizontal overflow`);
        if (name === 'desktop' || name === 'mobile') await page.screenshot({ path: path.join(output, `${name}-${selector.slice(1)}-final.png`) });
      }
      await scene(page, '.training-system', .5);
      const visibleChapter = () => page.locator('.chapter').evaluateAll(chapters => chapters.reduce((best, chapter, index) => +getComputedStyle(chapter).opacity > +getComputedStyle(chapters[best]).opacity ? index : best, 0));
      const chapterBefore = await visibleChapter();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await pause(page);
      assert.equal(await page.locator('video').evaluateAll(videos => videos.filter(v => !v.paused).length), 0, 'paused videos');
      assert.equal(await page.locator('.chapter-static-screen').count(), 6, 'all product screenshots in static mode');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await pause(page, 2000);
      assert.equal(await visibleChapter(), chapterBefore, 'same chapter after resume');
      const chapterAfterResume = await visibleChapter();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await pause(page);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await pause(page, 2000);
      assert.equal(await visibleChapter(), chapterBefore, 'same chapter after OS preference change');
      await scene(page, '.community-scene', .45);
      const before = await page.locator('.community-scene').evaluate(el => -el.getBoundingClientRect().top / (el.offsetHeight - innerHeight));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await pause(page);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await pause(page, 2000);
      const after = await page.locator('.community-scene').evaluate(el => -el.getBoundingClientRect().top / (el.offsetHeight - innerHeight));
      assert.ok(Math.abs(before - after) < .02, `community reading progress ${before} -> ${after}`);
      const playing = await page.locator('.community-streams video').evaluateAll(videos => videos.filter(v => !v.paused).length);
      assert.ok(playing > 0 && playing <= (touch ? 8 : 16), 'visible compact videos play within viewport decode budget');
      assert.ok(await page.locator('.community-streams video').evaluateAll(videos => videos.every(v => {
        const r = v.getBoundingClientRect();
        return v.paused || (r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth);
      })), 'offscreen videos never keep decoding');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await pause(page);
      assert.equal(await page.locator('.pin-spacer').count(), 0);
      assert.equal(await page.locator('video').evaluateAll(videos => videos.filter(v => !v.paused).length), 0);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await pause(page, 2000);
      assert.equal(await page.locator('.pin-spacer').count(), 1);
      const osProgress = await page.locator('.community-scene').evaluate(el => -el.getBoundingClientRect().top / (el.offsetHeight - innerHeight));
      assert.ok(Math.abs(before - osProgress) < .02, `community OS reading progress ${before} -> ${osProgress}`);
      assert.deepEqual(errors, [], 'runtime errors');
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await pause(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await pause(page);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await pause(page, 2000);
      assert.ok(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY < 5), 'footer stays at document end');
      console.log(JSON.stringify({ viewport: name, overflow: 0, chapterBefore, chapterAfterResume, osChapterRestore: 'pass', footerRestore: 'pass', hiddenTabPause: 'pass', communityPlayers: playing, restoredCommunityProgress: after, runtimeErrors: errors }));
      if (motionOnly) { await context.close(); continue; }
      for (const route of ['support', 'privacy', 'health-data', 'terms', 'cookies']) {
        const response = await page.goto(`http://127.0.0.1:5174/${route}/`);
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('.legal-shell').count(), 1, 'actual legal document, not SPA fallback');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
      }
      await page.goto('http://127.0.0.1:5174/privacy/');
      if (name === 'desktop' || name === 'mobile') await page.screenshot({ path: path.join(output, `${name}-privacy-final.png`) });
      console.log(`${name}: 5 legal routes HTTP 200, no overflow`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
