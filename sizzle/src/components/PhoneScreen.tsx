import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';
import { config } from '../config';

/** One recorded take, framed as a phone screen and centered on the page. */
export const PhoneScreen: React.FC<{ file: string; fromSec: number }> = ({ file, fromSec }) => {
  const { screen, screenScale, deviceFrame, fps } = config;
  const w = screen.width * screenScale, h = screen.height * screenScale;
  const native = { w: screen.width * 3, h: screen.height * 3 };
  const radius = deviceFrame === 'none' ? 0 : 46 * screenScale;
  return (
    <div
      style={{
        position: 'absolute', left: '50%', top: '50%', width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2,
        borderRadius: radius, overflow: 'hidden', background: config.colors.canvas,
        boxShadow: deviceFrame === 'none'
          ? '0 30px 80px rgba(0,0,0,0.5)'
          : '0 0 0 1.5px rgba(255,255,255,0.16), 0 0 0 9px #05060C, 0 0 0 10.5px rgba(255,255,255,0.10), 0 40px 90px rgba(0,0,0,0.55)',
      }}
    >
      {/* Laid out at the recording's native 3x size and scaled down, so the camera's
          zoom scales a full-resolution layer back up instead of a 1x one. */}
      <div style={{ width: native.w, height: native.h, transform: `scale(${w / native.w})`, transformOrigin: '0 0' }}>
        <OffthreadVideo
          src={staticFile(file)}
          startFrom={Math.round(fromSec * fps)}
          muted
          style={{ width: native.w, height: native.h, display: 'block' }}
        />
      </div>
    </div>
  );
};
