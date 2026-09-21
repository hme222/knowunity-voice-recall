'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, ScreenShell, StatChip, TextBlock } from '@/components'
import { CloseIcon } from '@/components/icons'
import {
  Bucket,
  getTerm,
  useSession,
  sessionTotals,
  TOTAL_TERMS,
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

export default function RecapPage() {
  const router = useRouter()
  // useSession wraps sessionStorage in useSyncExternalStore: a server snapshot means
  // no hydration mismatch, and no setState-in-effect.
  const state = useSession()

  const outcomes = state.outcomes
  const totals = sessionTotals(state)
  const rough = outcomes.filter((o) => o.bucket === 'Unaided' || o.bucket === 'Hinted').length <= outcomes.length / 2

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => router.push('/')} />
      }
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA={rough ? 'Try again' : 'Continue'}
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(rough ? '/session/idle/1' : '/')}
          />
          <Button
            CTA={rough ? 'Continue' : 'Try again'}
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push(rough ? '/' : '/session/idle/1')}
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
      <div className={styles.headline}>
        <TextBlock
          variant="L"
          title="Session recap"
          caption={
            totals
              ? `You explained ${totals.unaided} of ${outcomes.length || TOTAL_TERMS} without help.`
              : 'Adding up your session…'
          }
        />
      </div>

      {totals && (
        <div className={styles.stats}>
          <StatChip stat="XP" value={`+${totals.earned}`} />
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
                </div>
              ))}
            </section>
          )
        })}
      </div>
    </ScreenShell>
  )
}
