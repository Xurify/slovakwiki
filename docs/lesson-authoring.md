# Creating a lesson

Everything a new lesson needs, in the order to do it. Copy tone and feedback wording live in [`lessons-practice-content.md`](lessons-practice-content.md); Slovak accuracy is the `slovak-language` skill. This file is the checklist that ties them together.

Reference implementations:

- **Static lesson**: `grammar/mat-present` in `src/lib/catalog/lessons/grammar.ts` + `beats/mat.ts`.
- **Generated practice (rich)**: `grammar/possessives` in `src/lib/learning/possessives/` (paradigm, generators, session, lesson) + `beats/possessives.ts`. Also `everyday/days-dates-and-time` in `src/lib/learning/time/`.

## 1. Plan before writing

- [ ] One topic, one promise sentence (“Say whose something is…”).
- [ ] List what “covering the bases” means for the topic: the core form, the common mistakes, the exceptions worth a step of their own. Possessives covered agreement, invariable forms, `svoj`, all six cases, `čí`, named owners, spelling traps, and `si` with body parts.
- [ ] Sketch 4–7 beats. Each beat = one idea: a teach step, then 2–3 checks.
- [ ] Mix exercise types across the lesson: `choice`, `build`, `typed` (complete / repair), `selectAll`, and odd-one-out (`choiceMode: "pickTrap"`).
- [ ] End with a `personal` exercise (speak-aloud wrap-up with a Slovak example).

## 2. Write the scene

The scene is a real conversation that the beats replay in pieces.

- [ ] It must read naturally start to finish: a situation, a reason to talk, replies that answer what was said. Read it aloud. (The first present-tense scene — “Peter číta knihu. / Čítaš knihu?” — had no situation and no reason for either line.)
- [ ] Speakers come from the roster in `content/audio/config.json` (`speakers` arrays): `Anna`, `Mária`, `Marek`, `You`, `Receptionist`, `Waiter`, `Conductor`, and system labels `Notice` / `Sentence` / `Scene`. Any other name falls back to the narrator voice. Other people can be _mentioned_ (Tom, Peter) — they just can't speak.
- [ ] Learner lines (`speaker: "You"`) get `sayChoices` with 1–2 plausible wrong replies, each with a `whyWrong`. Use `answerIds` when two replies are both correct.
- [ ] Highlight the taught word with `marks` built via `markedText` (`src/lib/learning/marked-text.ts`). Add a role there if none fits.
- [ ] Give each beat its `sceneLineIds`. A later beat may replay an earlier line for context.
- [ ] Add a story setting in `src/lib/lesson-story/story-settings.ts`: `art` (one of `cafe`, `classroom`, `counter`, `home`, `market`, `plaza`, `registration`, `default`), an English `place`, and a Slovak `placeSk` written as a full phrase (`Na návšteve u Anny`, `V kaviarni`) — not a bare `U Anny`, which reads like a pub sign.

## 3. Write the beats

- [ ] Teach phrases: 2–3 per beat, each with a `note`. **Every teach phrase must also be in the lesson's `keyPhrases`** — only key phrases get audio clips.
- [ ] Optional `teach.note` (one or two sentences) and `teach.visual`. Paradigm tables use `form-table`: put long labels in rows, short forms in columns, so the table fits a phone. A beat can hold several visuals.
- [ ] Grammar labels in full, no abbreviations: “Masculine”, “Nominative”, “Singular”, with the Slovak term beside it (`mužský rod`, `nominatív`, `jednotné číslo`). Gender belongs to the word — say “masculine nouns for people”, never “men”.
- [ ] Exercises: prompts are the English target line or a direct question (see the content doc). No instructions wrapped around them.
- [ ] Exercises use only words the learner has already met: in a scene line, key term, or table of this beat or an earlier one. A lesson that teaches endings can test new forms of a word it showed (taška → tašku), not new words. Generated practice draws only from nouns and verbs the lesson shows. `src/lib/learning/vocabulary.test.ts` enforces both.
- [ ] Every exercise has `feedback.why` with key terms in `**double asterisks**` (a test enforces this).
- [ ] Every wrong choice has a `whyWrong` (a test enforces this). It explains only that pick — never repeat the `why`, which shows right next to it.
- [ ] Odd-one-out prompts contain “does not mean” and have exactly one trap; every fitting option still gets a `whyWrong` saying why it fits.
- [ ] Each graded exercise points at a practice item via `practiceItemId`.

## 4. Wire it in

- [ ] Lesson object: in `src/lib/catalog/lessons/{everyday,grammar,pronunciation}.ts`, or in `src/lib/learning/<topic>/lesson.ts` when the topic has generators. Fill `id`, `track`, `slug`, `title`, `promise`, `scene`, `keyPhrases`, `pattern`, `beats`, `referenceLinks`.
- [ ] Beat shells in `src/lib/catalog/lessons/beats/<topic>.ts`, exported from `beats/index.ts`.
- [ ] `referenceLinks` only to pages that exist (`/grammar/<slug>`, `/grammar/cases/<case>`, `/dictionary/<slug>`).
- [ ] Practice items: hand-written in `src/lib/catalog/practice/items-*.ts`, or generated (possessives pattern: `session.ts` materializes catalog stubs from seeded generators).
- [ ] Practice set in `src/lib/catalog/practice/sets.ts`. Generated sets add a `sessionKind`, wired through `src/lib/practice/session.ts` (seeded SSR session so hydration matches, fresh client session that keeps the painted first card).
- [ ] Motif art: `src/lib/lesson-story/lesson-motifs.ts` maps the lesson to a tile in `static/lessons/motifs/<id>.webp`. Every practice set needs a unique tile (a test enforces it); an unmapped lesson uses `default.webp`, which only one set can hold. New tile: follow [`lesson-motifs.md`](lesson-motifs.md) so it matches the set.
- [ ] Update the fixed counts in tests: `practiceSets` length in `src/lib/catalog/catalog.test.ts`, and `lessons` / `practice` in `src/lib/seo/sitemap.test.ts`.
- [ ] Changed anything a FOUC boot imports (e.g. `marked-text.ts`)? Run `bun run fouc:boot` and commit the generated file.

## 5. Check the Slovak

- [ ] Run the `slovak-language` skill's production pass over every Slovak string: agreement, case after each verb/preposition, `svoj` vs `jeho`, `s` → `so`, register (`ty`/`vy`), diacritics.
- [ ] Check anything unusual against a real source (Krátky slovník, Wiktionary tables, Slovak Wikipedia full-text search, TASR's jazykové okienko). Note what you checked in the PR.
- [ ] For generators: dump a sample of every kind across several seeds and read it, not just the tests.

## 6. Audio

- [ ] `bun scripts/audio/generate.ts -- --lessons-only --missing-only` — clips for every new spoken line (scene, key phrases, exercise contexts, and the other exercise text the generator collects).
- [ ] `bun scripts/audio/upload.ts` — puts them on R2. Without it, production plays nothing.
- [ ] A running dev server caches the audio index at startup: restart it to hear new clips.

## 7. Verify

- [ ] `bun run format`, `bun run lint`, `bun run typecheck`, `bunx vitest run`.
- [ ] Generators: tests across many seeds (no duplicate choices, one `{}` per cloze, answer tiles present, every distractor explained).
- [ ] `bun run index:search` so search finds the lesson.
- [ ] Production build check: the built lesson HTML carries `sceneAudioSrcs` / `keyPhraseAudioSrcs` URLs (an empty map means audio is broken).
- [ ] In the browser: every teach step and a pass through the checks, desktop and phone width, light and dark. Tables must not scroll sideways.
