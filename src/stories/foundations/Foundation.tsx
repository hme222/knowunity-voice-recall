import type { ReactNode } from 'react'
import { NO_DESCRIPTION, type Token } from './tokens'

// Shared layout for the Foundations stories. Every value here is a token.

const px = (cssVar: string) => `calc(var(${cssVar}) * 1px)`

export function Page({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: px('--spacing-semantic-screen-margin'),
        display: 'flex',
        flexDirection: 'column',
        gap: px('--spacing-semantic-between-sections'),
      }}
    >
      {children}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: px('--size-primitive-space-300') }}>
      <h2
        style={{
          margin: 0,
          fontSize: px('--typography-style-headline-s-font-size'),
          lineHeight: px('--typography-style-headline-s-line-height'),
          fontWeight: 'var(--typography-style-headline-s-font-weight)',
          color: 'var(--color-semantic-text-primary)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Token name, resolved value, and description. `preview` is the visual sample. */
export function Row({
  token,
  resolved,
  preview,
  previewWidth,
}: {
  token: Token
  resolved: ReactNode
  preview: ReactNode
  previewWidth?: number | string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: previewWidth ? `${typeof previewWidth === 'number' ? previewWidth + 'px' : previewWidth} 1fr` : '1fr',
        gap: px('--size-primitive-space-300'),
        alignItems: 'start',
        paddingBottom: px('--size-primitive-space-300'),
        borderBottom: `${px('--size-primitive-stroke-border')} solid var(--color-semantic-border-default)`,
      }}
    >
      {preview}
      <Meta token={token} resolved={resolved} />
    </div>
  )
}

export function Meta({ token, resolved }: { token: Token; resolved: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: px('--size-primitive-space-050'), minWidth: 0 }}>
      <code
        style={{
          fontSize: px('--typography-primitive-font-size-sm'),
          lineHeight: px('--typography-primitive-line-height-sm'),
          color: 'var(--color-semantic-text-primary)',
          overflowWrap: 'anywhere',
        }}
      >
        {token.path}
      </code>
      <code
        style={{
          fontSize: px('--typography-primitive-font-size-xs'),
          lineHeight: px('--typography-primitive-line-height-xs'),
          color: 'var(--color-semantic-text-secondary)',
        }}
      >
        {resolved}
      </code>
      <p
        style={{
          margin: 0,
          fontSize: px('--typography-primitive-font-size-xs'),
          lineHeight: px('--typography-primitive-line-height-xs'),
          color: token.hasDescription
            ? 'var(--color-semantic-text-secondary)'
            : 'var(--color-semantic-text-warning)',
          fontStyle: token.hasDescription ? 'normal' : 'italic',
        }}
      >
        {token.hasDescription ? token.description : NO_DESCRIPTION}
      </p>
    </div>
  )
}
