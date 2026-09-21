'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, DueSignalCard, SwipeChip, SwipeDots } from '@/components'
import { DUE_QUIZZES, dueCountLabel } from '@/lib/session'
import { HomeShell } from '../HomeShell'
import styles from '../home.module.css'

// Home, plan active — Figma frames "Home due-signal — priority card, quiz due date
// (chosen)" (15675:44721) and swipes 2 and 3.
//
// The chip and the due-signal are not competing directions; they are two states of one
// feature, gated on whether the student has a plan. The card is a reminder layer on
// top of the chip, never a replacement — so the chip is present here too.
//
// Swiping is real rather than three separate routes: the built frames are three states
// of one carousel, and three routes would have implied three screens.

function DueHome() {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const quiz = DUE_QUIZZES[active]

  return (
    <HomeShell>
      <div className={styles.composer}>
        <div className={styles.due}>
          {/* One quiz due needs no pager, which is the case DueSignalCard was built
              for. With several, the swipeable chips supersede it. */}
          {DUE_QUIZZES.length === 1 ? (
            <DueSignalCard
              DueLabel={`Quiz due ${quiz.due}`}
              onClick={() => router.push('/session/intro')}
            />
          ) : (
            <>
          <SwipeChip
            due
            QuizLabel={`${quiz.term} · due ${quiz.due}`}
            Count={dueCountLabel(active)}
            onClick={() => router.push('/session/intro')}
          />
          <SwipeDots active={active + 1} total={DUE_QUIZZES.length} />
          <Button
            CTA="Swipe to the next due quiz"
            variant="Tertiary"
            size="S"
            fullWidth
            onClick={() => setActive((a) => (a + 1) % DUE_QUIZZES.length)}
          />
            </>
          )}
        </div>

        <div className={styles.chipRow}>
          {['Scan', 'Summarize', 'Flashcards', 'Quiz'].map((tool) => (
            <Button key={tool} CTA={tool} variant="Secondary" size="S" />
          ))}
        </div>
        {/* The always-present chip. The card above is a layer on top of it, and a
            student who ignores the deadline can still start from here. */}
        <SwipeChip onClick={() => router.push('/picker')} />
      </div>
    </HomeShell>
  )
}

export default function DueHomePage() {
  return (
    <Suspense fallback={null}>
      <DueHome />
    </Suspense>
  )
}
