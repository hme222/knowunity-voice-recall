import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { cameraAt, resolveKeys } from './camera';
import { config, Shot } from './config';
import { Camera3D } from './components/Camera3D';
import { EndCard } from './components/EndCard';
import { GradientFrame } from './components/GradientFrame';
import { MascotIntro } from './components/MascotIntro';
import { MascotWipe, wipeFrames } from './components/MascotWipe';
import { Caption } from './components/Caption';
import { PhoneScreen } from './components/PhoneScreen';
import clicks from '../public/clips/clicks.json';

const files = (clicks as unknown as { takes: Record<string, { file: string }> }).takes;

const ClipShot: React.FC<{ shot: Extract<Shot, { kind: 'clip' }> }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const keys = resolveKeys(shot.cam, shot.take, shot.from);
  return (
    <Camera3D cam={cameraAt(frame, keys)} centerX={shot.caption ? config.width * config.captionPhoneCenter : undefined}>
      <GradientFrame>
        <PhoneScreen file={files[shot.take].file} fromSec={shot.from} />
      </GradientFrame>
    </Camera3D>
  );
};

/** Start frame of every shot, back to back. */
export const timeline = () => {
  let at = 0;
  return config.shots.map((s) => {
    const start = at, frames = Math.round(s.dur * config.fps);
    at += frames;
    return { shot: s, start, frames };
  });
};

export const Sizzle: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const tl = timeline();
  const { fps, wipe, music } = config;
  const cover = Math.round(wipe.coverSec * fps), hold = Math.round(wipe.holdSec * fps);
  return (
    <AbsoluteFill style={{ background: config.colors.canvas }}>
      {tl.map(({ shot, start, frames }, i) => (
        <Sequence key={i} from={start} durationInFrames={frames} name={shot.kind === 'clip' ? shot.note : shot.kind}>
          {shot.kind === 'intro' ? <MascotIntro handoffAt={frames - cover - Math.floor(hold / 2)} /> : shot.kind === 'end' ? <EndCard /> : <ClipShot shot={shot} />}
          {shot.kind === 'clip' && shot.caption ? <Caption text={shot.caption} durationInFrames={frames} /> : null}
        </Sequence>
      ))}
      {config.wipesAfter.map((idx) => {
        const cut = tl[idx].start + tl[idx].frames;
        // The slab is fully down, mid-hold, at the cut.
        return (
          <Sequence key={`w${idx}`} from={cut - cover - Math.floor(hold / 2)} durationInFrames={wipeFrames()} name="Knowie wipe">
            {/* After the intro, the wipe starts from the intro's own Knowie, so he flies at the camera. */}
            {idx === 0 && config.shots[0].kind === 'intro' ? <MascotWipe startScale={0.98} startTop={441} /> : <MascotWipe />}
          </Sequence>
        );
      })}
      {music.src ? (
        <Audio
          src={staticFile(music.src)}
          volume={(f) => music.volume * interpolate(f, [durationInFrames - music.fadeOutSec * fps, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />
      ) : null}
      {/* Unused frame var keeps the composition re-rendering per frame in Studio scrubbing. */}
      <span style={{ display: 'none' }}>{frame}</span>
    </AbsoluteFill>
  );
};

export { GradientFrame };
