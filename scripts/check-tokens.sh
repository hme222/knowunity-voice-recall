#!/usr/bin/env sh
# Fails if a raw hex colour appears in our own source.
#
# Every colour comes from tokens/tokens.json, consumed as a CSS custom property out of
# the generated build/css/tokens.css. A literal hex in a component or screen is drift —
# it looks right and means nothing, which is how statChip stayed wrong for a whole pass.
#
# Not scanned:
#   build/            generated, and meant to contain hex
#   *.stories.tsx     documentation; several quote the Figma hex they replaced
# Comments are stripped before matching, including multi-line /* */ blocks, because the
# CSS files explain their substitutions by naming the original value.

found=0

for file in $(find src/components src/app -type f \( -name '*.css' -o -name '*.tsx' \) ! -name '*.stories.tsx'); do
  hits=$(awk '
    {
      line = $0
      while (1) {
        if (inblock) {
          i = index(line, "*/")
          if (i == 0) { line = ""; break }
          line = substr(line, i + 2); inblock = 0
        } else {
          i = index(line, "/*")
          if (i == 0) break
          rest = substr(line, i + 2)
          head = substr(line, 1, i - 1)
          j = index(rest, "*/")
          if (j == 0) { line = head; inblock = 1; break }
          line = head substr(rest, j + 2)
        }
      }
      sub(/\/\/.*/, "", line)
      if (line ~ /#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]/) printf "  %d: %s\n", NR, line
    }
  ' "$file")
  if [ -n "$hits" ]; then
    if [ "$found" -eq 0 ]; then
      echo "Raw hex colours found — use a token from build/css/tokens.css instead:"
      echo ""
      found=1
    fi
    echo "$file"
    echo "$hits"
  fi
done

if [ "$found" -eq 1 ]; then
  echo ""
  echo "If a value genuinely has no token, add it to tokens/tokens.json and run: npm run tokens"
  exit 1
fi

echo "check:tokens — no raw hex in src/components or src/app"
