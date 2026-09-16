import { addons } from 'storybook/manager-api'
import { themes } from 'storybook/theming'

// Storybook's own sidebar and toolbar, dark to match the canvas.
addons.setConfig({ theme: themes.dark })
