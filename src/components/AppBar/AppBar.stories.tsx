import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgressIndicator } from '../ProgressIndicator/ProgressIndicator'
import { APP_BAR_VARIANTS, AppBar } from './AppBar'

// Verbatim from the Figma component description (appBar, 9003:8606).
const FIGMA_DESCRIPTION = `
**WHAT:** A "Top Nav Default" frame holding a single Figma Slot, six variants controlling which icon/button arrangement sits in it.

**WHEN:** GUESS, weaker than other entries: no clean direct instance match found in the scan, but every progressIndicator instance found sits inside a frame named "Top Nav Default"/"App Bar" (appBar's own internal frame name), strongly suggesting appBar is present and hosting it, inferred from interior naming rather than a confirmed instance match.

**DON'T:** Don't fill the slot without picking the matching variant first, the six variants exist because the slot's layout changes depending on what goes in it.

---

Built 2026-09-16. The slot is \`children\`. Its Figma padding (10) and gap (10) had no token; bound the same day to \`space.0\` / \`space.200\` with the slot at \`tapTarget\` height, which leaves the content centred exactly where it was. The left/right controls are the library's App Bar Button Icon / App Bar Button, built inline. Background is \`background.page\` fading to transparent, as Figma's two gradients do.
`

const meta = {
  title: 'Components/AppBar',
  component: AppBar,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { variant: { control: 'radio', options: APP_BAR_VARIANTS }, children: { control: false } },
  args: { variant: 'default', rightText: 'Skip' },
  render: (args) => (
    <AppBar {...args}>
      <ProgressIndicator progress="50" thickness="16" />
    </AppBar>
  ),
} satisfies Meta<typeof AppBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'default' }
export const LeftIconButtonOnly: Story = { name: 'leftIconButtonOnly', args: { variant: 'leftIconButtonOnly' } }
export const LeftAndRightIconButton: Story = { name: 'leftAndRightIconButton', args: { variant: 'leftAndRightIconButton' } }
export const LeftAndRightButton: Story = { name: 'leftAndRightButton', args: { variant: 'leftAndRightButton' } }
export const LeftAndTwoRightIconButtons: Story = { name: 'leftAndTwoRightIconButtons', args: { variant: 'leftAndTwoRightIconButtons' } }
export const LeftAnd2RightButtons: Story = { name: 'leftAnd2RightButtons', args: { variant: 'leftAnd2RightButtons' } }
