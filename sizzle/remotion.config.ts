import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// Use a locally installed headless Chromium when one exists (set REMOTION_BROWSER to override);
// otherwise Remotion downloads its own on first render.
const local = process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(local)) Config.setBrowserExecutable(local);
