// Motion values for JS timers. CSS reads the custom properties directly; a setTimeout
// cannot, so it reads them here rather than restating the number. Falls back to the
// token's own value when there is no document, e.g. during SSR.

function ms(name: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** motion.semantic.duration.processingDwell */
export const processingDwell = () => ms('--motion-semantic-duration-processing-dwell', 1400)
/** motion.semantic.duration.slowThreshold */
export const slowThreshold = () => ms('--motion-semantic-duration-slow-threshold', 6000)
