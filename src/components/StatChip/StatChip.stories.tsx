import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { STAT_CHIP_STATS, StatChip } from './StatChip'

// Figma component description (statChip, 15729:11868), written 2026-09-16; it had none.
const FIGMA_DESCRIPTION = `
**WHAT:** A small stat tile, one variant property stat (XP/Score/Time). Each is a tinted card (accent.<color>.subtle fill, accent.<color>.bold stroke, icon and text) with a caption-size label above a value row. Type is Caption S Bold for the label and Caption M Bold for the value, in Greed.

**WHEN:** Session-end summary stats, three tiles in a row. Confirmed consumer of accent.blue/green/magenta.bold per tokens.json.

**DON'T:** Don't use these accent colours as verdicts; they are decorative stat categories, not success/error. Don't add a fourth stat without a fourth accent, the colour is the category.

---

Built 2026-09-16. Figma had this in Inter at 7.5px / 13px with no text styles; retyped there to Caption S Bold / Caption M Bold and its padding, gap and radius bound (\`space.300\` / \`space.200\`, \`space.100\`, \`radius.400\`). Labels are sentence case per design-system.md, where Figma's samples were SCORE / TIME. Icon box is \`icon.200\`; Figma drew them at 14.
`

const meta = {
  title: 'Components/StatChip',
  component: StatChip,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { stat: { control: 'radio', options: STAT_CHIP_STATS } },
  args: { stat: 'XP', value: '+75' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof StatChip>

export default meta
type Story = StoryObj<typeof meta>

export const XP: Story = { args: { stat: 'XP', value: '+75' } }
export const Score: Story = { args: { stat: 'Score', value: '75%' } }
export const Time: Story = { args: { stat: 'Time', value: '2:28' } }
export const Row: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'calc(var(--size-primitive-space-200) * 1px)' }}>
      <StatChip stat="XP" value="+75" />
      <StatChip stat="Score" value="75%" />
      <StatChip stat="Time" value="2:28" />
    </div>
  ),
}
