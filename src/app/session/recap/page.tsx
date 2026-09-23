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
  const rough = outcomes.filter((o) => o.bucket === 'Unaided' || o.bucket === 'Hinted').length <= outcomes.length / 2

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
          <div className={actionRowClass}>
            <Button
              CTA={rough ? 'Run it again' : 'Done'}
              variant="Primary"
              size="M"
              onClick={() => (rough ? tryAgain() : router.push('/home/unlocked'))}
            />
            <Button
              CTA={rough ? 'Done' : 'Run it again'}
              variant="Secondary"
              size="M"
              onClick={() => (rough ? router.push('/home/unlocked') : tryAgain())}
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
          {outcomes.length > 0 && (
            <p className="screenTitleCaption">
              {complete
                ? `You explained ${totals.unaided} of ${TOTAL_TERMS} without help. +${totals.earned} earned, +${XP.completionBonus} for finishing.`
                : `You explained ${totals.unaided} of ${outcomes.length} without help.`}
            </p>
          )}
        </div>
      </div>

      {outcomes.length > 0 && (
        <div className={styles.stats}>
          {/* The bonus is only real once the set is finished, which is the whole reason
              it exists. Before that it is still up for grabs, as the exit sheet says. */}
          <StatChip stat="XP" value={`+${complete ? totals.withBonus : totals.earned}`} />
          <StatChip stat="Score" value={`${totals.score}%`} />
          <StatChip stat="Time" value={totals.elapsed} />
        </div>
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
                    {row.wasSure && bucket === 'Worth revisiting' && (
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
