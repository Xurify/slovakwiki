# slovak.wiki — Agent conventions

Astro + Svelte 5 + Tailwind CSS v4. Read this before UI or styling work.

## Tooling

**Bun** is the package manager and script runner for this repo (`bun.lock`).

- Install: `bun install`
- Scripts: `bun run <script>` (e.g. `bun run dev`, `bun run test`, `bun run format`)
- Prefer Bun over npm/pnpm/yarn for installs and script runs
- Do not refresh or commit `package-lock.json`; use `bun.lock`

## Search index (Pagefind)

Site search loads `/pagefind/` (generated; gitignored under `static/pagefind/`).

- **Production build** already rebuilds the index (`astro:build:done` → writes `dist/pagefind` + `static/pagefind`).
- **Local / `bun run dev`:** run `bun run index:search` when:
  - first clone / missing `static/pagefind/`
  - searchable content changed (words, grammar, cases, pronunciation, lessons, practice)
  - header search says the index is not built yet
- Skip re-index for pure UI/CSS/layout edits with no content changes.

## Frequency lists + dictionary

Script layout: see `scripts/README.md` (`dictionary/`, `search/`, `docs/`).

Live bulk lemmas live in `content/dictionary/words.json` (loaded with curated seed in `src/lib/content/data.ts`). Hand/pattern example overlay: `content/dictionary/curated-examples.json` → `bun run examples:curate` (temporary; delete when phrase churn stops).

- Sources (SNK, Tatoeba, JÚĽŠ): `docs/data-sources.md` and `/references` (from `src/lib/content/references.ts`).
- Refresh frequency JSON: `bun run frequency:import` → `content/frequency/{verbs,nouns,adjectives}.json` + `lemma-index.json`
- **Yearly checklist:** revisit SNK corpus version on [korpus.sk frequency lists](https://korpus.sk/en/frequency-lists-of-lemmata-word-forms-and-parts-of-speech-from-the-publicly-available-snc-corpora/). Counts are a committed snapshot of `prim-8.0-public-all`, not live. Last import: `generatedAt` in `content/frequency/{verbs,nouns,adjectives}.json` (set by `frequency:import`). No auto-refresh. Bump importer + re-import only when a newer `prim-*-public-all` top-1000 ships; spot-check rank drift before commit.
- English glosses for common lemmas: `content/frequency/glosses.json`
- Publish glossed frequency lemmas into `content/dictionary/words.json` (no approval gate): `bun run frequency:publish` (`--limit 100`)
- Attach Tatoeba examples to dictionary words: `bun run examples:enrich` (needs dumps in `tmp/tatoeba/`)
- Drop weak fill stubs so Tatoeba can reclaim: `bun run examples:reclaim` → then enrich → fill → curate
- Fill lemmas Tatoeba cannot match: `bun run examples:fill` → then `bun run examples:curate`
- Semantic related peers (empty related only): `bun run related:apply` (after curate; clusters in `content/dictionary/related-clusters.json`)
- After publish/enrich/curate/related content changes: `bun run index:search` so local Pagefind matches the live dictionary
  - Skips crude/sexual/vulgar lines via `src/lib/content/example-quality.ts`
  - Download + decompress:
    - https://downloads.tatoeba.org/exports/per_language/slk/slk_sentences.tsv.bz2
    - https://downloads.tatoeba.org/exports/per_language/slk/slk-eng_links.tsv.bz2
    - https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2
  - Missing-example report: `tmp/missing-examples.txt`
- Regenerate docs from the references module: `bun run docs:data-sources`
- Public lists UI: `/dictionary/common`
- Tatoeba dumps (optional): download to `tmp/tatoeba/` from https://tatoeba.org/en/downloads — examples only, not frequency

## Styling: Tailwind first (non-negotiable)

**Do not add new custom CSS classes for layout, spacing, typography, borders, or colors.**

1. Prefer Tailwind utility classes in the markup (`class="flex items-start …"`).
2. Prefer a Svelte component when the same pattern repeats (button, section label, rail, ruled list).
3. Touch `src/styles.css` only for:
   - `@theme` / design tokens (`:root` CSS variables)
   - true global base styles (`html`, `body`, `a`, `button`, headings, focus, reduced motion)
   - rare cases Tailwind cannot express cleanly

### Forbidden pattern

```css
/* ❌ Do not add rules like this */
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  border-bottom: 1px solid var(--line);
  padding-bottom: var(--space-4);
}
```

### Required pattern

```svelte
<!-- ✅ Utilities in markup -->
<div class="flex items-start justify-between gap-6 border-b border-slate-200 pb-4">…</div>
```

Or extract a small component if reused in 3+ places.

### Shared primitives

Keep Tailwind classes colocated in small Svelte components under `src/lib/components/ui/`.

- Use `Button.svelte`, `TextLink.svelte`, `Eyebrow.svelte`, `Lead.svelte`, `PageShell.svelte`, and `ContextRail.svelte` where appropriate.
- Components own their default Tailwind classes and expose a `class` prop only for layout-level adjustments.
- Do not export class-string bundles or `cx` helpers for page-level styling.
- Add Bits UI only for behavior-heavy, accessible widgets (dialog, popover, select, tabs, accordion, tooltip). Do not introduce it for static cards, text, or layout.

### Design tokens

Palette and spacing are mapped into Tailwind via `@theme` in `src/styles.css`:

- Colors: `bg-slate-*`, `text-blue-*`, `border-slate-200`, `bg-rose-*`, `bg-emerald-*`, etc. (aliased to the Slovak Wiki palette)
- Fonts: `font-sans` (UI), `font-serif` (reading)
- Prefer theme utilities over raw `var(--…)` in components

## Components

- Put reusable UI in `src/lib/components/`.
- Put page shells in `src/lib/pages/`.
- Use standard HTML/Svelte elements only — no invented component names, no Framer Motion / motion libraries unless already imported in that file.
- Colocate markup + Tailwind. Avoid a second stylesheet for a component.

## Loading states

Pick the loading pattern by wait type:

- **Real async waits** (e.g. Pagefind search): use `src/lib/components/ui/DotLoader.svelte`.
- **Client hydration gates** / known layout placeholders: use **layout skeletons**, not the dot loader.
  - Current examples: `PracticePlayerSkeleton.svelte` (practice set / reference / review), `LessonPracticeSkeleton.svelte` (lesson practice block).

**Keep skeletons honest.** Any skeleton must stay a recognizable stand-in for the real UI it replaces. If that target layout changes drastically, update the matching skeleton in the same change. Do not leave a stale skeleton that no longer resembles the loaded page.

## Svelte readability (flags.games-style)

Prettier wraps lines; **airiness is manual**. Keep markup breathable:

1. Blank line between script clusters: imports → props → state → derived → effects/lifecycle → functions.
2. Never crush control flow: `{#if}` / `{:else}` / `{#each}` / `{#key}` open on their own line, body indented, close on its own line.
3. Blank line between major markup sections (`<nav>`, `<header>`, each `<section>`, `<footer>`).
4. Long Tailwind: prefer multiline `cx("…", "…")` or a `const …Class = "…"` — not one giant `class="…"`.
5. Sibling interactive elements (`<a>`, `<button>`, `<span>`) on separate lines inside flex/grid rows.

## Stack habits

- Svelte 5 runes (`$props`, `$state`, …) as used in the repo.
- TypeScript strict; no `any`.
- Keep changes focused: don't drive-by refactor unrelated files.
- Don't invent docs the user didn't ask for.
- After UI edits: `bun run format`, then re-check control blocks weren't re-crushed.

## Checklist before finishing UI work

- [ ] No new selectors added to `styles.css` for one-off layout/look
- [ ] Styling done with Tailwind utilities and/or an existing/shared component
- [ ] Used theme tokens (`slate` / `blue` / `rose` / `emerald`, `font-serif`, …) not one-off hex in components
- [ ] Desktop + mobile still look correct
- [ ] If a layout with a skeleton changed drastically: matching skeleton updated
