/**
 * Dictionary example pool vs what learners see on the lemma page.
 *
 * Enrich stores up to EXAMPLE_STORE_PER_WORD (Tatoeba `--per-word` default).
 * Detail UI + example audio targets only the first EXAMPLE_DISPLAY_LIMIT rows.
 * Extra stored rows stay in words.json for later curation / reordering.
 *
 * Full hand-add entry template: `content/dictionary/README.md`.
 */

/** Soft store pool size for Tatoeba enrich (`--per-word` default). */
export const EXAMPLE_STORE_PER_WORD = 8;

/** How many examples to show (and mint audio for) on dictionary detail pages. */
export const EXAMPLE_DISPLAY_LIMIT = 4;
