import { ScoreIcon, TimeIcon, XpIcon } from '../icons'
import styles from './StatChip.module.css'

// Mirrors the Figma component set `statChip` (15729:11868): one `stat` variant.

export const STAT_CHIP_STATS = ['XP', 'Score', 'Time'] as const
export type StatChipStat = (typeof STAT_CHIP_STATS)[number]

const LABELS: Record<StatChipStat, string> = { XP: 'XP', Score: 'Score', Time: 'Time' }
const ICONS: Record<StatChipStat, (props: { className?: string }) => React.JSX.Element> = { XP: XpIcon, Score: ScoreIcon, Time: TimeIcon }

export type StatChipProps = {
  /** Figma `stat`. Sets the accent colour, icon and label. */
  stat?: StatChipStat
  /** The value shown, e.g. "+75", "75%", "2:28". Figma samples these as fixed text. */
  value: string
  className?: string
}

export function StatChip({ stat = 'XP', value, className }: StatChipProps) {
  const Icon = ICONS[stat]
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-stat={stat}>
      <span className={styles.label}>{LABELS[stat]}</span>
      <span className={styles.valueRow}>
        <span className={styles.icon}><Icon /></span>
        <span className={styles.value}>{value}</span>
      </span>
    </div>
  )
}
