'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, ScreenShell } from '@/components'
import { startSession, TOTAL_TERMS } from '@/lib/session'
import styles from './start.module.css'

// THE FIRST SCREEN IS A START SCREEN: what this is, the path, and what to know before testing it. History: docs/code-history.md#h-087

// Rewritten 2026-10-12 after a UX and copy review: the screen is a prototype brief, so it says so; the story steps… History: docs/code-history.md#h-088
const STORY = [
  { title: 'Tap Say It Back', body: `Explain ${TOTAL_TERMS} definitions` },
  { title: 'Get a verdict', body: 'A pass, a hint, or the answer' },
  { title: 'See how it landed', body: 'What stuck, what’s next' },
]

const TO_TEST = [
  // Tap, not hold: the mic is tap to start, Submit to send. And the guided run is one
  // definition, so "question 1" named a numbering it never shows (usability review,
  // 2026-10-12).
  'Record 5+ seconds, then Send, to pass; 2–5 is partly right.',
  // Question 2 since 2026-10-12, so question 1 shows a clean pass first.
  'Under 2 seconds it can’t hear you. Question 2’s first try does this on purpose.',
  'No mic? Every question has Type instead.',
]

export default function StartPage() {
  const router = useRouter()
  return (
    <ScreenShell
      bottomContent={
        <Button CTA="Start" variant="Primary" size="M" fullWidth onClick={() => {
            // A fresh run. State from a previous visit (a practice round, the old clock)
            // used to carry straight in: a correct answer showed +0 and the next step
            // opened the old round's drill (2026-10-12). 00 Intro starts one too.
            startSession()
            router.push('/home/unlock')
          }} />
      }
    >
      <div className={styles.body}>
        {/* Knowie beside the title, not above it (designer, 2026-10-12: "Knowie on the
            first screen"). Stacked, Knowie needed 136px the screen does not have at
            390x668 and stepped out; side by side it costs about 30. */}
        <div className={styles.hero}>
          {/* `excited`: the design system's face for an invitation with energy, as on
              00 Intro and the mic primer (designer, 2026-10-12). */}
          <MascotSlot size="2XL" expression="excited" />
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Prototype · Knowunity</p>
            {/* The feature named as one, a proper noun in capitals, "feature" a plain word (designer, 2026-10-14). */}
            <h1 className={styles.heroTitle}>Say It Back feature</h1>
            <p className={styles.heroCaption}>Explain a definition in your own words to prove it stuck.</p>
          </div>
        </div>

        {/* No visible heading: the numbered steps say what they are. */}
        <section className={styles.block} aria-label="The story">
          <ol className={styles.story}>
            {STORY.map((step, i) => (
              <li key={step.title} className={styles.storyStep}>
                <span className={styles.number} aria-hidden="true">{i + 1}</span>
                <span>
                  <span className={styles.storyTitle}>{step.title}</span>
                  <span className={styles.storyBody}>{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.block} aria-labelledby="test-heading">
          <h2 id="test-heading" className={styles.blockHeading}>To test it · about 2 minutes</h2>
          <ul className={styles.notes}>
            {TO_TEST.map((note) => (
              <li key={note} className={styles.note}>{note}</li>
            ))}
          </ul>
        </section>
      </div>
    </ScreenShell>
  )
}
