import type { ReactNode } from 'react'
import { MascotSlot } from '../MascotSlot/MascotSlot'
import styles from './ProcessingBeat.module.css'

// The wait, wherever it happens.
//
// There were three of these and they were designed three different ways: 03 Processing
// kept the app bar and showed three dots at mascot y=308; DD 03 pinned the meter to the
// top with no dots at y=416; the typed checking beat dropped the app bar entirely at
// y=358, so the chrome blinked for one screen mid-flow. Same job, three shapes.
//
// One composition now. The mascot sits at one height, breathes as the "still working"
// signal, and the dots are the same dots. What differs between the three is CONTENT —
// a status line, an optional thing above it (the drill's coverage meter), and whatever
// the screen puts in its action zone — not the shape of the wait itself.
//
// Knowie breathing rather than a spinner is deliberate: the wait needs somewhere to
// live that isn't a dead indicator (SPEC.md § Conventions, docs/voice-ux.md Principle
// 6). Both the breathe and the dots stop under prefers-reduced-motion, where the line
// carries the state on its own.

export type ProcessingBeatProps = {
  /** The status copy. Announced politely; it is the only thing here a reader needs. */
  line: string
  /** Anything that belongs above the mascot — DD 03 puts its coverage meter here. */
  above?: ReactNode
  /** Which Knowie. Every wait uses `determined`; the prop exists so it is a choice. */
  expression?: 'dazed' | 'determined' | 'excited' | 'laughing'
  className?: string
}

export function ProcessingBeat({ line, above, expression = 'determined', className }: ProcessingBeatProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {above ? <div className={styles.above}>{above}</div> : null}
      <div className={styles.centre}>
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression={expression} />
        </div>
        <p className={styles.line} role="status" aria-live="polite">
          {line}
        </p>
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    </div>
  )
}
