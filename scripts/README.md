# Scripts

Grouped by job. Run via `bun run <name>` from `package.json` (preferred).

## Happy path

```
bun run frequency:import    # SNK top-1000 → content/frequency/*.json + lemma-index.json
bun run frequency:publish   # glosses → content/dictionary/words.json
bun run examples:reclaim    # drop weak fill stubs so Tatoeba can reclaim
bun run examples:enrich -- --replace-practice
                            # Tatoeba dumps → replace practice frames only
bun run examples:fill       # template stubs for lemmas Tatoeba missed
bun run examples:curate     # hand examples from curated-examples.json → words.json
bun run related:apply       # semantic cluster peers into empty related
bun run examples:coverage   # top-N per POS example coverage report
bun run examples:audit      # ranked review queue for generated practice frames
bun run examples:audit-curated # fail if curated examples still look like fill stubs
bun run index:search        # Pagefind for local/dev search
```

### Content files

| File                                          | Role                                                            |
| --------------------------------------------- | --------------------------------------------------------------- |
| `content/dictionary/words.json`               | Live bulk dictionary (frequency publish + enrich/fill/curate)   |
| `content/dictionary/curated-examples.json`    | Hand/pattern example overlay; apply with `examples:curate`      |
| `content/dictionary/related-clusters.json`    | Semantic related peers for `related:apply`                      |
| `src/lib/content/data.ts` (`curatedWordSeed`) | Hand-seeded beginner lemmas merged with `words.json` at runtime |

## `dictionary/`

Frequency lists, live dictionary publish, Tatoeba examples.

| File                          | npm script               | Notes                                                                                                                     |
| ----------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `import-frequency.ts`         | `frequency:import`       | Skips single-letter junk lemmas                                                                                           |
| `publish-frequency.ts`        | `frequency:publish`      | Writes/updates `content/dictionary/words.json`; `-v`/`-n`/`-a` slug suffix on collisions                                  |
| `enrich-examples.ts`          | `examples:enrich`        | Needs `tmp/tatoeba/*.tsv`; morph forms; appends onto underfilled (< per-word); `--replace-practice` / `--refresh-tatoeba` |
| `reclaim-weak-examples.ts`    | `examples:reclaim`       | Drops exact weak fill stubs from curated JSON                                                                             |
| `fill-empty-examples.ts`      | `examples:fill`          | POS templates + aspect pairs; tops up lemmas with <2 examples                                                             |
| `apply-curated-examples.ts`   | `examples:curate`        | Reviewed curated wins; union-merge keeps Tatoeba; practice may top up underfilled                                         |
| `shrink-curated-singles.ts`   | (manual)                 | Drop thin curated singles after enrich so overlay stays hand/pattern-only                                                 |
| `apply-related.ts`            | `related:apply`          | Fills empty related from `related-clusters.json`                                                                          |
| `example-coverage.ts`         | `examples:coverage`      | Top-N per POS example coverage → `tmp/`                                                                                   |
| `audit-generated-examples.ts` | `examples:audit`         | Ranked review queue for generated practice frames → `tmp/`                                                                |
| `audit-curated-examples.ts`   | `examples:audit-curated` | Fails if reviewed curated still match damaged fill templates                                                              |

Primary dictionary growth is frequency publish + example enrich.

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
