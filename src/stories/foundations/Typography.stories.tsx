import type { Meta as StoryMeta, StoryObj } from '@storybook/nextjs-vite'
import { Meta, Page, Section } from './Foundation'
import { resolveRaw, tokensUnder, type Token } from './tokens'

// Every typography.style.* rendered at its real size, largest first.
// Each style is a composite token; Style Dictionary expands it into
// --typography-style-<name>-font-family / -font-weight / -font-size /
// -line-height / -letter-spacing, which is what the sample below consumes.

type Composite = { fontFamily: string; fontWeight: string; fontSize: string; lineHeight: string; letterSpacing: string }

const styles = tokensUnder('typography.style')
  .map((token) => {
    const v = token.value as Composite
    return {
      token,
      size: Number(resolveRaw(v.fontSize)),
      lineHeight: Number(resolveRaw(v.lineHeight)),
      weight: String(resolveRaw(v.fontWeight)),
      tracking: Number(resolveRaw(v.letterSpacing)),
    }
  })
  .sort((a, b) => b.size - a.size)

const SAMPLE = 'The mitochondria is the powerhouse of the cell'

function Sample({ token }: { token: Token }) {
  const v = token.cssVar
  return (
    <p
      style={{
        margin: 0,
        fontFamily: `var(${v}-font-family)`,
        fontWeight: `var(${v}-font-weight)`,
        fontSize: `calc(var(${v}-font-size) * 1px)`,
        lineHeight: `calc(var(${v}-line-height) * 1px)`,
        letterSpacing: `calc(var(${v}-letter-spacing) * 0.01em)`,
        color: 'var(--color-semantic-text-primary)',
        overflowWrap: 'anywhere',
      }}
    >
      {SAMPLE}
    </p>
  )
}

function Typography() {
  return (
    <Page>
      <Section title="typography.style">
        {styles.map(({ token, size, lineHeight, weight, tracking }) => (
          <div
            key={token.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'calc(var(--size-primitive-space-200) * 1px)',
              paddingBottom: 'calc(var(--size-primitive-space-400) * 1px)',
              borderBottom: 'calc(var(--size-primitive-stroke-border) * 1px) solid var(--color-semantic-border-default)',
            }}
          >
            <Sample token={token} />
            <Meta
              token={token}
              resolved={`${size}px / ${lineHeight}px · ${weight} · tracking ${tracking > 0 ? '+' : ''}${tracking}%`}
            />
          </div>
        ))}
      </Section>
    </Page>
  )
}

const meta = {
  title: 'Foundations/Typography',
  component: Typography,
  tags: ['autodocs'],
} satisfies StoryMeta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {}
