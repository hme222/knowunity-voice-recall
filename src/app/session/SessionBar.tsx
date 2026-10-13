'use client'

import { useRouter } from 'next/navigation'
import { AppBar, ProgressIndicator, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { goToExit } from '@/lib/navigation'
import { getTerm, progressFor, SUBJECT, TOTAL_TERMS, useSession } from '@/lib/session'

// The session's top bar, in one place. History: docs/code-history.md#h-046

export function SessionBar({
  index,
  onSkip,
  skipLabel = 'Skip',
  label,
  door,
}: {
  /** The term, 1-based. 0 before the first one. */
  index: number
  /** Present when the screen offers Skip; it renders top right. */
  onSkip?: () => void
  /** The top-right label, "Skip" unless the action is really moving on. */
  skipLabel?: string
  /** Replaces the default line, for a stretch outside the numbering, e.g. a practice round. */
  label?: string
  /**
   * The door a run came through. A door run is one question, not term N of 4, so the
   * line names only the subject: "Chemistry" (designer, 2026-10-12; it read "Chemistry
   * quiz · out loud" for a day).
   */
  door?: string | null
}) {
  // The subject rides every session screen (designer, 2026-10-11): going from a Chemistry quiz into Say It Back, nothing said it was still Chemistry, now out loud. History: docs/code-history.md#h-047
  const state = useSession()
  const doorRun = door ?? state.door
  const practiceLabel = state.practising ? `Practice \u00b7 ${getTerm(index)?.name ?? SUBJECT}` : undefined
  const line =
    label ??
    practiceLabel ??
    (doorRun
      ? SUBJECT
      : `${SUBJECT} \u00b7 ${index}/${TOTAL_TERMS}${index === TOTAL_TERMS ? ' \u00b7 last one' : ''}`)
  const router = useRouter()
  // The screen's h1, for screen readers: which question this is. Visible titles live in
  // ChatBubble and RecallResult, which are not headings.
  const termName = getTerm(index)?.name
  const heading = !termName
    ? label ? `Say It Back: ${label}` : 'Say It Back'
    : state.practising
      ? `Practice: ${termName}`
      : doorRun
        ? `${SUBJECT}: ${termName}`
        : `${termName}, question ${index} of ${TOTAL_TERMS}`
  return (
    <>
      <h1 className="srOnly">{heading}</h1>
      <AppBar
        variant={onSkip ? 'leftAndRightButton' : 'leftIconButtonOnly'}
        leftIcon={<CloseIcon />}
        leftLabel="Leave"
        onLeft={() => goToExit(router)}
        rightText={skipLabel}
        onRightText={onSkip}
      >
        <ProgressIndicator progress={progressFor(index)} thickness="16" label="Questions" current={index} total={TOTAL_TERMS} />
      </AppBar>
      <SessionFraction label={line} />
    </>
  )
}
