---
name: Content Expand Curriculum
overview: Keep pronunciation separate from grammar. Ship alphabet SVG reference, three Everyday lessons (numbers, time, negation), three grammar refs (numerals, negation, questions), locked ID contract, tests to 8 practice sets — parallelizable by file ownership.
todos:
  - id: roadmap-contract
    content: "Write docs/plans/2026-08-03-content-expansion-roadmap.md with locked IDs + practice-item contract"
    status: completed
  - id: alphabet-illustration
    content: "SlovakAlphabetIllustration.svelte + conditional slot in PronunciationTopicDetail"
    status: completed
  - id: alphabet-topic
    content: "Add pronunciation topic slovak-alphabet (pathGroup Spelling) in data.ts"
    status: completed
  - id: everyday-lessons
    content: "Add 3 Everyday lessons in lessons.ts (numbers, time, negation) with ≥2 graded exercises each"
    status: completed
  - id: practice-items-sets
    content: "Add 9 PracticeItems + 3 PracticeSets in practice.ts (total sets 8)"
    status: completed
  - id: grammar-refs
    content: "Add grammar topics numbers-and-numerals, negation, questions + reciprocal lesson links"
    status: completed
  - id: tests-verify
    content: "Update content.test.ts length 5→8; bun test/format/build; bun run index:search"
    status: completed
isProject: false
---

# Content Expand Curriculum

## Locked decisions

| #   | Decision                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Keep pronunciation separate** from grammar (linguistics + site IA). Do not merge like [slovake.eu/grammar](https://slovake.eu/grammar). |
| 2   | Ship **all four** tracks: alphabet illustration, Everyday pack, grammar refs, written roadmap.                                            |
| 3   | **No schema changes** — reuse `Lesson`, `PracticeItem`, `PracticeSet`, `GrammarTopic`, `PronunciationTopic`.                              |
| 4   | Numbers live in **both** Everyday lesson (usage) and Grammar ref (bounded quantity patterns).                                             |
| 5   | `word-order` already exists — extend `related` only; do not duplicate.                                                                    |
| 6   | Alphabet = pronunciation **reference** in v1 (no alphabet lesson / practice set yet).                                                     |

## Content IDs (contract)

| Area            | ID / slug                               | Route                                            |
| --------------- | --------------------------------------- | ------------------------------------------------ |
| Pronunciation   | `slovak-alphabet`                       | `/pronunciation/slovak-alphabet`                 |
| Everyday lesson | `everyday/numbers-and-personal-details` | `/lessons/everyday/numbers-and-personal-details` |
| Everyday lesson | `everyday/days-dates-and-time`          | `/lessons/everyday/days-dates-and-time`          |
| Everyday lesson | `everyday/negation-in-conversation`     | `/lessons/everyday/negation-in-conversation`     |
| Grammar         | `numbers-and-numerals`                  | `/grammar/numbers-and-numerals`                  |
| Grammar         | `negation`                              | `/grammar/negation`                              |
| Grammar         | `questions`                             | `/grammar/questions`                             |

### Practice item IDs

**Numbers**

- `everyday/age-with-rokov`
- `everyday/phone-number-digits`
- `everyday/simple-price`

**Time**

- `everyday/day-meeting`
- `everyday/meeting-time`
- `everyday/half-past-time`

**Negation**

- `everyday/negative-answer`
- `everyday/not-understand`
- `everyday/negative-verb-placement`

### Practice sets (primary)

| Set ID                         | `lessonId`                              |
| ------------------------------ | --------------------------------------- |
| `numbers-and-personal-details` | `everyday/numbers-and-personal-details` |
| `days-dates-and-time`          | `everyday/days-dates-and-time`          |
| `negation-in-conversation`     | `everyday/negation-in-conversation`     |

Total `practiceSets` length: **5 → 8**. Update `content.test.ts`.

## Parallel agent ownership

| Agent         | Exclusive files                                                                           | Depends on                  |
| ------------- | ----------------------------------------------------------------------------------------- | --------------------------- |
| Coordinator   | `docs/plans/2026-08-03-content-expansion-roadmap.md`                                      | —                           |
| Alphabet UI   | `src/lib/components/SlovakAlphabetIllustration.svelte`, `PronunciationTopicDetail.svelte` | slug contract               |
| Alphabet data | `data.ts` **pronunciationEntries only**                                                   | slug contract               |
| Lessons       | `lessons.ts` only                                                                         | practice IDs                |
| Practice      | `practice.ts` only                                                                        | practice IDs                |
| Grammar       | `data.ts` **grammarEntries only**                                                         | lesson paths + practice IDs |
| Tests         | `content.test.ts`                                                                         | all merged                  |

**Conflict:** B and E both touch `data.ts` — sequential merge or separate worktrees on disjoint sections.

## Phase detail

### 0 — Roadmap

Write `docs/plans/2026-08-03-content-expansion-roadmap.md` with this ID contract, owners, and acceptance list. No content edits yet.

### 1 — Alphabet

**Topic** (`pathGroup: "Spelling"`, `order: 1`, `nextSlug: "soft-consonants"`):

- Letters + diacritics; `ch` as digraph; letter→sound expectation
- Related: `soft-consonants`, `vowel-length`, useful dictionary lemmas

**Illustration** — `SlovakAlphabetIllustration.svelte`:

- Semantic HTML grid (accessible without SVG)
- Light inline SVG only for grouping (plain / acute / caron / `ch`)
- No animation libs; Tailwind only
- Slot in `PronunciationTopicDetail` when `topic.slug === "slovak-alphabet"` after Overview (avoid schema change for one visual)

### 2 — Everyday lessons (`lessons.ts`)

Each: scene, 4–6 key phrases, optional pattern, ≥2 graded + 1 personal exercise, exact `practiceItemId`s, `referenceLinks`.

1. **numbers-and-personal-details** — age/`rokov`, phone digits, price; refs → numerals, questions, `/dictionary/kolko`
2. **days-dates-and-time** — `v` + day, `o` + clock time, half-past; refs → questions, word-order
3. **negation-in-conversation** — `Nie, ďakujem.`, `Nerozumiem.`, `Nemám…`; refs → negation, word-order, `/dictionary/nie`

### 3 — Practice (`practice.ts`)

Nine items + three sets. Contextual tasks, correction + why, `source` pointing at lesson. No alphabet set.

### 4 — Grammar refs (`data.ts` grammarEntries)

- `numbers-and-numerals` (`Nouns`) — counting/quantity only; `jeden`, `dva/dve`, `tri/štyri`, `päť+`; `lessonLink` → numbers lesson
- `negation` (`Sentences`) — `nie` + finite verb; lexical negatives; `lessonLink` → negation lesson
- `questions` (`Sentences`) — question words + yes/no; reuse meet-someone + new items; `lessonLink` → meet-someone
- Wire `word-order.related` → `negation`, `questions`
- Reciprocal links from new lessons

### 5 — Verify

```text
bun run format
bun run test
bun run build
bun run index:search
```

Update `expect(practiceSets).toHaveLength(8)`; assert new lesson/set/topic IDs resolve; graded exercises ↔ practice items.

## Out of scope (v1)

- Full numeral declension, ordinals, fractions
- Alphabet lesson / practice set / ElevenLabs batch
- New grammar-track lessons for negation/questions
- Merging pronunciation into grammar nav
- Café / town / shopping Everyday units (next wave per older plan)

## Acceptance checklist

- [ ] Pronunciation stays its own nav + track
- [ ] `/pronunciation/slovak-alphabet` shows accessible alphabet grid
- [ ] Three new Everyday lessons appear on `/lessons` and open end-to-end
- [ ] Three new practice sets on `/practice`
- [ ] `/grammar/negation`, `/grammar/questions`, `/grammar/numbers-and-numerals` live with lesson links
- [ ] `bun run test` green; Pagefind reindexed

## Execution note

After plan approval: run Phase 0 first, then launch parallel agents A/B/C/D (alphabet UI+data, lessons, practice), then E (grammar), then F (tests).
