// Every var(--…) referenced in src/ must resolve to a custom property that actually
// exists. A missing one is not a build error and not a visible error either: CSS makes
// `calc(var(<undefined>) * 1px)` invalid at computed-value time, the property falls
// back to its initial value, and the element silently renders wrong.
//
// This exists because three Listening pulse rings sized from
// `--component-mic-button-pulse-ring-inner|middle|outer` rendered at 2x2px for as long
// as they existed. MicButton's own halo masked the gap, component-gaps.md claimed the
// binding was made, and every review that looked at the screen passed it.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (['.css', '.tsx', '.ts'].includes(extname(p))) out.push(p)
  }
  return out
}

const generated = readFileSync('build/css/tokens.css', 'utf8')
const defined = new Set([...generated.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]))

const files = [...walk('src'), ...walk('build/css')]
// locally-declared custom properties count too, e.g. --beat or --result-title
for (const f of files) {
  for (const m of readFileSync(f, 'utf8').matchAll(/(--[a-z0-9-]+)\s*:/gi)) defined.add(m[1])
}

// Properties injected at runtime rather than declared in CSS. Each needs a reason:
// this list is the escape hatch, so it stays short and argued.
const RUNTIME_INJECTED = new Map([
  ['--font-greed', 'set by next/font/local in src/app/layout.tsx, on the <html> element'],
  ['--progress', 'set inline per instance by ProgressIndicator, style={{ "--progress": n }}'],
])

const missing = []
for (const f of walk('src')) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,|\))/gi)) {
    // a var() with a fallback is deliberate, not a dead binding
    if (m[2] === ',') continue
    if (RUNTIME_INJECTED.has(m[1])) continue
    if (!defined.has(m[1])) {
      const line = src.slice(0, m.index).split('\n').length
      missing.push(`${f}:${line}  ${m[1]}`)
    }
  }
}

if (missing.length) {
  console.error(`check:vars — ${missing.length} var() reference(s) resolve to nothing:\n`)
  for (const m of missing) console.error('  ' + m)
  console.error('\nDefine them in tokens/tokens.json and run `npm run tokens`.')
  process.exit(1)
}
console.log(
  `check:vars — every var() in src resolves (${defined.size} defined, ${RUNTIME_INJECTED.size} injected at runtime)`,
)
