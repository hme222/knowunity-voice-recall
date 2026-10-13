'use client'

import { use } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter } from 'next/navigation'
import { micRegionClass, Button, MascotSlot, MicButton, MicCaption, ScreenShell } from '@/components'
import { drillRung, micGate, useDrillTerm, advancePractice, isPractising } from '@/lib/session'
import { Cue } from '../../Cue'
import { DrillBar } from '../../DrillBar'
import styles from '../../drill.module.css'

// DD 01 / 04 / 05 / 06 — the thinning passes. History: docs/code-history.md#h-021

export default function DrillPassPage({ params }: { params: Promise<{ step: string }> }) {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  const { step } = use(params)
  const n = Number(step)
  const rung = drillRung(drillTerm, n)

  useRedirect(!rung, '/drill/intro')

  if (!rung) return null

  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          <MicButton state="Idle" onClick={() => router.push(micGate(`/drill/recording?step=${n}`, `/text/turn?term=${drillTerm.index}&drill=${n}`))} />
          {/* The instruction is about the mic, so it sits under it — the locked
              MicCaption pattern (2026-10-07). In the card it cost the cue its room and
              the definition faded at 390x668 (designer, 2026-10-12). */}
          <MicCaption body="Say the whole thing. However it comes out." />
        </div>
      }
      topNavigation={<DrillBar step={n} onExit={() => router.push('/picker')} onSkip={() => router.push(isPractising() ? advancePractice() : '/picker')} />}
      bottomContent={
        <Button CTA="Type instead" variant="Tertiary" size="M" fullWidth onClick={() => router.push(`/text/turn?term=${drillTerm.index}&drill=${n}`)} />
      }
    >
      <div className={styles.frameBody}>
        <MascotSlot size="2XL" expression="determined" />
        <p className={styles.termPill}>
          Define: <span className={styles.termPillName}>{drillTerm.name}</span>
        </p>
        {/* One card, not two elements. The frame puts the instruction in the card's
            title and the thinning cue in its body. */}
        {/* The cue's blanks are DRAWN, not typed — see Cue.tsx. ChatBubble's `body`
            takes a string, so the bubble carries the instruction and the thinned
            definition sits directly under it in the same card shape. */}
        <div className={[styles.cueCard, styles.fullWidth].join(' ')}>
          <Cue className={styles.cueBody} text={rung.cue} />
        </div>
      </div>
    </ScreenShell>
  )
}
