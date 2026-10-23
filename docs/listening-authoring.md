# Writing a listening episode

A listening episode is a short podcast in simple Slovak for one grammar topic: two or three roster voices, a few chapters, a handful of questions. Copy tone and feedback wording live in [`lessons-practice-content.md`](lessons-practice-content.md); Slovak accuracy is the `slovak-language` skill. Reference implementation: `src/lib/catalog/listening/episodes/demonstratives.ts`.

## 1. Plan

- [ ] One grammar page (`grammarSlug`), one promise sentence, level `A1–A2`.
- [ ] Name it like a story, after a line the learner will hear: `titleSk: "Kde je ten kľúč?"`, with the English gloss in `title`. The grammar label goes in `topic` (`"ten, tá, to"`), lowercase because it is read in the first sentence: "A 4-minute episode on ten, tá, to."
- [ ] 4–6 chapters of 4–14 lines. Each chapter is one situation (an intro, a game, a shop, a quiz, an outro) and brings in its own nouns, so the target forms turn up in different company.
- [ ] Cover every form the grammar page's tables show, the other cases too, not only the nominative.
- [ ] Give the chapters a thread: something from an early chapter comes back later. The car key from the bag game goes missing at home, and again in the last line.
- [ ] Keep the Slovak inside the level: present tense, high-frequency nouns, fixed chunks. Repetition is a feature: a learner should hear the taught forms many times.
- [ ] Speakers come from the roster in `content/audio/config.json` (`speakers`): `Anna`, `Marek`, `Lucia`, `Mária`, `Waiter`, `Receptionist`. List them in the episode's `speakers`; any other label falls back to the narrator voice and fails the speaker test.

## 2. Write the script

- [ ] It must read like a show: a hello, a reason to talk, banter, a goodbye. Read it aloud.
- [ ] Mark the taught word with `{ demonstrative: "ten" }` so the transcript lights it up after listening. Add a role in `marked-text.ts` when a new topic needs one, then run `bun run fouc:boot`.
- [ ] When a host says something wrong on purpose (a quiz), say so in the English gloss, so the transcript never teaches the wrong form.
- [ ] Ids start with `podcast-<slug>-` and say what they hold: `podcast-demonstratives-marek-car-key`. `validateListeningEpisodes` checks prefixes and uniqueness.
- [ ] `vocabulary`: 4–6 words to listen for, Slovak and English only. They show as tap-to-hear chips above the player, read by the guide voice; grammar notes belong on the grammar page.

## 3. Write the checks

- [ ] 1–3 per chapter, asked after the chapter has played, with the transcript still hidden. Ask about what was said, not about grammar labels: who it is for, which one he takes, which word she said.
- [ ] `replayLineId` points at the line the answer comes from, in the same chapter; the learner can replay it, audio only.
- [ ] `gap` with a `___` turns a check into "which word did you hear": `___ kľúč je od auta.`
- [ ] `prompt` is a short, plain Slovak question (`Pre koho je jablko?`) and `promptEnglish` its English, shown under it. Choices are Slovak and read as answers to the question on their own: `Ten lacnejší, za tri eurá.`, not a bare `Tamten.` that only works at the stall.
- [ ] Every wrong choice has a `whyWrong` that first says what the choice means (`**Pre poslucháčov** means for the listeners.`), then what was said instead. No filler like "Nice idea, but". `feedback.why` names the rule or quotes the line in `**bold**`; `feedback.english` glosses that line.

## 4. Wire it in

- [ ] Add the episode to `listeningEpisodes` in `src/lib/catalog/listening/index.ts`.
- [ ] `bun scripts/audio/generate.ts -- --lessons-only --missing-only`, then `bun scripts/audio/upload.ts -- --lessons-only`. Commit `content/audio/manifest.json` and `runtime-index.json`.
- [ ] Update the `listening` count in `src/lib/seo/sitemap.test.ts`.
- [ ] `bun run format`, `bun run lint`, `bun run typecheck`, `bunx vitest run`, `bun run index:search`.
- [ ] In the browser: play a chapter through, answer the questions, read the text, go to the next chapter, try Slower and Show text. Phone width and dark mode.
