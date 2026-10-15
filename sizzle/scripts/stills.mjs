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
  ['01-intro', s(1.4)], ['02-wipe', s(2.3)], ['03-stack', s(3.4)], ['04-stack-end', s(5.4)],
  ['05-zoom-in', s(5.9)], ['06-picker-ripple', s(7.85)], ['07-question', s(9.6)], ['08-recording', s(12.0)],
  ['09-recording-face', s(14.3)], ['10-sure-ripple', s(16.85)], ['11-whip', s(19.25)], ['12-hero', s(20.4)],
  ['13-hero-notches', s(22.7)], ['14-faces', s(24.1)], ['15-faces-late', s(25.7)], ['16-split', s(27.4)],
  ['17-recap', s(30.2)], ['18-deck', s(34.8)], ['19-endcard', s(39.5)],
];
for (const [name, frame] of frames) {
  const f = Math.min(frame, composition.durationInFrames - 1);
  await renderStill({ composition, serveUrl, frame: f, output: path.join(out, `${name}.png`), browserExecutable, imageFormat: 'png' });
  console.log(`${name} (frame ${f})`);
}
console.log(`duration ${composition.durationInFrames} frames = ${(composition.durationInFrames / fps).toFixed(1)}s`);
