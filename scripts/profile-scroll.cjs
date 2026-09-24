const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const mode of ['normal', 'no-video', 'no-effects']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);
      const renderer = await page.evaluate(() => {
        const gl = document.createElement('canvas').getContext('webgl');
        const extension = gl?.getExtension('WEBGL_debug_renderer_info');
        return extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unavailable';
      });
      await page.evaluate(() => {
        const scene = document.querySelector('.community-scene');
        scrollTo(0, scrollY + scene.getBoundingClientRect().top + 700);
      });
      await page.waitForTimeout(2000);
      if (mode === 'no-video') await page.addStyleTag({ content: 'video{display:none!important}' });
      if (mode === 'no-effects') await page.addStyleTag({ content: '* ,*::before,*::after{filter:none!important;backdrop-filter:none!important;text-shadow:none!important;box-shadow:none!important;animation:none!important}' });
      const result = await page.evaluate(() => new Promise(resolve => {
        const gaps = [], tasks = [];
        const observer = new PerformanceObserver(list => tasks.push(...list.getEntries().map(e => e.duration)));
        observer.observe({ type: 'longtask', buffered: false });
        const start = performance.now(), y = scrollY;
        let last = start;
        function frame(now) {
          gaps.push(now - last); last = now;
          scrollTo(0, y + (now - start) * .28);
          if (now - start < 4000) requestAnimationFrame(frame);
          else {
            observer.disconnect(); gaps.sort((a,b) => a-b);
            resolve({ frames: gaps.length, avg: gaps.reduce((a,b)=>a+b,0)/gaps.length, p95: gaps[Math.floor(gaps.length*.95)], longTasks: tasks.length, longestTask: Math.max(0,...tasks), playing: [...document.querySelectorAll('video')].filter(v=>!v.paused).length });
          }
        }
        requestAnimationFrame(frame);
      }));
      console.log(JSON.stringify({ mode, renderer, ...result }));
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
