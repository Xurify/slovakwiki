# Frequency lists + Tatoeba util: Implementation Plan

Design: `docs/plans/2026-08-02-frequency-tatoeba-dictionary-design.md`

## Scope

Ship in one pass:

1. Shared **references** data + public References page
2. **Frequency import** util → committed `content/frequency/*.json`
3. Public **`/dictionary/common`** lists UI
4. **Draft build + promote** util (Tatoeba dumps optional for examples)

Do **not** mass-publish dictionary stubs. Live words stay human-approved only.

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
3. Add `scripts/import-frequency.ts`:
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

## 4. Draft pipeline

1. Types for drafts in `src/lib/content/draft-types.ts`.
2. `content/drafts/` tracked; sample `.gitkeep`.
3. `scripts/build-drafts.ts`:
   - Read frequency lists + live `words`.
   - For missing lemmas (start with top N configurable, default 100 per POS), write `pending` draft JSON files (one per lemma or one file per POS — prefer **one file per lemma** `content/drafts/{slug}.json` for easy approve edits).
   - Do not overwrite `approved` / `rejected` / `promoted` unless `--force`.
4. Optional Tatoeba step (same script flag `--with-tatoeba`):
   - Read local dump path (document download from https://tatoeba.org/en/downloads and https://downloads.tatoeba.org/exports/).
   - Attach ≤2 SK–EN pairs; store `tatoebaId`.
   - Cache dumps under `tmp/tatoeba/` (gitignored).
5. `scripts/promote-draft.ts`:
   - Read drafts with `status: "approved"`.
   - Append/merge into live dictionary source (refactor `wordSeed` toward importable JSON/TS module if needed — keep change minimal: append to a `content/dictionary/words.json` or generate a TS fragment; pick the smallest change that matches current `data.ts` pattern).
   - Mark draft `promoted` + timestamp.
6. Scripts: `drafts:build`, `drafts:promote`.

## 5. Live dictionary wiring (minimal)

If promote currently cannot safely edit `data.ts` by hand-merge:

1. Prefer extracting `wordSeed` into `src/lib/content/words-seed.ts` or JSON so promote can append programmatically.
2. Keep generated output formatted; run `bun run format` after promote in docs.
3. Ensure new words get `kind: "word"`, JÚĽŠ (or draft sources) in `source`, and existing map helpers still work.

## 6. Tests

1. Frequency JSON schema validation test.
2. Lemma ↔ live entry match helper unit tests (diacritics / slug).
3. Promote: approved draft merges once; second run idempotent.
4. Common page: smoke that frequency data loads and known live words (e.g. if any overlap) link correctly.

## 7. Docs + package.json

1. `docs/data-sources.md` — all canonical links from the design.
2. Short section in `AGENTS.md` or util README: when to run `frequency:import` / `drafts:build` / `drafts:promote`.
3. Add bun scripts for the three commands.

## Implementation order

1. References module + page (unblocks attribution everywhere)
2. Frequency types + import (or curated seed JSON) + commit first lists
3. `/dictionary/common` UI + dictionary index link
4. Draft build (without Tatoeba)
5. Promote path + wordSeed extract if needed
6. Tatoeba optional examples flag
7. Tests + `docs/data-sources.md` polish

## Done when

- [ ] `/references` (or `/about/references`) lists SNK, Tatoeba, JÚĽŠ with licenses
- [ ] `content/frequency/{verbs,nouns,adjectives}.json` committed and attributed
- [ ] `/dictionary/common` shows three top-1000 lists; live entries link; drafts never shown
- [ ] `drafts:build` creates pending drafts for missing common lemmas
- [ ] `drafts:promote` only publishes approved drafts into live dictionary
- [ ] Source links documented in util docs and match the references module
- [ ] Pivot note present on frequency importer
