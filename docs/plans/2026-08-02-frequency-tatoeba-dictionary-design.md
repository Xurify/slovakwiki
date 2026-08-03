# Frequency lists, Tatoeba util, and verified dictionary growth

> **Superseded bits:** the `content/drafts/` + `drafts:build` / `drafts:promote` path was dropped. Live bulk lemmas go straight into `content/dictionary/words.json` via `frequency:publish`. Hand examples use `curated-examples.json` → `examples:curate`.

## Goal

Grow the dictionary with **high-quality, verified** Slovak lemmas (common first), expose **top-1000 verbs / nouns / adjectives** for learners, and ship glossed frequency lemmas into the live dictionary without a separate draft queue.

Tatoeba is for **example sentences**, not frequency ranking. If the SNK frequency path proves awkward, pivot the importer to Tatoeba-derived ranks without changing downstream shapes.

## Decisions

| Topic           | Choice                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------- |
| Approach        | Frequency-first (SNK), Tatoeba for examples                                               |
| Quality         | NSFW blocklist on enrich; prefer short clean sentences                                    |
| Publish         | Auto-publish frequency glosses (`frequency:publish`) — no approval gate for simple lemmas |
| Slug collisions | Bare slug first; on clash append `-v` / `-n` / `-a` (e.g. `štát` → `stat-n`)              |
| Drafts          | **Removed** — publish writes `words.json` directly                                        |
| Tatoeba access  | Weekly **dumps**, not live API in v1                                                      |
| Attribution     | Curated → JÚĽŠ; frequency words → SNK; examples → Tatoeba CC BY                           |
| Live file       | `content/dictionary/words.json` (was briefly named `promoted.json`)                       |

## Architecture

```
SNK top-1000 (verbs / nouns / adjectives)
        │
        ▼
scripts/dictionary/import-frequency.ts
  → content/frequency/{verbs,nouns,adjectives}.json
  → content/frequency/lemma-index.json
        │
        ├─► public UI: /dictionary/common
        │
        └─► scripts/dictionary/publish-frequency.ts
                 + content/frequency/glosses.json
                 → content/dictionary/words.json
                        │
                        ▼
                 scripts/dictionary/enrich-examples.ts (Tatoeba dumps)
```

Legacy (optional): `build-drafts.ts` / `promote-draft.ts` for hard cases only.

**Rules**

- Live site never reads drafts.
- Frequency JSON feeds the lists UI and publish path.
- Pivot hook: swap SNK importer for a Tatoeba-frequency importer; keep the same frequency schemas.
- Attribution: SNK + Tatoeba CC BY (and JÚĽŠ for curated entries) via a shared references list.

## Data shapes

### Frequency entry

```ts
{
  rank: number;
  lemma: string;
  pos: "verb" | "noun" | "adjective";
  count?: number;
  source: string;
  sourceUrl: string;
}
```

Committed under `content/frequency/` (e.g. `verbs.json`, `nouns.json`, `adjectives.json`).

### Draft entry (obsolete)

Earlier design tracked pending lemmas under `content/drafts/` with statuses including `promoted`. That queue is gone; keep this only as historical context.

### Live dictionary

Public contract: `curatedWordSeed` in `data.ts` plus `content/dictionary/words.json`. Drafts never appear in Pagefind or public pages (and the draft store no longer exists).

## Util scripts

| Script                      | Job                                                   |
| --------------------------- | ----------------------------------------------------- |
| `bun run frequency:import`  | Parse SNK top-1000 lists → `content/frequency/*.json` |
| `bun run frequency:publish` | Glossed lemmas → `content/dictionary/words.json`      |
| `bun run examples:enrich`   | Tatoeba dumps → examples on `words.json`              |
| `bun run examples:curate`   | Apply `curated-examples.json` into `words.json`       |

~~`drafts:build` / `drafts:promote`~~ — removed.

**Tatoeba usage (offline)**

- Prefer weekly exports / sentence-pair download, not `api.tatoeba.org` in v1.
- Match lemmas into short, clean sentences; store `tatoebaId` for attribution.
- Skip when no good match — never invent examples.
- Prefer sentences with positive user review when that data is available; otherwise apply length/punctuation filters.

**Util documentation**

Document all source links in `docs/data-sources.md` (and/or script headers / `--help`), kept in sync with the site references module.

## Public UI: common lists

- Route: `/dictionary/common`
- Linked from the dictionary index
- Tabs: Verbs · Nouns · Adjectives (top 1000 each from committed frequency JSON)
- Row: rank · lemma · optional count · status
  - Live entry → link `/dictionary/{slug}`
  - Missing → plain text + muted “not in dictionary yet” (never expose drafts)
- Client-side filter within a list is fine at ~1k rows
- Visual language: ruled list, existing wiki density; no decorative cards
- Source footer: SNK attribution (Tatoeba only when examples appear on entry pages later)

## References (site-wide)

- Page: `/about/references` or `/references`
- Backed by a single module (e.g. `src/lib/content/references.ts` or `content/references.json`) consumed by:
  - the public References page
  - util docs / printed help
- Groups at minimum:
  - Dictionary — JÚĽŠ slovnik
  - Corpus / frequency — SNK frequency lists + concrete top-1000 pages
  - Examples — Tatoeba downloads, exports, license; API noted as optional/not used in v1
- Each item: name, what we use it for, URL(s), license note

### Canonical source links (document everywhere)

- Tatoeba downloads: https://tatoeba.org/en/downloads
- Tatoeba raw exports: https://downloads.tatoeba.org/exports/
- Tatoeba API (optional, not v1): https://api.tatoeba.org/
- SNK frequency lists: https://korpus.sk/en/frequency-lists-of-lemmata-word-forms-and-parts-of-speech-from-the-publicly-available-snc-corpora/
- SNK top-1000 verbs example: https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/prim-8-0-public-all-verbums-top-1000-lemmas/
- JÚĽŠ dictionary (existing): https://slovnik.juls.savba.sk/

## Publish gate

- `frequency:publish` adds glossed SNK lemmas into `words.json` (idempotent on live lemmas/slugs).
- Examples come from enrich / fill / curate after publish.
- No draft approval queue.

## Out of scope (this design)

- Live Tatoeba API on the public site
- Auto-publishing stubs without human approval
- Thin public stubs for unpublished frequency lemmas
- Audio from Tatoeba (separate license concerns)
- Full morphological paradigms on every new entry

## Success criteria

1. `/dictionary/common` shows top-1000 verbs/nouns/adjectives from committed SNK-derived JSON, with links only to live entries.
2. Util can refresh frequency JSON and generate pending drafts without touching public content.
3. Approved drafts promote cleanly into the live dictionary source.
4. References page + util docs list the same source URLs and license notes.
5. Pivot path documented: frequency importer swappable without rewriting lists UI or promote flow.
