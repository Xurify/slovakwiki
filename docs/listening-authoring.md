# Writing a listening episode

A listening episode is a short podcast in simple Slovak for one grammar topic: two or three roster voices, a few chapters, a handful of questions. Copy tone and feedback wording live in [`lessons-practice-content.md`](lessons-practice-content.md); Slovak accuracy is the `slovak-language` skill. Reference implementation: `src/lib/catalog/listening/episodes/demonstratives.ts`.

## 1. Plan

- [ ] One grammar page (`grammarSlug`), one promise sentence, level `A1–A2`.
- [ ] 4–6 chapters of 4–14 lines. Each chapter is one situation (an intro, a game, a shop, a quiz, an outro) and brings in its own nouns, so the target forms turn up in different company.
- [ ] Keep the Slovak inside the level: present tense, high-frequency nouns, fixed chunks. Repetition is a feature: a learner should hear the taught forms many times.
- [ ] Hosts come from the roster in `content/audio/config.json` (`speakers`): `Anna`, `Marek`, `Lucia`, `Mária`, `Waiter`, `Receptionist`. Any other label falls back to the narrator voice and fails the speaker test.

## 2. Write the script

- [ ] It must read like a show: a hello, a reason to talk, banter, a goodbye. Read it aloud.
- [ ] Mark the taught word with `{ d: "ten" }` parts (the `demonstrative` role) so the transcript lights it up after listening. Add a role in `marked-text.ts` when a new topic needs one, then run `bun run fouc:boot`.
- [ ] When a host says something wrong on purpose (a quiz), say so in the English gloss, so the transcript never teaches the wrong form.
- [ ] Ids start with `podcast-<slug>-` and say what they hold: `podcast-demonstratives-marek-car-key`. `validateListeningEpisodes` checks prefixes and uniqueness.
- [ ] `vocabulary`: 4–6 words to listen for, each with a one-line `note` in `**bold**`. The guide voice reads them.

## 3. Write the checks

- [ ] 1–3 per chapter, asked after the chapter has played, with the transcript still hidden. Ask about what was said, not about grammar labels: who it is for, which one he takes, which word she said.
- [ ] `replayLineId` points at the line the answer comes from; the learner can replay it, audio only.
- [ ] `promptSk` with a `___` gap turns a check into "which word did you hear": `___ kľúč je od auta.`
- [ ] Prompts are a direct English question; choices are Slovak. Every wrong choice has a `whyWrong`; `feedback.why` names the rule or quotes the line in `**bold**`; `feedback.english` glosses that line.

## 4. Wire it in

- [ ] Add the episode to `listeningEpisodes` in `src/lib/catalog/listening/index.ts`.
- [ ] `bun scripts/audio/generate.ts -- --lessons-only --missing-only`, then `bun scripts/audio/upload.ts -- --lessons-only`. Commit `content/audio/manifest.json` and `runtime-index.json`.
- [ ] Update the `listening` count in `src/lib/seo/sitemap.test.ts`.
- [ ] `bun run format`, `bun run lint`, `bun run typecheck`, `bunx vitest run`, `bun run index:search`.
- [ ] In the browser: play a chapter through, answer the questions, open the transcript, try Slow and the keyboard (space, arrows). Phone width and dark mode.
