import type { Preview } from '@storybook/nextjs-vite'
import localFont from 'next/font/local'
import { themes } from 'storybook/theming'
import '../src/app/globals.css'
import './preview.css'

// Same font registration as src/app/layout.tsx, so stories render in Greed VF.
const greed = localFont({
  variable: '--font-greed',
  src: '../src/app/fonts/GreedCollectionVF-TRIAL.ttf',
  weight: '300 900',
  style: 'normal',
  declarations: [{ prop: 'font-stretch', value: '75% 130%' }],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Helvetica Neue', 'Arial', 'sans-serif'],
})

const preview: Preview = {
  decorators: [
    (Story) => {
      // layout.tsx puts the font variable class on <html>; do the same here.
      document.documentElement.classList.add(greed.variable)
      return <Story />
    },
  ],

  parameters: {
    // Component stories fill the 390px canvas edge to edge, like a phone screen.
    layout: 'fullscreen',

    // Dark only: no light/dark switcher in the toolbar.
    backgrounds: { disable: true },

    // Docs pages are dark too, so token swatches sit on the right background.
    docs: { theme: themes.dark },

    // 390 is the sprint's only target width (docs/design-system.md, open issue 5).
    viewport: {
      options: {
        mobile390: { name: 'iPhone 13 (390)', styles: { width: '390px', height: '844px' } },
      },
    },

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },

  // Default every component story to the 390 viewport. Docs pages ignore
  // the viewport and render full width.
  initialGlobals: {
    viewport: { value: 'mobile390', isRotated: false },
  },
};

export default preview;
