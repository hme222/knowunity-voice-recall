import type { Meta as StoryMeta, StoryObj } from '@storybook/nextjs-vite'
import { Page, Row, Section } from './Foundation'
import { resolveRaw, tokensUnderByValue, useResolved, type Token } from './tokens'

// One bar per spacing step. Width is the token's own CSS variable, so a
// change in tokens.json shows up here after `npm run tokens`.

const BAR_COLUMN = 176 // wide enough for the 160px step; larger values clip with a label

function Bar({ token }: { token: Token }) {
  const resolved = useResolved(token.cssVar)
  const n = Number(resolveRaw(token.value))
  const negative = n < 0
  return (
    <Row
      token={token}
      resolved={`${resolved || '…'}${resolved ? 'px' : ''}`}
      previewWidth={BAR_COLUMN}
      preview={
        <div
          style={{
            display: 'flex',
            justifyContent: negative ? 'flex-end' : 'flex-start',
            alignItems: 'center',
            height: 'calc(var(--size-primitive-space-600) * var(--size-primitive-unit))',
          }}
        >
          <div
            title={negative ? 'Negative step, drawn at its absolute size' : undefined}
            style={{
              width: `calc(var(${token.cssVar}) * ${negative ? -1 : 1}px)`,
              height: 'calc(var(--size-primitive-space-400) * var(--size-primitive-unit))',
              background: negative ? 'var(--color-semantic-accent-coral-bold)' : 'var(--color-semantic-brand-bold)',
              borderRadius: 'calc(var(--size-primitive-radius-100) * var(--size-primitive-unit))',
              minWidth: n === 0 ? 'calc(var(--size-primitive-stroke-heavy-border) * var(--size-primitive-unit))' : undefined,
            }}
          />
        </div>
      }
    />
  )
}

function Spacing() {
  return (
    <Page>
      <Section title="size.primitive.space">
        {tokensUnderByValue('size.primitive.space').map((t) => (
          <Bar key={t.path} token={t} />
        ))}
      </Section>
      <Section title="spacing.semantic">
        {tokensUnderByValue('spacing.semantic').map((t) => (
          <Bar key={t.path} token={t} />
        ))}
      </Section>
    </Page>
  )
}

const meta = {
  title: 'Foundations/Spacing',
  component: Spacing,
  tags: ['autodocs'],
} satisfies StoryMeta<typeof Spacing>

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {}
