import { Fragment } from 'react'
import styles from './drill.module.css'

// A thinned definition, with its blanks DRAWN rather than typed. History: docs/code-history.md#h-009

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
