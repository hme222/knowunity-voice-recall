import { Button } from '../Button/Button'
import styles from './ConfidenceAsk.module.css'

// "How sure are you?" — the Design Brief's own test, in one place. History: docs/code-history.md#h-103

export type ConfidenceAskProps = {
  /** Called with the student's answer. */
  onAnswer: (sure: boolean) => void
  /** The question. Defaults to the frame's copy. */
  prompt?: string
  /**
   * The optional way past without answering — "Just check it" — on the ask's own line,
   * beside the question it declines. Omit it and the ask has no exit of its own. It
   * sat in the content region above the zone and read as unrelated to the pair (craft
   * critic, 2026-10-13).
   */
  onDecline?: () => void
  /** The decline label. Not "Skip", which skips the term everywhere else. */
  declineLabel?: string
  className?: string
}

export function ConfidenceAsk({ onAnswer, prompt = 'How sure are you?', onDecline, declineLabel = 'Just check it', className }: ConfidenceAskProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {/* With a decline, the ask and its decline share one line, so the whole thing
          stays inside the 136 action zone: a third row under the pair ran 16px past it. */}
      {onDecline ? (
        <div className={styles.askRow}>
          <p className={styles.ask}>{prompt}</p>
          <Button CTA={declineLabel} variant="Tertiary" size="S" onClick={onDecline} />
        </div>
      ) : (
        <p className={styles.ask}>{prompt}</p>
      )}
      <div className={styles.pair}>
        <Button CTA="Sure" variant="Secondary" size="M" fullWidth onClick={() => onAnswer(true)} />
        <Button CTA="Not sure" variant="Secondary" size="M" fullWidth onClick={() => onAnswer(false)} />
      </div>
    </div>
  )
}
