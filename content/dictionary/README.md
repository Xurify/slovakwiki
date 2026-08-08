# Dictionary entries

How to add or edit a lemma by hand. Script pipelines: [`scripts/README.md`](../../scripts/README.md). Example pool sizes: [`src/lib/content/example-limits.ts`](../../src/lib/content/example-limits.ts).

## Where to put it

| Intent                                               | File                                                                                                       | Notes                                                                                                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Beginner / topic word (greetings, food, essentials…) | `curatedWordSeed` in [`src/lib/content/data.ts`](../../src/lib/content/data.ts)                            | Merged first at runtime → `origin: "curated"`. Do **not** also add the same slug to `words.json`.                                                 |
| Bulk / POS lemma (SNK-style)                         | [`words.json`](./words.json)                                                                               | Usual home for Verbs / Nouns / Adjectives / Adverbs / Places. `origin: "frequency"` unless slug is in curated seed. Person names are not entries. |
| Better examples only (lemma already exists)          | [`curated-examples.json`](./curated-examples.json) then `bun scripts/dictionary/apply-curated-examples.ts` | Overlay keyed by existing slug — not a new entry.                                                                                                 |
| Empty `related` peers                                | [`related-clusters.json`](./related-clusters.json) then `bun scripts/dictionary/apply-related.ts`          | Fills empty related arrays only.                                                                                                                  |

Prefer curated seed for learner-facing essentials; prefer `words.json` (or `publish-frequency.ts`) for mass POS coverage.

## Entry skeleton

Hand-authored shape (`WordSeed`). Runtime fills `kind`, `summary`, `body`, `tags`, `origin`, `frequency`, and source labels in `data.ts`.

```json
{
  "slug": "dakujem",
  "slovak": "ďakujem",
  "english": "thank you",
  "category": "Phrases",
  "topics": ["Essentials"],
  "examples": [
    {
      "slovak": "Ďakujem za pomoc.",
      "english": "Thank you for the help.",
      "note": "Curated"
    },
    {
      "slovak": "Ďakujem pekne.",
      "english": "Thank you kindly.",
      "note": "Curated"
    }
  ],
  "related": ["prosim", "prepacte"]
}
```

### Fields

| Field      | Required | Rules                                                                                                                                                                                                                                                             |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`     | yes      | From `lemmaToSlug(slovak)` in `src/lib/content/frequency.ts`: lowercase, strip diacritics, non-alphanumeric → `-`, trim hyphens. Unique across curated seed + `words.json`. On POS collision, frequency publish uses `-v` / `-n` / `-a` / `-adv` (e.g. `stat-n`). |
| `slovak`   | yes      | Lemma with correct diacritics (`ďakujem`, not `dakujem`).                                                                                                                                                                                                         |
| `english`  | yes      | Short gloss; multiple senses with `; ` (`can; to be able to`).                                                                                                                                                                                                    |
| `category` | yes      | Browse bucket: `Verbs` / `Nouns` / `Adjectives` / `Adverbs` / `Places` / `Phrases`. Themes go in `topics`.                                                                                                                                                        |
| `topics`   | no       | Optional learner themes (`Food`, `Greetings`, …) for Essentials / home previews — not dictionary chips.                                                                                                                                                           |
| `examples` | yes      | See example rules.                                                                                                                                                                                                                                                |
| `related`  | yes      | Array of **existing** slugs (may be `[]`). No free-text labels.                                                                                                                                                                                                   |

Do not hand-write `origin`, `frequency`, `body`, `summary`, `tags`, or source fields into `words.json`.

### Example object (optional keys)

| Field                | When                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| `slovak` / `english` | Always.                                                                      |
| `note`               | `"Curated"` for hand lines; `"Tatoeba"` when from corpus (keep `tatoebaId`). |
| `demonstrates`       | Short learner cue for pattern lemmas (`byť + location — where`).             |
| `tatoebaId`          | Slovak-side Tatoeba id when `note` is `"Tatoeba"`.                           |
| `isPracticeFrame`    | Fill-script stubs only — prefer real curated/Tatoeba over these.             |

## Categories

**Browse buckets** (`category` — dictionary chips + POS): `Verbs`, `Nouns`, `Adjectives`, `Adverbs`, `Places`, `Phrases`.

**Learner themes** (`topics` — curated seed only; future Essentials page): `Greetings`, `Essentials`, `Questions`, `Conversation`, `Learning`, `Everyday life`, `People`, `Food`, `Travel`, …

`words.json` bulk rows use POS / Places only. Do not invent a new browse `category` unless the dictionary UI already treats it as a chip. Prefer an existing label. Put themes in `topics`, not `category`.

Example curated seed:

```json
{
  "slug": "jedlo",
  "slovak": "jedlo",
  "english": "food; meal",
  "category": "Nouns",
  "topics": ["Food"],
  "examples": [],
  "related": []
}
```

## Examples — how many

| Layer                               | Count       | Constant                 |
| ----------------------------------- | ----------- | ------------------------ |
| Shown on lemma page + example audio | first **4** | `EXAMPLE_DISPLAY_LIMIT`  |
| Soft store pool (enrich default)    | up to **8** | `EXAMPLE_STORE_PER_WORD` |
| Fill tops up if below               | **2**       | `fill-empty-examples.ts` |

Hand-add checklist:

1. Ship **≥4 strong** learner sentences (display floor). Best rows **first** — UI and audio use the first 4.
2. Prefer **≤8** total so the pool matches enrich.
3. Curated / `demonstrates` rows before Tatoeba / practice frames.
4. Keep examples clean (`src/lib/content/example-quality.ts`): no vulgar/sexual content; prefer real sentences over glossary fragments.

## After you edit

1. Confirm slug unique (`curatedWordSeed` + `words.json`).
2. Confirm every `related` slug exists.
3. `bun run index:search` so local Pagefind matches.
4. Optional: `bun scripts/audio/generate.ts` (and `upload.ts`) for new lemma/example text; `bun scripts/images/fetch.ts` for lemma thumbs.

## Anti-patterns

- Duplicating a curated slug into `words.json` (seed wins; bulk row is filtered out).
- Putting theme labels (`Food`) into `category` instead of `topics` (breaks POS browse + search forms).
- Related entries that are English glosses or Slovak surface forms instead of slugs.
- Stuffing weak fill stubs into the first four slots.
