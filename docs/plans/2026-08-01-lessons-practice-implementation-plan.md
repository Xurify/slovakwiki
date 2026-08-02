# Lessons, Practice, and Reference: Implementation Plan

## Scope

Implement the approved product split in the existing SvelteKit app:

- **Lessons** introduce Slovak through short, continuous scenes.
- **Practice** retrieves previously encountered language and Review items.
- **Reference** remains Dictionary, Grammar, Pronunciation, and Language terms.

Keep the current visual language and left sidebar. Do not add Insights, Classroom, accounts, sync, points, streaks, adaptive difficulty, course locks, or a generic quiz bank. Do not migrate to Astro until the user-facing model and UI are proven.

## 1. Centralize navigation and retain old URLs

1. Add `src/lib/navigation.ts` with the primary and reference navigation records.
2. Update `src/lib/components/Sidebar.svelte`, `src/lib/components/Header.svelte`, and `src/lib/components/Footer.svelte` to consume it.
3. Primary navigation becomes:
   - `Lessons` → `/lessons`
   - `Practice` → `/practice`
   - `Reference` → `/wiki`
4. Keep current reference URLs stable, including `/wiki`, `/dictionary/[slug]`, `/grammar/...`, and `/pronunciation/...`.

## 2. Introduce authored learning and practice data

Create:

- `src/lib/content/learning-types.ts`
- `src/lib/content/lessons.ts`
- `src/lib/content/practice.ts`

Use separate data models. Do not stretch `QuizQuestion` to fit the new product.

### Lesson data

Model three tracks: `everyday`, `grammar`, `pronunciation`.

Each lesson has a title, promise, track/group, short Slovak scene, key phrases, optional pattern explanation, 2–3 interaction steps, a personal-use prompt, a quiet next-lesson link, and links to complete reference pages.

Implement the first complete vertical slice, `everyday/meet-someone`, from the approved scene:

```text
language meetup → Dobrý deň → Volám sa … → Odkiaľ ste? → Som z … → Hovoríte po slovensky? → Trochu. Ešte sa učím.
```

Use a polite first-contact context and only then contrast informal `Ahoj`.

### Practice data

Create a separate `PracticeItem` for each precise language move that can be reviewed. Each item contains:

- source lesson/reference and return link;
- minimal Slovak context;
- one appropriate task type: choice, build, complete, or repair;
- exact correction, translation when useful, and a short `why`;
- optional new-use task;
- an explicit Reveal action for typed tasks.

Practice item examples:

- formal greeting in a first meeting;
- `Volám sa …`;
- `Som z Kanady.`;
- `Chcem kávu.` with the useful object form;
- `Ja číta knihu.` → `Čítam knihu.`

Reference practice hooks must point only to these exact items. Never offer an unscoped action such as `Practice cases overview`.

## 3. Build the Lessons route family and reusable UI

Add static route families:

```text
src/routes/lessons/+page.svelte
src/routes/lessons/[track]/+page.ts
src/routes/lessons/[track]/+page.svelte
src/routes/lessons/[track]/[lesson]/+page.ts
src/routes/lessons/[track]/[lesson]/+page.svelte
```

Use the existing `entries()`/static content pattern from Dictionary, Grammar, and Pronunciation routes.

Build small components under `src/lib/components/lessons/`:

- `TrackCard.svelte` — three typography-first track entries; no imagery, top bars, or metrics.
- `LessonList.svelte` — plain grouped list; `Core tools` only belongs within Everyday Slovak.
- `LessonScene.svelte` — Slovak-first dialogue, secondary translations, per-line audio control.
- `KeyPhraseList.svelte`, `PatternNote.svelte`, `LessonInteraction.svelte`, `PersonalUsePrompt.svelte`, `NextLesson.svelte`.

`LessonInteraction` is a dispatcher only. Keep answer-choice, word-building, and typed correction UIs as separate components.

Each lesson follows the authored scaffold, not an algorithm:

```text
see → choose → build → use
```

The learner starts with contextual support, then produces more of the form after they have encountered it. Personal prompts remain unscored.

## 4. Add original audio as content, not decoration

Add `AudioCue` metadata to authored Slovak lines, key phrases, and practice prompts. Build one accessible `src/lib/components/AudioButton.svelte` using static `/audio/...` files and a transcript/label.

Before generating at scale with ElevenLabs:

1. audition one solo voice and a two-person dialogue sample;
2. verify Slovak pronunciation, pacing, and intelligibility;
3. generate original audio only;
4. add assets and cue metadata lesson by lesson.

Do not reuse textbook or external-course audio.

## 5. Replace Quiz with Practice and simple local Review

Add:

```text
src/routes/practice/+page.svelte
src/routes/practice/review/+page.svelte
src/routes/practice/[set]/+page.ts
src/routes/practice/[set]/+page.svelte
src/lib/client/practice-state.ts
src/lib/components/practice/PracticePlayer.svelte
src/lib/components/practice/AnswerInput.svelte
src/lib/components/practice/WordBuilder.svelte
src/lib/components/practice/AnswerFeedback.svelte
src/lib/components/practice/RevealAnswer.svelte
src/lib/components/practice/ReviewEmptyState.svelte
```

Reuse the current Quiz page’s good accessibility behavior—focus after state changes, live feedback, keyboard-safe controls—but replace its generic question pack and result-score model entirely.

Persist only a versioned browser-local record under `slovak-wiki.practice.v1`:

```ts
{
  version: 1,
  completedLessonIds: string[],
  reviewItemIds: string[],
  savedReferenceItemIds: string[]
}
```

Rules:

- incorrect or revealed item → add to `reviewItemIds`;
- correct Review item → remove it;
- correct topic-practice item → no tracking change;
- explicit `Practice this` on Reference → add to `savedReferenceItemIds`;
- completing the guided lesson → add its ID silently.

Read storage only in `onMount`, validate it with Zod, safely discard malformed or stale values, and filter items that no longer exist. Optionally listen for browser `storage` updates to keep two tabs coherent.

The Practice landing page has only:

- `Review now`
- `Practice a topic`
- `Saved reference items`

No scores, streaks, charts, or activity dashboard. An empty Review directs the learner back to Lessons or Reference.

## 6. Add reference bridges only for shipped content

Extend `src/lib/content/types.ts` and selected records in `src/lib/content/data.ts` with narrowly scoped worked-example and lesson-link metadata.

Add:

- `LessonReferenceLinks.svelte` for lesson → deep reference links.
- `FocusedPracticeAction.svelte` beside eligible worked examples for reference → Practice links.

Use the `demonstrates` label to say exactly what an example shows. Hide the practice action when no finished matching item exists. Do not clone lesson teaching into the reference page.

## 7. Update the home page and retire old quiz content

Update `src/routes/+page.svelte` after the first lesson and Practice route work:

- a new learner can start `Meet someone`;
- a returning learner can use `Review now` only when local Review has items;
- reference search remains prominent.

## 8. Content rollout

Ship complete, usable units—not empty curriculum promises—in this order:

1. Everyday Slovak: Meet someone
2. Numbers and personal details
3. Days, dates, and time
4. At a café
5. Getting around town
6. Shopping
7. Grammar: `byť`, present-tense endings, nominative use, useful object forms, location vs destination
8. Pronunciation: alphabet, first-syllable stress, vowel length, marked consonants

Each Grammar unit must require a Slovak correction, completion, or construction in a real setting. It must not ask only English-language terminology questions.

## 9. Tests and verification

Extend `src/lib/content/content.test.ts` and add focused tests such as `src/lib/content/lessons.test.ts` and `src/lib/client/practice-state.test.ts`.

Cover:

- unique/resolvable lesson tracks, slugs, next links, reference links, and Practice item IDs;
- every Practice item has Slovak context, correction, and exact explanation;
- Grammar lessons include Slovak production or repair;
- accepted typed-answer normalization handles harmless NFC/case/punctuation variance without silently removing diacritics;
- Review state deduplicates additions, adds on reveal/miss, removes on correct review, preserves explicit reference saves, and recovers from malformed storage.

Verify each delivery slice with:

```text
npm run check
npm test
npm run build
```

Manual acceptance:

- keyboard-only interaction, Reveal, feedback focus, and audio labels;
- reload persistence for Review;
- mobile Lessons, Practice, and Reference navigation;
- no placeholder lesson/reference/practice links are exposed.
