# Full-site utilitarian redesign

## Goal

Make every Slovak Atlas route feel like one product. The Wiki sets the visual and interaction standard: compact, neutral, dense, and built for reference work.

## Direction

- Use Inter and the system sans-serif stack throughout.
- Use white, charcoal, cool gray, and Slovak blue.
- Reserve blue for links, focus, selected controls, and primary actions.
- Remove cream, plum, coral, decorative marks, editorial typography, oversized heroes, rounded cards, and ornamental shadows.
- Use compact labels, thin borders, restrained spacing, and dense rows.
- Keep the existing content and behavior unless a layout change improves clarity.

## Shared shell

The header becomes a compact application bar with the product name, primary navigation, and global search. Active navigation uses a blue underline or blue text. The mobile header keeps the same information in a compact two-row layout.

The footer becomes a narrow reference footer with the product description and direct links. Global tokens, controls, focus styles, spacing, and breakpoints live in `src/styles.css`.

## Home

The home page becomes a reference dashboard.

- A compact introduction identifies the product and shows the main search.
- A “Start learning” section presents the four-step beginner path as a dense ordered list.
- A “Word to know” section uses the same metadata and example patterns as entry pages.
- Dictionary, grammar, and pronunciation indexes use bordered rows instead of editorial cards.
- Links lead directly to the Wiki, lesson, and entry routes.

## Wiki

The Wiki remains the baseline. Preserve its desktop sidebar, mobile filters, search, alphabet filter, result rows, and accessible pressed states. Align shared tokens with the new global system without changing its proven structure.

## Learn

The lesson page becomes a two-column learning workspace.

- A compact lesson index shows all six phrases and completion state.
- The main panel shows the active phrase, translation, usage note, progress, and next action.
- Completion uses the same panel instead of a separate celebratory card.
- Mobile places the lesson index in a horizontal strip above the active phrase.
- Current and completed states remain programmatically exposed.

## Quiz

The quiz becomes a compact assessment workspace.

- A status bar shows question count and score.
- The prompt appears in a bordered main panel.
- Answers appear as full-width rows with clear selected, correct, and incorrect states.
- Feedback appears in a polite live region.
- Results reuse the same panel and action styles.

## Search

Search results use the Wiki’s dense result-table pattern. The header shows the query and result count. Empty results use a restrained bordered message with a direct Wiki link.

## Entry pages

Dictionary, grammar, and pronunciation pages share one reference-detail layout.

- A compact title block shows type, topic, Slovak term, and English meaning.
- The main column contains definition, usage, examples, and source.
- A narrow related-entry rail stays visible on desktop and follows the article on mobile.
- Borders and section labels replace cards and decorative treatments.

## Components and data

Keep the existing route structure and content data. Refine shared components instead of duplicating page-specific patterns:

- `Header.svelte` and `Footer.svelte` own the application shell.
- `EntryCard.svelte` becomes a dense result row.
- `EntryDetail.svelte` owns the shared reference-detail layout.
- Route components own only route-specific interaction and composition.

Derived state remains in Svelte `$derived` expressions. Event handlers update interactive state directly. No new persistence, API, or backend work is required.

## Accessibility

- Preserve semantic headings, landmarks, labels, and native controls.
- Expose selected filters, lesson steps, and quiz answers with ARIA state.
- Announce changing result counts and quiz feedback.
- Keep visible focus styles and keyboard access.
- Maintain a minimum 24-by-24-pixel target; use larger targets for primary mobile actions.
- Respect reduced-motion preferences.

## Responsive behavior

Desktop uses wide reference layouts with side navigation or related rails. At 760 pixels and below, side regions become horizontal controls or stacked sections. Dense tables reduce to their essential Slovak and English fields. Horizontally scrollable controls must not create document overflow.

## Verification

- Run Svelte diagnostics, unit tests, and the production build.
- Test every route at 1440 by 900 and 390 by 844.
- Exercise search, Wiki filters, lesson navigation, quiz completion, global navigation, and entry links.
- Check document overflow, keyboard focus, ARIA state, console errors, and failed network requests.
