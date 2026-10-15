import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { cameraAt, clickInTake, resolveKeys } from './camera';
import { config, Enter, Shot } from './config';
import { Camera3D } from './components/Camera3D';
import { Caption } from './components/Caption';
import { EndCard } from './components/EndCard';
import { FacesBeat } from './components/FacesBeat';
import { GradientFrame } from './components/GradientFrame';
import { MascotIntro } from './components/MascotIntro';
import { MascotWipe, wipeFrames } from './components/MascotWipe';
import { PhoneScreen } from './components/PhoneScreen';
import { Ripple } from './components/Ripple';
import { Spotlight } from './components/Spotlight';
import { SplitScene } from './components/SplitScene';
import { StackScene } from './components/StackScene';
import clicks from '../public/clips/clicks.json';

type Take = { file: string; clicks: { t: number; x: number; y: number; label: string }[] };
const takes = (clicks as unknown as { takes: Record<string, Take> }).takes;

const ClipShot: React.FC<{ shot: Extract<Shot, { kind: 'clip' }> }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const rate = shot.rate ?? 1;
  const keys = resolveKeys(shot.cam, shot.take, shot.from, rate);
  const accent = shot.chapter ? config.chapters[shot.chapter - 1].accent : config.colors.accent;
  // Every tap the cursor makes inside this shot, as a ripple where it landed.
  const taps = takes[shot.take].clicks.filter((c) => c.t >= shot.from && c.t <= shot.from + shot.dur * rate);
  const sp = shot.spotlight;
  return (
    <Camera3D cam={cameraAt(frame, keys)} centerX={shot.caption ? config.width * config.captionPhoneCenter : undefined}>
      <GradientFrame>
        <PhoneScreen
          file={takes[shot.take].file}
          fromSec={shot.from}
          playbackRate={rate}
          overlay={
            <>
              {sp ? <Spotlight x={sp.x} y={sp.y} w={sp.w} h={sp.h} from={Math.round(sp.t * config.fps)} to={Math.round((sp.t + sp.dur) * config.fps)} color={accent} /> : null}
              {taps.map((c) => (
                <Ripple key={c.label + c.t} x={c.x} y={c.y} at={Math.round(((c.t - shot.from) / rate) * config.fps)} color={accent} />
              ))}
            </>
          }
        />
      </GradientFrame>
    </Camera3D>
  );
};

const T = 9; // transition length, frames

/** Wraps a shot in its entrance and its exit: a zoom-through (scale and fade) or a whip
 *  (a fast sideways slide with motion blur). The exit is the next shot's entrance. */
const Transitioned: React.FC<{ enter?: Enter; exit?: Enter; frames: number; children: React.ReactNode }> = ({ enter, exit, frames, children }) => {
  const f = useCurrentFrame();
  const { width } = config;
  const ein = interpolate(f, [0, T], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const eout = interpolate(f, [frames - T, frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  let tx = 0, scale = 1, opacity = 1, blur = 0;
  if (enter === 'zoom') { scale *= 1 + 0.14 * ein; opacity *= 1 - ein; blur += 14 * ein; }
  if (enter === 'whip') { tx += width * 0.7 * ein; blur += 28 * ein; }
  if (exit === 'zoom') { scale *= 1 - 0.08 * eout; opacity *= 1 - eout; blur += 10 * eout; }
  if (exit === 'whip') { tx -= width * 0.7 * eout; blur += 28 * eout; }
  return (
    <AbsoluteFill style={{ transform: `translateX(${tx}px) scale(${scale})`, opacity, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
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

const files = Object.fromEntries(Object.entries(takes).map(([k, v]) => [k, { file: v.file }]));

const ShotBody: React.FC<{ shot: Shot; frames: number; handoffAt: number }> = ({ shot, frames, handoffAt }) => {
  switch (shot.kind) {
    case 'intro': return <MascotIntro handoffAt={handoffAt} />;
    case 'end': return <EndCard />;
    case 'stack': return <StackScene cards={shot.cards} files={files} durationInFrames={frames} />;
    case 'faces': return <FacesBeat durationInFrames={frames} />;
    case 'split': return <SplitScene left={shot.left} right={shot.right} files={files} rate={shot.rate} />;
    case 'clip': return <ClipShot shot={shot} />;
  }
};

export const Sizzle: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const tl = timeline();
  const { fps, wipe, music } = config;
  const cover = Math.round(wipe.coverSec * fps), hold = Math.round(wipe.holdSec * fps);
  return (
    <AbsoluteFill style={{ background: config.colors.canvas }}>
      {tl.map(({ shot, start, frames }, i) => {
        const enter = 'enter' in shot ? shot.enter : undefined;
        const next = tl[i + 1]?.shot;
        const exit = next && 'enter' in next ? next.enter : undefined;
        const caption = 'caption' in shot ? shot.caption : undefined;
        const chapter = 'chapter' in shot ? shot.chapter : undefined;
        return (
          <Sequence key={i} from={start} durationInFrames={frames} name={shot.kind === 'clip' ? shot.note : shot.kind}>
            <Transitioned enter={enter} exit={exit} frames={frames}>
              <ShotBody shot={shot} frames={frames} handoffAt={frames - cover - Math.floor(hold / 2)} />
            </Transitioned>
            {caption ? <Caption text={caption} durationInFrames={frames} chapter={chapter} /> : null}
          </Sequence>
        );
      })}
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

export { GradientFrame, clickInTake };
