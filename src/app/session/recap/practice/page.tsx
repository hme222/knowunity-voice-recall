'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppBar, Button, Chips, MascotSlot, ScreenShell, SwipeDeck, SwipeDots } from '@/components'
import { CloseIcon, MicGlyphIcon } from '@/components/icons'
import { type Bucket, getTerm, type PracticeItem, recommendedMode, startPractice, type TermOutcome, useSession } from '@/lib/session'
import styles from './practice.module.css'

// 07a Practice what you missed, as a rematch deck (designer, 2026-10-14, option A of
// three mocked: "it feels like a checklist, can we make it fun"). One card at a time
// from a fanned hand, Knowie peeking over the top, the way to play it on the card.
// Was a bordered row per term (2026-10-09). History: docs/code-history.md#h-068

/** Why the term is in the deck, in the student's words. */
const REASON: Record<Exclude<Bucket, 'Unaided'>, string> = {
  Revealed: 'You saw the answer',
  'Worth revisiting': 'You skipped this one',
  Hinted: 'You needed a hint',
}

/** Same order the Recap uses when there are misses: the least-known first. */
const ORDER: Bucket[] = ['Worth revisiting', 'Revealed', 'Hinted']

// "Try again", not "Say it again": that one means the mic missed you (retry names by
// what is redone, designer, 2026-10-14).
const CTA: Record<PracticeItem['mode'], string> = { drill: 'Drill it', say: 'Try again' }
const ALT: Record<PracticeItem['mode'], string> = { drill: 'Say it', say: 'Drill it' }

const COUNT = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six']

/** Knowie's one line on the card: what the suggested way is, and why it suits. */
function knowieSays(o: TermOutcome, mode: PracticeItem['mode']): string {
  if (mode === 'drill') return 'Knowie says: drill it. Four quick rounds, nothing graded.'
  if (o.micTrouble) return 'Knowie says: say it again. The mic missed it last time.'
  if (o.typed) return 'Knowie says: say it back this time instead of typing.'
  return 'Knowie says: have another go. You were close.'
}

export default function PracticePage() {
  const router = useRouter()
  const state = useSession()
  const [active, setActive] = useState(0)
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
  const n = plan.length
  const at = Math.min(active, Math.max(0, n - 1))
  const o = missed[at]
  const mode = plan[at]?.mode
  const other: PracticeItem['mode'] = mode === 'drill' ? 'say' : 'drill'
  const term = o ? getTerm(o.index) : undefined

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Back" onLeft={() => router.push('/session/recap')} />
      }
      // "Play all" only with more than one card; with one, its card is the action.
      bottomContent={n > 1 ? <Button CTA={`Play all ${n}`} variant="Primary" size="M" fullWidth onClick={() => go(plan)} /> : undefined}
    >
      <div className={styles.body}>
        {/* Two different empties. With no outcomes the session never ran, and "you got
            everything unaided" was a claim about a run that did not happen
            (click-through, 2026-10-12). Same line the Recap uses for it. */}
        {n === 0 ? (
          <>
            <MascotSlot size="2XL" expression={state.outcomes.length ? 'laughing' : 'standby'} />
            <div className="screenTitle">
              <h1 className="screenTitleHeading">{state.outcomes.length ? 'Nothing to win back' : 'Practice what you missed'}</h1>
              <p className="screenTitleCaption">
                {state.outcomes.length ? 'You knew every one without help.' : 'Nothing recorded yet — this session hasn’t been run.'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="screenTitle">
              <h1 className="screenTitleHeading">Rematch time</h1>
              <p className="screenTitleCaption">{`${COUNT[n] ?? n} got away. Let’s win ${n === 1 ? 'it' : 'them'} back.`}</p>
            </div>

            <div className={styles.deck}>
              {/* The hand behind the top card: decoration that says "more to come". */}
              {n > 2 && <span className={`${styles.back} ${styles.backFar}`} aria-hidden="true" />}
              {n > 1 && <span className={`${styles.back} ${styles.backNear}`} aria-hidden="true" />}
              {/* Knowie peeks over the top card, feet tucked behind it. One size, as on
                  every screen (designer, 2026-10-14). */}
              <MascotSlot size="2XL" expression="giggling" className={styles.peek} />
              <SwipeDeck active={at} total={n} onChange={setActive} label="Rematch cards" className={styles.swipe}>
                {o && term && mode && (
                  <article className={styles.card} aria-label={term.name}>
                    {/* The tag left and the dots right, on the card's first row: under the
                        deck the dots fell below the fold at 390x668, and they are the tap
                        way through it. The chip is visual; its words are in the card's
                        text for a screen reader. */}
                    <div className={styles.cardHead}>
                      <span aria-hidden="true" className={styles.tag}>
                        <Chips
                          Text={o.micTrouble ? 'The mic missed it' : REASON[o.bucket as Exclude<Bucket, 'Unaided'>]}
                          size="S"
                          color="Partial"
                          active
                          showLeftIcon={false}
                          showRightIcon={false}
                        />
                      </span>
                      {n > 1 && <SwipeDots active={at + 1} total={n} onSelect={(k) => setActive(k - 1)} label="Rematch card" />}
                    </div>
                    <h2 className={styles.term}>{term.name}</h2>
                    <p className={styles.says}>
                      <span className="srOnly">{`${o.micTrouble ? 'The mic missed it' : REASON[o.bucket as Exclude<Bucket, 'Unaided'>]}. `}</span>
                      {o.wasSure ? 'You felt sure about this one. ' : ''}
                      {knowieSays(o, mode)}
                    </p>
                    <div className={styles.pair}>
                      <Button CTA={CTA[mode]} variant="Primary" size="M" fullWidth aria-label={`${CTA[mode]}: ${term.name}`} onClick={() => go([{ index: o.index, mode }])} />
                      <Button
                        CTA={ALT[mode]}
                        variant="Secondary"
                        size="M"
                        fullWidth
                        showLeftIcon={other === 'say'}
                        leftIcon={other === 'say' ? <MicGlyphIcon /> : undefined}
                        aria-label={`${ALT[mode]}: ${term.name}`}
                        className={styles.alt}
                        onClick={() => go([{ index: o.index, mode: other }])}
                      />
                    </div>
                  </article>
                )}
              </SwipeDeck>
            </div>
          </>
        )}
      </div>
    </ScreenShell>
  )
}
