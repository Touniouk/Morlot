#!/bin/bash
# compress-images.sh
# Converts all JPG/JPEG/PNG images in assets/ to WebP at 80% quality.
# Originals are left untouched. Run once before deploying.
#
# Requires: ImageMagick (https://imagemagick.org)
#   macOS:  brew install imagemagick
#   Linux:  sudo apt install imagemagick

ASSETS="assets"
OUTPUT="$ASSETS/compressed"
QUALITY=80

if [ ! -d "$ASSETS" ]; then
  echo "Error: '$ASSETS' directory not found. Run this from the project root."
  exit 1
fi

mkdir -p "$OUTPUT"

count=0
for img in "$ASSETS"/*.{jpg,jpeg,JPG,JPEG,png,PNG}; do
  [ -f "$img" ] || continue

  out="$OUTPUT/$(basename "${img%.*}").webp"

  # Skip if a WebP already exists and is newer than the source
  if [ -f "$out" ] && [ "$out" -nt "$img" ]; then
    echo "  skip  $out (up to date)"
    continue
  fi

  magick "$img" -quality $QUALITY "$out"
  original=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
  compressed=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")
  saved=$(( (original - compressed) * 100 / original ))
  echo "  done  $img → $out  (${saved}% smaller)"
  count=$((count + 1))
done

if [ $count -eq 0 ]; then
  echo "Nothing to do — all WebP files are up to date."
else
  echo ""
  echo "$count image(s) converted. Update your HTML to use the assets/compressed/ paths."
fi