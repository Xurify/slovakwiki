# Episode card

One page for a thread that starts a listening episode. It says what to read when, so the first read stays small. The full rules live in the [`new-episode` skill](../.agents/skills/new-episode/SKILL.md), [`listening-authoring.md`](listening-authoring.md) and [`listening-one-prompt.md`](listening-one-prompt.md); open a section when its step starts, not before.

## Order of work

| Step               | Read now                                                           | Done when                                                                |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 1. Plan the shape  | skill §2, authoring §1                                             | world sheet and beat sheet passed the script critic                      |
| 2. Write the lines | skill §3, authoring §2 and **Slips we shipped**, `slovak-language` | script locked: council and native-ear review, before any clip            |
| 3. Stage it        | skill §4, `AGENTS.md` → Stick-figure scenes                        | `bunx vitest run src/lib/stick-figure` clean                             |
| 4. Voice it        | skill §5, `AGENTS.md` → Audio                                      | every clip verified (Scribe), pauses and lip sync checked, then uploaded |
| 5. Game at the end | authoring §2b                                                      | each path walked with `scripts/critic/game-walk.cjs`                     |
| 6. Check and PR    | skill §6 and §7, one-prompt §4 and §6                              | CI green, motion critic clean, proof in the PR                           |

## Rules that cost the most time

- Never end a turn on a question unless the step cannot be undone. Choices go to the council (`docs/critics/council.md`).
- Every helper agent (critic, validator, council member) is started with `model: "sonnet"`. Without it, it runs on your model and is several times slower.
- Lines are what a real person says in that place; no form is forced into a line. Every object comes from somewhere, every set looks like what it claims to be.
- Lock the script before generating a clip. A retake round is 20 to 40 minutes.
- Frames stay out of your own context: a subagent looks at them and returns text.
- Renders and long generate runs go in the background (`run_in_background`); do not poll a log in a loop. `render-frames.cjs --lines 5-7` re-renders only what changed.
- Run the full tests once at the end of a round; `bunx vitest run src/lib/stick-figure` while iterating. Refresh snapshots once.
- Push once per finished round. A preview is the `preview/<PR number>` mirror branch; work branches never deploy.
- Audio verify uses Scribe by default; character names go in as keyterms. Upload from a thread that is not linked to the person's computer.
- When the PR is done, merge it (green CI) or unsubscribe: every PR event wakes the thread and re-reads its whole context.
