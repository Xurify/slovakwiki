# Genblaze soft try (Backblaze B2)

Soft-try pipeline from the hackathon plan: ~100 dictionary clips → B2 with provenance.

**Status:** scaffold only. `B2_*` env vars are not set yet — stop until account + bucket exist.

## Required env

```
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET=slovakwiki-audio
B2_ENDPOINT=
B2_REGION=
```

## Steps

1. Create B2 bucket `slovakwiki-audio` + scoped app key
2. Smoke Bun `S3Client` write/read `healthcheck.txt`
3. `bun genblaze/export-targets.ts -- --limit 100 --lemmas-only` → `genblaze/targets.json`
4. Install Python Genblaze deps (`requirements.txt`) and run pipeline
5. GO/NO-GO: ≥5 playable MP3s + provenance sidecars under `sk/dictionary/{kind}/{hash}.*`

Hard stop: noon EDT Aug 3 per plan. Kill = keep this folder as exploration only.
