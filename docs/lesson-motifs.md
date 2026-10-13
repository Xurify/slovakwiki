# Lesson motifs

Topic tiles in `static/lessons/motifs/<id>.webp`: one per lesson topic, reused by its practice set and grammar page. This doc describes the house style, measured from the existing 11 tiles, so new ones match.

## The set

| File                 | Shows                                                | Idea                         |
| -------------------- | ---------------------------------------------------- | ---------------------------- |
| `greetings.webp`     | Two overlapping speech bubbles with `…`, leaf sprigs | Conversation                 |
| `questions.webp`     | `?` on a cloud bubble, smaller cloud, sprigs         | Asking                       |
| `numbers.webp`       | Three cards: 1, 2, 3                                 | Counting                     |
| `time.webp`          | Clock: thick rim, dot markers, two hands             | Time                         |
| `negation.webp`      | Red X on a blush tile                                | "No"                         |
| `present-tense.webp` | 3×2 grid of tiles with abstract cut-outs             | Six person forms             |
| `byt.webp`           | ID-style card with a person silhouette               | Who someone is               |
| `mat.webp`           | Card holding a leaf and two text bars                | Something you have           |
| `stress.webp`        | Megaphone with three sound arcs                      | Emphasis                     |
| `phrase-stress.webp` | Three bars, tallest first                            | Weight on the first syllable |
| `default.webp`       | Closed book with a folded corner, sprigs             | General reference            |

Best style references: `numbers.webp`, `stress.webp`, `time.webp`, `greetings.webp`. Don't copy the outliers: `questions.webp` bleeds off every edge and fills half the frame; `byt.webp` and `mat.webp` have rough, torn-looking edges; `negation.webp` reads as painted (no felt shadow).

## Style

- **Medium.** Cut-felt appliqué, photographed flat from straight above. Each shape is a separate piece of felt with visible fiber grain, clean die-cut edges, and a short, soft contact shadow. No outlines, gradients, gloss, or perspective.
- **Ground.** Plain warm cream paper with fine grain, about `#F0E8D4` (measured `#ECE5D4`–`#F5F0DE`). Even, flat light; no vignette.
- **One literal symbol.** An everyday object or sign a learner reads in a glance (bubble, clock, card, X). Abstract only when the abstraction _is_ the lesson (the 3×2 grid, the falling bars).
- **Shapes.** Simple geometry, rounded corners on cards and tiles, chunky parts: nothing that carries meaning is thinner than about 35px at 1024px.
- **Glyphs.** Only when the glyph is the topic (`?`, `1 2 3`). No words, no letters, no diacritics (generators garble them), no faces.
- **Decoration (optional).** Leaf sprigs in slate and light blue, small 3×3 dot clusters, a half-pebble. Keep them small and in the outer ring, where crops throw them away anyway.

### Palette

Three or four felt colors per tile, from one family.

| Role                 | Blue (default) | Measured range      |
| -------------------- | -------------- | ------------------- |
| Navy (main mass)     | `#1E3D6B`      | `#102A55`–`#294B79` |
| Royal blue           | `#1A4F8F`      | `#1A4B87`–`#3B6798` |
| Slate blue (leaves)  | `#5F7489`      | `#506E8B`–`#7A8794` |
| Light sky blue       | `#8FB4D4`      | `#76A3C9`–`#A2BDD4` |
| Cream felt (on navy) | `#F0EBE0`      | glyphs, cards, dots |

Leave blue only when the topic maps to one of the site's semantic colors, and then switch the whole tile, plus at most one slate:

- **Rose** (negation, "wrong"): blush tile `#E0B1A3`, brick red `#AB4A4E`.
- **Emerald** (`mať`): deep green `#0A6346`, mid green `#1B7A54`, leaf green `#359467`, slate `#445960`.

## Framing

| Where                                          | Size                                                        | What shows                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| Lesson path card, practice path, grammar path  | 52–56px square                                              | Whole tile, tiny                                                            |
| Lessons "Continue" / Practice "Up next" banner | 144px tall (128px on the grammar questions card), any width | The tile at 4/3 of the banner height on its own paper color (`MotifBanner`) |

The banner shows the middle 75% of the tile's height and fades out the outer 6% of each side, so:

- Keep everything that matters inside **x 7–93%, y 12.5–87.5%**. `questions.webp` breaks this and clips in its banner.
- Leave cream on every side: the subject spans 55–85% of the width, felt covers 17–41% of the area, and no margin is under ~7% (70px).
- Check it at 52px: one clear silhouette with two or three tones. The six-tile grid is the most detail the set holds.

## Prompt

Works with any image model. Attach two or three of the reference tiles above if the tool takes image input. Describe the subject as shapes, not as a concept.

```text
Square 1:1 image. Handmade cut-felt appliqué illustration, photographed flat from directly above.

Subject: {one simple symbol described as shapes, e.g. "an open padlock: a rounded navy body with a light sky blue shackle"}.

Every shape is a separate piece of wool felt with visible fiber texture and clean die-cut edges, casting a very soft, short contact shadow onto the background. Background: plain warm cream paper (#F0E8D4) with fine grain, evenly lit, no vignette.

Colors: only navy #1E3D6B, royal blue #1A4F8F, slate blue #5F7489, light sky blue #8FB4D4, and cream felt #F0EBE0.

Composition: a single centered subject, about 60–80% of the width and no more than 70% of the height, with generous empty cream margin on every side. {Optional: "Two small leaf sprigs in slate blue and light sky blue at the lower left and lower right, and two tiny clusters of dots."}

Flat, minimal, geometric, friendly. No text, no letters, no faces, no outlines, no gradients, no gloss, no 3D perspective, nothing besides the subject.
```

For a rose or emerald tile, swap the color line for that family from **Palette**.

Reject and regenerate when there are stray letters or extra objects, the shadow is long or directional, colors drift outside the palette, the subject touches an edge, or the felt looks painted or plastic.

## Export and wire in

1. Save at **1024×1024** as WebP, quality 75, to `static/lessons/motifs/<id>.webp` (kebab-case topic). The set runs 40–100 KB per tile.
2. Add `<id>` to `LessonMotifId` and map the lesson in `BY_LESSON_ID` (`src/lib/lesson-story/lesson-motifs.ts`).
3. Add the tile's paper color to `motifPaper` in `src/lib/catalog/motifs/art.ts`: the mean color of the outer 40px on the left and right edges (average a patch; single pixels vary with the grain). The banner fills its sides with it, and typecheck fails without an entry.
4. Optional: a different tile for the practice set (`BY_SET_ID`, same file), or a grammar page (`BY_GRAMMAR_SLUG` in `src/lib/catalog/reference/grammar-motifs.ts`; a test checks the file exists).
5. Look at it next to the others on `/lessons` and `/practice`, at desktop and phone width.
