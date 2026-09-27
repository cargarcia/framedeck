#!/bin/bash
# Render a motion-studio composition to MP4, optionally muxing a WAV soundtrack.
# Usage: render.sh <CompositionId> <outDir> [soundtrack.wav] [--stills 60,300,600]
# Env: FRAMES (default 900) total duration in frames.
set -euo pipefail

COMPOSITION_ID="$1"
OUT_DIR="$(realpath -m "$2")"
SOUNDTRACK="${3:-}"
STILLS=""
if [[ "${4:-}" == "--stills" ]]; then STILLS="${5:-}"; fi
if [[ "$SOUNDTRACK" == "--stills" ]]; then SOUNDTRACK=""; STILLS="${4:-}"; fi
FRAMES="${FRAMES:-900}"

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
FRONTEND="$REPO_ROOT/apps/frontend"
ENTRY="src/app/projects/[project-id]/_editor-container/editor/items/motion-design/motion-studio/index.ts"
BUNDLE="$OUT_DIR/bundle"
mkdir -p "$OUT_DIR"
cd "$FRONTEND"

BROWSER_FLAGS=()
if [[ -x /opt/pw-browsers/chromium ]]; then
  BROWSER_FLAGS=(--chrome-mode=chrome-for-testing --browser-executable=/opt/pw-browsers/chromium)
fi

echo "Bundling..."
rm -rf "$BUNDLE"
npx remotion bundle "$ENTRY" --out-dir "$BUNDLE" > "$OUT_DIR/bundle.log" 2>&1

# Headless Chrome may reject the egress proxy certificate for Google Fonts.
# Download the font files with curl (which trusts the proxy CA) and serve them from the bundle.
mkdir -p "$BUNDLE/public/gfonts"
for url in $(grep -oh "https://fonts.gstatic.com/s/[^\"']*" "$BUNDLE"/*.js | sort -u); do
  path="${url#https://fonts.gstatic.com/}"
  mkdir -p "$BUNDLE/public/gfonts/$(dirname "$path")"
  [[ -f "$BUNDLE/public/gfonts/$path" ]] || curl -sS -o "$BUNDLE/public/gfonts/$path" "$url"
done
sed -i 's#https://fonts.gstatic.com/s/#/public/gfonts/s/#g' "$BUNDLE"/*.js

if [[ -n "$STILLS" ]]; then
  mkdir -p "$OUT_DIR/stills"
  for frame in ${STILLS//,/ }; do
    npx remotion still "$BUNDLE" "$COMPOSITION_ID" "$OUT_DIR/stills/f$frame.png" --frame="$frame" --scale=0.4 "${BROWSER_FLAGS[@]}" > "$OUT_DIR/still.log" 2>&1
  done
  echo "Stills in $OUT_DIR/stills"
  exit 0
fi

# A single long render can stall on a parallel frame; two halves with lower concurrency are reliable.
HALF=$((FRAMES / 2))
: > "$OUT_DIR/parts.txt"
for range in "0-$((HALF - 1))" "$HALF-$((FRAMES - 1))"; do
  echo "Rendering frames $range..."
  npx remotion render "$BUNDLE" "$COMPOSITION_ID" "$OUT_DIR/part-$range.mp4" --frames="$range" \
    --concurrency=4 --timeout=60000 --crf=16 "${BROWSER_FLAGS[@]}" > "$OUT_DIR/render-$range.log" 2>&1
  echo "file '$OUT_DIR/part-$range.mp4'" >> "$OUT_DIR/parts.txt"
done

OUTPUT="$OUT_DIR/$COMPOSITION_ID.mp4"
if [[ -n "$SOUNDTRACK" ]]; then
  npx remotion ffmpeg -y -v error -f concat -safe 0 -i "$OUT_DIR/parts.txt" -i "$SOUNDTRACK" -map 0:v -map 1:a \
    -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart "$OUTPUT" > /dev/null 2>&1
else
  npx remotion ffmpeg -y -v error -f concat -safe 0 -i "$OUT_DIR/parts.txt" -c copy -movflags +faststart "$OUTPUT" > /dev/null 2>&1
fi
# Lighter copy for a web viewer page.
npx remotion ffmpeg -y -v error -i "$OUTPUT" -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart "$OUT_DIR/web.mp4" > /dev/null 2>&1
echo "Done: $OUTPUT (web copy: $OUT_DIR/web.mp4)"
