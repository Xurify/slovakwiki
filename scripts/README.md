# Scripts

Grouped by job. Run content tooling with `bun scripts/<path>` from the repo root. Everyday app scripts live in `package.json` (`dev`, `build`, `test`, `index:search`, …).

**Typecheck:** `scripts/**` is included in `bun run typecheck` (`astro check`). Prefer Node stdlib + patterns from `scripts/lib/paths.ts` and sibling scripts — see `AGENTS.md` → **Scripts**.

## Happy path

```
bun scripts/dictionary/import-frequency.ts       # SNK noun top-3000 + verb top-2000 dumps + adjective/adverb top-1000 HTML → frequency JSON
bun scripts/dictionary/report-missing-glosses.ts # report frequency lemmas needing English glosses
bun scripts/dictionary/publish-frequency.ts      # glosses → content/dictionary/words.json
bun scripts/dictionary/publish-frequency.ts -- --dry-run # preview additions without writing words.json
bun scripts/dictionary/reclaim-weak-examples.ts  # drop weak fill stubs so Tatoeba can reclaim
bun scripts/dictionary/enrich-examples.ts -- --replace-practice
                                                 # Tatoeba dumps → replace practice / weak-template frames
bun scripts/dictionary/fill-empty-examples.ts    # noun/adj/adverb templates for lemmas Tatoeba missed (not verbs)
bun scripts/dictionary/author-verb-examples.ts   # hand/agent overlays + aspect clusters (no stamp frames)
bun scripts/dictionary/apply-curated-examples.ts # hand examples from curated-examples.json → words.json
bun scripts/dictionary/apply-related.ts          # semantic cluster peers into empty related
bun scripts/audio/generate.ts                    # ElevenLabs → static/audio/ (gitignored)
bun scripts/audio/upload.ts                      # static/audio/ → Cloudflare R2
bun scripts/audio/status.ts                      # coverage: targets vs disk vs uploaded
bun scripts/images/fetch.ts                      # Wikimedia pageimages → static/images/ (gitignored)
bun scripts/images/upload.ts                     # static/images/dictionary/ → R2 (`images/dictionary/…`)
bun scripts/images/status.ts                     # coverage: ok vs missing vs rejected, by part of speech
bun scripts/downloads/export.ts                  # dictionary JSON for /downloads builder (also on astro build)
bun run index:search                             # Pagefind for local/dev search
bun run fouc:boot                                # Rebuild blocking FOUC IIFEs (see src/lib/fouc/README.md)
```

### FOUC boots

Pre-paint `localStorage` paint for SSR pages. Shared kit: [`src/lib/fouc/README.md`](../src/lib/fouc/README.md). Registry: `scripts/fouc/registry.ts`. Generator: `bun run fouc:boot` (optional filter: `bun run fouc:boot -- lessons`).

### Content files

| File                                             | Role                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `content/dictionary/README.md`                   | Hand-add lemma template (fields, homes, slug/category, examples)                 |
| `content/dictionary/words.json`                  | Live bulk dictionary (frequency publish + enrich/fill/curate). Prettier-ignored. |
| `content/dictionary/curated-examples.json`       | Hand/pattern example overlay; apply with `apply-curated-examples.ts`             |
| `content/dictionary/related-clusters.json`       | Semantic related peers for `apply-related.ts`                                    |
| `content/audio/config.json`                      | ElevenLabs voice / model / settings + lesson `characters` cast                   |
| `content/audio/README.md`                        | Voice roster (dictionary + lesson cast, IDs, speakers, commands)                 |
| `content/audio/manifest.json`                    | Ops clip metadata (hash → text/bytes/uploadedAt); scripts only                   |
| `content/audio/runtime-index.json`               | Slim build index (hash → kind + generatedAt); app via `readFile`                 |
| `content/images/manifest.json`                   | Lemma image metadata (slug → file/license/attribution/status/uploadedAt)         |
| `content/images/overrides.json`                  | Manual reject / force Commons file per slug                                      |
| `src/lib/catalog/entries.ts` (`curatedWordSeed`) | Hand-seeded beginner lemmas merged with `words.json` at runtime                  |
| `static/audio/`                                  | Local MP3 cache (gitignored; `.vercelignore`d)                                   |
| `static/images/`                                 | Local dictionary thumbs (gitignored; upload to R2 for prod)                      |
| `static/downloads/`                              | Local dictionary export JSON for `/downloads` (gitignored)                       |

## `dictionary/`

Frequency lists, live dictionary publish, Tatoeba examples. Hand-add fields: [`content/dictionary/README.md`](../content/dictionary/README.md). Sources: [`docs/data-sources.md`](../docs/data-sources.md).

**Yearly SNK checklist:** revisit corpus version on [korpus.sk frequency lists](https://korpus.sk/en/frequency-lists-of-lemmata-word-forms-and-parts-of-speech-from-the-publicly-available-snc-corpora/). Counts are a committed snapshot of `prim-8.0-public-all` (`generatedAt` in `content/frequency/{verbs,nouns,adjectives,adverbs}.json`). No auto-refresh — bump importer + re-import only when a newer `prim-*-public-all` dump ships; spot-check rank drift before commit.

**Tatoeba dumps** (optional, examples only): put decompressed TSVs in `tmp/tatoeba/` —

- https://downloads.tatoeba.org/exports/per_language/slk/slk_sentences.tsv.bz2
- https://downloads.tatoeba.org/exports/per_language/slk/slk-eng_links.tsv.bz2
- https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2

| File                           | Run                                                   | Notes                                                                                                                                                                        |
| ------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate-noun-gloss-batch.ts` | `bun scripts/dictionary/generate-noun-gloss-batch.ts` | Wiktionary glosses for missing nouns; sets `register: colloquial` from labels                                                                                                |
| `merge-noun-gloss-batch.ts`    | `bun scripts/dictionary/merge-noun-gloss-batch.ts`    | Merges noun batch into `glosses.json`                                                                                                                                        |
| `report-missing-glosses.ts`    | `bun scripts/dictionary/report-missing-glosses.ts`    | Writes `tmp/missing-glosses.json` and prints missing-gloss counts by part of speech                                                                                          |
| `publish-frequency.ts`         | `bun scripts/dictionary/publish-frequency.ts`         | Writes/updates `content/dictionary/words.json`; `-v`/`-n`/`-a` slug suffix on collisions                                                                                     |
| `enrich-examples.ts`           | `bun scripts/dictionary/enrich-examples.ts`           | Needs `tmp/tatoeba/*.tsv`; morph forms; appends onto underfilled (< store pool, default 8); pattern lemmas may pad after curated; `--replace-practice` / `--refresh-tatoeba` |
| `reclaim-weak-examples.ts`     | `bun scripts/dictionary/reclaim-weak-examples.ts`     | Drops weak fill stubs (including fake-Curated verb infinitive frames) from curated JSON + words.json                                                                         |
| `fill-empty-examples.ts`       | `bun scripts/dictionary/fill-empty-examples.ts`       | Noun/adj/adverb templates + aspect pairs; tops up non-verbs with <2 examples. Does not fill verbs                                                                            |
| `author-verb-examples.ts`      | `bun scripts/dictionary/author-verb-examples.ts`      | Writes hand/agent verb overlays from `HAND_OVERRIDES` + aspect clusters. Does **not** mint `Prečo sa ${sg2}?` stamps — unique sentences live in `curated-examples.json`      |
| `apply-curated-examples.ts`    | `bun scripts/dictionary/apply-curated-examples.ts`    | Reviewed curated wins; pattern keeps Tatoeba extras; union-merge keeps Tatoeba; practice may top up underfilled                                                              |
| `apply-related.ts`             | `bun scripts/dictionary/apply-related.ts`             | Fills empty related from `related-clusters.json`                                                                                                                             |

Example limits: `src/lib/catalog/dictionary/example-limits.ts` — store pool 8 / display 4. Primary dictionary growth is frequency publish + example enrich. Example quality gates live in `src/lib/catalog/dictionary/example-quality.ts` + tests (not separate audit scripts).

## `audio/`

ElevenLabs TTS → local `static/audio/` → Cloudflare R2 for production.

**Always generate after spoken text changes.** Do not leave new lemmas, examples, or lesson lines without MP3s. `bun run index:search` does not create audio.

| Change                              | Command                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Known slugs (hand lemma, small set) | `bun scripts/audio/generate.ts -- --slugs kseft,objatie --missing-only` |
| Bulk publish / many new examples    | `bun scripts/audio/generate.ts -- --missing-only`                       |
| Lesson / practice spoken lines      | `bun scripts/audio/generate.ts -- --lessons-only --missing-only`        |

Needs `ELEVENLABS_API_KEY` in `.env`. Then `bun scripts/audio/upload.ts` before prod (R2). Generate locally even if upload is later.

| `generate.ts` | `bun scripts/audio/generate.ts` | Writes MP3s in **lemma → example → lesson** order; default `--concurrency 16` (Pro Flash ≈20 — see [`content/audio/README.md`](../content/audio/README.md#elevenlabs-plans--concurrency)); `--examples-only` / `--missing-only` / `--offset` / `--limit`; `--verify` caps concurrency at 4 |
| `voice-design.ts` | `bun scripts/audio/voice-design.ts` | ElevenLabs Voice Design → `tmp/voice-design/`; `--create` saves preview to library + patches `characters` in config |
| `upload.ts` | `bun scripts/audio/upload.ts` | Parallel R2 sync to `audio/{kind}/`; `--lemmas-only` / `--examples-only` / `--lessons-only` / `--force` / `--only`; needs `R2_*` |
| `migrate-r2-prefix.ts` | `bun scripts/audio/migrate-r2-prefix.ts` | Copy bucket-root `{kind}/` → `audio/{kind}/`; `--delete-source` after prod is on new URLs |
| `prune-orphans.ts` | `bun scripts/audio/prune-orphans.ts` | Dry-run orphan report (old hashes); `--delete` local+manifest; `--delete --r2` also DELETE on R2 |
| `status.ts` | `bun scripts/audio/status.ts` | Targets vs disk vs manifest |
| `verify.ts` | `bun scripts/audio/verify.ts` | Dual STT audit → `tmp/audio-verify-report.json` |
| `judge.ts` | (lib) | Dual STT + near-miss ending + logprob gap |
| `stt.ts` | (lib) | Scribe + Whisper adapters |
| `shared.ts` | (lib) | Hash / collect / synthesize / mapPool |

Layout: local `static/audio/{kind}/{hash}.mp3`. R2 `audio/{kind}/{hash}.mp3` (same bucket as `images/`). Hash = content address (includes voice); folder = how clip is used.

**Voices:** full roster → [`content/audio/README.md`](../content/audio/README.md). IDs in `config.json`. Design prompts: `voice-design.ts`.

Generate lesson clips: `bun scripts/audio/generate.ts -- --lessons-only`. After voice swaps: add `--force`. Lesson content may churn — treat those MP3s as disposable.

Prod env: `PUBLIC_AUDIO_BASE_URL` (R2 public base). Local: leave unset → `/audio/{kind}/{hash}.mp3`.

**QA / accuracy:** Default TTS is `eleven_flash_v2_5` + `language_code: sk`. Ultra-short homographs may use a synth-text override (`dictionaryLemmaSynthText`). `bun scripts/audio/verify.ts` / `generate.ts -- --verify` use a **dual judge** by default (`--stt dual`): ElevenLabs Scribe (spelling) + local Whisper (acoustic near-misses like `mýlil`→`mýliu`), plus Scribe last-word logprob gap. Fail → seed retry. Single-engine: `--stt elevenlabs` or `--stt whisper`. Whisper needs `py -3 -m pip install faster-whisper`.

## `images/`

Wikimedia free page images for dictionary lemmas → local `static/images/` → Cloudflare R2 for production.

| `fetch.ts` | `bun scripts/images/fetch.ts` | SK/EN Wikipedia `pageimages`, then **Commons gloss search** for Food / Places / People / Travel / Everyday / Essentials (e.g. `obed` → “lunch meal”). **No auto Commons for Nouns / adjectives / verbs / adverbs.** Person names are not dictionary entries. |
| `upload.ts` | `bun scripts/images/upload.ts` | Sync to R2; `--force` / `--only` / `--limit` / `--dry-run`; needs `R2_*` |
| `stage-candidates.ts` | `bun scripts/images/stage-candidates.ts` | Stage Commons candidates under `tmp/image-candidates/{slug}/` for visual audit |
| `promote.ts` | `bun scripts/images/promote.ts` | Promote audited candidate (`--slug` + `--pick N`) into live set |
| `status.ts` | `bun scripts/images/status.ts` | Targets vs ok/missing/rejected, by category |
| `shared.ts` | (lib) | Targets, overrides, paths, verb scenes + noun Commons query helpers |

Flags (`fetch`/`stage`): `--limit N`, `--pos noun|verb|adjective|adverb`, `--only {slug}`, `--force`. Adverbs accept `--pos` for filtering but have no auto Commons promote.

Overrides in `content/images/overrides.json`: `{ "slug": { "reject": true } }` or `{ "commonsFile": "Foo.jpg" }`.

**Image policy:** Prefer Wikipedia pageimages. If missing, auto-search Commons for learner categories with concrete referents (Food / Places / People / Travel / Everyday life / Essentials). Require free license; prefer filenames that _start_ with the gloss. General Nouns, adjectives, verbs, and adverbs stay empty unless `stage-candidates.ts` → visual audit → `promote.ts` (polysemy / false-friend risk).

Layout (local + R2): `images/dictionary/{file}`. Local disk: `static/images/dictionary/{file}`.

Prod env: `PUBLIC_IMAGE_BASE_URL` (R2 public base, e.g. `https://cdn.slovak.wiki`). Local: leave unset → `/images/dictionary/{file}` when file exists on disk.

## `search/`

| File                    | Run                                                               |
| ----------------------- | ----------------------------------------------------------------- |
| `build-search-index.ts` | `bun run index:search` (also used by the Astro build integration) |

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

## `recaps/`

Local before/after HTML for UI review (not shipped to the site). See `.cursor/skills/visual-recap`.

| File     | Run                                       | Notes                                                 |
| -------- | ----------------------------------------- | ----------------------------------------------------- |
| `cli.ts` | `bun run recap:index`                     | Rebuilds `recaps/index.html` from `*.html`            |
|          | `bun run recap:open <slug>`               | Opens `recaps/<slug>.html` in the browser             |
|          | `bun run recap:shot <slug> <name> <file>` | Files a browser capture as `recaps/<slug>/<name>.png` |

Screenshots come from chrome-devtools, which can only write to the OS temp directory unless
it runs with `--allowUnrestrictedPaths` — `recap:shot` moves the capture into place.

## `lib/`

Shared helpers (`paths.ts` → repo `ROOT`).
