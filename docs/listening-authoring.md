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
- [ ] Give the listener time where a person would take it: a beat between two clues, before a quiz sentence, between a verdict and its reason. Put `PAUSE` in the line's parts; the text skips it and the clip says `[pause]` there. Eleven v4 makes a pause only inside a line (about a second); at its start or end it makes next to none. When someone has to think before they answer, as in a guessing game, let them say so: `"Hm… ", PAUSE, …`, or say the clues back: `"Žlté a ťažké… ", PAUSE, …`.
- [ ] A segment that moves to another place says so before it goes and when it gets there: the last line of the one before is `Poďme na trh!`, the first line of the next is `Teraz sme na trhu.` The stage fades in on the new place and its sound, the break's sting plays, and the first line waits a moment, but only words tell the listener where they are.
- [ ] A guessing game is played the way people play it: a wrong guess first (`Zelené a sladké… hruška?`), a second clue in answer (`Nie, hruška nie. Je to okrúhle.`), and a glad word when the guess is right (`Správne!`, `Presne tak!`, `Výborne!`), not a flat `Áno`. The guesser asks for the next thing (`A druhá vec?`); she cannot point at what is still in the bag.
- [ ] Where the listener is asked to decide, as in a quiz, say so (`Hádajte s nami!`) and give them time: wrap the answer in `afterThinking(line(…))`, and the player waits two seconds before it. A pause at the start of a clip would make next to none. A line's feeling fits its moment: a `SIGH` before `Marek!` when he has lost the keys again. Listen back to every directed line.
- [ ] A clue has the shape a person gives it, one part per breath, with a `PAUSE` between the parts: `Je to žlté… je to ťažké… a vnútri je papier.` Where the text trails off, put `STOP` (`…` in the text, a full stop in the clip): Eleven reads an ellipsis as trailing off, and a line directed `[slowly]` came out as a drawn-out whisper. Do not direct a line slowly; the pauses set the pace.
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

## Slips we shipped

Each of these went out in the first episode and had to be fixed. Read a script against them before the first clip. The parts a line is made of (`PAUSE`, `SIGH`, `STOP`, `afterThinking`, `guess`) live in `src/lib/catalog/listening/dialogue.ts`.

- **The guess comes at once.** Anna named the key the instant Marek gave the clue. Give the guesser a `Hm…` and a `PAUSE`, or the clues said back.
- **Pointing at what cannot be seen.** `A čo je toto?` about a thing still in the bag. Ask for the next thing: `A druhá vec?`
- **Nobody ever guesses wrong, and a right guess gets a flat `Áno`.** A wrong guess first, a second clue in answer, and a glad word: `Správne!`, `Presne tak!`, `Výborne!`
- **An exchange that contradicts itself.** `Kde je ten kľúč? — Tento alebo tamten? — … Je v taške.` Read it as a scene: who can see what, who holds what.
- **A cut with nothing said.** Studio to market with no line about going. The last line before a change of place says where they go, the first after it where they are.
- **A quiz with no time to think.** Invite the listener (`Hádajte s nami!`) and wrap each verdict in `afterThinking(line(…))`.
- **A line that replies to the wrong person.** `Syr. Dobrý deň!` answered Anna, so Marek waved at her and not at the stallholder. Set `to` when a line turns to someone else.
- **Directed slowly, or trailing off on an ellipsis.** A drawn-out whisper. `STOP` and `PAUSE`, never `[slowly]`.
- **A feeling that does not fit.** `Marek!` said flat when he has lost the keys again. A `SIGH` before it. Say how every directed line should feel, and listen back.
- **A pause at the start of a clip.** It makes next to none; the player waits instead (`wait` on the line).
- **The mouth on the wrong word.** The vowel track was aligned on the line without its pauses. `bun scripts/audio/lipsync.ts -- --only "…"` scores a clip; under 80% is wrong.
