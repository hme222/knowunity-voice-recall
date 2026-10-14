import React from 'react';
import { Composition, continueRender, delayRender, staticFile } from 'remotion';
import { config, totalSeconds } from './config';
import { Sizzle } from './Sizzle';

// Load the brand font before any frame renders, so no frame falls back to a system font.
const handle = delayRender('Loading font');
const face = new FontFace(config.font.family, `url(${staticFile(config.font.file)})`, { weight: '100 900' });
face.load().then((f) => { document.fonts.add(f); continueRender(handle); }).catch((e) => { console.error(e); continueRender(handle); });

export const Root: React.FC = () => (
  <Composition
    id="Sizzle"
    component={Sizzle}
    durationInFrames={Math.round(totalSeconds() * config.fps)}
    fps={config.fps}
    width={config.width}
    height={config.height}
  />
);
