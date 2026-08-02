# Semantic related + upgrade weak examples

**Date:** 2026-08-02  
**Status:** done  
**Plan UI:** [plan-0e38339434014a80](https://plan.agent-native.com/_agent-native/open?app=plan&view=plan&to=%2Fplans%2Fplan-0e38339434014a80&planId=plan-0e38339434014a80&agentSidebar=closed)

## Problem

1. **Related rail is mostly noise.** `attachRelatedNeighbors` links same-POS SNK rank ±1 (e.g. `fond` → lekár, jún). Pattern lemmas already have semantic `CURATED_RELATED`; everyone else does not.
2. **~1,351 weak fill templates** (`Chcem X.`, `Mám X problém.`, `Toto je X.`) dominate curated JSON outside top-200. Top-200 is already Tatoeba + good curated. **1,333 non-curated words still keep Tatoeba.**

## Goals

- Related links teach meaning (synonym/antonym/aspect/domain), not corpus adjacency.
- Weak stubs become Tatoeba when possible, else better templates; never blank pages.
- Preserve pattern pedagogy + curated seed related (curated always wins).

## Recommended approach

### Track A — Semantic related (do first)

**Priority cascade (highest wins):**

1. Hand / `CURATED_RELATED` / curatedWordSeed (unchanged)
2. New `content/dictionary/related-clusters.json` — named groups of slugs
3. Optional: light gloss overlap (same first English gloss token, same POS)
4. Rank neighbors **only as last resort** when still empty

**Implementation:**

- Add `content/dictionary/related-clusters.json`
- Add apply script (or fold into curate) that expands clusters → per-slug related (2–4 peers)
- Change `attachRelatedNeighbors` to run only if still empty after clusters
- Seed ~20–30 high-value clusters
- Tests: broken slugs fail; pattern related unchanged; clustered lemmas no longer nonsense peers

### Track B — Upgrade weak examples

1. Detect exact fill patterns in `curated-examples.json`
2. Strip those keys (keep hand + `demonstrates` pattern entries)
3. `examples:enrich` on emptied slugs
4. Improve fill templates for leftovers (replace-known-weak mode)
5. `examples:curate` → restore hand/pattern
6. Optional later: hand-polish ranks 201–300

**Do not** re-run current `examples:fill` blind — it only fills empties.

## Out of scope

- Embeddings / external synonym APIs
- Full morphological paradigms
- Mass hand-writing all 1.3k sentences

## Done when

- Clustered lemmas show peer words that share meaning/domain
- Weak-template count drops sharply
- Pattern pages unchanged; tests green; `index:search` after content

## Decisions (locked)

1. **Order:** related first, then examples
2. **Related depth:** clusters + rank fallback (no gloss overlap yet)
3. **Example upgrade:** Tatoeba reclaim then better leftover templates

## Shipped

- `content/dictionary/related-clusters.json` + `bun run related:apply`
- `bun run examples:reclaim` → enrich → fill → curate → related:apply
- Weak `Mám … problém` / fill `Toto je` cleared; many lemmas on Tatoeba or improved stubs
- Rank neighbors only when related still empty
