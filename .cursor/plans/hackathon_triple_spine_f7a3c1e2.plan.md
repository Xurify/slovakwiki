---
name: Hackathon Triple Spine
overview: One slovak.wiki spine with three layers — Backblaze soft-try (B2+Genblaze audio), Cockroach tutor memory (MCP+vector+Bedrock+Lambda), Shipaton Expo+RevenueCat companion — excluding XPRIZE. Decisions locked via grill-me.
todos:
  - id: bb-soft-try
    content: "Backblaze soft try: 4h go/no-go + noon EDT hard stop; Genblaze→B2 subset + optional dual-write"
    status: pending
  - id: spine-foundations
    content: "learner_id client + manifest stores migration (r2|b2) + audio:status per-store"
    status: pending
  - id: crdb-schema
    content: "Cockroach cluster + schema (learners/sessions/messages/mastery/events/content_chunks VECTOR) + MCP"
    status: pending
  - id: tutor-lambda
    content: "Bedrock+Lambda turn API + chunk embed pipeline + /api/tutor proxy + /tutor UI"
    status: pending
  - id: cockroach-submit
    content: "MCP demo video, README evidence, Devpost submit by mid-Aug"
    status: pending
  - id: r2-cutover
    content: "Upload 3k clips to R2; set PUBLIC_AUDIO_BASE_URL for prod"
    status: pending
  - id: expo-scaffold
    content: "mobile/ Expo app — tabs, learner link code, tutor+dictionary+practice"
    status: pending
  - id: revenuecat
    content: "RevenueCat pro entitlement, paywall, webhook→learners.plan, offline packs"
    status: pending
  - id: store-ship
    content: "Play 14-day testing from ~Sep 5; App Store; Peace Prize + BuildInPublic; Shipaton submit"
    status: pending
isProject: false
---

# Hackathon Triple Spine — executable plan

## Locked decisions (grill-me)

| # | Decision |
| --- | --- |
| 1 | Backblaze = **soft try**: 4h go/no-go, **noon EDT hard stop**; miss OK |
| 2 | **One spine** — layers on slovak.wiki, not three products |
| 3 | Solo **full-time sprint** (~30–40h/wk) through mid-Aug; Shipaton taper |
| 4 | **R2 primary**; B2 = dual-write/demo only (promote later only if BB submit sticks) |
| 5 | Cockroach agent = **tutor coach** (mastery under chat) |
| 6 | Identity = **anon device UUID** + optional link-code upgrade later |
| 7 | CRDB tools = **Managed MCP + Distributed Vector Index** |
| 8 | AWS = **Bedrock** (LLM+embed) + **Lambda** (turn API) |
| 9 | Tutor UI = `/tutor` + launcher on site |
| 10 | Shipaton = **new Expo** app + RevenueCat IAP |
| 11 | Categories = **Peace Prize** primary + **#BuildInPublic** always |
| 12 | Genblaze = minimal Python ElevenLabs→B2 pipeline |
| 13 | No XPRIZE |

## Verified codebase facts

- Audio pipeline: `scripts/audio/{generate,upload,status,shared}.ts`, `src/lib/content/audio.ts`, `AudioButton.svelte`
- Keys: `lemma|{example}/{hash}.mp3`; hash includes provider/voice/model/settings/text
- Config: `content/audio/config.json` — voice `YJsJ2Mt3VRr0gCiTY6DA`, `eleven_v3`, `mp3_44100_128`
- Manifest: `content/audio/manifest.json` — **no `uploadedAt` yet** (R2 not cut over; local `static/audio/` only)
- Client: `PUBLIC_AUDIO_BASE_URL` → CDN; else `/audio/...`
- Practice: `localStorage` only (`practice-state.ts`) — no API, no auth
- Deploy: `@astrojs/vercel` in `astro.config.ts`; pages are static `getStaticPaths`

---

## A. Calendar

| Window | Focus | Exit |
| --- | --- | --- |
| Aug 3 morning | Backblaze soft try (§B) | B2+provenance or killed |
| Aug 3 PM | Spine: `learner_id`, manifest `stores` | per-store status works |
| Aug 4–5 | Cockroach + schema + embed chunks | vector index live |
| Aug 6–8 | Lambda turn API end-to-end | `curl` full turn |
| Aug 9–11 | `/tutor` UI + Vercel proxy | usable on site |
| Aug 12–13 | MCP demo video + README | evidence ready |
| Aug 14–15 | Cockroach submit (confirm Devpost deadline) | submitted |
| Aug 16–17 | **R2 cutover** of full library + `PUBLIC_AUDIO_BASE_URL` | prod plays R2 |
| Aug 18–24 | Expo scaffold + API client | device against prod |
| Aug 25–31 | RevenueCat + paywall + webhook | sandbox unlocks Pro |
| **Sep 1–5** | EAS + **Play closed testing starts** | 14-day clock running |
| Sep 8–14 | Store submissions | in review |
| Sep 15–21 | Peace narrative + BuildInPublic | listing live |
| Sep 22–28 | Demo video + Devpost | Shipaton submitted |
| Sep 29–30 | Buffer | — |

**Hard rules**

- After **Aug 15**: freeze tutor features — Expo consumes as-is.
- **Play 14-day tester clock**: start by **Sep 5** (12 testers). Later than ~Sep 10 → Play production before Sep 30 at risk.
- Confirm Apple + Google developer accounts **week of Aug 24**.

---

## B. Backblaze soft try (hour-by-hour)

`T0` = start. Gates: **go/no-go at T0+4h**, **hard stop noon EDT Aug 3**.

Scope: standalone `genblaze/` Python pipeline for **~100 clips** → B2 + provenance. Do **not** migrate full library tonight.

### T0+0:00–0:45 — B2 account

- Bucket `slovakwiki-audio`, app key scoped to bucket
- `.env`: `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET`, `B2_ENDPOINT`, `B2_REGION`
- Smoke: Bun `S3Client` write/read `healthcheck.txt`
- Fail after +20m on creds → **kill**

### T0+0:45–1:45 — Genblaze skeleton

- `genblaze/requirements.txt`: `genblaze-core`, `genblaze-elevenlabs`, `genblaze-s3`, `python-dotenv`
- `genblaze/pipeline.py`, `README.md`
- Install fail / wrong API surface >30m → **kill**

### T0+1:45–2:15 — Target export

- `genblaze/export-targets.ts` reuses `collectAudioTargets` + `hashAudioText` from `scripts/audio/shared.ts`
- Write `genblaze/targets.json` (`--limit 100 --lemmas-only`)
- Hash **must** match TS hash (reconcilable with R2 later)

### T0+2:15–3:30 — Pipeline run

- Genblaze Pipeline → ElevenLabsTTS (config.json voice/model/format) → B2 sink
- Keys: `sk/dictionary/{kind}/{hash}.mp3`
- Sidecar: `sk/dictionary/{kind}/{hash}.json` (text, provider, voiceId, modelId, hash, generatedAt, pipelineVersion)
- `--limit 5` then `--limit 100`

### T0+4:00 — GO/NO-GO (all required)

1. ≥5 playable MP3s on B2 with hierarchical keys
2. Provenance sidecars correct
3. `genblaze_core` actually in call path (not bare boto3)

**Kill** = stop; keep `genblaze/` as explored; reclaim day for Cockroach.

### If GO → T0+4–6 — TS dual-write (worth keeping even if later miss)

- `ManifestEntry`: `uploadedAt?` → `stores?: Record<"r2"|"b2", { uploadedAt; bucket }>`
- `upload.ts`: `--store r2|b2|all`; B2 uses Bun S3 + `sk/dictionary/` prefix
- `status.ts`: per-store counts
- `package.json`: `audio:upload:b2`

### If GO → T0+6–9 — Evidence + Devpost

- ~90s video: targets → pipeline → B2 tree → provenance → dictionary play
- README: hash-addressed corpus story + repro commands
- Submit: working URL, repo, providers, B2+Genblaze writeup, video

**Noon EDT = hard stop.**

---

## C. Cockroach tutor layer

### Schema — `db/cockroach/001_init.sql`

Tables: `learners` (incl. `plan` free|pro), `sessions`, `messages`, `mastery` (strength, due_at), `progress_events`, `content_chunks` (`embedding VECTOR(1024)` + **VECTOR INDEX**).

Confirm cluster supports distributed vector indexes at create time (v25.2+). Brute-force cosine is emergency fallback only — weakens judging story.

Optional later: `learner_links(code, learner_id, expires_at)` for web↔mobile pairing.

### New files

```
db/cockroach/001_init.sql
scripts/tutor/{migrate,build-chunks,embed-chunks}.ts
services/tutor/          # own package.json — Lambda deps isolated
  src/{handler,db,bedrock,tools,prompt,types}.ts
src/pages/api/tutor/[...path].ts   # prerender=false, proxy + secret
src/pages/tutor.astro
src/lib/pages/TutorPage.svelte
src/lib/components/tutor/{TutorPanel,TutorMessage,TutorComposer,TutorCitation,TutorLauncher}.svelte
src/lib/client/{learner-id,tutor-client}.ts
```

### Lambda `POST /tutor/turn`

1. Validate `{ learnerId, sessionId?, message, context, surface }`
2. Upsert learner / session
3. Load last messages + weak/due mastery + recent events
4. Embed user message (Titan v2 1024d)
5. Vector search `content_chunks` → citations (url + audio_key)
6. Bedrock Converse + tools: `get_mastery`, `record_practice`, `search_content`, `schedule_review`, `get_due_items`
7. Tool loop ≤4 iters; persist messages
8. Return `{ sessionId, reply, citations, masteryDelta, dueCount }`

Rate limit: free 25 turns/day via message count; `plan=pro` unlimited (Shipaton webhook flips plan).

### MCP demo

Use Cockroach Cloud Managed MCP from Cursor during build (schema inspect, mastery spot-check). Record ~60s of agent querying weak items → join content_chunks. Honest ops path in README.

### Env

`COCKROACH_DATABASE_URL`, `AWS_REGION`, `BEDROCK_MODEL_ID`, `BEDROCK_EMBED_MODEL_ID`, `TUTOR_API_URL`, `TUTOR_SHARED_SECRET`, `PUBLIC_TUTOR_ENABLED`

---

## D. Shipaton — Expo + RevenueCat

### Layout

`mobile/` at repo root (own package.json — not Bun workspace). Expo + expo-router. Types mirrored from `services/tutor/src/types.ts`.

### Screens

| Route | Job |
| --- | --- |
| `(tabs)/index` | Due reviews, continue |
| `(tabs)/tutor` | Same turn API |
| `(tabs)/dictionary` | Search + audio |
| `(tabs)/practice` | mastery.due_at queue |
| `settings` | restore, link code, learner id |
| `paywall` | RevenueCatUI |

### Identity

UUID in `expo-secure-store` key `slovak.wiki.learner.v1`. Link web progress via short code (no OAuth).

### Entitlements

- Entitlement `pro`; offering `default` (monthly/annual/lifetime)
- Webhook Lambda → `UPDATE learners SET plan=…` (**server authoritative**)
- Free: full corpus; 15 audio clips/day then device TTS; 25 tutor turns/day
- Pro: unlimited audio, offline packs, unlimited synced tutor

### Peace Prize + BuildInPublic

- Free forever core learning; Pro = convenience only
- Cite SNK/Tatoeba/JÚĽŠ; refugee/worker/diaspora access story; donated Pro codes
- **3 BuildInPublic posts/week** from Aug 3 (scored category — treat as deliverable)

### Store timeline

- Sep 5: Play closed testing (12 testers) + TestFlight
- Sep 12: App Store submit
- Sep 20: Play production submit
- Sep 26–28: Devpost (store URL, ≤2min video, icon, screenshot, trial/promo)

---

## E. Shared spine contracts

1. **`learner_id`** — client UUIDv4; web localStorage / native secure-store; header `X-Learner-Id` + body
2. **Memory API** — both clients hit `https://slovak.wiki/api/tutor/*` (secret stays server-side)
   - `POST /tutor/turn`, `GET /tutor/state`, `POST /tutor/progress`, link endpoints, RC webhook `/learner/plan`
3. **Audio** — key `{kind}/{hash}.mp3` unchanged; client resolves URL; tutor returns `audioKey` not absolute URL; B2 uses `sk/dictionary/` prefix in `stores` map

---

## F. Risks / non-goals

**Risks:** Genblaze API drift (30m kill); vector index tier (verify Aug 4 AM); Play 14-day clock; Apple enrollment delay; 3k clips never uploaded (Aug 16–17 cutover is real work); Bedrock cost (Haiku + caps + free turn limit).

**Non-goals:** XPRIZE; accounts/OAuth; web payments this cycle; speech scoring; B2 as primary unless BB submitted; rewriting dictionary/Pagefind pipelines; tutor features after Aug 15; streaming v1.

---

## G. Verification

**Backblaze**

```bash
bun genblaze/export-targets.ts --limit 100 --lemmas-only
python genblaze/pipeline.py --limit 5
bun run audio:upload -- --store b2 --limit 20
bun run audio:status
```

Pass: MP3s + sidecars on B2; hashes match; clip plays; Genblaze in path.

**Cockroach**

```bash
bun scripts/tutor/migrate.ts
bun scripts/tutor/build-chunks.ts && bun scripts/tutor/embed-chunks.ts
curl -X POST …/tutor/turn -H "x-tutor-secret: …" -d '{…}'
bun run check && bun run build
```

Pass: citation with `audioKey`; cross-turn memory; mastery rows from tools; VECTOR INDEX visible; `/tutor` in browser.

**Shipaton**

```bash
cd mobile && bunx expo start
eas build -p ios --profile preview
eas build -p android --profile preview
```

Pass: linked learner_id; sandbox purchase + webhook flips plan; free hit turn wall; offline pack airplane mode; TestFlight + Play 12 testers.

**Before each submit:** `bun run format`, `check`, `test`, `index:search` (if content changed), `build`.

---

## Critical paths to touch

| Area | Paths |
| --- | --- |
| Audio dual-write | `scripts/audio/{shared,upload,status}.ts`, `package.json` |
| Genblaze | `genblaze/*` (new) |
| Tutor service | `services/tutor/*`, `db/cockroach/*`, `scripts/tutor/*` |
| Web tutor | `src/pages/api/tutor/[...path].ts`, `src/pages/tutor.astro`, `src/lib/components/tutor/*`, `SiteLayout.astro` |
| Identity | `src/lib/client/learner-id.ts` |
| Mobile | `mobile/*` (new) |
