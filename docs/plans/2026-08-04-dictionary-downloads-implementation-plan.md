# Dictionary downloads — implementation plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Ship `/downloads` — client builder over a build-generated dictionary export JSON (design: `docs/plans/2026-08-04-dictionary-downloads-design.md`).

**Tech stack:** Astro SSR + Svelte 5 island, Bun scripts, Vitest, Tailwind (no new `styles.css` rules).

---

## Task 1: Export types + pure serializers

**Files:**

- Create: `src/lib/content/downloads/types.ts`
- Create: `src/lib/content/downloads/serialize.ts`
- Create: `src/lib/content/downloads/serialize.test.ts`

**Steps:**

1. Define `DictionaryExportFile`, `ExportWord`, `ExportExample`, `DownloadField`, `DownloadFormat`, `ExportOptions` (fields set, categories set or “all”, format, includeExamples derived from fields).
2. Implement:
   - `projectWords(words, options)` → filtered/projected words + flat examples rows when needed
   - `toExportJson(meta, words)`
   - `toDelimited(rows, headers, separator)` for CSV (`,`) and TSV (`\t`) with RFC4180-ish quoting
   - `attributionComment(meta)` for `# …` first line on delimited files
   - `buildDownloadFilenames(options)` → `slovak-wiki-words.{ext}` / `slovak-wiki-examples.{ext}` / single JSON name
3. Unit tests: field projection drops unchecked keys; category filter; examples-only yields only example rows; CSV quotes commas/newlines; JSON nesting when examples on.

**Verify:** `bun run test src/lib/content/downloads/serialize.test.ts`

---

## Task 2: `downloads:export` script + gitignore + build hook

**Files:**

- Create: `scripts/downloads/export.ts`
- Create (optional thin): `src/integrations/dictionary-downloads.ts` **or** extend `src/integrations/pagefind-search.ts` / new sibling wired in `astro.config.ts`
- Modify: `package.json` — add `"downloads:export": "bun scripts/downloads/export.ts"`
- Modify: `.gitignore` — add `static/downloads/`
- Modify: `AGENTS.md` — one bullet under dictionary: regenerate export for local `/downloads` via `bun run downloads:export` (also on `astro build`)

**Steps:**

1. Script imports `words` from `src/lib/content/data`, maps to slim export shape: `slug`, spelled `slovak`, `english`, `category`, spelled `related` (resolve slug→slovak), `examples[{ slovak, english }]` only — omit `note` / `tatoebaId` / `demonstrates`.
2. Write pretty JSON to `static/downloads/dictionary-export.json` (+ same path under `dist/` when called from build hook, mirroring pagefind dual-write).
3. Log word count + byte size.
4. Hook `astro:build:done` to call the same writer for `static/downloads` and deploy `dir/downloads`.

**Verify:** `bun run downloads:export` creates file; spot-check first entry; `bun run build` leaves export under `dist/downloads/`.

---

## Task 3: Client download helpers

**Files:**

- Create: `src/lib/content/downloads/client.ts` (or colocated under `src/lib/components/downloads/`)

**Steps:**

1. `downloadBlob(filename, blob)` via temporary `<a download>`.
2. `exportAndDownload(exportFile, options)` — uses serializers; if format is JSON → one file; if CSV/TSV and examples included → trigger words file then examples file (small `setTimeout` gap if needed for Safari).
3. No zip library in v1.

**Verify:** Manual in browser later; keep functions pure enough to test filename branching in unit tests if easy.

---

## Task 4: UI — page shell + builder island

**Files:**

- Create: `src/pages/downloads.astro`
- Create: `src/lib/pages/DownloadsPage.svelte` (SSR)
- Create: `src/lib/components/DownloadsBuilder.svelte` (`client:load` via slot)
- Modify: `src/lib/navigation.ts` — add Downloads to `referenceNavigation`; extend `isReferenceSection`
- Modify: `src/lib/components/Footer.svelte` — Downloads link
- Modify: `src/lib/pages/ReferencesPage.svelte` — lead or footer sentence linking to `/downloads`
- Optional: one line on dictionary hub (`WikiPage.svelte`) linking to downloads

**UI behavior:**

1. On mount, `fetch("/downloads/dictionary-export.json")`; `DotLoader` while pending; clear error if missing (tell user to run `bun run downloads:export`).
2. Presets: Full / Lemmas only / Examples only — set fields + call download (or only set fields; prefer set + download for Tatoeba-like one-click).
3. Checkboxes for fields; multi-select categories from distinct `category` values in payload (default all on).
4. Format: JSON | CSV | TSV.
5. Primary Button: Download.
6. Copy: attribution + link to `/references`; note Tatoeba CC BY 2.0 FR.

**Hydration pattern:** match `search.astro` — SSR page + slotted island.

**Verify:** `bun run downloads:export && bun run dev` → open `/downloads`, each preset + custom combo; confirm two files when CSV+examples.

---

## Task 5: Polish + docs touch

**Files:**

- Modify: `AGENTS.md` (if not done in Task 2)
- Modify: `scripts/README.md` — short `downloads/` entry if that index exists
- Run: `bun run format`

**Verify:**

- `bun run check`
- `bun run test`
- Manual: Full JSON, lemmas CSV, examples TSV, Verb-only custom JSON

---

## Deferred (do not implement now)

- R2 upload + `PUBLIC_DOWNLOADS_BASE_URL`
- Prebuilt preset files on CDN
- Frequency / lessons / media exports
- Zip of words+examples
- Example-source (Tatoeba/Curated) filter

---

## Critical paths

| Path                                         | Role                           |
| -------------------------------------------- | ------------------------------ |
| `scripts/downloads/export.ts`                | Build export JSON from `words` |
| `src/lib/content/downloads/serialize.ts`     | Filter + JSON/CSV/TSV          |
| `src/lib/components/DownloadsBuilder.svelte` | Island UI                      |
| `src/pages/downloads.astro`                  | Route                          |
| `src/lib/navigation.ts`                      | Nav                            |
| `astro.config.ts` + integration              | Build-time write               |
