# Lessons + practice content

Authoring rules for learner-facing lesson and practice copy. Linguistic accuracy → **Slovak language skill** (`slovak-language`) first. UI layout and chrome live in the components — not here.

**Source:** `src/lib/content/lessons.ts`, `src/lib/content/practice.ts`. **Types:** `src/lib/content/learning-types.ts`. **UI:** `PracticePlayer`, `LessonInteraction`, `PracticeDialogueBubble`, `PracticeExerciseFeedback`.

**Tone:** like Babbel/Lingvist — show the line, say what to produce, explain on miss. Not tutorial voice, not gamified labels.

## Prompts (what the learner sees as the main task)

Write the **target English line** or a **direct question**. Do not wrap it in instructions.

| Avoid                                                   | Prefer                                      |
| ------------------------------------------------------- | ------------------------------------------- |
| `Write: “I am from Canada.”`                            | `I am from Canada.`                         |
| `Build: “We are meeting on Tuesday.”`                   | `We are meeting on Tuesday.`                |
| `The passer-by has helped you. Write: …`                | `Thank you for the help.`                   |
| `Anna asks when you can meet at 3:00. What do you say?` | `At three o'clock.`                         |
| `You are twenty-eight. What do you say?`                | `I am twenty-eight years old.`              |
| `Someone says Teší ma. Which reply means …`             | `Which reply means “Nice to meet you too”?` |

- **Choice / clock:** question or English target; choices stay Slovak.
- **Build:** English sentence to assemble (not `Build the polite question:`).
- **Cloze / gap:** short mechanical hint (`Fill the gap for Peter.`) — not roleplay.
- **Repair:** `Repair this sentence.` — broken line lives in `context`, not the prompt.
- **Personal (`type: "personal"`):** one clear speak-aloud task; optional `example` in Slovak.

## Dialogue context (`context` on an exercise)

When someone else spoke first:

1. Put their line in `context` — Slovak + `english` in the bubble UI.
2. Put **your** task in `prompt` (English line to produce).
3. Order in UI: **context bubble → prompt → input/choices** (no “Your turn” divider).

`speaker` is for audio roster / `characterIdForSpeaker` (e.g. `Anna`, `You`, `Marta`). Do not use role labels learners will see (`A passer-by`, `Clerk`, `Sentence`). Practice bubbles **do not show** speaker names; lesson **scene** table uses muted speaker column for multi-line scripts only.

## Feedback (`feedback` on exercise + practice item)

- **Correct:** skip repeating the answer when choices already show it; always include `why`.
- **Wrong:** UI shows “Correct answer” + correction — do not add `That works.` / `Try this.` in content.
- `english` on feedback = gloss of the correction; `why` = one short teaching line.
- In `why`, wrap Slovak patterns or key terms in `**double asterisks**` so the UI can emphasize them (e.g. `Use **o** + the ordinal time form: **o tretej**.`).
- On a miss, `why` teaches the correct pattern; optional `whyWrong` on a choice explains the learner’s specific wrong pick when base `why` does not (common for select-all traps). Do not repeat the same point in both.

Reuse `PracticeExerciseFeedback.svelte` for any new exercise UI — do not invent new status labels.

## After content changes

- New/changed lesson or practice text: `bun run index:search` (Pagefind includes these routes).
- New lesson dialogue: `bun scripts/audio/generate.ts -- --lessons-only` when audio should ship.
