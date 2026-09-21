'use client'

import { useRouter } from 'next/navigation'
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

export default function DrillRoundPage() {
  const router = useRouter()
  return (
    <ScreenShell
      showBottomSheetBackground
      bottomSheetOnly={
      <BottomSheet
          Title="All your takes"
          subtitle="Every round you just did, in order. The stumble is in there too."
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
        <StrengthMeter fill={100} label="You said all of it unaided" />
        <div className={styles.centred}>
          <MascotSlot size="XL" expression="laughing" />
        </div>
        <TrainingLog rounds={ROUNDS} />
      </div>

    </ScreenShell>
  )
}
