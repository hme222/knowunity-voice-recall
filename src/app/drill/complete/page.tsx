'use client'

import { useRouter } from 'next/navigation'
import { actionRowClass, Button, MascotSlot, RecallResult, ScreenShell } from '@/components'
import { advancePractice, isPractising, useDrillTerm } from '@/lib/session'
import styles from '../drill.module.css'

// DD 08 Complete — Figma frame "DD 08 Complete — definition reassembles"
// (15782:12475). Meter full, Knowie's warm arrival, no badge.
//
// The training log shows however many passes actually happened. The frame's footer
// reads "all four takes"; that copy is a leftover from the fixed ladder and is not
// reproduced — the count is derived.
//
// No XP anywhere. Deliberate: the drill is practice, not scored performance.

// The climb as a step meter, not a four-row list — designer, 2026-10-12. The list was
// what pushed this screen 62px past 390x668; four steps on one line say the same thing
// at a glance, and each still opens that round's take. Round 2 is where the mock
// stumbles (see /drill/processing), so it carries the mark. Built inline: see
// component-gaps.md.
const ROUNDS = [
  { short: 'Full', label: 'Round 1 · Full definition' },
  { short: 'Stumbled', label: 'Round 2 · Stumbled', stumbled: true },
  { short: 'Several gone', label: 'Round 3 · Several gone' },
  { short: 'All you', label: 'Round 4 · All you', final: true },
]

export default function DrillCompletePage() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
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
