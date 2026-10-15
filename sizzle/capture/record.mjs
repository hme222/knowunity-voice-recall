// Records the Say It Back prototype as four clips for the sizzle reel.
//
//   npm run record              builds the app fresh, then serves it with `next start`
//   SKIP_BUILD=1 npm run record reuses the last production build
//   BASE_URL=https://… npm run record   records a deployed copy instead (no local server)
//
// Output: public/clips/take-A.mp4 … take-D.mp4 and public/clips/clicks.json
// (every click's position in CSS px on the 390x844 screen + its time in the clip),
// which Remotion reads to aim push-ins at whatever the cursor taps.
//
// Frames come from Chrome's screencast at full device resolution (1170x2532,
// deviceScaleFactor 3), so close-ups at 2–3x zoom stay sharp. Playwright's own
// recordVideo is lower quality, so it isn't used.

import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SIZZLE = path.resolve(HERE, '..');
const APP = path.resolve(SIZZLE, '..');
const OUT = path.join(SIZZLE, 'public', 'clips');
const PORT = process.env.PORT || 3100;
const BASE = process.env.BASE_URL || `http://localhost:${PORT}`;
const CHROME = process.env.CHROME_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
// ffmpeg: FFMPEG if set, else the one Remotion ships (no system install needed), else PATH.
const FFMPEG = process.env.FFMPEG || (() => {
  const base = path.join(SIZZLE, 'node_modules', '@remotion');
  try {
    for (const d of fs.readdirSync(base)) {
      const f = path.join(base, d, 'ffmpeg');
      if (d.startsWith('compositor-') && fs.existsSync(f)) return f;
    }
  } catch {}
  return 'ffmpeg';
})();

// Recording-only copy swaps. Read from src/config.ts would need a TS loader, so the
// one value that matters is mirrored here; keep it in step with config.greetingName.
const GREETING_NAME = process.env.GREETING_NAME || 'Alex';

const VIEW = { width: 390, height: 844 };
// Capture scale (DSF env, default 3). 4 looked sharper but Chrome only kept up at ~17fps;
// 3 holds 30fps+, and real 3x frames are far sharper than the old 1x frames stretched.
const DSF = Number(process.env.DSF || 3);
const FPS = 30;

// ---------------------------------------------------------------------------
// Human pacing. Every glide, pause and hold is here so the feel can be tuned.
const GLIDE_MS = 750;      // cursor travel time between targets
const SETTLE_MS = 280;     // pause on the target before clicking
const AFTER_MS = 900;      // pause after a click before the next move starts
// The prototype has no speech recognition: hold time on the mic decides the verdict
// (src/lib/session.ts verdictFor: <2s couldn't hear, 2–5s miss, ≥5s pass).
const MISS_HOLD_MS = 3300;
const PASS_HOLD_MS = 5700;
// Question 2's first take is a scripted mishear whatever the hold; this keeps it short.

// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.BASE_URL) return null;
  // Always a fresh build unless asked otherwise. It used to build only when no build
  // existed, so once one did, every re-record filmed that old build — never the
  // prototype as it is now.
  if (!process.env.SKIP_BUILD || !fs.existsSync(path.join(APP, '.next', 'BUILD_ID'))) {
    console.log('Building the app fresh (`next build`)…');
    execFileSync('npx', ['next', 'build'], { cwd: APP, stdio: 'inherit' });
  }
  const proc = spawn('npx', ['next', 'start', '-p', String(PORT)], { cwd: APP, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE); if (r.ok) return proc; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  proc.kill();
  throw new Error(`Server never came up at ${BASE}`);
}

/** Records one clip. `script(rec)` drives the page; rec.click() logs every tap. */
async function take(page, name, script) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  let t0 = null;
  const clicks = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    frames.push({ ts: metadata.timestamp, data });
    try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch {}
  });
  await cdp.send('Page.startScreencast', {
    format: 'jpeg', quality: 92, maxWidth: VIEW.width * DSF, maxHeight: VIEW.height * DSF, everyNthFrame: 1,
  });
  // A tiny repaint every frame keeps the screencast ticking on static screens,
  // so holds are captured as real frames rather than one long duplicate.
  await page.evaluate(() => {
    let d = document.getElementById('__tick');
    if (!d) { d = document.createElement('div'); d.id = '__tick';
      Object.assign(d.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0.01', pointerEvents: 'none', zIndex: 2147483646 });
      document.documentElement.appendChild(d); }
    const loop = () => { d.style.background = d.style.background === 'red' ? 'blue' : 'red'; window.__tickRaf = requestAnimationFrame(loop); };
    loop();
  });
  const wallStart = Date.now();
  const rec = {
    wait: (ms) => page.waitForTimeout(ms),
    /** Glide to a button by its accessible name, pause, tap it, log it. */
    async click(name, { exact = false, label } = {}) {
      process.env.DEBUG && console.log('[dbg] click', String(name));
      const loc = page.getByRole('button', { name, exact }).first();
      await loc.waitFor({ state: 'visible', timeout: 15000 });
      const box = await loc.boundingBox();
      const x = Math.round(box.x + box.width / 2), y = Math.round(box.y + box.height / 2);
      await page.evaluate(([x, y, ms]) => window.__cursor.moveTo(x, y, ms), [x, y, GLIDE_MS]);
      await page.waitForTimeout(SETTLE_MS);
      const t = Date.now() - wallStart;
      await page.evaluate(() => window.__cursor.pulse());
      await page.mouse.click(x, y);
      // Drift the cursor off what it just tapped, so it never sits on the result.
      await page.evaluate(([x, y]) => setTimeout(() => window.__cursor.moveTo(x + 38, y + 46, 420), 140), [x, y]);
      clicks.push({ t: t / 1000, x, y, label: label || String(name) });
      await page.waitForTimeout(AFTER_MS);
    },
    async glide(x, y, ms = GLIDE_MS) {
      await page.evaluate(([x, y, ms]) => window.__cursor.moveTo(x, y, ms), [x, y, ms]);
    },
  };
  await script(rec);
  await cdp.send('Page.stopScreencast');
  await page.evaluate(() => cancelAnimationFrame(window.__tickRaf)).catch(() => {});
  const wallEnd = Date.now();
  if (!frames.length) throw new Error(`No frames captured for ${name}`);

  // Frames → constant 30fps H.264 via ffmpeg's concat demuxer with real durations.
  const dir = path.join(OUT, `.frames-${name}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  t0 = frames[0].ts;
  const totalSec = (wallEnd - wallStart) / 1000;
  let list = '';
  frames.forEach((f, i) => {
    const file = `f${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(dir, file), Buffer.from(f.data, 'base64'));
    const next = i + 1 < frames.length ? frames[i + 1].ts - t0 : totalSec;
    const dur = Math.max(1 / 120, next - (f.ts - t0));
    list += `file '${file}'\nduration ${dur.toFixed(4)}\n`;
  });
  list += `file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'\n`;
  fs.writeFileSync(path.join(dir, 'list.txt'), list);
  const mp4 = path.join(OUT, `take-${name}.mp4`);
  // Remotion's bundled ffmpeg loads its libraries from its own folder.
  const ffEnv = FFMPEG.includes('compositor-') ? { ...process.env, DYLD_LIBRARY_PATH: path.dirname(FFMPEG), LD_LIBRARY_PATH: path.dirname(FFMPEG) } : process.env;
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'),
    // Constant frame rate set on the output, not with the fps filter: Remotion's bundled
    // ffmpeg is a trimmed build without it.
    '-vf', `scale=${VIEW.width * DSF}:${VIEW.height * DSF}:flags=lanczos,format=yuv420p`, '-r', String(FPS), '-fps_mode', 'cfr',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-movflags', '+faststart', mp4], { env: ffEnv });
  fs.rmSync(dir, { recursive: true, force: true });
  // Screencast timestamps start a few ms after wallStart; shift clicks onto the clip's clock.
  const offset = (frames[0].ts * 1000 - wallStart) / 1000;
  const fixed = clicks.map((c) => ({ ...c, t: +(c.t - Math.max(0, offset)).toFixed(3) }));
  console.log(`take ${name}: ${frames.length} frames, ${totalSec.toFixed(1)}s, ${fixed.length} clicks → ${path.relative(SIZZLE, mp4)}`);
  return { file: `clips/take-${name}.mp4`, durationSec: +totalSec.toFixed(3), clicks: fixed };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  console.log('server up at', BASE);
  // Chrome's screencast sends 1x frames (390x844) whatever deviceScaleFactor says; the
  // old takes were 1x frames stretched to 3x, which is why close-ups looked soft. This
  // flag makes it render, and so send, real device pixels.
  const browser = await chromium.launch({ executablePath: CHROME, args: [`--force-device-scale-factor=${DSF}`] });
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DSF, colorScheme: 'dark' });
  await ctx.addInitScript({ content: `window.__SIZZLE__ = ${JSON.stringify({
    textSwaps: GREETING_NAME ? [['Harry', GREETING_NAME]] : [], cursorStart: [300, 760] })};` });
  await ctx.addInitScript({ path: path.join(HERE, 'cursor.js') });
  // Recording a dev server: hide Next's dev indicator, which is not part of the app.
  await ctx.addInitScript({ content: `addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = 'nextjs-portal{display:none!important}'; document.head.appendChild(s); });` });
  const page = await ctx.newPage();
  const go = async (p) => { log('goto', p); await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.evaluate(() => window.__cursor.show()); await page.waitForTimeout(600); };
  const takes = {};
  const log = (...a) => process.env.DEBUG && console.log('[dbg]', ...a);

  try {
    // Warm every route the takes visit, so the dev server never compiles mid-take.
    for (const r of ['/start', '/picker', '/session/idle/1', '/session/recording/1', '/session/captured/1', '/session/processing/1',
      '/session/pass/1', '/session/unclear/2', '/session/miss/4', '/session/reveal/4', '/session/recap', '/session/recap/practice']) {
      await page.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 180000 }).catch(() => {});
    }
    // A fresh run with the mic already granted: no permission sheet in the reel.
    await page.goto(BASE + '/start', { waitUntil: 'networkidle' });
    await page.evaluate(() => sessionStorage.setItem('sayitback.session', JSON.stringify({ outcomes: [], startedAt: Date.now(), lastAt: Date.now(), micGranted: true })));
    const has = async (n, exact = false) => (await page.getByRole('button', { name: n, exact }).count()) > 0;
    const tap = async (n, exact = false) => { await page.getByRole('button', { name: n, exact }).first().waitFor({ state: 'visible', timeout: 60000 }); await page.getByRole('button', { name: n, exact }).first().click(); };

    // A — the picker's "Start here", the question, a full spoken take, Captured with
    // Sure, and the correct answer: their words, the strength notches, +11 XP.
    await go('/picker');
    takes.A = await take(page, 'A', async (r) => {
      await r.wait(1300);
      await r.click('Chemistry: bonding', { exact: true, label: 'Start here' });
      await r.wait(700);
      await r.click('Tap to answer', { label: 'mic' });
      await r.wait(PASS_HOLD_MS - AFTER_MS);
      await r.click('Send', { exact: true });
      await r.wait(500);
      await r.click('Sure', { exact: true });
      await r.click('Looks good');
      await r.wait(4800);
    });

    // B — question 2's scripted mishear: "I didn't catch that. Not a wrong answer."
    takes.B = await take(page, 'B', async (r) => {
      await r.click('Continue');
      await r.wait(500);
      await r.click('Tap to answer', { label: 'mic' });
      await r.wait(MISS_HOLD_MS - AFTER_MS);
      await r.click('Send', { exact: true });
      if (await has('Looks good')) await r.click('Looks good');
      await r.wait(3200);
    });

    // Off camera: say question 2 again, pass question 3 (its slow judge included), and
    // miss question 4 half right, so the Recap reads "3 of 4" with one to win back.
    console.log('playing questions 2 to 4 off camera…');
    const spoken = async (holdMs) => {
      await tap(/^(Tap to answer|Say it again)$/);
      await page.waitForTimeout(holdMs);
      await tap('Send', true);
      await page.getByRole('button', { name: 'Looks good' }).first().waitFor({ timeout: 60000 }).catch(() => {});
      if (await has('Looks good')) await tap('Looks good');
    };
    await spoken(PASS_HOLD_MS);                    // Q2 → pass
    await tap('Continue');
    await spoken(PASS_HOLD_MS);                    // Q3 → pass, after the 7.5s scripted judge
    await tap('Continue', true).catch(() => tap('Continue'));
    await spoken(MISS_HOLD_MS);                    // Q4 → half right
    await page.getByRole('button', { name: 'Show the answer' }).first().waitFor({ timeout: 60000 });
    await page.evaluate(() => window.__cursor.moveTo(330, 760, 10));
    await page.waitForTimeout(600);

    // C — the half-right miss with its hint, then "Show the answer".
    takes.C = await take(page, 'C', async (r) => {
      await r.wait(2400);
      await r.click('Show the answer');
      await r.wait(2200);
    });

    // Off camera: on to the Recap.
    await tap('Continue', true);
    await page.waitForURL(/\/session\/recap/, { timeout: 60000 });
    await page.evaluate(() => window.__cursor.moveTo(330, 880, 10)); // park the cursor off screen
    await page.waitForTimeout(300);

    // D — the Recap ("Nice work! 3 of 4", New today, the confetti), then the rematch deck.
    takes.D = await take(page, 'D', async (r) => {
      await r.wait(3600);
      await r.click('Practice what I missed');
      await r.wait(2800);
    });
  } catch (e) {
    // Where it stuck, for debugging a failed run.
    await page.screenshot({ path: path.join(OUT, 'failed.png') }).catch(() => {});
    console.error('stuck at', page.url());
    throw e;
  } finally {
    await browser.close();
    server?.kill();
  }

  const meta = { recordedAt: new Date().toISOString(), screen: { ...VIEW, deviceScaleFactor: DSF }, fps: FPS, takes };
  fs.writeFileSync(path.join(OUT, 'clicks.json'), JSON.stringify(meta, null, 2));
  console.log('wrote public/clips/clicks.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
