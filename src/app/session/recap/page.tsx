'use client'

import { useRouter } from 'next/navigation'
import { openSheet } from '@/lib/navigation'
import { actionRowClass, AppBar, Button, ButtonIcon, MascotSlot, ScreenShell, StatChip } from '@/components'
import { CloseIcon, EyeIcon } from '@/components/icons'
import {
  Bucket,
  getTerm,
  sessionTotals,
  shuffledFirstTerm,
  startSession,
  TOTAL_TERMS,
  useSession,
  XP,
} from '@/lib/session'
import styles from './recap.module.css'

// 07 Recap — Figma frame "07 Recap (refreshed)" (15672:24456).
//
// Four buckets, per-term XP, and the stat chips. Derived from the actual run: a
// summary whose job is to avoid flattery cannot show a number the reviewer can see is
// wrong (Design Brief: "overconfidence has to cost something").
//
// Confidence reorders rather than relabels — a term the student was sure about and got
// wrong sorts to the top of Worth revisiting. That is the whole surfacing mechanism;
// there is no badge (decided 2026-09-20).

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

  const outcomes = state.outcomes
  const totals = sessionTotals(state)
  const complete = outcomes.length === TOTAL_TERMS
  const needsRevisiting = outcomes.some(
    (o) => o.bucket === 'Worth revisiting' || o.bucket === 'Revealed' || (o.calibration ?? 0) < 0,
  )
  const order = needsRevisiting ? ORDER_WITH_MISSES : ORDER_SETTLED
  /** Terms the student got to in the end, with or without a hint. */
  const resolved = outcomes.filter((o) => o.bucket === 'Unaided' || o.bucket === 'Hinted').length
  const rough = resolved <= outcomes.length / 2

  // "Run it again" re-presents the same terms shuffled. It restarts the session so the Time
  // stat measures this run, not the one before it.
  function tryAgain() {
    startSession()
    router.push(`/session/idle/${shuffledFirstTerm()}`)
  }

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => router.push('/home/unlocked')} />
      }
      bottomContent={
        <div className={styles.actions}>
          {/* The two real choices share a row; the practice offer is the link beneath.
              Three stacked full-width buttons measured 176 against a 136 budget, and
              gave a targeted second pass the same weight as ending the session. Recap's
              conditional promotion on a rough run stays — that one is deliberate. */}
          {/* FIXED POSITIONS. Promotion moves the emphasis, not the button.
              Both the label and the variant used to swap, so the white pill stayed on
              the left and changed meaning with the run — tapping by position got you
              the opposite action depending on how you had done. Two students hit that
              independently. "Run it again" is always left, "Done" is always right, and
              a rough run only changes which one is Primary. */}
          <div className={actionRowClass}>
            <Button
              CTA="Run it again"
              variant={rough ? 'Primary' : 'Secondary'}
              size="M"
              onClick={tryAgain}
            />
            <Button
              CTA="Done"
              variant={rough ? 'Secondary' : 'Primary'}
              size="M"
              onClick={() => router.push('/home/unlocked')}
            />
          </div>
          <Button
            CTA="Practice what I missed"
            variant="Tertiary"
            size="S"
            fullWidth
            onClick={() => router.push('/session/recap/practice')}
          />
        </div>
      }
    >
      {/* design-system.md § "Mascot poses" assigns laughing to 07 Recap. Its absence
          was found independently in both scorecards. */}
      <div className={styles.headline}>
        <MascotSlot size="2XL" expression="laughing" className={styles.mascotCentred} />
        {/* Headline S over Body M Regular, as the frames set a screen title — not
            TextBlock's L, which renders 44px. See door.module.css for the same note;
            the evidence there is a direct read of the Quiz complete frame. */}
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Session recap</h1>
          {/* Leads with where the student ENDED UP, then how much of it was cold.
              It used to say only "You explained N of 4 without help" — true, and the
              only thing on the screen, so a student who got three of four right in the
              end read a flat 1-of-4 as the verdict on the session. Both halves are
              facts; showing only the deficit is a choice, and it was making an honest
              screen read as an accusation. `resolved` is the same Unaided+Hinted count
              the action row already uses to decide what to offer next. */}
          {outcomes.length > 0 && (
            <p className="screenTitleCaption">
              {`You got ${resolved} of ${complete ? TOTAL_TERMS : outcomes.length} in the end. ` +
                `${totals.unaided} first time, no help.`}
            </p>
          )}
        </div>
      </div>

      {outcomes.length > 0 && (
        <div className={styles.stats}>
          {/* The bonus is only real once the set is finished, which is the whole reason
              it exists. Before that it is still up for grabs, as the exit sheet says. */}
          <StatChip stat="XP" value={`+${complete ? totals.withBonus : totals.earned}`} />
          {/* Not a percentage, and not called a score. The chip measured
              first-attempt-with-no-help and printed it as "SCORE 25%", which invites
              comparison with a test mark — and a count cannot be misread that way.
              The `Score` variant is unchanged; only its label is. */}
          <StatChip stat="Score" label="FIRST TRY" value={`${totals.unaided} of ${complete ? TOTAL_TERMS : outcomes.length}`} />
          <StatChip stat="Time" value={totals.elapsed} />
        </div>
      )}

      {/* THE WORKING. The XP chip folds in the confidence adjustment and the finishing
          bonus; the rows below show each term's base XP. So the chip read +19 while the
          rows added to 20, and nothing on screen reconciled them — on the one screen
          whose job is to avoid flattery, and whose own header comment quotes the brief:
          "a summary cannot show a number the reviewer can see is wrong". Every part of
          the sum is now on screen and adds up. */}
      {outcomes.length > 0 && (totals.calibration !== 0 || complete) && (
        <p className={styles.working}>
          {[
            `+${totals.termXp} from the terms below`,
            totals.calibration !== 0
              ? `${totals.calibration > 0 ? '+' : ''}${totals.calibration} for how sure you were`
              : null,
            complete ? `+${XP.completionBonus} for finishing` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      <div className={styles.buckets}>
        {outcomes.length === 0 && state && (
          <p className={styles.empty}>Nothing recorded yet — this session hasn&rsquo;t been run.</p>
        )}
        {order.map((bucket) => {
          const rows = outcomes
            .filter((o) => o.bucket === bucket)
            // Confidently-wrong sorts first. The signal drives the list, it doesn't decorate it.
            .sort((a, b) => Number(b.wasSure ?? false) - Number(a.wasSure ?? false))
          if (!rows.length) return null
          return (
            <section key={bucket} className={styles.bucket}>
              <h2 className={styles.bucketLabel}>{`${bucket} · ${rows.length}`}</h2>
              {rows.map((row) => (
                <div key={row.index} className={styles.row}>
                  <span className={styles.rowTerm}>
                    {getTerm(row.index)?.name}
                    {/* Any term the student was sure about and did not get first
                        time, not only the skipped ones. Gated to 'Worth revisiting' it
                        missed exactly the case the brief cares about: sure, wrong, and
                        then hinted or revealed — which since sureWrong went to 0 carries
                        no cost either, so the run showed nothing at all. */}
                    {row.wasSure && bucket !== 'Unaided' && (
                      <span className={styles.rowNote}>You were sure about this one.</span>
                    )}
                  </span>
                  <span className={styles.rowXp}>{`+${row.xp} XP`}</span>
                  {/* Every row opens its transcript. The sheet adapts by bucket, so a
                      skipped term shows the answer alone rather than a take that
                      never happened. */}
                  <ButtonIcon
                    variant="Overlay"
                    size="S"
                    icon={<EyeIcon />}
                    label={`See what you said for ${getTerm(row.index)?.name}`}
                    onClick={() => openSheet(router, `/session/transcript/${TRANSCRIPT_BUCKET[bucket]}?term=${row.index}`)}
                  />
                </div>
              ))}
            </section>
          )
        })}
      </div>
    </ScreenShell>
  )
}
