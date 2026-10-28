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

Each writing and speaking prompt carries a level (A2 to C1, in `prompts.ts`), and a run gets the prompts nearest the learner's estimate, so a beginner is not asked about artificial intelligence. Writing and speaking are tracked without a task of their own: the scorer counts, for each part (noun endings, verb forms, aspect, adjective agreement, function words, word order, accents in writing, vocabulary), how often it came up in the learner's own words and how often it was right. Each scored answer adds one observation per part, so a long essay does not outweigh the short tasks. The observation sits about 17 points below the level the answer was scored at, so a writer who gets 85% of a part right reads as at level, not ahead of it. Interactive Reading gaps carry their part in `reading.ts`; each set has one aspect gap and one word-order gap.

Word classes come from `tagWord` (`src/lib/catalog/level-test/word-tags.ts`) at build time: SNK and dictionary forms for nouns, adjectives and verbs, the pronoun tables, and fixed lists for function words and numbers. Spelling evidence counts only words whose letters were otherwise right, so a missing háček is not also counted as a grammar mistake, and only the letters the learner typed: an accent in the printed half of a gap is not evidence. An i/y slip in a gap counts under spelling only.

## Evidence per run

Simulated with 200 runs per level (answers per part; a part needs 3 to be judged). A part is a strength or a gap only when it differs from the overall level by at least 5 points and by 1.2 times its own uncertainty, and a gap also needs two misses, so one slip is not a gap.

| Part                 | Quick test                         | Full test                                     |
| -------------------- | ---------------------------------- | --------------------------------------------- |
| Vocabulary           | 24–26                              | 40–48                                         |
| Noun cases           | 14–19                              | 22–28                                         |
| Adjective agreement  | 3–6                                | 6–8                                           |
| Pronouns             | 4–6                                | 6–9                                           |
| Numbers              | 3–4, under 3 in at most 1% of runs | 3–6                                           |
| Conjugation          | 13–15                              | 19–22                                         |
| Function words       | 7–11                               | 11–16                                         |
| Spelling             | depends on answers                 | depends on answers                            |
| Hearing vowel length | 12                                 | 18                                            |
| Aspect               | 6                                  | 9, plus 1 reading gap and one per scored text |
| Word order           | 6                                  | 9, plus 1 reading gap and one per scored text |
| Being understood     | —                                  | 3 (needs a microphone and speech recognition) |

Coverage is steered, not left to chance: Fill in the Blanks picks the word class furthest below five answers among items within 12 points of the learner's level (`pickFillBlank`), with three per round. It serves the parts the C-test and dictation rarely supply first (numbers, then adjectives and pronouns), since those come later in each round and bring plenty of nouns, verbs and function words.

## Known gaps

Ordered by how much they limit the results.

1. **Item difficulty is predicted, not calibrated.** Difficulties come from word frequency, sentence length and the level a text was written for. Calibrating items on real test responses requires collecting response data first.
2. **Aspect and word order items sit on their level's anchor.** Choose the Verb and Where Does It Go take their difficulty from the level they were written for, so items within a level do not differ. Choose the Verb offers two verbs, so a guess is right half the time; three sentences a screen make up for it. Word order covers clitics only: the order of the other words is free in Slovak and has no single right answer.
3. **The AI's counts are checked only on planted errors.** How often a part came up in writing or speech is the scorer's own count. The [scorer eval](../scripts/level-test/eval/README.md) checks the wrong counts, the named mistakes and the rule cases against errors put into correct answers on purpose. The right counts, and the level of a real learner's answer, still need answers rated by hand.
4. **Pronunciation is measured only as being understood.** Read Aloud compares a speech-recognition transcript with the sentence; recognition repairs accents and length, so it cannot judge them. Phoneme-level scoring needs a pronunciation service that supports Slovak (not yet checked).
5. **Short or Long covers vowel length only.** Soft consonants (ď, ť, ň, ľ against d, t, n, l) are not tested. Its difficulty is a judgement, not calibrated: where the length sits and which vowel (A2 for the stressed first syllable, B1 for a/á later in the word, B2 or C1 for e/é and i/í, y/ý in a late syllable, C1 in longer words). Adverb/adjective pairs (pekne/pekné) are capped at 15, so one contrast does not fill the format, and each band holds 20 pairs, so every level has clips near it. `--add-lengths` refills the pairs from the SNK and leaves the rest of the bank alone. Short or Long is still about half of the quick test's listening answers, so a few misses weigh a lot until real answers can calibrate it. A pair is kept only when its long clip has at least 50 ms more speech than its short one (`check-length.ts` times both with ffmpeg). Speech-to-text used to decide this, but on one isolated word it favours the commoner form (pary heard as pár, vina as vína) and rejected most first-syllable pairs whose long vowel was plainly longer, so its verdict now counts only until a pair is timed. Timing shows the vowel was lengthened, not that a learner hears it as long.
6. **Formal and informal address (ty / vy) is not tested.** Interactive Listening uses both registers but scores the reply, not the register.
7. **Writing and speaking need keys.** Without `OPENROUTER_API_KEY` and `ELEVENLABS_API_KEY` those skills show as planned. Interactive Speaking is always planned.
8. **Retake variety is per device.** Items seen before are stored in `localStorage` and picked last; another browser starts fresh.

## Rebuilding the bank

`scripts/level-test/build-bank.ts` writes `content/level-test/items.json`. After a dictionary change or new passages, loop until nothing new is generated:

```sh
bun scripts/level-test/build-bank.ts
bun scripts/audio/generate.ts -- --level-test-only --missing-only
bun scripts/level-test/check-spoken.ts   # pseudowords heard as real words drop out
bun scripts/level-test/check-length.ts   # Short or Long pairs under 50 ms apart drop out
```

Then `bun scripts/audio/upload.ts` and `bunx vitest run src/lib/catalog/level-test`.

To re-rate the pseudowords already in the bank without drawing new ones (no SNK download, no new audio), run `bun scripts/level-test/build-bank.ts --rescore-pseudowords`. `--rescore-lengths` does the same for the Short or Long pairs and drops -ne/-né pairs over the cap.

## Methodology and prior art

The adaptive engine and assessment architecture adapt ideas from computer-adaptive language testing and open computational linguistics research, primarily Burr Settles, Geoffrey T. LaFlair, and Masato Hagiwara (2020), _"Machine Learning–Driven Language Assessment"_, _Transactions of the Association for Computational Linguistics_ (TACL), 8, 247–263 (the foundational paper behind the Duolingo English Test).

### Adopted from Settles et al. (2020)

- **Cold-start difficulty estimation:** Predicting item difficulty directly from corpus metrics (geometric mean of written SNK ranks and spoken OpenSubtitles ranks, plus text length and CEFR target) to avoid needing thousands of calibration respondents before launch.
- **Character n-gram pseudowords:** Training a 4-gram character Markov model (`scripts/level-test/char-model.ts`) over lemmatized Slovak to generate plausible non-words for lexical decision tasks (_Read and Select_, _Listen and Select_), filtered against every attested inflected form. A pseudoword's difficulty is its rank by the same model's score, most Slovak-looking hardest, mapped onto the real-word difficulty range.
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
