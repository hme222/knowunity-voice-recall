import { spring } from 'remotion';
import { CamKey, config } from './config';
import clicks from '../public/clips/clicks.json';

export type Cam = { x: number; y: number; zoom: number; rx: number; ry: number; rz: number };
type Resolved = Cam & { t: number; feel: 'glide' | 'punch' };

const DEFAULT: Cam = { x: 195, y: 422, zoom: 1, rx: 0, ry: 0, rz: 0 };

type Take = { durationSec: number; clicks: { t: number; x: number; y: number; label: string }[] };
const takes = (clicks as unknown as { takes: Record<string, Take> }).takes;

export function clickInTake(take: string, label: string) {
  const c = takes[take]?.clicks.find((k) => k.label === label);
  if (!c) throw new Error(`No click "${label}" in take ${take}. Re-record or fix config.ts.`);
  return c;
}

export function takeDuration(take: string) {
  return takes[take]?.durationSec ?? 0;
}

/** Turns config keys (some pinned to clicks) into absolute, fully-filled keyframes. */
export function resolveKeys(keys: CamKey[], take: string, shotFrom: number): Resolved[] {
  let prev: Resolved = { ...DEFAULT, t: 0, feel: 'glide' };
  return keys.map((k, i) => {
    let t = k.t ?? 0;
    let x = k.x, y = k.y;
    if (k.click) {
      const c = clickInTake(take, k.click);
      t = c.t - shotFrom + (k.lead ?? 0);
      x = x ?? c.x;
      y = y ?? c.y;
    }
    const r: Resolved = {
      t: i === 0 ? 0 : Math.max(0, t),
      x: x ?? prev.x, y: y ?? prev.y,
      zoom: k.zoom ?? prev.zoom, rx: k.rx ?? prev.rx, ry: k.ry ?? prev.ry, rz: k.rz ?? prev.rz,
      feel: k.feel ?? 'glide',
    };
    prev = r;
    return r;
  });
}

const FEEL = {
  glide: { damping: 200, mass: 1.1, stiffness: 60 },
  punch: { damping: 16, mass: 0.9, stiffness: 110 },
};

/** Camera at a frame: each key springs from the previous one, starting at its own time.
 *  Springs overlap and add up, so moves blend instead of stopping and starting. */
export function cameraAt(frame: number, keys: Resolved[]): Cam {
  const fps = config.fps;
  const out: Cam = { x: keys[0].x, y: keys[0].y, zoom: keys[0].zoom, rx: keys[0].rx, ry: keys[0].ry, rz: keys[0].rz };
  for (let i = 1; i < keys.length; i++) {
    const p = spring({ frame: frame - Math.round(keys[i].t * fps), fps, config: FEEL[keys[i].feel] });
    (Object.keys(out) as (keyof Cam)[]).forEach((k) => {
      out[k] += (keys[i][k] - keys[i - 1][k]) * p;
    });
  }
  return out;
}
