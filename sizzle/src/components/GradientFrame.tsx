import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { config } from '../config';

/** The window: a gradient border that fills the frame edges, with a dark page inside.
 *  Whatever is passed as children sits centered on the page. */
export const GradientFrame: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const [a, b, c, d] = config.colors.border;
  // A slow sheen drifting across the border keeps static shots alive.
  const sheen = (frame * 0.6) % 200;
  return (
    <AbsoluteFill style={{ borderRadius: 30, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `linear-gradient(168deg, ${a} 0%, ${b} 36%, ${c} 68%, ${d} 100%)` }} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent ${sheen - 40}%, rgba(255,255,255,0.22) ${sheen - 20}%, transparent ${sheen}%)`,
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 70% at 50% 0%, rgba(255,255,255,0.28), transparent 60%)' }} />
      <div
        style={{
          position: 'absolute', left: 54, right: 54, top: 46, bottom: 52, borderRadius: 18, overflow: 'hidden',
          background: `radial-gradient(60% 75% at 50% 18%, ${config.colors.pageGlow}, ${config.colors.page} 62%, ${config.colors.canvas})`,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 24px 70px rgba(0,0,0,0.45)',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
