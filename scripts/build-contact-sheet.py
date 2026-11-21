"""Build a labelled contact sheet from staged photo candidates.

One row per module, one tile per candidate, so a human can review relevance
before any image is adopted into the prototype.

Usage:
    python scripts/build-contact-sheet.py <stagingDir> <outputImage>
"""

import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

TILE_W, TILE_H = 460, 259       # 16:9-ish preview
LABEL_H = 46
PAD = 12


def load_font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def main():
    if len(sys.argv) < 3:
        print("usage: build-contact-sheet.py <stagingDir> <outputImage>")
        return 1

    stage, out_path = sys.argv[1], sys.argv[2]
    manifest_path = os.path.join(stage, "manifest.json")
    with open(manifest_path, "r", encoding="utf-8") as fh:
        manifest = json.load(fh)

    categories = [c for c in manifest if manifest[c]]
    if not categories:
        print("no candidates found")
        return 1

    cols = max(len(manifest[c]) for c in categories)
    width = cols * (TILE_W + PAD) + PAD
    height = len(categories) * (TILE_H + LABEL_H + PAD) + PAD

    sheet = Image.new("RGB", (width, height), (244, 245, 246))
    draw = ImageDraw.Draw(sheet)
    label_font = load_font(15)
    small_font = load_font(12)

    for row, category in enumerate(categories):
        y = PAD + row * (TILE_H + LABEL_H + PAD)
        for col, item in enumerate(manifest[category]):
            x = PAD + col * (TILE_W + PAD)
            path = os.path.join(stage, item["file"])
            try:
                img = Image.open(path).convert("RGB")
                img.thumbnail((TILE_W, TILE_H))
                # centre the thumbnail in its tile
                ox = x + (TILE_W - img.width) // 2
                oy = y + (TILE_H - img.height) // 2
                sheet.paste(img, (ox, oy))
            except Exception as err:  # noqa: BLE001
                draw.rectangle([x, y, x + TILE_W, y + TILE_H], outline=(180, 60, 60))
                draw.text((x + 6, y + 6), f"unreadable: {err}", fill=(180, 60, 60), font=small_font)

            draw.rectangle([x, y, x + TILE_W, y + TILE_H], outline=(180, 184, 190))

            name = f"{category}-{col + 1}"
            title = (item.get("title") or "")[:68]
            lic = item.get("license") or "?"
            draw.text((x, y + TILE_H + 4), name, fill=(30, 34, 40), font=label_font)
            draw.text((x, y + TILE_H + 22), f"{lic} · {title}", fill=(110, 116, 124), font=small_font)

        # row header
        draw.text((PAD, y - 1), "", font=small_font)

    sheet.save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path} ({sheet.width}x{sheet.height})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
