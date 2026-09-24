'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DueSignalCard, SwipeChip, SwipeDeck, SwipeDots } from '@/components'
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
      <>
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
              {/* The swipe is real now. It was a tertiary button reading "Swipe to the
                  next due quiz" — a control that told the student to swipe and then
                  required a tap, with the card itself inert to a drag. */}
              <SwipeDeck
                active={active}
                total={DUE_QUIZZES.length}
                onChange={setActive}
                label="Quizzes due"
                className={styles.deck}
              >
                <SwipeChip
                  due
                  QuizLabel={`${quiz.term} · due ${quiz.due}`}
                  Count={dueCountLabel(active)}
                  onClick={() => router.push('/session/intro')}
                />
                {/* The dots ARE the non-gesture way through, so the swipe is not the
                    only route and nothing on screen describes a gesture it is not. The
                    full-width "Swipe to the next due quiz" button they replace was a
                    third way to do one thing and did not fit — the region's overflow
                    fade cut it in half. */}
                <SwipeDots
                  active={active + 1}
                  total={DUE_QUIZZES.length}
                  onSelect={(n) => setActive(n - 1)}
                  label="Quiz due"
                />
              </SwipeDeck>
            </>
          )}
        </div>

        {/* Tools, composer and tab bar are HomeShell's.

            The always-present chip. The card above is a layer on top of it, and a
            student who ignores the deadline can still start from here. */}
        <SwipeChip onClick={() => router.push('/picker')} />
      </>
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
