import { Chips } from '../Chips/Chips'
import { RetryIcon } from '../icons'
import styles from './RecallResult.module.css'

// Mirrors the Figma component set `recallResult` (15657:10978).

export const RECALL_RESULT_STATES = ['Pass', 'Miss', 'CouldntHear'] as const
export type RecallResultState = (typeof RECALL_RESULT_STATES)[number]

// The small label above the transcript, per Figma variant.
const LABELS: Record<RecallResultState, string> = { Pass: 'You said', Miss: 'You said', CouldntHear: 'Try explaining' }

export type RecallResultProps = {
  /** Figma `state`. */
  state?: RecallResultState
  /** Figma `title`: the verdict line, or Knowie's specific feedback on a Miss. */
  title: string
  /** Figma `transcript`: what the student said (Pass/Miss), or the prompt to retry (CouldntHear). */
  transcript: string
  /** Tap on the CouldntHear retry tag. */
  onRetry?: () => void
  className?: string
}

export function RecallResult({ state = 'Pass', title, transcript, onRetry, className }: RecallResultProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-state={state} role="status">
      {state === 'CouldntHear' && (
        <Chips size="S" color="Coral" active Text="Try again" leftIcon={<RetryIcon />} showRightIcon={false} onClick={onRetry} />
      )}
      <p className={styles.title}>{title}</p>
      <p className={styles.label}>{LABELS[state]}</p>
      <p className={styles.body}>{transcript}</p>
    </div>
  )
}
