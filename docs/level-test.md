# Level test: what it measures and where it falls short

The level test at `/level-test` follows the Duolingo English Test (Settles et al. 2020): an adaptive section, then interactive reading, listening, writing and speaking. This note records which task gives evidence for which part of Slovak, how much evidence a run collects, and the gaps still open. Results show every part, including the ones a run could not measure, so a gap in the test is visible instead of hidden. When you change the test, update the tables below.

Code: engine in `src/lib/level-test/`, content in `src/lib/catalog/level-test/`, bank build in `scripts/level-test/`, UI in `src/lib/components/level-test/`.

## Tasks and what they feed

| Task                       | Skill     | Parts of Slovak (`StudyArea`)                                                                                                   |
| -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Read and Select            | reading   | vocabulary                                                                                                                      |
| Listen and Select          | listening | vocabulary                                                                                                                      |
| Short or Long              | listening | hearing vowel length                                                                                                            |
| Fill in the Blanks         | reading   | the blanked word's class: noun cases, adjective agreement, pronouns, numbers, conjugation, function words, vocabulary; spelling |
| Read and Complete (C-test) | reading   | each gap's word class, as above; spelling                                                                                       |
| Listen and Type            | listening | every word of the sentence by its class, one observation per class per sentence; spelling                                       |
| Interactive Reading        | reading   | skill only                                                                                                                      |
| Interactive Listening      | listening | skill only                                                                                                                      |
| Writing tasks (AI)         | writing   | skill; the AI's named mistakes add study examples and can flag aspect or word order                                             |
| Read Aloud                 | speaking  | being understood (speech-recognition match)                                                                                     |
| Speaking tasks (AI)        | speaking  | skill; named mistakes as for writing                                                                                            |

Word classes come from `tagWord` (`src/lib/catalog/level-test/word-tags.ts`) at build time: SNK and dictionary forms for nouns, adjectives and verbs, the pronoun tables, and fixed lists for function words and numbers. Spelling evidence counts only words whose letters were otherwise right, so a missing háček is not also counted as a grammar mistake.

## Evidence per run

Simulated with 200 runs per level (answers per part; a part needs 3 to be judged):

| Part                 | Quick test                     | Full test                                           |
| -------------------- | ------------------------------ | --------------------------------------------------- |
| Vocabulary           | 24–26                          | 40–48                                               |
| Noun cases           | 14–19                          | 22–28                                               |
| Adjective agreement  | 3–6                            | 6–8                                                 |
| Pronouns             | 4–6                            | 6–9                                                 |
| Numbers              | 2–3, under 3 in 21–47% of runs | 3–5                                                 |
| Conjugation          | 13–15                          | 19–22                                               |
| Function words       | 7–11                           | 11–16                                               |
| Spelling             | depends on answers             | depends on answers                                  |
| Hearing vowel length | 12                             | 18                                                  |
| Being understood     | —                              | 3 (needs a microphone and speech recognition)       |
| Aspect, word order   | —                              | only from AI-named mistakes in writing and speaking |

Coverage is steered, not left to chance: Fill in the Blanks picks the word class furthest below five answers among items within 12 points of the learner's level (`pickFillBlank`), with three per round.

## Known gaps

Ordered by how much they limit the results.

1. **Aspect has no task.** Only the AI's notes on writing and speaking reach it. Proposal: "Choose the verb", a sentence with a gap and an aspect pair (`Každý deň ___ domácu úlohu.` → robil / urobil), about 30 items from A2 to C1.
2. **Word order has no task.** Proposal: "Where does it go?", clicking the slot for a clitic (sa, si, som, by, ho, mu). Slovak word order is free, but clitics take the second position, so one answer is right.
3. **Item difficulty is predicted, not calibrated.** Difficulties come from word frequency, sentence length and the level a text was written for. The DET calibrated items on real responses; this test needs anonymous response data first.
4. **Numbers are thin in the quick test.** Fewer than three answers in up to half of quick runs. More number items, or a short number dictation, would fix it.
5. **Pronunciation is measured only as being understood.** Read Aloud compares a speech-recognition transcript with the sentence; recognition repairs accents and length, so it cannot judge them. Phoneme-level scoring needs a pronunciation service that supports Slovak (not yet checked).
6. **Short or Long covers vowel length only.** Soft consonants (ď, ť, ň, ľ against d, t, n, l) are not tested. Its difficulty is a fixed A2 base nudged by word rarity, not calibrated. Clips are kept only when speech-to-text heard them exactly, which drops about a third of TTS clips; some of those may be speech-recognition bias toward the commoner form rather than a bad clip.
7. **Formal and informal address (ty / vy) is not tested.** Interactive Listening uses both registers but scores the reply, not the register.
8. **Writing and speaking need keys.** Without `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY` those skills show as planned. Interactive Speaking is always planned.
9. **Retake variety is per device.** Items seen before are stored in `localStorage` and picked last; another browser starts fresh.

## Rebuilding the bank

`scripts/level-test/build-bank.ts` writes `content/level-test/items.json`. After a dictionary change or new passages, loop until nothing new is generated:

```sh
bun scripts/level-test/build-bank.ts
bun scripts/audio/generate.ts -- --level-test-only --missing-only
bun scripts/level-test/check-spoken.ts   # pseudowords heard as real words drop out
bun scripts/level-test/check-length.ts   # unclear Short or Long clips drop their pair
```

Then `bun scripts/audio/upload.ts` and `bunx vitest run src/lib/catalog/level-test`.
