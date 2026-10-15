import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';
import { config } from '../config';

/** One recorded take, framed as a phone screen and centered on the page.
 *  `offsetX` / `offsetY` move it off centre (px on the page), `blur` softens it for
 *  depth, `style` adds a 3D transform, and `overlay` draws on top of the screen in
 *  its own 390x844 coordinates (tap ripples). */
export const PhoneScreen: React.FC<{
  file: string;
  fromSec: number;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  style?: React.CSSProperties;
  overlay?: React.ReactNode;
  /** Below 1, slow motion: the stack holds each screen on its moment. */
  playbackRate?: number;
}> = ({ file, fromSec, offsetX = 0, offsetY = 0, blur = 0, style, overlay, playbackRate = 1 }) => {
  const { screen, screenScale, deviceFrame, fps } = config;
  const w = screen.width * screenScale, h = screen.height * screenScale;
  const native = { w: screen.width * config.captureScale, h: screen.height * config.captureScale };
  const radius = deviceFrame === 'none' ? 0 : 46 * screenScale;
  return (
    <div
      style={{
        position: 'absolute', left: '50%', top: '50%', width: w, height: h,
        marginLeft: -w / 2 + offsetX, marginTop: -h / 2 + offsetY,
        borderRadius: radius, overflow: 'hidden', background: config.colors.canvas,
        filter: blur ? `blur(${blur}px)` : undefined,
        boxShadow: deviceFrame === 'none'
          ? '0 30px 80px rgba(0,0,0,0.5)'
          : '0 0 0 1.5px rgba(255,255,255,0.16), 0 0 0 9px #05060C, 0 0 0 10.5px rgba(255,255,255,0.10), 0 40px 90px rgba(0,0,0,0.55)',
        ...style,
      }}
    >
      {/* Laid out at the recording's native size (captureScale) and scaled down, so the
          camera's zoom scales a full-resolution layer back up instead of a 1x one. */}
      <div style={{ width: native.w, height: native.h, transform: `scale(${w / native.w})`, transformOrigin: '0 0' }}>
        <OffthreadVideo
          src={staticFile(file)}
          startFrom={Math.round(fromSec * fps)}
          muted
          playbackRate={playbackRate}
          style={{ width: native.w, height: native.h, display: 'block' }}
        />
      </div>
      {overlay ? (
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${screenScale})`, transformOrigin: '0 0', width: screen.width, height: screen.height }}>
          {overlay}
        </div>
      ) : null}
    </div>
  );
};
