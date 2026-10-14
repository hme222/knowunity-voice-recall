import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { config } from '../config';

/** One line naming the design decision on screen, set in the empty space left of the
 *  phone (it filled the middle and a bottom pill covered the screen at 2–3x zoom).
 *  Outside the 3D camera, so it never tilts: it rises in just after the cut and fades
 *  before the next. */
export const Caption: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, font } = config;
  const enter = spring({ frame: f - 6, fps, config: { damping: 200, stiffness: 120 } });
  const exit = interpolate(f, [durationInFrames - 10, durationInFrames - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute', left: 96, top: '50%', width: 470, pointerEvents: 'none',
        opacity: enter * exit, transform: `translate(${interpolate(enter, [0, 1], [-28, 0])}px, -50%)`,
      }}
    >
      <div style={{ width: 64, height: 8, borderRadius: 999, background: `linear-gradient(90deg, ${colors.border.join(', ')})`, marginBottom: 28 }} />
      <div
        style={{
          fontFamily: `${font.family}, ${font.fallback}`, fontWeight: 800, fontSize: 64, lineHeight: 1.08, letterSpacing: -1,
          color: colors.text, textShadow: '0 6px 30px rgba(0,0,0,0.55)',
        }}
      >
        {text}
      </div>
    </div>
  );
};
