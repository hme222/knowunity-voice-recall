import { Button } from '../Button/Button'
import styles from './ConfidenceAsk.module.css'

// "How sure are you?" — the Design Brief's own test, in one place. History: docs/code-history.md#h-103

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
