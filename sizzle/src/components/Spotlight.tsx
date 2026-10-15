import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { config } from '../config';

/** Motionik-style highlight: the screen dims except one rounded rectangle, which gets
 *  a soft accent edge. In the screen's own 390x844 space (PhoneScreen's overlay), so it
 *  tilts with the screen. `from` / `to`: shot frames it is up for. */
export const Spotlight: React.FC<{ x: number; y: number; w: number; h: number; from: number; to: number; color?: string }> = ({ x, y, w, h, from, to, color }) => {
  const f = useCurrentFrame();
  const on = interpolate(f, [from, from + 8, to - 8, to], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (on <= 0) return null;
  const pad = interpolate(on, [0, 1], [24, 8]);
  const accent = color ?? config.colors.accent;
  return (
    <div
      style={{
        position: 'absolute', left: x - pad, top: y - pad, width: w + pad * 2, height: h + pad * 2, borderRadius: 18,
        boxShadow: `0 0 0 2000px rgba(5,6,14,${0.62 * on}), 0 0 0 2px ${accent}, 0 0 28px ${accent}`,
        opacity: on,
      }}
    />
  );
};
