# Frequency lists, Tatoeba util, and verified dictionary growth

## Goal

Grow the dictionary with **high-quality, verified** Slovak lemmas (common first), expose **top-1000 verbs / nouns / adjectives** for learners, and keep a **local util** that turns trusted sources into draft entries humans approve before anything goes public.

Tatoeba is for **example sentences**, not frequency ranking. If the SNK frequency path proves awkward, pivot the importer to Tatoeba-derived ranks without changing downstream shapes.

## Decisions

| Topic | Choice |
| --- | --- |
| Approach | Frequency-first (SNK), Tatoeba optional for examples |
| Quality | Trusted sources + human approve before publish |
| First slice | Util + public common-lists UI; no mass auto-publish |
| Approval | Repo draft JSON → promote script merges into live dict |
| Tatoeba access | Weekly **dumps**, not live API in v1 |
| Attribution | Shared references module for site + util docs |

## Architecture

```
SNK top-1000 (verbs / nouns / adjectives)
        │
        ▼
scripts/import-frequency.ts  →  content/frequency/*.json  (committed, attributed)
        │
        ├─► public UI: /dictionary/common
        │
        └─► scripts/build-drafts.ts
                 + optional Tatoeba dump examples (filtered)
                 → content/drafts/*.json
                        │
                        ▼ human sets status: approved
                 scripts/promote-draft.ts → live dictionary source
```

**Rules**

- Live site never reads drafts.
- Frequency JSON feeds the lists UI and draft seeding only.
- Pivot hook: swap SNK importer for a Tatoeba-frequency importer; keep the same frequency + draft schemas.
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

### Draft entry

```ts
{
  status: "pending" | "approved" | "rejected" | "promoted";
  slug: string;
  slovak: string;
  english?: string;
  category?: string;
  pos: "verb" | "noun" | "adjective";
  frequencyRank: number;
  examples?: { slovak: string; english: string; tatoebaId?: number }[];
  notes?: string;
  sources: string[];
  promotedAt?: string;
}
```

Tracked under `content/drafts/` for editorial review in git.

### Live dictionary

Unchanged public contract: only promoted, human-approved content enters the live word seed / dictionary source. Drafts never appear in Pagefind or public pages.

## Util scripts

| Script | Job |
| --- | --- |
| `bun run frequency:import` | Parse SNK top-1000 lists → `content/frequency/*.json` |
| `bun run drafts:build` | Diff frequency vs live words → pending drafts; optionally attach ≤2 filtered Tatoeba SK–EN examples |
| `bun run drafts:promote` | Merge `status: "approved"` into live dict; set `promoted` + `promotedAt`; skip duplicates |

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

- `drafts:promote` only accepts `status: "approved"` with required fields (`slug`, `slovak`, English gloss).
- Examples optional at promote time if the editor prefers to add them later.
- Idempotent: already-live slugs skipped; promoted drafts marked so they are not re-merged blindly.
- Rejected drafts remain as audit trail.

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
