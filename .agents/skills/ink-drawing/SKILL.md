---
name: ink-drawing
description: How slovak.wiki draws explanatory pictures as pen sketches (the grammar page heroes): the ink kit (seeded wobble strokes, stick people, buildings, cups, clocks, a highlighter patch), how to add a scene for a grammar topic or case, the checks that a picture means one thing, the blind review that every sketch must pass before it ships, and why the first drafts failed. Use before and after drawing or changing any sketch under src/lib/components/reference/ink, when adding a grammar topic, and when a picture "looks off" or "makes no sense".
---

# Ink drawing

Grammar pages that are blocks of text get a picture. The picture looks like a pen drawing, not a diagram: thin lines, a hand-drawn stick person, a pale highlighter patch behind the one thing the rule is about. Every grammar topic and every case page opens on one (`sketch` in the catalog).

This skill came from LangHarness's `ink-drawing` skill (same look, same checks) and was adapted: here the pictures are **still** (the site's motion rules in `src/AGENTS.md` allow motion only for state changes), they use the site's `slate` and `blue` utilities, and each sits above one Slovak sentence.

**A sketch does not ship until two fresh reviewers, shown only the picture, guess what it means (Blind review, below).** Checking a picture against what you meant is not a check: you already know the answer.

## Why the first drafts failed (2026-11-08)

The owner looked at the dative, instrumental and accusative pages and asked "what is that object, a binder? a book?", "what is happening in _I'm going with_?", "the eye one has issues". A blind review of all 26 sketches found the same few faults across the set, so they are habits, not accidents:

1. **Judged from the author's side.** Every earlier check ("does it mean one thing?") was answered by the person who knew the sentence. A rectangle with a spine line is a book to the author and a binder to everyone else.
2. **Generic shapes.** A box, a dome, a stick with a ring on it: each was read as two or three other things (a fridge, a lamp, a second head). An object needs one detail that only it has.
3. **One gesture, many meanings.** The pointing arm meant "this", "mine", "from" and "give" in different pictures. The same blue arrow meant motion, time and handing over.
4. **The grammar was in the words, not the picture.** A lone `z`, `s` or `v` under a scene looks like a typo to a beginner. A noun labeled with the object's name teaches vocabulary, not the verb (`kľúč` under a key).
5. **Floating parts.** An eye with no head, a dot where two hands meet, motion lines behind one person only: each looked like an object or a force.
6. **Seen once, at the wrong size.** Details drawn at 340 units shrink to a few pixels; the first render was never compared with a reviewer's reading.

The fixes are the rules below. The case for the review loop is that rounds 1 to 4 took the set from many 1s and 2s to nearly all 4s and 5s without anyone redrawing from taste.

## The look

| Part   | Rule                                                                                                                                                                                                                                                                                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sheet  | One `svg`, viewBox `0 0 340 132`, ground line at y 104, a small displacement filter for the uneven pen edge. Id per slug.                                                                                                                                                                                                                                                          |
| Line   | Thin: 1.4 for things, 2.1 for the one arrow or path the idea is about. Round caps and joins.                                                                                                                                                                                                                                                                                       |
| Wobble | A seeded bow on every stroke (`ink-paths.ts`), so a sketch is the same on every visit and in the build. Never `Math.random`.                                                                                                                                                                                                                                                       |
| Ink    | `ink` (`slate-900`, the main thing), `soft` (`slate-500`, scenery and the thing that is not the point), `mark` (`blue-800`, the one thing that matters). Never a hex.                                                                                                                                                                                                              |
| Patch  | One highlighter patch (`blue-600/20`) behind the thing the case or rule marks. A case page always has one; a topic page has one only when one thing is the point.                                                                                                                                                                                                                  |
| Words  | Written in the picture (`note`): the **phrase** the preposition sits in (`**z** práce`, `**s** mamou`, `**v** meste`), a question word with its mark (`kto?`), a form under an object (`pracova**l**`). `**` lights the part that changes, like the sentence below. Serif, nothing handwritten. English words only for a label that a drawing cannot carry (`informal`, `formal`). |
| Motion | None.                                                                                                                                                                                                                                                                                                                                                                              |
| No     | Gradients, shadows, boxes around everything, emoji, clip art, a legend.                                                                                                                                                                                                                                                                                                            |

## The kit

All under `src/lib/components/reference/ink/` (pure, seeded path strings) and `InkSketch.svelte` (draws them).

| File                     | What it holds                                                                                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ink-paths.ts`           | `lineD`, `boxD`, `loopD`, `patchD`, `curveD`, `arrowD`, `smoothD`, `inkRandom`. Every shape is a path string made from a seed.                                                      |
| `pieces.ts`              | `stroke`, `ground`, `note` (`tone`, `size`), `patch`, `arrow`, `figure` (`reach` 1 or -1), `office`, `building`, `openBook`, `closedBook`, `eye`.                                   |
| `people.ts`              | `person(x, seed, { grip, walking, dress, washing, scale })`: the one body used everywhere. `faceEye`, `trail`, `clasp`.                                                             |
| `things.ts`              | `woman`, `gradCap`, `cup`, `bubble` (speech), `thought`, `sun`, `waves`, `sheet`, `check`, `calendar`, `house`, `windowFrame`, `pin`, `clockAtHalfPastTwo`, `tile`, `dot`, `polar`. |
| `objects.ts`             | `pencil`, `farGround`, `tie`, `briefcase`.                                                                                                                                          |
| `marks.ts`               | `dashed` (a line of sight), `footprints`, `boat`, `overheadShower`, `sectorPatch` (a slice of a clock).                                                                             |
| `case-sketches.ts`       | The six case scenes (`CASE_SCENES`).                                                                                                                                                |
| `topic-sketches.ts`      | The scenes for every other grammar topic (`TOPIC_SCENES`), keyed by the topic slug.                                                                                                 |
| `sketches.ts`            | `sketchParts(slug)` and `markedParts(sentence)`.                                                                                                                                    |
| `InkSketchFigure.svelte` | The hero on a page: the sketch, the Slovak sentence with its word lit, the English under it.                                                                                        |

A new piece goes in `things.ts`, `objects.ts` or `marks.ts` with `y` on `GROUND`. Give every stroke its own `seed` (a `person` uses `seed` to `seed + 8`). Pass a `grip` point to a person in absolute coordinates so two hands can meet.

## Adding a sketch

1. Decide the one idea in five words (below) and the Slovak sentence that shows it. Use an example the page already teaches, or an equally basic sentence checked with `slovak-language`.
2. Add a scene to `TOPIC_SCENES` (or `CASE_SCENES`) under the slug.
3. Add `sketch: { sentence, english, alt }` to the topic in `src/lib/catalog/reference/grammar.ts` (or the case in `cases.ts`). `**word**` lights the word the picture is about. `alt` says what the picture shows in a sentence a screen reader can use.
4. `bun scripts/ink/contact-sheet.ts <dir>` for your own look; then the **blind review** (below).
5. `ink.test.ts` fails if a topic has no scene or no caption, or a case has no patch.

## Drawing rules

These came out of the reviews. Each answers a real misreading.

1. **One idea.** What does this picture say in five words? If it needs two sentences it is two pictures. It is also the **point of the page**: past tense shows the -l form following who did it.
2. **It shows its own sentence.** A book in the sentence is a book in the picture, an office in "z práce" is an office (and the walker carries a briefcase, or it is "from home").
3. **Silhouette test.** Cover the labels. Could the object be read as two things? Add the detail only it has: a cup has a handle, a book is **open** with a spine and text lines (a closed book drawn as a box read as a binder, a frame and a parcel), a clock shows its minute hand dark and the digits "2:30" beside it, a window has glints in its panes, a house has a roof and a door, a tie is filled.
4. **One gesture, one meaning.** Pointing means "look at that" only. Walking (stride, trail or footprints) means going. Hands joined means "with". A speech bubble means the person says that word. A thought bubble means imagined. Do not reuse a pose for a second meaning on the same page set.
5. **Arrows are for movement or handing over, never time.** Time is a word (`včera`, `dnes`, `zajtra`, `teraz`, `každý deň`) or a calendar. An arrow that starts at a thing and ends at a person reads as "the thing sends something to the person".
6. **Lines of sight are dashed and start at an eye in the head.** A solid line is a beam. An eye with no head is a separate object.
7. **Label the phrase, not the letter.** `z práce`, not `z`. Put a question mark on a question word (`kto?`, `komu?`). A label that names the object (`kľúč`) turns a verb lesson into a vocabulary card.
8. **Show the contrast the page teaches.** Gender is three nouns with `ten`, `tá`, `to` lit. Aspect is the unfinished letter and the finished one. Ten, tento, tamten: a near house and a far one on its own raised horizon. A rule with a contrast is two things in one picture, not one thing and a word.
9. **Say who is who.** A child holding hands with a woman in a skirt is "with mama"; two same-height people are "friends". The woman in a dress is mama everywhere on the case pages.
10. **The patch is on the word the sentence lights.** If `**mamy**` is lit, the patch is behind it.
11. **Nothing that carries no meaning.** No stray dots, squiggles, motion lines behind one person only, or app icons (a map pin floats unless it sits on a house).
12. **Words need room.** Every note keeps 4 units of clear space from any stroke, from another note and from the sheet edge (x 12 to 328, y up to 128), and a note inside a bubble has the bubble sized to it (about 8 units of air on each side). A time word sits well above its arrow, not on it. Measure it with `node scripts/ink/audit-text.mjs <dir>` on the contact sheet.
13. **A label never repeats the sentence under the picture.** The hero sentence is already there. A note is for what the picture cannot say: the phrase a preposition sits in, a form under an object, a question word.
14. **Do not point at the answer to "who?".** Pointing at a person while asking "who?" reads as "who is that?". Show the unknown instead (a `?` for a face).

## Slovak

The sentence and every word written in the picture follow the `slovak-language` skill: forms checked, case names in full words in any prose (`genitive`, not an abbreviation), one noun (`mama`) across the six cases. A word under an object is in the form the sentence uses, or it is left out: `kniha` under a book in a sentence that says `knihu` was marked wrong by a reviewer.

## Blind review

Run it for every new or changed sketch, and for the whole set when the kit changes.

1. `bun scripts/ink/blind-sheets.ts <dir> 6 [slug…]` writes numbered sheets with no names and a key next to the folder. Screenshot each `sheet-N.html` to a PNG (the script prints the Chrome command).
2. Give two reviewers only the PNGs and the brief in [`blind-review.md`](blind-review.md): a fresh Claude subagent (`Agent`, model `opus`) and Antigravity `gemini-3.8-flash-high` (`delegate_task`, `role: review`, `mode: wait`). They must not see the sentence, the slug or the repo.
3. Score each answer against the sentence you meant. A confusion both name is real; a taste call from one is not. Gemini 3.8 Flash sometimes describes things that are not drawn: line A of its answer is the check.
4. Redraw what both flagged, render again with a new folder, and send fresh reviewers (not the same ones, they remember). Stop when every picture is 4 or better, both guess the meaning, and the rest is a limit you can write down.

Rounds on 2026-11-08: round 1 had eight pictures at 1 to 2 (the card, the cap and question words, the lasso, a table of cases, a shop sign that read as a business); round 4 had two reviewers at 4 to 5 on almost every picture. Limits left: the cases overview is a reference chart, "would" (conditional) reads as "wish", the reflexive shower shows washing more than "self", the present tense shows no contrast.

## Look at it

Never judge a picture from its code.

- **All sketches at once:** `bun scripts/ink/contact-sheet.ts <dir> [slug…]`, light and dark.
- **On the page:** `bun run dev`, open `/grammar/<slug>` or `/grammar/cases/<slug>`, light and dark, 900 px and 390 px. Crop to the heading and the figure for a PR screenshot.
- Screenshots go in the PR description (`AGENTS.md` → Pull requests), not in the repo.

## Mistakes already made

- A scene that only decorates: a ring with a dot for the locative, an eye floating between two people for "vidím" (it belongs at the viewer's face), a gift box for a sentence about a book, a card for "have" (read as a box, a safe or a microwave), a key (an upright key with a ring on top read as a second person).
- A correct word crossed out (`ja` in `ja rozumiem`) read as "wrong" to the owner and to a reviewer. Optional words go in grey brackets: `(ja)`. Never strike through something the language allows.
- A thought bubble labeled with a verb that does not match what is in it (`robil by som` with a sailing boat). The label and the picture must be one sentence.
- A solid sight line looked like a laser; a dot where hands meet looked like a ball; the instrumental figures were the same height and read as a couple.
- A time arrow between two people read as "she goes to him". Time is a word.
- A figure with `reach` draws one arm only. For two figures that hold hands, give each a `grip` at the same point.
- A note's lit part is the ending or prefix that changes (`ten**to**`, `**na**písal`). If everything is lit, nothing is.
- A speech bubble needs a tip near the speaker's head, not the middle of the page.
- A filter id must be unique per sketch (`ink-<slug>`), or two sketches on one page share one noise map.
- Text-anchor `middle` plus `**` spans: write the `<tspan>`s inline in the `<text>`, with no whitespace between them, or the word shows gaps.
- Notes below y 126 are cut off by the viewBox.
- `vector-effect: non-scaling-stroke` makes dashes use screen pixels. The kit does not use it.

## Related

- Felt-style tiles for the Grammar index are images (`scripts/images/felt-motifs.ts`), not sketches. A tile is for browsing; a sketch is for understanding.
- The stick-figure cast (`src/lib/stick-figure/`) plays podcast scenes and moves while a line is spoken. A sketch is still and has no cast.
- The contrast scenes inside a topic (`GrammarScene.svelte`, the small drawings next to each frame) answer "which form here?". The hero answers "what is this about?". Do not repeat one in the other.
