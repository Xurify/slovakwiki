# slovak.wiki — Agent conventions

Astro + Svelte 5 + Tailwind CSS v4. UI and styling rules are in `src/AGENTS.md`.

Domain-specific authoring and pipelines live next to the work — not here:

| Need                                        | Where                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| Dictionary / frequency / audio / images ops | [`scripts/README.md`](scripts/README.md)                                    |
| Hand-add a lemma                            | [`content/dictionary/README.md`](content/dictionary/README.md)              |
| Create or expand a lesson                   | [`docs/lesson-authoring.md`](docs/lesson-authoring.md) · `new-lesson` skill |
| Write a listening episode (podcast)         | [`docs/listening-authoring.md`](docs/listening-authoring.md)                |
| Brief a new episode in one prompt           | [`docs/listening-one-prompt.md`](docs/listening-one-prompt.md)              |
| Start an episode: one-page card             | [`docs/listening-card.md`](docs/listening-card.md)                          |
| Write and stage an episode, step by step    | [`new-episode` skill](.agents/skills/new-episode/SKILL.md)                  |
| Voice roster                                | [`content/audio/README.md`](content/audio/README.md)                        |
| FOUC / blocking pre-paint boots             | [`src/lib/fouc/README.md`](src/lib/fouc/README.md)                          |
| UI, styling, hydration, loading states      | [`src/AGENTS.md`](src/AGENTS.md)                                            |
| Slovak linguistic accuracy                  | [`slovak-language` skill](.agents/skills/slovak-language/SKILL.md)          |

**Don't stop to ask.** Never end a turn on a question unless the step cannot be undone: take the option you would recommend, say which, and go on. A ready prototype once waited 3.5 hours for a go-ahead nobody needed. Taking away something learners already have is the exception (Pull requests → **Removed**).

## Tooling

**Bun** is the package manager and script runner for this repo (`bun.lock`).

- Install: `bun install`
- Scripts: `bun run <script>` (e.g. `bun run dev`, `bun run test`, `bun run format`, `bun run lint`, `bun run typecheck`)
- Prefer Bun over npm/pnpm/yarn for installs and script runs
- Do not refresh or commit `package-lock.json`; use `bun.lock`

### Scripts (`scripts/`)

`bun run typecheck` (`astro check`) typechecks **`scripts/**` as well as `src/`**. Husky pre-push runs it (about 30 s) when the push changes `src/` or `scripts/` code (or `package.json`, `tsconfig.json`, `astro.config.ts`, `svelte.config.js`, `eslint.config.js`); commits only run Prettier and ESLint, so iterating stays fast. Manifest and other content-only pushes skip it. New or edited scripts must still pass `bun run typecheck` before push.

**Copy existing patterns; don't invent Bun-only APIs.**

| Need                         | Use (already in repo)                                                                | Avoid in `scripts/` |
| ---------------------------- | ------------------------------------------------------------------------------------ | ------------------- |
| Script directory / repo root | `fileURLToPath(new URL(".", import.meta.url))` or `ROOT` from `scripts/lib/paths.ts` | `import.meta.dir`   |
| Spawn a process              | `node:child_process` (`spawn`, `execFile`)                                           | `Bun.spawn`         |
| File I/O                     | `node:fs` / `node:fs/promises`                                                       | —                   |

`@types/bun` is installed for running scripts with Bun, but the shared `tsconfig.json` does **not** load Bun globals — so `import.meta.dir` and `Bun.*` fail `astro check` even when `bun scripts/…` runs fine.

**Before finishing script work:** `bun run typecheck` (mandatory, not “when risk is high”). Remove unused `const` / imports left from refactors — they show up as diagnostics and slow review.

Reference implementations: `scripts/lib/paths.ts`, `scripts/downloads/export.ts`.

### Dev & preview servers (Astro 7.2+)

**Agents:** start long-running servers in **background mode** so the shell stays free. `astro dev` and `astro preview` share the same machinery ([Astro 7.2](https://astro.build/blog/astro-720)).

| Task                     | Command                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| Dev (HMR)                | `bunx astro dev --host 0.0.0.0 --background`                          |
| Production build preview | `bun run build` then `bunx astro preview --host 0.0.0.0 --background` |
| Check if running         | `bunx astro dev status` or `bunx astro preview status`                |
| Tail logs                | `bunx astro dev logs` or `bunx astro preview logs`                    |
| Stop                     | `bunx astro dev stop` or `bunx astro preview stop`                    |

- `bun run dev` / `bun run preview` omit `--background` — fine for humans in a dedicated terminal; agents should pass `--background` instead.
- Preview serves the last `bun run build` output — rebuild after code/content changes.
- Background servers write to their own log files; use `logs` / `status` rather than blocking the shell.
- An agent never runs `astro dev stop`: it stops every dev server on the machine, other threads' renders included. Kill your own server's process instead.

**Build cache:** `experimental.incrementalBuild: true` in `astro.config.ts` skips re-rendering unchanged prerendered pages when `cacheKey` is set on `getStaticPaths()` entries.

## Search index (Pagefind)

Site search loads `/pagefind/` (generated; gitignored under `static/pagefind/`).

- **Production build** already rebuilds the index (`astro:build:done` → writes `dist/pagefind` + `static/pagefind`).
- **Local / `bun run dev`:** run `bun run index:search` when first clone / missing `static/pagefind/`, searchable content changed, or header search says the index is not built yet.
- Skip re-index for pure UI/CSS/layout edits with no content changes.

## Audio (always generate)

Dictionary / lesson / practice **spoken Slovak** needs ElevenLabs MP3s. Do **not** finish lemma or example work without generating clips. Search index is not a substitute.

- After new or changed lemmas, examples, or lesson lines: `bun scripts/audio/generate.ts -- --missing-only` (scope with `--slugs a,b` when you know the slugs).
- Needs `ELEVENLABS_API_KEY` in `.env`. Commands: [`scripts/README.md`](scripts/README.md) → **audio/**.
- Prod play also needs `bun scripts/audio/upload.ts` (R2). Generate still required locally even if upload waits.
- Skip only for pure UI/CSS/layout with **no** spoken-text change.
- **Write dialogue for the ear, before the first clip.** Read each exchange aloud at speaking pace. Where someone has to think (a guess, a quiz answer, a choice), let them say so in the line (`Hm…`, or the clue said back) with a pause after it. Put a beat between two clues, before a quiz sentence, between a verdict and its reason, and where a speaker turns to someone else. A pause is `[pause]` in the clip text: `PAUSE` in a podcast line, or a lesson line's `audio.transcript` with the same words as its text. Never direct a line `[slowly]`, and give the clip a full stop where the text trails off (`STOP`): Eleven reads an ellipsis as trailing off, and slowed, Marek's clues became a drawn-out whisper. Eleven v4 makes about a second of silence inside a line and next to none at its start or end, so a pause always sits between words. The first podcast had Anna name the key the instant Marek gave the clue.
- **Listen back before calling dialogue done.** For each new dialogue clip, Scribe hears the line as written (`generate.ts -- --verify`), the pauses fall where the script puts them (`ffmpeg -af silencedetect`), and the mouth follows the voice (`bun scripts/audio/lipsync.ts`, 80% or better over the episode; a single clip far under it, about 60%, is retaken). The tone of a directed line only a person can judge: list it in the PR's QA. A character's `voiceSettings` in `content/audio/config.json` override the shared ones (Marek's are steadier); settings are in the hash, so a clip made before them is still found under the settings it was made in (`audioConfigForClip`), and only new clips or a `--force` re-take use the new ones. A steady voice carries a feeling only when the line names it: `EXCITED`, `HAPPY`, `SURPRISED`, as well as `SIGH`, `CHUCKLE` and `YAWN`. The slips the first episode shipped are listed in [`docs/listening-authoring.md`](docs/listening-authoring.md) under **Slips we shipped**; read a script against them.

## Content pipelines

Do not paste script cookbooks here. Follow:

- **Dictionary / frequency / Tatoeba / downloads / audio / images:** [`scripts/README.md`](scripts/README.md)
- **Hand lemma fields:** [`content/dictionary/README.md`](content/dictionary/README.md)
- **Sources (SNK, Tatoeba, JÚĽŠ):** [`docs/data-sources.md`](docs/data-sources.md) and `/references`
- **Slovak in any of the above:** `slovak-language` skill before commit

After publish/enrich/curate/related or lesson/practice text changes: `bun run index:search` **and** generate missing audio (see **Audio** above).

## Slovak language skill

**Skill:** `slovak-language` — [`.agents/skills/slovak-language/SKILL.md`](.agents/skills/slovak-language/SKILL.md).

**When to use:** Read and follow that skill **before** producing or editing meaningful Slovak (diacritics, agreement, case, aspect, register). Trigger for:

- New or changed lesson / practice / dictionary Slovak (lemmas, examples, dialogue, answers, feedback `why` lines with Slovak patterns)
- Translate, write, rewrite, or correct Slovak
- Grammar / pronunciation / CEFR study explanations tied to site content
- Formal vs informal (`ty`/`vy`), gender-sensitive forms, or cultural/register choices

**How:** Open the skill file first; pick the task mode (translate / write / correct / teach / plan study / explain grammar); run the mandatory production pass; load only the reference file(s) the skill routes to under `references/`. Do not invent Slovak from English word-for-word.

**Skip when:** Pure UI/CSS/layout, infra, tests with no learner-facing Slovak strings, or copy-pasting existing verified Slovak unchanged.

**Check:** `bun run test` covers content too. `src/lib/catalog/content-rules.test.ts` fails on rules that shipped wrong before and on rhythmic-law slips, `src/lib/learning/exercises/exercises-audit.test.ts` checks tile builds and subject-pronoun variants, and `src/lib/catalog/dictionary/dictionary-content.test.ts` checks that examples contain their headword and that Tatoeba sentences rejected in `content/dictionary/tatoeba-rejected.json` stay out. When you fix a false rule, add its old wording to `content-rules.test.ts` (the skill's `references/slovak-wiki-authoring.md` §10 lists them).

Repo content tone and exercise UX → [`docs/lessons-practice-content.md`](docs/lessons-practice-content.md). The skill owns linguistic accuracy; that doc owns product/content conventions.

## UI and styling

Tailwind-first styling, Astro islands (`client:*`), components, loading states, Svelte readability, stack habits and the checklist before finishing UI work are in [`src/AGENTS.md`](src/AGENTS.md). **Read it before touching `.astro`, `.svelte` or CSS**; story and audio work does not need it.

## Stick-figure scenes

The animated cast, its places and the scene player. Logic lives in `src/lib/stick-figure/` (plain TypeScript with tests), drawing and UI state in `src/lib/components/stick-figure/`. The stage acts out podcast segments on the episode page: `ListenScene` in `ListenStage` plays each line the segment's `LinePlayer` hands it, so voice, mouth and moves stay in step, and `episodeStages()` in `scene-sources.ts` builds each segment's lines and place (a chapter's `stage`, the studio unless set). A segment that plays on from the last fades in on its place with the break's sting (`playSegmentCue`) and lets the place be heard before its first line. The sound of the place plays under the voices there unless the learner turns Background sound off, and one player carries it from segment to segment. The line being said shows under the stage as a subtitle (`SceneCaption`, the word being said lit, from its first word until the next line starts) unless the learner turns Subtitles off; the strip is a line tall before the first line comes, so the controls do not jump then, and grows only when a line wraps. The lab (`/dev/stick-figures`) and the scene player with its games (`/dev/scenes`) are still prototypes. How things move is under **Motion** above; these are the decisions behind the rest.

**Animate from the data, never by hand**

- Gestures are picked from the Slovak text, one per sentence (`line-gesture.ts` → `line-plan.ts`): a greeting waves, _áno_ nods, _nie_ shakes, a question opens the hands, an exclamation gets a beat of the hand (`stress`), words that trail off a tilt of the head (`muse`), and a plain statement a small open hand (`tell`). A long sentence gets a beat every 2.6 s, `tell` and `muse` in turn, never the same move twice running: one gesture for every sentence read as a tic. Set `DialogueTurn.gestures` only when the guess is wrong; lesson validation rejects more gestures than sentences.
- Mouths follow the clip's loudness and vowel track in `content/audio/mouth.json`, which `scripts/audio/generate.ts` writes with every clip. Never drive a mouth from a timer: timer mouths matched the voice at r = 0.29, the track at r = 1.00. The track is aligned on the clip text, pauses and all, with each text pause pinned to a silence heard in the clip (one stretch over the whole clip put the words after a long pause too early); `scripts/audio/lipsync.ts` scores it against Scribe's word times. An m, b or p shuts the lips on its quietest voiced frame (`m` in the vowel track), since loudness alone holds the mouth open through a hummed m.
- Check a changed stage by playing it in a browser, not only in its snapshot. The snapshot did not show three mouths moving on one line, a five-second walk-on, or the same hand on every sentence; a Playwright script that samples the figures each frame did.
- Staging (who faces whom, enters, leaves, walks over, points, hands something over) is worked out from the dialogue. `line-reading.ts` reads each line once (who it is said to, what changes hands), `staging.ts` turns that into moves, and `directScene` puts them together in one pass, one record per line. Where that leaves everyone standing is `stage-blocking.ts`, on the measured `StageFrame`; StickStage only animates the change. Change a rule there, with a case in `scene-direction.test.ts` or `stage-blocking.test.ts`; never stage one scene by hand. A line sets `to` only when the order of replies guesses the listener wrong, and `stays` keeps Alex on stage after a goodbye.
- What differs by place is a field in its row of `places.ts` (`PLACES`), not an `if` in a component: its label, sky and sun, things, sounds, the ground underfoot, staff, where the cast gathers, its window glass. Hosts stay at their mics in the studio because its row sets `atMarks`, which drops walks there. A new place is a row there plus its drawing in `StickBackdrop`'s `DRAWINGS`; both are typed over every `StageSetting`, so leaving one out fails the typecheck.

**Places and the stage**

- Backdrops are drawn SVG in the cast's style with fixed light paints, so the dark-ink cast reads in both themes. Keep a place's landmark near the middle or above head height.
- The stage is twice as wide as tall, up to 300px, and figures scale with its height. Check a changed place at 390px and at desktop width; Find it asks only for what the stage shows.
- The sky (sun, stars, clouds) is drawn behind the scenery. The sun stands at its place's `sun` spot, and `places.test.ts` fails when it leaves what a phone shows or touches a thing's box. The sun is a thing to tap or find only while it is out (`thingsIn`).
- Scenery that several places share (a room's wall and floor, wall clocks, town trees, street lamps, benches, plants) is a part in `backdrops/`, placed by `PARTS` in `backdrop-parts.ts`; its tap box comes from the same numbers, so moving it there moves both. Any other tappable thing's box in its place's `things` is in backdrop units and must match the drawing: move both in the same change. The words for things live in `thing-words.ts`, the geometry in `backdrop-geometry.ts`, and what each weather does (open sky, what falls) in `scene-mood.ts`.
- Each character reads as themselves at a glance (Marek has curls so he is not a second Alex). Their colours and small marks (ear, blush, glasses, sleeves, scarf, name tag) are one entry in `looks.ts`. The head (hair, face, a robot's visor) is `StickHead`, drawn once: the figure scales it onto its rig and the portrait beside a line (`LessonCharacterAvatar`) shows it from the front over a bust in the clothes `StickTorso` dresses the figure in. `drawings.test.ts` renders every prop, picture and character, fails a new id until it has a drawing of its own, and fails a portrait whose head is not the figure's. On stage the learner's lines belong to Alex, not "You" (`stageName`), and a line nobody says, like a board or a notice, gets no name tag.

**Acting from cues**

A segment whose lines carry `act` cues is acted, not read: nothing comes out or moves because a word was said, only because a cue says so (`acts.ts` for the world and its rules, `act-motions.ts` for how each verb moves, `act-schedule.ts` for when). These rules came from frame-by-frame reviews of episode 5's kitchen.

- A cue starts on a word of its line, or `before`, `start`, `end`, `after`; unanchored, it follows the cue listed before it, whoever's that was; `dark` cues happen at once while a `skip` has the lights down. List a line's cues in the order they happen: the checks replay them in list order.
- The place's `set` (`places.ts`) is built to the figure's body, not to the room: a worktop is 44 rig units, just over the hip, where the hands work. Pieces sit at backdrop x, but their widths and every `dx` are rig units, and a rig unit is about 1.4 backdrop units for a cast of three and 1.9 for two. A standing spot is clear of the table and its chairs and of the studio desk's end (`DESK_REACH`), never in front of a chair's back or a hanging towel, where a resting hand seems to hold it (`space/furniture`); keep every prop, plant and arm inside the phone's x 180 to 780. Standing spots and feet must also be clear of loose floor objects like bags (`taska`) and watering cans (`krhla`) (`space/floor-object`).
- Two people stopping closer than 30 rig units is an error (`space/crowded`); side by side at a counter they stand about 45 apart, and a lean that brings two heads within 30 is an error too (`space/heads`). Whoever is nearer leads the way, so walkers never pass through each other; a walker is drawn over whoever stands still, and passing someone who stands, a chair (not the one they sit on) or the front of a table takes a step toward the camera to go round in front (`space/passing` lists each pass for review). The studio desk is the exception: its chairs are behind it, so getting up from one or going back to it is a walk behind the desk to its end.
- People never move as one. Each look has its own `gait`, which also paces sitting down and getting up (`sitMs`). When two start the same walk on one word the later goes `APART_MS` after, two sitting down land `SIT_APART_MS` apart, and two gestures on one word (both waving goodbye) start `REACT_MS` apart. A robot walks with a shorter, stiffer gait (`gait: 0.85`), dampened hip dip, and servo shoes (`shoes: "servo"`) whose metallic ticks click in `playSteps`.
- Nobody stands wedged between a chair and its table. An empty chair at a table stands drawn back (`CHAIR_OUT`), so whoever sits stops in front of it, turns, and lowers with the hips going back before they drop, a small bow with the head kept level and the hands coming forward (`sitPhases` in `rig.ts`); then the chair scoots in under them (`SCOOT_MS`). Getting up pushes the chair back first, leans in, then rises, and the `stand` cue lasts all of that, so a walk never starts mid-rise. At 850 ms, eased, sitting read as a hinge and a drop. While getting on or off a chair the hands make no talking gestures: an open hand swung into the person beside.
- Seated, a look at something behind turns the head, not the chair, and a point back goes over the shoulder with the far hand (`overShoulder` in StickStage): flipping the whole figure read as sitting backwards. A seated person's hands at the hip are behind the table, so what they hold comes up above it: a spoon picked up at the table is held upright on its edge, and a ringing phone comes out of the pocket up in front of the chest, read, then raised straight to the ear.
- Acting verbs have motions in `act-motions.ts`: `kneel` lowers down beside the dog with a hand resting on its head, holds, then stands; `compute` focuses the robot's brow/tilt, pulses the visor/antenna light and chirps electronic foley.
- Close is not contact. A spoon's tip goes into the pot, a stream or salt lands inside the rim, and `contact/miss` fails a hand or tip that stops short or beside it; aim at the thing's box, not its spot. The body takes part: a lean into a reach, a wrist that flicks to shake salt. Pointing at a target aims at the target's own height: pointing at a dog aims downward at knee height (y~94), not at adult head height (y=50); `point/miss` fails any point aimed too high over the target.
- Seeking and scrubbing: In an acted scene, `actedWorlds[index]` is the single source of truth for line `index`. Never run heuristic `blockingBefore` on acted scenes or let `block(startLine)` / `block(endLine)` overwrite cue positions. Seeking places offstage characters at their entry spots with `outside` set, places spotted characters on their spot offsets, and immediately clears any active walk, flight, or sound cues.
- Tapping backdrop items: When a thing has multiple copies (like pictures or bags), hit testing and highlighting use `litKey(thing.id, copy)` so only the tapped copy lights up and the word card anchors directly to that copy's bounding box.
- Each object has one place at a time and a hold for its kind: a pot by both handles, a spoon into the mouth, a can by its handle, headphones by a cup in each hand (`both: PAIR`), coming off over the head and going down the same way. A heavy pot is filled standing in the sink under the tap, so the stream is seen going in; held under the tap, the near arm hid it. A spoon, ladle, cup or recorder is held level between moves (`STEADY`); anything else held hangs from the hand while its holder talks, so a full can never swings up to the chest. Hands busy with a cue make no talking gestures; a hello said into a phone gets no wave.
- What is put down goes on a clear spot: two things on one surface never overlap (the headphones once landed on a mug), and a knife goes down by the board for the next cook rather than hand to hand, which read as a handshake, blade first.
- A door swings on a tween and is seen pushed both ways: whoever comes in pushes it open from its latch side with a hand on the handle (`OPEN_DOOR`), steps in past it, and pushes it to from its hinge side, the hand on the handle until it bumps shut (`CLOSE_DOOR`), the latch click and the bump landing on the swing (`door-open`, `door-shut`). The hand aims at `door-handle`, where the swing has it now (`door.ts`), and whoever works the door stands on its sill (`doorLane`): in the room, in front of the wall, the handle was over their heads and a hand at the hip met the door's bottom edge.
- Hands are plain circles. A finger sticks out only where the gesture is the finger itself (a thumbs up, counting on fingers); on a point, a beckon, a wag or a shrug it looked wrong. A turn carries a held thing in front of the body to the other side (`carriedRound` in StickFigure): the figure changes sides as it faces the front, and a spoon held out jumped across in one frame.
- No talking gesture takes the eyes nearer the front than at rest (`look` under 0.4): in a sigh or a chuckle with the head dropped, the face read as turned away from the person spoken to.
- Seated at a table, idle hands lie on its top in front (`restOnTable` in reach.ts): hanging at rest, the arms went down through the tabletop. A talking beat lifts a hand off it. A phone comes off the ear to in front of the chest, the caller looks at the screen and presses it, and only then does the hand rest: dropped straight down, it read as a flick.
- The set has bounds. Someone at the counter or the stove never steps back to let a walker by (`backed` in StickStage): the step took them into the cabinet. The chair check counts each empty chair where it stands, drawn back, so no spot puts someone against its back.
- At a desk, talking beats stay up and in over the table (`overTable`) so they never reach the mug or mic, a seated wave uses the hand away from the mic, and a seated drinker or yawner leans back from it. The mic sits a hand's width from the lips (`MIC` in `StudioDesk.svelte`), so a head that leans in on a word clears it. Folded arms are set from the shoulders (`up`), so seated they fold over the chest, not under the chin, and a point across the room stays about level (`POINT_DROP`) instead of aiming down into the desk.
- A `skip` takes the camera wide and the lights almost to black, all but the clock, whose hands run round to the new time; who moves `on: "dark"` is simply there when the lights come back.
- Watch it played, frame by frame, at desktop and 390px, before calling it done, and have someone who has not read the cues review the frames: the checks catch impossible cues and near misses, not a body that moves like a block. Render the frames with `scripts/stage-review/` (its README): Playwright's `page.clock` alone keeps running with wall time and leaves CSS transitions on the real clock, so walks and turns came out wrong. Never edit `src/` while a capture or a frame render runs on that dev server: hot reload swaps the code mid-segment, and a render once failed half way with `Tween is not defined`. To show the pushed state while editing, render from a second checkout on its own port with `--base`.
- A helper agent's worktree under `.claude/worktrees/` makes the commit hook's `format:check` fail on its content files; remove the worktree once its branch is merged.
- Run `bunx vitest run src/lib/stick-figure` before every commit that touches the stage or an episode's cues: the commit hook formats and lints, the push hook type-checks, and neither runs tests.

**Weather, dress and sound**

- The words set the mood: `sceneMood` reads the lines up to the current one for the hour and the weather. Past the last line, rain and snow let up. Weather changes fade over `WEATHER_FADE_MS`.
- Falling rain and snow are an HTML layer (`StickWeather`), never animation inside the backdrop SVG: WebKit repainted the whole stage every frame and dropped to 7.5 fps.
- The cast stands in a row at a talking distance (`TALK_STEP`, about 0.9 m), gathered round the place's `post`, which puts them where people would stand there (on the home's rug, at the counter). Wall clocks show the time a line tells (`Pol dvanástej.`, `Je sedem hodín.`; a time something happens at, `O dvanástej ide von.`, is not the time now), otherwise the hour of the time of day a greeting set (`clockHour`). An episode segment that follows on in the same place keeps what was said there before (`before` on its staged scene), so its clock and light carry over.
- Chairs and tables are a place's `furniture`, drawn at the cast's scale in `StickFurniture` (not in the backdrop), so a sitter's hip meets the seat at any stage size. A place's named things and furniture stay between x 180 and 780 of the 960 drawing, all a phone's 2:1 stage shows, so a line never names something cut in half or off the stage; the studio has a test for it.
- `dress.ts` decides what the weather and the place do to a figure's things: umbrella up in rain, scarf in snow, neither indoors, and on the head what the place's row hands out (`headwear`: the studio's closed-back headphones; a headset with a boom mic is drawn too, for a place or character to come). Each look's `crown` says where a headband sits over its hair; the band is drawn in two halves, the far one behind the head and the near one over it with its cup, so it reads as going over the crown from ear to ear. Once open, an umbrella stays open until the stage folds it with `foldUmbrellas()`, on boarding the tram or at the scene's end. It never folds by itself. The figure gets what is in its hand as `held: { id, open }`, and the stage sets `open` from the dress when the umbrella comes out. A new item that follows the weather works the same way: a field in the dress, and an explicit stage call to change it.
- The podcast studio seats the hosts behind one long desk from the first line (`desk` on its place row): `stageFrame` gives each figure a seat round the middle of the row, turned to the others, and `StudioDesk.svelte` draws the chairs behind the cast and the desk, boom arms and mics over it, at the cast's scale so each mic stays at a seated mouth on any stage.
- Every walk is heard: `playSteps` puts a heel and a scuff on each footfall, in the sound of the place's `ground` (stone clicks, boards knock, carpet thuds, kitchen tiles pat, a path crunches; indoors soft, and rolled off so no step is sharp) and of the walker's `shoes` in `looks.ts` (heels click, soft soles land dull), as the tram's arrival has its cue. These play with background sound off, but not with sound off. A step is about a person's stride for the figure's height (`STRIDE` in `rig.ts`), so someone walking on from the edge takes two or three seconds, and nobody speaks to them, or answers them, until they are there (`ready`).
- Background sound is synthesized with Web Audio in `ambience.ts`, so there is nothing to load. After dark a square's murmur and the wind drop to a fraction (`dark` on the ambience), since few are about and the wind falls with the day. In the scene player it is off until the learner turns it on, plays steadily under the voices, and one player lasts the visit: `set()` fades layers in and out instead of restarting them.

**Player and games**

- `/dev/scenes?scene=<id>` opens one scene, for work on this player and its games. A podcast segment is built and checked on its episode page (`/listening/<slug>`), where learners hear it, and its PR QA links go there.
- Modes are Watch, Play as (Pick the line, Build it, Say it, Adaptive) and Find it. A game that is not about the scene picked is a scene of its own in the list, under Prototype with the other scripts, not a mode of the scene picked.
- Find it asks in Slovak only, since English would give the answer away. Someone on stage asks each thing and answers each tap out loud (`findAsker`, `findSayings` in `scene-find.ts`; the clips reach the generator through `findTurns()` in `scene-sources.ts` and the player through `Scene.finds`), gesturing instead only where a clip is missing. It names each find in English after the tap and ends with the case behind the forms.
- A talk (`talk.ts`) is a graph: the other person's lines, then Alex's replies. A reply that fits leads to a node and is voiced. A slip carries `why`, a reaction (`puzzle`, `laugh`, `frown`) and a voiced answer. `talk.test.ts` checks every talk: all nodes reachable, slips lead nowhere, ends are goodbyes, ty or vy fits who is spoken to. A talk has no script ahead of the learner: the text under the stage lists only what has been said.
- A talk has a casual topic, and its intro says who the person is to Alex. When a talk gets long or its topic deserves more, give it a game of its own rather than lengthen the day.
- Say it records in the browser and keeps the take there. Nothing is uploaded.
- Every voiced scene line gets a clip and a mouth track (see **Audio**), slip answers included. Talks reach the generator through `dayTurns()` in `scripts/audio/shared.ts`.

## Pull requests

Every PR description has a **QA** section ([template](.github/pull_request_template.md)): one link per page or part the PR changes, so review starts with a click.

- **Previews are opt-in, and only for review.** Only `master` and branches under `preview/` deploy (`vercel.json` → `git.deploymentEnabled`); pushes to work branches never create a deployment, so never edit `vercel.json` to get a preview. When a PR asks for review, mirror its head to `preview/<PR number>`: `git push -f origin HEAD:refs/heads/preview/<PR number>`. Repeat that once per review round, after the round's last push to the PR branch, and not while the PR is a draft or still being built. The preview's Vercel status shows on the PR's head commit, since the mirror is the same commit. The mirror is deleted when the PR closes (`.github/workflows/preview-cleanup.yml`). Agents cannot get past Vercel's login, so never tell the person a preview works: say "pushed, preview not verified" (three such claims were struck out on 2026-10-26).
- **Push rarely.** Vercel's free plan allows 100 deployments a day for the whole account, and every push to `master` or a `preview/` branch is one, even a docs-only push the ignore step skips. On 2026-10-26 open PRs and master alone pushed 95 times in a day (14 on one PR) and used it up. Iterate on the local dev server, commit as often as you like, and refresh a PR's `preview/` mirror once per finished round: a PR in review needs a few preview pushes a day, not one per commit. Never mirror helper branches. Over the limit, Vercel refuses new deployments for up to a day (`api-deployments-free-per-day`), including the production deploy after a merge to master: a red Vercel status then means quota, not code.
- **Link the Vercel preview**, not production. The host is `slovakwiki-git-preview-<PR number>-xurifys-projects.vercel.app` (short enough that Vercel does not shorten it). Never build a host from a work branch's name: those branches have no deployment.
- **Shared code lands first.** Stage or player code that two or more open episode branches need goes to master in its own small PR, and the episode branches merge master once it lands; fanning a helper branch out into each PR cost three conflicted merges and fixes that arrived late. A PR built on another PR's branch takes that branch as its base, never master (#83 showed 55 unrelated commits).
- **Removed** lists every control or feature the PR takes away that learners have now, in its own section; the person signs that off. Twice a cleanup removed avatars and the segmented progress bar, and both were asked back.
- **Check every link before it goes in**: the path is a route under `src/pages/` (`/grammar/past-tense`, not `/grammar/tenses/past`) and the anchor is an `id` on that page. Previews sit behind Vercel login, so a reviewer finds a dead link only by clicking it.
- **Point at the exact part**: a section anchor (`/grammar/possessives#contrasts`), a search (`/search?q=tohto`), a practice item (`/practice/possessives?at=grammar%2Fpossessive-svoj-choice`). A bare page link is only for a new page.
- **One checkbox per link, saying what to check**: `- [ ] [Possessives — Who is the owner?](…/grammar/possessives#contrasts): five cards, case label on each, audio on every sentence`. Name the viewport or theme when the change is layout (mobile, dark).
- **Cover every surface the diff touches**, including pages that only reuse a changed component or link to a new page.
- When a later push adds a page or moves an anchor, update the QA list in the same push.
- PRs that change no page (docs, config, scripts, tests) need no preview: do not mirror them to `preview/`; link the changed files on GitHub instead. A docs-only push to `preview/` still skips the build (`scripts/vercel-ignore-preview.mjs`) but counts against the limit.
