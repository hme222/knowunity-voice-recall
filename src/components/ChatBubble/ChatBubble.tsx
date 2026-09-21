import styles from './ChatBubble.module.css'

// Mirrors the Figma component `chatBubble` (15651:10673).

export type ChatBubbleProps = {
  /** Figma `showTitle` (default false). On only when this bubble opens a new question. */
  showTitle?: boolean
  /** The title layer, e.g. "Ready when you are". */
  title?: string
  /**
   * The accented tail of the title, rendered in brand.bold after `title`. 01 Idle
   * (15672:26255) reads "Explain:" in white then "Formal charge" in violet — the term
   * is picked out of its own prompt. The build rendered the whole line white, so the
   * one word the screen is about had no emphasis at all.
   */
  titleAccent?: string
  /** The body layer: Knowie's spoken-back response, as text. */
  body: string
  className?: string
}

export function ChatBubble({ showTitle = false, title, titleAccent, body, className }: ChatBubbleProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {showTitle && title && (
        <p className={styles.title}>
          {title}
          {titleAccent && <span className={styles.titleAccent}>{titleAccent}</span>}
        </p>
      )}
      <p className={styles.body}>{body}</p>
    </div>
  )
}
