import type { ReactNode } from 'react'
import styles from './RecallResultCaptured.module.css'

// Mirrors Figma's `recallResult/Captured` (15782:13076) — a sibling of the
// `recallResult` set rather than a state of it, which is why it isn't a fourth
// RecallResult state: nothing has been judged yet, so there is no verdict to show.
//
// It is the review beat. The transcript is shown BEFORE judging, so a misheard answer
// reads as "the app misheard me" rather than "I failed" — voice-ux Principle 4, given
// its own screen.
//
// Promoted from an inline card on 02a Captured when the drill's DD 02a became a second
// consumer. See component-gaps.md.

export type RecallResultCapturedProps = {
  /** Figma `title`: the line above the transcript. */
  title: string
  /** Figma `transcript`: what the student said. Quotation marks are added here. */
  transcript: string
  /** The retry affordance, normally a Coral `Chips`. */
  tag?: ReactNode
  /** The eyebrow over the transcript. */
  label?: string
  className?: string
}

export function RecallResultCaptured({
  title,
  transcript,
  tag,
  label = 'You said',
  className,
}: RecallResultCapturedProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      {tag && <div className={styles.tag}>{tag}</div>}
      <p className={styles.title}>{title}</p>
      <p className={styles.label}>{label}</p>
      <p className={styles.transcript}>&ldquo;{transcript}&rdquo;</p>
    </div>
  )
}
