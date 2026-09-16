import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '../Button/Button'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import { BUTTON_GROUP_SIZES, BUTTON_GROUP_VARIANTS, ButtonGroup } from './ButtonGroup'

// Verbatim from the Figma component description (buttonGroup, 9003:8455).
const FIGMA_DESCRIPTION = `
**WHAT:** Two button (or buttonIcon) instances stacked, Horizontal or Vertical, M or L size.

**WHEN:** Confirmed in real use exclusively inside bottomCta, the bottom-of-screen action pair.

**DON'T:** Don't use for more than two actions, no variant supports three. Don't assume it's a general-purpose layout, every instance found was in the bottom CTA area specifically.

---

Built 2026-09-16. The two children are real Button / ButtonIcon instances; the group applies Figma's "Fill container" overrides itself (both in Vertical, the second child in Horizontal). Figma's frame is a fixed 319 wide; here it fills its container.
`

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: {
    variant: { control: 'radio', options: BUTTON_GROUP_VARIANTS },
    size: { control: 'radio', options: BUTTON_GROUP_SIZES },
    children: { control: false },
  },
  args: { variant: 'Vertical', size: 'M', children: null },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
  render: (args) => (
    <ButtonGroup {...args}>
      {args.variant === 'Vertical' ? (
        <>
          <Button CTA="Continue" variant="Primary" size={args.size} />
          <Button CTA="Not now" variant="Secondary" size={args.size} />
        </>
      ) : (
        <>
          <ButtonIcon label="Back" variant="Secondary" size={args.size} />
          <Button CTA="Continue" variant="Primary" size={args.size} />
        </>
      )}
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = { args: { variant: 'Vertical' } }
export const Horizontal: Story = { args: { variant: 'Horizontal' } }
export const M: Story = { args: { size: 'M' } }
export const L: Story = { args: { size: 'L' } }
