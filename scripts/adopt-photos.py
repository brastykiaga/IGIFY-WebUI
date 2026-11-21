"""Adopt chosen photographs as the prototype's card images.

Centre-crops each chosen candidate to 16:9, resizes to 800x450, re-encodes as a
modest JPEG, and writes an attribution JSON alongside.

Selections were made by visual review, not automatically. Edit SELECTION to
change which candidate represents each module.

Usage:
    python scripts/adopt-photos.py --stage1 <dir> --stage3 <dir> --stage4 <dir> \
        --out public/images --attrib docs/photo-credits.json
"""

import argparse
import json
import os

from PIL import Image

# module -> (stage key, candidate file)
SELECTION = {
    "news": ("stage3", "news-1.jpg"),
    "learn": ("stage1", "learn-3.jpg"),
    "discover": ("stage1", "discover-3.jpg"),
    "community": ("stage1", "community-1.jpg"),
    "faith": ("stage4", "faith-1.jpg"),
    "farming": ("stage1", "farming-4.jpg"),
    "media": ("stage4", "media-1.jpg"),
}

TARGET_W, TARGET_H = 800, 450
QUALITY = 82


def crop_to_ratio(img, ratio):
    width, height = img.size
    current = width / height
    if current > ratio:
        new_w = int(height * ratio)
        left = (width - new_w) // 2
        return img.crop((left, 0, left + new_w, height))
    new_h = int(width / ratio)
    top = (height - new_h) // 2
    return img.crop((0, top, width, top + new_h))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stage1", required=True)
    parser.add_argument("--stage3", required=True)
    parser.add_argument("--stage4", required=True)
    parser.add_argument("--out", default="public/images")
    parser.add_argument("--attrib", default="docs/photo-credits.json")
    args = parser.parse_args()

    stages = {"stage1": args.stage1, "stage3": args.stage3, "stage4": args.stage4}
    manifests = {}
    for key, path in stages.items():
        with open(os.path.join(path, "manifest.json"), "r", encoding="utf-8") as fh:
            manifests[key] = json.load(fh)

    os.makedirs(args.out, exist_ok=True)
    os.makedirs(os.path.dirname(args.attrib), exist_ok=True)

    credits = {}
    for module, (stage_key, filename) in SELECTION.items():
        src = os.path.join(stages[stage_key], filename)
        entry = next(
            (e for e in manifests[stage_key][module] if e["file"] == filename),
            None,
        )
        if entry is None:
            raise SystemExit(f"no manifest entry for {stage_key}/{filename}")

        img = Image.open(src).convert("RGB")
        img = crop_to_ratio(img, TARGET_W / TARGET_H)
        img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)

        dest = os.path.join(args.out, f"card-{module}.jpg")
        img.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        size = os.path.getsize(dest)

        credits[module] = {
            "file": f"card-{module}.jpg",
            "title": entry.get("title"),
            "creator": entry.get("creator"),
            "license": entry.get("license"),
            "licenseUrl": entry.get("licenseUrl"),
            "source": entry.get("descriptionUrl"),
            "bytes": size,
        }
        print(f"{module:10s} <- {stage_key}/{filename}  {size} bytes  {entry.get('license')}")

    with open(args.attrib, "w", encoding="utf-8") as fh:
        json.dump(credits, fh, indent=2)
    print(f"\ncredits: {args.attrib}")


if __name__ == "__main__":
    main()
