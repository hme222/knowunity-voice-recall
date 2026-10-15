#!/usr/bin/env python3
"""Cuts the music bed for the reel and lays it under the rendered video.

The edit (Night Glow, StudioKolomna, Pixabay Content License):
  - the track plays from its start, so its soft opening sits under the intro, the 3D
    stack and "01 Ask", and its full arrangement kicks in (~0:17) as "02 Listen" begins;
  - shortly before the end card it crossfades, on a bar line, into the song's own ending,
    so the reel ends on the track's real cadence instead of a fade mid-phrase;
  - it dips a little under the faces beat, which carries the most reading.
Then ffmpeg normalises it for social (-16 LUFS) and muxes it without re-encoding video.

  python3 scripts/music.py                   # out/sizzle.mp4 (silent) → out/sizzle.mp4 with music
  python3 scripts/music.py --bed-only        # just out/music-bed.wav, to listen to
Needs numpy. Uses Remotion's bundled ffmpeg.
"""
import glob, os, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TRACK = os.path.join(ROOT, 'public/music/night-glow.mp3')
VIDEO = os.path.join(ROOT, 'out/sizzle.mp4')
SILENT = os.path.join(ROOT, 'out/sizzle-silent.mp4')
BED = os.path.join(ROOT, 'out/music-bed.wav')
SR = 48000

# The reel's timeline, in seconds (src/config.ts).
REEL = 52.2
DROP_TARGET = 16.9                 # "02 Listen · Check what it heard" starts
CROSSFADE_BEFORE = 46.6            # the end card starts; join the ending just before it
DUCK = (27.5, 34.3, -3.0)          # the faces beat, in dB
FADE_OUT = 0.35                    # only a touch: the track's own ending does the work

ff_dir = glob.glob(os.path.join(ROOT, 'node_modules/@remotion/compositor-*/'))[0]
FF = os.path.join(ff_dir, 'ffmpeg')
ENV = {**os.environ, 'DYLD_LIBRARY_PATH': ff_dir, 'LD_LIBRARY_PATH': ff_dir}


def ff(*args):
    subprocess.run([FF, '-y', '-loglevel', 'error', *args], check=True, env=ENV)


def decode(path):
    tmp = os.path.join(ROOT, 'out/.track.wav')
    ff('-i', path, '-ac', '2', '-ar', str(SR), '-f', 'wav', tmp)
    with wave.open(tmp) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    os.remove(tmp)
    return a.reshape(-1, 2)


def onset_envelope(mono, hop=512):
    frames = len(mono) // hop
    e = np.sqrt(np.mean(mono[: frames * hop].reshape(frames, hop) ** 2, axis=1))
    o = np.maximum(0, np.diff(e, prepend=e[0]))
    return o - o.mean(), SR / hop


def tempo(o, fr):
    # Autocorrelation at the beat lag, 100–140 BPM in 0.05 steps.
    ac = np.correlate(o, o, 'full')[len(o) - 1:]
    best = max(np.arange(100, 140, 0.05), key=lambda b: np.interp(60 / b * fr, np.arange(len(ac)), ac))
    return float(best)


def strongest_onset(o, fr, around, width=0.6):
    i0, i1 = int((around - width) * fr), int((around + width) * fr)
    return (i0 + int(np.argmax(o[i0:i1]))) / fr


def main():
    track = decode(TRACK)
    mono = track.mean(axis=1)
    o, fr = onset_envelope(mono)
    bpm = tempo(o, fr)
    bar = 4 * 60 / bpm
    drop = strongest_onset(o, fr, 17.0)        # the full arrangement's first downbeat
    length = len(track) / SR
    # Track time = reel time + offset A for the first part (A chosen so the drop lands
    # near DROP_TARGET but never starts the music late), then + offset B (A plus a whole
    # number of bars) for the ending, so the beat grid runs straight through the join.
    a_off = max(0.0, drop - DROP_TARGET)
    # The cadence: the last moment the track is still within 18 dB of its body, found
    # from the audio (the file runs on into ~2.5s of decaying silence).
    win = int(0.1 * SR)
    lv = 20 * np.log10(np.sqrt(np.mean(mono[: len(mono) // win * win].reshape(-1, win) ** 2, axis=1)) + 1e-9)
    body = np.median(lv)
    end_tail = (np.nonzero(lv > body - 18)[0][-1] + 1) * 0.1 + 0.25
    bars = round((end_tail - REEL - a_off) / bar)
    b_off = a_off + bars * bar
    # The join: the last bar line before the end card.
    n = int((CROSSFADE_BEFORE - 0.5 + a_off - drop) // bar)
    join = drop + n * bar - a_off              # reel time
    xf = 0.5
    print(f'tempo {bpm:.2f} BPM, bar {bar:.3f}s, drop at {drop:.2f}s; start {a_off:.2f}s in; '
          f'join at reel {join:.2f}s → track {join + b_off:.2f}s ({bars} bars on)')

    t = np.arange(int(REEL * SR)) / SR
    def take(offset):
        idx = np.clip(((t + offset) * SR).astype(int), 0, len(track) - 1)
        return track[idx]
    first, second = take(a_off), take(b_off)
    # Equal-power crossfade across the join.
    p = np.clip((t - join) / xf, 0, 1)
    out = first * np.cos(p * np.pi / 2)[:, None] + second * np.sin(p * np.pi / 2)[:, None]

    s, e, db = DUCK
    ramp = 0.6
    g = np.ones_like(t)
    down = np.clip((t - s) / ramp, 0, 1) * np.clip((e - t) / ramp + 1, 0, 1)
    g *= 10 ** ((db * np.minimum(down, 1)) / 20)
    g *= np.clip(t / 0.05, 0, 1)                              # click-free start
    g *= np.clip((REEL - t) / FADE_OUT, 0, 1)                 # a touch at the very end
    out *= g[:, None]

    pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
    with wave.open(BED, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

    if '--bed-only' in sys.argv:
        print('→', os.path.relpath(BED, ROOT)); return 0
    if not os.path.exists(SILENT):
        os.replace(VIDEO, SILENT)
    ff('-i', SILENT, '-i', BED, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
       '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', str(SR),
       '-shortest', '-movflags', '+faststart', VIDEO)
    print('→', os.path.relpath(VIDEO, ROOT))


if __name__ == '__main__':
    sys.exit(main())
