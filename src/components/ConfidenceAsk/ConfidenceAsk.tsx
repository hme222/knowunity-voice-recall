import { useId } from 'react'
import { Button } from '../Button/Button'
import { CheckIcon } from '../icons'
import styles from './ConfidenceAsk.module.css'

// "How sure are you?" — the Design Brief's own test, in one place. History: docs/code-history.md#h-103

export type ConfidenceAskProps = {
  /** Called with the student's answer. Unused in toggle mode (`onChange`). */
  onAnswer?: (sure: boolean) => void
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
  /**
   * Optional toggle mode, as on 02a Captured and the typed check: the ask is a choice
   * the student may leave blank, read when they confirm the take. `value` is the current
   * pick (undefined = none) and `onChange` gets the new one; tapping the picked button
   * again clears it. The picked one wears the app's "chosen" look (highlight surface,
   * highlight border, a check), never Primary (designer, 2026-10-14: the small chips
   * this replaces "don't match the aesthetic").
   */
  value?: boolean
  onChange?: (sure: boolean | undefined) => void
  className?: string
}

export function ConfidenceAsk({ onAnswer, prompt = 'How sure are you?', onDecline, declineLabel = 'Just check it', value, onChange, className }: ConfidenceAskProps) {
  const askId = useId()
  if (onChange) {
    const pick = (sure: boolean) => onChange(value === sure ? undefined : sure)
    const choice = (sure: boolean, CTA: string) => (
      <Button
        CTA={CTA}
        variant="Secondary"
        // S, at hint scale: an optional aside, not a second answer to the screen
        // (designer, 2026-10-14: "should feel like hint size").
        size="S"
        aria-pressed={value === sure}
        showLeftIcon={value === sure}
        leftIcon={<CheckIcon />}
        onClick={() => pick(sure)}
      />
    )
    return (
      <div className={[styles.root, className].filter(Boolean).join(' ')} role="group" aria-labelledby={askId}>
        <p className={styles.askInline}>
          <span id={askId} className={styles.askQuiet}>{prompt}</span>
          <span className={styles.optional}>Optional</span>
        </p>
        <div className={styles.pair} data-toggle>
          {choice(true, 'Sure')}
          {choice(false, 'Not sure')}
        </div>
      </div>
    )
  }
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
        <Button CTA="Sure" variant="Secondary" size="M" fullWidth onClick={() => onAnswer?.(true)} />
        <Button CTA="Not sure" variant="Secondary" size="M" fullWidth onClick={() => onAnswer?.(false)} />
      </div>
    </div>
  )
}
