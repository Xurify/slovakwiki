# Audio voices

Source of truth for IDs / settings: [`config.json`](./config.json).  
Clip metadata: [`manifest.json`](./manifest.json) (hash → text, kind, voice, character).  
MP3s live under `static/audio/` (gitignored) or R2 in production.

## Shared TTS settings

All dictionary + lesson synthesis uses the top-level block in `config.json`:

| Field          | Value                                                                          |
| -------------- | ------------------------------------------------------------------------------ |
| Provider       | ElevenLabs                                                                     |
| Model          | `eleven_flash_v2_5`                                                            |
| Language hint  | `sk`                                                                           |
| Format         | `mp3_44100_128`                                                                |
| Voice settings | stability `0.5`, similarityBoost `0.75`, style `0`, speed `1`, useSpeakerBoost |

Hash material includes provider + voiceId + model + settings + normalized text. Change voice or settings → new hash → regen.

## ElevenLabs plans + concurrency

Limits are **concurrent in-flight TTS requests**, not requests-per-minute. Over the cap → queue (~50ms) then HTTP **429**. Flash/Turbo get **2×** the slots of Multilingual v2 / other models.

| Plan                   | Flash / Turbo concurrency | Other models (e.g. Multilingual v2) | Monthly credits (API pricing page) |
| ---------------------- | ------------------------: | ----------------------------------: | ---------------------------------: |
| Free                   |                         4 |                                   2 |                        (free tier) |
| Starter                |                         6 |                                   3 |                      (see pricing) |
| Creator                |                        10 |                                   5 |                               121k |
| **Pro** (this project) |                    **20** |                              **10** |                           **500k** |
| Scale                  |                        30 |                                  15 |                               1.8M |
| Business               |                        30 |                                  15 |                                 6M |
| Enterprise             |                  Elevated |                            Elevated |                             Custom |

**Generate defaults:** `--concurrency 16` (Pro Flash headroom under 20). With `--verify`, script caps at **4** so Scribe STT does not starve TTS.

**Bulk regen tips (Pro):**

```bash
# Lemmas only (~5.5k) — usually <15 min @ concurrency 16
bun scripts/audio/generate.ts -- --lemmas-only --force

# Full dictionary+lessons (~23k) — usually <1 h; skip --verify on bulk
bun scripts/audio/generate.ts -- --force --concurrency 16
```

Credits ≈ characters billed per model (Flash is cheaper/char than Multilingual v2). Spot-check remaining credits in the ElevenLabs dashboard before a full `--force` run.

### Official docs (source of truth — numbers drift)

| Topic                      | Link                                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TTS concurrency by plan    | [How many TTS requests…?](https://help.elevenlabs.io/hc/en-us/articles/14312733311761-How-many-Text-to-Speech-requests-can-I-make-and-can-I-increase-it) |
| Models + concurrency table | [Models overview](https://elevenlabs.io/docs/overview/models)                                                                                            |
| Why concurrency ≠ RPM      | [AI rate limiting for voice](https://elevenlabs.io/blog/ai-rate-limiting-for-voice)                                                                      |
| Plans / credits / pricing  | [elevenlabs.io/pricing](https://elevenlabs.io/pricing)                                                                                                   |
| Flash v2.5 model           | [Models overview](https://elevenlabs.io/docs/overview/models)                                                                                            |

Re-check the help article before changing `--concurrency` after a plan upgrade/downgrade.

## Dictionary voice

Top-level `voiceId` / `voiceName` — **not** under `characters`.

| Library name                   | Voice ID               | Used for                                            |
| ------------------------------ | ---------------------- | --------------------------------------------------- |
| Slovak Wiki Dictionary Neutral | `YJsJ2Mt3VRr0gCiTY6DA` | Dictionary lemmas + examples (`lemma/`, `example/`) |

Also reused as the **narrator** lesson character (notices / non-person lines).

## Lesson cast (`characters`)

Dialogue speakers map via `speakers[]` → `src/lib/content/characters.ts` (`characterIdForSpeaker`).  
Key phrases always use **guide** (`keyPhraseCharacterId()`), not a dialogue speaker.

Custom voices were created with `bun scripts/audio/voice-design.ts` (ElevenLabs Voice Design). Design prompts live in `scripts/audio/voice-design.ts` (`CAST`). Preview takes: `tmp/voice-design/{character}/preview-N.mp3`.

### Active

| Character id   | Display      | Gender  | Library name                   | Voice ID               | Dialogue speakers    | Used for                                            |
| -------------- | ------------ | ------- | ------------------------------ | ---------------------- | -------------------- | --------------------------------------------------- |
| `anna`         | Anna         | female  | Slovak Wiki Anna               | `NU9W5gI11aREqGgopfm8` | `Anna`               | Friendly peer in everyday scenes                    |
| `maria`        | Mária        | female  | Slovak Wiki Mária              | `7bkfvPHZlJY9LfqOtBKb` | `Mária`              | Older / admin (registration, forms)                 |
| `receptionist` | Receptionist | female  | Slovak Wiki Receptionist       | `TJm7whRcvNsGnL3DPy67` | `Receptionist`       | Front desk / check-in                               |
| `alex`         | Alex         | male    | Slovak Wiki Alex               | `eK3Hn8qiedGm31Jrozgn` | `You`                | Learner turns labeled You                           |
| `waiter`       | Waiter       | male    | Slovak Wiki Waiter             | `vTjn72hcQp2zpBEqZUEs` | `Waiter`             | Café / restaurant                                   |
| `guide`        | Guide        | neutral | Slovak Wiki Guide              | `62cIpdfOMgi6hhoTD3r6` | _(none)_             | **Key phrases** + instructional lines               |
| `narrator`     | Narrator     | neutral | Slovak Wiki Dictionary Neutral | `YJsJ2Mt3VRr0gCiTY6DA` | `Notice`, `Sentence` | Signs / non-person lines; unknown speakers fallback |

### Spares (no speakers yet)

| Character id | Display | Gender | Shares       | Notes                    |
| ------------ | ------- | ------ | ------------ | ------------------------ |
| `lucia`      | Lucia   | female | Anna’s voice | Future female story cast |
| `marek`      | Marek   | male   | Alex’s voice | Future male story cast   |

Mint dedicated Voice Design takes later, then point `voiceId` here and regen.

## Layout + commands

| Kind      | Path                              | Content                                                 |
| --------- | --------------------------------- | ------------------------------------------------------- |
| `lemma`   | `static/audio/lemma/{hash}.mp3`   | Dictionary headwords                                    |
| `example` | `static/audio/example/{hash}.mp3` | Dictionary examples                                     |
| `lesson`  | `static/audio/lesson/{hash}.mp3`  | Scene lines + key phrases (per-character voice in hash) |

```bash
bun scripts/audio/generate.ts                    # dictionary + lessons (lemma→example→lesson; concurrency 16)
bun scripts/audio/generate.ts -- --concurrency 16 --lemmas-only --force
bun scripts/audio/generate.ts -- --lessons-only  # lesson targets only
bun scripts/audio/generate.ts -- --lessons-only --force  # rewrite lesson clips after voice change
bun scripts/audio/generate.ts -- --examples-only --missing-only  # fill gaps only
bun scripts/audio/upload.ts -- --lemmas-only     # parallel R2 (default concurrency 32)
bun scripts/audio/prune-orphans.ts               # dry-run: old v2/settings hashes
bun scripts/audio/prune-orphans.ts -- --delete --r2
bun scripts/audio/voice-design.ts                # design previews → tmp/voice-design/
bun scripts/audio/voice-design.ts -- --create --pick 0   # save preview + patch config characters
bun scripts/audio/status.ts -- --lessons-only
```

Pro Flash concurrency max ≈20 — default `--concurrency 16`. Use `--concurrency 4` with `--verify`. Full plan table + official links: [ElevenLabs plans + concurrency](#elevenlabs-plans--concurrency).

**Recommended bulk Flash regen (Pro):**

```bash
# 1) Headwords first (~5.5k) — site listen buttons
bun scripts/audio/generate.ts -- --lemmas-only --force
bun scripts/audio/upload.ts -- --lemmas-only

# 2) Examples (~17k) when ready
bun scripts/audio/generate.ts -- --examples-only --force
bun scripts/audio/upload.ts -- --examples-only

# 3) Lessons (~65)
bun scripts/audio/generate.ts -- --lessons-only --force
bun scripts/audio/upload.ts -- --lessons-only

# 4) Drop old multilingual_v2 / prior-settings hashes
bun scripts/audio/prune-orphans.ts                  # inspect
bun scripts/audio/prune-orphans.ts -- --delete --r2 # local + R2
```

Lesson dialogue/content may churn — treat `lesson/` MP3s as disposable regenerations.

## Wiring (code)

| Surface                         | Resolve                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| Dictionary pages                | `resolveAudioSrc(text, "lemma" \| "example")` + default config voice      |
| Lesson scene / exercise context | `characterIdForSpeaker(line.speaker)` → `lesson/`                         |
| Lesson key phrases              | `keyPhraseCharacterId()` → `guide` → `lesson/`                            |
| Practice cloze (reuse)          | `practice-audio.ts` — only if spoken frame already in dictionary manifest |
