'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'
import { openSheet } from '@/lib/navigation'
import { AppBar, Button, ButtonIcon, HintCard, MascotSlot, ScreenShell } from '@/components'
import { CloseIcon, EyeIcon } from '@/components/icons'
import { Bucket, getTerm, keyPhrase, sessionTotals, setPractising, TOTAL_TERMS, typedByChoice, useSession, XP } from '@/lib/session'
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
const ORDER_SETTLED: Bucket[] = ['Unaided', 'Hinted', 'Revealed', 'Worth revisiting']
const ORDER_WITH_MISSES: Bucket[] = ['Worth revisiting', 'Revealed', 'Hinted', 'Unaided']

/** Which of the sheet's three content states a bucket opens. */
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
  const totals = sessionTotals(state)
  const complete = outcomes.length === TOTAL_TERMS
  const needsRevisiting = outcomes.some(
    (o) => o.bucket === 'Worth revisiting' || o.bucket === 'Revealed' || (o.calibration ?? 0) < 0,
  )
  const order = needsRevisiting ? ORDER_WITH_MISSES : ORDER_SETTLED
  /** Terms the student got to in the end, with or without a hint. */
  const resolved = outcomes.filter((o) => o.bucket === 'Unaided' || o.bucket === 'Hinted').length
  // Terms the mic failed on and the student skipped are not counted against them
  // (designer, 2026-10-12): they leave the "of N" as well as the misses.
  const micTrouble = outcomes.filter((o) => o.micTrouble).length
  const counted = (complete ? TOTAL_TERMS : outcomes.length) - micTrouble

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
        {/* XL, not 2XL: the rows are the content, and at 2XL only one showed above the
            fold at 390x668 (UX critic, 2026-10-13). */}
        <MascotSlot size="XL" expression={needsRevisiting ? 'determined' : 'laughing'} className={styles.mascotCentred} />
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
                : `You can say ${totals.unaided} of ${counted} back without help`}
          </h1>
          {/* The wins by name, in the caption rather than a coloured line of their own:
              the misses lead the list, so this is where the first viewport says what
              the student CAN do (Knowunity design review; UX critic, 2026-10-13). */}
          {outcomes.length > 0 && (unaidedNames.length > 0 && unaidedNames.length < counted || resolved > totals.unaided) && (
            <p className="screenTitleCaption">
              {[
                unaidedNames.length > 0 && unaidedNames.length < counted ? `Without help: ${unaidedNames.join(', ')}.` : null,
                resolved > totals.unaided ? `${resolved - totals.unaided} more with a hint.` : null,
              ]
                .filter(Boolean)
                .join(' ')}
            </p>
          )}
        </div>
        {strip.length > 0 && (
          <div
            className={styles.strip}
            role="img"
            aria-label={strip.map((o) => `${getTerm(o.index)?.name}: ${o.micTrouble ? 'mic missed it' : o.bucket}`).join(', ')}
          >
            {strip.map((o) => (
              <span key={o.index} className={styles.segment} data-bucket={o.micTrouble ? 'mic' : o.bucket} />
            ))}
          </div>
        )}
      </div>

      {/* XP and time, one line, not three coloured tiles with 9px labels; the working
          behind it on a tap (senior review, 2026-10-12). The sum still has to be on
          the screen and add up, so it is one tap away rather than gone. */}
      {outcomes.length > 0 && (
        <details className={styles.summaryGroup}>
          <summary className={styles.summary}>
            {`\u26a1 +${xpShown} XP \u00b7 ${totals.elapsed}`}
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
            <p className={styles.working}>{`Typed answers earn ${XP.hinted} XP and said ones ${XP.unaided}: saying it out loud is the skill this practises.`}</p>
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
              <h2 className={styles.bucketLabel}>{`${bucket} · ${rows.length}`}</h2>
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
                        <span className={styles.rowNote}>You were sure about this one.</span>
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
        <section className={styles.learned} aria-labelledby="learned-heading">
          <h2 id="learned-heading" className="screenTitleHeading">You learned something new!</h2>
          {learnedTerms.map((t) => (
            <HintCard key={t.index} className={styles.learnedCard} label={`New today · ${t.name}`} body={t.answer} />
          ))}
        </section>
      )}
    </ScreenShell>
  )
}
