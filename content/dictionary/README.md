# Dictionary entries

How to add or edit a lemma by hand. Script pipelines: [`scripts/README.md`](../../scripts/README.md). Example pool sizes: [`src/lib/content/example-limits.ts`](../../src/lib/content/example-limits.ts).

## Where to put it

| Intent | File | Notes |
| ------ | ---- | ----- |
| Beginner / topic word (greetings, food, essentials…) | `curatedWordSeed` in [`src/lib/content/data.ts`](../../src/lib/content/data.ts) | Merged first at runtime → `origin: "curated"`. Do **not** also add the same slug to `words.json`. |
| Bulk / POS lemma (SNK-style) | [`words.json`](./words.json) | Usual home for Verbs / Nouns / Adjectives / Places. `origin: "frequency"` unless slug is in curated seed. Person names are not entries. |
| Better examples only (lemma already exists) | [`curated-examples.json`](./curated-examples.json) then `bun run examples:curate` | Overlay keyed by existing slug — not a new entry. |
| Empty `related` peers | [`related-clusters.json`](./related-clusters.json) then `bun run related:apply` | Fills empty related arrays only. |

Prefer curated seed for learner-facing essentials; prefer `words.json` (or `frequency:publish`) for mass POS coverage.

## Entry skeleton

Hand-authored shape (`WordSeed`). Runtime fills `kind`, `summary`, `body`, `tags`, `origin`, `frequency`, and source labels in `data.ts`.

```json
{
  "slug": "dakujem",
  "slovak": "ďakujem",
  "english": "thank you",
  "category": "Essentials",
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

| Field | Required | Rules |
| ----- | -------- | ----- |
| `slug` | yes | From `lemmaToSlug(slovak)` in `src/lib/content/frequency.ts`: lowercase, strip diacritics, non-alphanumeric → `-`, trim hyphens. Unique across curated seed + `words.json`. On POS collision, frequency publish uses `-v` / `-n` / `-a` (e.g. `stat-n`). |
| `slovak` | yes | Lemma with correct diacritics (`ďakujem`, not `dakujem`). |
| `english` | yes | Short gloss; multiple senses with `; ` (`can; to be able to`). |
| `category` | yes | See categories below — match the home file. |
| `examples` | yes | See example rules. |
| `related` | yes | Array of **existing** slugs (may be `[]`). No free-text labels. |

Do not hand-write `origin`, `frequency`, `body`, `summary`, `tags`, or source fields into `words.json`.

### Example object (optional keys)

| Field | When |
| ----- | ---- |
| `slovak` / `english` | Always. |
| `note` | `"Curated"` for hand lines; `"Tatoeba"` when from corpus (keep `tatoebaId`). |
| `demonstrates` | Short learner cue for pattern lemmas (`byť + location — where`). |
| `tatoebaId` | Slovak-side Tatoeba id when `note` is `"Tatoeba"`. |
| `isPracticeFrame` | Fill-script stubs only — prefer real curated/Tatoeba over these. |

## Categories

**Curated seed** (topic labels): `Greetings`, `Essentials`, `Questions`, `Conversation`, `Learning`, `Everyday life`, `People`, `Food`, `Places`, `Travel`, …

**`words.json` bulk** (POS / entity): `Verbs`, `Nouns`, `Adjectives`, `Places`.

Do not invent a new category unless the UI already treats it as a browse bucket. Prefer an existing label.

## Examples — how many

| Layer | Count | Constant |
| ----- | ----- | -------- |
| Shown on lemma page + example audio | first **4** | `EXAMPLE_DISPLAY_LIMIT` |
| Soft store pool (enrich default) | up to **8** | `EXAMPLE_STORE_PER_WORD` |
| Fill tops up if below | **2** | `examples:fill` |

Hand-add checklist:

1. Ship **≥4 strong** learner sentences (display floor). Best rows **first** — UI and audio use the first 4.
2. Prefer **≤8** total so the pool matches enrich.
3. Curated / `demonstrates` rows before Tatoeba / practice frames.
4. Keep examples clean (`src/lib/content/example-quality.ts`): no vulgar/sexual content; prefer real sentences over glossary fragments.

## After you edit

1. Confirm slug unique (`curatedWordSeed` + `words.json`).
2. Confirm every `related` slug exists.
3. `bun run index:search` so local Pagefind matches.
4. Optional: `bun run audio:generate` (and upload) for new lemma/example text; `bun run images:fetch` for lemma thumbs.

## Anti-patterns

- Duplicating a curated slug into `words.json` (seed wins; bulk row is filtered out).
- Putting topic categories (`Food`) into bulk frequency rows without intent.
- Related entries that are English glosses or Slovak surface forms instead of slugs.
- Stuffing weak fill stubs into the first four slots.
