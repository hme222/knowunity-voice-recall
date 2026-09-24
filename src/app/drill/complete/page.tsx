'use client'

import { useRouter } from 'next/navigation'
import { actionRowClass, Button, MascotSlot, RecallResult, ScreenShell, StrengthMeter, TrainingLog } from '@/components'
import { DRILL_TERM } from '@/lib/session'
import styles from '../drill.module.css'

// DD 08 Complete — Figma frame "DD 08 Complete — definition reassembles"
// (15782:12475). Meter full, Knowie's warm arrival, no badge.
//
// The training log shows however many passes actually happened. The frame's footer
// reads "all four takes"; that copy is a leftover from the fixed ladder and is not
// reproduced — the count is derived.
//
// No XP anywhere. Deliberate: the drill is practice, not scored performance.

const ROUNDS = [
  { label: 'Round 1 · Full definition' },
  { label: 'Round 2 · One word gone' },
  { label: 'Round 3 · Several gone' },
  { label: 'Round 4 · All you', final: true },
]

export default function DrillCompletePage() {
  const router = useRouter()
  return (
    <ScreenShell
      bottomContent={
        // The same SHAPE as 07 Recap, not just the same variants. This matched Recap's
        // Primary/Secondary vocabulary and then stacked the pair full-width in the
        // opposite order — Done on top, Run it again beneath — while Recap puts them
        // side by side with "Run it again" always left. The comment claimed parity; the
        // position was never part of what got checked. Two screens, identical choice,
        // same row and same order now.
        <div className={actionRowClass}>
          <Button
            CTA="Run it again"
            variant="Secondary"
            size="M"
            onClick={() => router.push('/drill/intro?returning=1')}
          />
          <Button CTA="Done" variant="Primary" size="M" onClick={() => router.push('/picker')} />
        </div>
      }
    >
      <div className={styles.body}>
        {/* The meter reads unaided coverage, and the scaffold hands out the missed
            word, then its first letter, then the word itself to echo — so "all of it
            unaided" is a claim the drill has just spent four rungs disproving. The
            drill tracks no per-run help state to qualify it with, so this says what it
            can stand behind: the definition was completed. */}
        <StrengthMeter fill={100} label="The whole definition, start to finish" />
        <p className={styles.note}>{DRILL_TERM.drillTitle ?? DRILL_TERM.title}</p>
        <div className={styles.centred}>
          <MascotSlot size="2XL" expression="laughing" />
        </div>
        <RecallResult
          state="Pass"
          title="That’s the whole thing. Yours."
          transcript={`“${DRILL_TERM.answer}”`}
        />
        <TrainingLog rounds={ROUNDS} onSelect={(i) => router.push(`/drill/complete/round?round=${i + 1}`)} />
      </div>
    </ScreenShell>
  )
}
