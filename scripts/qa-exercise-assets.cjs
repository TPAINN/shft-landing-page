// Browser-rendered vector checks and review pages. Does not certify movement technique.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');

function argumentsFrom(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    if (!['--dest', '--playwright'].includes(flag) || !argv[index + 1]) {
      throw new Error('Usage: node scripts/qa-exercise-assets.cjs --dest VECTOR_FOLDER --playwright PLAYWRIGHT_MODULE');
    }
    values[flag.slice(2)] = argv[index + 1];
  }
  if (!values.dest || !values.playwright) throw new Error('--dest and --playwright are required');
  return values;
}

function containedFile(folder, relative) {
  const resolved = path.resolve(folder, relative);
  const difference = path.relative(folder, resolved);
  if (!difference || difference.startsWith('..') || path.isAbsolute(difference)) {
    throw new Error(`Manifest file escapes destination: ${relative}`);
  }
  return resolved;
}

async function main() {
  const args = argumentsFrom(process.argv.slice(2));
  const folder = fs.realpathSync(args.dest);
  const report = JSON.parse(fs.readFileSync(path.join(folder, 'qa-report.json'), 'utf8'));
  if (!Array.isArray(report.exercises) || !report.exercises.length ||
      report.exerciseCount !== report.exercises.length || report.svgCount !== report.exercises.length * 3) {
    throw new Error('Collection counts must describe three frames per nonempty exercise');
  }
  const { chromium } = require(path.resolve(args.playwright));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1 });
    const frames = [];
    const files = new Set();
    const slugs = new Set();
    for (const exercise of report.exercises) {
      if (!exercise.slug || slugs.has(exercise.slug) || exercise.frames?.length !== 3) {
        throw new Error(`Duplicate exercise or missing frames: ${exercise.slug}`);
      }
      slugs.add(exercise.slug);
      for (const [index, frame] of exercise.frames.entries()) {
        if (frame.frame !== index + 1 || frame.file !== `${exercise.slug}/frame-${index + 1}.svg` || files.has(frame.file)) {
          throw new Error(`Invalid or duplicate frame: ${frame.file}`);
        }
        files.add(frame.file);
        const bytes = fs.readFileSync(containedFile(folder, frame.file));
        const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
        const actual = await page.evaluate(xml => {
          const documentSVG = new DOMParser().parseFromString(xml, 'image/svg+xml');
          if (documentSVG.querySelector('parsererror')) throw new Error('Invalid SVG XML');
          const root = documentSVG.documentElement;
          if (root.localName !== 'svg' || root.namespaceURI !== 'http://www.w3.org/2000/svg') throw new Error('Not SVG');
          const allowedAttributes = {
            svg: ['xmlns', 'width', 'height', 'viewBox', 'role', 'aria-labelledby'],
            title: ['id'], desc: ['id'], path: ['d', 'fill', 'transform', 'fill-rule', 'clip-rule'],
          };
          for (const item of [root, ...root.querySelectorAll('*')]) {
            const allowed = allowedAttributes[item.localName];
            if (item.namespaceURI !== root.namespaceURI || !allowed ||
                [...item.attributes].some(attribute => !allowed.includes(attribute.name))) {
              throw new Error(`Unsupported SVG element or styling attribute: ${item.localName}`);
            }
          }
          document.body.replaceChildren(document.importNode(root, true));
          const svg = document.querySelector('svg');
          const box = svg.getBBox();
          const paths = [...svg.querySelectorAll('path')];
          return {
            width: svg.getAttribute('width'), height: svg.getAttribute('height'), viewBox: svg.getAttribute('viewBox'),
            pathCount: paths.length,
            unsupported: svg.querySelectorAll('image,rect,circle,ellipse,polygon,polyline,text,foreignObject,script,style,use').length,
            allPathsWhite: paths.every(item => item.getAttribute('fill') === '#ffffff' && getComputedStyle(item).fill === 'rgb(255, 255, 255)'),
            bounds: [box.x, box.y, box.x + box.width, box.y + box.height],
          };
        }, bytes.toString('utf8'));
        if (sha256 !== frame.sha256 || !actual.pathCount || actual.unsupported || !actual.allPathsWhite ||
            actual.width !== '512' || actual.height !== '512' || actual.viewBox !== '0 0 512 512' ||
            !actual.bounds.every(Number.isFinite) || actual.bounds[0] < 16 || actual.bounds[1] < 16 ||
            actual.bounds[2] > 496 || actual.bounds[3] > 496 ||
            actual.bounds[2] <= actual.bounds[0] || actual.bounds[3] <= actual.bounds[1]) {
          throw new Error(`SVG geometry, transparency, or hash QA failed: ${frame.file}`);
        }
        frames.push({ file: frame.file, sha256, ...actual });
      }
    }
    await page.goto(pathToFileURL(path.join(folder, 'preview.html')).href);
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth === 512));
    if (await page.locator('article').count() !== report.exerciseCount || await page.locator('img').count() !== frames.length) {
      throw new Error('Preview does not match collection counts');
    }
    await page.addStyleTag({ content: 'body{margin:16px}article{padding:8px 0}article div{gap:10px}img{width:230px;height:230px}h2{margin:5px 0;font-size:16px}small{font-size:11px}' });
    const contactSheets = [];
    for (let start = 0; start < report.exerciseCount; start += 8) {
      await page.evaluate(start => {
        const cards = [...document.querySelectorAll('article')];
        cards.forEach((card, index) => { card.style.display = index >= start && index < start + 8 ? '' : 'none'; });
        document.querySelector('h1').textContent = `Exercise drafts ${start + 1}–${Math.min(start + 8, cards.length)} · human movement review required`;
      }, start);
      const filename = `contact-sheet-${report.exerciseCount}-page-${Math.floor(start / 8) + 1}.png`;
      await page.screenshot({ path: path.join(folder, filename), fullPage: true });
      contactSheets.push(filename);
    }
    const result = {
      exerciseCount: report.exerciseCount, svgCount: frames.length, maxExercisesPerPage: 8,
      allActualVectorBoundsSafe: true, allHashesMatch: true, rasterEmbedded: false,
      qaStatus: 'illustration draft; human movement review required', anatomicalAccuracyCertified: false,
      contactSheets, frames,
    };
    fs.writeFileSync(path.join(folder, 'browser-qa.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ ...result, frames: undefined }));
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(`ASSET_QA_FAILED: ${error.message}`); process.exitCode = 1; });
