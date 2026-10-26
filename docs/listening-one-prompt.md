# A new episode in one prompt

How to brief a new listening episode, with its segments acted out on the stick-figure stage, so the first draft is close to done. It is the short form of what PRs #43–#70 learned the slow way. The rules themselves stay in [`listening-authoring.md`](listening-authoring.md) (script, checks, wiring, **Slips we shipped**) and `AGENTS.md` (**Audio**, **Stick-figure scenes**); this page is what to decide before the prompt, the prompt itself, and the loop after it.

## 1. Pre-flight: decide before you prompt

Every iteration in the first four episodes came from something nobody had decided. Settle these and put them in the brief.

**Story**

- [ ] The grammar page (`grammarSlug`) and the forms to cover: every row and every column of its tables, other cases too, and each contrast frame. A big table is not heard cell by cell: the imperative's 13 verbs × 3 persons fit a show only as one form per row.
- [ ] The shape: a magazine show (intro, places, then game and quiz, outro) or a radio play with scene cards and no quiz (`past-tense.ts`). A play does not say anything wrong on purpose. A game or quiz comes after the story, once the listener has heard the forms used, never straight after the intro.
- [ ] The thread: one object or problem from the first segment that comes back in the last line (the car key, the umbrella, the cake).
- [ ] One line per segment saying what happens, in order, with where it is, and why the characters are there: a visit with no reason reads as confusing.
- [ ] Fewer places, each worked out: who is there, what they want, how it starts and ends. Three thin segments and a one-word payoff read as rushed; give the ending room.
- [ ] Every line is something that person would say then, real and natural first; the forms fit into it. Nobody knows what they could not know: someone tells them.
- [ ] Nothing exists only to carry a form: no dictated recipe, no spoken textbook label (`rob, robte, robme`), no prop pulled out to have something to write on.
- [ ] Speech sounds spoken: fillers where people use them (`No nič…`, `Tak…`), and a delivery that fits each line's feeling.
- [ ] The ending has a set-up, a pause and a reaction; a good last joke is not cut short.

**Cast and voices**

- [ ] Speakers by their label in `content/audio/config.json` → `characters[*].speakers`: `Anna`, `Marek`, `Lucia`, `Mária`, `Waiter` (also `Conductor`), `Receptionist`, `You` (Alex); `Scene` for a narrator's scene card; `Announcement` for a tannoy. Any other label falls to the narrator and fails the speaker test. Someone only quoted (a text message read out) is not a speaker.
- [ ] Who each person is to the others (friend, shop assistant, teacher), so ty or vy is right on every line.
- [ ] No new voice unless the story needs one. A new voice is a person's call by ear (see **4**).

**Stage**

- [ ] Each segment's `stage`: `studio` (default), `cafe`, `classroom`, `home`, `market`, `plaza`, `registration`, `street` (tram stop). A new place is a row in `places.ts` plus a drawing in `StickBackdrop`, a much bigger job: say so in the brief or avoid it.
- [ ] Things the lines point at must be drawn in that place (`things` in its `PLACES` row) and props must exist (`STICK_PROP_IDS` in `props.ts`). A noun with neither is said, not shown. A new thing needs a drawing, a word in `thing-words.ts` and a clip.
- [ ] The set is what the lines call it, and people do what they would there: pupils sit at desks, a meal is eaten at a table, a message pings or a call rings. What a line names is inside the middle 600 of the 960 drawing, or a phone's stage cuts it off.
- [ ] People stand at a talking distance and where the room puts them (on the rug, at the table), aware of what is around them.
- [ ] A clock on the set shows the story's time; with none given, pick one that fits.
- [ ] No prop appears from nowhere: it is fetched, handed over or already in view, and stays until someone moves it.
- [ ] The camera opens close and widens as people and things come in.
- [ ] How each change of place is said: the last line before (`Poďme na trh!`) and the first after (`Teraz sme na trhu.`), or a scene card (`Trh. Pol piatej.`).

- [ ] A world sheet (each place, what is drawn there, who is there and why, every object and where it starts) and a beat sheet (per segment, what a viewer sees happen, in order, and how it ends) before any dialogue.
- [ ] The critic loop in **5** on the beat sheet, the script and the staged frames, before the person sees any of them.

## 2. The prompt

Fill the brackets and paste. It names every rule that cost a round trip, so the model checks against them instead of you.

```text
Add listening episode [N] (`number`, the next free one) to slovakwiki:
"[titleSk]" ([English title]),
grammar page `[grammarSlug]`, topic label "[topic]", level A1–A2.

Story ([magazine show | radio play with scene cards]):
- Thread: [the thing that comes back in the last line].
- Segments, in order, with stage and what happens:
  1. [studio] [intro: …]
  2. [market] [… who is there, what they want, which forms come up]
  3. …
- Forms to cover: [every form in the grammar page's tables, by case].
- Cast: [speakers and who they are to each other; ty or vy].

Follow docs/listening-authoring.md (all of it, including "Slips we shipped")
and docs/listening-one-prompt.md, with demonstratives.ts [or past-tense.ts]
as the reference episode. Use the `slovak-language` skill on every line.

Before generating any clip, show me the script as a table per segment
(speaker, Slovak, English, directions, props/to/gestures) and the checks,
and read it against "Slips we shipped" and the staging list in
docs/listening-one-prompt.md section 3. Run the critic loop in section 5
on the beat sheet, the script and the staged frames, and show me what
is still open after it. Then generate, verify, wire in and
open a PR with the QA list from section 4, including the lines a person
must judge by ear.
```

Asking for the script table first is the one stop worth keeping: a script fix is free, a clip fix costs a regenerate, a re-verify and an upload.

## 3. Pain points and what fixes them

What went wrong, why, and where the fix lives now. The left column is what to look for in a draft.

**Voice and timing**

| Symptom                                           | Cause                                                                                                                                                    | Fix                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The mouth is on the wrong word for most of a line | The vowel track was aligned on the text with its `[pause]` tags stripped, so every word after a pause was placed a second early (63% of syllables right) | Aligned on the clip text now (86%). Score the new clips with `bun scripts/audio/lipsync.ts`. Aim for 80% over the episode: the shipped demonstratives episode scores 84.6% with 19 of its 67 clips under 80%. Retake a single clip only when it is far under (about 60%). Lines with digits, or letters said as names (`s i alebo s y`), score low because Scribe's words do not match the syllables: check those by eye |
| Lips never shape a vowel                          | `upload.ts` stamped clips from another branch with an empty text, and their tracks were measured on no words                                             | `upload.ts` now takes the text from the line that makes the clip, or skips it (#61). Do not switch branches between generate and upload; check new manifest entries have their text                                                                                                                                                                                                                                      |
| A guess comes at once, a quiz gives no time       | No pauses in the script                                                                                                                                  | `PAUSE` between words (about a second); `afterThinking(line(…))` before a verdict (2 s wait). A pause at a clip's start or end makes nothing, and a test fails it                                                                                                                                                                                                                                                        |
| Clues as a drawn-out whisper                      | Directed `[slowly]`, or ended on an ellipsis                                                                                                             | `STOP` (`…` shown, `.` said) plus `PAUSE`; never `[slowly]`, and a test fails it                                                                                                                                                                                                                                                                                                                                         |
| A feeling that does not fit (`Marek!` flat)       | No direction                                                                                                                                             | `SIGH`, `CHUCKLE`; list each directed line in QA for a person to hear                                                                                                                                                                                                                                                                                                                                                    |
| A voice that sounds like a tannoy or an audiobook | Voice Design briefed on the wrong text                                                                                                                   | Brief on the character's own lines, in their situation; keep a good preview with `voice-design.ts --keep N`. The old tannoy voice became `Announcement`                                                                                                                                                                                                                                                                  |
| The judge fails a correct take again and again    | Scribe unsure of a last word                                                                                                                             | The gate counts only when Scribe heard a different line (#64). Read its transcript before forcing retakes                                                                                                                                                                                                                                                                                                                |
| A wrong form said on purpose fails every take     | Scribe writes what it hears as a real word: `spaj` came back as English `spy` five times                                                                 | Read the transcript: if it is the line said right, stop retaking. Generate that one clip without `--verify` and list it in **Listen back**                                                                                                                                                                                                                                                                               |
| A guess comes out as letter names (`P U P?`)      | Eleven reads a one- or two-letter word on its own as letters                                                                                             | Give a short guess a frame (`Spia… je to spaj?`), or pick a longer word                                                                                                                                                                                                                                                                                                                                                  |
| The judge is right and the script is wrong        | A slip in the Slovak (`Na koniec` for `Nakoniec`) that the production pass missed                                                                        | On a verify fail, read Scribe's transcript against the script before blaming the take                                                                                                                                                                                                                                                                                                                                    |
| An unrelated clip was retaken                     | `--only` is a case-insensitive substring match                                                                                                           | Use a phrase unique to the line, and read the target count it prints before it synthesizes                                                                                                                                                                                                                                                                                                                               |
| Other branches' clips 404 after a prune           | `prune-orphans.ts --r2` deleted what master did not know                                                                                                 | Orphans uploaded in the last 30 days stay (`--keep-days`). Never prune while an audio branch is open longer than that                                                                                                                                                                                                                                                                                                    |

**Stage**

| Symptom                                                                              | Cause                                                                    | Fix                                                                                                                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Someone answers the wrong person, waves at the wrong figure                          | The reply order guesses the addressee                                    | `to: "Lucia"` on the line                                                                                                                              |
| A cup, camera or phone appears from nowhere (`Priniesol som kávu` at noon)           | A sentence naming a thing brings it out                                  | `props: [null]` per sentence, or the right prop; `guess(n)` for a guess at something not yet shown                                                     |
| A figure points at the wrong one of a thing (the classroom's plant for the studio's) | A line that names a drawn thing points at it, whatever `gestures` says   | `gestures` cannot stop a point: reword so the line does not name a thing drawn here (`kvetina` is not drawn)                                           |
| A prop stays in hand for the rest of the scene                                       | Nothing puts a prop away; `props: [null]` only keeps one from coming out | Plan when a prop first comes out; let it stay                                                                                                          |
| A host talks to the other host while addressing listeners                            | Faces default to the last speaker                                        | Lines said to listeners face front (`audience`, read from `Hádajte s nami!`, `Ďakujeme, že počúvate`…). Naming someone on stage overrides it, so check |
| Pointing at what cannot be seen                                                      | A thing still in a bag                                                   | Ask for the next thing (`A druhá vec?`); point only at what is drawn                                                                                   |
| Three mouths move on one line, the same hand on every sentence                       | Staging bugs the snapshot cannot show                                    | Fixed in the stage (#64). Play every segment in a browser; a snapshot passing is not a check                                                           |
| Hosts walk across the mics                                                           | Walk-overs in the studio                                                 | `atMarks` in the studio row drops them; outside the studio expect walk-ons and walk-offs from hellos and goodbyes                                      |
| A cut with nothing said                                                              | No line about going                                                      | Say where they go and where they are, or a `Scene` card. The stage adds the fade and sting                                                             |
| Things cut off on a phone                                                            | The stage shows less of a place at 390px                                 | Keep landmarks near the middle; Find it asks only for what shows; check every segment at phone width                                                   |

**Script and checks**

| Symptom                                                                              | Fix                                                                                                                          |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| A line exists only to say a form (a remark about food in the studio, to get `tento`) | Every line moves the scene; find the form a natural place                                                                    |
| An exchange contradicts itself (`Tento alebo tamten?` about one key)                 | Read each segment as a scene: who holds what, who can see what                                                               |
| Nobody guesses wrong; `Áno` for a right guess                                        | A wrong guess, a second clue, a glad word                                                                                    |
| English questions, filler feedback, choices that only work at the stall              | Slovak `prompt` with `promptEnglish`; `whyWrong` says what the choice means first; each choice reads as an answer on its own |
| The transcript lights a wrong form (a quiz sentence said wrong on purpose)           | Leave a wrong form unmarked; mark only the right form, and say in the English gloss that the line is wrong on purpose        |

**Process**

- Vercel's free plan builds 100 previews a day. A stack of six PRs, each rebased and pushed several times, ran out on 2026-10-22. Ship an episode as one PR and push in batches.
- `static/audio/` is gitignored and survives branch switches. Generate and upload from the episode's branch only.
- `prune-orphans.ts --delete` clears a branch's discarded takes. Before #79 it also dropped manifest entries for other branches' uploaded clips: check the manifest diff removes only your own hashes.
- A cloud session linked to someone's computer has a narrower network and cannot reach R2, whatever the environment allows. Upload from a session that is not linked.
- With `PUBLIC_AUDIO_BASE_URL` set, `astro dev` loads every clip from R2, so clips not uploaded yet play silent and no mouth moves. Before upload, run dev with it unset.

## 4. After the draft: one loop, in order

1. Add the episode to `listeningEpisodes` (the tests only see listed episodes) and bump the `listening` count in `src/lib/seo/sitemap.test.ts`. Leave out `lessonId` and `practiceSetId` when the topic has no lesson or practice set. A new mark role in `marked-text.ts` needs `bun run fouc:boot`, which also rewrites `clock-boot-script.generated.ts`.
2. `bunx vitest run src/lib/catalog/listening` until only "no clip; run generate.ts" fails: ids, speakers, no `[slowly]`, no edge pauses, marks inside lines.
3. `bun scripts/audio/generate.ts -- --lessons-only --missing-only --verify` (add `--stt elevenlabs` when local Whisper is not installed). A take that fails verify is deleted (#79), so the next run retries it. Then `bun scripts/audio/lipsync.ts` over the new clips: 80% or better over the episode, a retake only for a clip far under it (see **3**).
4. `bun scripts/audio/upload.ts -- --lessons-only`. Commit `content/audio/manifest.json`, `mouth.json`, `runtime-index.json`.
5. Update the stage snapshot (`bunx vitest run src/lib/stick-figure/scenes.snapshot.test.ts -u`) once the clips exist, since their timings are in it. Read the diff for the new segments: who points, who walks, what comes out.
6. `bun run format`, `bun run lint`, `bun run typecheck`, `bunx vitest run`, `bun run index:search`.
7. Play every segment on `/listening/<slug>`, the page learners use, at 390px and desktop, light and dark: mouths on the words, one mouth per line, props only when meant, faces to the right person, transitions said. Not on `/dev/scenes`: that is a different player, without the episode's segment cues, Pause at questions or transcript, so a segment can pass there and fail on the page.
8. Open the PR. QA links to `/listening/<slug>` on the preview and says, per segment by its number and title, what to watch, plus a **Listen back, a person's call** list: every directed line (sigh, chuckle, unsure, remembering), any new voice, any clip kept without a passing verify, and each lip-sync score far under 80% with why it stands.

## 5. Critics: someone else reads it first

The writer cannot judge their own lines: drafts self-scored 9/10 on dialogue and story had a dozen problems each that a cold reader found at once. So every stage is read by a **critic**, a fresh agent on a different model from the writer's (Sonnet when the writer is Opus) that gets only the artifact and a brief, never the plan or the grammar goals.

| Stage            | What the critic gets                                                                                                                                                                                  | Brief                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Beats and script | Tables per segment with what is drawn on each set: `SLUG=<slug> OUT=<file> bunx vitest run scripts/critic/dump-script.test.ts`                                                                        | `docs/critics/script-critic.md`  |
| Staged episode   | A contact sheet per segment, one frame per line: `node scripts/critic/snap-frames.cjs <slug> <dir>` with `astro dev` running, then `python3 scripts/critic/contact-sheets.py <dir> <script.md> <out>` | `docs/critics/picture-critic.md` |

The loop, at each stage:

1. Run the critic twice, independently, and merge the lists: single runs miss different things.
2. Fix each finding by its class, not only its line. A missing bridge in one place means checking every change of topic.
3. A finding may be rejected, with the reason written down.
4. At most three rounds, with small fixes each. What is still open after round three, and the script critic's **Ask a native** doubts, go to the person with the script, each with its reason.

Write the opening and the ending three times blind (each by a fresh agent that has not seen the others) and let the critic pick: they are where first drafts are weakest.

**How well the critics do.** The script brief was tuned in three rounds on the scripts of #76 and #77 as Xurify reviewed them, with #78 held out. It found 86% of the points Xurify raised that a script reader could find on #76 and #77, and 5 of 5 and 3.5 of 5 on #78 in two runs. Earlier briefs invented language errors (`Ja prídem`, `stojeden`), so the brief now reports only certain errors and lists doubts for a native. No round caught Marek producing `choď` with nobody telling him: in a guessing exchange, write on the beat sheet who supplies each answer. The picture brief, on the frames of #76 v2, found all three stage points Xurify raised (the card from nowhere, the cup handed to Anna at `Tu máš vodu`, the studio desk) and a dozen more. One frame per line can miss a quick walk or a prop that flashes in; when a finding is about motion, play the segment.

**After a review.** Every point the person raises is a class: add a question for it to the brief, add the reviewed version and the point to the calibration set, check the other episodes for the same class, and rerun the calibration so the brief still finds the person's past points.

**Proof in the PR.** Next to the QA list, a **Proof** section of what was observed, not claimed: the verify output, `silencedetect` for clips with pauses, lip-sync scores, the critic rounds (fixed, rejected with reasons, still open) and the contact sheets.
