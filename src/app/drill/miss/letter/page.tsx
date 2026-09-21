'use client'

import { useRouter } from 'next/navigation'
import { Button, HintCard, MascotSlot, MicButton, ScreenShell, StrengthMeter } from '@/components'
import styles from '../../drill.module.css'
import { DrillBar } from '../../DrillBar'

// DD 07b — second stumble on the SAME word. Figma frame "DD 07b Miss — 2nd stumble
// (first letter)" (15810:11025).
//
// The word stays visible with its first letter shown: a prompt, not a giveaway. The
// meter barely moves, because a prompted recall is not an unaided one.
//
// Scaffold state resets per definition, per session — which needs a per-word stumble
// count, unconfirmed with engineering (docs/sprint-context.md open question 8).

export default function DrillLetterPage() {
  const router = useRouter()
  return (
    <ScreenShell
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.actions}>
          <MicButton state="Idle" onClick={() => router.push('/drill/miss/echo')} />
          <Button CTA="Leave the drill" variant="Tertiary" size="M" onClick={() => router.push('/picker')} />
        </div>
      }
    >
      <div className={styles.body}>
        <StrengthMeter fill={28} label="Barely moved — this one was prompted" />
        <MascotSlot size="2XL" expression="determined" />
        <HintCard body="Same word again. It starts with “e” — and it stays on screen this time." />
        <p className={styles.cue}>
          …were shared perfectly <strong>e______</strong> between the two atoms.
        </p>
      </div>
    </ScreenShell>
  )
}
