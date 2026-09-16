import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { BUTTON_ICON_SIZES, BUTTON_ICON_STATES, BUTTON_ICON_VARIANTS, ButtonIcon } from './ButtonIcon'

// Verbatim from the Figma component description (buttonIcon, 9003:8235).
const FIGMA_DESCRIPTION = `
**WHAT:** Same variant/size/state axes as button, but content is a single centered iconSlot, no text layer.

**WHEN:** Confirmed in two real contexts: inside a buttonGroup alongside a text button (bottom-CTA icon action), and inside top navigation (nav-bar icon button).

**DON'T:** Don't try to add a label, there's no text layer. Use button instead if the action needs words.

Overlay: low-contrast icon button for controls layered on top of another surface, e.g. revealing a transcript from a recap card. Not a fourth general-purpose button style.

---

Built 2026-09-16. Pill is square at \`component.button.<size>.height\` inside a \`spacing.semantic.tapTarget\` hit area (bound in Figma the same day). Primary carries a \`border.default\` inside stroke. Only the Overlay S / Default cell exists in Figma; the other Overlay cells here are extrapolated from the same tokens.
`

const meta = {
  title: 'Components/ButtonIcon',
  component: ButtonIcon,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: {
    variant: { control: 'radio', options: BUTTON_ICON_VARIANTS },
    size: { control: 'radio', options: BUTTON_ICON_SIZES },
    state: { control: 'radio', options: BUTTON_ICON_STATES },
    icon: { control: false },
  },
  args: { label: 'Add', variant: 'Primary', size: 'M', state: 'Default' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof ButtonIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Add' })
    await expect(getComputedStyle(button.firstElementChild as HTMLElement).backgroundColor).toBe('rgb(244, 242, 255)')
  },
}
export const Pressed: Story = { args: { state: 'Pressed' } }
export const Disabled: Story = { args: { state: 'Disabled' } }
export const Loading: Story = {
  args: { state: 'Loading' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-busy', 'true')
  },
}

export const Primary: Story = { args: { variant: 'Primary' } }
export const Secondary: Story = { args: { variant: 'Secondary' } }
export const Tertiary: Story = { args: { variant: 'Tertiary' } }
export const Overlay: Story = { args: { variant: 'Overlay', size: 'S' } }

export const S: Story = { args: { size: 'S' } }
export const M: Story = { args: { size: 'M' } }
export const L: Story = { args: { size: 'L' } }

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'calc(var(--spacing-semantic-between-sections) * 1px)' }}>
      {BUTTON_ICON_VARIANTS.map((variant) =>
        BUTTON_ICON_SIZES.map((size) => (
          <div key={`${variant}-${size}`} style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--size-primitive-space-200) * 1px)' }}>
            {BUTTON_ICON_STATES.map((state) => (
              <ButtonIcon key={state} {...args} variant={variant} size={size} state={state} label={`${variant} ${size} ${state}`} />
            ))}
          </div>
        )),
      )}
    </div>
  ),
}
