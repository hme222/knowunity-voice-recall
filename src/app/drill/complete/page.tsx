'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { actionRowClass, Button, MascotSlot, RecallResult, ScreenShell } from '@/components'
import { advancePractice, isPractising, useDrillTerm, markDrilled, spendEarned, useSession, XP } from '@/lib/session'
import styles from '../drill.module.css'

// DD 08 Complete — Figma frame "DD 08 Complete — definition reassembles" (15782:12475). History: docs/code-history.md#h-010

// The climb as a step meter, not a four-row list — designer, 2026-10-12. History: docs/code-history.md#h-011
const ROUNDS = [
  { short: 'Full', label: 'Round 1 · Full definition' },
  { short: 'Stumbled', label: 'Round 2 · Stumbled', stumbled: true },
  { short: 'Several gone', label: 'Round 3 · Several gone' },
  { short: 'All you', label: 'Round 4 · All you', final: true },
]

export default function DrillCompletePage() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  const drilled = Boolean(useSession().drilled?.includes(drillTerm.index))
  // Pays against the drill's receipt, once per term per run (9a): a cold load of this
  // route earns nothing.
  useEffect(() => {
    if (spendEarned(drillTerm.index, 'Drill')) markDrilled(drillTerm.index)
  }, [drillTerm.index])
  return (
    <ScreenShell
      bottomContent={
        // The same SHAPE as 07 Recap, not just the same variants. History: docs/code-history.md#h-012
        <div className={actionRowClass}>
          <Button
            CTA="Run it again"
            variant="Secondary"
            size="M"
            onClick={() => router.push('/drill/intro?returning=1')}
          />
          <Button
            CTA="Done"
            variant="Primary"
            size="M"
            // In a practice round from the Recap, on to the next term (or back to the
            // Recap); otherwise back to the picker it came from.
            onClick={() => router.push(isPractising() ? advancePractice() : '/picker')}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <p className={styles.note}>{drillTerm.drillTitle ?? drillTerm.title}</p>
        <div className={styles.centred}>
          {/* The screen's h1, for screen readers; the visible title is in the card. */}
          <h1 className="srOnly">{`Drill complete: ${drillTerm.name}`}</h1>
          <MascotSlot size="2XL" expression="laughing" />
        </div>
        <RecallResult
          state="Pass"
          title="That’s the whole thing. Yours."
          transcript={`“${drillTerm.answer}”`}
        />
        {/* The reward for finishing (designer, 2026-10-13, 9a). Small on purpose:
            the drill is practice, not a points grind. */}
        {drilled && <p className={styles.xp}>{`\u26a1 +${XP.drill} XP`}</p>}
        <section className={styles.climb} aria-labelledby="climb-heading">
          <h2 id="climb-heading" className={styles.climbHeading}>What you climbed</h2>
          <ol className={styles.climbSteps}>
            {ROUNDS.map((r, i) => (
              <li key={r.label} className={styles.climbStep}>
                <button
                  type="button"
                  className={styles.climbButton}
                  data-stumbled={r.stumbled || undefined}
                  data-final={r.final || undefined}
                  aria-label={`${r.label}. See what you said.`}
                  onClick={() => router.push(`/drill/complete/round?round=${i + 1}`)}
                >
                  <span className={styles.climbDot} aria-hidden="true">{r.stumbled ? '!' : i + 1}</span>
                  <span className={styles.climbLabel} aria-hidden="true">{r.short}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </ScreenShell>
  )
}
