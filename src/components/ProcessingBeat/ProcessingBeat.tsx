import type { ReactNode } from 'react'
import { MascotSlot } from '../MascotSlot/MascotSlot'
import styles from './ProcessingBeat.module.css'

// The wait, wherever it happens. History: docs/code-history.md#h-107

export type ProcessingBeatProps = {
  /** The status copy. Announced politely; it is the only thing here a reader needs. */
  line: string
  /** Anything that belongs above the mascot — DD 03 puts its coverage meter here. */
  above?: ReactNode
  /** Which Knowie. Every wait uses `determined`; the prop exists so it is a choice. */
  expression?: 'dazed' | 'determined' | 'excited' | 'laughing'
  /**
   * False while the screen waits on the STUDENT, not the judge — the typed checking
   * beat's confidence ask. The dots said "working" over a question (craft critic,
   * 2026-10-13). Default true.
   */
  working?: boolean
  className?: string
}

export function ProcessingBeat({ line, above, expression = 'determined', working = true, className }: ProcessingBeatProps) {
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
        {working && (
          <div className={styles.dots} aria-hidden="true">
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        )}
      </div>
    </div>
  )
}
