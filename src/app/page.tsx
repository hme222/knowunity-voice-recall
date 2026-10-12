'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, ScreenShell } from '@/components'
import styles from './start.module.css'

// THE FIRST SCREEN IS A START SCREEN: what this is, the path, and what to know before
// testing it. Not part of the product.
//
// Rebuilt 2026-10-12 (designer: "feels confusing, provide key information for flow").
// The five-step list described the journey but left out the two facts a reviewer needs
// to actually drive it: there is no speech recognition, so how long you hold the mic
// decides the result, and the first try on question 1 is scripted to miss you so that
// state is always seen. The thresholds below are verdictFor's in src/lib/session.ts —
// change them together.
//
// Start goes where a student meets the feature: the quiz-complete door, then the mic
// primer, then the session. Baseline home is at /home.

const PATH = ['Finish a Chemistry quiz', 'Say it back', 'See what you learned']

const GOOD_TO_KNOW = [
  'No speech recognition: hold the mic 5s+ for correct, 2–5s for partly right.',
  'Under 2s it misses you, and question 1 always does once.',
  'No mic? Type instead. X leaves anytime.',
]

export default function StartPage() {
  const router = useRouter()
  return (
    <ScreenShell
      bottomContent={
        <Button CTA="Start" variant="Primary" size="M" fullWidth onClick={() => router.push('/door/quiz')} />
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="laughing" />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Say It Back</h1>
          <p className="screenTitleCaption">A Knowunity prototype. Say a definition back; Knowie checks it.</p>
        </div>

        <section className={styles.block} aria-labelledby="path-heading">
          <h2 id="path-heading" className={styles.blockHeading}>What you’ll do</h2>
          <ol className={styles.path}>
            {PATH.map((step, i) => (
              <li key={step} className={styles.pathStep}>
                <span className={styles.number} aria-hidden="true">{i + 1}</span>
                <span className={styles.pathLabel}>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.block} aria-labelledby="know-heading">
          <h2 id="know-heading" className={styles.blockHeading}>Good to know</h2>
          <ul className={styles.notes}>
            {GOOD_TO_KNOW.map((note) => (
              <li key={note} className={styles.stepBody}>{note}</li>
            ))}
          </ul>
        </section>
      </div>
    </ScreenShell>
  )
}
