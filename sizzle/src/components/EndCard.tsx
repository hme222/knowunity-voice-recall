import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { config } from '../config';
import { Camera3D } from './Camera3D';
import { GradientFrame } from './GradientFrame';
import { Knowie } from './Knowie';

/** Knowie, title, tagline, then a hold. */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, colors, text, font } = config;
  const rise = (delay: number) => spring({ frame: f - delay, fps, config: { damping: 200, stiffness: 80 } });
  const pop = spring({ frame: f - 6, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const float = Math.sin(f / 18) * 6;
  const blink = (f >= 75 && f < 80) || (f >= 135 && f < 139);
  const push = spring({ frame: f, fps, config: { damping: 200, stiffness: 18 } });
  const cam = { x: 195, y: 422, zoom: 0.98 + push * 0.04, rx: 6 - push * 5, ry: 3 - push * 3, rz: 0 };
  const ff = `${font.family}, ${font.fallback}`;
  const line = (delay: number): React.CSSProperties => ({
    opacity: rise(delay), transform: `translateY(${interpolate(rise(delay), [0, 1], [26, 0])}px)`,
  });
  return (
    <Camera3D cam={cam}>
      <GradientFrame>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ transform: `translateY(${float}px) scale(${pop})`, marginBottom: 34 }}>
            <Knowie src={blink ? config.assets.knowieEndBlink : config.assets.knowieEnd} style={{ width: 230 }} />
          </div>
          <div style={{ ...line(16), fontFamily: ff, fontWeight: 800, fontSize: 124, letterSpacing: -2, lineHeight: 1, color: colors.text }}>
            {text.title}
          </div>
          <div style={{ ...line(26), fontFamily: ff, fontSize: 54, lineHeight: 1.3, marginTop: 26, color: colors.textDim }}>
            {text.tagline}
          </div>
          <div style={{ ...line(36), fontFamily: ff, fontWeight: 600, fontSize: 40, marginTop: 34, color: colors.accent, letterSpacing: 0.5 }}>
            {text.subline}
            {text.name ? <span style={{ color: colors.textDim }}>{'  ·  '}{text.name}</span> : null}
          </div>
        </div>
      </GradientFrame>
    </Camera3D>
  );
};
