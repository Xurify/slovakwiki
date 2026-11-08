---
name: ink-drawing
description: How slovak.wiki draws explanatory pictures as pen sketches (the grammar page heroes): the ink kit (seeded wobble strokes, stick people, buildings, cups, clocks, a highlighter patch), how to add a scene for a grammar topic or case, the checks that a picture means one thing, and how to look at it before it ships. Use before and after drawing or changing any sketch under src/lib/components/reference/ink, when adding a grammar topic, and when a picture "looks off" or "makes no sense".
---

# Ink drawing

Grammar pages that are blocks of text get a picture. The picture looks like a pen drawing, not a diagram: thin lines, a hand-drawn stick person, a pale highlighter patch behind the one thing the rule is about. Every grammar topic and every case page opens on one (`sketch` in the catalog).

This skill came from LangHarness's `ink-drawing` skill (same look, same checks) and was adapted: here the pictures are **still** (the site's motion rules in `src/AGENTS.md` allow motion only for state changes), they use the site's `slate` and `blue` utilities, and they sit on a page of reference, so each one is paired with one Slovak sentence.

Use it twice: once **before** you draw (decide the one idea, pick the pieces), once **after** (the checks below).

## The look

| Part   | Rule                                                                                                                                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sheet  | One `svg`, viewBox `0 0 340 132`, ground line at y 104, a small displacement filter for the uneven pen edge. Id per slug.                                                                                                                                  |
| Line   | Thin: 1.4 for things, 2.1 for the one arrow or path the idea is about. Round caps and joins.                                                                                                                                                               |
| Wobble | A seeded bow on every stroke (`ink-paths.ts`), so a sketch is the same on every visit and in the build. Never `Math.random`.                                                                                                                               |
| Ink    | `ink` (`slate-900`, the main thing), `soft` (`slate-500`, scenery and the thing that is not the point), `mark` (`blue-800`, the one thing that matters). Never a hex.                                                                                      |
| Patch  | One highlighter patch (`blue-600/20`) behind the thing the case or rule marks. A case page always has one; a topic page has one only when one thing is the point.                                                                                          |
| Words  | Short words written in the picture (`note`): a question word under a person (`kto`), a preposition (`s`), a form under an object (`pracova**l**`). `**` lights the part that changes, like the sentence below. The page font (serif), nothing handwritten. |
| Motion | None.                                                                                                                                                                                                                                                      |
| No     | Gradients, shadows, boxes around everything, emoji, clip art, a legend, a third language of icons.                                                                                                                                                         |

## The kit

All under `src/lib/components/reference/ink/` (pure, seeded path strings) and `InkSketch.svelte` (draws them).

| File                     | What it holds                                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ink-paths.ts`           | `lineD`, `boxD`, `loopD`, `patchD`, `curveD`, `arrowD`, `smoothD`, `inkRandom`. Every shape is a path string made from a seed.                                                                                            |
| `pieces.ts`              | `stroke`, `ground`, `note`, `patch`, `arrow`, `figure` (`reach` 1 or -1 for the one who acts), `office`, `building`, `closedBook`, `openBook`, `eye`.                                                                     |
| `things.ts`              | `woman` (a dress), `tie`, `gradCap`, `cup`, `bubble` (speech), `thought`, `sun`, `waves`, `sheet` (paper), `check`, `calendar`, `house`, `windowFrame`, `pin`, `clockAtHalfPastTwo`, `tile` (a word box), `dot`, `polar`. |
| `case-sketches.ts`       | The six case scenes (`CASE_SCENES`).                                                                                                                                                                                      |
| `topic-sketches.ts`      | The scenes for every other grammar topic (`TOPIC_SCENES`), keyed by the topic slug.                                                                                                                                       |
| `sketches.ts`            | `sketchParts(slug)` and `markedParts(sentence)`.                                                                                                                                                                          |
| `InkSketchFigure.svelte` | The hero on a page: the sketch, the Slovak sentence with its word lit, the English under it.                                                                                                                              |

A new piece goes in `things.ts` and is **drawn at one place**: x is its left edge or centre as the signature says, `y` is on `GROUND`. Give every stroke its own `seed` (a number nobody else in the scene uses; a `figure` uses `seed` to `seed + 5`).

## Adding a sketch

1. Decide the one idea in five words (below) and the Slovak sentence that shows it. The sentence is an example the page already teaches (`examples` in `grammar.ts` or `cases.ts`), so no new Slovak is invented here.
2. Add a scene to `TOPIC_SCENES` (or `CASE_SCENES`) under the slug.
3. Add `sketch: { sentence, english, alt }` to the topic in `src/lib/catalog/reference/grammar.ts` (or the case in `cases.ts`). `**word**` in the sentence lights the word the picture is about. `alt` says what the picture shows in a sentence a screen reader can use, naming the people and what they do.
4. `bun scripts/ink/contact-sheet.ts <dir>`, screenshot both sheets, look (below).
5. `ink.test.ts` fails if a topic has no scene or no caption, or a case has no patch.

## Does it mean one thing

Ask each of these of every picture. A picture that fails one is redrawn, not captioned.

1. **One idea.** What does this picture say in five words? If it needs two sentences it is two pictures. The idea is also the **point of the page**: the picture of "past tense" shows the -l form following who did it, not a generic clock.
2. **It shows its own sentence.** The picture and the sentence under it are the same scene. A book in the sentence is a book in the picture, not a gift box. An office in "z práce" has windows.
3. **The arrow is the verb or the preposition.** "From": it starts at the door and leaves. "To the person who receives": it ends at the person. An arrow that could be read as pointing at a person, when the person is not the object, is wrong. The first nominative sketch put an arrow from a person to a book, and it read as "gives".
4. **No two meanings share a picture.** "See" (an eye and an arrow to the person), "give" (a book handed over), "with" (two people holding hands) are three drawings.
5. **The object is recognizable without the caption.** A cup has a handle, a clock has two hands set to the time in the sentence, a calendar has a marked day, a window has panes. A ring with a dot meant nothing (the first locative sketch), so the locative is a person among city buildings.
6. **Show the contrast the page teaches.** Gender is a man, a woman and a city, each with its own ending lit. Aspect is the unfinished letter and the finished one. Ten, tento, tamten: a near house and a far one. Where the page has a rule with an exception, the picture is the rule.
7. **The patch is on the word the sentence lights.** If `**mamy**` is lit, the patch is behind mama and the line that leads to `mamy`.

## Slovak

The sentence and every word written in the picture follow the `slovak-language` skill: forms checked, case names in full words in any prose (`genitive`, not an abbreviation), one noun (`mama`) across the six cases. A topic's sketch uses an example the page already has, or a form the page teaches.

## Look at it

Never judge a picture from its code.

- **All sketches at once:** `bun scripts/ink/contact-sheet.ts <dir> [slug…]` writes `sheet-light.html` and `sheet-dark.html` and prints the Chrome headless command that screenshots them. Read both themes.
- **On the page:** `bun run dev`, open `/grammar/<slug>` or `/grammar/cases/<slug>`, in light and dark, at 900 px and at 390 px. The hero is cropped to the heading and the figure for a PR screenshot.
- Screenshots go in the PR description (`AGENTS.md` → Pull requests), not in the repo.

## Mistakes already made

- A scene that only decorates: a ring with a dot for the locative, an eye floating between two people for "vidím" (it belongs at the viewer's face), a gift box for a sentence about a book.
- Two people drawn side by side in two scenes (with and possession) looked the same. The "with" scene joins their hands; possession is a person and a house.
- A figure with `reach` draws one arm only. For two figures that hold hands, give each a `reach` toward the other and join the hand ends with a `mark` stroke; do not stretch one arm across.
- A note's lit part is the ending or prefix that changes (`ten**to**`, `**na**písal`). If everything is lit, nothing is.
- A speech bubble needs a tip near the speaker's head, not the middle of the page.
- A filter id must be unique per sketch (`ink-<slug>`), or two sketches on one page share one noise map.
- Text-anchor `middle` plus `**` spans: write the `<tspan>`s inline in the `<text>`, with no whitespace between them, or the word shows gaps.
- `vector-effect: non-scaling-stroke` makes dashes use screen pixels. The kit does not use it.

## Related

- Felt-style tiles for the Grammar index are images (`scripts/images/felt-motifs.ts`), not sketches. A tile is for browsing; a sketch is for understanding.
- The stick-figure cast (`src/lib/stick-figure/`) plays podcast scenes and moves while a line is spoken. A sketch is still and has no cast.
- The contrast scenes inside a topic (`GrammarScene.svelte`, the small drawings next to each frame) answer "which form here?". The hero answers "what is this about?". Do not repeat one in the other.
