'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppBar, Button, PickerRow, ScreenShell, TextInput } from '@/components'
import { CloseIcon } from '@/components/icons'
import { PICKER_DRILLS, PICKER_TOPICS, setDrillTerm, setPractising, startRun, TOTAL_TERMS } from '@/lib/session'
import styles from './picker.module.css'

// Picker — Figma frame "Picker page — Say It Back + drill down" (15810:11285). History: docs/code-history.md#h-045

export default function PickerPage() {
  const router = useRouter()
  // The search filters both lists (usability review, 2026-10-12). It had no handler, so
  // typing changed nothing — a control on a screen of gated material that did nothing.
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const topics = PICKER_TOPICS.filter((t) => t.label.toLowerCase().includes(q))
  const drills = PICKER_DRILLS.filter((d) => d.label.toLowerCase().includes(q))
  const empty = topics.length === 0 && drills.length === 0
  // The topic this student was seeded with, the one their last run used.
  const resumeTopic = PICKER_TOPICS.find((t) => t.seeded) ?? PICKER_TOPICS[0]
  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Close" onLeft={() => router.push('/home/unlocked')} />
      }
      // One tap to recall for a returning student, as the popup is for a new one
      // (designer, 2026-10-12, option 4c): the chip's two destinations stay — first run
      // straight in, then the picker — but both are now one tap from a question. The
      // rows below are the choice for anyone who wants another topic or a drill.
      bottomContent={
        <Button CTA={`Start ${resumeTopic.label}`} variant="Primary" size="M" fullWidth onClick={() => router.push(startRun())} />
      }
    >
      <div className={styles.body}>
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Say It Back</h1>
          {/* The guide (designer, 2026-10-13): name the quiz to pick, here and on the row. */}
          <p className="screenTitleCaption">{`Pick ${resumeTopic.label} to start: ${TOTAL_TERMS} definitions, said back in your own words.`}</p>
        </div>
        <TextInput type="search" label="Search your topics" placeholder="Search your topics" value={query} onChange={setQuery} />
        {/* Announced, so a screen-reader user hears that the lists emptied. */}
        <p className={empty ? styles.note : 'srOnly'} role="status">
          {empty ? `Nothing matches \u201c${query.trim()}\u201d.` : ''}
        </p>

        {topics.length > 0 && (
          <section className={styles.group}>
            <h2 className={styles.groupLabel}>Your topics</h2>
            {topics.map((topic) =>
              topic.seeded ? (
                // The quiz this session runs: ringed in the brand colour, labelled "Start
                // here", so the first choice on the screen is never a guess.
                <div key={topic.label} className={styles.guided}>
                  <p className={styles.guidedLabel} id="start-here">Start here</p>
                  <PickerRow variant="topic" label={topic.label} aria-describedby="start-here" onClick={() => router.push(startRun())} />
                </div>
              ) : (
                <PickerRow key={topic.label} variant="topic" label={topic.label} onClick={() => router.push(startRun())} />
              ),
            )}
          </section>
        )}

        {drills.length > 0 && (
          <section className={styles.group}>
            <h2 className={styles.groupLabel}>Drill a definition</h2>
            <p className={styles.note}>
              Definitions you&rsquo;ve attempted. Amber ones need the most work.
            </p>
            {drills.map((d) => (
              <PickerRow
                key={d.label}
                variant="drill"
                label={d.label}
                state={d.state}
                onClick={() => {
                  setPractising(false)
                  setDrillTerm(d.term)
                  router.push('/drill/intro')
                }}
              />
            ))}
          </section>
        )}
      </div>
    </ScreenShell>
  )
}
