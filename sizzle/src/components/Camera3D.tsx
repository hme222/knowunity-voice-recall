import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cam } from '../camera';
import { config } from '../config';

/** Points a virtual camera at a spot on the phone screen.
 *  The whole window is one plane: it is moved so the focus point lands at frame
 *  center, then scaled and rotated around that point with real CSS perspective. */
// No will-change here: it makes Chrome rasterize the plane once at 1x and then
// stretch that bitmap, which turns close-ups soft.
/** `centerX`: where on the frame the focus point lands, in px (default: the middle).
 *  Captioned shots sit the phone right of centre to leave the left for the caption. */
export const Camera3D: React.FC<{ cam: Cam; children: React.ReactNode; centerX?: number }> = ({ cam, children, centerX }) => {
  const { width, height, screen, screenScale } = config;
  // Focus point on the plane. The page is inset (54/46/54/52), and the screen sits at its center.
  const pageCx = width / 2, pageCy = 46 + (height - 46 - 52) / 2;
  const px = pageCx + (cam.x - screen.width / 2) * screenScale;
  const py = pageCy + (cam.y - screen.height / 2) * screenScale;
  return (
    <AbsoluteFill style={{ background: config.colors.canvas, perspective: config.perspective, perspectiveOrigin: '50% 50%', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${px}px ${py}px`,
          transform: `translate3d(${(centerX ?? width / 2) - px}px, ${height / 2 - py}px, 0) rotateZ(${cam.rz}deg) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) scale(${cam.zoom})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
