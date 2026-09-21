import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RECALL_RESULT_STATES, RecallResult } from './RecallResult'

// Verbatim from the Figma component description (recallResult, 15657:10978).
const FIGMA_DESCRIPTION = `
**WHAT:** A result card for a single recall attempt. state has three values, Pass and Miss use feedback.success/feedback.error subtle tinted cards with a colored title. CouldntHear keeps the card neutral (background.surface) and signals with a small coral tag instead, matching the real app reference screenshot (IMG_7512) rather than inventing a third card tint. transcript and title are both text properties, so Miss can carry Knowie's specific feedback line instead of a generic label.

**WHEN:** Directly after processing, one per attempt. Pass is wired into screen 04, Miss into screen 05, CouldntHear into screen 04a (moved onto the Say It Back flow v1 section, not yet linked to from any other screen).

**DON'T:** The coral tag on CouldntHear reuses chips, variant=Coral, it is not a separate component, don't rebuild it. Don't put rich text (bold spans) in title or transcript, they're plain text properties, partial bolding like the reference screenshot's bolded term isn't supported without a real component change.

---

Built 2026-09-16. Fully bound in Figma; nothing added. The tag is the real Chips component (S, Coral, active) with the retry glyph exported from this set. The Miss label uses \`feedback.error.onSubtle\` (bound in Figma too): \`text.tertiary\` measured 3.8:1 on the error tint. Pass and CouldntHear keep \`text.tertiary\` at 4.22 / 4.34:1, an accepted eyebrow-label ratio, see design-system.md open question 11.

**Neutral added 2026-09-21.** A fourth state for the drill (DD 07, 15782:12362), where a stumble is practice, not a scored miss: \`background.surface\` with a \`text.primary\` title, no tag, "You said" label. Until now the drill screens rebuilt this card inline (\`component-gaps.md\`).
`

const meta = {
  title: 'Components/RecallResult',
  component: RecallResult,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { state: { control: 'radio', options: RECALL_RESULT_STATES } },
  args: {
    state: 'Pass',
    title: "Nailed it — that's the whole definition.",
    transcript: "“It's the charge on an atom if you split every bond's electrons evenly between the two atoms.”",
  },
  decorators: [(Story) => <div style={{ padding: 'calc(var(--spacing-semantic-screen-margin) * 1px)' }}><Story /></div>],
} satisfies Meta<typeof RecallResult>

export default meta
type Story = StoryObj<typeof meta>

export const Pass: Story = {}
export const Miss: Story = {
  args: { state: 'Miss', title: 'Close — you described the octet rule, not formal charge.' },
}
export const CouldntHear: Story = {
  args: { state: 'CouldntHear', title: "We couldn't catch that.", transcript: "formal charge once more, whenever you're ready." },
}
export const Neutral: Story = {
  name: 'Neutral — the drill’s ungraded miss',
  args: {
    state: 'Neutral',
    title: 'Close. One word is missing.',
    transcript: '“Formal charge is the charge on an atom when every bond’s… um…”',
  },
}
