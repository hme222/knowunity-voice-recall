'use client'

import { useRouter } from 'next/navigation'
import { AppBar, MascotSlot, ProgressIndicator, RecallResult, ScreenShell, Button } from '@/components'
import { getTerm } from '@/lib/session'
import styles from '../../door.module.css'

// Door 1's result — Figma frame "Prove It Again — term result" (15672:19827).
//
// The one-term version of 04 Pass: same card, same echoed transcript, but no session
// fraction and no XP line, because a door run is not a session. Continue goes to the
// reveal, which is the first time home has ever shown the feature.

export default function QuizDoorResult() {
  const router = useRouter()
  const current = getTerm(1)

  if (!current) {
    router.replace('/door/quiz')
    return null
  }

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftLabel="Back" onLeft={() => router.push('/door/quiz')}>
          <ProgressIndicator progress="25" thickness="16" label="Quiz" current={1} total={4} />
        </AppBar>
      }
      bottomContent={
        <div className={styles.centredAction}>
          {/* The frame centres this rather than filling the width: one term proved is
              not a session ending, so it does not get a full-width primary. */}
          <Button CTA="Continue" variant="Primary" size="M" onClick={() => router.push('/home/unlock')} />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.content}>
          <MascotSlot size="2XL" expression="excited" />
        </div>
        <RecallResult state="Pass" title={current.passTitle} transcript={`“${current.transcript}”`} />
      </div>
    </ScreenShell>
  )
}
