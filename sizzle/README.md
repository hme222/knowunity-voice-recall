# Say It Back sizzle reel

A 40-second, 16:9 (1920×1080, 30 fps) design-sprint demo video of the real prototype, built with Remotion. Everything here is free and self-contained: this folder has its own `package.json` and adds nothing to the app's dependencies.

```
sizzle/
├── capture/record.mjs     Playwright script that films the prototype (4 takes: picker→correct answer, mishear, half-right miss, Recap→rematch deck)
├── capture/cursor.js      the drawn macOS cursor + recording-only text swaps
├── public/clips/          take-A…D.mp4 (1170×2532) + clicks.json (where and when each tap happened)
├── public/knowie/         mascot SVGs, copied from the app
├── public/fonts/greed.ttf the UI font, copied from the app
├── src/config.ts          ← every color, word, asset and shot timing/camera lives here
├── src/components/        GradientFrame, PhoneScreen, Camera3D, MascotIntro, MascotWipe, EndCard, Caption
├── scripts/stills.mjs     renders review frames to out/stills/
└── out/sizzle.mp4         the render
```

## Setup (once)

```bash
cd sizzle
npm install
```

Remotion downloads its own headless Chrome on first render unless `REMOTION_BROWSER` points at one (Playwright's cached `chrome-headless-shell` works). Recording uses Remotion's bundled ffmpeg from `node_modules/@remotion/compositor-*`, so no system install is needed; set `FFMPEG` to use another. If the recorder's Playwright wants a browser that isn't installed, point `CHROME_PATH` at an installed Chromium.

## Edit `src/config.ts`

- **Words:** `text.title`, `text.tagline`, `text.subline`, `text.name` (empty hides it).
- **Colors:** `colors`, including the four-stop `border` gradient. They match `tokens/tokens.json`.
- **Music:** put a royalty-free track in `public/music/` and set `music.src`, e.g. `'music/track.mp3'`. It fades out over the last 1.5 s.
- **Captions:** a shot's `caption` is one line naming the design decision it shows, set left of the phone; captioned shots sit the phone right of centre (`captionPhoneCenter`).
- **Shots:** each entry in `shots` has a `take`, a `from` time in that take, a `dur`, and camera keys in `cam`.
  - Camera `x`, `y` are CSS px on the 390×844 screen. `zoom: 1` shows the whole phone. `rx`, `ry` and `rz` are tilt angles in degrees.
  - A key with `click: 'Sure'` snaps to that tap's time and position from `clicks.json`, so push-ins land on what the cursor taps. `lead: -0.8` starts the move 0.8 s before the tap.
  - `feel: 'glide'` is smooth; `'punch'` overshoots slightly.
- **Wipes:** `wipesAfter` lists the shots a Knowie wipe follows. `wipe` sets its timing.
- **Frame style:** `deviceFrame: 'none'` shows a bare screen instead of the thin rounded rim.

## Preview

```bash
npx remotion studio
```

This opens the Studio in your browser. Scrub the timeline, and edits to `config.ts` reload live.

## Re-record the footage

Re-record whenever the prototype changes:

```bash
npm run record                        # builds the app if needed, serves it on :3100, records 4 takes
BASE_URL=https://your-site npm run record   # or record a deployed copy
BASE_URL=http://localhost:3000 npm run record   # or the running dev server (its dev badge is hidden)
GREETING_NAME=Harry npm run record    # change the name swapped into the home greeting
```

After re-recording, check `public/clips/clicks.json`. Tap times can shift by a few hundredths of a second. Shots pinned to clicks follow automatically, but shots that end right after a tap may need their `dur` nudged.

The prototype has no speech recognition: how long the script holds the mic decides the result. Under 2 s gives "couldn't hear", 2 to 5 s a miss, and 5 s or more a pass. The hold times are set at the top of `record.mjs`.

## Check, then render

```bash
npm run stills      # key frames → out/stills/ (update the times in scripts/stills.mjs if you retime shots)
npm run render      # → out/sizzle.mp4, H.264
```

A full render takes about 6 minutes on a laptop-class machine.
