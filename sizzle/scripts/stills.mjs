// Renders key frames to out/stills/ for review before a full render.
//   npm run stills                 the default review set
//   npm run stills -- 120 455 900  specific frames
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'out', 'stills');
fs.mkdirSync(out, { recursive: true });
const browser = process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(browser) ? browser : undefined;

const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const composition = await selectComposition({ serveUrl, id: 'Sizzle', browserExecutable });
const fps = composition.fps;
const args = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const s = (sec) => Math.round(sec * fps);
// Times match the shot list in src/config.ts; update them if you retime shots.
const frames = args.length ? args.map((f) => [`f${f}`, f]) : [
  ['01-intro', s(1.5)], ['02-wipe', s(2.4)], ['03-picker', s(4.2)], ['04-question', s(6.0)],
  ['05-recording', s(8.6)], ['06-recording-approve', s(10.8)], ['07-captured', s(12.4)], ['08-sure', s(14.4)],
  ['09-hero', s(16.6)], ['10-hero-notches', s(19.2)], ['11-mishear', s(21.3)], ['12-miss-hint', s(23.6)],
  ['13-recap', s(28.0)], ['14-rematch', s(32.6)], ['15-endcard', s(37.5)],
];
for (const [name, frame] of frames) {
  const f = Math.min(frame, composition.durationInFrames - 1);
  await renderStill({ composition, serveUrl, frame: f, output: path.join(out, `${name}.png`), browserExecutable, imageFormat: 'png' });
  console.log(`${name} (frame ${f})`);
}
console.log(`duration ${composition.durationInFrames} frames = ${(composition.durationInFrames / fps).toFixed(1)}s`);
