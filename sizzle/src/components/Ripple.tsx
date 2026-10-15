import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { config } from '../config';

/** A tap, made visible: two rings that expand from where the cursor tapped and fade.
 *  In the screen's own 390x844 space (PhoneScreen's overlay), so it tilts with it.
 *  `at`: the shot frame the tap lands on. */
export const Ripple: React.FC<{ x: number; y: number; at: number; color?: string }> = ({ x, y, at, color }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 22) return null;
  const ring = (delay: number, max: number) => {
    const p = interpolate(f - delay, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    const r = interpolate(p, [0, 1], [6, max]);
    return (
      <div
        style={{
          position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999,
          border: `${interpolate(p, [0, 1], [5, 1])}px solid ${color ?? config.colors.accent}`,
          opacity: interpolate(p, [0, 0.15, 1], [0, 0.9, 0]),
          boxShadow: `0 0 18px ${color ?? config.colors.accent}`,
        }}
      />
    );
  };
  return (
    <>
      {ring(0, 46)}
      {ring(5, 30)}
    </>
  );
};
