import type { Meta as StoryMeta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { Meta, Page, Section } from './Foundation'
import { tokensUnder, useResolved, type Token } from './tokens'

// Semantic colours, grouped by the group segment of their path
// (color.semantic.<group>.…). Values are read live from the loaded CSS.

const semantic = tokensUnder('color.semantic')
const groups = [...new Set(semantic.map((t) => t.path.split('.')[2]))]

function Swatch({ token }: { token: Token }) {
  const resolved = useResolved(token.cssVar)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--size-primitive-space-200) * 1px)' }}>
      <div
        data-swatch={token.cssVar}
        style={{
          height: 'calc(var(--size-primitive-illustration-800) * 1px)',
          borderRadius: 'calc(var(--size-primitive-radius-200) * 1px)',
          background: `var(${token.cssVar})`,
          border: 'calc(var(--size-primitive-stroke-border) * 1px) solid var(--color-semantic-border-default)',
        }}
      />
      <Meta token={token} resolved={resolved || '…'} />
    </div>
  )
}

function Colors() {
  return (
    <Page>
      {groups.map((group) => (
        <Section key={group} title={`color.semantic.${group}`}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 'calc(var(--size-primitive-space-400) * 1px)',
            }}
          >
            {semantic
              .filter((t) => t.path.split('.')[2] === group)
              .map((t) => (
                <Swatch key={t.path} token={t} />
              ))}
          </div>
        </Section>
      ))}
    </Page>
  )
}

const meta = {
  title: 'Foundations/Colors',
  component: Colors,
  tags: ['autodocs'],
} satisfies StoryMeta<typeof Colors>

export default meta
type Story = StoryObj<typeof meta>

export const Semantic: Story = {}

// Proves tokens.css loaded: background.page resolves to navy.950 (#090C18).
export const CssCheck: Story = {
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector('[data-swatch="--color-semantic-background-page"]')!
    await expect(getComputedStyle(page).backgroundColor).toBe('rgb(9, 12, 24)')
  },
}
