import type { Meta as StoryMeta, StoryObj } from '@storybook/nextjs-vite'
import { Page, Row, Section } from './Foundation'
import { tokensUnderByValue, useResolved, type Token } from './tokens'

// One box per corner radius, with that radius applied via its own variable.

const BOX = 96

function Box({ token }: { token: Token }) {
  const resolved = useResolved(token.cssVar)
  return (
    <Row
      token={token}
      resolved={`${resolved || '…'}${resolved ? 'px' : ''}`}
      previewWidth={BOX}
      preview={
        <div
          style={{
            width: BOX,
            height: 'calc(var(--size-primitive-illustration-800) * 1px)',
            borderRadius: `calc(var(${token.cssVar}) * 1px)`,
            background: 'var(--color-semantic-background-surface)',
            border: 'calc(var(--size-primitive-stroke-heavy-border) * 1px) solid var(--color-semantic-brand-bold)',
          }}
        />
      }
    />
  )
}

function Radius() {
  return (
    <Page>
      <Section title="size.primitive.radius">
        {tokensUnderByValue('size.primitive.radius').map((t) => (
          <Box key={t.path} token={t} />
        ))}
      </Section>
    </Page>
  )
}

const meta = {
  title: 'Foundations/Radius',
  component: Radius,
  tags: ['autodocs'],
} satisfies StoryMeta<typeof Radius>

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {}
