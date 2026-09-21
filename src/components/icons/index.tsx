// Glyphs exported from the Figma component set, one per file where the shape is
// large, inline here where it is small. All use currentColor so the consuming
// component's token colour applies. Every svg fills its box: size it from the parent.

import type { ComponentType } from 'react'
import { X, Mic, RotateCcw, Eye, Check } from 'lucide-react'

export { LoadingIcon } from './LoadingIcon'
export { SquareIcon } from './SquareIcon'

/* Lucide glyphs, matching Figma's micGlyph_lucide / refreshGlyph_lucide, which are
   exact Lucide geometry. Lucide emits its own width/height from a `size` prop; every
   icon in this file instead fills its box so the parent slot sizes it. `lucide` wraps
   one to that house convention — without it, a Lucide icon in AppBar's 24px slot
   ignores the slot. Stroke stays currentColor like the rest. */
function lucide(Glyph: ComponentType<{ className?: string }>) {
  return function LucideIcon({ className }: { className?: string }) {
    return (
      <span className={className} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden="true">
        <Glyph className="w-full h-full" />
      </span>
    )
  }
}

/** appBar's exit control. Both real references (IMG_7511, IMG_7538) show an X, not a back arrow. */
export const CloseIcon = lucide(X)
/** Figma micGlyph_lucide. The outline mic, not micButton's filled artwork. */
export const MicGlyphIcon = lucide(Mic)
/** Figma refreshGlyph_lucide — Lucide rotate-ccw. */
export const RefreshGlyphIcon = lucide(RotateCcw)
/** The transcript affordance on Recap rows and the Miss result. Was rendering as the
    Overlay variant's `plusSign` fallback while announcing "See what you said". */
export const EyeIcon = lucide(Eye)
/** Snackbar variant="Success". Without it the component falls back to `square`. */
export const CheckIcon = lucide(Check)

type IconProps = { className?: string }
const base = { fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true as const, width: '100%', height: '100%' }

/** micButton's mic artwork (48 box). */
export function MicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" {...base}>
      <path d="M24.0029 4C18.4801 4 14.0029 8.47716 14.0029 14V22C14.0029 27.5228 18.4801 32 24.0029 32C29.5257 32 34.0029 27.5228 34.0029 22V14C34.0029 8.47716 29.5257 4 24.0029 4Z" fill="currentColor" />
      <path d="M11.7092 28.9112C11.1079 27.9848 9.86932 27.721 8.94276 28.3224C8.01618 28.9236 7.7525 30.1622 8.3538 31.0888C10.601 34.5516 14.8957 39.1568 22.0028 39.8976V42C22.0028 43.1046 22.8982 44 24.0028 44C25.1074 44 26.0028 43.1046 26.0028 42V39.8976C33.11 39.1568 37.4046 34.5516 39.6518 31.0888C40.2532 30.1622 39.9894 28.9236 39.0628 28.3224C38.1364 27.721 36.8978 27.9848 36.2964 28.9112C34.2172 32.1152 30.403 36 24.0028 36C17.6026 36 13.7884 32.1152 11.7092 28.9112Z" fill="currentColor" />
    </svg>
  )
}

/** buttonIcon Overlay's plusSign (24 box). */
export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 3C12.5523 3 13 3.44772 13 4V11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H13V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H11V4C11 3.44772 11.4477 3 12 3Z" fill="currentColor" />
    </svg>
  )
}

/** appBar's left navigation arrow (24 box). */
export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M11.293 4.29295C11.6835 3.90243 12.3165 3.90243 12.707 4.29295C13.0976 4.68348 13.0976 5.31649 12.707 5.70702L7.41406 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H7.41406L12.707 18.293C13.0976 18.6835 13.0976 19.3165 12.707 19.707C12.3165 20.0975 11.6835 20.0975 11.293 19.707L4.29297 12.707C3.90245 12.3165 3.90245 11.6835 4.29297 11.293L11.293 4.29295Z" fill="currentColor" />
    </svg>
  )
}

/** statChip XP bolt. 14 artwork drawn inside the 16 icon box, as Figma sizes it. */
export function XpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="-1 -1 16 16" {...base}>
      <path d="M7.1 0.318237L0.5 8.31824H4.9L3.8 14.3182L11.5 5.31824H6L7.1 0.318237Z" fill="currentColor" stroke="currentColor" />
    </svg>
  )
}

/** statChip Score target. 14 artwork inside the 16 box. */
export function ScoreIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="-1 -1 16 16" {...base}>
      <circle cx="7" cy="7" r="6.35" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7" cy="7" r="3.35" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  )
}

/** statChip Time stopwatch. 14 artwork inside the 16 box. */
export function TimeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="-1 -0.5 16 16" {...base}>
      <path d="M6.2002 4.01123C9.30481 4.01123 11.7498 6.36338 11.75 9.18018C11.75 11.9971 9.30491 14.3501 6.2002 14.3501C3.0955 14.3501 0.650391 11.9971 0.650391 9.18018C0.650553 6.36339 3.0956 4.01125 6.2002 4.01123Z" stroke="currentColor" strokeWidth="1.3" />
      <line y1="-0.65" x2="3.02294" y2="-0.65" transform="matrix(0.785602 0.618732 -0.666481 0.745522 6.20023 9.18042)" stroke="currentColor" strokeWidth="1.3" />
      <line y1="-0.65" x2="2.53235" y2="-0.65" transform="matrix(0.835674 0.549225 -0.597947 0.801535 1.03337 2.39087)" stroke="currentColor" strokeWidth="1.3" />
      <line y1="-0.65" x2="2.53235" y2="-0.65" transform="matrix(0.835674 -0.549225 0.597947 0.801535 11.8838 2.39087)" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

/** recallResult CouldntHear tag glyph: a retry arrow (13 box). */
export function RetryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 13 13" {...base}>
      <path d="M12.5309 3.75H6.46839L7.4596 2.52246C6.7964 2.3047 6.08844 2.23693 5.38831 2.3291C4.36708 2.46366 3.41843 2.93082 2.69007 3.65918C1.9617 4.38754 1.49455 5.3362 1.35999 6.35742C1.22552 7.37884 1.43179 8.41639 1.9469 9.30859C2.46202 10.2008 3.25682 10.8987 4.20862 11.293C5.1603 11.6871 6.21558 11.7558 7.21057 11.4893C8.2057 11.2226 9.08536 10.6347 9.71253 9.81738C10.3396 9.00009 10.6793 7.99888 10.6793 6.96875H11.9996C11.9996 8.28956 11.5635 9.57323 10.7594 10.6211C9.95535 11.6689 8.82816 12.4228 7.55237 12.7646C6.27667 13.1064 4.92391 13.0171 3.70374 12.5117C2.48347 12.0063 1.46375 11.1126 0.803348 9.96875C0.142966 8.82491 -0.121003 7.49503 0.0513945 6.18555C0.223812 4.87608 0.823524 3.66049 1.75745 2.72656C2.69138 1.79264 3.90696 1.19292 5.21643 1.02051C6.27885 0.880637 7.35462 1.02801 8.33362 1.44141L9.49964 0L12.5309 3.75Z" fill="currentColor" />
    </svg>
  )
}

/** chips Coral's refresh glyph (16 box). */
export function RefreshIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" {...base}>
      <path d="M14 8C14 9.32081 13.5642 10.6047 12.7601 11.6526C11.9561 12.7004 10.8287 13.4537 9.55291 13.7956C8.27711 14.1374 6.92416 14.0487 5.7039 13.5433C4.48363 13.0378 3.46425 12.1439 2.80385 11C2.14345 9.85615 1.87893 8.52635 2.05133 7.21684C2.22373 5.90734 2.82341 4.69131 3.75736 3.75736C4.69131 2.82341 5.90734 2.22373 7.21684 2.05133C8.52635 1.87893 9.85615 2.14344 11 2.80385L10.34 3.947C9.4478 3.43189 8.41055 3.22557 7.38914 3.36004C6.36772 3.49451 5.41922 3.96226 4.69074 4.69074C3.96226 5.41922 3.49451 6.36772 3.36004 7.38914C3.22557 8.41055 3.43189 9.4478 3.947 10.34C4.46212 11.2322 5.25724 11.9295 6.20904 12.3238C7.16085 12.718 8.21615 12.7872 9.21127 12.5205C10.2064 12.2539 11.0857 11.6663 11.7129 10.849C12.3401 10.0317 12.68 9.03023 12.68 8H14Z" fill="currentColor" />
    </svg>
  )
}
