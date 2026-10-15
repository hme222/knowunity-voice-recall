import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame } from 'remotion';
import { config } from '../config';
import { Camera3D } from './Camera3D';
import { GradientFrame } from './GradientFrame';
import { Knowie } from './Knowie';

/** "A face for every moment", centred and calm, in three phases (designer, 2026-10-15):
 *  1. hold — headline, explanation and Knowie settle in and sit for a beat;
 *  2. faces — Knowie's face changes on an even beat, each named with its meaning,
 *     nothing else moving (no row, no ring: the chip-by-chip ring read as busy);
 *  3. lineup — once the last face lands, the row of all of them fades in left to right
 *     as a summary, the last one marked.
 *  One entrance with no overshoot; nothing scales or squashes after it. */
export const FacesBeat: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps, colors, facesBeat, font } = config;
  const ff = `${font.family}, ${font.fallback}`;
  const faces = facesBeat.faces;
  const settle = (delay: number) => spring({ frame: f - delay, fps, config: { damping: 200, stiffness: 90 } });
  const exit = interpolate(f, [durationInFrames - 10, durationInFrames - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Beats, in frames: headline 0, subline 8, Knowie 20; a held second; faces change from
  // 66, every 15 frames; the lineup after the last face, while it holds.
  const flipFrom = 66;
  const per = 15;
  const lineupAt = flipFrom + per * (faces.length - 1) + 8;
  const xf = 4; // cross-dissolve length, frames
  const t = Math.max(0, f - flipFrom);
  const idx = Math.min(faces.length - 1, Math.floor(t / per));
  const local = t - idx * per;
  const prev = Math.max(0, idx - 1);
  const mix = idx === 0 ? 1 : interpolate(local, [0, xf], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });

  const knowieIn = settle(20);
  const drift = spring({ frame: f, fps, config: { damping: 200, stiffness: 14 } });
  const cam = { x: 195, y: 422, zoom: 1.0 + drift * 0.03, rx: 4 - drift * 3, ry: -2 + drift * 4, rz: 0 };
  const line = (delay: number): React.CSSProperties => ({ opacity: settle(delay) * exit, transform: `translateY(${interpolate(settle(delay), [0, 1], [18, 0])}px)` });

  const chip = 72, gap = 16;
  const lineup = (i: number) => interpolate(f - lineupAt - i * 2, [0, 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const labelOf = (i: number) => facesBeat.labels[faces[i]] ?? [faces[i], ''];
  // The label dips: the old line fades out, then the new one fades in, never both at
  // once (overlapping, the two lines read as one smear).
  const labelOut = idx === 0 ? 1 : interpolate(local, [0, 4], [1, 0], { extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const labelIn = idx === 0 ? settle(flipFrom) : interpolate(local, [4, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <Camera3D cam={cam}>
      <GradientFrame>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 70, textAlign: 'center' }}>
          <div style={{ ...line(0), width: 80, height: 8, borderRadius: 999, background: `linear-gradient(90deg, ${colors.border.join(', ')})`, marginBottom: 26 }} />
          <div style={{ ...line(0), fontFamily: ff, fontWeight: 800, fontSize: 78, letterSpacing: -1.5, lineHeight: 1, color: colors.text }}>
            A face for every moment
          </div>
          <div style={{ ...line(8), fontFamily: ff, fontSize: 34, lineHeight: 1.35, marginTop: 18, color: colors.textDim, maxWidth: 1100 }}>
            {facesBeat.subline}
          </div>

          {/* Two stacked faces: the old one stays solid underneath while the new one fades in
              over it, so the body never goes see-through and only the eyes appear to change. */}
          <div
            style={{
              position: 'relative', marginTop: 36, width: 290, height: 300, opacity: knowieIn * exit,
              transform: `translateY(${interpolate(knowieIn, [0, 1], [16, 0])}px) scale(${interpolate(knowieIn, [0, 1], [0.94, 1])})`,
            }}
          >
            {f >= flipFrom && idx > 0 && mix < 1 ? (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <Knowie src={`knowie/${faces[prev]}.svg`} style={{ width: 290 }} />
              </div>
            ) : null}
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: f >= flipFrom ? mix : 1 }}>
              <Knowie src={`knowie/${f >= flipFrom ? faces[idx] : 'standby'}.svg`} style={{ width: 290 }} />
            </div>
          </div>

          <div style={{ position: 'relative', marginTop: 40, width: 900, height: 96, fontFamily: ff, opacity: f >= flipFrom ? exit : 0 }}>
            {[idx > 0 && labelOut > 0 ? { i: prev, o: labelOut, y: -6 * (1 - labelOut) } : null, { i: idx, o: labelIn, y: 8 * (1 - labelIn) }]
              .filter((x): x is { i: number; o: number; y: number } => Boolean(x))
              .map(({ i, o, y }) => (
                <div key={i} style={{ position: 'absolute', inset: 0, opacity: o, transform: `translateY(${y}px)` }}>
                  <div style={{ fontWeight: 800, fontSize: 44, color: colors.text }}>{labelOf(i)[0]}</div>
                  <div style={{ fontSize: 32, color: colors.accent, marginTop: 6 }}>{labelOf(i)[1]}</div>
                </div>
              ))}
          </div>

          {/* The lineup: every face, fading in left to right once the last has landed. */}
          <div style={{ display: 'flex', gap, marginTop: 22, opacity: exit }}>
            {faces.map((fc, i) => {
              const last = i === faces.length - 1;
              return (
                <div
                  key={fc}
                  style={{
                    width: chip, height: chip, borderRadius: 999, display: 'grid', placeItems: 'center',
                    opacity: lineup(i), transform: `translateY(${interpolate(lineup(i), [0, 1], [10, 0])}px)`,
                    boxShadow: last ? `0 0 0 3px ${colors.accent}` : 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                    background: last ? 'rgba(167,139,250,0.20)' : 'rgba(255,255,255,0.04)',
                  }}
                >
                  <Knowie src={`knowie/${fc}.svg`} style={{ width: 50 }} />
                </div>
              );
            })}
          </div>
        </div>
      </GradientFrame>
    </Camera3D>
  );
};
