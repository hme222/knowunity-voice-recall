'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DueSignalCard, SwipeChip, SwipeDeck, SwipeDots } from '@/components'
import { DUE_QUIZZES, dueCountLabel, startRun } from '@/lib/session'
import { HomeShell } from '../HomeShell'
import styles from '../home.module.css'

// Home, plan active — Figma frames "Home due-signal — priority card, quiz due date (chosen)" (15675:44721) and swipes 2 and 3. History: docs/code-history.md#h-027

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
              onClick={() => router.push(startRun())}
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
                  QuizLabel={`${quiz.subject} · ${quiz.term} · due ${quiz.due}`}
                  Count={dueCountLabel(active)}
                  onClick={() => router.push(startRun())}
                />
                {/* The dots ARE the non-gesture way through, so the swipe is not the only route and nothing on screen describes a gesture it is not. History: docs/code-history.md#h-028 */}
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
        {/* One Say It Back, not two (designer, 2026-10-12): with a plan, the due chip —
            subject, term and date — is the entry point, and the tool row does not repeat
            it. This replaces the earlier "card is a layer on top of the chip" rule. */}
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
