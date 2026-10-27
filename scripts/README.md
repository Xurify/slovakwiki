# Scripts

Grouped by job. Run content tooling with `bun scripts/<path>` from the repo root. Everyday app scripts live in `package.json` (`dev`, `build`, `test`, `index:search`, …).

**Typecheck:** `scripts/**` is included in `bun run typecheck` (`astro check`, then `svelte-check`). Prefer Node stdlib + patterns from `scripts/lib/paths.ts` and sibling scripts — see `AGENTS.md` → **Scripts**.

## Happy path

```
bun scripts/dictionary/import-frequency.ts       # SNK noun top-3000 + verb top-2000 dumps + adjective/adverb top-1000 HTML → frequency JSON
bun scripts/dictionary/report-missing-glosses.ts # report frequency lemmas needing English glosses
bun scripts/dictionary/publish-frequency.ts      # glosses → content/dictionary/words.json
bun scripts/dictionary/publish-frequency.ts -- --dry-run # preview additions without writing words.json
bun scripts/dictionary/assign-noun-gender.ts     # ending rule + exceptions → noun `gender` in words.json
bun scripts/dictionary/enrich-examples.ts        # Tatoeba dumps → examples for empty / underfilled lemmas
bun scripts/dictionary/author-verb-examples.ts   # hand/agent overlays + aspect clusters (no stamp frames)
bun scripts/dictionary/apply-curated-examples.ts # hand examples from curated-examples.json → words.json
bun scripts/dictionary/apply-related.ts          # semantic cluster peers into empty related
bun scripts/audio/generate.ts                    # ElevenLabs → static/audio/ (gitignored)
bun scripts/audio/upload.ts                      # static/audio/ → Cloudflare R2
bun scripts/audio/status.ts                      # coverage: targets vs disk vs uploaded
bun scripts/images/fetch.ts                      # Wikimedia pageimages → static/images/ (gitignored)
bun scripts/images/upload.ts                     # static/images/dictionary/ → R2 (`images/dictionary/…`)
bun scripts/images/status.ts                     # coverage: ok vs missing vs rejected, by part of speech
bun scripts/images/reject.ts -- --slugs chyba    # hide a live image (override + manifest)
bun scripts/downloads/export.ts                  # dictionary JSON for /downloads builder (also on astro build)
bun run index:search                             # Pagefind for local/dev search
bun run fouc:boot                                # Rebuild blocking FOUC IIFEs (see src/lib/fouc/README.md)
```

### FOUC boots

Pre-paint `localStorage` paint for SSR pages. Shared kit: [`src/lib/fouc/README.md`](../src/lib/fouc/README.md). Registry: `scripts/fouc/registry.ts`. Generator: `bun run fouc:boot` (optional filter: `bun run fouc:boot -- lessons`). Must run on the `packageManager` Bun version — the generator refuses anything else, because a different minify changes the committed IIFE hash.

### Content files

| File                                                      | Role                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `content/dictionary/README.md`                            | Hand-add lemma template (fields, homes, slug/category, examples)                 |
| `content/dictionary/words.json`                           | Live bulk dictionary (frequency publish + enrich/fill/curate). Prettier-ignored. |
| `content/dictionary/curated-examples.json`                | Hand/pattern example overlay; apply with `apply-curated-examples.ts`             |
| `content/dictionary/related-clusters.json`                | Semantic related peers for `apply-related.ts`                                    |
| `content/dictionary/tatoeba-rejected.json`                | Tatoeba sentence IDs rejected as wrong Slovak (ID → reason); enrich skips them   |
| `content/dictionary/tatoeba-lemma-rejected.json`          | Tatoeba rows wrong for one entry (`slug#ID` → reason); enrich skips them there   |
| `content/audio/config.json`                               | ElevenLabs voice / model / settings + lesson `characters` cast                   |
| `content/audio/README.md`                                 | Voice roster (dictionary + lesson cast, IDs, speakers, commands)                 |
| `content/audio/manifest.json`                             | Ops clip metadata (hash → text/bytes/uploadedAt); scripts only                   |
| `content/audio/runtime-index.json`                        | Slim build index (hash → kind + generatedAt); app via `readFile`                 |
| `content/audio/mouth.json`                                | Lesson clip loudness + vowel per 50 ms (hash → take + tracks), stick-figure cast |
| `content/images/manifest.json`                            | Lemma image metadata (slug → file/license/attribution/status/uploadedAt)         |
| `content/images/overrides.json`                           | Manual reject / force Commons file per slug                                      |
| `src/lib/catalog/dictionary/words.ts` (`curatedWordSeed`) | Hand-seeded beginner lemmas merged with `words.json` at runtime                  |
| `static/audio/`                                           | Local MP3 cache (gitignored; `.vercelignore`d)                                   |
| `static/images/`                                          | Local dictionary thumbs (gitignored; upload to R2 for prod)                      |
| `static/downloads/`                                       | Local dictionary export JSON for `/downloads` (gitignored)                       |

## `dictionary/`

Frequency lists, live dictionary publish, Tatoeba examples. Hand-add fields: [`content/dictionary/README.md`](../content/dictionary/README.md). Sources: [`docs/data-sources.md`](../docs/data-sources.md).

**Yearly SNK checklist:** revisit corpus version on [korpus.sk frequency lists](https://korpus.sk/en/frequency-lists-of-lemmata-word-forms-and-parts-of-speech-from-the-publicly-available-snc-corpora/). Counts are a committed snapshot of `prim-8.0-public-all` (`generatedAt` in `content/frequency/{verbs,nouns,adjectives,adverbs}.json`). No auto-refresh — bump importer + re-import only when a newer `prim-*-public-all` dump ships; spot-check rank drift before commit.

**Noun gender:** the Slovak ending rule in `scripts/dictionary/noun-gender-rules.ts` plus the exceptions in [`content/dictionary/noun-gender-exceptions.json`](../content/dictionary/noun-gender-exceptions.json) (masculine people/animals, feminine nouns ending in a consonant, plural-only nouns, deliberate unsets). Optional check: put the [UD Slovak-SNK](https://github.com/UniversalDependencies/UD_Slovak-SNK) `.conllu` files in `tmp/ud-slovak-snk/` and the script lists every noun the treebank disagrees with.

**Tatoeba dumps** (optional, examples only): put decompressed TSVs in `tmp/tatoeba/` —

- https://downloads.tatoeba.org/exports/per_language/slk/slk_sentences.tsv.bz2
- https://downloads.tatoeba.org/exports/per_language/slk/slk-eng_links.tsv.bz2
- https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2

| File                           | Run                                                                          | Notes                                                                                                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate-noun-gloss-batch.ts` | `bun scripts/dictionary/generate-noun-gloss-batch.ts`                        | Wiktionary glosses for missing nouns; sets `register: colloquial` from labels                                                                                                                                                                |
| `merge-noun-gloss-batch.ts`    | `bun scripts/dictionary/merge-noun-gloss-batch.ts`                           | Merges noun batch into `glosses.json`                                                                                                                                                                                                        |
| `report-missing-glosses.ts`    | `bun scripts/dictionary/report-missing-glosses.ts`                           | Writes `tmp/missing-glosses.json` and prints missing-gloss counts by part of speech                                                                                                                                                          |
| `publish-frequency.ts`         | `bun scripts/dictionary/publish-frequency.ts`                                | Writes/updates `content/dictionary/words.json`; `-v`/`-n`/`-a` slug suffix on collisions                                                                                                                                                     |
| `enrich-examples.ts`           | `bun scripts/dictionary/enrich-examples.ts`                                  | Needs `tmp/tatoeba/*.tsv`; morph forms; appends onto underfilled (< store pool, default 8); pattern lemmas may pad after curated; `--refresh-tatoeba`; skips `tatoeba-rejected.json` IDs and per-entry `tatoeba-lemma-rejected.json` rows    |
| `assign-noun-gender.ts`        | `bun scripts/dictionary/assign-noun-gender.ts`                               | Writes `gender` (+ `pluralOnlyGender`) on `Nouns` rows: exceptions file, else ending rule. Prints every gender it sets or changes — new masculine nouns for people/animals need an exception. Re-run after publishing new nouns. `--dry-run` |
| `drop-mismatched-examples.ts`  | `bun scripts/dictionary/drop-mismatched-examples.ts -- --slugs chyba,chybat` | Drops Tatoeba rows that are not the lemma / a diacritic-true form. **Requires `--slugs`** — heuristic forms are too incomplete for a full sweep                                                                                              |
| `author-verb-examples.ts`      | `bun scripts/dictionary/author-verb-examples.ts`                             | Writes hand/agent verb overlays from `HAND_OVERRIDES` + aspect clusters. Does **not** mint `Prečo sa ${sg2}?` stamps — unique sentences live in `curated-examples.json`                                                                      |
| `apply-curated-examples.ts`    | `bun scripts/dictionary/apply-curated-examples.ts`                           | Reviewed curated wins; pattern keeps Tatoeba extras; union-merge keeps Tatoeba; practice may top up underfilled                                                                                                                              |
| `apply-related.ts`             | `bun scripts/dictionary/apply-related.ts`                                    | Fills empty related from `related-clusters.json`                                                                                                                                                                                             |

Example limits: `src/lib/catalog/dictionary/example-limits.ts` — store pool 8 / display 4. Primary dictionary growth is frequency publish + example enrich. Example quality gates live in `src/lib/catalog/dictionary/example-quality.ts` + tests (not separate audit scripts).

## `audio/`

ElevenLabs TTS → local `static/audio/` → Cloudflare R2 for production.

**Always generate after spoken text changes.** Do not leave new lemmas, examples, or lesson lines without MP3s. `bun run index:search` does not create audio.

| Change                              | Command                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Known slugs (hand lemma, small set) | `bun scripts/audio/generate.ts -- --slugs kseft,objatie --missing-only` |
| Bulk publish / many new examples    | `bun scripts/audio/generate.ts -- --missing-only`                       |
| Lesson / practice spoken lines      | `bun scripts/audio/generate.ts -- --lessons-only --missing-only`        |
| Grammar page sentences              | `bun scripts/audio/generate.ts -- --slugs possessives --missing-only`   |

Needs `ELEVENLABS_API_KEY` in `.env`. Then `bun scripts/audio/upload.ts` before prod (R2). Generate locally even if upload is later.

| `generate.ts` | `bun scripts/audio/generate.ts` | Writes MP3s in **lemma → example → lesson** order; default `--concurrency 8` (v4 group `standard_eleven_v4` — see [`content/audio/README.md`](../content/audio/README.md#elevenlabs-plans--concurrency)); `--examples-only` / `--missing-only` / `--offset` / `--limit`; `--verify` caps concurrency at 4. Clips stamped `uploadedAt` count as present (on R2) even without a local file; `--force` re-synthesizes |
| `voice-design.ts` | `bun scripts/audio/voice-design.ts` | ElevenLabs Voice Design → `tmp/voice-design/`; `--create` saves preview to library + patches `characters` in config |
| `upload.ts` | `bun scripts/audio/upload.ts` | Parallel R2 sync to `audio/{kind}/`; HEADs each object and skips the same take (`generated-at` metadata), never overwrites a newer one; a clip on disk the manifest does not list takes its text and voice from the line that produces it, and is skipped with a warning when no line on this branch does (`static/audio/` keeps other branches' clips); `--lemmas-only` / `--examples-only` / `--lessons-only` / `--force` / `--only`; needs `R2_*` |
| `check-build.ts` | `bun run audio:check` | After `bun run build` (CI): fails when built lesson pages reference no lesson clips |
| `migrate-r2-prefix.ts` | `bun scripts/audio/migrate-r2-prefix.ts` | Copy bucket-root `{kind}/` → `audio/{kind}/`; `--delete-source` after prod is on new URLs |
| `prune-orphans.ts` | `bun scripts/audio/prune-orphans.ts` | Dry-run orphan report (old hashes); `--delete` local files, and manifest entries for clips not on R2 (an uploaded clip may be another branch's, so its entry stays until `--r2` deletes it); `--delete --r2` also DELETE on R2, except R2 orphans uploaded in the last 30 days, which an open branch may still need (`--keep-days N`; `--keep-days 0` deletes them too). A branch open longer than that can still lose clips: raise the window or check open branches first |
| `status.ts` | `bun scripts/audio/status.ts` | Targets vs disk vs manifest |
| `mouth.ts` | `bun scripts/audio/mouth.ts` | Lesson clip loudness + aligned vowels → `content/audio/mouth.json` for stick-figure lip sync. `generate.ts` already runs it for lesson clips it writes; run it to backfill or after pulling new takes. Reads local MP3s, else `PUBLIC_AUDIO_BASE_URL`; needs ffmpeg; `--force` re-measures all |
| `lipsync.ts` | `bun scripts/audio/lipsync.ts -- --only "Je to"` | How well the mouth follows the voice: syllables placed by `alignSyllables` against Scribe's word times, per clip and in all. `--tags` scores clips with a direction in their text. Scribe's word times are cached in `tmp/scribe-words.json` per take, so a retake is heard again. Under 80% means a mouth on the wrong words |
| `verify.ts` | `bun scripts/audio/verify.ts` | Dual STT audit → `tmp/audio-verify-report.json` |
| `judge.ts` | (lib) | Dual STT + near-miss ending + logprob gap |
| `stt.ts` | (lib) | Scribe + Whisper adapters |
| `shared.ts` | (lib) | Hash / collect / synthesize / mapPool |

Layout: local `static/audio/{kind}/{hash}.mp3`. R2 `audio/{kind}/{hash}.mp3` (same bucket as `images/`). Hash = content address (includes voice); folder = how clip is used.

**Voices:** full roster → [`content/audio/README.md`](../content/audio/README.md). IDs in `config.json`. Design prompts: `voice-design.ts`.

Generate lesson clips: `bun scripts/audio/generate.ts -- --lessons-only`. After voice swaps: add `--force`. Lesson content may churn — treat those MP3s as disposable.

Prod env: `PUBLIC_AUDIO_BASE_URL` (R2 public base). Local page URLs stay `/audio/{kind}/{hash}.mp3`. In `astro dev`, a missing file under `static/audio/` is proxied from that base when the env is set; a file on disk still wins.

**QA / accuracy:** Default TTS is `eleven_v4` + `language_code: sk`. Spoken text is the learner line, with no synth rewrite. `bun scripts/audio/verify.ts` / `generate.ts -- --verify` use a **dual judge** by default (`--stt dual`): ElevenLabs Scribe (spelling) + local Whisper (acoustic near-misses like `mýlil`→`mýliu`), plus Scribe last-word logprob gap. Fail → seed retry. Single-engine: `--stt elevenlabs` or `--stt whisper`. Whisper needs `py -3 -m pip install faster-whisper`.

## `images/`

Wikimedia free page images for dictionary lemmas → local `static/images/` → Cloudflare R2 for production.

| `fetch.ts` | `bun scripts/images/fetch.ts` | SK pageimage only if the filename is a simple subject; else EN; else titled Commons. People: prefer clipart. Food/places/everyday: prefer photos (cartoon query last). Reject editorial/political cartoons, GIF, historical maps (`Europe in 1923`). Busy scenes stay empty. `--upgrade` drops adjective/verb/phrase oks and refetches theme-safe oks whose titles fail the gate. `--force` / `--only slug` (exact or comma list, never substring). |
| `upload.ts` | `bun scripts/images/upload.ts` | Sync to R2; `--force` / `--only` / `--limit` / `--dry-run`; needs `R2_*` |
| `reject.ts` | `bun scripts/images/reject.ts -- --slugs chyba` | Mark override `reject` + manifest `rejected`. No Wikimedia call. Copy the command from `/dev/images`. |
| `preview-sources.ts` | `bun scripts/images/preview-sources.ts -- --limit 24` | Fetch SK / EN / Commons / Openverse thumbs into `tmp/image-source-preview.json`. Also Pexels, Unsplash, Pixabay photos when `PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY`, `PIXABAY_API_KEY` are set (missing keys show as skipped tiles). View `/dev/images/compare`. Does **not** write the live manifest. `--only obed,vlak` / `--abstracts` / `--pos noun`. |
| `judge.ts` | `bun scripts/images/judge.ts -- --agent` | Cursor-only: stage thumbs under `scripts/images/judge-thumbs/`, fill `picks.json`, re-run. With `OPENAI_API_KEY`, omit `--agent`. Writes `tmp/image-source-judge.json`. Green ring on `/dev/images/compare`. Never writes the live manifest. `--only kolac,kava` / `--force` / `--dry-run`. |
| `stage-candidates.ts` | `bun scripts/images/stage-candidates.ts` | Stage Commons candidates under `tmp/image-candidates/{slug}/` for visual audit |
| `promote.ts` | `bun scripts/images/promote.ts` | Promote audited candidate (`--slug` + `--pick N`) into live set |
| `apply-photo-picks.ts` | `bun scripts/images/apply-photo-picks.ts` | Write hand-picked photos from `photo-picks.json` into the manifest. Unsplash: hotlinked, reports each use to Unsplash (`UNSPLASH_ACCESS_KEY`; `--offline` skips the API). Pixabay: downloads to `static/images/dictionary/` (`PIXABAY_API_KEY`), then run `upload.ts` before merging. |
| `status.ts` | `bun scripts/images/status.ts` | Targets vs ok/missing/rejected, by category |
| `shared.ts` | (lib) | Targets, overrides, paths, verb scenes + noun Commons query helpers |

Flags (`fetch`/`stage`/`upload`): `--limit N`, `--pos noun|verb|adjective|adverb`, `--only {slug}` or `--only a,b` (exact slugs; `auto` ≠ `autobus`, `rim` ≠ `diskriminacia`), `--force`, fetch `--upgrade`. Adverbs accept `--pos` for filtering but have no auto Commons promote.

Overrides in `content/images/overrides.json`: `{ "slug": { "reject": true } }` or `{ "commonsFile": "Foo.jpg" }`.

**Image policy:** Auto-fetch only for concrete learner themes (Food / Places / People / Travel / Everyday life). SK/EN pageimage only if the filename is a simple subject — traffic jams, picnics, collages, political cartoons, maps miss. Commons still needs a gloss-leading title. People may auto-prefer clipart; food stays photos unless a titled cartoon is the only hit. SVG originals OK via Commons PNG thumbs. Places stay photos. Free license required. General Nouns / adjectives / verbs / adverbs stay empty unless `stage-candidates.ts` → visual audit → `promote.ts`, or `overrides.commonsFile`. Existing `ok` images stay until rejected or `fetch --upgrade` (upgrade also clears adjective/verb/phrase oks). Do not mass-promote crude clipart by hand (`Cake-cartoon.jpg`).

**Audit:** open `/dev/images` (noindex). Mark junk → copy `reject.ts --slugs …` → run locally. Replacement: `stage-candidates` → `promote`, or `overrides.commonsFile`. Compare sources at `/dev/images/compare` (chain chips + optional vision judge). Next source (not wired): Openverse search in `stage-candidates` only — never auto-ok.

Layout (local + R2): `images/dictionary/{file}`. Local disk: `static/images/dictionary/{file}`.

Prod env: `PUBLIC_IMAGE_BASE_URL` (R2 public base, e.g. `https://cdn.slovak.wiki`). Local: leave unset → `/images/dictionary/{file}` when file exists on disk.

## `search/`

| File                    | Run                                                               |
| ----------------------- | ----------------------------------------------------------------- |
| `build-search-index.ts` | `bun run index:search` (also used by the Astro build integration) |

**Browse index** (`dictionary/publish-index.ts`, run by the `dictionary-index` integration on every build): content-hashed `dictionary-browse.<hash>.json` behind header search, `/dictionary` filters and the common-word pages. Search fetches it on intent (hover, focus, `/`); only `/dictionary` loads it up front. Every build writes it to `/_astro/` (immutable on Vercel). Dev serves it from memory at `/dictionary-browse.json`.

Prod env to serve it from R2 instead: `PUBLIC_DATA_BASE_URL` (R2 public base; key `data/…`) plus `R2_*` in the Vercel build env so the build can upload it. The build only switches to R2 after fetching the public URL the way the site would — the bucket needs a CORS rule allowing `GET` from `https://www.slovak.wiki`, and responses must be compressed (Cloudflare custom domain). Otherwise it logs why and keeps the Vercel copy.

## `docs/`

| File                    | Run                                      |
| ----------------------- | ---------------------------------------- |
| `write-data-sources.ts` | `bun scripts/docs/write-data-sources.ts` |

## `downloads/`

| File        | Run                               | Notes                                                                                             |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `export.ts` | `bun scripts/downloads/export.ts` | Slim merged dictionary → `static/downloads/dictionary-export.json`; also Astro `astro:build:done` |

Used by `/downloads` client builder (JSON/CSV/TSV). Regenerated on content change via build; run locally when the file is missing.

**Export shape:** per word — `slug`, spelled `slovak`, `english`, `category`, spelled `related` lemmas, `examples[{ slovak, english }]`. Tabular examples file columns: `slug`, `lemma`, `slovak`, `english`. Omits internal `note` / `tatoebaId` / `demonstrates`.

**Anki phrases pack:** headerless TSV (`slovak-wiki-anki-phrases.tsv`) — one row per sentence, `slovak\tenglish` (Front / Back). No `#` comment.

## `lib/`

Shared helpers (`paths.ts` → repo `ROOT`, `r2.ts` → R2 client from `R2_*` env).
