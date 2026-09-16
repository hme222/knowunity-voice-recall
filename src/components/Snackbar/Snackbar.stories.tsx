import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SNACKBAR_VARIANTS, Snackbar } from './Snackbar'

// Verbatim from the Figma component description (snackbar, 9003:8995).
const FIGMA_DESCRIPTION = `
**WHAT:** Icon slot, label text, a button container, and a nested chips instance, all in one row. Variants: Default/Success/Error.

**WHEN:** NO CONFIRMED USAGE found anywhere in Example Screens. Composition alone suggests feedback/status messaging (e.g. session-rating feedback or an error toast), but this is a guess, not a finding.

**DON'T:** Don't assume the embedded chip is optional filler, it's part of the fixed structure (not a slot) so it's likely meant to carry real information, though this isn't confirmed by any observed usage.

---

Built 2026-09-16. The chip's fill follows the Figma instance overrides: \`accent.blue.bold\` (Default), \`feedback.success.bold\`, \`feedback.error.bold\`. The button container is hidden in every Figma variant; it renders here only when \`actionLabel\` is set. \`Padding/sm\` is not a local Figma variable and resolves to \`space.200\`.
`

const meta = {
  title: 'Components/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { variant: { control: 'radio', options: SNACKBAR_VARIANTS }, icon: { control: false } },
  args: { Text: 'Up to 2 lines of text. Keep it as short as possible.', variant: 'Default', chipText: '+10 XP' },
} satisfies Meta<typeof Snackbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Success: Story = { args: { variant: 'Success', Text: 'Saved to your study plan.' } }
export const Error: Story = { args: { variant: 'Error', Text: "Couldn't reach the microphone." } }
export const WithAction: Story = { args: { actionLabel: 'Check it' } }
