'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, MascotSlot, ScreenShell } from '@/components'
import { CloseIcon, MicGlyphIcon } from '@/components/icons'
import { type Bucket, getTerm, type PracticeItem, recommendedMode, startPractice, type TermOutcome, useSession } from '@/lib/session'
import styles from './practice.module.css'

// 07a Practice what I missed. History: docs/code-history.md#h-068

/** Why the term is on this list, in the student's terms. */
const REASON: Record<Exclude<Bucket, 'Unaided'>, string> = {
  Revealed: 'Needed the answer',
  'Worth revisiting': 'Skipped',
  Hinted: 'Needed a hint',
}

/** Same order the Recap uses when there are misses: the least-known first. */
const ORDER: Bucket[] = ['Worth revisiting', 'Revealed', 'Hinted']

// "Try again", not "Say it again": that one means the mic missed you (retry names by
// what is redone, designer, 2026-10-14).
const CTA: Record<PracticeItem['mode'], string> = { drill: 'Drill it', say: 'Try again' }
const ALT: Record<PracticeItem['mode'], string> = { drill: 'Say it', say: 'or drill it' }

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
  const plan: PracticeItem[] = missed.map((o) => ({ index: o.index, mode: recommendedMode(o.bucket, o.micTrouble, { wasSure: o.wasSure, typed: o.typed }) }))

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
        <MascotSlot size="2XL" expression="excited" />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Practice what you missed</h1>
          {plan.length > 0 && (
            <p className="screenTitleCaption">
              {/* True whatever was picked: "Knowie picked a way for each" over rows that all
                  said the same thing read as nothing having been picked (senior review). */}
              {plan.every((i) => i.mode === plan[0].mode)
                ? `Knowie suggests ${plan[0].mode === 'drill' ? 'drilling' : 'saying'} ${plan.length > 1 ? 'them' : 'it'}${plan[0].mode === 'say' ? ' again' : ''}. Tap the other if you’d rather.`
                : 'Knowie suggests a way for each. Tap the other if you’d rather.'}
            </p>
          )}
        </div>

        {/* Two different empties. With no outcomes the session never ran, and "you got
            everything unaided" was a claim about a run that did not happen
            (click-through, 2026-10-12). Same line the Recap uses for it. */}
        {state.outcomes.length === 0 ? (
          <p className={styles.empty}>Nothing recorded yet — this session hasn&rsquo;t been run.</p>
        ) : (
          plan.length === 0 && <p className={styles.empty}>You knew every one without help. Nothing to practice.</p>
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
                  {/* No definition here: shown before the drill it gave the answer away
                      and cut the drill's retrieval value (Duolingo design review,
                      2026-10-13, over the senior review's earlier ask). */}
                  {/* The reason, then the other method as a quiet link on the same line:
                      one line instead of two keeps three rows and Knowie on a phone. */}
                  <div className={styles.rowMeta}>
                    <p className={styles.rowReason}>
                      {o.micTrouble ? 'The mic missed it' : REASON[o.bucket as Exclude<Bucket, 'Unaided'>]}
                      {o.wasSure ? ' · you were sure' : ''}
                      {/* Says why the method differs: rule C. */}
                      {o.typed && !o.micTrouble ? ' · typed' : ''}
                    </p>
                    {/* The other method, under the reason, on every row. Saying it keeps
                        the Say It Back mic the designer asked for (2026-10-13), now with
                        its word beside it (2026-10-14): an icon alone had no visible name
                        to match the one a screen reader heard. */}
                    <Button
                      CTA={ALT[mode]}
                      variant="Tertiary"
                      size="S"
                      className={styles.rowAlt}
                      showLeftIcon={other === 'say'}
                      leftIcon={other === 'say' ? <MicGlyphIcon /> : undefined}
                      // Named per term: three identical links read the same out of
                      // context (UX critic, 2026-10-13). The visible words come first, so
                      // the spoken name contains what is on screen.
                      aria-label={`${ALT[mode]}: ${term?.name}`}
                      onClick={() => go([{ index: o.index, mode: other }])}
                    />
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <Button CTA={CTA[mode]} aria-label={`${CTA[mode]}: ${term?.name}`} variant="Secondary" size="S" onClick={() => go([{ index: o.index, mode }])} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </ScreenShell>
  )
}
