// Everything you'd want to tweak lives here: colors, words, assets, and every
// shot's timing and camera. Components read from this file and nothing else.
//
// Units: seconds for time. Camera focus (x, y) is in CSS px on the 390x844 phone
// screen, the same space the click log uses. zoom 1 = the whole phone in frame.
// rx/ry/rz are degrees (rx tips the top away, ry turns it sideways, rz spins it).

export type CamKey = {
  /** Seconds from the start of the shot. Or snap to a logged click instead: */
  t?: number;
  /** "Sure", "Looks right"… a label from clicks.json. Uses that click's time and position. */
  click?: string;
  /** Seconds before (-) or after (+) the click to start this move. */
  lead?: number;
  x?: number;
  y?: number;
  zoom?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  /** "glide" = smooth, no overshoot. "punch" = a quicker move that overshoots a touch. */
  feel?: 'glide' | 'punch';
};

export type Shot =
  | { kind: 'intro'; dur: number }
  | { kind: 'end'; dur: number }
  | {
      kind: 'clip';
      /** Which recorded take (A–D in public/clips/clicks.json). */
      take: 'A' | 'B' | 'C' | 'D';
      /** Where in that take this shot starts, in seconds. */
      from: number;
      dur: number;
      /** What the shot is, for your own reference. */
      note: string;
      /** One line on screen naming the design decision the shot shows. */
      caption?: string;
      cam: CamKey[];
    };

export const config = {
  width: 1920,
  height: 1080,
  fps: 30,

  colors: {
    canvas: '#090C18', // color.primitive.navy.950
    page: '#0C0E1E',
    pageGlow: '#1A1C3A',
    knowie: '#9178E6', // color.primitive.homie.inkwell
    knowieDeep: '#7B65E0', // violet.400
    text: '#F4F2FF', // violet.50
    textDim: 'rgba(245,243,255,0.68)', // text.secondary
    accent: '#A78BFA', // violet.300
    /** The frame's gradient border, top-left to bottom-right. */
    border: ['#5FA0FC', '#7B65E0', '#9178E6', '#D2CCFA'],
  },

  font: { family: 'Greed', file: 'fonts/greed.ttf', fallback: 'Inter, system-ui, sans-serif' },

  text: {
    introTitle: 'Say It Back',
    title: 'Say It Back',
    tagline: 'Explain it. Prove it stuck.',
    subline: 'Voice active recall for Knowunity',
    /** Your name on the end card. Leave empty to hide it. */
    name: '',
  },

  /** Replaces "Harry" in the home greeting, in the recording only. Mirrored in
   *  capture/record.mjs (GREETING_NAME); re-record after changing it. */
  greetingName: 'Alex',

  assets: {
    knowieIntro: 'knowie/excited.svg',
    knowieBlink: 'knowie/giggling.svg',
    /** Scaled up around the eyes until the violet body fills the frame. */
    knowieWipe: 'knowie/excited.svg',
    knowieEnd: 'knowie/excited.svg',
    knowieEndBlink: 'knowie/giggling.svg',
  },

  /** Drop a royalty-free track in public/ and set its path, e.g. 'music/track.mp3'. */
  music: { src: null as string | null, volume: 0.8, fadeOutSec: 1.5 },

  screen: { width: 390, height: 844 },
  /** How big the phone sits in the window at zoom 1 (1.1 → 928px tall in a 1080 frame). */
  screenScale: 1.1,
  /** 'subtle' = rounded screen with a thin rim; 'none' = bare screen like Bobby's. */
  deviceFrame: 'subtle' as 'subtle' | 'none',
  perspective: 1700,
  /** On a captioned shot, where the phone's focus sits across the frame (0–1): right of
   *  centre, so the caption has the left third to itself at any zoom. */
  captionPhoneCenter: 0.64,

  wipe: { coverSec: 0.55, holdSec: 0.25, revealSec: 0.55 },

  // ---------------------------------------------------------------------------
  // The cut. Shots play back to back; Knowie wipes cover the cuts listed in `wipesAfter`.
  // Re-cut 2026-10-14 for the design sprint demo, from the prototype as it is now.
  // Take A: picker → question → recording → Captured + Sure → the correct answer.
  // Take B: question 2's scripted mishear. Take C: a half-right miss → the answer.
  // Take D: the Recap → the rematch deck. Positions are CSS px on the 390x844 screen.
  shots: [
    { kind: 'intro', dur: 2.6 },

    { kind: 'clip', take: 'A', from: 0.5, dur: 2.7, note: 'Picker: Knowie and "Start here"', caption: 'Knowie points the way in',
      cam: [
        { t: 0, x: 195, y: 300, zoom: 1.35, rx: 10, ry: -16, rz: -2 },
        { t: 0.05, x: 195, y: 320, zoom: 1.5, rx: 8, ry: -10, feel: 'glide' },
        { click: 'Start here', lead: -0.9, x: 195, y: 335, zoom: 2.2, rx: 12, ry: -14, rz: -2, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'A', from: 3.2, dur: 2.6, note: 'Explain: Formal charge, then the mic', caption: 'Explain it in your own words',
      cam: [
        { t: 0, x: 195, y: 230, zoom: 2.0, rx: 10, ry: 26, rz: -4 },
        { t: 0.05, x: 195, y: 245, zoom: 2.15, ry: 20, feel: 'glide' },
        { click: 'mic', lead: -0.8, x: 195, y: 440, zoom: 1.9, rx: 16, ry: 12, rz: -2, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'A', from: 5.9, dur: 3.4, note: 'Recording: Knowie giggles, then approves', caption: 'Talk it through. Knowie listens.',
      cam: [
        { t: 0, x: 195, y: 330, zoom: 1.7, rx: 36, ry: 0, rz: -18 },
        { t: 0.05, x: 195, y: 320, zoom: 1.85, rx: 28, rz: -12, feel: 'glide' },
        { t: 2.4, x: 195, y: 150, zoom: 2.5, rx: 12, ry: 10, rz: 2, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'A', from: 12.4, dur: 4.4, note: 'Captured: "Here\'s what I heard", Sure, Looks good', caption: 'Check what it heard. Say how sure you are.',
      cam: [
        { t: 0, x: 195, y: 270, zoom: 1.6, rx: 6, ry: -20 },
        { t: 0.05, x: 195, y: 280, zoom: 1.75, ry: -12, rx: 8, feel: 'glide' },
        { click: 'Sure', lead: -0.9, x: 160, y: 390, zoom: 2.4, rx: 16, ry: -8, rz: 2, feel: 'glide' },
        { click: 'Looks good', lead: -0.7, x: 195, y: 560, zoom: 1.8, rx: 10, ry: -4, feel: 'punch' },
      ] },

    { kind: 'clip', take: 'A', from: 18.1, dur: 4.0, note: 'HERO: the correct answer, their words, the notches, +11 XP', caption: 'Their own words are the proof',
      cam: [
        { t: 0, x: 195, y: 330, zoom: 1.7, rx: 30, ry: 0, rz: -14 },
        { t: 0.05, x: 195, y: 350, zoom: 1.9, rx: 22, rz: -8, feel: 'glide' },
        { t: 2.3, x: 230, y: 445, zoom: 2.8, rx: 12, ry: 12, rz: 4, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'B', from: 9.4, dur: 2.8, note: 'Mishear: "I didn\'t catch that. Not a wrong answer."', caption: 'A mishear is never marked wrong',
      cam: [
        { t: 0, x: 195, y: 270, zoom: 2.0, rx: 10, ry: -28, rz: 3 },
        { t: 0.05, x: 195, y: 265, zoom: 2.2, rx: 8, ry: -20, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'C', from: 0.2, dur: 3.9, note: 'Half right: the hint, then Show the answer', caption: 'Half right gets a hint, not a red X',
      cam: [
        { t: 0, x: 195, y: 280, zoom: 1.75, rx: 30, ry: 0, rz: 0 },
        { t: 0.05, x: 195, y: 320, zoom: 1.9, rx: 22, feel: 'glide' },
        { click: 'Show the answer', lead: -0.8, x: 195, y: 520, zoom: 1.7, rx: 14, ry: -14, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'D', from: 0.5, dur: 4.0, note: 'Recap: "Nice work! 3 of 4", New today, the confetti', caption: 'See what stuck',
      cam: [
        { t: 0, x: 195, y: 230, zoom: 2.0, rx: 22, ry: -24, rz: 4 },
        { t: 0.05, x: 195, y: 260, zoom: 1.85, rx: 16, ry: -16, rz: 2, feel: 'glide' },
        { t: 2.4, x: 195, y: 400, zoom: 1.6, rx: 12, ry: -8, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'D', from: 4.4, dur: 3.9, note: 'Rematch deck: Knowie peeks over the card', caption: 'Then win back the misses',
      cam: [
        { t: 0, x: 195, y: 300, zoom: 1.7, rx: 8, ry: 24, rz: -3 },
        { t: 0.05, x: 195, y: 300, zoom: 1.85, rx: 6, ry: 16, feel: 'glide' },
        { t: 1.8, x: 210, y: 300, zoom: 2.3, rx: 10, ry: 8, rz: -2, feel: 'glide' },
      ] },

    { kind: 'end', dur: 5.8 },
  ] as Shot[],

  /** Indexes into `shots`: a Knowie wipe covers the cut AFTER each of these. */
  wipesAfter: [0, 9],
};

export const totalSeconds = () => config.shots.reduce((s, x) => s + x.dur, 0);
