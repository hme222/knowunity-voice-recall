import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { config } from '../config';
import { Camera3D } from './Camera3D';
import { GradientFrame } from './GradientFrame';
import { PhoneScreen } from './PhoneScreen';

type Side = { take: string; from: number; label: string; color: string };

/** Two screens side by side, turned a little towards each other, each with its label
 *  above: two moments that are easy to confuse, shown as the different things they are.
 *  The pair sits right of centre; the caption has the left. */
export const SplitScene: React.FC<{ left: Side; right: Side; files: Record<string, { file: string }>; rate?: number }> = ({ left, right, files, rate = 1 }) => {
  const f = useCurrentFrame();
  const { fps, screen, screenScale, font, colors, width } = config;
  const drift = spring({ frame: f, fps, config: { damping: 200, stiffness: 22 } });
  const enter = (d: number) => spring({ frame: f - d, fps, config: { damping: 200, stiffness: 110 } });
  // Full frame (0.8 showed the window's edges); the phones shrink instead, so their
  // labels fit above them.
  const cam = { x: 195, y: 422, zoom: 1.0 + drift * 0.05, rx: 8 - drift * 4, ry: 4 - drift * 6, rz: 0 };
  const k = 0.8;
  const h = screen.height * screenScale;
  const gap = 230;
  // Shift the pair right of centre in page px: the page is the frame less its 54px rims.
  const shift = width * config.captionPhoneCenter - width / 2;
  const side = (s: Side, dir: -1 | 1, d: number) => (
    <React.Fragment key={dir}>
      <PhoneScreen
        file={files[s.take].file}
        fromSec={s.from}
        playbackRate={rate}
        offsetX={shift + dir * gap}
        offsetY={34}
        style={{ transform: `rotateY(${-dir * 12}deg) translateY(${interpolate(enter(d), [0, 1], [60, 0])}px) scale(${k})`, opacity: enter(d) }}
      />
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%', marginLeft: shift + dir * gap, marginTop: -(h * k) / 2 + 34 - 70,
          transform: 'translateX(-50%)', opacity: enter(d + 6),
          fontFamily: `${font.family}, ${font.fallback}`, fontWeight: 800, fontSize: 40, color: colors.text,
          padding: '10px 26px', borderRadius: 999, background: 'rgba(9,12,24,0.7)', boxShadow: `inset 0 0 0 3px ${s.color}`,
          whiteSpace: 'nowrap',
        }}
      >
        {s.label}
      </div>
    </React.Fragment>
  );
  return (
    <Camera3D cam={cam}>
      <GradientFrame>
        <div style={{ position: 'absolute', inset: 0, perspective: 2200 }}>
          {side(left, -1, 0)}
          {side(right, 1, 5)}
        </div>
      </GradientFrame>
    </Camera3D>
  );
};
