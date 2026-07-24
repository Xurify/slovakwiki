# Full-site utilitarian redesign: implementation plan

## Constraints

- Treat `src/routes/wiki/+page.svelte` as the visual and interaction baseline.
- Preserve route structure, content data, search ranking, loaders, prerender settings, and current learning/quiz behavior.
- Keep global tokens and reusable controls in `src/styles.css`; keep route layout CSS scoped.
- Use Inter/system typography only.
- Verify each checkpoint before removing legacy tokens or dependencies.

## 1. Establish the standalone baseline

Files:

- `.gitignore`
- `bun.lock`
- `package.json`
- `src/**`
- `static/**`
- Svelte and Vite configuration

Actions:

1. Confirm `flags.games` remains clean and contains no Slovak workspace references.
2. Commit the current standalone source as the pre-redesign baseline.
3. Run `bun run check`, `bun test`, and `bun run build`.
4. Record current route behavior before changing presentation.

## 2. Build the shared design foundation

Files:

- `src/styles.css`
- `src/lib/components/Header.svelte`
- `src/lib/components/Footer.svelte`

Actions:

1. Add neutral semantic tokens for canvas, surface, text, muted text, borders, Slovak blue, success, and danger.
2. Standardize compact typography, spacing, borders, controls, focus styles, shell width, header height, and the 760-pixel breakpoint.
3. Keep temporary compatibility aliases until every route migrates.
4. Restyle the header as a compact desktop row and a two-row mobile bar.
5. Derive active navigation from `$app/state`; expose exact-page state with `aria-current`.
6. Preserve trimmed, encoded global search navigation.
7. Add a skip link and a shared `#main-content` target.
8. Replace the footer with a narrow reference footer and semantic footer navigation.

Checkpoint:

- Header search and navigation work on desktop and mobile.
- Focus remains visible.
- Sticky content clears the header.
- No document overflow at 320, 390, or 1440 pixels.

## 3. Convert Search to Wiki-style rows

Files:

- `src/lib/components/EntryCard.svelte`
- `src/routes/search/+page.svelte`

Actions:

1. Convert `EntryCard` into a dense full-row link with Slovak, English, type, and chevron fields.
2. Let Search own the table header, list border, query heading, and result count.
3. Add a polite, atomic result-count region.
4. Distinguish an empty query from a query with no matches.
5. Collapse mobile rows to Slovak and English.
6. Preserve `searchEntries`, URL-derived query state, and `prerender = false`.

Checkpoint:

- Test `dakujem`, `hello`, an empty query, and a no-result query.
- Confirm every result link resolves.

## 4. Rebuild the shared entry-detail layout

File:

- `src/lib/components/EntryDetail.svelte`

Actions:

1. Preserve metadata, body, examples, source, related-entry lookup, and route mapping.
2. Replace the editorial hero with a compact bordered title block.
3. Use semantic sections, ordered examples, and a labelled related-entry list.
4. Build an article-plus-related-rail desktop layout.
5. Stack the related rail after the article below 760 pixels.
6. Use the shared header-height token for sticky offset.

Do not edit:

- Dictionary, grammar, and pronunciation route wrappers
- Their `+page.ts` loaders and static-entry generators

Checkpoint:

- Verify one dictionary, grammar, and pronunciation entry.
- Verify related links, source links, metadata, mobile stacking, and prerendered output.

## 5. Recompose Home as a reference dashboard

File:

- `src/routes/+page.svelte`

Actions:

1. Preserve the search handler, featured entry, path data, and content links.
2. Remove decorative diacritics, editorial typography, and oversized hero treatment.
3. Build a compact product introduction and primary search.
4. Present the beginner path as a dense ordered list.
5. Present “Word to know” with reference metadata and a bordered example.
6. Render dictionary, grammar, and pronunciation indexes as semantic bordered lists.
7. Key data-driven loops by stable identifiers.

Checkpoint:

- Test home search and every section link.
- Verify dense desktop composition and clean single-column mobile flow.

## 6. Rebuild Learn as a workspace

File:

- `src/routes/learn/+page.svelte`

Actions:

1. Preserve phrase data, direct phrase selection, Next, completion, and Review behavior.
2. Derive the current phrase and progress from existing state.
3. Build a desktop lesson index beside a stable lesson panel.
4. Move the lesson index above the panel as a contained horizontal strip on mobile.
5. Use native `<progress>` plus visible “Phrase X of 6” text.
6. Expose the current step with `aria-current="step"`.
7. Expose completed steps with text, not color or checkmarks alone.
8. Reuse the lesson panel for completion.

Checkpoint:

- Jump between phrases, complete all six, review, and open Quiz.
- Test keyboard order, announced state, and local-only horizontal scrolling.

## 7. Rebuild Quiz as an assessment workspace

File:

- `src/routes/quiz/+page.svelte`

Actions:

1. Preserve question generation, scoring, answer lock, Next, results, and Restart.
2. Derive the current question and feedback from existing state.
3. Use a compact status bar and stable bordered panel.
4. Render answers as full-width rows.
5. Expose selection with `aria-pressed`.
6. Disable answers after selection.
7. Label the user’s incorrect answer and the correct answer with visible text.
8. Keep a persistent polite, atomic feedback region.
9. Reuse the panel for results.

Checkpoint:

- Test correct and incorrect answers, double-click resistance, final results, and restart.
- Verify feedback without relying on color.

## 8. Align and complete the Wiki

File:

- `src/routes/wiki/+page.svelte`

Actions:

1. Preserve filter state, derived results, reset behavior, result links, pressed states, and live count.
2. Replace hard-coded colors with equivalent shared semantic tokens.
3. Remove the route-level body background override.
4. Key dynamic lists.
5. Add a mobile topic strip so desktop and mobile expose the same filters.
6. Keep type, topic, and alphabet strips locally scrollable.
7. Preserve the desktop sticky sidebar and 760-pixel switch.

Checkpoint:

- Combine kind, topic, letter, and query filters.
- Test query clear, reset, no-match recovery, and all result links.
- Confirm no Wiki behavior or density regression.

## 9. Remove the legacy visual system

Files:

- `src/styles.css`
- `package.json`
- `bun.lock`

Actions:

1. Remove Fraunces imports and all remaining legacy palette aliases.
2. Remove `@fontsource-variable/fraunces`.
3. Refresh the lockfile.
4. Run:

   `rg "Fraunces|plum|coral|ochre|sky|sage-soft|shadow|paper" src package.json`

5. Resolve every deprecated design reference.

## 10. Final verification

Automated:

- `bun run check`
- `bun test`
- `bun run build`
- `git diff --check`

Desktop and mobile routes:

- `/`
- `/wiki`
- `/learn`
- `/quiz`
- `/search?q=dakujem`
- `/search?q=hello`
- `/search?q=zzzz`
- `/dictionary/dakujem`
- `/grammar/grammatical-gender`
- `/pronunciation/first-syllable-stress`

Viewports:

- 1440 by 900
- 390 by 844
- 320-pixel reflow

Manual checks:

- Global search and active navigation
- Wiki filters and result links
- Lesson selection, completion, and review
- Quiz correct, incorrect, results, and restart paths
- Search success and empty states
- Entry related and source links
- Keyboard focus and logical order
- ARIA current, pressed, progress, and live states
- 200-percent zoom and reduced motion
- No serious accessibility findings
- No console errors, hydration warnings, failed requests, or document overflow
