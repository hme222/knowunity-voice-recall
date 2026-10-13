'use client'

import { useRouter } from 'next/navigation'
import { Button, SwipeChip } from '@/components'
import { getTerm, startReview, SUBJECT, TOTAL_TERMS, useSession } from '@/lib/session'
import { HomeShell } from '../HomeShell'

// Home, unlocked, no plan — Figma frame "Home — Say It Back chip in composer"
// (15745:15889). The chip sits among Scan / Summarize / Flashcards / Quiz with no
// schedule attached. A student with no plan never sees the due card, so there is no
// mixed message and no competing entry point.

export default function UnlockedHomePage() {
  const router = useRouter()
  const state = useSession()
  // A full session left partway — never a door run, which is one definition and is done
  // when it ends. Offering to resume one looped a term at a time back to the unlock
  // popup (dev review, 2026-10-12).
  const review = state.reviewQueue ?? []
  const partway = !state.door && state.outcomes.length > 0 && state.outcomes.length < TOTAL_TERMS
  return (
    <HomeShell toolChip={<SwipeChip onClick={() => router.push('/picker')} />}>
      <>
        {/* Tools, composer and tab bar are HomeShell's. The chip rides in the tool row. */}
        {/* What came back (2a): the terms missed last time, as the same due chip the
            plan uses, so a student with no exam plan still has a reason to return.
            Tapping it reviews exactly those terms. Not while a run is partway: then
            "Pick up where you left off" is the one thing to offer. */}
        {!partway && review.length > 0 && (
          <SwipeChip
            due
            QuizLabel={`${SUBJECT} · ${getTerm(review[0])?.name} · due tomorrow`}
            Count={review.length > 1 ? `+${review.length - 1}` : undefined}
            onClick={() => router.push(startReview())}
          />
        )}
        {partway && (
          <Button
            CTA="Pick up where you left off"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push('/session/resume')}
          />
        )}
        <Button
          CTA="Add a quiz due date"
          variant="Tertiary"
          size="M"
          fullWidth
          onClick={() => router.push('/home/due')}
        />
      </>
    </HomeShell>
  )
}
