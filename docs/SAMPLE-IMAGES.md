# Sample card photographs

These images exist only so the prototype's card layout can be evaluated with
real photography instead of placeholder blocks.

**They are not IGIFY content.**

## Source and licence

Downloaded from [Lorem Picsum](https://picsum.photos), which serves photographs
from Unsplash under the [Unsplash licence](https://unsplash.com/license) — free
for commercial and non-commercial use, no attribution required.

They are stored in the repository rather than hotlinked so the interface keeps
working offline, which is a core IGIFY requirement.

## Files

| File | Used by |
| --- | --- |
| `card-news.jpg` | Featured story, news and announcement cards |
| `card-learn.jpg` | Learning, study and library cards |
| `card-discover.jpg` | Discover and search entry points |
| `card-community.jpg` | Community, events and organisation cards |
| `card-faith.jpg` | Faith and family cards |
| `card-farming.jpg` | Skills and farming cards |
| `card-media.jpg` | Listen & Watch, radio and video cards |

## Replacing them with IGIFY photographs

The card-to-image mapping lives in `CARD_IMAGE_BY_TITLE` in `src/main.js`.
Titles not present in that map render as plain text cards with no image.

To use IGIFY's own photographs:

1. Export each photograph at 800 × 450 (16:9) and keep the JPEG size modest —
   these are served to offline clients.
2. Drop the files into this directory using the same names (or add new entries
   to the map in `src/main.js`).
3. No other code changes are required.

Prefer photographs of the actual province and community: local places, people,
markets, schools and events. Generic stock imagery weakens the local-first
premise.

## Regenerating the samples

```bash
node scripts/fetch-sample-images.mjs public/images
```
