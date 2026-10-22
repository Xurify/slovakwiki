# Lessons + practice content

Authoring rules for learner-facing lesson and practice copy. Linguistic accuracy → **Slovak language skill** (`slovak-language`) first. UI layout and chrome live in the components — not here.

**Source:** `src/lib/catalog/lessons/`, `src/lib/catalog/practice/`. **Types:** `$lib/learning/types`. **UI:** `PracticePlayer`, `LessonInteraction`, `PracticeDialogueBubble`, `PracticeExerciseFeedback`.

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
3. Order in UI: **context bubble(s) → You label → prompt → input/choices**. Named speakers (`Anna`, `You`, …) show as a muted eyebrow on the bubble. System labels (`Scene`, `Sentence`, `Notice`) stay hidden. Typed-with-scene adds a matching **You** eyebrow on the prompt — next turn, not an instructional “Your turn” divider.

Optional `marks` on a turn color a span of `slovak` by role (`day` gold, `time` blue). The plain string stays what is spoken and graded. Build marks with `markedText` in `src/lib/learning/marked-text.ts` — add a role there when another exercise needs a new color. Do not search the finished sentence for the words.

`englishToggle: true` hides that bubble’s English behind Show English. The You prompt stays visible. Lesson scene lines already have their own English control, so leave `englishToggle` off there.

`speaker` is for audio roster / `characterIdForSpeaker` and that visible eyebrow. Use a label that already exists on a character’s `speakers[]` in `content/audio/config.json` (named people like `Anna` / `Mária` / `You`, approved one-offs like `Receptionist` / `Waiter` / `Conductor`, or system `Notice` / `Sentence` / `Scene`). Do not invent extra names (`Marta`) — they fall back to the narrator voice. Pick the role the line belongs to: a waiter does not check train tickets. Lesson **scene** table still uses a muted speaker column for multi-line scripts.

## Feedback (`feedback` on exercise + practice item)

- **Correct:** skip repeating the answer when choices already show it; always include `why`.
- **Wrong:** UI shows “Correct answer” + correction — do not add `That works.` / `Try this.` in content.
- `english` on feedback = gloss of the correction; `why` = one short teaching line.
- In `why`, wrap Slovak patterns or key terms in `**double asterisks**` so the UI can emphasize them (e.g. `Use **o** + the ordinal time form: **o tretej**.`).
- On a miss, `why` teaches the correct pattern; optional `whyWrong` on a choice explains the learner’s specific wrong pick when base `why` does not (common for select-all traps). Do not repeat the same point in both.

Reuse `PracticeExerciseFeedback.svelte` for any new exercise UI — do not invent new status labels.

## Scenes and answers

- The context leads to the prompt. Do not ask “Where are you?” right after someone said where they are.
- Settle `ty` / `vy` in the scene or the prompt: a named friend, `(formal)`, `(to a friend)`. If the scene leaves it open, accept both.
- Say-gate choices hide the line’s English until the learner answers, so a wrong choice must be wrong in form (`Nie mám…`, `Nemáš…`), not just a less likely reply.
- Build tiles: the first word is capitalised and the end punctuation sits on the last tile. A distractor is a real trap (`Mám` beside `Nemám`), never a copy of an answer tile.
- Typed answers list every correct variant in `acceptedAnswers`; the authoring checklist is in the `slovak-language` skill (`references/slovak-wiki-authoring.md`).

## After content changes

- `bun run test`: `exercises-audit.test.ts` checks tile builds and subject-pronoun variants; `content-rules.test.ts` fails on rules that shipped wrong before. When you fix a false rule, add its old wording to `content-rules.test.ts`.
- New/changed lesson or practice text: `bun run index:search` (Pagefind includes these routes).
- New lesson dialogue, key phrase, lesson choice label or correction: `bun scripts/audio/generate.ts -- --lessons-only --missing-only` when audio should ship. Practice-item context lines are not voiced.
