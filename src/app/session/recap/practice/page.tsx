'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'
import { returnBack } from '@/lib/navigation'
import { actionRowClass, AppBar, Button, ChatBubble, OptionRow, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { DRILL_TERM, getTerm, useSession } from '@/lib/session'
import styles from '../recap.module.css'

// 07a Practice what I missed — Figma frame "07a Practice what I missed — choose how"
// (15785:13615). The hinge between the core loop and the drill: where Recap's
// "worth revisiting" bucket becomes an action.
//
// The drill is OFFERED here, never entered mid-session (decided 2026-09-20), so
// DD 00's opt-in framing stands.

export default function PracticePage() {
  const router = useRouter()
  const state = useSession()

  const missed = state.outcomes.filter((o) => o.bucket !== 'Unaided')
  // WHICH term. Every control on this screen used to ignore the list it sat under:
  // the rows all pushed to /drill/intro, and the drill only has one definition's ladder
  // built, so tapping "Cytoskeleton" drilled Formal charge. The rows had a hardcoded
  // state="Default" too, so nothing ever looked chosen.
  // `useState(() => missed[0]?.index)` looked right and was wrong: the initialiser runs
  // once, on the first render, and the session is read from storage after that — so it
  // captured undefined and nothing was ever selected until the student tapped. The
  // default is resolved at render instead, which is also what makes it follow the list
  // if the list arrives late.
  const [picked, setPicked] = useState<number | undefined>(undefined)
  const selected = picked ?? missed[0]?.index
  const canDrill = selected === DRILL_TERM.index

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Back" onLeft={() => returnBack(router, '/session/recap')} />
      }
      bottomContent={
        <div className={styles.actions}>
          {/* The two ways to practise share the row; the dismissal is the link. Three
              stacked measured 176 against a 136 budget. */}
          {/* The drill is offered only for the definition whose ladder exists. It is
              built from Formal-charge-specific cues, so a "Drill it out loud" button on
              any other term would open a drill for a term the student did not pick —
              which is what it did. */}
          <div className={actionRowClass}>
            {canDrill && (
              <Button CTA="Drill it out loud" variant="Secondary" size="M" onClick={() => router.push('/drill/intro')} />
            )}
            <Button
              CTA="Say it back again"
              variant="Secondary"
              size="M"
              onClick={() => router.push(`/session/idle/${selected ?? 1}`)}
            />
          </div>
          <Button CTA="Not now" variant="Tertiary" size="S" fullWidth onClick={() => router.push('/session/recap')} />
        </div>
      }
    >
      <ChatBubble
        showTitle
        title="How do you want to practice?"
        body={
          missed.length === 1
            ? `One term to go back over: ${getTerm(missed[0].index)?.name}.`
            : `${missed.length} terms to go back over.`
        }
      />
      <div className={styles.buckets}>
        {missed.map((o) => (
          <OptionRow
            key={o.index}
            label={getTerm(o.index)?.name ?? ''}
            state={selected === o.index ? 'Selected' : 'Default'}
            inGroup
            onClick={() => setPicked(o.index)}
          />
        ))}
        {missed.length === 0 && state && <p className={styles.empty}>You got everything unaided. Nothing to practise.</p>}
      </div>
    </ScreenShell>
  )
}
