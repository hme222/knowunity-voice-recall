import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import tokens from '../../tokens/tokens.json'

// Semantic colour swatches, read straight from tokens.json and painted with
// the CSS variables Style Dictionary generates from it (build/css/tokens.css).

type TokenNode = { $value?: unknown; $description?: string } & { [key: string]: unknown }

// Same naming as Style Dictionary's name/kebab: camelCase and ':' become '-'.
const kebab = (s: string) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()

function collect(node: TokenNode, path: string[]): { name: string; description: string }[] {
  if ('$value' in node) {
    return [{ name: `--${path.map(kebab).join('-')}`, description: node.$description ?? '' }]
  }
  return Object.entries(node)
    .filter(([k]) => !k.startsWith('$'))
    .flatMap(([k, v]) => collect(v as TokenNode, [...path, k]))
}

const semanticColors = collect(tokens.color.semantic as TokenNode, ['color', 'semantic'])

function Swatches() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 'calc(var(--size-primitive-space-300) * 1px)',
        padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)',
      }}
    >
      {semanticColors.map(({ name, description }) => (
        <div key={name} title={description}>
          <div
            data-swatch={name}
            style={{
              height: 56,
              borderRadius: 'calc(var(--size-primitive-radius-200) * 1px)',
              background: `var(${name})`,
              border: '1px solid var(--color-semantic-border-default)',
            }}
          />
          <code style={{ fontSize: 'calc(var(--typography-primitive-font-size-xs) * 1px)' }}>
            {name.replace('--color-semantic-', '')}
          </code>
        </div>
      ))}
    </div>
  )
}

const meta = {
  component: Swatches,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Swatches>

export default meta
type Story = StoryObj<typeof meta>

export const SemanticColors: Story = {}

// Proves tokens.css actually loaded: background.page resolves to navy.950 (#090C18).
export const CssCheck: Story = {
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector('[data-swatch="--color-semantic-background-page"]')!
    await expect(getComputedStyle(page).backgroundColor).toBe('rgb(9, 12, 24)')
  },
}
