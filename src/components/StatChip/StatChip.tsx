import { ScoreIcon, TimeIcon, XpIcon } from '../icons'
import styles from './StatChip.module.css'

// Mirrors the Figma component set `statChip` (15729:11868): one `stat` variant.

export const STAT_CHIP_STATS = ['XP', 'Score', 'Time'] as const
export type StatChipStat = (typeof STAT_CHIP_STATS)[number]

// Figma's label text, verbatim. Full caps here conflicts with design-system.md's sentence-case rule; matched to Figma on request.
const LABELS: Record<StatChipStat, string> = { XP: 'XP', Score: 'SCORE', Time: 'TIME' }
const ICONS: Record<StatChipStat, (props: { className?: string }) => React.JSX.Element> = { XP: XpIcon, Score: ScoreIcon, Time: TimeIcon }

export type StatChipProps = {
  /** Figma `stat`. Sets the accent colour, icon and label. */
  stat?: StatChipStat
  /** The value shown, e.g. "+75", "75%", "2:28". Figma samples these as fixed text. */
  value: string
  /**
   * Overrides the printed label, keeping the `stat` variant's colour and icon.
   *
   * Exists because the Score chip's Figma label is the word SCORE, and 07 Recap does
   * not show a score: it shows how many terms were answered first time with no help.
   * Two students in testing read 25% as a mark out of a hundred on a session where they
   * had ended up right on three of four. The variant is still `Score` — same binding,
   * same icon — only the word changes, and only where the word was wrong.
   */
  label?: string
  className?: string
}

export function StatChip({ stat = 'XP', value, label, className }: StatChipProps) {
  const Icon = ICONS[stat]
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-stat={stat}>
      <span className={styles.label}>{label ?? LABELS[stat]}</span>
      <span className={styles.valueRow}>
        <span className={styles.icon}><Icon /></span>
        <span className={styles.value}>{value}</span>
      </span>
    </div>
  )
}
