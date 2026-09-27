#!/usr/bin/env bash
#
# Native image pipeline (replaces grunt copy/imagemin/svg2png for assets).
#
# Stages:
#   1. copy site images (assets/images -> public/images) and post-bundle
#      images next to each language's rendered page (Hugo publishes shared
#      bundle resources only once, so EN pages need their copies).
#      Author pictures publish natively (page bundles) and need no copy.
#   2. lossless raster optimization (oxipng -o max, mozjpeg jpegtran).
#   3. SVG minification (oxvg, svgo-class).
#   4. post cover PNG rendering (resvg, 512px; replaces inkscape svg2png).
#
# Required on PATH (C/Rust first): cp, find, oxipng, jpegtran (mozjpeg),
# oxvg, resvg. Override any binary via the matching UPPERCASE env var.
#
set -euo pipefail

JPEGTRAN="${JPEGTRAN:-jpegtran}"
OXIPNG="${OXIPNG:-oxipng}"
OXVG="${OXVG:-oxvg}"
RESVG="${RESVG:-resvg}"

if ! "$JPEGTRAN" -version 2>&1 | grep -qi "mozjpeg"; then
	echo "images: FATAL: $JPEGTRAN is not mozjpeg (need -optimize/-progressive support)" >&2
	exit 1
fi

slug_of() {
	# Print the slug from the FIRST front-matter block only (post bodies may
	# contain fenced front-matter examples with their own slug: lines).
	awk '/^---$/{n++; next} n==1 && /^slug:/{sub(/^slug:[ \t]*/, ""); gsub(/"/, ""); print; exit}' "$1"
}

echo "images: copying site images (assets/images -> public/images)"
mkdir -p public/images
cp -r assets/images/. public/images/

echo "images: copying post assets per language"
copied=0
for md in content/posts/*/index.md content/posts/*/index.en.md; do
	[ -e "$md" ] || continue
	dir=$(dirname "$md")
	slug=$(slug_of "$md")
	case "$md" in
	*.en.md) dest="public/en/$slug" ;;
	*) dest="public/$slug" ;;
	esac
	mkdir -p "$dest"
	for img in "$dir"/*.png "$dir"/*.jpg "$dir"/*.jpeg "$dir"/*.gif "$dir"/*.svg; do
		[ -e "$img" ] || continue
		case "$img" in
		*.original.*) continue ;; # editor backups, never published intentionally
		esac
		cp "$img" "$dest/"
		copied=$((copied + 1))
	done
done
echo "images: copied $copied post assets"

echo "images: optimizing raster (oxipng -o max, mozjpeg jpegtran)"
find public/images public/authors -name "*.png" -exec "$OXIPNG" -o max --strip safe {} + >/dev/null
find public/images public/authors \( -iname "*.jpg" -o -iname "*.jpeg" \) -print0 |
	while IFS= read -r -d "" jpg; do
		"$JPEGTRAN" -copy none -optimize -progressive -outfile "$jpg.opt" "$jpg"
		mv "$jpg.opt" "$jpg"
	done

echo "images: minifying svg (oxvg)"
find public -name "*.svg" -exec "$OXVG" optimise {} -o {} \;

echo "images: rendering post covers (resvg 512px og + 128px card)"
# Only covers whose source svg is heavy enough to lose to a raster get a
# thumbnail; lighter covers stay svg (smaller on the wire). The threshold
# lives in config.yaml params.coverRasterMinBytes so the templates that
# choose the src read the same value.
COVER_RASTER_MIN_BYTES="${COVER_RASTER_MIN_BYTES:-$(sed -n 's/^[[:space:]]*coverRasterMinBytes:[[:space:]]*//p' config.yaml | head -1)}"
COVER_RASTER_MIN_BYTES="${COVER_RASTER_MIN_BYTES:-16384}"
rendered=0
thumbs=0
for md in content/posts/*/index.md content/posts/*/index.en.md; do
	[ -e "$md" ] || continue
	dir=$(dirname "$md")
	[ -e "$dir/index.svg" ] || continue
	slug=$(slug_of "$md")
	case "$md" in
	*.en.md) dest="public/en/$slug" ;;
	*) dest="public/$slug" ;;
	esac
	mkdir -p "$dest"
	"$RESVG" -w 512 -h 512 "$dir/index.svg" "$dest/index.png"
	if [ "$(wc -c < "$dir/index.svg" | tr -d ' ')" -ge "$COVER_RASTER_MIN_BYTES" ]; then
		"$RESVG" -w 128 -h 128 "$dir/index.svg" "$dest/index.cover.png"
		thumbs=$((thumbs + 1))
	fi
	if [ -e "$dir/index.dark.svg" ] && [ "$(wc -c < "$dir/index.dark.svg" | tr -d ' ')" -ge "$COVER_RASTER_MIN_BYTES" ]; then
		"$RESVG" -w 128 -h 128 "$dir/index.dark.svg" "$dest/index.dark.cover.png"
		thumbs=$((thumbs + 1))
	fi
	rendered=$((rendered + 1))
done
echo "images: rendered $rendered cover PNGs, $thumbs card thumbnails"

echo "images: optimizing rendered cover PNGs (oxipng)"
find public -maxdepth 3 -name "index*.png" -exec "$OXIPNG" -o max --strip safe {} + >/dev/null
echo "images: done."
