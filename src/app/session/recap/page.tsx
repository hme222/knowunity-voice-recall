'use client'

import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'
import { openSheet } from '@/lib/navigation'
import { AppBar, Button, ButtonIcon, HintCard, MascotSlot, ScreenShell, StatChip } from '@/components'
import { CloseIcon, EyeIcon } from '@/components/icons'
import { answerFor, Bucket, getTerm, keyPhrase, sessionTotals, setPractising, TOTAL_TERMS, typedByChoice, useSession, XP } from '@/lib/session'
import styles from './recap.module.css'

// 07 Recap — Figma frame "07 Recap (refreshed)" (15672:24456). History: docs/code-history.md#h-065

/**
 * Bucket order. Two orders, not one.
 *
 * sprint-context.md § "Recap reorders rather than relabels" says a confidently-wrong
 * term "sorts to the top of Worth revisiting". It did — and Worth revisiting was the
 * LAST bucket, so on a mixed run the heading rendered at y=770 against a content
 * region ending at 618, and the "You were sure about this one." line at y=812. The
 * signal the whole confidence tap exists to produce was 152px below the fold, under a
 * score percentage. Sorting to the top of a bucket nobody reaches is not surfacing.
 *
 * So when there is something to revisit, the recap opens with it. Nothing is
 * regraded and nothing is relabelled — the same rows in the same buckets, in the
 * order that puts the thing worth acting on first.
 */
/**
 * The confetti, fixed rather than random so every render agrees (and React's purity
 * rule holds): 24 pieces spread across the width, each with its own drift, spin, delay
 * and one of five brand tones. Numbers are data, like StrengthMeter's fill: x is a
 * percentage across, drift a percentage sideways, spin degrees, delay a fraction of the
 * burst.
 */
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 37) % 100,
  drift: ((i * 53) % 41) - 20,
  spin: ((i * 97) % 360) + 180,
  delay: ((i * 29) % 30) / 100,
  tone: ['brand', 'success', 'partial', 'coral', 'blue'][i % 5],
}))

const ORDER_SETTLED: Bucket[] = ['Unaided', 'Hinted', 'Revealed', 'Worth revisiting']
const ORDER_WITH_MISSES: Bucket[] = ['Worth revisiting', 'Revealed', 'Hinted', 'Unaided']

/** Which of the sheet's three content states a bucket opens. */
// The groups in the student's words, not the store's (microcopy review, 2026-10-14):
// "Revealed" said what the app did, "Unaided" is our word for theirs.
const BUCKET_HEADING: Record<Bucket, string> = {
  Unaided: 'Knew it',
  Hinted: 'Got it with a hint',
  Revealed: 'Saw the answer',
  'Worth revisiting': 'Skipped',
}

const TRANSCRIPT_BUCKET: Record<Bucket, string> = {
  Unaided: 'passed',
  Hinted: 'passed',
  Revealed: 'revealed',
  'Worth revisiting': 'skipped',
}

export default function RecapPage() {
  const router = useRouter()
  // useSession wraps sessionStorage in useSyncExternalStore: a server snapshot means
  // no hydration mismatch, and no setState-in-effect.
  const state = useSession()
  // Arriving at the summary ends any practice round. Practice is a detour from this
  // screen and returns to it; leaving the flag set would silence the next real run.
  useEffect(() => {
    setPractising(false)
  }, [])

  const outcomes = state.outcomes
  // Confetti when "You learned something new!" is on screen and the student has stopped
  // scrolling (designer, 2026-10-13): firing at 60% visible, it burst mid-scroll and
  // was over before they got there. The heading must be fully in view, clear of the
  // bottom fifth (the fade and the action zone), then the scroller must sit still for a
  // standard beat. Once per visit, never under reduced motion.
  const learnedRef = useRef<HTMLElement>(null)
  const [burst, setBurst] = useState(false)
  useEffect(() => {
    const heading = learnedRef.current?.querySelector('h2')
    const scroller = learnedRef.current?.closest('main')
    if (!heading || !scroller || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const settle = Number(getComputedStyle(document.documentElement).getPropertyValue('--motion-semantic-duration-standard')) * 2
    let inView = false
    let timer = 0
    const arm = () => {
      window.clearTimeout(timer)
      if (inView) timer = window.setTimeout(() => setBurst(true), settle)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        arm()
      },
      { root: scroller, threshold: 1, rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(heading)
    scroller.addEventListener('scroll', arm, { passive: true })
    return () => {
      io.disconnect()
      scroller.removeEventListener('scroll', arm)
      window.clearTimeout(timer)
    }
  }, [outcomes.length])
  const totals = sessionTotals(state)
  const complete = outcomes.length === TOTAL_TERMS
  const needsRevisiting = outcomes.some(
    (o) => o.bucket === 'Worth revisiting' || o.bucket === 'Revealed' || (o.calibration ?? 0) < 0,
  )
  /** Terms the student got to in the end, with or without a hint. */
  const resolved = outcomes.filter((o) => o.bucket === 'Unaided' || o.bucket === 'Hinted').length
  // Terms the mic failed on and the student skipped are not counted against them
  // (designer, 2026-10-12): they leave the "of N" as well as the misses.
  const micTrouble = outcomes.filter((o) => o.micTrouble).length
  const counted = (complete ? TOTAL_TERMS : outcomes.length) - micTrouble
  // A strong run — half or more said back with no help — reads as a win, not a
  // shortfall (designer, 2026-10-14: "the recap for 3 of 4 looks too sad"): wins
  // first, an excited Knowie, and the caption names what is left to win back.
  const strong = counted > 0 && totals.unaided * 2 >= counted
  const order = needsRevisiting && !strong ? ORDER_WITH_MISSES : ORDER_SETTLED
  const toWinBack = outcomes
    .filter((o) => (o.bucket === 'Revealed' || o.bucket === 'Worth revisiting') && !o.micTrouble)
    .map((o) => getTerm(o.index)?.name ?? '')

  // Something the student did not have cold and has now: got with a hint, or shown the answer. History: docs/code-history.md#h-066
  const learnedTerms = [...outcomes.filter((o) => o.bucket === 'Revealed'), ...outcomes.filter((o) => o.bucket === 'Hinted')]
    .map((o) => getTerm(o.index))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
  // The confidence signal, said out loud at the top rather than as an 11px line on a
  // row (senior review, 2026-10-12): the brief's "overconfidence has to cost something".
  const sureMissed = outcomes.filter((o) => o.wasSure && o.bucket !== 'Unaided' && !o.micTrouble).length
  // The run, one segment per term, in question order.
  const strip = [...outcomes].sort((a, b) => a.index - b.index)
  const unaidedNames = strip.filter((o) => o.bucket === 'Unaided').map((o) => getTerm(o.index)?.name ?? '')
  // The finishing bonus is for finishing, not for reaching the end: a run where every
  // term was skipped or lost to the mic paid +5 for nothing (engineering review).
  const bonusEarned = complete && resolved > 0
  const xpShown = bonusEarned ? totals.withBonus : totals.earned
  // The typed rate, explained once, here, rather than implied by a smaller number on
  // every typed screen (designer, 2026-10-13: keep 7, fix the language).
  // The run's biggest climb (designer, 2026-10-13, reach C3): a term that missed first
  // and was got after, its first take faded over what passed. One, not every row: the
  // hero stays a headline and one quote. Absent when nothing climbed.
  const climbed = outcomes.find((o) => o.bucket === 'Hinted' && state.firstTakes?.[o.index] && !o.micTrouble)
  const climb = climbed
    ? { name: getTerm(climbed.index)?.name, before: state.firstTakes?.[climbed.index] ?? '', after: keyPhrase(climbed.index, state) || answerFor(climbed.index, state) }
    : undefined
  const anyTypedByChoice = outcomes.some((o) => o.typed && typedByChoice(state, o.index))

  return (
    <ScreenShell
      // The term list scrolls by design; Knowie stays as the headline's face.
      mascotGivesWay={false}
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => router.push('/home/unlocked')} />
      }
      bottomContent={
        <div className={styles.actions}>
          {/* Decided 2026-10-08 by the designer: no "Run it again", no "Done". The one
              choice worth offering is the misses, so it leads; then the session ends at
              home. The requeue that used to bring a miss back automatically is gone —
              this is the student choosing to. */}
          {needsRevisiting && (
            <Button
              CTA="Practice what I missed"
              variant="Primary"
              size="M"
              fullWidth
              onClick={() => router.push('/session/recap/practice')}
            />
          )}
          <Button
            CTA="Back to home"
            variant={needsRevisiting ? 'Tertiary' : 'Primary'}
            size="M"
            fullWidth
            onClick={() => router.push('/home/unlocked')}
          />
        </div>
      }
    >
      {/* design-system.md § "Mascot poses" assigns laughing to 07 Recap. Its absence
          was found independently in both scorecards. */}
      <div className={styles.headline}>
        {/* Knowie reads the run (designer, 2026-10-12, from the Reach critic): laughing
            when nothing needs revisiting, determined — "let's go", never dazed — when
            something does. It laughed over a 2-of-4 recap whose job is not to flatter. */}
        {/* 2XL: at XL Knowie read as too small for the screen's face (designer,
            2026-10-13). */}
        {/* laughing on a clean run, excited on a strong one, approving otherwise:
            never confused here, which read as disappointed in the student (designer,
            2026-10-14). */}
        <MascotSlot size="2XL" expression={!needsRevisiting ? 'laughing' : strong ? 'excited' : 'approving'} className={styles.mascotCentred} />
        {/* Headline S over Body M Regular, as the frames set a screen title — not
            TextBlock's L, which renders 44px. See door.module.css for the same note;
            the evidence there is a direct read of the Quiz complete frame. */}
        <div className="screenTitle">
          {/* ONE earned sentence, then the run as a strip (senior review, 2026-10-12).
              "You got 2 of 4 in the end. 2 first time, no help." was two numbers in one
              line that read as a contradiction, under three rainbow tiles. The hero is
              what the student can do cold; the caption says what the rest was. */}
          <h1 className="screenTitleHeading">
            {outcomes.length === 0
              ? 'Session recap'
              : counted === 0
                // Every term lost to the mic: "You said all 0 back" was the headline.
                ? 'The mic didn’t catch these'
                : totals.unaided === counted
                ? `You said all ${counted} back without help`
                : strong
                  ? `Nice work! You can say ${totals.unaided} of ${counted} back without help`
                  : `You can say ${totals.unaided} of ${counted} back without help`}
          </h1>
          {/* The wins by name, in the caption rather than a coloured line of their own:
              the misses lead the list, so this is where the first viewport says what
              the student CAN do (Knowunity design review; UX critic, 2026-10-13). */}
          {outcomes.length > 0 && (unaidedNames.length > 0 && unaidedNames.length < counted || resolved > totals.unaided) && (
            <p className="screenTitleCaption">
              {[
                // On a strong run the wins lead the list below, so the caption looks
                // ahead instead: what is left to win back.
                strong && toWinBack.length
                  ? `${toWinBack.length === 1 ? 'One' : toWinBack.length} to win back: ${toWinBack.join(', ')}.`
                  : unaidedNames.length > 0 && unaidedNames.length < counted
                    ? `Without help: ${unaidedNames.join(', ')}.`
                    : null,
                resolved > totals.unaided ? `${resolved - totals.unaided} more with a hint.` : null,
              ]
                .filter(Boolean)
                .join(' ')}
            </p>
          )}
        </div>
        {/* No coloured strip (designer, 2026-10-13): XP and time as chips instead. */}
        {outcomes.length > 0 && (
          <div className={styles.stats}>
            <StatChip stat="XP" value={`+${xpShown}`} />
            {/* Accuracy over the run, not per answer (designer, 2026-10-14): how many
                were said back first time with no help. The Score variant, with its
                label saying what it counts rather than "SCORE". */}
            {counted > 0 && <StatChip stat="Score" label="FIRST TRY" value={`${totals.unaided}/${counted}`} />}
            <StatChip stat="Time" value={totals.elapsed} />
          </div>
        )}
        {climb && (
          <div className={styles.climb}>
            <p className={styles.climbLabel}>{`Your climb · ${climb.name}`}</p>
            <p className={styles.climbBefore}>
              <span className={styles.climbTag}>First try </span>
              {`“${climb.before}”`}
            </p>
            <p className={styles.climbAfter}>
              <span className={styles.climbTag}>Then </span>
              {`“${climb.after}”`}
            </p>
          </div>
        )}
      </div>

      {/* XP and time, one line, not three coloured tiles with 9px labels; the working
          behind it on a tap (senior review, 2026-10-12). The sum still has to be on
          the screen and add up, so it is one tap away rather than gone. */}
      {outcomes.length > 0 && (
        <details className={styles.summaryGroup}>
          <summary className={styles.summary}>
            <span className={styles.summaryCue}>How it adds up</span>
          </summary>
          {/* The secondary lines live here, under the one line that opens them: the
              headline area carried a green line and an amber line on top of the strip,
              and the first bucket fell half under the fold at 390x668 (craft critic,
              2026-10-13). The rows still mark each sure-and-missed term. */}
          {sureMissed > 0 && (
            <p className={styles.working}>
              {sureMissed === 1 ? 'You were sure about 1 you missed.' : `You were sure about ${sureMissed} you missed.`}
            </p>
          )}
          {anyTypedByChoice && (
            <p className={styles.working}>{`Typed answers earn ${XP.hinted} XP and said ones ${XP.unaided}: saying it out loud is the skill this practices.`}</p>
          )}
          <p className={styles.working}>
            {[
              `+${totals.termXp} from the terms below`,
              totals.drillXp ? `+${totals.drillXp} for drills` : null,
              totals.calibration !== 0
                ? `${totals.calibration > 0 ? '+' : ''}${totals.calibration} for how sure you were`
                : null,
              bonusEarned ? `+${XP.completionBonus} for finishing` : null,
            ]
              .filter(Boolean)
              .join(' \u00b7 ')}
          </p>
        </details>
      )}

      <div className={styles.buckets}>
        {outcomes.length === 0 && state && (
          <p className={styles.empty}>Nothing recorded yet — this session hasn&rsquo;t been run.</p>
        )}
        {(() => { let built = 0; return order.map((bucket) => {
          const rows = outcomes
            .filter((o) => o.bucket === bucket)
            // Confidently-wrong sorts first. The signal drives the list, it doesn't decorate it.
            .sort((a, b) => Number(b.wasSure ?? false) - Number(a.wasSure ?? false))
          if (!rows.length) return null
          return (
            <section key={bucket} className={styles.bucket}>
              <h2 className={styles.bucketLabel}>{`${BUCKET_HEADING[bucket]} · ${rows.length}`}</h2>
              {rows.map((row) => {
                const phrase = bucket === 'Unaided' || bucket === 'Hinted' ? keyPhrase(row.index, state) : ''
                return (
                // One by one, in reading order (reach 2); still under reduced motion.
                <div key={row.index} className={styles.row} data-bucket={bucket} style={{ ['--i' as string]: built++ }}>
                  <span className={styles.rowTerm}>
                    {getTerm(row.index)?.name}
                    {/* The student's own words that carried it, as the study note (reach 2). */}
                    {phrase && <span className={styles.rowQuote}>{`“${phrase}”`}</span>}
                    {/* Any term the student was sure about and did not get first time, not only the skipped ones. History: docs/code-history.md#h-067 */}
                    {row.micTrouble ? (
                      <span className={styles.rowNote}>The mic missed it. Not counted.</span>
                    ) : (
                      row.wasSure && bucket !== 'Unaided' && (
                        <span className={styles.rowNote}>You felt sure about this one.</span>
                      )
                    )}
                    {/* Typed, said so: "Unaided" on its own read as said aloud
                        (usability review, 2026-10-12). */}
                    {row.typed && !row.micTrouble && <span className={styles.rowReturn}>Typed.</span>}
                    {/* The return, said where the miss is (2a): the term goes on the
                        review list, and home offers it tomorrow. */}
                    {(bucket === 'Revealed' || bucket === 'Worth revisiting') && (
                      <span className={styles.rowReturn}>Comes back tomorrow.</span>
                    )}
                    {state.drilled?.includes(row.index) && <span className={styles.rowReturn}>{`Drilled. +${XP.drill} XP`}</span>}
                  </span>
                  {/* "Not yet", not "+0 XP", on a term still to learn (senior review). */}
                  <span className={styles.rowXp}>
                    {row.xp === 0 && (bucket === 'Revealed' || bucket === 'Worth revisiting') ? 'Not yet' : `+${row.xp} XP`}
                  </span>
                  {/* Every row opens its transcript. The sheet adapts by bucket, so a
                      skipped term shows the answer alone rather than a take that
                      never happened. */}
                  <ButtonIcon
                    variant="Overlay"
                    size="S"
                    icon={<EyeIcon />}
                    // A skipped term has no take: the sheet shows the answer (UX critic).
                    label={
                      bucket === 'Worth revisiting' || bucket === 'Revealed'
                        ? `See the answer for ${getTerm(row.index)?.name}`
                        : `See what you ${row.typed ? 'wrote' : 'said'} for ${getTerm(row.index)?.name}`
                    }
                    onClick={() => openSheet(router, `/session/transcript/${TRANSCRIPT_BUCKET[bucket]}?term=${row.index}${row.micTrouble ? '&mic=1' : ''}${row.typed ? '&typed=1' : ''}`)}
                  />
                </div>
                )
              })}
            </section>
          )
        }) })()}
      </div>

      {/* THE RECAP ENDS ON WHAT WAS LEARNED — designer, 2026-10-09. The numbers and the
          term list are the working; this is the takeaway, so it is the last thing the
          student reads before "Practice what I missed" or home. It sat at the top as the
          headline on 2026-10-08. */}
      {learnedTerms.length > 0 && (
        <section ref={learnedRef} className={styles.learned} aria-labelledby="learned-heading">
          {burst && (
            <div className={styles.confetti} aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className={styles.piece}
                  data-tone={c.tone}
                  style={{ ['--confetti-x' as string]: c.x, ['--confetti-drift' as string]: c.drift, ['--confetti-spin' as string]: c.spin, ['--confetti-delay' as string]: c.delay }}
                />
              ))}
            </div>
          )}
          <h2 id="learned-heading" className="screenTitleHeading">You learned something new!</h2>
          {learnedTerms.map((t) => (
            <HintCard key={t.index} className={styles.learnedCard} label={`New today · ${t.name}`} body={t.answer} />
          ))}
        </section>
      )}
    </ScreenShell>
  )
}
