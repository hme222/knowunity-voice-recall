'use client'

import { useRouter } from 'next/navigation'
import { openSheet } from '@/lib/navigation'
import { AppBar, Button, ButtonIcon, MascotSlot, ScreenShell, StatChip, TextBlock } from '@/components'
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

const ORDER: Bucket[] = ['Unaided', 'Hinted', 'Revealed', 'Worth revisiting']

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
  const rough = outcomes.filter((o) => o.bucket === 'Unaided' || o.bucket === 'Hinted').length <= outcomes.length / 2

  // Try again re-presents the same terms shuffled. It restarts the session so the Time
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
          <Button
            CTA={rough ? 'Try again' : 'Done'}
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => (rough ? tryAgain() : router.push('/home/unlocked'))}
          />
          <Button
            CTA={rough ? 'Done' : 'Try again'}
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => (rough ? router.push('/home/unlocked') : tryAgain())}
          />
          <Button
            CTA="Practice what I missed"
            variant="Tertiary"
            size="M"
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
        <TextBlock
          variant="L"
          title="Session recap"
          caption={
            outcomes.length === 0
              ? undefined
              : complete
                ? `You explained ${totals.unaided} of ${TOTAL_TERMS} without help. +${totals.earned} earned, +${XP.completionBonus} for finishing.`
                : `You explained ${totals.unaided} of ${outcomes.length} without help.`
          }
          showCaption={outcomes.length > 0}
        />
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
        {ORDER.map((bucket) => {
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
