import type { ReactNode } from 'react'
import { Chips } from '../Chips/Chips'
import { RetryIcon } from '../icons'
import styles from './RecallResult.module.css'

// Mirrors the Figma component set `recallResult` (15657:10978).

// `Neutral` added 2026-09-21 for the drill (DD 07, 15782:12362): an ungraded miss in
// practice. background.surface and a text.primary title, otherwise the Pass/Miss card.
// Miss paints feedback.error, which dresses a practice stumble as a scored error.
export const RECALL_RESULT_STATES = ['Pass', 'Miss', 'CouldntHear', 'Neutral'] as const
export type RecallResultState = (typeof RECALL_RESULT_STATES)[number]

// The small label above the transcript, per Figma variant.
const LABELS: Record<RecallResultState, string> = {
  Pass: 'You said',
  Miss: 'You said',
  // Was "Try explaining", which read as "your explanation was wrong, explain better".
  // CouldntHear is the app's failure, not the student's (designer, 2026-10-08).
  CouldntHear: 'Not a wrong answer',
  Neutral: 'You said',
}

export type RecallResultProps = {
  /** Figma `state`. `Neutral` is the ungraded card the drill uses. */
  state?: RecallResultState
  /** Figma `title`: the verdict line, or Knowie's specific feedback on a Miss. */
  title: string
  /** Figma `transcript`: what the student said (Pass/Miss), or the prompt to retry (CouldntHear). */
  transcript: string
  /**
   * Show the label and transcript under the title (default true). Off on a second
   * Miss, where the student has just heard their own take and the hint is what they
   * need on screen without scrolling (designer, 2026-10-08).
   */
  showTranscript?: boolean
  /**
   * The eyebrow over the transcript, when the state's default is wrong for the take:
   * "You wrote" on a typed answer, which "You said" misdescribed (UX critic, 2026-10-13).
   */
  label?: string
  /**
   * The verdict chip's words, announced inside this card's live region. The chip sits
   * outside the region, so a screen reader heard the card and never "Partially right"
   * (UX critic, 2026-10-13). Pass the chip's text and hide the chip from readers.
   */
  verdict?: string
  /**
   * Stage the payoff: the title lands with the card, and the label and transcript rise
   * `motion.semantic.duration.proofDelay` later, as the proof (04 Pass; designer,
   * 2026-10-13). Set it false to show everything at once — a tap does that. Nothing
   * moves under reduced motion.
   */
  stagger?: boolean
  /** Tap on the CouldntHear retry tag. */
  onRetry?: () => void
  /**
   * A footer row at the foot of the card, under the transcript: the Pass card's
   * PassNotches (designer, 2026-10-14). Added in code, not yet in the Figma set.
   */
  footer?: ReactNode
  className?: string
}

export function RecallResult({ state = 'Pass', title, transcript, showTranscript = true, label, verdict, stagger = false, onRetry, footer, className }: RecallResultProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-state={state} data-stagger={stagger || undefined} role="status">
      {/* Only with somewhere to go. Drawn without `onRetry` it was a filled pill that
          looked like a button and did nothing (senior review, 2026-10-12); a screen
          whose mic is the retry labels the mic instead. */}
      {state === 'CouldntHear' && onRetry && (
        // "Say it again" in Primary, not "Try again" in Coral: coral is the error colour
        // and "try again" is what you say after a wrong answer. This screen means the mic
        // missed it (designer, 2026-10-08).
        <Chips size="S" color="Primary" active Text="Say it again" leftIcon={<RetryIcon />} showRightIcon={false} onClick={onRetry} />
      )}
      <p className={styles.title}>
        {verdict && <span className="srOnly">{`${verdict}. `}</span>}
        {title}
      </p>
      {showTranscript && (
        <>
          <p className={styles.label}>{label ?? LABELS[state]}</p>
          <p className={styles.body}>{transcript}</p>
        </>
      )}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
