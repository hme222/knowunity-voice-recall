import { useEffect, useState } from 'react'
import type { Meta as StoryMeta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { Page, Section } from './Foundation'

// Every Knowie file in public/knowie/, by name — the whole range, not only the four
// faces MascotSlot exposes (designer, 2026-10-12: "are all Knowie faces in Storybook?").
// CLAUDE.md: expressions come from these files; none are drawn or generated.
//
// Two poses:
//   - Full body: dazed, determined, excited, laughing. MascotSlot's `expression`.
//   - Peek: the head rising from a flat bottom edge. excited-1/2 and laughing-1…19,
//     which differ frame to frame — an animation sequence. Not used in the app yet.

const FACES = ['excited', 'laughing', 'determined', 'dazed'] as const
const EXCITED_PEEK = ['excited-1', 'excited-2'] as const
const LAUGHING_PEEK = Array.from({ length: 19 }, (_, i) => `laughing-${i + 1}`)

const SIZE = 'calc(var(--size-primitive-illustration-1500) * 1px)'

function Art({ name }: { name: string }) {
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'calc(var(--size-primitive-space-100) * 1px)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from public/ */}
      <img src={`/knowie/${name}.svg`} alt={`Knowie, ${name}`} style={{ width: SIZE, height: SIZE, objectFit: 'contain' }} />
      <figcaption
        style={{
          color: 'var(--color-semantic-text-secondary)',
          fontSize: 'calc(var(--typography-style-caption-m-regular-font-size) * 1px)',
          lineHeight: 'calc(var(--typography-style-caption-m-regular-line-height) * 1px)',
        }}
      >
        {name}
      </figcaption>
    </figure>
  )
}

function Grid({ names }: { names: readonly string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--size-primitive-space-400) * 1px)' }}>
      {names.map((n) => (
        <Art key={n} name={n} />
      ))}
    </div>
  )
}

function KnowieArtwork() {
  return (
    <Page>
      <Section title="Faces — MascotSlot expression (used in the app)">
        <Grid names={FACES} />
      </Section>
      <Section title="Peek — excited (not used yet)">
        <Grid names={EXCITED_PEEK} />
      </Section>
      <Section title="Peek — laughing, 19 frames (not used yet)">
        <Grid names={LAUGHING_PEEK} />
      </Section>
    </Page>
  )
}

/** The 19 laughing-peek frames played in order. Holds frame 1 under reduced motion. */
function LaughingPeekLoop() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ms = Number(getComputedStyle(document.documentElement).getPropertyValue('--motion-semantic-duration-standard')) || 250
    const id = window.setInterval(() => setFrame((f) => (f + 1) % LAUGHING_PEEK.length), ms / 3)
    return () => window.clearInterval(id)
  }, [])
  return (
    <Page>
      <Section title="Laughing peek, as an animation">
        <Art name={LAUGHING_PEEK[frame]} />
      </Section>
    </Page>
  )
}

const meta = {
  title: 'Foundations/Knowie',
  component: KnowieArtwork,
  tags: ['autodocs'],
} satisfies StoryMeta<typeof KnowieArtwork>

export default meta
type Story = StoryObj<typeof meta>

export const AllArtwork: Story = {
  name: 'All artwork in public/knowie',
  play: async ({ canvas }) => {
    // Every file is here and every one actually loads.
    const imgs = canvas.getAllByRole('img') as HTMLImageElement[]
    await expect(imgs).toHaveLength(FACES.length + EXCITED_PEEK.length + LAUGHING_PEEK.length)
    await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener('load', r, { once: true })))))
    for (const img of imgs) await expect(img.naturalWidth).toBeGreaterThan(0)
  },
}

export const LaughingPeekAnimation: Story = {
  name: 'Laughing peek — 19 frames as an animation',
  render: () => <LaughingPeekLoop />,
}
