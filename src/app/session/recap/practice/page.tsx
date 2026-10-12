'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, MascotSlot, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { type Bucket, getTerm, type PracticeItem, recommendedMode, startPractice, type TermOutcome, useSession } from '@/lib/session'
import styles from './practice.module.css'

// 07a Practice what I missed. Redesigned 2026-10-09 with the designer, replacing the
// Figma frame "07a Practice what I missed — choose how" (15785:13615).
//
// The frame asked "How do you want to practice?" over a list of terms, so the student
// made two choices (which term, which method) with one of them hidden: a row was
// preselected, and both methods were equal-weight Secondary buttons with nothing to say
// how they differed. Now each row IS the action. The app recommends the method from
// what happened to the term (recommendedMode), says why the term is there, and offers
// the other method as a quiet alternative. "Practice all" runs every row in order and
// comes back to the Recap once.
//
// The drill is still OFFERED here, never entered mid-session (decided 2026-09-20).

/** Why the term is on this list, in the student's terms. */
const REASON: Record<Exclude<Bucket, 'Unaided'>, string> = {
  Revealed: 'Needed the answer',
  'Worth revisiting': 'Skipped',
  Hinted: 'Needed a hint',
}

/** Same order the Recap uses when there are misses: the least-known first. */
const ORDER: Bucket[] = ['Worth revisiting', 'Revealed', 'Hinted']

const CTA: Record<PracticeItem['mode'], string> = { drill: 'Drill it', say: 'Say it again' }
const ALT: Record<PracticeItem['mode'], string> = { drill: 'or say it', say: 'or drill it' }

export default function PracticePage() {
  const router = useRouter()
  const state = useSession()
  const missed: TermOutcome[] = state.outcomes
    .filter((o) => o.bucket !== 'Unaided')
    .sort(
      (a, b) =>
        ORDER.indexOf(a.bucket) - ORDER.indexOf(b.bucket) ||
        // Sure-and-wrong first within a bucket, as on the Recap.
        Number(b.wasSure ?? false) - Number(a.wasSure ?? false),
    )
  const plan: PracticeItem[] = missed.map((o) => ({ index: o.index, mode: recommendedMode(o.bucket, o.micTrouble) }))

  const go = (items: PracticeItem[]) => router.push(startPractice(items))

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Back" onLeft={() => router.push('/session/recap')} />
      }
      // "Practice all" only when there is more than one; with one, its row is the action.
      // No "Not now": the X already does that.
      bottomContent={
        plan.length > 1 ? (
          <Button CTA={`Practice all ${plan.length}`} variant="Primary" size="M" fullWidth onClick={() => go(plan)} />
        ) : undefined
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="laughing" />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Go back over what you missed</h1>
          {plan.length > 0 && (
            <p className="screenTitleCaption">
              {plan.length > 1 ? 'Knowie picked a way for each.' : 'Knowie picked a way to practice it.'}
            </p>
          )}
        </div>

        {/* Two different empties. With no outcomes the session never ran, and "you got
            everything unaided" was a claim about a run that did not happen
            (click-through, 2026-10-12). Same line the Recap uses for it. */}
        {state.outcomes.length === 0 ? (
          <p className={styles.empty}>Nothing recorded yet — this session hasn&rsquo;t been run.</p>
        ) : (
          plan.length === 0 && <p className={styles.empty}>You got everything unaided. Nothing to practice.</p>
        )}

        <ul className={styles.rows}>
          {missed.map((o, i) => {
            const mode = plan[i].mode
            const other = mode === 'drill' ? 'say' : 'drill'
            const term = getTerm(o.index)
            return (
              <li key={o.index} className={styles.row}>
                <div className={styles.rowText}>
                  <p className={styles.rowTerm}>{term?.name}</p>
                  {/* The reason, then the other method as a quiet link on the same line:
                      one line instead of two keeps three rows and Knowie on a phone. */}
                  <div className={styles.rowMeta}>
                    <p className={styles.rowReason}>
                      {o.micTrouble ? 'The mic missed it' : REASON[o.bucket as Exclude<Bucket, 'Unaided'>]}
                      {o.wasSure ? ' · you were sure' : ''}
                    </p>
                    <Button
                      CTA={ALT[mode]}
                      variant="Tertiary"
                      size="S"
                      className={styles.rowAlt}
                      onClick={() => go([{ index: o.index, mode: other }])}
                    />
                  </div>
                </div>
                <Button CTA={CTA[mode]} variant="Secondary" size="S" onClick={() => go([{ index: o.index, mode }])} />
              </li>
            )
          })}
        </ul>
      </div>
    </ScreenShell>
  )
}
