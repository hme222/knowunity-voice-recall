import styles from './ChatBubble.module.css'

// Mirrors the Figma component `chatBubble` (15651:10673).

export type ChatBubbleProps = {
  /** Figma `showTitle` (default false). On only when this bubble opens a new question. */
  showTitle?: boolean
  /** The title layer, e.g. "Ready when you are". */
  title?: string
  /** The body layer: Knowie's spoken-back response, as text. */
  body: string
  className?: string
}

export function ChatBubble({ showTitle = false, title, body, className }: ChatBubbleProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {showTitle && title && <p className={styles.title}>{title}</p>}
      <p className={styles.body}>{body}</p>
    </div>
  )
}
