import { Fragment } from 'react'
import styles from './drill.module.css'

// A thinned definition, with its blanks DRAWN rather than typed.
//
// The cues store their gaps as runs of underscores. Rendered as text in Greed those
// come out as a row of separate dashes — the glyph does not span its advance width —
// so a blank read as several small marks instead of one line. Before that they were
// literal U+25A2 WHITE SQUARE characters, which read as boxes.
//
// Both attempts were the same mistake: a blank is a piece of UI, not a character. This
// draws each run as a rule sized in `ch` from the number of letters removed, so the gap
// is proportional to the word, continuous at any font size, and independent of whatever
// the typeface does with `_`.
//
// It announces as "blank" rather than letting a screen reader read the underscores out.

export function Cue({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(_+)/)
  return (
    <p className={className}>
      {parts.map((part, i) =>
        part.startsWith('_') ? (
          <span
            key={i}
            className={styles.blank}
            style={{ ['--blank-length' as string]: part.length }}
            role="img"
            aria-label="blank"
          />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </p>
  )
}
