'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, MascotSlot, PickerRow, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { PICKER_DRILLS, PICKER_TOPICS, startRun } from '@/lib/session'
import styles from './picker.module.css'

// Picker — Figma frame "Picker page — Say It Back + drill down" (15810:11285). History: docs/code-history.md#h-045

export default function PickerPage() {
  const router = useRouter()
  // The topic this student was seeded with, the one their last run used.
  const resumeTopic = PICKER_TOPICS.find((t) => t.seeded) ?? PICKER_TOPICS[0]
  return (
    <ScreenShell
      // Knowie stays, smaller if the lists run long; the lists scroll (2026-10-13).
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
        {/* Knowie, inviting (designer, 2026-10-13: "add Knowie"). */}
        {/* `questioning`: Knowie asks which one; home, just before, is `excited` (designer, 2026-10-14: the face changes with the moment, so no two screens in a row look the same). */}
        <MascotSlot size="2XL" expression="questioning" className={styles.mascot} />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Say It Back</h1>
          {/* The guide (designer, 2026-10-13): name the quiz to pick, here and on the row. */}
          {/* One line, so the topics and the drill link fit without scrolling (designer,
              2026-10-14); the count is on the intro and the bar. */}
          {/* Gives way on a short screen: "Start here" and the Start button say it too. */}
          <p className="screenTitleCaption" data-gives-way>{`Pick ${resumeTopic.label} to start.`}</p>
        </div>
        {/* No search box, and the drills behind one row (designer, 2026-10-14: fit
            without scrolling). The prototype has three topics; a search over three
            rows was a control with nothing to find. The other rows' cards recede while
            the guide shows; their words never do (2026-10-14). */}
        <section className={styles.group}>
          <h2 className={styles.groupLabel} data-gives-way>Your topics</h2>
          {PICKER_TOPICS.map((topic) =>
            topic.seeded ? (
              // The quiz this session runs: ringed in the brand colour, labelled "Start
              // here", so the first choice on the screen is never a guess.
              <div key={topic.label} className={styles.guided}>
                <p className={styles.guidedLabel} id="start-here">Start here</p>
                <PickerRow variant="topic" label={topic.label} aria-describedby="start-here" onClick={() => router.push(startRun())} />
              </div>
            ) : (
              <PickerRow key={topic.label} className={styles.recededRow} variant="topic" label={topic.label} onClick={() => router.push(startRun())} />
            ),
          )}
        </section>

        {/* The drills as a link, not a section: the four definitions open in their own
            sheet (/picker/drills). A heading and a full row cost 64 more than this. */}
        <Button CTA={`Or try Definition Drill Down (${PICKER_DRILLS.length})`} variant="Tertiary" size="S" fullWidth onClick={() => router.push('/picker/drills')} />
      </div>
    </ScreenShell>
  )
}
