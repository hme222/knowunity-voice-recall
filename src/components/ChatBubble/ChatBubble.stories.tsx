import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChatBubble } from './ChatBubble'

// Verbatim from the Figma component description (chatBubble, 15651:10673).
const FIGMA_DESCRIPTION = `
**WHAT:** A vertical card, optional title text, required body text, one boolean property, showTitle (default false).

**WHEN:** Knowie's spoken-back response, as text, on screen. Turn showTitle on only when this bubble opens a new question, leave it off for a follow-up reply, the more common case.

**DON'T:** Don't use it to echo the student's own words back, this is Knowie's voice only. Don't assume it's in use anywhere yet, no screen currently has a live instance.

---

Built 2026-09-16. Fully bound in Figma; nothing added.
`

const meta = {
  title: 'Components/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  args: { showTitle: false, title: 'Ready when you are', body: 'Say what formal charge means, in your own words.' },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof ChatBubble>

export default meta
type Story = StoryObj<typeof meta>

export const FollowUp: Story = { name: 'showTitle=false' }
export const NewQuestion: Story = { name: 'showTitle=true', args: { showTitle: true } }
