'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { actionRowClass, Button, ChatBubble, MascotSlot, MicButton, ScreenShell, StrengthMeter } from '@/components'
import { drillRung, DRILL_TERM } from '@/lib/session'
import { DrillBar } from '../../DrillBar'
import styles from '../../drill.module.css'

// DD 01 / 04 / 05 / 06 — the thinning passes. Figma frames 15782:11696, 11950, 12053,
// 12259. One route with a [step] rather than four near-identical files: the screens
// differ only in their cue and meter value.
//
// The meter fills by unaided coverage, not by which pass this is — that is the whole
// design. Knowie grows a step each pass: within-session muscle, reset per definition.
//
// REBUILT TO THE FRAME 2026-09-21. This screen had been assembled from its parts in a
// different order: a full-bleed labelled meter first, the instruction and the cue as
// two loose paragraphs, the term as plain text, and the mascot pushed down beside the
// mic. DD 01 reads top to bottom: mascot, meter, term pill, one card carrying the
// instruction AND the cue, then the mic alone in the space above the actions.

export default function DrillPassPage({ params }: { params: Promise<{ step: string }> }) {
  const router = useRouter()
  const { step } = use(params)
  const n = Number(step)
  const rung = drillRung(n)

  if (!rung) {
    router.replace('/drill/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={<DrillBar step={n} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={actionRowClass}>
          <Button CTA="Type instead" variant="Secondary" size="M" onClick={() => router.push(`/text/turn?term=1`)} />
          <Button CTA="Skip" variant="Tertiary" size="M" onClick={() => router.push('/picker')} />
        </div>
      }
    >
      <div className={styles.frameBody}>
        <MascotSlot size="2XL" expression="determined" />
        {/* No caption. The frame runs the meter bare at 220 centred — the label
            "How much you can say unaided" was an addition. */}
        <StrengthMeter fill={rung.coverage} />
        <p className={styles.termPill}>
          Define: <span className={styles.termPillName}>{DRILL_TERM.name}</span>
        </p>
        {/* One card, not two elements. The frame puts the instruction in the card's
            title and the thinning cue in its body. */}
        <ChatBubble
          className={styles.fullWidth}
          showTitle
          title="Say the whole thing. However it comes out."
          body={rung.cue}
        />
        <div className={styles.frameMic}>
          <MicButton state="Idle" onClick={() => router.push(`/drill/recording?step=${n}`)} />
        </div>
      </div>
    </ScreenShell>
  )
}
