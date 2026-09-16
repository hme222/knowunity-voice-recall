import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TEXT_BLOCK_VARIANTS, TextBlock } from './TextBlock'

// Verbatim from the Figma component description (textBlock, 9003:9039).
const FIGMA_DESCRIPTION = `
**WHAT:** A Header text layer and an optional Caption text layer, four size variants (XL/L/M/S).

**WHEN:** NO CONFIRMED USAGE found in Example Screens. Composition alone suggests section headers or card titles with a supporting line underneath, a guess.

**DON'T:** Don't use it for body copy or multi-paragraph content, it's a title-plus-caption pattern, not a flexible text container.

---

Built 2026-09-16. Fully bound in Figma; nothing added. XL = Display M, L = Headline XL (centred, Headline XS Regular caption); M = Body M Bold, S = Body S Bold (left, Caption M / S Regular caption).
`

const meta = {
  title: 'Components/TextBlock',
  component: TextBlock,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { variant: { control: 'radio', options: TEXT_BLOCK_VARIANTS } },
  args: { variant: 'XL', title: 'Nice work', caption: 'You recalled 3 of 4', showCaption: true },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof TextBlock>

export default meta
type Story = StoryObj<typeof meta>

export const XL: Story = { args: { variant: 'XL' } }
export const L: Story = { args: { variant: 'L' } }
export const M: Story = { args: { variant: 'M' } }
export const S: Story = { args: { variant: 'S' } }
export const WithoutCaption: Story = { name: 'showCaption=false', args: { showCaption: false } }
