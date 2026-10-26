# Scorer eval

Which model should score the level test's writing and speaking? This eval sends the same answers to each candidate through OpenRouter, the way `/api/level-test/score` does, and checks the replies against results that are known in advance. No human rater is needed for most of it.

## How the right answers are known

- **Clean answers** (`bases.ts`): 26 correct answers to real test prompts, one per task and level (A1 to C1), writing and speaking. A good scorer lists no mistakes in them.
- **The same answers with errors**: each base has 3 to 6 mutations. A mutation swaps `from` for `to` and is one unambiguous error of one topic. The builder makes a case with the first error, the first three, and all of them, so it knows exactly which errors are where.
- **Spoken answers as a transcript**: the clean spoken answers again, lower case and without punctuation. The score should hardly move.
- **Wrong photo**: a correct photo description sent with a different photo. Content should score low.
- **Rule cases** (`adversarial.ts`): Czech, English, the prompt copied back, off topic, repetition, one word, one sentence, and two prompt injections. The scoring prompt says what each must score.

Bases are split by id into `dev` (every third) and `test`. Tune `SYSTEM_PROMPT` on `dev` only; quote `test`.

## What it cannot tell

Whether a clean B1 answer really is B1. The answers were written at a level by length, vocabulary and structure, so the level rows are marked _indicative_. Your own test runs are the only real learner data: add them to `bases.ts` with `source: "own"` and your real level.

The spoken cases are text, not audio. They do not test what Scribe does to a learner's mistakes.

## 1. Review the set with another model first

**Claude wrote every answer and every error in this set.** Claude models are also candidates, so a Claude mistake in the set would favour them: a Claude scorer would share the blind spot. Before you trust any result, have at least one model from another family review the set, ideally two (for example a GPT and a Gemini model).

```sh
bun scripts/level-test/eval.ts -- review
```

This writes the full prompt, with all the data, to `tmp/level-test-eval/review-prompt.md`. Paste the whole file into the other model's chat. Save its JSON reply as `content/level-test/eval-reviews/<model>.json`.

Or let the script send it through OpenRouter and save the reply itself:

```sh
bun scripts/level-test/eval.ts -- review --model <openrouter slug>
```

Then list what the reviewers flagged:

```sh
bun scripts/level-test/eval.ts -- check
```

Fix or drop each flagged answer or error in `bases.ts`, run `bun run test` (it fails on any error that no longer fits its answer), and review again. Where a reviewer and Claude disagree on Slovak, check KSSJ or the SNK (see the `slovak-language` skill) rather than taking either side. Reviewers get things wrong too: one review of this set called _ovocie_ a mistake and offered the Czech _ovoce_ as the fix, and quoted sentences that are not in the set.

`check --snk` also looks up every word of the clean answers in the SNK form lists (downloaded once to `tmp/snk/`) and warns when an accent error is a common word in its own right.

The report splits results by who wrote the answers. If a model does much better on one author's answers than another's, that points at bias in the set.

## 2. Run the models

Needs `OPENROUTER_API_KEY` in `.env`. Check each slug on openrouter.ai/models first.

```sh
bun scripts/level-test/eval.ts -- run --models anthropic/claude-opus-5-5,openai/<slug>,google/<slug> --split dev
bun scripts/level-test/eval.ts -- run --models anthropic/claude-opus-5-5,openai/<slug>,google/<slug>
```

- `--repeats 3` (default): each case is scored three times, for the stability rows.
- `--split test` (default), `dev` or `all`.
- `--only <id,id>`: just these bases or cases.
- `--concurrency 4` (default).

Results are appended to `tmp/level-test-eval/results/<model>.jsonl`. A stopped run picks up where it left off; failed calls are retried on the next run.

The test split is about 85 cases, so about 255 calls per model. At Opus 5.5 prices that is roughly $9 per model; the report shows the real cost when OpenRouter sends it.

## 3. Read the report

```sh
bun scripts/level-test/eval.ts -- report
```

It prints a table, one column per model, and writes `tmp/level-test-eval/report.md`. The pass marks are in `THRESHOLDS` in `metrics.ts` and were set before any model was run.

| Row                              | Pass mark                        | What it means                                                         |
| -------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| Usable replies                   | ≥ 0.98                           | Valid JSON in the schema, not refused                                 |
| False corrections                | ≤ 0.02                           | Share of clean answers with any listed mistake                        |
| Recall of known errors           | ≥ 0.8                            | Errors found, out of what four listed issues can hold                 |
| Recall per topic                 | ≥ 0.8 (aspect, word order ≥ 0.7) | From cases with at most four errors                                   |
| Right topic                      | ≥ 0.8                            | Found errors filed under the right topic                              |
| Correction restores the original | ≥ 0.9                            | The `correct` text puts back what the error replaced                  |
| Czech in corrections             | 0                                | ř, ě, ů or a Czech form in a correction or in the feedback's bold fix |
| Usage counts catch known errors  | ≥ 0.8                            | `usage.wrong` covers the errors put in                                |
| More errors, higher grammar      | ≤ 0.05                           | The grammar score should fall as errors are added                     |
| Rule cases                       | 1                                | Each rule case within its expected score                              |
| Wrong photo noticed              | 1                                | Content ≤ 20                                                          |
| C1 answers score high            | 1                                | Clean C1 answers ≥ 60                                                 |
| Score SD over repeats            | ≤ 4                              | Same answer, same score                                               |
| Transcript vs clean shift        | ≤ 5                              | Missing punctuation in speech is not penalised                        |
| Level as written (±1)            | ≥ 0.6 (≥ 0.95)                   | Indicative only                                                       |

**Misses** lists each failed case with what came back, including every false correction. Read those before blaming the model: a "false correction" can be a real mistake in the set, and then the set needs fixing.

## Adding answers

Each base needs the prompt it answers (`promptId`, `photo` or `listening`), a target level, `seconds` for spoken tasks, and mutations whose `from` occurs once in the full answer. When a careful marker could file an error under a second topic (a perfective read as future tense is also a verb-form error), list it in `alsoTopics`. For a photo answer, look at the photo first and describe only what is there. `bun run test` checks the rest.
