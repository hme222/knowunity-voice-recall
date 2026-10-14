import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from 'remotion';
import { config } from '../config';
import { Knowie } from './Knowie';

/** Knowie flies at the camera until his violet body fills the frame, the frame
 *  holds as a striped brand-color slab while the cut happens underneath, then the
 *  slab lifts away to reveal the next scene. */
export const MascotWipe: React.FC<{ startScale?: number; startTop?: number }> = ({ startScale = 0.3, startTop }) => {
  const f = useCurrentFrame();
  const { fps, wipe, colors, width, height } = config;
  const cover = Math.round(wipe.coverSec * fps), hold = Math.round(wipe.holdSec * fps);
  // Cover: exponential zoom reads as "flying at you", not "growing".
  const z = interpolate(f, [0, cover], [0, 1], { extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const scale = startScale * Math.pow(160 / startScale, z);
  const top = interpolate(z, [0, 1], [startTop ?? height * 0.56, height * 0.56]);
  const headOpacity = interpolate(f, [0, startTop ? 0.01 : 3, cover, cover + 1], [startTop ? 1 : 0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slabIn = interpolate(f, [cover - 3, cover], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lift = spring({ frame: f - cover - hold, fps, config: { damping: 200, stiffness: 70 } });
  const stripes = (f * 9) % 120;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          opacity: slabIn,
          transform: `translateY(${-lift * (height + 80)}px)`,
          background: `repeating-linear-gradient(135deg, ${colors.knowie} ${stripes}px, ${colors.knowie} ${stripes + 60}px, ${colors.knowieDeep} ${stripes + 60}px, ${colors.knowieDeep} ${stripes + 120}px)`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        }}
      />
      {headOpacity > 0 && (
        <div
          style={{
            position: 'absolute', left: width / 2, top, opacity: headOpacity,
            transform: `translate(-50%, -42%) scale(${scale})`, transformOrigin: '50% 42%',
          }}
        >
          <Knowie src={config.assets.knowieWipe} style={{ width: 320 }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const wipeFrames = () => {
  const { fps, wipe } = config;
  return Math.round(wipe.coverSec * fps) + Math.round(wipe.holdSec * fps) + Math.round(wipe.revealSec * fps);
};
