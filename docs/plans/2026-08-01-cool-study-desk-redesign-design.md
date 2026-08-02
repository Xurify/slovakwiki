# Cool study desk redesign

## Intent

Move Slovak Wiki from a sepia editorial shell toward a clearer language-learning product without turning it into a gamified app. Reference remains the product's foundation; Lessons and Practice become visible, useful companions.

## Visual direction

- Editorial language-atlas system: deep navy ink, desaturated Slovak blue for structure, pale blue paper surfaces, and restrained Slovak red for active actions and feedback.
- Remove the yellow paper texture, heavy rounding, and card shadows. Use flat paper surfaces, rules, and one-sided accents to create hierarchy.
- Keep Source Serif for Slovak examples and explanatory reading; use IBM Plex Sans for navigation, labels, forms, and controls.
- Preserve the left sidebar, but make Study and Reference grouping clearer and reduce duplicate visual hierarchy.

## Visual refinement

Browser screenshots showed that the first cool-color pass was still too pale, boxed, and generic. The refined direction is an editorial language notebook:

- Give search one dark, high-contrast workbench instead of letting every panel compete equally.
- Put real Slovak on navigation and learning surfaces through diacritics, a greeting, and lesson phrase previews.
- Keep large reference panels bordered, but render secondary homepage sections as ruled editorial columns.
- Warm the main paper surface while keeping blue structure and red actions.
- Repair the mobile header so the full brand and three primary destinations remain readable.

## Surface changes

- Global tokens in `src/styles.css`: palette, canvas, surfaces, focus ring, links, buttons, success/error states.
- `Sidebar`, `Header`, and `Footer`: use the new color system and clearer active states.
- Homepage: retain the proven utility layout—search, featured entry, essential words, explicit reference destinations, lesson topics, and practice—but restyle it as a calm study desk.
- Lessons: apply the new surfaces and action colors while keeping scene-first content and audio cues.
- Practice: make the one-task interaction bright, focused, and legible; keep Review distinct from topic practice.
- Reference: preserve its information density but improve contrast, links, examples, and focused practice bridges.

## Guardrails

- No XP, streaks, dashboards, fake progress, or generic quiz language.
- No change to content relationships or local practice state.
- Keep keyboard focus visible and color contrast strong.
- Verify Svelte diagnostics, tests, production build, and key local routes.
