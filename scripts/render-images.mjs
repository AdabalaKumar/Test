// Renders the site's still imagery from the live 3D models.
// Usage: start the app (npm run dev), then `npm run render:images [-- --base http://localhost:3000 --only palm-crest]`.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback; };
const base = arg('base', 'http://localhost:3000');
const only = arg('only', '');
const outDir = arg('out', path.join(process.cwd(), 'public', 'images'));
const [W, H] = arg('size', '1600x1000').split('x').map(Number);

const tower = (slug, h) => [
  [`${slug}-day`, { project: slug, pos: [h * 1.0 + 4, h * 0.42, h * 1.2 + 5], target: [0, h * 0.47, 0] }],
  [`${slug}-dusk`, { project: slug, night: 1, pos: [-(h * 0.9 + 4), h * 0.3, h * 1.25 + 5], target: [0, h * 0.48, 0] }],
  [`${slug}-aerial`, { project: slug, night: 1, pos: [h * 0.9 + 3, h * 1.55, h * 0.9 + 3], target: [0, h * 0.5, 0], fov: 38 }],
  [`${slug}-close`, { project: slug, pos: [6.5, h * 0.95, 7.5], target: [0, h * 0.8, 0], fov: 36 }],
];
const shots = [
  ...tower('aurelia-tower', 9.7), ...tower('marina-helix', 11.2), ...tower('sahara-terraces', 6.9),
  ['palm-crest-day', { project: 'palm-crest', pos: [9.5, 3.6, 12.5], target: [0, 1.5, 0.4] }],
  ['palm-crest-dusk', { project: 'palm-crest', night: 1, pos: [-8.5, 2.6, 12.5], target: [0, 1.6, 0.4] }],
  ['palm-crest-aerial', { project: 'palm-crest', night: 1, pos: [8, 12, 11], target: [0, 1, 0.6], fov: 36 }],
  ['palm-crest-close', { project: 'palm-crest', pos: [-5.5, 2.2, 8.5], target: [0.5, 1.7, 0], fov: 34 }],
  ...['one', 'two', 'three'].flatMap((layout) => [
    [`interior-${layout}-a`, { scene: 'interior', layout, pos: [5.2, 7.6, 7.6], target: [0, 0, 0.2] }],
    [`interior-${layout}-b`, { scene: 'interior', layout, night: 1, pos: [-4.4, 3.8, -6.2], target: [-0.6, 0.2, 0], fov: 36 }],
  ]),
  ['masterplan-dusk', { scene: 'masterplan', night: 1, pos: [15, 10, 18], target: [0, 0.6, 0] }],
  ['masterplan-day', { scene: 'masterplan', pos: [-14, 12, 17], target: [0, 0.6, 0] }],
].filter(([name]) => !only || name.includes(only));

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('page error:', e.message));
for (const [name, o] of shots) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) q.set(k, Array.isArray(v) ? v.map((n) => +n.toFixed(2)).join(',') : String(v));
  await page.goto(`${base}/render?${q}`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForSelector('[data-ready="true"]', { timeout: 180000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, `${name}.jpg`), type: 'jpeg', quality: 84, timeout: 180000 });
  console.log('rendered', name);
}
await browser.close();
