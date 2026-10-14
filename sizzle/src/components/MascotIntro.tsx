import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { config } from '../config';
import { Camera3D } from './Camera3D';
import { GradientFrame } from './GradientFrame';
import { Knowie } from './Knowie';

/** Knowie pops into the window, blinks, and the title rises under him. */
/** `handoffAt`: the frame the wipe takes Knowie over and flies him at the camera. */
export const MascotIntro: React.FC<{ handoffAt?: number }> = ({ handoffAt = Infinity }) => {
  const f = useCurrentFrame();
  const { fps } = config;
  const pop = 0.35 + 0.65 * spring({ frame: f, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const squash = 1 + Math.sin(Math.min(1, f / 18) * Math.PI) * 0.08;
  const blink = (f >= 40 && f < 45) || (f >= 60 && f < 64);
  const title = spring({ frame: f - 18, fps, config: { damping: 200, stiffness: 90 } });
  // The camera eases in a little the whole time, so the shot never sits still.
  const push = spring({ frame: f, fps, config: { damping: 200, stiffness: 25 } });
  const cam = { x: 195, y: 400, zoom: 1 + push * 0.06, rx: 8 - push * 4, ry: -4 + push * 3, rz: 0 };
  return (
    <Camera3D cam={cam}>
      <GradientFrame>
        <div style={{ opacity: f >= handoffAt ? 0 : 1, position: 'absolute', left: '50%', top: '43%', transform: `translate(-50%,-50%) scale(${pop}) scaleY(${squash}) scaleX(${2 - squash})` }}>
          <Knowie src={blink ? config.assets.knowieBlink : config.assets.knowieIntro} style={{ width: 300 }} />
        </div>
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: '66%', textAlign: 'center',
            fontFamily: `${config.font.family}, ${config.font.fallback}`, fontWeight: 800, fontSize: 84, letterSpacing: -1,
            color: config.colors.text, opacity: title, transform: `translateY(${interpolate(title, [0, 1], [30, 0])}px)`,
          }}
        >
          {config.text.introTitle}
        </div>
      </GradientFrame>
    </Camera3D>
  );
};
