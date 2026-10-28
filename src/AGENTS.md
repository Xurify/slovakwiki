# slovak.wiki — UI and styling rules

Moved out of the root `AGENTS.md` so that a story or audio thread does not read them. Read this file before any UI, styling, hydration or loading-state work in `src/`. The root file keeps the rest.

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

### Motion

One vocabulary site-wide, so interactions read as the same calm reference site as the pages:

- **State changes** (hover, pressed, selected, focus): transition `color`, `background-color`, `border-color`, `box-shadow`, `opacity` over `duration-150 ease-out`. Nothing else moves.
- **Overlays** (drawer, menus, popovers): one translate or fade on the panel, `duration-200 ease-out`, elevated with `shadow-(--shadow-float)`. No staggered children.
- **Content that appears** (feedback, revealed dialogue lines, results): `animate-rise` (200ms fade + 4px). Once, on mount.
- **Icon state** (sound on/off, menu open/close, theme): swap the icon. No scale/blur morphs.
- **Stick-figure cast** (`src/lib/stick-figure/`: on podcast episode pages, and at `/dev/stick-figures` and `/dev/scenes`; see **Stick-figure scenes** in the root `AGENTS.md`): figures move only while a line plays. The speaker gestures (planned from the line) and moves its mouth (from the clip's loudness track); the speaker turns to whoever they speak to in a 300 ms flip that slows into and out of edge-on, the others turn to the speaker a beat later, nearest first (`turns.ts`), and the one spoken to may answer with one silent gesture (lean in to a question, nod at an answer or thanks, hold up what is pointed at in their hands) or walk over to see what they are shown. In a talk, a reply that does not fit is taken as a Slovak would take it, with one reaction before they answer it: a puzzled tilt, a laugh, or folded arms. Someone who claims what is held up ("Áno, moje!") reaches out and takes it, and someone handed something ("Nech sa páči.", "…je pre teba.") reaches for it and keeps it. Someone called in under an umbrella ("Poď sem, pod dáždnik.") comes right up, shoulder to shoulder under the canopy (`SHELTER_WIDTHS`). A speaker who names something in the backdrop or held up for them points at it on its word with a free hand, turning to it if it is behind them: a straight reaching arm for `tamten`, a bent one for `tento`. Where the backdrop has two of a thing, `tento` means the one by the cast and `tamten` the one further off, and only that one lights up; a demonstrative on its own points back at the noun it agrees with ("Tamten je lacnejší."). Someone who arrives with a hello walks on during the line before; someone whose last line takes them away walks off the stage. A line that seats someone ("Sadni si.", "Sadnite si.", "Sadnime si.") walks them to the nearest free chair of the place's `furniture` and sits them down once there; "Vstaň." gets them up. Sitting is a posture that lasts across lines, not a gesture: the arms still talk, the chair keeps which way they face, and only their head turns to whoever speaks. A line voiced `[sighs]`, `[chuckles]` or `[yawns]` opens with that gesture. A line with `ring` is preceded by a ring or a message ping; whoever answers a call holds the phone to their ear through their goodbye, and a line `overPhone` is heard with nobody on stage. A word with a picture (a country's flag) pops it over the speaker's head with `animate-rise` for under two seconds. Then they return to rest, breathing and blinking between lines (`idle.ts`). Under reduced motion each gesture is one held pose, turns and walks are instant, and the mouth stays still.
- **Weather:** rain and snow on the stage fall in a seamless loop (`animate-fall`), near drops faster than far ones, and fade in and out over 900 ms as the lines change the weather. It is the one loop on the site; reduced motion holds it still.
- **Not used:** `active:scale-*`, hover zooms, 3D "key" lips, pulsing or drifting loops, bouncy easings. Reduced motion is handled globally in `styles.css`.

### UI composition

General rules for status blocks, compare views, summaries, and any “nested card” moment:

- **Shell stays neutral; content carries tone.** Page chrome (footer, rail, shell) uses `bg-paper` / `bg-surface` and slate borders. Semantic color (success, error, hint) belongs on the **inner** block — not shell + full-bleed band + nested card (“stripe sandwich”).
- **One container, internal dividers.** For compare/contrast or multi-part summaries: one inset panel (`ring-1 ring-inset` on `bg-surface`), rows with a light tint and `border-b` between them. Not multiple sibling boxes each with their own border and radius.
- **Secondary copy outside the highlight.** Primary line + status tint stay in the colored row; teaching notes, metadata, and “why” sit below or beside — not inside the success/error block.
- **Do not repeat on-screen context.** Drop redundant glosses, labels, or answers the learner already saw one step above.
- **Variant / density on the component.** Same widget, tighter when inline (`compact`) vs roomier in recap or detail (`default`) — not duplicate components or page-specific markup.
- **Colocated `*-ui.ts` for repeated patterns.** Shared class bundles live next to the widget (e.g. `practice-feedback-ui.ts`); page shells handle layout only.

Reference: miss feedback — `PracticeExerciseFeedback.svelte` + `practice-feedback-ui.ts`.

### Avoid the generated look

The site should read like a calm reference someone made by hand, not a template. Each pattern below came up in review as "AI slop". Don't add them, and remove them from any page you touch.

**Labels and titles**

- **No small caps.** No tiny uppercase tracked labels (`CHAPTERS`, `WORDS YOU'LL HEAR`). Label lists, rails and form groups in sentence case with `Eyebrow.svelte` or `eyebrowClass`. Counts are plain text: `1 of 6`, `Question 1 of 3`.
- **No kicker over a heading.** Drop a word above a title that only repeats it: `Track` over "Everyday Slovak", `Area` over "Nouns", `Review` over "Nothing to review today". Keep a line above a title only when it adds something, such as the track a lesson belongs to on the continue card.
- **No meta strip over a title.** A dot-joined row above the h1, like `Ten, tá, to · 4 min · A1–A2` or `Case 2 of 6 · Direct object`, is the template signature. When a reader needs the facts before starting, list them under the lead as labelled pairs (`Length 4 min`, `Level A1–A2`, `Grammar ten, tá, to`), as the listening episode page does. Otherwise leave them to the body, which often says them already.
- **One language in a card or list title.** A story or episode name is the Slovak line alone (`Kde je ten kľúč?`). Its English goes under the title on its own page, not after a `·` on the card. A Slovak and English pair elsewhere sits side by side with a gap, as in `Koho? Čo?  Whom? What?`.
- **Name stories after a line.** An episode or story dialogue is named after a line the learner will hear, not after the grammar it teaches.

**Layout**

- **No dot legends.** A coloured dot never looks like the mark it explains. Explain marks with a sentence that uses a real word styled exactly like the rows: "the word you pick is blue, like _táto_".
- **No stacked headings.** A section heading, a subtitle and a card title in a row before the first action are three labels for one thing. Keep one.
- **One primary action per state.** Everything else is a quiet text button, shown only when it applies.
- **No empty sections.** Render a heading only when its content exists. Astro passes a named slot even when its condition is false, so check the data, not the snippet.
- **No dead width.** Rows and table columns fit their content. A short phrase list is a grid of cells, not two columns pushed to the edges.
- **No decoration for its own sake:** no gradient text, glows, sparkle or emoji icons, or badges on everything.

**Content**

- **Restyle, don't delete.** When a block looks wrong, change how it looks and keep what it says. The Slovak case terms on contrast cards were once removed for a cleaner look and had to come back. Ask before you drop information.
- **Copy never contradicts the UI.** "The text opens after three questions" next to a Show text button is wrong. Say what happens in plain words, and name buttons with verbs: Listen, Next chapter, Show text.
- **Plain copy.** No hype ("unlock", "master", "dive into", "journey", "seamless") and no emoji in UI text. Exclamation marks belong in the Slovak dialogue, not in the chrome.
- **One feature, one home.** Don't embed a second interactive copy of a feature on a reference page. Link to where it lives: grammar pages link to the listening episode instead of running their own player.

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

**FOUC boots:** Shared kit in [`src/lib/fouc/`](src/lib/fouc/) (see [`README`](src/lib/fouc/README.md)). Lessons use it via `LessonsProgressBoot` (`stage="gate"` before page, `stage="script"` after) + `data-lessons-hydrate` / `data-lessons-ready`. Paint SSOT: `progress-view.ts` → `apply-progress.ts`; client island and generated IIFE share that path. After changing a boot entry or its imports, run `bun run fouc:boot` (or `bun run fouc:boot -- lessons`) and commit the `*.generated.ts` file. The generator refuses any Bun other than `package.json` `packageManager` — a newer minify changes the IIFE and fails `scripts/fouc/generate.test.ts` on CI.

Full-page hydrate only when the page **is** the interactive app (filters, player, localStorage-first UI), not static chrome with a widget. Prefer SSR shell + small slotted island for browse/list pages; do not embed huge datasets in HTML.

### Checklist before adding `client:*`

- [ ] Does this component need events, `localStorage`, or browser APIs?
- [ ] Can the parent stay SSR with this as a slotted island?
- [ ] If yes to full-page hydrate: is the page primarily interactive (not mostly prose)?

## Components

- Put reusable UI in `src/lib/components/`, grouped by domain (`dictionary/`, `lessons/`, `practice/`, …).
- Put page shells next to that domain (e.g. `DictionaryBrowsePage` in `components/dictionary/`). Home is `src/lib/home/`. Search page chrome is `src/lib/search/SearchPage.svelte`.
- Keep `src/pages/` to `.astro` routes (and endpoints). Do not colocate `.svelte` there.
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
4. Long Tailwind: split into a multiline `cx("…", "…")` on the element. Do not hoist classes into local `const …Class = "…"` variables in the script; keep them on the markup they style.
5. Sibling interactive elements (`<a>`, `<button>`, `<span>`) on separate lines inside flex/grid rows.

## Stack habits

- Svelte 5 runes (`$props`, `$state`, …) as used in the repo.
- TypeScript strict; no `any`.
- Keep changes focused: don't drive-by refactor unrelated files.
- Don't invent docs the user didn't ask for.
- **Format before done.** After any TS / Svelte / Astro / content / script edit: run `bun run format` (or at least `bun run format:check`). Not UI-only — lessons, practice, learning helpers, and tests count. Pre-commit `lint-staged` also runs Prettier on staged files, but agents often skip hooks; CI `format:check` still fails the PR. After Prettier, re-check Svelte `{#if}` / `{#each}` blocks weren't re-crushed. Skip reformatting pipeline JSON — `words.json`, related-clusters, curated-examples, frequency dumps, audio/image manifests are in `.prettierignore`.
- **Lint + typecheck when risk is high.** Run `bun run lint` and `bun run typecheck` (alias: `bun run check`) before calling done when:
  - many files changed in one pass, or
  - types, exports, shared helpers, content loaders, learning/session logic, Astro pages/islands, or package scripts/config likely shifted
  - **any** new or edited file under `scripts/` (see **Scripts** above — mandatory)
  - Skip for tiny copy-only or pure Tailwind class tweaks if `format` already ran. Fix failures before finishing — pre-commit runs `bun run check` only when staged files include `src/` or `scripts/` code (or root TS/Astro config); CI does not (only `format:check`).

## Checklist before finishing UI work

- [ ] Ran `bun run format` (or `format:check` clean)
- [ ] If multi-file / type-touching / shared-logic change: `bun run lint` + `bun run typecheck` clean
- [ ] No new selectors added to `styles.css` for one-off layout/look
- [ ] Styling done with Tailwind utilities and/or an existing/shared component
- [ ] Used theme tokens (`slate` / `blue` / `rose` / `emerald`, `font-serif`, …) not one-off hex in components
- [ ] Nothing from **Avoid the generated look**: no small caps, kickers, meta strips over titles, dot legends or copy that contradicts the UI
- [ ] Desktop + mobile still look correct
- [ ] If a layout with a skeleton changed drastically: matching skeleton updated
- [ ] Hydration: no new full-page `client:*` on mostly-static shells (see **Astro islands**)
