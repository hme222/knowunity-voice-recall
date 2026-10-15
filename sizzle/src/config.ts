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

/** How a shot comes in (and so how the one before it leaves). Default: a straight cut. */
export type Enter = 'cut' | 'zoom' | 'whip';

export type Shot =
  | { kind: 'intro'; dur: number }
  | { kind: 'end'; dur: number }
  | { kind: 'stack'; dur: number; enter?: Enter; cards: { take: 'A' | 'B' | 'C' | 'D'; from: number }[] }
  | { kind: 'faces'; dur: number; enter?: Enter; caption?: string; chapter?: number }
  | {
      kind: 'split';
      dur: number;
      enter?: Enter;
      caption?: string;
      chapter?: number;
      /** Playback speed for both sides; below 1 stretches short footage. */
      rate?: number;
      left: { take: 'A' | 'B' | 'C' | 'D'; from: number; label: string; color: string };
      right: { take: 'A' | 'B' | 'C' | 'D'; from: number; label: string; color: string };
    }
  | {
      kind: 'clip';
      enter?: Enter;
      /** Which chapter (1-based, `chapters`) the caption labels. */
      chapter?: number;
      /** Which recorded take (A–D in public/clips/clicks.json). */
      take: 'A' | 'B' | 'C' | 'D';
      /** Where in that take this shot starts, in seconds. */
      from: number;
      dur: number;
      /** What the shot is, for your own reference. */
      note: string;
      /** One line on screen naming the design decision the shot shows. */
      caption?: string;
      /** Playback speed: above 1 races through a hold, below 1 is slow motion. */
      rate?: number;
      /** Dim the screen except this box (390x844 px), from `t` for `dur` seconds of shot time. */
      spotlight?: { t: number; dur: number; x: number; y: number; w: number; h: number };
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
  /** The takes' pixel density: capture/record.mjs DSF (3 → 1170x2532 frames). */
  captureScale: 3,
  /** How big the phone sits in the window at zoom 1 (1.1 → 928px tall in a 1080 frame). */
  screenScale: 1.1,
  /** 'subtle' = rounded screen with a thin rim; 'none' = bare screen like Bobby's. */
  deviceFrame: 'subtle' as 'subtle' | 'none',
  perspective: 1700,
  /** On a captioned shot, where the phone's focus sits across the frame (0–1): right of
   *  centre, so the caption has the left third to itself at any zoom. */
  captionPhoneCenter: 0.64,

  wipe: { coverSec: 0.55, holdSec: 0.25, revealSec: 0.55 },

  /** The story's chapters: the caption's label and accent, the tap ripples' colour.
   *  Accents are the app's own tokens. */
  chapters: [
    { name: 'Ask', accent: '#A78BFA' },     // violet.300
    { name: 'Listen', accent: '#5FA0FC' },  // accent.blue.bold
    { name: 'Prove', accent: '#00C386' },   // feedback.success.bold
    { name: 'Recover', accent: '#F5B53D' }, // feedback.partial.bold
    { name: 'Review', accent: '#E879C0' },  // accent.magenta.bold
  ],

  /** The faces beat: Knowie's faces in the order the flow meets them, each with the
   *  moment it means (design-system.md § Mascot poses). */
  facesBeat: {
    // Seven, one per step of the loop, at an even ~0.6s each (2026-10-15: ten at
    // ~0.35s read as flashing). Every face's label stays below for reuse.
    faces: ['questioning', 'standby', 'giggling', 'excited', 'thinking', 'laughing', 'dazed'],
    subline: 'Knowie\u2019s face changes at every step of the loop: one expression, one meaning, from asking to celebrating.',
    labels: {
      questioning: ['Questioning', 'Which topic? Asking the student'],
      standby: ['Standby', 'Your turn: the question is waiting'],
      giggling: ['Giggling', 'Listening while you talk'],
      approving: ['Approving', 'Nodding along once it counts'],
      excited: ['Excited', 'Caught that: here\u2019s what I heard'],
      thinking: ['Thinking', 'Checking it against the definition'],
      laughing: ['Laughing', 'Nailed it'],
      dazed: ['Dazed', 'The mic missed it, not you'],
      confused: ['Confused', 'A wrong idea to rebuild'],
      sad: ['Sad', 'Not this time: here\u2019s the answer'],
    } as Record<string, [string, string]>,
  },

  // ---------------------------------------------------------------------------
  // The cut. Shots play back to back; Knowie wipes cover the cuts listed in `wipesAfter`.
  // Re-cut 2026-10-14 for the design sprint demo, from the prototype as it is now.
  // Take A: picker → question → recording → Captured + Sure → the correct answer.
  // Take B: question 2's scripted mishear. Take C: a half-right miss → the answer.
  // Take D: the Recap → the rematch deck. Positions are CSS px on the 390x844 screen.
  // Cut 2026-10-15: chapters, tap ripples, a Slant It style 3D stack, a faces beat, a
  // split screen, zoom and whip transitions. Takes filmed at true 3x (see record.mjs).
  // Take A: picker → question → recording → Captured + Sure → the correct answer.
  // Take B: question 2's scripted mishear. Take C: a half-right miss → the answer.
  // Take D: the Recap → the rematch deck. Positions are CSS px on the 390x844 screen.
  shots: [
    { kind: 'intro', dur: 2.4 },

    { kind: 'stack', dur: 3.4, cards: [
      // At a third of normal speed (StackScene), so each screen holds its moment.
      { take: 'A', from: 1.2 }, { take: 'A', from: 8.6 }, { take: 'A', from: 15.0 }, { take: 'A', from: 20.2 }, { take: 'D', from: 2.6 },
    ] },

    // Each captioned shot runs ~0.8s longer than its action needs, so the headline
    // can be read (designer, 2026-10-15); short footage plays a little slower instead.
    { kind: 'clip', take: 'A', from: 0.0, dur: 3.5, enter: 'zoom', chapter: 1, note: 'Picker: Knowie and "Start here"', caption: 'Knowie points the way in',
      cam: [
        { t: 0, x: 195, y: 330, zoom: 1.35, rx: 10, ry: -16, rz: -2 },
        { t: 0.05, x: 195, y: 350, zoom: 1.5, rx: 8, ry: -10, feel: 'glide' },
        { click: 'Start here', lead: -0.9, zoom: 2.2, rx: 12, ry: -14, rz: -2, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'A', from: 3.0, dur: 3.4, chapter: 1, note: 'Explain: Formal charge, then the mic', caption: 'Explain it in your own words',
      cam: [
        { t: 0, x: 195, y: 260, zoom: 2.0, rx: 10, ry: 26, rz: -4 },
        { t: 0.05, x: 195, y: 275, zoom: 2.15, ry: 20, feel: 'glide' },
        { click: 'mic', lead: -0.8, zoom: 1.9, rx: 16, ry: 12, rz: -2, feel: 'glide' },
      ] },

    // At 1.4x: nearly six seconds of a held mic in about four, the timer racing and Knowie
    // turning from giggling to approving inside the shot.
    { kind: 'clip', take: 'A', from: 6.2, dur: 4.2, rate: 1.4, chapter: 2, note: 'Recording: Knowie giggles, then approves', caption: 'Talk it through. Knowie listens.',
      cam: [
        { t: 0, x: 195, y: 420, zoom: 1.7, rx: 36, ry: 0, rz: -18 },
        { t: 0.05, x: 195, y: 410, zoom: 1.85, rx: 28, rz: -12, feel: 'glide' },
        { t: 2.3, x: 195, y: 150, zoom: 2.5, rx: 12, ry: 10, rz: 2, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'A', from: 12.4, dur: 5.4, chapter: 2, note: 'Captured: "Here\'s what I heard", Sure, Looks good', caption: 'Check what it heard. Say how sure you are.',
      cam: [
        { t: 0, x: 195, y: 280, zoom: 1.6, rx: 6, ry: -20 },
        { t: 0.05, x: 195, y: 290, zoom: 1.75, ry: -12, rx: 8, feel: 'glide' },
        { click: 'Sure', lead: -0.9, x: 150, y: 450, zoom: 2.4, rx: 16, ry: -8, rz: 2, feel: 'glide' },
        { click: 'Looks good', lead: -0.7, x: 195, y: 600, zoom: 1.8, rx: 10, ry: -4, feel: 'punch' },
      ] },

    // Slow motion (0.75x) on the payoff, then a spotlight on the strength notches and
    // "+11 XP" and its sentence (measured on the live screen: y 488–624).
    { kind: 'clip', take: 'A', from: 18.4, dur: 5.2, rate: 0.75, enter: 'whip', chapter: 3, note: 'HERO: the correct answer, their words, the notches, +11 XP', caption: 'Their own words are the proof',
      spotlight: { t: 2.5, dur: 2.5, x: 16, y: 488, w: 358, h: 136 },
      cam: [
        { t: 0, x: 195, y: 360, zoom: 1.7, rx: 30, ry: 0, rz: -14 },
        { t: 0.05, x: 195, y: 400, zoom: 1.9, rx: 22, rz: -8, feel: 'glide' },
        { t: 2.0, x: 200, y: 530, zoom: 2.5, rx: 12, ry: 10, rz: 3, feel: 'glide' },
      ] },

    // Centred, its own headline and explanation (FacesBeat), then the faces in turn.
    // Hold ~1s, seven faces at 0.5s, then the lineup holds (FacesBeat).
    { kind: 'faces', dur: 6.8, enter: 'zoom' },

    { kind: 'split', dur: 3.3, rate: 0.8, enter: 'zoom', chapter: 4, caption: 'Two kinds of wrong. Two kinds of help.',
      left: { take: 'B', from: 9.5, label: 'Mic missed it', color: '#E879C0' },
      right: { take: 'C', from: 0.0, label: 'Half right', color: '#F5B53D' } },

    { kind: 'clip', take: 'D', from: 0.0, dur: 4.6, enter: 'zoom', chapter: 5, note: 'Recap: "Nice work! 3 of 4", New today, the confetti', caption: 'See what stuck',
      cam: [
        { t: 0, x: 195, y: 230, zoom: 2.0, rx: 22, ry: -24, rz: 4 },
        { t: 0.05, x: 195, y: 260, zoom: 1.85, rx: 16, ry: -16, rz: 2, feel: 'glide' },
        { t: 2.4, x: 195, y: 400, zoom: 1.6, rx: 12, ry: -8, feel: 'glide' },
      ] },

    { kind: 'clip', take: 'D', from: 4.5, dur: 4.4, rate: 0.85, enter: 'whip', chapter: 5, note: 'Rematch deck: Knowie peeks over the card', caption: 'Then win back the misses',
      cam: [
        { t: 0, x: 195, y: 300, zoom: 1.7, rx: 8, ry: 24, rz: -3 },
        { t: 0.05, x: 195, y: 300, zoom: 1.85, rx: 6, ry: 16, feel: 'glide' },
        { t: 1.8, x: 210, y: 300, zoom: 2.3, rx: 10, ry: 8, rz: -2, feel: 'glide' },
      ] },

    { kind: 'end', dur: 5.6 },
  ] as Shot[],

  /** Indexes into `shots`: a Knowie wipe covers the cut AFTER each of these. */
  wipesAfter: [0, 10],
};

export const totalSeconds = () => config.shots.reduce((s, x) => s + x.dur, 0);
