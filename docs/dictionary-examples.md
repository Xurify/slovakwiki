# Dictionary examples: generation and curation prompts

A dictionary entry shows and voices its first four examples (`EXAMPLE_DISPLAY_LIMIT`). Use these two prompts to make those four good: fill an entry that has fewer, and replace a weak line in the four it shows. Run **15–20 entries at a time**; a larger batch hides weak lines.

Two agents, not one: the generator writes, a curator who has not seen the generator's reasoning decides what ships. With repo access, both load the `slovak-language` skill and its `references/slovak-wiki-authoring.md` (§6 dictionary entries, §7 vetting) first. Without it, the rules below are the ones that matter.

## Pick the batch

Read the entries from `words` in `src/lib/catalog/entries.ts` (curated seed and `words.json` merged), not from `words.json` alone, and take, most frequent first (`frequency.rank`):

1. entries with fewer than four examples;
2. then entries whose first four are all `Tatoeba`, which is where calques and English word order live.

Skip a slug that a `variant-forms.json` group lists after its first slug: it has no page.

On 2026-11-11 only five entries had fewer than four (`nikde`, `nikam`, `inde`, `kedysi`, `nijaky`) and 1,137 showed four Tatoeba lines, so most batches are replacement work.

## Input

Give the generator, per entry, what it needs to stay in one sense:

```json
{
  "entries": [
    {
      "slug": "nikam",
      "slovak": "nikam",
      "english": "nowhere (to)",
      "category": "Adverbs",
      "need": 3,
      "examples": [
        {
          "slovak": "Nikam nejdem.",
          "english": "I am not going anywhere.",
          "note": "Tatoeba",
          "tatoebaId": 1056401
        }
      ],
      "sameSpelling": [],
      "related": ["nikde", "kam"]
    }
  ]
}
```

- `need`: how many new lines to write. For a short entry, `4 − examples.length`. For a replacement batch, the curator's first pass marks which shown lines are weak, and `need` is that count.
- `sameSpelling`: other entries with the same `slovak` (`krásne` the adverb and the form of `krásny`, `stat` and `stat-v`), with their gloss and category, so the generator knows which sense belongs to the other page. A sentence on one may not also be on the other; the test fails it.
- Include `gender` for nouns and `register` when the entry has one.

## Prompt 1: generate

You are a Slovak lexicographer writing learner examples for slovak.wiki. For each entry, write exactly `need` new sentences. Do not edit an existing example; a weak one is the curator's to drop.

Each sentence must:

- **contain the headword** as a whole word, or a correct inflected form of it. A suffix inside another word does not count. A reflexive verb shows its `sa` / `si` (`Bojím sa tmy.` on `báť`).
- **use the sense in `english`**, not a sense from `sameSpelling` and not another part of speech: `krásne dievča` is the adjective, so it is not an example for the adverb `krásne`.
- **show the word working**, each sentence in a different frame from the others and from the existing ones:
  - noun: a different case in each, with a preposition or an agreeing adjective where it shows gender (`do vane`, `stará vaňa`);
  - verb: different persons and tenses, its case government (`čakať na + acc.`), and the aspect the sense needs;
  - adjective: agreement with nouns of different genders;
  - adverb, pronoun, particle: the relation it marks, clear from the sentence alone (`nikam` with a motion verb and negation, against `nikde` for place).
- **sound like spoken modern Slovak**, about 4–10 words (the dictionary's shown lines have a median of 6). Ends with `.`, `?` or `!`, no `;`, Slovak quotes `„…“`.
- **have a natural English translation** that says the same thing: no added or dropped information, and the pronoun the Slovak shows (`Napustila` is _she_, `ty` and `vy` are both _you_).

Reject your own candidate if it:

- is a definition or tautology (`Vaňa je vaňa.`), or a frame you used for another entry in this batch (`Toto je …`, `Vidím …`, `Mám …`);
- has Czech forms (`vanu`, `jedná sa`), missing diacritics, an English article or word order, a calqued passive, a subject pronoun without contrast (`On je unavený.`), possessive overuse (`Zatvoril svoje oči.`), or a clitic out of second place;
- uses `budem` with a perfective, a past form built by analogy, or a case the verb or preposition does not take;
- names a person, brand, place or date the word does not need, makes a factual claim, or is vulgar, sexual, political or medical advice;
- is bookish, archaic or too rare for an A2–B1 learner.

If you are not sure a form exists or fits the sense, do not write it: list the entry under `rejected` with what you were unsure of. Fewer good lines beat four.

Return only JSON:

```json
{
  "batch": [
    {
      "slug": "nikam",
      "examples": [
        {
          "slovak": "Dnes večer nikam nejdeme.",
          "english": "We're not going anywhere tonight.",
          "note": "Curated"
        }
      ]
    }
  ],
  "rejected": [{ "slug": "…", "reason": "Not sure of the genitive plural; check PSP." }]
}
```

Every line you write is `Curated`. Never copy a Tatoeba sentence into the output, and never fix one: a Tatoeba line with a fault is dropped and replaced (see **Apply**).

### Worked example

`nikam` has one example and needs three.

Good:

- `Dnes večer nikam nejdeme.`: _We're not going anywhere tonight._ Motion verb, negated, first person plural.
- `Bez kľúčov sa nikam nedostaneš.`: _You won't get anywhere without the keys._ Second person, perfective future.
- `Cez víkend nikam necestovali.`: _They didn't travel anywhere over the weekend._ Past tense.

Bad:

- `Nikam som ho nevidel.`: _nikam_ is direction; seeing happens at a place, so this is `nikde`.
- `Nikam ideme.`: Slovak negative words need a negated verb (`nikam nejdeme`).
- `Nikam nejdem.`: the existing line again.

## Prompt 2: curate

You are the second reviewer. You did not write these sentences and you do not trust the generator's notes. You get the entry data, the existing examples, and the candidates. Return only what you would ship.

For each candidate, check:

1. **Headword:** quote the token that is the headword or its form. If you cannot point to one, reject. The repo's test checks this for Tatoeba rows only, so for `Curated` rows your mark is the check.
2. **Sense:** the gloss's sense and part of speech, not a `sameSpelling` sibling's.
3. **Agreement and government:** adjective with noun, subject with verb, case after the verb or preposition, location against direction (`v škole` / `do školy`, `kde` / `kam`).
4. **Aspect and tense:** process against a bounded event, no `budem` + perfective, irregular past forms (`išiel`, `mohol`).
5. **Naturalness:** read it aloud. Would a Slovak say it to a friend? Remove what English added: subject pronouns, possessives, articles.
6. **Translation:** the English says the same thing, in the gender and number the Slovak shows.
7. **Level and safety:** A2–B1, self-contained, learner-safe, no names, brands or dates the word does not need.
8. **Variety:** no frame repeated from another line on this entry, another entry in the batch, or a `sameSpelling` sibling.

For a replacement batch, review the entry's shown Tatoeba lines by the same list, and name each one that fails and why.

Then pick the four the entry should show, best first. Prefer one line per frame (case, person, tense, the reflexive first for a reflexive verb) over four of one kind.

When a candidate's fault has one certain fix, rewrite it and say what changed in `changed`. When the form or the sense is uncertain, reject it.

```json
{
  "accepted": [
    {
      "slug": "nikam",
      "examples": [
        {
          "slovak": "Dnes večer nikam nejdeme.",
          "english": "We're not going anywhere tonight.",
          "note": "Curated",
          "headword": "nikam"
        }
      ]
    }
  ],
  "rejected": [
    {
      "slug": "nikam",
      "slovak": "Nikam som ho nevidel.",
      "reason": "Direction word with a verb of place; that is nikde."
    }
  ],
  "dropTatoeba": [
    {
      "slug": "example",
      "tatoebaId": 1035696,
      "scope": "all",
      "reason": "possessive overuse: svojho psa"
    }
  ]
}
```

`headword` and `changed` are review notes: strip them before applying. `scope` is `all` when the sentence is bad Slovak, or `entry` when it is fine but about another word that shares a form.

## Apply and verify

1. Add accepted lines to `content/dictionary/curated-examples.json` under their slug, best first, then run `bun scripts/dictionary/apply-curated-examples.ts`. It puts `Curated` lines before the entry's Tatoeba lines, keeps the rest of the pool, drops lines that fail `isCleanExample`, and moves conjugated verb lines forward. Check with `git diff --stat` that `words.json` changed only for the batch. An entry from the curated seed is not in `words.json`: edit its `examples` in `curatedWordSeed` (`src/lib/catalog/dictionary/words.ts`) instead.
2. For each `dropTatoeba` row, remove it from the entry and record its ID with the reason: `scope: all` in `content/dictionary/tatoeba-rejected.json` (`"<id>": "<reason>"`), `scope: entry` in `tatoeba-lemma-rejected.json` (`"<slug>#<id>": "<reason>"`), so `enrich-examples.ts` never brings it back.
3. `bun run format`.
4. `bunx vitest run src/lib/catalog/dictionary`, then `bun run test`.
5. `bun scripts/audio/generate.ts -- --slugs <slugs> --missing-only` (needs `ELEVENLABS_API_KEY`), and `bun scripts/audio/upload.ts` (needs `R2_*`). If upload has no keys, say so in the PR.
6. `bun run index:search`.

In the PR, give one QA link per changed entry (`/dictionary/<slug>`), and list each entry that still shows fewer than four with the curator's reason. Never fill the last slot with a definition, a duplicate, or a line whose form nobody checked.
