# Scripts

Grouped by job. Run via `bun run <name>` from `package.json` (preferred).

## Happy path

```
bun run frequency:import    # SNK top-1000 → content/frequency/*.json + lemma-index.json
bun run frequency:publish   # glosses → content/dictionary/promoted.json
bun run examples:enrich     # Tatoeba dumps → examples on promoted words
bun run examples:reclaim    # drop weak fill stubs so Tatoeba can reclaim
bun run examples:fill       # template stubs for lemmas Tatoeba missed
bun run examples:curate     # hand examples from curated-examples.json
bun run related:apply       # semantic cluster peers into empty related
bun run examples:coverage   # top-N per POS example coverage report
bun run index:search        # Pagefind for local/dev search
```

## `dictionary/`

Frequency lists, live dictionary publish, Tatoeba examples.

| File                        | npm script          | Notes                                                            |
| --------------------------- | ------------------- | ---------------------------------------------------------------- |
| `import-frequency.ts`       | `frequency:import`  | Skips single-letter junk lemmas                                  |
| `publish-frequency.ts`      | `frequency:publish` | Auto-publishes glosses; `-v`/`-n`/`-a` slug suffix on collisions |
| `enrich-examples.ts`        | `examples:enrich`   | Needs `tmp/tatoeba/*.tsv`                                        |
| `reclaim-weak-examples.ts`  | `examples:reclaim`  | Drops exact weak fill stubs from curated JSON                    |
| `fill-empty-examples.ts`    | `examples:fill`     | POS templates for lemmas Tatoeba cannot match                    |
| `apply-curated-examples.ts` | `examples:curate`   | Curated always wins; merges into `promoted.json`                 |
| `apply-related.ts`          | `related:apply`     | Fills empty related from `related-clusters.json`                 |
| `example-coverage.ts`       | `examples:coverage` | Top-N per POS example coverage → `tmp/`                          |
| `build-drafts.ts`           | `drafts:build`      | **Optional / legacy** — hard cases only                          |
| `promote-draft.ts`          | `drafts:promote`    | **Optional / legacy**                                            |

Primary dictionary growth is frequency publish + example enrich, not drafts.

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
