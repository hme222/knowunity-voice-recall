// Style Dictionary config: tokens/tokens.json -> build/css/tokens.css
// Run with `npm run tokens`. Names come straight from each token's path.

import StyleDictionary from "style-dictionary";

// tokens.json stores weights as words; CSS needs numbers.
// Same mapping as the Greed files registered in src/app/layout.tsx.
const FONT_WEIGHTS = { Regular: 400, SemiBold: 600, Bold: 700, Heavy: 800 };

StyleDictionary.registerTransform({
  name: "fontWeight/knowunity",
  type: "value",
  filter: (token) => token.$type === "fontWeight",
  transform: (token) => FONT_WEIGHTS[token.$value] ?? token.$value,
});

StyleDictionary.registerFileHeader({
  name: "knowunity/generated",
  fileHeader: () => [
    "GENERATED FILE. Do not edit by hand.",
    "Source: tokens/tokens.json. Rebuild with `npm run tokens`.",
  ],
});

const config = {
  source: ["tokens/**/*.json"],
  expand: true,
  platforms: {
    css: {
      transforms: ["name/kebab", "fontFamily/css", "fontWeight/knowunity"],
      buildPath: "build/css/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            fileHeader: "knowunity/generated",
            outputReferences: true,
          },
        },
      ],
    },
  },
};

export default config;
