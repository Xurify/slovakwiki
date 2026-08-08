# Scripts

Grouped by job. Run content tooling with `bun scripts/<path>` from the repo root. Everyday app scripts live in `package.json` (`dev`, `build`, `test`, `index:search`, …).

## Happy path

```
bun scripts/dictionary/import-frequency.ts       # SNK noun top-2500 dump + verb/adjective/adverb top-1000 HTML → frequency JSON
bun scripts/dictionary/report-missing-glosses.ts # report frequency lemmas needing English glosses
bun scripts/dictionary/publish-frequency.ts      # glosses → content/dictionary/words.json
bun scripts/dictionary/publish-frequency.ts -- --dry-run # preview additions without writing words.json
bun scripts/dictionary/reclaim-weak-examples.ts  # drop weak fill stubs so Tatoeba can reclaim
bun scripts/dictionary/enrich-examples.ts -- --replace-practice
                                                 # Tatoeba dumps → replace practice frames only
bun scripts/dictionary/fill-empty-examples.ts    # template stubs for lemmas Tatoeba missed
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
```

### Content files

| File                                          | Role                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `content/dictionary/README.md`                | Hand-add lemma template (fields, homes, slug/category, examples)         |
| `content/dictionary/words.json`               | Live bulk dictionary (frequency publish + enrich/fill/curate)            |
| `content/dictionary/curated-examples.json`    | Hand/pattern example overlay; apply with `apply-curated-examples.ts`     |
| `content/dictionary/related-clusters.json`    | Semantic related peers for `apply-related.ts`                            |
| `content/audio/config.json`                   | ElevenLabs voice / model / settings + lesson `characters` cast           |
| `content/audio/README.md`                     | Voice roster (dictionary + lesson cast, IDs, speakers, commands)         |
| `content/audio/manifest.json`                 | Generated clip metadata (hash → text/bytes/uploaded)                     |
| `content/images/manifest.json`                | Lemma image metadata (slug → file/license/attribution/status/uploadedAt) |
| `content/images/overrides.json`               | Manual reject / force Commons file per slug                              |
| `src/lib/content/data.ts` (`curatedWordSeed`) | Hand-seeded beginner lemmas merged with `words.json` at runtime          |
| `static/audio/`                               | Local MP3 cache (gitignored; `.vercelignore`d)                           |
| `static/images/`                              | Local dictionary thumbs (gitignored; upload to R2 for prod)              |
| `static/downloads/`                           | Local dictionary export JSON for `/downloads` (gitignored)               |

## `dictionary/`

Frequency lists, live dictionary publish, Tatoeba examples.

| File                        | Run                                                | Notes                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `import-frequency.ts`       | `bun scripts/dictionary/import-frequency.ts`       | Nouns use the full SNK count dump (default top 2500); verbs/adjectives/adverbs keep the HTML top 1000; `--noun-limit N` / `--force`                                          |
| `report-missing-glosses.ts` | `bun scripts/dictionary/report-missing-glosses.ts` | Writes `tmp/missing-glosses.json` and prints missing-gloss counts by part of speech                                                                                          |
| `publish-frequency.ts`      | `bun scripts/dictionary/publish-frequency.ts`      | Writes/updates `content/dictionary/words.json`; `-v`/`-n`/`-a` slug suffix on collisions                                                                                     |
| `enrich-examples.ts`        | `bun scripts/dictionary/enrich-examples.ts`        | Needs `tmp/tatoeba/*.tsv`; morph forms; appends onto underfilled (< store pool, default 8); pattern lemmas may pad after curated; `--replace-practice` / `--refresh-tatoeba` |
| `reclaim-weak-examples.ts`  | `bun scripts/dictionary/reclaim-weak-examples.ts`  | Drops exact weak fill stubs from curated JSON                                                                                                                                |
| `fill-empty-examples.ts`    | `bun scripts/dictionary/fill-empty-examples.ts`    | Part-of-speech templates + aspect pairs; tops up lemmas with <2 examples                                                                                                     |
| `apply-curated-examples.ts` | `bun scripts/dictionary/apply-curated-examples.ts` | Reviewed curated wins; pattern keeps Tatoeba extras; union-merge keeps Tatoeba; practice may top up underfilled                                                              |
| `apply-related.ts`          | `bun scripts/dictionary/apply-related.ts`          | Fills empty related from `related-clusters.json`                                                                                                                             |

Example limits: `src/lib/content/example-limits.ts` — store pool 8 / display 4. Primary dictionary growth is frequency publish + example enrich. Example quality gates live in `src/lib/content/example-quality.ts` + tests (not separate audit scripts).

## `audio/`

ElevenLabs TTS → local `static/audio/` → Cloudflare R2 for production.

| `generate.ts` | `bun scripts/audio/generate.ts` | Writes MP3s; `--examples-only` / `--missing-only` / `--offset` / `--limit`; `--verify` dual judge; rescue model on fail |
| `voice-design.ts` | `bun scripts/audio/voice-design.ts` | ElevenLabs Voice Design → `tmp/voice-design/`; `--create` saves preview to library + patches `characters` in config |
| `upload.ts` | `bun scripts/audio/upload.ts` | Sync to R2; `--force` / `--only`; needs `R2_*` |
| `status.ts` | `bun scripts/audio/status.ts` | Targets vs disk vs manifest |
| `verify.ts` | `bun scripts/audio/verify.ts` | Dual STT audit → `tmp/audio-verify-report.json` |
| `judge.ts` | (lib) | Dual STT + near-miss ending + logprob gap |
| `stt.ts` | (lib) | Scribe + Whisper adapters |
| `shared.ts` | (lib) | Hash / collect / synthesize |

Layout (local + R2): `lemma/{hash}.mp3` · `example/{hash}.mp3` · `lesson/{hash}.mp3`. Hash = content address (includes voice); folder = how clip is used.

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

## `lib/`

Shared helpers (`paths.ts` → repo `ROOT`).
