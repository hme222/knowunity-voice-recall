import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { config } from '../config';

/** The design decision on screen, set in the space left of the phone: a chapter label
 *  ("02 · Listen") in that chapter's accent, a short accent rule, then the line, its
 *  words rising in one at a time. Outside the 3D camera, so it never tilts. */
export const Caption: React.FC<{ text: string; durationInFrames: number; chapter?: number; top?: string }> = ({ text, durationInFrames, chapter, top = '50%' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, font, chapters } = config;
  const ch = chapter ? chapters[chapter - 1] : undefined;
  const accent = ch?.accent ?? colors.accent;
  const exit = interpolate(f, [durationInFrames - 10, durationInFrames - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rise = (delay: number) => spring({ frame: f - delay, fps, config: { damping: 200, stiffness: 140 } });
  const words = text.split(' ');
  const ff = `${font.family}, ${font.fallback}`;
  return (
    <div style={{ position: 'absolute', left: 96, top, width: 500, transform: 'translateY(-50%)', opacity: exit, pointerEvents: 'none' }}>
      {ch ? (
        <div
          style={{
            fontFamily: ff, fontWeight: 700, fontSize: 26, letterSpacing: 3, textTransform: 'uppercase', color: accent,
            opacity: rise(2), transform: `translateX(${interpolate(rise(2), [0, 1], [-18, 0])}px)`, marginBottom: 18,
          }}
        >
          {`${String(chapter).padStart(2, '0')}  ·  ${ch.name}`}
        </div>
      ) : null}
      <div
        style={{
          width: interpolate(rise(4), [0, 1], [0, 72]), height: 8, borderRadius: 999, marginBottom: 26,
          background: ch ? accent : `linear-gradient(90deg, ${colors.border.join(', ')})`,
        }}
      />
      <div style={{ fontFamily: ff, fontWeight: 800, fontSize: 64, lineHeight: 1.08, letterSpacing: -1, color: colors.text, textShadow: '0 6px 30px rgba(0,0,0,0.55)' }}>
        {words.map((w, i) => {
          const p = rise(7 + i * 2);
          return (
            <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px)`, marginRight: '0.24em' }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
