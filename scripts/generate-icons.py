"""Generate IGIFY PWA icons.

Draws the IGIFY brand mark: the lowercase "i" on a charcoal rounded square,
matching the interface wordmark. Rendered at 4x and downsampled for clean
edges. Re-run after changing the brand colours.

Usage:
    python scripts/generate-icons.py public/icons
"""

import os
import sys

from PIL import Image, ImageDraw

BG = (41, 45, 50, 255)       # #292d32 charcoal
FG = (245, 246, 247, 255)    # #f5f6f7 near-white
BORDER = (255, 255, 255, 90) # translucent hairline, as in the UI brand mark

SS = 4  # supersampling factor


def draw_glyph(draw, size, scale=1.0):
    """Draw a lowercase 'i' centred in a size x size area."""
    stem_w = size * 0.108 * scale
    stem_h = size * 0.385 * scale
    dot_d = size * 0.140 * scale
    gap = size * 0.047 * scale

    total_h = dot_d + gap + stem_h
    top = (size - total_h) / 2
    cx = size / 2

    # Dot
    draw.ellipse(
        [cx - dot_d / 2, top, cx + dot_d / 2, top + dot_d],
        fill=FG,
    )
    # Stem
    y0 = top + dot_d + gap
    draw.rectangle(
        [cx - stem_w / 2, y0, cx + stem_w / 2, y0 + stem_h],
        fill=FG,
    )


def make_any(px, radius_ratio=0.22):
    """Standard icon: rounded square with a hairline border."""
    s = px * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    radius = int(s * radius_ratio)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=BG)

    inset = int(s * 0.015)
    width = max(1, int(s * 0.006))
    d.rounded_rectangle(
        [inset, inset, s - 1 - inset, s - 1 - inset],
        radius=max(1, radius - inset),
        outline=BORDER,
        width=width,
    )

    draw_glyph(d, s, 1.0)
    return img.resize((px, px), Image.LANCZOS)


def make_full_bleed(px, scale=0.95):
    """Maskable / Apple icon: full-bleed square, glyph inside the safe zone."""
    s = px * SS
    img = Image.new("RGBA", (s, s), BG)
    d = ImageDraw.Draw(img)
    draw_glyph(d, s, scale)
    return img.resize((px, px), Image.LANCZOS)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "public/icons"
    os.makedirs(out, exist_ok=True)

    icons = {
        "icon-192.png": make_any(192),
        "icon-512.png": make_any(512),
        "icon-maskable-512.png": make_full_bleed(512),
        "apple-touch-icon.png": make_full_bleed(180),
    }

    for name, img in icons.items():
        path = os.path.join(out, name)
        img.save(path, "PNG", optimize=True)
        print(f"wrote {path} ({img.width}x{img.height})")


if __name__ == "__main__":
    main()
