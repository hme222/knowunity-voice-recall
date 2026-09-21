'use client'

import { useRouter } from 'next/navigation'
import {
  actionRowClass,
  AppBar,
  Button,
  ChatBubble,
  MascotSlot,
  MicButton,
  ProgressIndicator,
  ScreenShell,
} from '@/components'
import { proveItHref } from '../doors'
import styles from '../door.module.css'

// Door 2, the exam plan — Figma frame "Exam plan (placeholder — existing door,
// refreshed)" (15672:23959). A step inside a plan the student already has, so Knowie
// asks in a bubble rather than announcing a feature.
//
// The frame marks this a placeholder: the plan around it is the real app's and is not
// ours to reproduce. What is real is the door itself and where it leads.

export default function ExamPlanDoor() {
  const router = useRouter()

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftLabel="Back" onLeft={() => router.push('/')}>
          <ProgressIndicator progress="25" thickness="16" label="Plan steps" current={1} total={4} />
        </AppBar>
      }
      bottomContent={
        <div className={actionRowClass}>
          <Button
            CTA="Type instead"
            variant="Secondary"
            size="M"
            onClick={() => router.push('/text/turn?term=1')}
          />
          <Button CTA="Skip" variant="Tertiary" size="M" onClick={() => router.push('/home/unlock')} />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.content}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <ChatBubble body="Let's test your understanding of organic foundations with some active-recall. To begin, please explain the concept of formal charge and the formula used to calculate it for an atom in a molecule." />
        <div className={styles.micZone}>
          <p className={styles.caption}>Tap to answer</p>
          <MicButton state="Idle" onClick={() => router.push(proveItHref('exam-plan'))} />
          <Button
            CTA="Skip question"
            variant="Tertiary"
            size="S"
            onClick={() => router.push('/home/unlock')}
          />
        </div>
      </div>
    </ScreenShell>
  )
}
