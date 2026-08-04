# Scripts

Grouped by job. Run via `bun run <name>` from `package.json` (preferred).

## Happy path

```
bun run frequency:import    # SNK top-1000 → content/frequency/*.json + lemma-index.json
bun run frequency:publish   # glosses → content/dictionary/words.json
bun run examples:reclaim    # drop weak fill stubs so Tatoeba can reclaim
bun run examples:enrich -- --replace-practice
                            # Tatoeba dumps → replace practice frames only
bun run examples:fill       # template stubs for lemmas Tatoeba missed
bun run examples:curate     # hand examples from curated-examples.json → words.json
bun run related:apply       # semantic cluster peers into empty related
bun run audio:generate      # ElevenLabs → static/audio/ (gitignored)
bun run audio:upload        # static/audio/ → Cloudflare R2
bun run audio:status        # coverage: targets vs disk vs uploaded
bun run images:fetch        # Wikimedia pageimages → static/images/ (gitignored; no R2 yet)
bun run images:status       # coverage: ok vs missing vs rejected, by part of speech
bun run index:search        # Pagefind for local/dev search
```

### Content files

| File                                          | Role                                                            |
| --------------------------------------------- | --------------------------------------------------------------- |
| `content/dictionary/words.json`               | Live bulk dictionary (frequency publish + enrich/fill/curate)   |
| `content/dictionary/curated-examples.json`    | Hand/pattern example overlay; apply with `examples:curate`      |
| `content/dictionary/related-clusters.json`    | Semantic related peers for `related:apply`                      |
| `content/audio/config.json`                   | ElevenLabs voice / model / settings (committed)                 |
| `content/audio/manifest.json`                 | Generated clip metadata (hash → text/bytes/uploaded)            |
| `content/images/manifest.json`                | Lemma image metadata (slug → file/license/attribution/status)   |
| `content/images/overrides.json`               | Manual reject / force Commons file per slug                     |
| `src/lib/content/data.ts` (`curatedWordSeed`) | Hand-seeded beginner lemmas merged with `words.json` at runtime |
| `static/audio/`                               | Local MP3 cache (gitignored; `.vercelignore`d)                  |
| `static/images/`                              | Local dictionary thumbs (gitignored; no R2 yet)                 |

## `dictionary/`

Frequency lists, live dictionary publish, Tatoeba examples.

| File                        | npm script          | Notes                                                                                                                     |
| --------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `import-frequency.ts`       | `frequency:import`  | Skips single-letter junk lemmas                                                                                           |
| `publish-frequency.ts`      | `frequency:publish` | Writes/updates `content/dictionary/words.json`; `-v`/`-n`/`-a` slug suffix on collisions                                  |
| `enrich-examples.ts`        | `examples:enrich`   | Needs `tmp/tatoeba/*.tsv`; morph forms; appends onto underfilled (< per-word); `--replace-practice` / `--refresh-tatoeba` |
| `reclaim-weak-examples.ts`  | `examples:reclaim`  | Drops exact weak fill stubs from curated JSON                                                                             |
| `fill-empty-examples.ts`    | `examples:fill`     | Part-of-speech templates + aspect pairs; tops up lemmas with <2 examples                                                             |
| `apply-curated-examples.ts` | `examples:curate`   | Reviewed curated wins; union-merge keeps Tatoeba; practice may top up underfilled                                         |
| `apply-related.ts`          | `related:apply`     | Fills empty related from `related-clusters.json`                                                                          |

Primary dictionary growth is frequency publish + example enrich. Example quality gates live in `src/lib/content/example-quality.ts` + tests (not separate audit scripts).

## `audio/`

ElevenLabs TTS → local `static/audio/` → Cloudflare R2 for production.

| `generate.ts` | `audio:generate` | Writes MP3s; `--verify` uses dual judge (Scribe+Whisper) by default; `--stt dual\|elevenlabs\|whisper`; rescue model on fail |
| `upload.ts` | `audio:upload` | Sync to R2; `--force` / `--only`; needs `R2_*` |
| `status.ts` | `audio:status` | Targets vs disk vs manifest |
| `verify.ts` | `audio:verify` | Dual STT audit → `tmp/audio-verify-report.json` |
| `judge.ts` | (lib) | Dual STT + near-miss ending + logprob gap |
| `stt.ts` | (lib) | Scribe + Whisper adapters |
| `shared.ts` | (lib) | Hash / collect / synthesize |

Layout (local + R2): `lemma/{hash}.mp3` · `example/{hash}.mp3` (future: `lesson/`, `practice/`). Hash = content address; folder = how clip is used.

Prod env: `PUBLIC_AUDIO_BASE_URL` (R2 public base). Local: leave unset → `/audio/{kind}/{hash}.mp3`.

**QA / accuracy:** Default TTS is `eleven_multilingual_v2` (cleaner SK endings than `eleven_v3`). Optional: `rescueModelId` in config for `--verify` fallback. `bun run audio:verify` / `audio:generate -- --verify` use a **dual judge** by default (`--stt dual`): ElevenLabs Scribe (spelling) + local Whisper (acoustic near-misses like `mýlil`→`mýliu`), plus Scribe last-word logprob gap. Fail → seed retry → rescue model if set. Single-engine: `--stt elevenlabs` or `--stt whisper`. Whisper needs `py -3 -m pip install faster-whisper`.

## `images/`

Wikimedia free page images for dictionary lemmas (local QA only; no R2 yet).

| `fetch.ts` | `images:fetch` | SK Wikipedia `pageimages` (+ EN for non-verbs) → local thumbs + manifest. **No auto Commons for verbs.** |
| `stage-candidates.ts` | `images:stage` | Stage Commons candidates under `tmp/image-candidates/{slug}/` for visual audit |
| `promote.ts` | `images:promote` | Promote audited candidate (`--slug` + `--pick N`) into live set |
| `status.ts` | `images:status` | Targets vs ok/missing/rejected, by category |
| `shared.ts` | (lib) | Targets, overrides, paths, verb gloss helpers |

Flags (`fetch`/`stage`): `--limit N`, `--pos noun|verb|adjective`, `--only {slug}`, `--force`.

Overrides in `content/images/overrides.json`: `{ "slug": { "reject": true } }` or `{ "commonsFile": "Foo.jpg" }`.

**Verb policy:** Prefer empty over false friends. Commons staging uses ranked **scene queries** (`person reading book`, `person swimming pool`, …) via `verbActionQueries()`, not bare verbs. NSFW title filter applied. Workflow: `images:stage` → visual audit → `images:promote`.

Local: `/images/dictionary/{file}` when file exists under `static/images/`. Prod omits images until a later R2 upload step.

## `search/`

| File                    | npm script                                                |
| ----------------------- | --------------------------------------------------------- |
| `build-search-index.ts` | `index:search` (also used by the Astro build integration) |

## `docs/`

| File                    | npm script          |
| ----------------------- | ------------------- |
| `write-data-sources.ts` | `docs:data-sources` |

## `lib/`

Shared helpers (`paths.ts` → repo `ROOT`).
