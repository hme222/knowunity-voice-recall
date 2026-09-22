import { Button } from '../Button/Button'
import styles from './ConfidenceAsk.module.css'

// "How sure are you?" — the Design Brief's own test, in one place.
//
// Promoted 2026-09-22 under this repo's two-consumer rule: it was written inline on 03
// Processing and then again on the typed checking beat, and the two had already begun
// to differ. `component-gaps.md` had flagged it as awaiting its second consumer.
//
// Why it blocks the verdict rather than sitting beside it: the tap has to be taken
// BEFORE the outcome is known, or the signal is contaminated by knowing the answer —
// and it costs no extra step because it occupies a wait the design already had to
// cover (docs/sprint-context.md, "Added 2026-09-20").

export type ConfidenceAskProps = {
  /** Called with the student's answer. */
  onAnswer: (sure: boolean) => void
  /** The question. Defaults to the frame's copy. */
  prompt?: string
  className?: string
}

export function ConfidenceAsk({ onAnswer, prompt = 'How sure are you?', className }: ConfidenceAskProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <p className={styles.ask}>{prompt}</p>
      <div className={styles.pair}>
        <Button CTA="Sure" variant="Secondary" size="M" fullWidth onClick={() => onAnswer(true)} />
        <Button CTA="Not sure" variant="Secondary" size="M" fullWidth onClick={() => onAnswer(false)} />
      </div>
    </div>
  )
}
