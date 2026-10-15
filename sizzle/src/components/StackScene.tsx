import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { config } from '../config';
import { Camera3D } from './Camera3D';
import { GradientFrame } from './GradientFrame';
import { PhoneScreen } from './PhoneScreen';

type Card = { take: string; from: number };

/** The whole loop at once, Slant It style: five live screens fanned in 3D, the far ones
 *  softened, while the camera glides along the row and the focus follows it. Each screen
 *  rises in with a small stagger. */
export const StackScene: React.FC<{ cards: Card[]; files: Record<string, { file: string }>; durationInFrames: number }> = ({ cards, files, durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps } = config;
  const n = cards.length;
  const spacing = 330;
  // The glide: left to right across the row, a slow yaw so the fan turns as it goes.
  const t = interpolate(f, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });
  const ease = t * t * (3 - 2 * t);
  const focus = interpolate(ease, [0, 1], [-1.2, 1.2]);
  // Close enough that the row fills the frame (0.62 showed the whole window, tiny).
  const cam = { x: 195 + focus * 60, y: 422, zoom: 1.05 + ease * 0.12, rx: 12 - ease * 6, ry: 14 - ease * 24, rz: -3 + ease * 4 };
  return (
    <Camera3D cam={cam}>
      <GradientFrame>
        <div style={{ position: 'absolute', inset: 0, perspective: 1800, transformStyle: 'preserve-3d' }}>
          {cards.map((c, i) => {
            const k = i - (n - 1) / 2; // -2 … 2
            const rise = spring({ frame: f - 2 - i * 3, fps, config: { damping: 200, stiffness: 100 } });
            const dist = Math.abs(k - focus);
            return (
              <PhoneScreen
                key={i}
                file={files[c.take].file}
                fromSec={c.from}
                playbackRate={0.33}
                offsetX={k * spacing}
                blur={Math.min(6, Math.max(0, dist - 0.6) * 3.2)}
                style={{
                  transform: `translateZ(${-Math.abs(k) * 220}px) rotateY(${-k * 16}deg) translateY(${interpolate(rise, [0, 1], [140, 0])}px)`,
                  opacity: rise,
                  zIndex: 10 - Math.round(Math.abs(k) * 2),
                }}
              />
            );
          })}
        </div>
      </GradientFrame>
    </Camera3D>
  );
};
