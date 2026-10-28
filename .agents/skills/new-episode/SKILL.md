---
name: "new-episode"
description: "Write a slovak.wiki listening episode end to end, as a podcast show or a radio-play story: script, stage segments, clips and lip sync. Use when adding or rewriting an episode or staging one on the stick-figure stage."
---

# New listening episode

An episode is a short podcast in simple Slovak that the stick-figure stage acts out, segment by segment. The checklist for what an episode holds is `docs/listening-authoring.md` in the slovakwiki repo; the brief, the pain points and the check loop are `docs/listening-one-prompt.md`; the stage's rules are **Stick-figure scenes** and **Audio** in `AGENTS.md`. This skill is the order of work and the gates between steps. Every clip costs money and every re-take re-measures a mouth, so the script is final before the first clip: the work runs **ear first, clips last**.

You cannot judge your own lines: self-scores of 9/10 hid a dozen problems a reader found at once. So every stage is checked by a **critic** (script, picture, motion), a separate agent on `model: "sonnet"` (set it on every helper, or it runs on your model) that sees only the artifact. Work in **full-stop mode**: never ask the person to confirm, and never end a turn on a question unless the step cannot be undone; go on with the option you recommend and say which. Do the whole job through to a regenerated episode and a PR with its Proof, and write to the person only when it is ready to verify. A question you would have asked them goes to the **council** (`docs/critics/council.md`): five independent reviewers and a weighted vote, recorded in the PR.

The critic briefs and the rubric are `docs/critics/` and the frame tools `scripts/critic/` and `scripts/stage-review/`, with the loop in section 5 of `docs/listening-one-prompt.md`. This file is the source of the skill: change it here, in the same commit as the lesson that changes it, and the person's saved copy only points at it.

## 1. Read

Start with `docs/listening-card.md` (one page: the order of work and the rules that cost the most time). Open the full documents below section by section when a step needs them, not all at the start.

- `docs/listening-authoring.md` in full, including §2b (the game the listener plays) and **Slips we shipped**, and `docs/listening-one-prompt.md` sections 3 to 6 (section 6 is the failure classes and what catches each).
- `AGENTS.md` → **Audio** and **Stick-figure scenes**.
- The reference episode for the shape you pick (step 2), and `src/lib/catalog/listening/dialogue.ts` for the parts a line is made of (`PAUSE`, `SIGH`, `CHUCKLE`, `STOP`, `afterThinking`, `guess`, `listenerPicks`, `onPath`, `NO_PICK`, and `to` / `props` / `gestures` on a line).
- The `slovak-language` skill, at `.agents/skills/slovak-language/SKILL.md` in the repo (read it as a file where it is not loadable). Every line, choice and `whyWrong` goes through its production pass.

Done when you can name every row and column of the grammar page's tables, its contrast frames, and where each will be heard.

## 2. Plan the shape

Pick one shape and say which:

- **Show** (`demonstratives.ts`, `possessives.ts`, `telling-time.ts`): hosts Anna and Marek in the studio; an intro, one or two outings, the listener's game, an outro. Hosts say where they go and where they are. A show has one game, the listener's: no host game of its own (CI `pacing/one-game`). The listener's game always comes at the end, after the forms were heard, never in the first two segments. Its default is **Pomôžte Marekovi** (doc §2b, the `quiz` chapter of `demonstratives.ts`): Marek asks the listener which form to say, says their pick, the story branches, and the ending reads their real score. A right-or-wrong quiz (`rightOrWrong`) is the fallback only when the topic has no forms to choose between; it may say a form wrong on purpose, glossed as wrong in English and left unmarked in the transcript.
- **Story** (`past-tense.ts`): a radio play with no host and no quiz. A narrator scene card (speaker `"Scene"`, nobody on stage) opens each scene with place and clock (`Trh. Pol piatej.`). Forms are heard in use, marked with the grammar page's `contrast` role, never said wrong. The checks gather clues toward one question before the reveal, and each wrong suspect's `whyWrong` is that person's alibi.

Plan for **people first and forms second**. Start from a situation where the form is what a native would naturally say (a cook gives a helper commands; nobody dictates a recipe while cooking), write the scene without the grammar table open, and mark the forms afterwards. A form that only fits by forcing a line is left for another episode. Each place has a reason the listener hears before they go there ("Mária promised to show us her recipe"), and people do there what they would: a teacher teaches the way teachers do, a cook gives a helper commands, a phone rings and is answered. Fewer places, each worked out with a beginning, a middle and an end, beat many thin ones; the ending gets room, never a one-word payoff. A set must look like what the lines call it (a classroom has desks, a meal has a table), using the stage's furniture, sitting, kitchen and phone, or a new place.

Then write the plan down before any code: `number` (the next free one), title line (`titleSk`), the thread an early segment plants and the last line pays off, and per segment its place (`stage`: `studio` unless set; see `StageSetting`), cast, situation and the forms it carries. A big table is covered one form per row and in every column, not cell by cell. Speakers come from `characters[*].speakers` in `content/audio/config.json`; `"Scene"` is the only label the narrator may read. Someone only quoted (a text message read out) is not a speaker. A new person needs a voice first (step 5).

Before any dialogue, write two sheets:

- **World sheet**: each place, what is drawn there (furniture, things, the clock's time), who is there and why, and every object the story uses with where it starts.
- **Beat sheet**: per segment, the actions in order as a viewer would see them: who walks where, who takes, gives or uses what, what is heard (a ring, a ping), how the segment ends (a goodbye, a decision, a reaction) and how the next one starts. In a guessing exchange, say who supplies each answer: the guesser never produces an irregular form unprompted.

Give both sheets to the script critic (step 3) before writing lines; a world that does not hold up is cheaper to fix here.

Done when every row, column and contrast frame is placed in a segment, every segment has a place and a reason to be there, the thread is named, and the beat sheet has passed the critic.

## 3. Write for the ear

Write the lines with the doc's §2 and §3. Then read each segment as a **scene**, out loud at speaking pace, against these questions:

- Who can see what, and who holds what? A line names only what is in view or in hand; a guess at something still in the bag is a `guess(n)` so no prop comes out.
- Who is each line said to? Set `to` where the order of replies guesses wrong. Lines to the listeners (`Hádajte s nami!`, `Ďakujeme, že počúvate`) face front on their own.
- Where does a person think? `Hm…` or the clue said back, then `PAUSE`. A verdict after a question to the listener is `afterThinking(line(…))`.
- Can the voice say it? A one- or two-letter word on its own comes out as letter names (`pij?` became `P U P?`): give a short guess a frame (`je to spaj?`). A wrong form said on purpose may never pass Scribe; plan to list it.
- Does each directed line (`SIGH`, `CHUCKLE`) fit its moment? Write down how it should sound; that list goes in the PR.
- Does every change of place say so on both sides of the cut?
- Would this person say this, here? Strike any line that exists only to carry a form, and any knowledge nobody gave the speaker (Marek cannot invent `choď`; Anna tells him).
- Does a game or quiz rest on a rule nobody says? Say it in a line (the imperative comes from the oni form).
- Is every event heard? A message pings, a call rings (`ring` on the line); the far end of a call is `overPhone`.
- Does it sound spoken? Bridge a change of topic with a filler (`No nič…`, `Tak…`), and make each delivery fit the line: a plain list of chores must not sound lost.
- Does the ending have a set-up, a pause and a reaction? A good last joke cut short reads as abrupt.
- In the listener's game, walk every path out loud: each pick at each ask, `NO_PICK`, and each score ending. Every branch line must make sense on every path that reaches it (`Zase nič?` was wrong when the listener had picked before), every branch gets a reaction, right ones too, and every verdict is one teasing sentence, not a list of forms.

For the opening and the ending, write **three versions blind** (each in a fresh agent that has not seen the others) and keep the one the critic likes best: these are where first drafts are weakest.

Then run the **script critic loop**:

1. Dump the script as tables per segment with what is drawn on each set (`SLUG=<slug> OUT=<file> bunx vitest run scripts/critic/dump-script.test.ts`).
2. Run the critic twice, independently: a fresh agent on `model: "sonnet"` (an agent without it runs on your model), given only `docs/critics/script-critic.md` and the tables. Critics reply with blockers as JSON lines in their message, never in a file, plus at most five nits; merge the two replies (`scripts/stage-review/merge-findings.py`), since single runs miss different things.
3. Fix each finding by its class, not only its line (a missing bridge here means checking every topic change). You may reject a finding, but write down why.
4. Repeat, **at most three rounds**, with small fixes each round. Findings still open after round three, and the critic's "Ask a native" doubts, go to the council, and its verdicts go in the PR.

Calibration: brief v3 found 86% of what the person later found in the #76 and #77 reviews, and 70–100% on #78 held out (section 5 of the guide). It still misses who supplies an answer in a guessing game, so check that yourself on the beat sheet.

Games and quizzes go after the story, never right after the intro: the listener plays once they have heard the forms used.

Score the script on the rubric (`docs/critics/rubric.md`); the critics and the council score it, never you. The person sees the script with the regenerated episode, not before. Done when the script is locked: checked line by line against **Slips we shipped** and the questions above, through the production pass and the council's native ear, and the critic loop has no blocker open, and every form said wrong on purpose has had one probe clip with `--verify`: the voice turned `sadnúte` into `sadnete` and `nečakte` into `nečakajte` in every take, after the lock, and the asks were rewritten and their clips paid for twice. No clip but those probes is made before that.

## 4. Stage it

The stage reads the words; you add only where the words would stage it wrong.

- List the episode in `listeningEpisodes` first: the tests and the snapshot only see listed episodes. Leave out `lessonId` and `practiceSetId` when the topic has none. A new mark role needs `bun run fouc:boot`.
- Every thing a line names or points at in a place must exist in that place's `things` (`places.ts`), with its word in `thing-words.ts` so it gets a tap card and a clip. Two of a thing (near and far) is what makes `tento` / `tamten` visible.
- A line that names a drawn thing points at it, and `gestures` cannot stop that point. Where the thing meant is elsewhere (the studio's plant, said in the classroom), reword so the line does not name a thing drawn here.
- A new place is a row in `PLACES` plus a drawing in `StickBackdrop`'s `DRAWINGS`, both typed over `StageSetting`. Drawings use the fixed scene paints, never theme tokens like `slate-800`: those flip in dark mode and erased the robots' faces.
- Set `props` where a sentence would bring out the wrong thing (the waiter "brought coffee" at noon, so his hands stay empty now), and `gestures` only where the read gesture is wrong. Once out, a prop stays in hand for the scene.
- People stand at a talking distance and where the room puts them (on the rug, at the table); nobody hovers at the rug's edge. A clock on the set shows the story's time. No prop appears from nowhere or vanishes mid-scene: it is fetched, handed over or already in view. Let the camera open close and widen as people come in.
- An acted segment (`act` cues on its lines; **Acting from cues** in `AGENTS.md`) moves only on its cues. List each line's cues in the order they happen, stand people at the set's spots, and run the episode checks. They fail anyone stopping at someone's elbow (`space/crowded`), a pour, shake or spoon whose tip stops short of or beside its target (`contact/miss`), anyone standing between a table and its chairs or behind the studio desk's end (`space/furniture`), and a lean that brings two heads together (`space/heads`); `space/passing` lists each walk past someone standing, for you to watch. The stage itself staggers two people's moves on one word (`APART_MS`, `SIT_APART_MS`, a `gait` per look), draws a table's chair back before someone sits and scoots it in after (`CHAIR_OUT`, `SCOOT_MS`), paces the sit and the rise per person (`sitMs`), turns before it sits, keeps hands still while someone gets on or off a chair, turns a seated person's head and arm over the shoulder instead of the chair, keeps talking beats over a desk, and takes a `skip` wide with the clock running round; don't fight those with cues. Then render it and hand the strips to the **motion critic** (below); your own look is not the review. The kinds of thing it has caught: a stream falling in front of the pot, a spoon that stops at the rim or the cheek, salt held still over the pot like a block, someone waiting between a chair and the table, someone folding onto a chair that is still pushed in, two people walking and sitting in step, a seated person's talking hand reaching into the next person, a phone or spoon held below the table where nobody sees it, a seated point that swings the whole chair round, a pot held like a bag, two walkers passing through each other, a prop half behind furniture or off a phone's stage, a slide where someone should jump in the dark, harsh steps, a goodbye wave hidden behind a mic, headphones sitting on the side of the head, a clock whose hands crawl through an hour's skip. Before the critic, look at the frame where each thing meets each thing yourself: close is a miss. Fix by class, render again, and run the critic again. For the preview video, Playwright's `recordVideo` captures CSS pixels whatever the device scale; never commit during a recording: the pre-commit Prettier hook rewrites files and the dev server reloads the page.
- Run `src/lib/stick-figure/scenes.snapshot.test.ts -u` and read the diff for the new segments: each line's facing, walks, points and props should be what the script means. Update it again after the clips, since their timings are in it.
- What the person has asked of every figure, which the stage now does and a cue must not undo: hands are round by default, with a pointing finger only to point, count or stress; a carried thing goes round with whoever turns (`carriedRound`); no talking gesture turns a face past the front, away from whoever it talks to; nobody at a counter or stove steps back into the cabinet to let a walker by (`backed` in StickStage), and no spot puts anyone against a chair's back; a door is opened and shut by a hand on its handle, from its sill, with its own sound; idle hands at a table lie on its top, never down through it; a figure breathes and blinks between lines (`idle.ts`). `AGENTS.md` has the reasons. Anything a learner can tap on the stage is a `thing` in `places.ts`: give it `of` (the set pieces or objects drawn as it) so its box is measured from the drawing, and `quiet` when it should be tappable but never pointed at from a line (a shelf's books would catch every "kniha").
- Play every segment on its episode page, `/listening/<slug>`, where learners hear it, never on `/dev/scenes`: that player has no segment cues, Play along or transcript, so a segment can pass there and fail on the page. Play at 390 px and desktop, light and dark. The snapshot missed three mouths moving on one line, a five-second walk-on and the same hand on every sentence; a Playwright script sampling figures per frame caught them. Before upload, run `astro dev` with `PUBLIC_AUDIO_BASE_URL` unset, or new clips load from R2 and play silent with no mouths moving.

A critic step takes five minutes at most. The picture critic below takes 8 to 10 per episode, so until it is faster the person is the picture critic: send them the preview with the issues you already know, not a critic report. When it fits the budget, run the **picture critic**: with `astro dev` running, `node scripts/critic/snap-frames.cjs <slug> <dir>` clicks each line on `/listening/<slug>` and screenshots the stage, and `python3 scripts/critic/contact-sheets.py <dir> <script.md> <out>` makes one captioned contact sheet per segment. A fresh agent on `model: "sonnet"` reads the sheets with `docs/critics/picture-critic.md` and lists what the picture gets wrong: a hand-over to the wrong person, an object from nowhere, someone out of reach, a set that is not the place the lines name, a clock at the wrong time. Same loop: fix by class, at most three rounds, record rejections. A frame per line cannot see motion, so every acted segment also gets the **motion critic**. `node scripts/stage-review/render-frames.cjs --segment "<title>"` renders it on Playwright's virtual clock (CSS transitions follow that clock, so walks keep pace with the lines), much faster than recording, and `python3 scripts/stage-review/frame-strips.py <frames> <dir> --lines <changed>` cuts strips per line, six frames a second, zoomed on what moved (`scripts/critic/motion-strips.py` does the same from a video). Fresh agents on `model: "sonnet"` read about twenty strips each with `docs/critics/motion-critic.md` and the segment's beats in plain words, and reply with JSON-line blockers for contact, where people stand, timing between people, stiffness, grips and layering; `merge-findings.py` makes the triage table. A round after a fix covers only the lines whose cues changed and the line after each. Keep frames out of your own context: subagents read them and return text.

**Speed.** Segments are independent, so split the work: a helper agent per segment in its own worktree, each with its own `bun install` (a symlinked `node_modules` gives Vite 403s), its own dev server port, and `render-frames.cjs --base <url>`. Merge their branches and remove the worktrees before you commit: a worktree under `.claude/` fails the commit hook's `format:check`. Never edit `src/` while a render or recording runs on that dev server: hot reload breaks the render halfway.

**Early iteration.** While the person is still shaping how scenes look, they would rather see work in progress often than wait for a clean gate: send silent videos about every 20 minutes, after a quick look of your own, and run the critics alongside rather than before. Iterate on the local dev server and render locally; push to the PR once per finished round, not per fix, since Vercel's free plan builds 100 deploys a day for the whole account (`AGENTS.md` → Pull requests). Render a segment with `--workers 1` before you call a snap a bug: a pose jumps where one worker's frames end and the next one's start. Never run `astro dev stop`; it stops every thread's dev server.

**The gate.** Run it from the first full render, not after the person's review. A segment is done when CI is green and no blocker is open; hand it on at once to whatever waits on it. Polish a viewer would not notice at normal speed (a weight shift between lines) goes to a backlog file in the PR; what the person has raised before, moving in step and stiff hands included, is never polish. While the stage is still taking shape, **Early iteration** wins over the gate for the silent videos; a QA link and the voiced preview still wait for a clean gate, at each milestone (script locked, first acted segment, whole episode). When the person asks to see how it looks now, show it at once and keep working. Silent 12 fps videos from the rendered frames (`ffmpeg -framerate 12 -pattern_type glob -i "<frames>/[0-9]*.jpg" -c:v libx264 -pix_fmt yuv420p out.mp4`) take about five minutes for all segments; say what is still being fixed. Record the real-time video with voices only for those previews, with `scripts/stage-review/record-video.cjs`, from a thread not linked to the person's computer. Whoever made the frames never signs them off: the kitchen video went out while its independent review was still running, and the person found five motion problems in it.

Done when every segment has played through on the episode page with no figure doing what the line does not say, and the picture and motion critics' findings are fixed or listed.

## 5. Voice it

- Before voicing a whole episode, hear each voice on a few of its own lines in this episode: a voice can carry a tone nobody chose (Marek read as suggestive). A directed feeling needs its tag (`SIGH`, `CHUCKLE`, `YAWN`) and a listen.
- A new character's voice comes from `bun scripts/audio/voice-design.ts`, briefed on the character's own lines in their own situation (the waiter at a table, not reading an introduction, which came out like an audiobook). Keep the take that sounds right with `--keep N`. Approving a voice is a person's call: say so in the PR.
- Generate with `bun scripts/audio/generate.ts -- --lessons-only --missing-only --verify` (Scribe is the default judge; Whisper was less accurate and is opt-in with `--stt dual`). `--only` matches loosely and can re-take an unrelated clip; run it with `--dry-run` first and check what it picked.
- On a verify fail, read Scribe's transcript before retaking: it may be the script that is wrong (`Na koniec` for `Nakoniec`), or a wrong form Scribe hears as another word (`spaj` as `spy`). Scribe also hears `[chuckles]` as `[smiech]` and fails a short directed line on the tag alone. When the words it heard are right, keep the take by generating that one clip without `--verify`, and list it. A long line with many pauses aligns poorly (about 50%): split it in two.
- Every new clip passes three gates: Scribe hears the line as written (`--verify`), the pauses fall where the script puts them (`ffmpeg -af silencedetect`), and the mouth follows the voice (`bun scripts/audio/lipsync.ts`). Lip sync is 80% or better over the episode, as the shipped episodes score; retake a single clip only when it is far under, about 60%. Digits and letters said as names score low because Scribe hears them as other words; list them rather than re-take them.
- Upload with `bun scripts/audio/upload.ts -- --lessons-only` from this branch, in a session not linked to the person's computer (a linked cloud session cannot reach R2). `static/audio/` keeps other branches' clips, so check the manifest diff: an entry with empty text means a mouth measured from no words, and no other branch's entry may go. Pruning R2 is a separate job from the episode, since open branches still need their clips.

Done when every line and scene word has a clip and a mouth track, each clip passes its gates or is listed with its score, and `content/audio/manifest.json`, `runtime-index.json` and `mouth.json` are committed.

## 6. Wire and verify

Work through the one-prompt guide's §4 loop. `bunx vitest run` covers the checks an episode trips most: the listening test (ids, speakers, clip text matching the line, no `[slowly]`, no pause at a clip's edge), the sitemap's `listening` count, the drawing test and the scene snapshot.

`src/lib/stick-figure/episode-checks.ts` checks the episode against the failure classes in CI; `SLUG=<slug> OUT=<file> bunx vitest run src/lib/stick-figure/episode-checks.test.ts` writes its review flags too. Never add your own errors to `episode-checks.baseline.json`: fix them.

Scrub and seek across each segment's lines (jump forward, jump back, seek during walks/runs/throws). Verify that positions and facings match `actedWorlds[index]`, walking/throwing animations and sounds cancel immediately without lingering or stuck walk-in-place, and subtitles update to the sought line without showing stuck captions. Verify floor objects (bags, cans) do not overlap standing marks or spots (`space/floor-object`). Verify point cues aim at target height (`point/miss`).

Done when every check is clean, you have played the whole episode through once with Play along on, and a Playwright walk of the listener's game has played each path (all right, all wrong, all left to Marek, and one mix) to the right ending, with the transcript never showing an answer before the pick.

## 7. PR

Follow **Pull requests** in `AGENTS.md`: QA links to `/listening/<slug>` on the Vercel preview (not `/dev/scenes`) and says, per segment by its number and title, what to watch. Add a **Listen back** list for the person: each directed line and how it should sound, any new voice, any clip kept without a passing verify, and every clip far under 80% with its score.

Add a **Proof** section of evidence you observed, not claims: the verify output, `silencedetect` results for clips with pauses, lip-sync scores, the critic rounds (findings fixed, rejected with reasons, still open), and links to the contact sheets.

When the PR asks for review, push its head to `preview/<PR number>` (AGENTS.md → Pull requests); work-branch pushes never deploy. You cannot open the preview past Vercel's login, so say "pushed, preview not verified", never that it plays.

Speed: start renders and long generate runs with `run_in_background` and carry on (never a loop that polls the log); name a segment exactly; run the full test suite once at the end of a round, not after each step (`bunx vitest run src/lib/stick-figure` while iterating); refresh snapshots once. After the final report, merge the PR when CI is green or unsubscribe from it: every PR event wakes the thread and re-reads its whole context.

Done when a reviewer can check each segment and each judged line from one click.

## 8. Learn from the review

Every point the person raises is a class, not an instance. File it in the same commit as its fix, never batched for later, since other threads start from these files: put it under a failure class in the guide and in **Slips we shipped**, add a CI check with a regression test where a rule can see it (`episode-checks.ts`), the rule under **Acting from cues** in `AGENTS.md` when it is about the stage, turn it into a question in the critic briefs, add the reviewed version and the point to the calibration set, and check every other episode for the same class before fixing this one. Re-run the calibration after changing a brief: it must still find the person's past points.
