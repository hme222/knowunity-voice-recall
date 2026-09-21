import styles from './TrainingLog.module.css'

// Mirrors the Figma component `trainingLog` (15813:37292) — the "what you climbed"
// list on the drill's Complete screen.
//
// Row count is VARIABLE. The drill has no fixed length, so this shows however many
// passes actually happened. Figma's sample has four and its footer says "all four
// takes"; that copy is a leftover from the fixed ladder and is not reproduced here.

export type TrainingLogRound = {
  /** e.g. "Round 2 · One word gone". */
  label: string
  /** The last, fully unaided round — the one that ended the drill. */
  final?: boolean
}

export type TrainingLogProps = {
  rounds: TrainingLogRound[]
  /** Tapping a round opens that take's transcript. */
  onSelect?: (index: number) => void
  className?: string
}

export function TrainingLog({ rounds, onSelect, className }: TrainingLogProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <h3 className={styles.heading}>What you climbed</h3>
      {rounds.map((round, i) => (
        <button
          key={round.label}
          type="button"
          className={styles.row}
          data-final={round.final}
          onClick={() => onSelect?.(i)}
        >
          {round.label}
        </button>
      ))}
      <p className={styles.footer}>
        {rounds.length === 1
          ? 'Tap the round to see what you said.'
          : `Tap any round to see all ${rounds.length} takes.`}
      </p>
    </div>
  )
}
