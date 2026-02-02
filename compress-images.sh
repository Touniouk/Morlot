#!/bin/bash
# compress-images.sh
# Resizes and converts all JPG/JPEG/PNG images in assets/ to WebP.
# - Landscape/square images: max 1920px wide
# - Portrait images: max 1280px tall
# - Quality: 80%
# Originals are left untouched.
#
# Requires: ImageMagick 7+ (https://imagemagick.org)
#   macOS:  brew install imagemagick
#   Linux:  sudo apt install imagemagick

ASSETS="assets"
OUTPUT="$ASSETS/compressed"
QUALITY=80
MAX_LANDSCAPE_WIDTH=1920
MAX_PORTRAIT_HEIGHT=1280

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

  # Get image dimensions
  dimensions=$(magick identify -format "%w %h" "$img")
  width=$(echo $dimensions | cut -d' ' -f1)
  height=$(echo $dimensions | cut -d' ' -f2)

  # Decide resize strategy based on orientation
  if [ "$width" -ge "$height" ]; then
    # Landscape or square — resize to max width
    magick "$img" -resize "${MAX_LANDSCAPE_WIDTH}x>" -quality $QUALITY "$out"
  else
    # Portrait — resize to max height
    magick "$img" -resize "x${MAX_PORTRAIT_HEIGHT}>" -quality $QUALITY "$out"
  fi

  original=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
  compressed=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")
  saved=$(( (original - compressed) * 100 / original ))
  
  # Show sizes in KB for readability
  orig_kb=$((original / 1024))
  comp_kb=$((compressed / 1024))
  
  echo "  done  $img → $out"
  echo "        ${orig_kb}KB → ${comp_kb}KB (${saved}% smaller)"
  count=$((count + 1))
done

if [ $count -eq 0 ]; then
  echo "Nothing to do — all WebP files are up to date."
else
  echo ""
  echo "$count image(s) converted. Update your HTML to use the assets/compressed/ paths."
fi