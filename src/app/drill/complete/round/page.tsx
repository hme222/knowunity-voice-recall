'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BottomSheet, MascotSlot, PickerRow, ScreenShell, TrainingLog } from '@/components'
import { useDrillTerm } from '@/lib/session'
import styles from '../../drill.module.css'

// DD 08a — a round tapped on Complete raises the transcript sheet. History: docs/code-history.md#h-013

const ROUNDS = [
  { label: 'Round 1 · Full definition' },
  { label: 'Round 2 · One word gone' },
  { label: 'Round 3 · Several gone' },
  { label: 'Round 4 · All you', final: true },
]

function DrillRoundScreen() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  // Which row was tapped. History: docs/code-history.md#h-014
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
          {/* The word comes from the fixture, not a string typed here. This said
              "evenly" while /drill/miss said the missing word was "electrons" — the
              same round reporting two different words, one screen apart. */}
          <PickerRow raised variant="drill" label={`Round 2 · Stumbled on “${drillTerm.drill.missedWord}”`} state="drill" />
          <PickerRow raised variant="drill" label="Round 3 · Several gone" state="sharp" />
          <PickerRow raised variant="drill" label="Round 4 · All you" state="sharp" />
          <p className={styles.note}>&ldquo;{drillTerm.transcript}&rdquo;</p>
        </BottomSheet>
      }
    >
      <div className={styles.body}>
        {/* The screen's h1, for screen readers. */}
        <h1 className="srOnly">{`Drill rounds: ${drillTerm.name}`}</h1>
        <div className={styles.centred}>
          <MascotSlot size="XL" expression="approving" />
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
