# Level test: what it measures and where it falls short

The level test at `/level-test` uses computerized adaptive testing: an adaptive section, then interactive reading, listening, writing and speaking. This note records which task gives evidence for which part of Slovak, how much evidence a run collects, and the gaps still open. Results show every part, including the ones a run could not measure, so a gap in the test is visible instead of hidden. When you change the test, update the tables below.

Code: engine in `src/lib/level-test/`, content in `src/lib/catalog/level-test/`, bank build in `scripts/level-test/`, UI in `src/lib/components/level-test/`.

## Tasks and what they feed

| Task                       | Skill     | Parts of Slovak (`StudyArea`)                                                                                                   |
| -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Read and Select            | reading   | vocabulary                                                                                                                      |
| Listen and Select          | listening | vocabulary                                                                                                                      |
| Short or Long              | listening | hearing vowel length                                                                                                            |
| Fill in the Blanks         | reading   | the blanked word's class: noun cases, adjective agreement, pronouns, numbers, conjugation, function words, vocabulary; spelling |
| Choose the Verb            | reading   | aspect                                                                                                                          |
| Where Does It Go?          | reading   | word order (clitics in second position)                                                                                         |
| Read and Complete (C-test) | reading   | each gap's word class, as above; spelling                                                                                       |
| Listen and Type            | listening | every word of the sentence by its class, one observation per class per sentence; spelling                                       |
| Interactive Reading        | reading   | each drop-down gap's part: cases, agreement, conjugation, aspect, word order, function words or vocabulary                      |
| Interactive Listening      | listening | skill only                                                                                                                      |
| Writing tasks (AI)         | writing   | skill; every part the AI sees used (see below); named mistakes add study examples                                               |
| Read Aloud                 | speaking  | being understood (speech-recognition match)                                                                                     |
| Speaking tasks (AI)        | speaking  | skill; every part the AI sees used, accents aside; named mistakes as for writing                                                |

Writing and speaking are tracked without a task of their own: the scorer counts, for each part (noun endings, verb forms, aspect, adjective agreement, function words, word order, accents in writing, vocabulary), how often it came up in the learner's own words and how often it was right. Each scored answer adds one observation per part, at the level that answer was scored at, so a long essay does not outweigh the short tasks. Interactive Reading gaps carry their part in `reading.ts`; each set has one aspect gap and one word-order gap.

Word classes come from `tagWord` (`src/lib/catalog/level-test/word-tags.ts`) at build time: SNK and dictionary forms for nouns, adjectives and verbs, the pronoun tables, and fixed lists for function words and numbers. Spelling evidence counts only words whose letters were otherwise right, so a missing háček is not also counted as a grammar mistake.

## Evidence per run

Simulated with 200 runs per level (answers per part; a part needs 3 to be judged):

| Part                 | Quick test                     | Full test                                     |
| -------------------- | ------------------------------ | --------------------------------------------- |
| Vocabulary           | 24–26                          | 40–48                                         |
| Noun cases           | 14–19                          | 22–28                                         |
| Adjective agreement  | 3–6                            | 6–8                                           |
| Pronouns             | 4–6                            | 6–9                                           |
| Numbers              | 2–3, under 3 in 21–47% of runs | 3–5                                           |
| Conjugation          | 13–15                          | 19–22                                         |
| Function words       | 7–11                           | 11–16                                         |
| Spelling             | depends on answers             | depends on answers                            |
| Hearing vowel length | 12                             | 18                                            |
| Aspect               | 6                              | 9, plus 1 reading gap and one per scored text |
| Word order           | 6                              | 9, plus 1 reading gap and one per scored text |
| Being understood     | —                              | 3 (needs a microphone and speech recognition) |

Coverage is steered, not left to chance: Fill in the Blanks picks the word class furthest below five answers among items within 12 points of the learner's level (`pickFillBlank`), with three per round.

## Known gaps

Ordered by how much they limit the results.

1. **Item difficulty is predicted, not calibrated.** Difficulties come from word frequency, sentence length and the level a text was written for. Calibrating items on real test responses requires collecting response data first.
2. **Aspect and word order items sit on their level's anchor.** Choose the Verb and Where Does It Go take their difficulty from the level they were written for, so items within a level do not differ. Choose the Verb offers two verbs, so a guess is right half the time; three sentences a screen make up for it. Word order covers clitics only: the order of the other words is free in Slovak and has no single right answer.
3. **The AI's counts are not checked.** How often a part came up in writing or speech is the scorer's own count. A test set of answers counted by hand would show how far to trust it.
4. **Numbers are thin in the quick test.** Fewer than three answers in up to half of quick runs. More number items, or a short number dictation, would fix it.
5. **Pronunciation is measured only as being understood.** Read Aloud compares a speech-recognition transcript with the sentence; recognition repairs accents and length, so it cannot judge them. Phoneme-level scoring needs a pronunciation service that supports Slovak (not yet checked).
6. **Short or Long covers vowel length only.** Soft consonants (ď, ť, ň, ľ against d, t, n, l) are not tested. Its difficulty is a fixed A2 base nudged by word rarity, not calibrated. Clips are kept only when speech-to-text heard them exactly, which drops about a third of TTS clips; some of those may be speech-recognition bias toward the commoner form rather than a bad clip.
7. **Formal and informal address (ty / vy) is not tested.** Interactive Listening uses both registers but scores the reply, not the register.
8. **Writing and speaking need keys.** Without `OPENROUTER_API_KEY` and `ELEVENLABS_API_KEY` those skills show as planned. Interactive Speaking is always planned.
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

## Methodology and prior art

The adaptive engine and assessment architecture adapt ideas from computer-adaptive language testing and open computational linguistics research, primarily Burr Settles, Geoffrey T. LaFlair, and Masato Hagiwara (2020), _"Machine Learning–Driven Language Assessment"_, _Transactions of the Association for Computational Linguistics_ (TACL), 8, 247–263 (the foundational paper behind the Duolingo English Test).

### Adopted from Settles et al. (2020)

- **Cold-start difficulty estimation:** Predicting item difficulty directly from corpus metrics (geometric mean of written SNK ranks and spoken OpenSubtitles ranks, plus text length and CEFR target) to avoid needing thousands of calibration respondents before launch.
- **Character n-gram pseudowords:** Training a 4-gram character Markov model (`scripts/level-test/char-model.ts`) over lemmatized Slovak to generate plausible non-words for lexical decision tasks (_Read and Select_, _Listen and Select_), filtered against every attested inflected form.
- **0–100 CEFR anchor scale:** Using fixed scale anchors (`A1 = 0`, `A2 = 20`, `B1 = 40`, `B2 = 60`, `C1 = 80`, `C2 = 100`) mapped to a 10-points-per-logit Rasch/IRT update curve.
- **Integrated subscores:** Aggregating four cross-skill components: Literacy (reading + writing), Comprehension (reading + listening), Conversation (listening + speaking), and Production (writing + speaking).

### Intentional divergences for Slovak

- **Slovak-specific task constructs:** English tests do not assess grammatical aspect, phonemic vowel length, or second-position clitic placement. Three dedicated formats were added:
  - _Short or Long_ (`listenLength`): discriminating vowel length minimal pairs (_mala_ vs _malá_).
  - _Choose the Verb_ (`chooseVerb`): imperfective vs perfective aspect choice in context (_písal_ vs _napísal_).
  - _Where Does It Go?_ (`placeClitic`): ordering enclitics (_som_, _sa_, _si_, _ho_, _mu_) in second position (Wackernagel's law).
- **Diacritic leniency (`ACCENT_ONLY_CREDIT = 0.5`):** Standard commercial tests mark missing diacritics entirely wrong. Because non-native learners often take the test on US/QWERTY keyboards without accessible Slovak layout keys (`ô`, `ľ`, `ď`), responses where only diacritics are missing receive partial credit so keyboard friction is not counted as a grammatical or lexical failure.
- **Adjusted typing time limits:** Typing screens allow ~30% more time than English equivalents to account for diacritic selection overhead and non-native typing on inflected word endings.
- **Classical C-test format:** The damaged-text task follows Klein-Braley & Raatz (1981) rule sets (preserving opening and closing sentences and proper names, damaging the second half of every second word) rather than arbitrary passage masking.
