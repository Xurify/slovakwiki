---
name: new-lesson
description: Create or substantially expand a Slovak Wiki lesson (scene, beats, exercises, practice set, audio). Use whenever adding a lesson under src/lib/catalog/lessons or src/lib/learning/<topic>, adding beats or scenarios to an existing lesson, or building a practice set for one.
---

# New lesson

The full checklist is [`docs/lesson-authoring.md`](../../../docs/lesson-authoring.md). Read it before writing anything, then work through it in order. This skill is the procedure; the doc is the source of truth for what "done" means.

## Procedure

1. **Read first**: `docs/lesson-authoring.md`, `docs/lessons-practice-content.md`, and the reference lesson closest to the request (`grammar/possessives` for anything with paradigms or generated practice; `grammar/mat-present` for a small static lesson).
2. **Load the `slovak-language` skill** before writing any Slovak. Every scene line, option, and feedback line goes through its production pass.
3. **Plan out loud** before coding: the promise, the beats (one idea each), the exercise mix, and which mistakes and exceptions the lesson must cover. Share the plan if the user is around; otherwise proceed.
4. **Build** in the doc's order: scene → beats → wiring → Slovak check → audio → verify. Don't skip the audio steps; a lesson without clips is not finished.
5. **Verify for real**: tests, typecheck, a production build check of the audio maps, and a browser pass at desktop and phone width. Report anything you could not check.

## Hard rules

- Speakers only from the audio roster; mentioned people can't speak.
- Every teach phrase is also a key phrase (otherwise it has no audio).
- `why` on every exercise with `**key terms**`; `whyWrong` on every wrong option, never repeating the `why`.
- Grammar labels spelled out in full with the Slovak term; gender is a property of the noun ("masculine nouns for people", not "men").
- Confirm unusual Slovak against a real source, and say which.
