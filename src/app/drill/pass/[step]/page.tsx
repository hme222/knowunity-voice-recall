'use client'

import { use } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter } from 'next/navigation'
import { micRegionClass, Button, MascotSlot, MicButton, MicCaption, ScreenShell } from '@/components'
import { drillRung, useDrillTerm, advancePractice, isPractising } from '@/lib/session'
import { Cue } from '../../Cue'
import { DrillBar } from '../../DrillBar'
import styles from '../../drill.module.css'

// DD 01 / 04 / 05 / 06 — the thinning passes. Figma frames 15782:11696, 11950, 12053,
// 12259. One route with a [step] rather than four near-identical files: the screens
// differ only in their cue and meter value.
//
// No StrengthMeter (designer, 2026-10-12): the green coverage bar under Knowie was a
// second progress signal beside the top bar's, and it cost the cue its room — the cue
// faded at 390x668. Progress is the top bar and its N/4.
//
// "Knowie grows a step each pass" used to be the second half of that sentence, stated
// as fact, and a review flagged it as a claim the screen contradicts — MascotSlot is
// 2XL on every rung. It IS a recorded intention (sprint-context.md § the drill, "Visual
// metaphor"), so it is not stray prose; it is unbuilt. Checked against the frames
// before attempting it: DD 01, 04, 05 and 06 all place `mascotSlot` at 120x120,
// identical on all four, so the growth was never designed either. And it cannot be
// built as written from what exists — the slot's next size up is 200px against roughly
// 48px of headroom here at step 4. sprint-context now carries it as an open question
// rather than a behaviour; this comment no longer asserts it.
//
// REBUILT TO THE FRAME 2026-09-21. This screen had been assembled from its parts in a
// different order: a full-bleed labelled meter first, the instruction and the cue as
// two loose paragraphs, the term as plain text, and the mascot pushed down beside the
// mic. DD 01 reads top to bottom: mascot, meter, term pill, one card carrying the
// instruction AND the cue, then the mic alone in the space above the actions.

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
          <MicButton state="Idle" onClick={() => router.push(`/drill/recording?step=${n}`)} />
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
