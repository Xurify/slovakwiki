# Dictionary downloads — design

**Date:** 2026-08-04  
**Status:** Approved  
**v1 approach:** Client-only builder (#1). Prebuilt R2 packs (#2) deferred.

## Goal

Let users download slovak.wiki dictionary data (lemmas + glosses + examples), similar in spirit to Tatoeba/SNK dumps — for researchers (JSON) and learners (CSV/TSV), with control over fields and POS.

## Scope (v1)

**In**

- Page `/downloads` with presets + customize dialog
- Formats: JSON, CSV, TSV
- Word fields: `slug`, spelled `slovak`, `english`, `category`, spelled `related`, `examples`
- Example file columns: `slug`, spelled `lemma`, sentence `slovak` / `english`
- Row filter: POS / category multi-select
- Tabular + examples: two files (`words.*` + `examples.*`, join on `slug`); JSON: one nested file
- Presets as UI shortcuts (Full · Lemmas only · Examples only · Anki phrases) — same client export path
- Anki phrases: headerless TSV (`slovak\tenglish`), no attribution comment — ready for File → Import
- Attribution in export metadata / CSV comment lines (non-Anki packs); link to `/references`

**Out**

- R2 / prebuilt static preset files
- Frequency lists, grammar, lessons, practice, media
- Example-source filter (Tatoeba vs Curated)
- Internal example metadata (`note`, `tatoebaId`, `demonstrates`)
- Zip bundling (sequential dual download is enough)

## Architecture

```
build / downloads:export
  → static/downloads/dictionary-export.json  (gitignored)
         ↓ fetch once
/downloads island (client)
  → filter + serialize → Blob download(s)
```

- **Export payload:** runtime-merged dictionary (same as site: curated seed + `words.json`), learner-facing fields only — no audio/image URLs, no internal example provenance.
- **Generate:** `bun run downloads:export` writes `static/downloads/dictionary-export.json`; also run from Astro `astro:build:done` (or shared integration) so production always has a fresh file.
- **Do not commit** the multi‑MB export; gitignore `static/downloads/`.
- **Pure helpers** (unit-tested): filter, project fields, JSON / delimited serializers, filename helpers, `downloadBlob`.

### Export JSON shape

```json
{
  "generatedAt": "ISO-8601",
  "source": "slovak.wiki",
  "attribution": "Includes Tatoeba sentences (CC BY 2.0 FR). See /references.",
  "words": [
    {
      "slug": "hovorit",
      "slovak": "hovoriť",
      "english": "to speak",
      "category": "Verbs",
      "related": ["povedať", "rozumiem", "slovensky"],
      "examples": [
        {
          "slovak": "Hovorím po slovensky.",
          "english": "I speak Slovak."
        }
      ]
    }
  ]
}
```

Tabular examples file (join on `slug`):

```csv
slug,lemma,slovak,english
hovorit,hovoriť,Hovorím po slovensky.,I speak Slovak.
```

Anki phrases (headerless TSV):

```tsv
Hovorím po slovensky.	I speak Slovak.
Poviem to po slovensky.	I'll say it in Slovak.
```

## UI

- Route: `src/pages/downloads.astro` → SSR `DownloadsPage` + slotted `DownloadsBuilder` (`client:load`)
- Nav: `referenceNavigation` + Footer; include `/downloads` in `isReferenceSection`
- Cross-links: `/references` ↔ `/downloads`; optional link from dictionary hub
- Loading: `DotLoader` while export JSON fetches
- Builder: presets, customize dialog (pack + format + categories), Download button
- Match existing References page visual language (`PageShell`, `Eyebrow`, `Lead`, Tailwind)

## Later (#2)

Optional: build-time preset snapshots + `downloads:upload` to R2 (`PUBLIC_DOWNLOADS_BASE_URL`), same pattern as audio/images. Builder stays client-side for custom exports.

## Success criteria

- User can download full dict, lemmas-only, or examples-only in JSON/CSV/TSV
- Custom format + category selection works without a server API
- Exports include clear attribution for Tatoeba-derived lines
- Spelled lemmas appear on words (`slovak`) and example rows (`lemma`); `related` uses spelled forms
- `bun run build` produces a usable `/downloads/dictionary-export.json` in the deploy output
