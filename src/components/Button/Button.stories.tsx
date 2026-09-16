import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { BUTTON_SIZES, BUTTON_STATES, BUTTON_VARIANTS, Button } from './Button'

// Verbatim from the Figma component description (button, 9003:6667).
const FIGMA_DESCRIPTION = `
**WHAT:** Label with optional left/right icon containers. Three variant axes: Primary/Secondary/Tertiary, S/M/L, Default/Pressed/Disabled/Loading (confirmed against the real component, no Hover variant exists, this platform is touch-only). Pressed layers interactive/pressed as an overlay rather than swapping fill; Disabled uses background/surface, not interactive/disabled.

**WHEN:** Any primary, secondary or tertiary action needing a text label. Confirmed in real use inside buttonGroup at the bottom of screens and standalone elsewhere.

**DON'T:** Don't look for a Hover variant, none exists. Don't assume Disabled relates to the interactive/disabled token, the real component doesn't use it.

---

Built from the Figma bindings on 2026-09-16. Heights are \`component.button.{s,m,l}.height\` and the outer hit area is \`spacing.semantic.tapTarget\`; both were added to tokens.json and bound in Figma the same day. The font family is inherited from the page root rather than set here, because the loaded webfont is registered under next/font's generated name.
`

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    variant: { control: 'radio', options: BUTTON_VARIANTS },
    size: { control: 'radio', options: BUTTON_SIZES },
    state: { control: 'radio', options: BUTTON_STATES },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
  args: {
    CTA: 'Continue',
    variant: 'Primary',
    size: 'M',
    state: 'Default',
    showLeftIcon: false,
    showRightIcon: false,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// state — named as the Figma variants are named.

export const Default: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Continue' })
    // Primary fill is interactive.primary (violet.50, #F4F2FF); fails if tokens.css did not load.
    const pill = button.firstElementChild as HTMLElement
    await expect(getComputedStyle(pill).backgroundColor).toBe('rgb(244, 242, 255)')
  },
}

export const Pressed: Story = { args: { state: 'Pressed' } }

export const Disabled: Story = {
  args: { state: 'Disabled' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled()
  },
}

export const Loading: Story = {
  args: { state: 'Loading' },
  play: async ({ canvas }) => {
    // Label layer stays but is visually hidden (as in Figma) and remains the accessible name; aria-busy marks the state.
    const button = canvas.getByRole('button', { name: 'Continue' })
    await expect(button).toHaveAttribute('aria-busy', 'true')
    const hidden = canvas.getByText('Continue').getBoundingClientRect()
    await expect(hidden.width).toBeLessThanOrEqual(1)
  },
}

// variant

export const Primary: Story = { args: { variant: 'Primary' } }
export const Secondary: Story = { args: { variant: 'Secondary' } }
export const Tertiary: Story = { args: { variant: 'Tertiary' } }

// size

export const S: Story = { args: { size: 'S' } }
export const M: Story = { args: { size: 'M' } }
export const L: Story = { args: { size: 'L' } }

// showLeftIcon / showRightIcon, with Figma's placeholder square.

export const WithIcons: Story = { args: { showLeftIcon: true, showRightIcon: true } }

// Every cell of the Figma set: 3 variants × 3 sizes × 4 states.

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'calc(var(--spacing-semantic-between-sections) * 1px)' }}>
      {BUTTON_VARIANTS.map((variant) =>
        BUTTON_SIZES.map((size) => (
          <div
            key={`${variant}-${size}`}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'calc(var(--size-primitive-space-200) * 1px)' }}
          >
            {BUTTON_STATES.map((state) => (
              <Button key={state} {...args} variant={variant} size={size} state={state} CTA={`${variant} ${size}`} />
            ))}
          </div>
        )),
      )}
    </div>
  ),
}
