# Blind review brief

Copy this to each reviewer with the paths of the sheet PNGs. Run at least two reviewers from different model families (a fresh Claude subagent, and Antigravity `gemini-3.8-flash-high` through `delegate_task`). Never give them the sentence, the slug, this repo or the skill: they get the PNGs only.

```
You are a fresh pair of eyes reviewing hand-drawn pen sketches. Do NOT read repo
files, do NOT search the filesystem, do NOT look for source code or captions.
Only open these PNG images: <paths>. Do not edit or create any files.

Each sheet shows up to 6 numbered pen sketches (stick people, objects, arrows, a
few written Slovak words, a pale blue highlighter patch). They are the pictures
at the top of pages that teach Slovak grammar to English-speaking beginners.
Each sits above one short Slovak sentence that you cannot see. The learner
should get the idea in about three seconds.

For EACH number, write four short lines:
A) Literal: what people, objects, arrows and words you see. Describe only what is
   actually drawn; if something is hard to make out, say so instead of guessing.
B) Meaning: what situation or grammar idea you think it shows (guess a specific
   case, tense or rule), the Slovak sentence you think sits under it, and your
   confidence (high/medium/low).
C) Clarity 1-5 (5 = a beginner gets it in 3 seconds without a caption).
D) What is confusing or ambiguous, and the smallest change that would fix it.
   Write "none" if it is fine; do not invent problems.

Be blunt and honest, neither harsh nor kind for its own sake. At the end give the
6 weakest pictures and the 3 most common drawing mistakes that remain.
```

## Reading the answers

- **Score B against the sentence you meant.** A reviewer who says "possession" for a picture meant as "have" is right; one who says "vocabulary: key" is a miss. Line A is the check on the reviewer: if it lists something that is not drawn, discount that reviewer's line D for that picture.
- **Act on what two reviewers say.** Gemini 3.8 Flash invented a laptop on a desk, scribbles in a bubble and a swapped row of tiles (all in round 3); it also gave 5/5 to pictures that Claude called a cabinet or a box. Opinions on taste split (an open book "reads as a newspaper" to one reviewer and a closed 3-D one "as a parcel" to another). A confusion that both name is a real one; a one-reviewer taste call is not.
- **Stop when** every picture is 4 or better with the meaning guessed right by both, and what is left is a known limit you can write down. The round-by-round record is in the PR that changed the sketches.
