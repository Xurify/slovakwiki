# Frequency lists + Tatoeba util: Implementation Plan

Design: `docs/plans/2026-08-02-frequency-tatoeba-dictionary-design.md`

> **Superseded:** step 4 draft build/promote was replaced by direct `frequency:publish` → `content/dictionary/words.json`.

## Scope

Ship in one pass:

1. Shared **references** data + public References page
2. **Frequency import** util → committed `content/frequency/*.json`
3. Public **`/dictionary/common`** lists UI
4. **Publish + enrich** (`frequency:publish` → `words.json`, then Tatoeba enrich)

Do **not** invent examples. Live words come from curated seed + frequency publish.

## 1. Shared references module

1. Add `src/lib/content/references.ts` (or `content/references.json` imported by both app and scripts) with grouped sources:
   - Dictionary (JÚĽŠ)
   - Corpus / frequency (SNK lists + top-1000 example URL)
   - Examples (Tatoeba downloads, exports, API note, CC BY)
2. Add `docs/data-sources.md` that renders the same URLs (can be generated from the module or kept in sync by hand once — prefer single source of truth).
3. Add page `src/pages/about/references.astro` (or `/references`) + thin Svelte page shell matching existing wiki pages.
4. Link References from footer / about / dictionary common footer as appropriate (minimal: footer + common-lists source line).

## 2. Frequency data + import script

1. Define Zod (or TS) types for frequency entries in `src/lib/content/frequency-types.ts`.
2. Create `content/frequency/.gitkeep` and commit initial JSON after first successful import (verbs / nouns / adjectives).
3. Add `scripts/dictionary/import-frequency.ts`:
   - Fetch or accept local HTML/CSV from SNK top-1000 lemma pages (verbs, nouns, adjectives — use current public prim-* URLs; pin version in metadata).
   - Parse rank, lemma, count.
   - Write `content/frequency/verbs.json` etc. with `source` + `sourceUrl`.
4. Package scripts: `frequency:import`.
5. Document SNK URLs in script header + `docs/data-sources.md`.
6. **Pivot note in script:** frequency provider interface (`importFrequency(pos)`) so a Tatoeba-rank importer can replace SNK later.

If automated scrape of korpus.sk is fragile, v1 fallback: checked-in manually curated extracts from the published top-1000 tables, still attributed to SNK — util validates/normalizes rather than live-scrapes.

## 3. Dictionary common lists UI

1. Route: `src/pages/dictionary/common.astro` + `src/lib/pages/DictionaryCommonPage.svelte` (or extend Wiki patterns).
2. Load committed frequency JSON at build time.
3. Resolve live link by matching lemma → existing `words` slug/slovak (normalize diacritics for match helper if needed; prefer exact lemma match first).
4. UI: tabs Verbs / Nouns / Adjectives; ruled list; rank; lemma; muted “not in dictionary yet” when no live entry.
5. Link from dictionary index (`WikiPage` / dictionary landing) to “Most common words”.
6. Source footer citing SNK via references module.
7. Optional: include in Pagefind as a single document (“common Slovak verbs nouns adjectives”) — skip if noisy; prefer explicit nav link only for v1.

## 4. Publish + examples (current)

1. `scripts/dictionary/publish-frequency.ts` → `content/dictionary/words.json`.
2. `examples:enrich` / `fill` / `curate` / `related:apply` against `words.json`.
3. Hand overlay: `content/dictionary/curated-examples.json`.

~~Draft JSON under `content/drafts/` + promote scripts~~ — not shipped; superseded by direct publish.

## 5. Live dictionary wiring

1. `data.ts` merges `curatedWordSeed` + `words.json`.
2. Run `bun run format` after content script writes.
3. New words get `kind: "word"`; frequency origin → SNK attribution.

## 6. Tests

1. Frequency JSON schema validation test.
2. Lemma ↔ live entry match helper unit tests (diacritics / slug).
3. Publish idempotent on already-live lemmas.
4. Common page: smoke that frequency data loads and known live words link correctly.

## 7. Docs + package.json

1. `docs/data-sources.md` — all canonical links from the design.
2. `AGENTS.md` + `scripts/README.md`: `frequency:import` / `frequency:publish` / examples pipeline.
3. Bun scripts for import, publish, enrich, fill, curate, related.

## Implementation order

1. References module + page (unblocks attribution everywhere)
2. Frequency types + import + commit first lists
3. `/dictionary/common` UI + dictionary index link
4. `frequency:publish` → `words.json`
5. Tatoeba enrich + curated examples overlay
6. Tests + `docs/data-sources.md` polish

## Done when

- [x] `/references` lists SNK, Tatoeba, JÚĽŠ with licenses
- [x] `content/frequency/{verbs,nouns,adjectives}.json` committed and attributed
- [x] `/dictionary/common` shows three top-1000 lists; live entries link
- [x] `frequency:publish` writes glossed lemmas to `content/dictionary/words.json`
- [x] Tatoeba enrich + curated overlay feed examples on live words
- [x] Source links documented in util docs and match the references module
- [x] Pivot note present on frequency importer
