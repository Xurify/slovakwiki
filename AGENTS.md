# slovak.wiki — Agent conventions

Astro + Svelte 5 + Tailwind CSS v4. Read this before UI or styling work.

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

### Shared class strings

Reusable Tailwind bundles live in `src/lib/ui/classes.ts` (`sectionLabel`, `shell`, `button`, `cx`, …).
Import those — do **not** recreate them as CSS classes in `styles.css`.

For interactive repeats (primary/secondary actions), prefer `src/lib/components/ui/Button.svelte`.

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
- After UI edits: `npm run format`, then re-check control blocks weren't re-crushed.

## Checklist before finishing UI work

- [ ] No new selectors added to `styles.css` for one-off layout/look
- [ ] Styling done with Tailwind utilities and/or an existing/shared component
- [ ] Used theme tokens (`slate` / `blue` / `rose` / `emerald`, `font-serif`, …) not one-off hex in components
- [ ] Desktop + mobile still look correct
