# Guided grammar and pronunciation — implementation plan

## Data model

1. Separate dictionary words from grammar and pronunciation concepts.
2. Add `GrammarTopic` with ordered group, rule, pattern, examples, common mistake, related words, and optional next topic.
3. Add `PronunciationTopic` with ordered group, hear-and-say goal, contrasts, mouth cue, practice words, practice phrase, related words, and optional next topic.
4. Keep a small normalized search result for global search. Do not reuse it as a detail-page model.
5. Validate unique topic slugs, next-topic links, and related dictionary words.

## Routes and templates

1. Add `/grammar` hub: Grammar foundations, start point, ordered Nouns, Verbs, and Sentences groups.
2. Add `/pronunciation` hub: Sound path, ordered Rhythm, Vowels, Consonants, and Diacritics groups.
3. Replace grammar and pronunciation route wrappers with section-specific detail templates.
4. Keep dictionary routes and `EntryDetail` unchanged.
5. Make `/wiki` dictionary-first; grammar and pronunciation controls link to their hubs rather than display concept rows as dictionary results.
6. Update homepage reference links to hub routes and guided starters.

## Verification

1. Run `bun run check`, `bun test`, and `bun run build`.
2. Test `/grammar`, `/pronunciation`, each topic detail, dictionary entry, global search, and `/wiki` controls.
3. Inspect desktop and mobile layouts. Confirm progression works without blocking free browsing.
