# slovak.wiki — Agent conventions

Astro + Svelte 5 + Tailwind CSS v4. Read this before UI or styling work.

Domain-specific authoring and pipelines live next to the work — not here:

| Need                                        | Where                                                          |
| ------------------------------------------- | -------------------------------------------------------------- |
| Dictionary / frequency / audio / images ops | [`scripts/README.md`](scripts/README.md)                       |
| Hand-add a lemma                            | [`content/dictionary/README.md`](content/dictionary/README.md) |
| Voice roster                                | [`content/audio/README.md`](content/audio/README.md)           |
| FOUC / blocking pre-paint boots             | [`src/lib/fouc/README.md`](src/lib/fouc/README.md)             |
| Slovak linguistic accuracy                  | `slovak-language` skill                                        |
| Visual before/after recaps                  | `.cursor/skills/visual-recap`                                  |

## Tooling

**Bun** is the package manager and script runner for this repo (`bun.lock`).

- Install: `bun install`
- Scripts: `bun run <script>` (e.g. `bun run dev`, `bun run test`, `bun run format`, `bun run lint`, `bun run typecheck`)
- Prefer Bun over npm/pnpm/yarn for installs and script runs
- Do not refresh or commit `package-lock.json`; use `bun.lock`

### Scripts (`scripts/`)

`bun run typecheck` (`astro check`) typechecks **`scripts/**` as well as `src/`**. Husky pre-commit runs it after Prettier — new or edited scripts must pass before commit.

**Copy existing patterns; don't invent Bun-only APIs.**

| Need                         | Use (already in repo)                                                                | Avoid in `scripts/` |
| ---------------------------- | ------------------------------------------------------------------------------------ | ------------------- |
| Script directory / repo root | `fileURLToPath(new URL(".", import.meta.url))` or `ROOT` from `scripts/lib/paths.ts` | `import.meta.dir`   |
| Spawn a process              | `node:child_process` (`spawn`, `execFile`)                                           | `Bun.spawn`         |
| File I/O                     | `node:fs` / `node:fs/promises`                                                       | —                   |

`@types/bun` is installed for running scripts with Bun, but the shared `tsconfig.json` does **not** load Bun globals — so `import.meta.dir` and `Bun.*` fail `astro check` even when `bun scripts/…` runs fine.

**Before finishing script work:** `bun run typecheck` (mandatory, not “when risk is high”). Remove unused `const` / imports left from refactors — they show up as diagnostics and slow review.

Reference implementations: `scripts/recaps/cli.ts`, `scripts/lib/paths.ts`, `scripts/downloads/export.ts`.

### Dev & preview servers (Astro 7.2+)

**Agents:** start long-running servers in **background mode** so the shell stays free. `astro dev` and `astro preview` share the same machinery ([Astro 7.2](https://astro.build/blog/astro-720)).

| Task                     | Command                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| Dev (HMR)                | `bunx astro dev --host 0.0.0.0 --background`                          |
| Production build preview | `bun run build` then `bunx astro preview --host 0.0.0.0 --background` |
| Check if running         | `bunx astro dev status` or `bunx astro preview status`                |
| Tail logs                | `bunx astro dev logs` or `bunx astro preview logs`                    |
| Stop                     | `bunx astro dev stop` or `bunx astro preview stop`                    |

- `bun run dev` / `bun run preview` omit `--background` — fine for humans in a dedicated terminal; agents should pass `--background` instead.
- Preview serves the last `bun run build` output — rebuild after code/content changes.
- Background servers write to their own log files; use `logs` / `status` rather than blocking the shell.

**Build cache:** `experimental.incrementalBuild: true` in `astro.config.ts` skips re-rendering unchanged prerendered pages when `cacheKey` is set on `getStaticPaths()` entries.

## Search index (Pagefind)

Site search loads `/pagefind/` (generated; gitignored under `static/pagefind/`).

- **Production build** already rebuilds the index (`astro:build:done` → writes `dist/pagefind` + `static/pagefind`).
- **Local / `bun run dev`:** run `bun run index:search` when first clone / missing `static/pagefind/`, searchable content changed, or header search says the index is not built yet.
- Skip re-index for pure UI/CSS/layout edits with no content changes.

## Content pipelines

Do not paste script cookbooks here. Follow:

- **Dictionary / frequency / Tatoeba / downloads / audio / images:** [`scripts/README.md`](scripts/README.md)
- **Hand lemma fields:** [`content/dictionary/README.md`](content/dictionary/README.md)
- **Sources (SNK, Tatoeba, JÚĽŠ):** [`docs/data-sources.md`](docs/data-sources.md) and `/references`
- **Slovak in any of the above:** `slovak-language` skill before commit

After publish/enrich/curate/related or lesson/practice text changes: `bun run index:search` so local Pagefind matches.

## Slovak language skill

**Skill:** `slovak-language` — `~/.codex/skills/slovak-language/SKILL.md` (also listed in Cursor agent skills).

**When to use:** Read and follow that skill **before** producing or editing meaningful Slovak (diacritics, agreement, case, aspect, register). Trigger for:

- New or changed lesson / practice / dictionary Slovak (lemmas, examples, dialogue, answers, feedback `why` lines with Slovak patterns)
- Translate, write, rewrite, or correct Slovak
- Grammar / pronunciation / CEFR study explanations tied to site content
- Formal vs informal (`ty`/`vy`), gender-sensitive forms, or cultural/register choices

**How:** Open the skill file first; pick the task mode (translate / write / correct / teach / plan study / explain grammar); run the mandatory production pass; load only the reference file(s) the skill routes to under `references/`. Do not invent Slovak from English word-for-word.

**Skip when:** Pure UI/CSS/layout, infra, tests with no learner-facing Slovak strings, or copy-pasting existing verified Slovak unchanged.

Repo content tone and exercise UX → [`docs/lessons-practice-content.md`](docs/lessons-practice-content.md). The skill owns linguistic accuracy; that doc owns product/content conventions.

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

### UI composition

General rules for status blocks, compare views, summaries, and any “nested card” moment:

- **Shell stays neutral; content carries tone.** Page chrome (footer, rail, shell) uses `bg-paper` / `bg-surface` and slate borders. Semantic color (success, error, hint) belongs on the **inner** block — not shell + full-bleed band + nested card (“stripe sandwich”).
- **One container, internal dividers.** For compare/contrast or multi-part summaries: one inset panel (`ring-1 ring-inset` on `bg-surface`), rows with a light tint and `border-b` between them. Not multiple sibling boxes each with their own border and radius.
- **Secondary copy outside the highlight.** Primary line + status tint stay in the colored row; teaching notes, metadata, and “why” sit below or beside — not inside the success/error block.
- **Do not repeat on-screen context.** Drop redundant glosses, labels, or answers the learner already saw one step above.
- **Variant / density on the component.** Same widget, tighter when inline (`compact`) vs roomier in recap or detail (`default`) — not duplicate components or page-specific markup.
- **Colocated `*-ui.ts` for repeated patterns.** Shared class bundles live next to the widget (e.g. `practice-feedback-ui.ts`); page shells handle layout only.

Reference: miss feedback — `PracticeExerciseFeedback.svelte` + `practice-feedback-ui.ts`.

## Astro islands (hydration)

**Default: SSR static.** Hydrate only widgets that need browser JS. Nested Svelte inside an SSR parent does **not** hydrate — islands must be imported in `.astro` and passed via slots/snippets.

### Gold pattern

```astro
<!-- SSR shell — no client:* -->
<HomePage>
  <HomeHeroSearch client:load slot="heroSearch" {popularWords} />
</HomePage>
```

```svelte
<!-- HomePage.svelte -->
let { heroSearch }: { heroSearch: Snippet } = $props();
<!-- … -->
{@render heroSearch()}
```

### Do / don't

| Do                                                                                            | Don't                                                                               |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `client:load` / `client:only` on the interactive child                                        | `client:load` on the whole page shell for a few buttons                             |
| Pass islands through Astro `slot="…"` → Svelte `Snippet`                                      | Import interactive widgets only inside an SSR Svelte parent and expect them to work |
| Prefer `client:only="svelte"` when SSR would mismatch (random state, `localStorage`-first UI) | Hydrate large prose/reference trees “just in case”                                  |

**FOUC boots:** Shared kit in [`src/lib/fouc/`](src/lib/fouc/) (see [`README`](src/lib/fouc/README.md)). Lessons use it via `LessonsProgressBoot` + `data-lessons-hydrate` / `data-lessons-ready`. Paint SSOT: `progress-view.ts` → `apply-progress.ts`; client island and generated IIFE share that path. After changing a boot entry or its imports, run `bun run fouc:boot` (or `bun run fouc:boot -- lessons`) and commit the `*.generated.ts` file.

Full-page hydrate only when the page **is** the interactive app (filters, player, localStorage-first UI), not static chrome with a widget. Prefer SSR shell + small slotted island for browse/list pages; do not embed huge datasets in HTML.

### Checklist before adding `client:*`

- [ ] Does this component need events, `localStorage`, or browser APIs?
- [ ] Can the parent stay SSR with this as a slotted island?
- [ ] If yes to full-page hydrate: is the page primarily interactive (not mostly prose)?

## Components

- Put reusable UI in `src/lib/components/`.
- Put page shells in `src/lib/pages/`.
- Use standard HTML/Svelte elements only — no invented component names, no Framer Motion / motion libraries unless already imported in that file.
- Colocate markup + Tailwind. Avoid a second stylesheet for a component.

## Loading states

Pick the loading pattern by wait type:

- **Real async waits** (e.g. Pagefind search): use `src/lib/components/ui/DotLoader.svelte`.
- **Client hydration gates** / known layout placeholders: use **layout skeletons**, not the dot loader.

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
- **Format before done.** After any TS / Svelte / Astro / content / script edit: run `bun run format` (or at least `bun run format:check`). Not UI-only — lessons, practice, learning helpers, and tests count. Pre-commit `lint-staged` also runs Prettier on staged files, but agents often skip hooks; CI `format:check` still fails the PR. After Prettier, re-check Svelte `{#if}` / `{#each}` blocks weren't re-crushed.
- **Lint + typecheck when risk is high.** Run `bun run lint` and `bun run typecheck` (alias: `bun run check`) before calling done when:
  - many files changed in one pass, or
  - types, exports, shared helpers, content loaders, learning/session logic, Astro pages/islands, or package scripts/config likely shifted
  - **any** new or edited file under `scripts/` (see **Scripts** above — mandatory)
  - Skip for tiny copy-only or pure Tailwind class tweaks if `format` already ran. Fix failures before finishing — pre-commit runs `bun run check`; CI does not (only `format:check`).

## Checklist before finishing UI work

- [ ] Ran `bun run format` (or `format:check` clean)
- [ ] If multi-file / type-touching / shared-logic change: `bun run lint` + `bun run typecheck` clean
- [ ] No new selectors added to `styles.css` for one-off layout/look
- [ ] Styling done with Tailwind utilities and/or an existing/shared component
- [ ] Used theme tokens (`slate` / `blue` / `rose` / `emerald`, `font-serif`, …) not one-off hex in components
- [ ] Desktop + mobile still look correct
- [ ] If a layout with a skeleton changed drastically: matching skeleton updated
- [ ] Hydration: no new full-page `client:*` on mostly-static shells (see **Astro islands**)
