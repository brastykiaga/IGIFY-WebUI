# Card photographs

The prototype uses real Papua New Guinea photographs, chosen by visual review and
assigned per card so a page does not repeat the same image in a grid. They are bundled in `public/images/` so the interface keeps
working offline rather than hotlinking a third party.

## Provenance

All images come from [Wikimedia Commons](https://commons.wikimedia.org) under
licences that permit reuse. Three carry attribution obligations, which the app
surfaces under **Photo credits** in the footer (data in
`docs/photo-credits.json`).

| File | Creator | Licence |
| --- | --- | --- |
| `card-news.jpg` | eGuide Travel | CC BY 2.0 |
| `card-town.jpg` | eGuide Travel | CC BY 2.0 |
| `card-learn.jpg` | U.S. Navy photo by Petty Officer 3rd Class Adriana Immormino | Public domain |
| `card-school.jpg` | U.S. Navy photo by Petty Officer 3rd Class Adriana Immormino | Public domain |
| `card-discover.jpg` | eGuide Travel | CC BY 2.0 |
| `card-landscape.jpg` | eGuide Travel | CC BY 2.0 |
| `card-community.jpg` | Anselmo Lastra | CC BY 2.0 |
| `card-festival.jpg` | Unknown | Public domain |
| `card-faith.jpg` | Nicxon.Piaso | CC BY-SA 4.0 |
| `card-farming.jpg` | gailhampshire from Cradley, Malvern, U.K | CC BY 2.0 |
| `card-garden.jpg` | eGuide Travel | CC BY 2.0 |
| `card-media.jpg` | Kizomo | CC BY-SA 4.0 |
| `card-performance.jpg` | U.S. Marine Corps photo by Cpl. Migel Reynosa | Public domain |
| `card-dance.jpg` | U.S. Coast Guard (photographer uncredited) | Public domain |

Source URLs, full titles and licence links are recorded in
`docs/photo-credits.json` and shown in the in-app credits panel.

## Licensing notes

- **CC BY 2.0** requires attribution only.
- **CC BY-SA 4.0** requires attribution and share-alike for *derivative works of
  the image*. They are used here cropped and resized; if IGIFY later modifies
  them further and redistributes, the licence terms apply to those derivatives.
- **Public domain** has no obligations.

For an official deployment, replacing these with IGIFY's own photographs removes
all third-party obligations and better represents the province.

## Processing

Centre-cropped to 16:9, resized to 800 × 450, JPEG quality 82, progressive.
Total weight is roughly 1.6 MB for all fourteen.

## Replacing them

The module-to-title mapping is `CARD_IMAGE_BY_TITLE` in `src/main.js`; titles not
listed render as plain text cards with no image.

To use IGIFY's own photographs:

1. Export at 800 × 450 (16:9), modest JPEG size.
2. Save over the files above with the same names, or add entries to the map.
3. Update `docs/photo-credits.json` (or empty it) and the table above.

No other code changes are required.

## Regenerating candidates

```bash
# 1. Search Commons and download review thumbnails
node scripts/fetch-png-photos.mjs <stagingDir> [news,learn,...]

# 2. Build a labelled contact sheet to review relevance
python scripts/build-contact-sheet.py <stagingDir> <stagingDir>/review.png

# 3. Adopt the chosen candidates (edit SELECTION in the script first)
python scripts/adopt-photos.py --stage1 <dir> --stage3 <dir> --stage4 <dir> \
    --out public/images --attrib docs/photo-credits.json
```
