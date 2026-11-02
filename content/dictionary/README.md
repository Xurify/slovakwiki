# Dictionary entries

How to add or edit a lemma by hand. Script pipelines: [`scripts/README.md`](../../scripts/README.md). Example pool sizes: [`src/lib/catalog/dictionary/example-limits.ts`](../../src/lib/catalog/dictionary/example-limits.ts).

## Where to put it

| Intent                                               | File                                                                                                       | Notes                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Beginner / topic word (greetings, food, essentials…) | `curatedWordSeed` in [`src/lib/catalog/dictionary/words.ts`](../../src/lib/catalog/dictionary/words.ts)    | Merged first at runtime → `origin: "curated"`. Do **not** also add the same slug to `words.json`.                                                                                                                                                                                                                                         |
| Bulk / POS lemma (SNK-style)                         | [`words.json`](./words.json)                                                                               | Usual home for Verbs / Nouns / Adjectives / Adverbs / Places. `origin: "frequency"` unless slug is in curated seed. Person names are not entries.                                                                                                                                                                                         |
| Better examples only (lemma already exists)          | [`curated-examples.json`](./curated-examples.json) then `bun scripts/dictionary/apply-curated-examples.ts` | Overlay keyed by existing slug — not a new entry.                                                                                                                                                                                                                                                                                         |
| Empty `related` peers                                | [`related-clusters.json`](./related-clusters.json) then `bun scripts/dictionary/apply-related.ts`          | Fills empty related arrays only.                                                                                                                                                                                                                                                                                                          |
| Other forms of one word (zase, zas, zasa)            | [`variant-forms.json`](./variant-forms.json): one array of slugs per word                                  | The first slug in the array keeps the page and lists the others under "Also". The others get no page; links to them go to that page. Add a group only when the Slovak dictionary gives the forms as one word. Not aspect pairs (robiť / urobiť), diminutives or feminines, and not forms that differ in meaning or use (trvalo / trvale). |

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

| Field        | Required | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `slug`       | yes      | From `lemmaToSlug(slovak)` in `src/lib/catalog/frequency.ts`: lowercase, strip diacritics, non-alphanumeric → `-`, trim hyphens. Unique across curated seed + `words.json`. On POS collision, frequency publish uses `-v` / `-n` / `-a` / `-adv` (e.g. `stat-n`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `slovak`     | yes      | Lemma with correct diacritics (`ďakujem`, not `dakujem`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `english`    | yes      | Short gloss; multiple senses with `; ` (`can; to be able to`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `category`   | yes      | Browse bucket: `Verbs` / `Nouns` / `Adjectives` / `Adverbs` / `Places` / `Phrases`. Themes go in `topics`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `topics`     | no       | Optional learner themes (`Food`, `Greetings`, …) for Essentials / home previews — not dictionary chips.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `register`   | no       | `"colloquial"` (spoken/informal) or `"slang"` (in-group / hustle flavor). Frequency publish copies it from `glosses.json`; UI shows a Colloquial or Slang chip.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `gender`     | no       | Nouns only: `"masculine-animate"`, `"masculine-inanimate"`, `"feminine"`, `"neuter"`, or `"plural-only"` (nohavice, dvere). `words.json` rows get it from `bun scripts/dictionary/assign-noun-gender.ts`: the Slovak ending rule, unless the lemma is in [`noun-gender-exceptions.json`](./noun-gender-exceptions.json). To fix one, add the lemma to the right list there and re-run (editing `words.json` directly is overwritten). Masculine nouns for people and animals always need an entry under `masculine-animate`. Plural-only nouns are listed with their dictionary gender (dvere: `"feminine"`); the page shows "plural only (feminine)". `unset` keeps a lemma without a gender, with the reason. Curated seed nouns set it in the seed. |
| `dialect`    | no       | `true` for regional / non-standard lemmas. Shows a Dialect chip and [Nárečie.sk](https://narecie.sk/) in Look up this word. Not implied by `register`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `declension` | no       | Nouns, curated seed only: `{ singular, plural }`, six forms each in case order N G D A L I. Every form checked against JÚĽŠ (PSP/KSSJ) — never built by rule. Shown as the Forms table on the entry.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `examples`   | yes      | See example rules.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `related`    | yes      | Array of **existing** slugs (may be `[]`). No free-text labels.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Do not hand-write `origin`, `frequency`, `body`, `summary`, `tags`, or source fields into `words.json`.

### Example object (optional keys)

| Field                | When                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| `slovak` / `english` | Always.                                                                      |
| `note`               | `"Curated"` for hand lines; `"Tatoeba"` when from corpus (keep `tatoebaId`). |
| `demonstrates`       | Short learner cue for pattern lemmas (`byť + location — where`).             |
| `tatoebaId`          | Slovak-side Tatoeba id when `note` is `"Tatoeba"`.                           |

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

Hand-add checklist:

1. Ship **≥4 strong** learner sentences (display floor). Best rows **first** — UI and audio use the first 4.
2. For verbs, mix forms in those first 4 when the pool has them (1sg + 2sg/3sg/past, or conjugated + modal+infinitive). Do not stamp `Prečo sa ${form}?` frames.
3. Prefer **≤8** total so the pool matches enrich.
4. Curated / `demonstrates` rows before Tatoeba.
5. Keep examples clean (`src/lib/catalog/dictionary/example-quality.ts`): no vulgar/sexual content; prefer real sentences over glossary fragments.

## After you edit

1. Confirm slug unique (`curatedWordSeed` + `words.json`).
2. Confirm every `related` slug exists.
3. `bun run index:search` so local Pagefind matches.
4. **Required:** `bun scripts/audio/generate.ts -- --slugs <slug> --missing-only` (lemma + example clips). `bun scripts/audio/upload.ts` before prod. See [`scripts/README.md`](../../scripts/README.md) → **audio/**.
5. Optional: `bun scripts/images/fetch.ts` for lemma thumbs (reject bad Commons matches).

## Anti-patterns

- An example that does not contain the headword: `hrá` (verb) on `hra` (noun), `jasné` (adjective) on `jasne` (adverb), `mená` on `mena`. Check the word itself, not its diacritic twin.
- An example where the headword has the same spelling but another part of speech: `krásne dievča` is the adjective, so it does not belong on the adverb `krásne` (`Spieva krásne.`). The headword test cannot see this; read the sentence. Each such adverb lists its adjective first in `related`, and the adjective lists the adverb.
- A headword that is not a Slovak word on its own: `pro` is Czech (Slovak `za`), `členný` only ends compounds (`dvojčlenný`). Check PSP / KSSJ, and add such lemmas to `FREQUENCY_PUBLISH_BLOCKLIST` in [`src/lib/catalog/frequency/blocklist.ts`](../../src/lib/catalog/frequency/blocklist.ts) so a publish never brings them back.
- Stamped fragments such as `Chujem to.` / `I keep it.`: one frame filled with every verb produces wrong forms and nonsense. Write a real sentence or leave the slot empty.
- Editing a Tatoeba sentence to fix a typo or a Czech word. Drop the row and add its ID with a short reason to [`tatoeba-rejected.json`](./tatoeba-rejected.json), so `enrich-examples.ts` never brings it back.
- Dropping a Tatoeba row whose Slovak is right but whose English says something else (`asi` translated "as many as"). Keep the row and its ID, so the Tatoeba credit stays, and put the right English in [`tatoeba-english-fixes.json`](./tatoeba-english-fixes.json) (ID → `english`, `reason`). `enrich-examples.ts` uses it, and the dictionary test fails if the old English comes back.
- A Tatoeba row about another word that shares a form with the headword: `Zaujíma vás politika?` is about politics, yet `politika` is also a form of `politik`, so the headword test passes it. Drop it from that entry only and add `slug#ID` with a reason to [`tatoeba-lemma-rejected.json`](./tatoeba-lemma-rejected.json). `enrich-examples.ts` then never puts it back there, and the row stays on `politika`.
- A gloss taken from a near-twin: `prieť` is “to argue (prieť sa)”, not “to wrestle”; `smieť` is “to be allowed to”, not “to be”. Adverbs are glossed as adverbs (`krásne` = beautifully), and reflexive verbs show `sa` / `si`.
- Duplicating a curated slug into `words.json` (seed wins; bulk row is filtered out).
- Putting theme labels (`Food`) into `category` instead of `topics` (breaks POS browse + search forms).
- Related entries that are English glosses or Slovak surface forms instead of slugs.
- Stuffing weak fill stubs into the first four slots.
