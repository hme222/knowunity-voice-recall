#!/bin/bash
# Renders the reel in chunks, one fresh process each, for a machine short on memory
# and disk: a long single render grows swap until the disk fills. Finished chunks are
# kept, so a re-run resumes where it stopped. Then joins them losslessly.
#
#   bash scripts/render-chunks.sh            → out/sizzle.mp4
#   CHUNK=150 MIN_FREE_MB=900 bash scripts/render-chunks.sh
set -u
cd "$(dirname "$0")/.."
CHUNK=${CHUNK:-150}
MIN_FREE_MB=${MIN_FREE_MB:-900}
BROWSER=${REMOTION_BROWSER:-$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-x64/chrome-headless-shell}
FF_DIR=$(ls -d node_modules/@remotion/compositor-*/ | head -1)
# The reel's length in frames (Remotion Studio shows it; 1566 = 52.2s at 30fps).
TOTAL=${FRAMES:-1566}
if [ "$TOTAL" -le 0 ] 2>/dev/null; then echo "Could not read the frame count; set FRAMES=…"; exit 1; fi
mkdir -p out/chunks
echo "rendering $TOTAL frames in chunks of $CHUNK"
i=0
for ((start=0; start<TOTAL; start+=CHUNK)); do
  end=$((start + CHUNK - 1)); [ $end -ge $TOTAL ] && end=$((TOTAL - 1))
  f=$(printf "out/chunks/c%03d.mp4" $i)
  if [ -s "$f" ]; then echo "chunk $i done already"; i=$((i+1)); continue; fi
  free=$(df -k / | tail -1 | awk '{print int($4/1024)}')
  if [ "$free" -lt "$MIN_FREE_MB" ]; then echo "STOPPED before chunk $i: ${free} MB free (need ${MIN_FREE_MB})"; exit 2; fi
  echo "chunk $i: frames $start-$end (${free} MB free)"
  npx remotion render Sizzle "$f.tmp.mp4" --codec=h264 --crf=16 --concurrency=1 \
    --offthreadvideo-cache-size-in-bytes=200000000 --frames=$start-$end \
    --browser-executable="$BROWSER" --log=error || { echo "chunk $i FAILED"; rm -f "$f.tmp.mp4"; exit 3; }
  mv "$f.tmp.mp4" "$f"
  rm -rf "${TMPDIR:-/tmp}"/remotion-webpack-bundle-* 2>/dev/null
  i=$((i+1))
done
ls out/chunks/c*.mp4 | sed "s#^out/chunks/#file '#; s#\$#'#" > out/chunks/list.txt
DYLD_LIBRARY_PATH="$FF_DIR" "$FF_DIR/ffmpeg" -y -loglevel error -f concat -safe 0 -i out/chunks/list.txt -c copy -movflags +faststart out/sizzle.mp4 \
  && echo "JOINED → out/sizzle.mp4" && rm -rf out/chunks
