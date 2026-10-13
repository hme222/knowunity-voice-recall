import styles from './TextInput.module.css'

// No Figma counterpart. Promoted 2026-10-13 from two inline copies — the typed answer
// box (/text/turn) and the picker's search — which component-gaps.md said to promote
// "when a second screen takes typed input" (system critic, 2026-10-13).

export const TEXT_INPUT_VARIANTS = ['single', 'multi'] as const

export type TextInputProps = {
  /** `single` is a one-line pill (search); `multi` is the answer box. */
  variant?: (typeof TEXT_INPUT_VARIANTS)[number]
  /** The accessible name. There is no visible label: the placeholder and the screen say what goes here. */
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** `search` for a filter field. Single-line only. */
  type?: 'text' | 'search'
  /** The id of a note that explains the field (e.g. why Send is disabled). */
  describedBy?: string
  className?: string
}

export function TextInput({ variant = 'single', label, value, onChange, placeholder, type = 'text', describedBy, className }: TextInputProps) {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return variant === 'multi' ? (
    <textarea
      className={cls}
      data-variant="multi"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      aria-describedby={describedBy}
    />
  ) : (
    <input
      className={cls}
      data-variant="single"
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      aria-describedby={describedBy}
    />
  )
}
