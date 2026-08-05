# Scripts

Grouped by job. Run via `bun run <name>` from `package.json` (preferred).

## Happy path

```
bun run frequency:import    # SNK noun top-2500 dump + verb/adjective/adverb top-1000 HTML → frequency JSON
bun run frequency:missing-glosses # report frequency lemmas needing English glosses
bun run frequency:publish   # glosses → content/dictionary/words.json
bun run frequency:publish -- --dry-run # preview additions without writing words.json
bun run examples:reclaim    # drop weak fill stubs so Tatoeba can reclaim
bun run examples:enrich -- --replace-practice
                            # Tatoeba dumps → replace practice frames only
bun run examples:fill       # template stubs for lemmas Tatoeba missed
bun run examples:curate     # hand examples from curated-examples.json → words.json
bun run related:apply       # semantic cluster peers into empty related
bun run audio:generate      # ElevenLabs → static/audio/ (gitignored)
bun run audio:upload        # static/audio/ → Cloudflare R2
bun run audio:status        # coverage: targets vs disk vs uploaded
bun run images:fetch        # Wikimedia pageimages → static/images/ (gitignored)
bun run images:upload       # static/images/dictionary/ → R2 (`images/dictionary/…`)
bun run images:status       # coverage: ok vs missing vs rejected, by part of speech
bun run downloads:export    # dictionary JSON for /downloads builder (also on astro build)
bun run index:search        # Pagefind for local/dev search
```

### Content files

| File                                          | Role                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `content/dictionary/README.md`                | Hand-add lemma template (fields, homes, slug/category, examples)         |
| `content/dictionary/words.json`               | Live bulk dictionary (frequency publish + enrich/fill/curate)            |
| `content/dictionary/curated-examples.json`    | Hand/pattern example overlay; apply with `examples:curate`               |
| `content/dictionary/related-clusters.json`    | Semantic related peers for `related:apply`                               |
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

| File                        | npm script                  | Notes                                                                                                                                                                        |
| --------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `import-frequency.ts`       | `frequency:import`          | Nouns use the full SNK count dump (default top 2500); verbs/adjectives/adverbs keep the HTML top 1000; `--noun-limit N` / `--force`                                          |
| `report-missing-glosses.ts` | `frequency:missing-glosses` | Writes `tmp/missing-glosses.json` and prints missing-gloss counts by part of speech                                                                                          |
| `publish-frequency.ts`      | `frequency:publish`         | Writes/updates `content/dictionary/words.json`; `-v`/`-n`/`-a` slug suffix on collisions                                                                                     |
| `enrich-examples.ts`        | `examples:enrich`           | Needs `tmp/tatoeba/*.tsv`; morph forms; appends onto underfilled (< store pool, default 8); pattern lemmas may pad after curated; `--replace-practice` / `--refresh-tatoeba` |
| `reclaim-weak-examples.ts`  | `examples:reclaim`          | Drops exact weak fill stubs from curated JSON                                                                                                                                |
| `fill-empty-examples.ts`    | `examples:fill`             | Part-of-speech templates + aspect pairs; tops up lemmas with <2 examples                                                                                                     |
| `apply-curated-examples.ts` | `examples:curate`           | Reviewed curated wins; pattern keeps Tatoeba extras; union-merge keeps Tatoeba; practice may top up underfilled                                                              |
| `apply-related.ts`          | `related:apply`             | Fills empty related from `related-clusters.json`                                                                                                                             |

Example limits: `src/lib/content/example-limits.ts` — store pool 8 / display 4. Primary dictionary growth is frequency publish + example enrich. Example quality gates live in `src/lib/content/example-quality.ts` + tests (not separate audit scripts).

## `audio/`

ElevenLabs TTS → local `static/audio/` → Cloudflare R2 for production.

| `generate.ts` | `audio:generate` | Writes MP3s; `--examples-only` / `--missing-only` / `--offset` / `--limit`; `--verify` dual judge; rescue model on fail |
| `voice-design.ts` | `audio:voice-design` | ElevenLabs Voice Design → `tmp/voice-design/`; `--create` saves preview to library + patches `characters` in config |
| `upload.ts` | `audio:upload` | Sync to R2; `--force` / `--only`; needs `R2_*` |
| `status.ts` | `audio:status` | Targets vs disk vs manifest |
| `verify.ts` | `audio:verify` | Dual STT audit → `tmp/audio-verify-report.json` |
| `judge.ts` | (lib) | Dual STT + near-miss ending + logprob gap |
| `stt.ts` | (lib) | Scribe + Whisper adapters |
| `shared.ts` | (lib) | Hash / collect / synthesize |

Layout (local + R2): `lemma/{hash}.mp3` · `example/{hash}.mp3` · `lesson/{hash}.mp3`. Hash = content address (includes voice); folder = how clip is used.

**Voices:** full roster → [`content/audio/README.md`](../content/audio/README.md). IDs in `config.json`. Design prompts: `voice-design.ts`.

Generate lesson clips: `bun run audio:generate -- --lessons-only`. After voice swaps: add `--force`. Lesson content may churn — treat those MP3s as disposable.

Prod env: `PUBLIC_AUDIO_BASE_URL` (R2 public base). Local: leave unset → `/audio/{kind}/{hash}.mp3`.

**QA / accuracy:** Default TTS is `eleven_multilingual_v2` (cleaner SK endings than `eleven_v3`). Optional: `rescueModelId` in config for `--verify` fallback. `bun run audio:verify` / `audio:generate -- --verify` use a **dual judge** by default (`--stt dual`): ElevenLabs Scribe (spelling) + local Whisper (acoustic near-misses like `mýlil`→`mýliu`), plus Scribe last-word logprob gap. Fail → seed retry → rescue model if set. Single-engine: `--stt elevenlabs` or `--stt whisper`. Whisper needs `py -3 -m pip install faster-whisper`.

## `images/`

Wikimedia free page images for dictionary lemmas → local `static/images/` → Cloudflare R2 for production.

| `fetch.ts` | `images:fetch` | SK/EN Wikipedia `pageimages`, then **Commons gloss search** for Food / Places / People / Travel / Everyday / Essentials (e.g. `obed` → “lunch meal”). **No auto Commons for Nouns / adjectives / verbs / adverbs.** Person names are not dictionary entries. |
| `upload.ts` | `images:upload` | Sync to R2; `--force` / `--only` / `--limit` / `--dry-run`; needs `R2_*` |
| `stage-candidates.ts` | `images:stage` | Stage Commons candidates under `tmp/image-candidates/{slug}/` for visual audit |
| `promote.ts` | `images:promote` | Promote audited candidate (`--slug` + `--pick N`) into live set |
| `status.ts` | `images:status` | Targets vs ok/missing/rejected, by category |
| `shared.ts` | (lib) | Targets, overrides, paths, verb scenes + noun Commons query helpers |

Flags (`fetch`/`stage`): `--limit N`, `--pos noun|verb|adjective|adverb`, `--only {slug}`, `--force`. Adverbs accept `--pos` for filtering but have no auto Commons promote.

Overrides in `content/images/overrides.json`: `{ "slug": { "reject": true } }` or `{ "commonsFile": "Foo.jpg" }`.

**Image policy:** Prefer Wikipedia pageimages. If missing, auto-search Commons for learner categories with concrete referents (Food / Places / People / Travel / Everyday life / Essentials). Require free license; prefer filenames that _start_ with the gloss. General Nouns, adjectives, verbs, and adverbs stay empty unless `images:stage` → visual audit → `images:promote` (polysemy / false-friend risk).

Layout (local + R2): `images/dictionary/{file}`. Local disk: `static/images/dictionary/{file}`.

Prod env: `PUBLIC_IMAGE_BASE_URL` (R2 public base, e.g. `https://cdn.slovak.wiki`). Local: leave unset → `/images/dictionary/{file}` when file exists on disk.

## `search/`

| File                    | npm script                                                |
| ----------------------- | --------------------------------------------------------- |
| `build-search-index.ts` | `index:search` (also used by the Astro build integration) |

## `docs/`

| File                    | npm script          |
| ----------------------- | ------------------- |
| `write-data-sources.ts` | `docs:data-sources` |

## `downloads/`

| File        | npm script         | Notes                                                                                             |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| `export.ts` | `downloads:export` | Slim merged dictionary → `static/downloads/dictionary-export.json`; also Astro `astro:build:done` |

Used by `/downloads` client builder (JSON/CSV/TSV). Regenerated on content change via build; run locally when the file is missing.

**Export shape:** per word — `slug`, spelled `slovak`, `english`, `category`, spelled `related` lemmas, `examples[{ slovak, english }]`. Tabular examples file columns: `slug`, `lemma`, `slovak`, `english`. Omits internal `note` / `tatoebaId` / `demonstrates`.

**Anki phrases pack:** headerless TSV (`slovak-wiki-anki-phrases.tsv`) — one row per sentence, `slovak\tenglish` (Front / Back). No `#` comment.

## `lib/`

Shared helpers (`paths.ts` → repo `ROOT`).
