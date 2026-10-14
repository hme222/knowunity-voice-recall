'use client'

import { Suspense } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, MascotSlot, RecallResult, RecallResultCaptured, ScreenShell } from '@/components'
import { DRILL_COULDNT_HEAR_UNDER_MS, drillRung, useDrillTerm } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 02a Captured — Figma frame "DD 02a Captured — review before sending"
// (15782:12956). The same review beat as the core loop, for the same reason: it keeps
// the meter honest, because a mishear must not be scored as a gap in knowledge.

function DrillCaptured() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  const params = useSearchParams()
  const step = Number(params.get('step') ?? '1')
  const stumble = params.get('stumble')
  const rung = drillRung(drillTerm, step)
  // A take under the floor is a mishear, said as one, and spends no rung: a 0.5s take
  // used to be judged as a whole answer (UX critic, 2026-10-13; designer, option
  // "inline on drill Captured"). An absent `ms` is a take that cleared the floor.
  const ms = params.get('ms')
  const misheard = ms !== null && Number(ms) < DRILL_COULDNT_HEAR_UNDER_MS
  const again = `/drill/recording?step=${step}${stumble ? `&stumble=${stumble}` : ''}`
  const typeInstead = `/text/turn?term=${drillTerm.index}&drill=${step}`

  useRedirect(!rung, '/drill/intro')

  if (!rung) return null

  if (misheard) {
    return (
      <ScreenShell
        topNavigation={<DrillBar step={step} onExit={() => router.push('/picker')} />}
        bottomContent={
          <div className={styles.actions}>
            <Button CTA="Say it again" variant="Primary" size="M" fullWidth onClick={() => router.replace(again)} />
            {/* The screen's other way to answer: Secondary, as on 01 Idle and the
                session's mishear (button tiers by role, 2026-10-13). */}
            <Button CTA="Type instead" variant="Secondary" size="M" fullWidth onClick={() => router.push(typeInstead)} />
          </div>
        }
      >
        <div className={styles.body}>
          {/* The session's couldn't-hear, in the drill's chrome: the mic missed it. */}
          <MascotSlot size="2XL" expression="dazed" className={styles.mascotCentred} />
          <RecallResult
            state="CouldntHear"
            title="I didn’t catch that."
            transcript="The mic didn’t pick you up. Say the same answer again, a little closer."
          />
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell
      topNavigation={<DrillBar step={step} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.actions}>
          {/* "Send", as on Recording and the typed turn: one word for "I'm done answering"
              (microcopy review, 2026-10-14; was "Submit"). Not "Looks right": the student was confirming a
              take and was then told "Partially right" on the next screen — agreeing,
              then being contradicted (UX critic, 2026-10-13). Not "Check it" either, one
              word from the session's "Just check it" (craft critic, same day). */}
          <Button
            CTA="Send"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.replace(`/drill/processing?step=${step}`)}
          />
        </div>
      }
    >
      <div className={styles.body}>
        {/* A review-before-sending beat, not a win — nothing has been judged yet. */}
        <MascotSlot size="2XL" expression="excited" className={styles.mascotCentred} />
        <RecallResultCaptured
          title="Here&rsquo;s what I heard."
          // Step 2 is the scripted stumble, so this shows the take that screen will quote.
          transcript={step === 2 ? drillTerm.drill.partial : drillTerm.transcript}
        />
        {/* The corrections sit with the words they correct, inline, as on the session's
            02a Captured — a full-width "Say it again" button here and inline links
            there was one beat in two shapes (craft critic, 2026-10-13). */}
        <div className={styles.fix}>
          <span className={styles.fixLabel}>Not what you said?</span>
          <Button CTA="Say it again" variant="Tertiary" size="S" onClick={() => router.push(again)} />
          <Button CTA="Type instead" variant="Tertiary" size="S" onClick={() => router.push(typeInstead)} />
        </div>
      </div>
    </ScreenShell>
  )
}

export default function DrillCapturedPage() {
  return (
    <Suspense fallback={null}>
      <DrillCaptured />
    </Suspense>
  )
}
