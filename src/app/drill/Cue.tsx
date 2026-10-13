import { Fragment } from 'react'
import styles from './drill.module.css'

// A thinned definition, with its blanks DRAWN rather than typed. History: docs/code-history.md#h-009

export function Cue({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      <CueText text={text} />
    </p>
  )
}

/** The cue's run of text and drawn blanks, without the paragraph — for a host that is
    already one, like HintCard's body on 05 Miss's second rung. */
export function CueText({ text }: { text: string }) {
  const parts = text.split(/(_+)/)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('_') ? (
          <span
            key={i}
            className={styles.blank}
            style={{ ['--blank-length' as string]: part.length }}
            // Continues a word ("e____"): no space before it, so the letter stays on it.
            data-joined={i > 0 && /\S$/.test(parts[i - 1]) ? '' : undefined}
            role="img"
            aria-label="blank"
          />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}
