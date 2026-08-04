# Audio voices

Source of truth for IDs / settings: [`config.json`](./config.json).  
Clip metadata: [`manifest.json`](./manifest.json) (hash → text, kind, voice, character).  
MP3s live under `static/audio/` (gitignored) or R2 in production.

## Shared TTS settings

All dictionary + lesson synthesis uses the top-level block in `config.json`:

| Field | Value |
| --- | --- |
| Provider | ElevenLabs |
| Model | `eleven_multilingual_v2` |
| Language hint | `sk` |
| Format | `mp3_44100_128` |
| Voice settings | stability `0.6`, similarityBoost `0.75`, style `0`, speed `0.88`, useSpeakerBoost |

Hash material includes provider + voiceId + model + settings + normalized text. Change voice or settings → new hash → regen.

## Dictionary voice

Top-level `voiceId` / `voiceName` — **not** under `characters`.

| Library name | Voice ID | Used for |
| --- | --- | --- |
| Slovak Wiki Dictionary Neutral | `YJsJ2Mt3VRr0gCiTY6DA` | Dictionary lemmas + examples (`lemma/`, `example/`) |

Also reused as the **narrator** lesson character (notices / non-person lines).

## Lesson cast (`characters`)

Dialogue speakers map via `speakers[]` → `src/lib/content/characters.ts` (`characterIdForSpeaker`).  
Key phrases always use **guide** (`keyPhraseCharacterId()`), not a dialogue speaker.

Custom voices were created with `bun run audio:voice-design` (ElevenLabs Voice Design). Design prompts live in `scripts/audio/voice-design.ts` (`CAST`). Preview takes: `tmp/voice-design/{character}/preview-N.mp3`.

### Active

| Character id | Display | Gender | Library name | Voice ID | Dialogue speakers | Used for |
| --- | --- | --- | --- | --- | --- | --- |
| `anna` | Anna | female | Slovak Wiki Anna | `NU9W5gI11aREqGgopfm8` | `Anna` | Friendly peer in everyday scenes |
| `maria` | Mária | female | Slovak Wiki Mária | `7bkfvPHZlJY9LfqOtBKb` | `Mária` | Older / admin (registration, forms) |
| `receptionist` | Receptionist | female | Slovak Wiki Receptionist | `TJm7whRcvNsGnL3DPy67` | `Receptionist` | Front desk / check-in |
| `alex` | Alex | male | Slovak Wiki Alex | `eK3Hn8qiedGm31Jrozgn` | `You` | Learner turns labeled You |
| `waiter` | Waiter | male | Slovak Wiki Waiter | `vTjn72hcQp2zpBEqZUEs` | `Waiter` | Café / restaurant |
| `guide` | Guide | neutral | Slovak Wiki Guide | `62cIpdfOMgi6hhoTD3r6` | _(none)_ | **Key phrases** + instructional lines |
| `narrator` | Narrator | neutral | Slovak Wiki Dictionary Neutral | `YJsJ2Mt3VRr0gCiTY6DA` | `Notice`, `Sentence` | Signs / non-person lines; unknown speakers fallback |

### Spares (no speakers yet)

| Character id | Display | Gender | Shares | Notes |
| --- | --- | --- | --- | --- |
| `lucia` | Lucia | female | Anna’s voice | Future female story cast |
| `marek` | Marek | male | Alex’s voice | Future male story cast |

Mint dedicated Voice Design takes later, then point `voiceId` here and regen.

## Layout + commands

| Kind | Path | Content |
| --- | --- | --- |
| `lemma` | `static/audio/lemma/{hash}.mp3` | Dictionary headwords |
| `example` | `static/audio/example/{hash}.mp3` | Dictionary examples |
| `lesson` | `static/audio/lesson/{hash}.mp3` | Scene lines + key phrases (per-character voice in hash) |

```bash
bun run audio:generate                    # dictionary + lessons (skips existing)
bun run audio:generate -- --lessons-only  # lesson targets only
bun run audio:generate -- --lessons-only --force  # rewrite lesson clips after voice change
bun run audio:voice-design                # design previews → tmp/voice-design/
bun run audio:voice-design -- --create --pick 0   # save preview + patch config characters
bun run audio:upload                      # → R2 (needs R2_* + PUBLIC_AUDIO_BASE_URL for prod play)
bun run audio:status -- --lessons-only
```

Lesson dialogue/content may churn — treat `lesson/` MP3s as disposable regenerations.

## Wiring (code)

| Surface | Resolve |
| --- | --- |
| Dictionary pages | `resolveAudioSrc(text, "lemma" \| "example")` + default config voice |
| Lesson scene / exercise context | `characterIdForSpeaker(line.speaker)` → `lesson/` |
| Lesson key phrases | `keyPhraseCharacterId()` → `guide` → `lesson/` |
| Practice cloze (reuse) | `practice-audio.ts` — only if spoken frame already in dictionary manifest |
