import { useState } from 'react'
import tokens from '../../../tokens/tokens.json'

// Reads tokens/tokens.json (source, with $description) and pairs each token
// with the CSS variable Style Dictionary generates for it (build/css/tokens.css).

export type Token = {
  path: string // e.g. color.semantic.text.primary
  cssVar: string // e.g. --color-semantic-text-primary
  type: string
  value: unknown // raw $value, may be a {reference}
  description: string // $description, or the NO_DESCRIPTION fallback
  hasDescription: boolean
}

export const NO_DESCRIPTION = 'No description in tokens.json.'

type Node = { [key: string]: unknown; $value?: unknown; $type?: string; $description?: string }

// Mirrors Style Dictionary's name/kebab: camelCase, ':' and '.' all become '-'.
export const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()

export const cssVarFor = (path: string[]) => `--${path.map(kebab).join('-')}`

function walk(node: Node, path: string[], inheritedType?: string): Token[] {
  const type = node.$type ?? inheritedType
  if ('$value' in node) {
    const description = node.$description?.trim()
    return [
      {
        path: path.join('.'),
        cssVar: cssVarFor(path),
        type: type ?? 'unknown',
        value: node.$value,
        description: description || NO_DESCRIPTION,
        hasDescription: Boolean(description),
      },
    ]
  }
  return Object.entries(node)
    .filter(([k]) => !k.startsWith('$'))
    .flatMap(([k, v]) => walk(v as Node, [...path, k], type))
}

const all = walk(tokens as Node, [])

/**
 * Every token whose path starts with the given prefix. JS reorders
 * integer-like keys ("0", "100") ahead of others ("050"), so file order
 * is not reliable here; sort by value where order matters.
 */
export const tokensUnder = (prefix: string) => all.filter((t) => t.path.startsWith(prefix + '.'))

/** Same, sorted by resolved numeric value: positives small to large, then negatives small to large. */
export const tokensUnderByValue = (prefix: string) =>
  tokensUnder(prefix)
    .map((t) => ({ t, n: Number(resolveRaw(t.value)) }))
    .sort((a, b) => ((a.n < 0) === (b.n < 0) ? Math.abs(a.n) - Math.abs(b.n) : a.n < 0 ? 1 : -1))
    .map(({ t }) => t)

/** Follow {a.b.c} references in tokens.json until a literal value is reached. */
export function resolveRaw(value: unknown): unknown {
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const target = all.find((t) => t.path === value.slice(1, -1))
    return target ? resolveRaw(target.value) : value
  }
  return value
}

/**
 * The value the browser actually computed for a CSS variable, read from the
 * loaded stylesheet, e.g. "#F4F2FF" or "16". Empty when there is no document.
 */
export function useResolved(cssVar: string): string {
  const [resolved] = useState(() =>
    typeof document === 'undefined'
      ? ''
      : getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim(),
  )
  return resolved
}
