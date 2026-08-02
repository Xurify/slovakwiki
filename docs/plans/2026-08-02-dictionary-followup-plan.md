# Dictionary follow-up plan (post frequency + Tatoeba)

**Date:** 2026-08-02  
**Status:** A–E done; top-200 examples at 100% coverage per POS  
**Related:** `2026-08-02-frequency-tatoeba-dictionary-design.md`

## Pattern pedagogy (2026-08-02+)

High-confusion lemmas use labeled `demonstrates` example groups + Usage notes + semantic `related`:

`rád`, `páčiť`, `ľúbiť`, `byť`, `ísť`/`chodiť`, `volať`, `vedieť`, `dať`, `pozerať`/`vidieť`, `počúvať`/`počuť`, `môcť`/`musieť`/`chcieť`.

Edit via `content/dictionary/curated-examples.json` → `bun run examples:curate`.

**Still open:** ~1.4k words outside top-200 with no examples; most `related` still rank neighbors.

---

| Metric                       | Value                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| Live dictionary words        | ~2,986 (31 curated + ~2,955 promoted)                             |
| Frequency lemmas linked      | ~all meaningful top-1000 × 3 (POS-disambiguated slugs)            |
| Top-200 example coverage     | verbs / nouns / adjectives **100%** (`bun run examples:coverage`) |
| Words missing examples (all) | remaining are outside top-200 — `tmp/missing-examples.txt`        |
| Promoted `related` links     | same-POS rank neighbors (runtime)                                 |
| Pages shipped                | `/dictionary/common`, `/references`, detail + index wiring        |

### What works

- SNK frequency import → committed JSON → `/dictionary/common` with live links
- Gloss publish path (`frequency:publish`) fills the dictionary at scale
- Tatoeba enrich attaches SK–EN examples where the corpus matches
- Empty examples section hidden; Tatoeba CC BY note when present
- References page + `docs/data-sources.md` + grouped `scripts/`

### Critical gaps

**P0 — trust / quality**

1. **Unsafe Tatoeba examples** can ship (crude/sexual/vulgar hits on common lemmas via keyword matching). No content filter.
2. **Body copy lies** when examples are empty (“Read the example aloud…”) — still shown under Usage for ~1.5k words.
3. **Stale local Pagefind** until `bun run index:search` / production build — site search won’t see ~3k words in dev otherwise.

**P1 — product / UX at 3k scale**

4. Detail pages are thin: one-line summary + generic body; no frequency rank, weak attribution (everything labeled JÚĽŠ).
5. Dictionary index dumps ~3k rows with no pagination; POS categories drown curated topics.
6. Common list shows lemma only (no English gloss on the row).
7. Most common not in primary Reference nav / footer (easy to miss).
8. ~1,577 lemmas still have no sentences (Tatoeba SK is small + morphology limits).
9. Stem-prefix matcher over-matches some conjugations / false friends.

**P2 — polish / cleanup**

10. Drafts workflow orphaned (empty `content/drafts/`; dual Tatoeba dump formats).
11. Single-letter SNK junk still visible on common list as “not in dictionary yet”.
12. No related links on promoted entries; Names/Places mixed into mass publish.
13. Thin automated tests around publish/enrich; References copy still sounds “draft-only”.

---

## Decisions to lock (before deep work)

Answer these so milestones stay aligned:

1. **Auto-publish stays?** Keep `frequency:publish` for simple glosses, or restore approval for new batches?
2. **Example coverage target?** Top-N by rank first, or push all 3k?
3. **Drafts scripts?** Deprecate, or keep only for hard cases (Names/Places/ambiguous glosses)?

**Recommended defaults:** keep auto-publish for frequency glosses; prioritize example quality + top-frequency gaps; deprecate drafts as primary path (optional hard-case only).

---

## Forward plan

### Milestone A — Trust fixes (do first)

**Goal:** nothing embarrassing or contradictory on live detail pages.

1. **Example quality gate** in `scripts/dictionary/enrich-examples.ts`
   - Blocklist / scoring: sexual, vulgar, slurs; prefer short clean sentences
   - Re-run with `--force` on dirty lemmas; drop bad examples from `promoted.json`
2. **Body generator** in `data.ts` (or per-entry fields)
   - If `examples.length === 0`: different Usage copy (no “read the example”)
   - Optional short empty-state under Usage: “No sentence examples yet.”
3. **Rebuild Pagefind** after content changes (`bun run index:search`); document in AGENTS checklist for dictionary publishes
4. Smoke-check worst common lemmas (`mať`, `byť`, high-rank nouns)

**Done when:** no known NSFW examples on top lemmas; empty-example pages don’t promise examples; local search finds promoted words after index.

### Milestone B — Detail page truthfulness

**Goal:** entry pages match how the word actually entered the site.

1. **Attribution block**
   - Curated: JÚĽŠ (as today)
   - Frequency-promoted: SNK + gloss note; Tatoeba under examples when present
2. **Frequency context** on detail (optional line): “Among the most common Slovak verbs (#14)” → link `/dictionary/common`
3. Show English on **common list rows** (muted secondary line) so learners don’t have to open every link
4. Add **Most common** to Reference nav + Footer

**Done when:** Source section isn’t misleading; common list scannable with meanings; nav discovers the feature.

### Milestone C — Examples coverage (quality over brute force)

**Goal:** raise useful coverage on the words learners hit first.

1. Tighten matcher (exact lemma / safer stems before prefix sweep)
2. Fill gaps for **top 200 per POS** missing examples first (hand-curate or alternate sources if Tatoeba empty)
3. Keep `tmp/missing-examples.txt` as the backlog; track count over time
4. Accept that full 3k may never be 100% Tatoeba-covered — curated stubs OK for stubborn lemmas

**Done when:** top-200-per-POS example coverage is high; remaining gaps are documented, not surprising.

### Milestone D — Dictionary index at scale

**Goal:** `/dictionary` usable with ~3k entries.

1. Pagination or virtualized list / default to letter or search-first
2. Separate or demote mass POS categories vs curated topics (Essentials, Greetings, …)
3. Empty-state for common-list filter (parity with WikiPage)

**Done when:** index doesn’t feel like an unbounded dump on mobile or desktop.

### Milestone E — Pipeline hygiene

**Goal:** scripts and docs match reality.

1. Deprecate or clearly quarantine drafts path; one Tatoeba dump format only (`*.tsv` as used by enrich)
2. Filter single-letter lemmas at `frequency:import` (not only at publish)
3. Update design doc decisions table (auto-publish + quality gates replaced “human approve everything”)
4. Add tests: frequency JSON shape/size, enrich filter rejects blocked phrases, body copy branches on empty examples
5. Enrich related links lightly (same POS neighbors by rank, or manual for curated core)

**Done when:** `scripts/README.md` + AGENTS describe one happy path; no orphaned dual workflows.

---

## Suggested execution order

```
A (trust) → B (truthful UI) → C (more good examples) → D (index scale) → E (hygiene)
```

A and B can overlap slightly (body copy + attribution). Do **not** mass-expand examples before the quality gate (A1).

## Out of scope (for now)

- Live Tatoeba API on the site
- Full morphological paradigms / audio for all 3k
- Replacing SNK with Tatoeba frequency ranks
- Perfect 100% example coverage from Tatoeba alone

## Success metrics

- 0 known vulgar examples on top-100 lemmas per POS
- Empty-example pages never instruct “read the example”
- Pagefind word count ≈ live word count after index
- Top-200-per-POS example coverage tracked and rising
- `/dictionary/common` reachable from Reference nav without visiting index first
