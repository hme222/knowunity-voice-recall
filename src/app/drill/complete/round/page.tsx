'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BottomSheet, MascotSlot, PickerRow, ScreenShell, StrengthMeter, TrainingLog } from '@/components'
import { DRILL_TERM } from '@/lib/session'
import styles from '../../drill.module.css'

// DD 08a — a round tapped on Complete raises the transcript sheet.
// Figma frame "DD 08a Round tapped — transcript sheet" (15800:19333).
//
// Its OWN branch screen, with Complete rendered behind it. A sheet is never baked into
// a screen that represents a default state — the mistake this file has made three
// times. ScreenShell does have a showBottomSheetBackground prop, and this route
// sets it: turning it on is what marks the route as a sheet branch.
//
// Rows use PickerRow's `raised`: on background.surface inside a surface-filled sheet
// they would resolve to the same value and vanish.

const ROUNDS = [
  { label: 'Round 1 · Full definition' },
  { label: 'Round 2 · One word gone' },
  { label: 'Round 3 · Several gone' },
  { label: 'Round 4 · All you', final: true },
]

function DrillRoundScreen() {
  const router = useRouter()
  // Which row was tapped. DD 08's caption says "Tap any round to see all 4 takes" and
  // every row opened this sheet in an identical state, so the tap was real but its
  // target never acknowledged it. The subtitle names the round now.
  //
  // PickerRow has no `active`/selected prop — checked against its Storybook docs, which
  // list variant, label, state, raised and type. Marking the tapped ROW would mean
  // adding API to a component whose Figma set does not have it, so this says it in the
  // sheet's own copy instead.
  const tapped = Number(useSearchParams().get('round') ?? '0')
  return (
    <ScreenShell
      showBottomSheetBackground
      bottomSheetOnly={
      <BottomSheet
          Title="All your takes"
          subtitle={
            tapped > 0
              ? `Round ${tapped} is below, with every other take you did.`
              : 'Every round you just did, in order. The stumble is in there too.'
          }
          onDismiss={() => router.push('/drill/complete')}
        >
          <PickerRow raised variant="drill" label="Round 1 · Full definition" state="sharp" />
          <PickerRow raised variant="drill" label="Round 2 · Stumbled on “evenly”" state="drill" />
          <PickerRow raised variant="drill" label="Round 3 · Several gone" state="sharp" />
          <PickerRow raised variant="drill" label="Round 4 · All you" state="sharp" />
          <p className={styles.note}>&ldquo;{DRILL_TERM.transcript}&rdquo;</p>
        </BottomSheet>
      }
    >
      <div className={styles.body}>
        {/* Same label as /drill/complete, and same reason it is not "unaided": the
            scaffold hands out the missed word, its first letter, then the word to echo. */}
        <StrengthMeter fill={100} label="The whole definition, start to finish" />
        <div className={styles.centred}>
          <MascotSlot size="XL" expression="laughing" />
        </div>
        <TrainingLog rounds={ROUNDS} />
      </div>

    </ScreenShell>
  )
}

export default function DrillRoundPage() {
  return (
    <Suspense fallback={null}>
      <DrillRoundScreen />
    </Suspense>
  )
}
