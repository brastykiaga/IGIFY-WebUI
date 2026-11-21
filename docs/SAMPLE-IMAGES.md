# Card photographs

The prototype uses real Papua New Guinea photographs, chosen per module by
visual review. They are bundled in `public/images/` so the interface keeps
working offline rather than hotlinking a third party.

## Provenance

All images come from [Wikimedia Commons](https://commons.wikimedia.org) under
licences that permit reuse. Three carry attribution obligations, which the app
surfaces under **Photo credits** in the footer (data in
`docs/photo-credits.json`).

| Module | File | Subject | Creator | Licence |
| --- | --- | --- | --- | --- |
| news | `card-news.jpg` | Gathering in Kundiawa, Simbu | eGuide Travel | CC BY 2.0 |
| learn | `card-learn.jpg` | School assembly, Lea High School, Lae | U.S. Navy (PO3 Adriana Immormino) | Public domain |
| discover | `card-discover.jpg` | Highlands valley, Papua New Guinea | eGuide Travel | CC BY 2.0 |
| community | `card-community.jpg` | Goroka Show performers | Anselmo Lastra | CC BY 2.0 |
| faith | `card-faith.jpg` | Reformed Ministries Church, Kandep District | Nicxon.Piaso | CC BY-SA 4.0 |
| farming | `card-farming.jpg` | Hut with vegetable garden, PNG highlands | gailhampshire | CC BY 2.0 |
| media | `card-media.jpg` | Student warrior dancer, Papua New Guinea | Kizomo | CC BY-SA 4.0 |

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
Total weight is roughly 0.8 MB for all seven.

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
