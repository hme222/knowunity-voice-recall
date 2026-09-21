'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, MicButton, ScreenShell, StrengthMeter } from '@/components'
import styles from '../../drill.module.css'
import { DrillBar } from '../../DrillBar'

// DD 07c — third stumble, echo. Figma frame "DD 07c Miss — 3rd stumble (echo)"
// (15810:11151).
//
// The task bends until it is always completable: Knowie gives the word, the student
// repeats it. THE LOOP TERMINATES HERE — that is the point of the scaffold. A stuck
// student cannot cycle forever, because the third rung is a task nobody can fail.
//
// Echoing barely fills the meter, because echoing is not unaided recall. That is the
// honest trade: the student always gets out, and the meter never lies about how.

export default function DrillEchoPage() {
  const router = useRouter()
  return (
    <ScreenShell
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.actions}>
          <MicButton state="Idle" label="Say it with me" onClick={() => router.push('/drill/pass/3')} />
          <Button CTA="Leave the drill" variant="Tertiary" size="M" onClick={() => router.push('/picker')} />
        </div>
      }
    >
      <div className={styles.centred}>
        <StrengthMeter fill={30} label="Echoing isn't unaided — but it gets you moving" />
        <MascotSlot size="2XL" expression="laughing" />
        <p className={styles.note}>Say it with me.</p>
        <p className={styles.echoWord}>evenly</p>
        <p className={styles.note}>Just that word, then take the whole line again.</p>
      </div>
    </ScreenShell>
  )
}
