# Writing a listening episode

A listening episode is a short podcast in simple Slovak for one grammar topic: two or three roster voices, a few chapters, a handful of questions. Copy tone and feedback wording live in [`lessons-practice-content.md`](lessons-practice-content.md); Slovak accuracy is the `slovak-language` skill. Reference implementations: `src/lib/catalog/listening/episodes/demonstratives.ts` (a magazine show) and `past-tense.ts` (a radio play with scene cards). To brief a whole episode in one prompt, start from [`listening-one-prompt.md`](listening-one-prompt.md): what to decide first, a prompt template, and every pain point from the first four episodes with its fix.

## 1. Plan

- [ ] One grammar page (`grammarSlug`), one promise sentence, level `A1–A2`.
- [ ] Name it like a story, after a line the learner will hear: `titleSk: "Kde je ten kľúč?"`, with the English gloss in `title`. The grammar label goes in `topic` (`"ten, tá, to"`), lowercase because it is read in the first sentence: "A 4-minute episode on ten, tá, to."
- [ ] 4–6 chapters of 4–14 lines (a guessing game may run to 20). Each chapter is one situation (an intro, a game, a shop, a quiz, an outro) and brings in its own nouns, so the target forms turn up in different company.
- [ ] Cover every row and every column of the grammar page's tables, the other cases too, not only the nominative, and each contrast frame. A big table (the imperative's 39 cells) is heard one form per row, not cell by cell.
- [ ] Give the chapters a thread: something from an early chapter comes back later. The car key is lost at home, and again in the last line.
- [ ] Keep the Slovak inside the level: present tense, high-frequency nouns, fixed chunks. Repetition is a feature: a learner should hear the taught forms many times.
- [ ] Speakers come from the roster in `content/audio/config.json` (`characters[*].speakers`): `Anna`, `Marek`, `Lucia`, `Mária`, `Waiter` (also `Conductor`), `Receptionist`, `You` (Alex), plus `Scene` for a narrator's scene card and `Announcement` for a tannoy. List them in the episode's `speakers`; any other label falls back to the narrator voice and fails the speaker test.
- [ ] Each chapter's `stage` is where the stick figures act it out (`studio` unless set; `cafe`, `classroom`, `home`, `market`, `plaza`, `registration`, `street`). What a line points at or brings out must be drawn there or be a prop.

## 2. Write the script

- [ ] It must read like a show: a hello, a reason to talk, banter, a goodbye. Read it aloud.
- [ ] Mark the taught word with a role, `{ role: "demonstrative", text: "ten" }` (episodes wrap it in a helper, `mark("ten")`), so the transcript lights it up after listening. Add a role in `marked-text.ts` when a new topic needs one (reusing `text-mark-time`), then run `bun run fouc:boot`; it also rewrites `clock-boot-script.generated.ts`. A wrong form said on purpose stays unmarked, so the transcript never lights it.
- [ ] When a host says something wrong on purpose (a quiz), say so in the English gloss, so the transcript never teaches the wrong form. A line the listener answers (`rightOrWrong`) is the exception: its gloss would give the answer away, and the verdict follows it straight after.
- [ ] Give the listener time where a person would take it: a beat between two clues, before a quiz sentence, between a verdict and its reason. Put `PAUSE` in the line's parts; the text skips it and the clip says `[pause]` there. Eleven v4 makes a pause only inside a line (about a second); at its start or end it makes next to none. When someone has to think before they answer, as in a guessing game, let them say so: `"Hm… ", PAUSE, …`, or say the clues back: `"Žlté a ťažké… ", PAUSE, …`.
- [ ] A segment that moves to another place says so before it goes and when it gets there: the last line of the one before is `Poďme na trh!`, the first line of the next is `Teraz sme na trhu.` The stage fades in on the new place and its sound, the break's sting plays, and the first line waits a moment, but only words tell the listener where they are.
- [ ] A guessing game is played the way people play it: a wrong guess first (`Zelené a sladké… hruška?`), a second clue in answer (`Nie, hruška nie. Je to okrúhle.`), and a glad word when the guess is right (`Správne!`, `Presne tak!`, `Výborne!`), not a flat `Áno`. The guesser asks for the next thing (`A druhá vec?`); she cannot point at what is still in the bag.
- [ ] Where the listener is asked to decide, as in a quiz, say so (`Hádajte s nami!`) and give them time: wrap the answer in `afterThinking(line(…))`, and the player waits two seconds before it. The game the listener plays is section 2b. A pause at the start of a clip would make next to none. A line's feeling fits its moment: a `SIGH` before `Marek!` when he has lost the keys again. Listen back to every directed line.
- [ ] A clue has the shape a person gives it, one part per breath, with a `PAUSE` between the parts: `Je to žlté… je to ťažké… a vnútri je papier.` Where the text trails off, put `STOP` (`…` in the text, a full stop in the clip): Eleven reads an ellipsis as trailing off, and a line directed `[slowly]` came out as a drawn-out whisper. Do not direct a line slowly; the pauses set the pace.
- [ ] Ids start with `podcast-<slug>-` and say what they hold: `podcast-demonstratives-marek-car-key`. `validateListeningEpisodes` checks prefixes and uniqueness.
- [ ] `vocabulary`: 4–6 words to listen for, Slovak and English only. They show as tap-to-hear chips above the player, read by the guide voice; grammar notes belong on the grammar page.

## 2b. The game at the end: the listener plays

Every show episode ends on a game the listener plays, and it comes after the forms, never in the first two segments. **A show has one game: the listener's.** The hosts do not play a game of their own earlier (a verb game, a bag game), because two games in one show felt like the same thing twice (Xurify, 2026-10-28). A host exercise the story needs becomes a scene with a place and a reason, not a segment titled as a game, and the listener's game opens with a line that says why it starts now. CI: `pacing/one-game`. The default is **Pomôžte Marekovi**: a host is set a short test, asks the listeners for help, and says whatever form they pick. Reference: the `quiz` chapter of `demonstratives.ts`. These are decisions, not suggestions:

- [ ] The listener chooses what a host says, and the story follows the choice. A right-or-wrong verdict on a host's sentence (`rightOrWrong`) is the fallback for a topic with no forms to pick between.
- [ ] Three asks, each on one word. The other host gives the word (`Prvé slovo: dievča. Tá dievča, alebo to dievča?`); no sentence about something the stage does not show (`ten muž tam`) and no prop from nowhere.
- [ ] A reason for the test and for the help, said aloud: the host teases (`malá skúška pre Mareka`), Marek panics (`Tieto slovíčka mi nikdy nejdú do hlavy`), and somebody says how the listener helps (`Vy vyberiete, Marek povie.`).
- [ ] The asking line is wrapped in `listenerPicks(line(…), { prompt: "Čo má Marek povedať?", choices, answerId, judge: "Anna" })`. The labels are the phrase with the form (`To dievča`), the English is the same for every choice so it gives nothing away, and `judge` is whoever gives the verdict, so the card marks the pick when she speaks and not when Marek echoes it.
- [ ] Each branch is wrapped in `onPath(line(…), { ask, picks })`. Every ask has three branches: each choice, and `NO_PICK` for a listener who lets Marek answer or has Play along off. On `NO_PICK` Marek answers alone, always right, without "again" (`Nikto? Tak tie deti.`): the listener may have picked before.
- [ ] Every form is said in its whole phrase, in the asks and in the echoes: `Tie deti, alebo tí deti?`, never a bare `Tie… alebo tí?`. Nobody says a lone pronoun out loud.
- [ ] Marek echoes the pick before he says it (`Tí deti, hovoríte? Dobre, tak tí deti.`), so the listener hears their choice was used. Each line is what a person would say in the moment: `Dobre, verím vám.`, not `Dobre, idem podľa vás. To dievča!`, and `Tak si vyberiem sám.`, not a verbless `Tak sám.`
- [ ] Every branch gets a reaction, the right ones too (`Vedel som to! — Ty? Veď si sa ich pýtal.`), and the wrong ones each get a different joke. A verdict is said teasing, like a friend, and its reason is one short sentence, not a list of forms.
- [ ] After a joke, a bridge and a beat before the next word (`No dobre.`, `wait: BEAT_MS`).
- [ ] The ending reads the listener's real score: one Anna line and one Marek reply per score (`{ score: [n] }`), plus `{ unaided: true }` for a listener who picked nothing. Each has its own joke that fits the mechanic (a wrong pick was a choice, not sleep). Then the outro.
- [ ] Walk every path before the critics do: each pick at each ask, and each ending. `listener-path.test.ts` shows how; `validateListeningEpisodes` checks that each branch names a real ask and choice.

## 3. Write the checks

- [ ] 1–3 per chapter, asked after the chapter has played, with the transcript still hidden. Ask about what was said, not about grammar labels: who it is for, which one he takes, which word she said.
- [ ] `replayLineId` points at the line the answer comes from, in the same chapter; the learner can replay it, audio only.
- [ ] `gap` with a `___` turns a check into "which word did you hear": `___ kľúč je od auta.`
- [ ] `prompt` is a short, plain Slovak question (`Pre koho je jablko?`) and `promptEnglish` its English, shown under it. Choices are Slovak and read as answers to the question on their own: `Ten lacnejší, za tri eurá.`, not a bare `Tamten.` that only works at the stall.
- [ ] Every wrong choice has a `whyWrong` that first says what the choice means (`**Pre poslucháčov** means for the listeners.`), then what was said instead. No filler like "Nice idea, but". `feedback.why` names the rule or quotes the line in `**bold**`; `feedback.english` glosses that line.

## 4. Wire it in

- [ ] Add the episode to `listeningEpisodes` in `src/lib/catalog/listening/index.ts`. Leave out `lessonId` and `practiceSetId` when the topic has no lesson or practice set.
- [ ] `bun scripts/audio/generate.ts -- --lessons-only --missing-only --verify`, then `bun scripts/audio/upload.ts -- --lessons-only`. Commit `content/audio/manifest.json` and `runtime-index.json`.
- [ ] Update the `listening` count in `src/lib/seo/sitemap.test.ts`, and the stage snapshot (`bunx vitest run src/lib/stick-figure/scenes.snapshot.test.ts -u`); read its diff for the new segments.
- [ ] `bun run format`, `bun run lint`, `bun run typecheck`, `bunx vitest run`, `bun run index:search`.
- [ ] In the browser, on the episode page (`/listening/<slug>`), not `/dev/scenes`: play every chapter on the stage, checking mouths, props and who faces whom; play a chapter through, answer the questions, read the text, go to the next chapter, try Slower and Show transcript. Phone width and dark mode.

## Slips we shipped

Each of these went out in the first episode and had to be fixed. Read a script against them before the first clip. The parts a line is made of (`PAUSE`, `SIGH`, `STOP`, `afterThinking`, `guess`) live in `src/lib/catalog/listening/dialogue.ts`.

- **The guess comes at once.** Anna named the key the instant Marek gave the clue. Give the guesser a `Hm…` and a `PAUSE`, or the clues said back.
- **Pointing at what cannot be seen.** `A čo je toto?` about a thing still in the bag. Ask for the next thing: `A druhá vec?`
- **Nobody ever guesses wrong, and a right guess gets a flat `Áno`.** A wrong guess first, a second clue in answer, and a glad word: `Správne!`, `Presne tak!`, `Výborne!`
- **An exchange that contradicts itself.** `Kde je ten kľúč? — Tento alebo tamten? — … Je v taške.` Read it as a scene: who can see what, who holds what.
- **A cut with nothing said.** Studio to market with no line about going. The last line before a change of place says where they go, the first after it where they are.
- **A quiz with no time to think.** Invite the listener (`Hádajte s nami!`) and wrap each verdict in `afterThinking(line(…))`.
- **A line that replies to the wrong person.** `Syr. Dobrý deň!` answered Anna, so Marek waved at her and not at the stallholder. Set `to` when a line turns to someone else.
- **Directed slowly, or trailing off on an ellipsis.** A drawn-out whisper. `STOP` and `PAUSE`, never `[slowly]`.
- **A feeling that does not fit.** `Marek!` said flat when he has lost the keys again. A `SIGH` before it. Say how every directed line should feel, and listen back.
- **A pause at the start of a clip.** It makes next to none; the player waits instead (`wait` on the line).
- **A game that is a lecture.** Anna answered a right pick with `Tie deti, tie ženy. Tí muži, tí chlapci.` One short reason, then a reaction.
- **A branch that only fits one path.** `Zase nič?` when the listener had picked the first time. Read each branch line on every path that reaches it.
- **The mouth on the wrong word.** The vowel track was aligned on the line without its pauses. `bun scripts/audio/lipsync.ts -- --only "…"` scores a clip; under 80% is wrong.

From the review of episode 5 (the imperative), by a person on the episode page:

- **A visit with no reason.** The hosts went to Mária's class with nothing said about why; it read as dropping in on her. Set up why the characters go somewhere, in a line before they go.
- **Scenes written for the forms, not the people.** A lesson nobody would teach that way, and `Tak ho nezatváraj. A zavolaj Lucii. Nech príde na večeru.` three commands in a row because the table had them. Each line is what that person would say at that moment; the forms find their place in it.
- **Someone who knows what they could not.** Marek came up with `choď` himself, the one form nobody can build. Someone tells him (`Ísť má vlastný tvar: choď.`) and he says it back.
- **A game whose trick is never said.** Anna gave every verb in its oni form and nobody said why, so the listener wondered why it was always "they". When a game rests on a rule, a line says the rule.
- **Too many places, too little in each, and a rushed end.** Classroom, home, quiz and outro were short and mashed together, and the payoff was one word (`Pi!`). Fewer places, each with a beginning, a middle and an end, and room for the last beat.
- **A set that is not what it says.** A classroom with no desks, everyone standing. A place looks like what the lines call it, and people do what they would there: pupils sit (`Sadnite si.`).
- **Things on the set that the stage cuts off.** The studio's clock was cut in half, a speaker showed as a sliver, and the plant the whole episode was about was off the stage. What a line names must be inside what a phone's 2:1 stage shows.
- **News with no sound.** `Lucia práve píše…` with no ping. A message pings; better still, the phone rings and the call is played.
- **A voice with a tone nobody chose.** Marek's voice read as suggestive on a plain question to the teacher, and his tired line did not sound tired. Hear a voice on its own lines in the episode before voicing them all, and give a directed feeling its tag (`YAWN`).

From the review of the robot story (#77):

- **People who stand wrong.** Figures too close or too far apart, and Marek barely on the carpet. People stand at a talking distance and where the room puts them (on the rug, by the table, at the door): they know the room is there.
- **A clock that says another time.** The story says noon and the wall clock says ten. A clock on the set shows the time the story gives; when the story gives none, pick one that fits and keep it.
- **A prop from nowhere.** The leash was suddenly in the dog's mouth, then gone on the walk. A prop is fetched, handed over or already in view, and stays where it was until someone moves it.
- **A line that the voice does not carry.** A plain list of chores read as lost. A delivery fits what is being said; if the voice cannot carry it, direct it or rewrite it.
- **No filler where people use one.** `Výborne. Kde sú moje kľúče?` jumps topic. A real speaker bridges: `No nič…`, `Tak…`, `Dobre, a…`.
- **An abrupt end.** A good last joke cut short. The last beat gets a set-up, a pause and a reaction.
- **Kept: the camera.** The stage growing as the scene grew was liked. Open close and widen as people and things come in.

From the frame-by-frame review of episode 5's acted kitchen and studio (rules under **Acting from cues** in `AGENTS.md`):

- **A hand that only nearly does it.** The tasted spoon stopped at the cheek; the pot hung from one hand at the hip like a bag. A spoon goes into the mouth, and each thing is held as its kind is held.
- **Footsteps louder than the room.** Steps clacked on every floor. They sound like the floor (kitchen tiles pat, carpet thuds) and stay soft indoors.
- **Furniture that fights the people.** People stood in front of a chair's back as if gripping it, at someone's elbow, or walked through each other to the sink; a watering can hid half behind the desk and the plant's leaves ran off a phone's stage. Spots go in the gaps, the nearer person leads the way, and every prop stays in view on a phone.

From the second frame-by-frame review of the same episode:

- **Close enough is a miss.** Salt shaken beside the pot, water poured past its rim, a spoon above the soup and not in it. The checks now fail each one (`contact/miss`); look at the frame where the thing meets the thing.
- **A body like a block.** Marek salted the pot standing stiff, and two people sat down in step like a drill. Lean into a reach, flick the wrist, and never start two people's moves on the same beat.
- **Standing in the furniture.** Anna stood between a chair and the table. A standing spot is clear of the table and its chairs.
- **A hand that cannot be seen.** The goodbye wave at the desk was hidden behind the mic. A seated wave uses the hand away from it.
- **Something on a head that looks wrong.** The headphones' band sat on the side of the head like a bow. It goes over the crown, the far half behind the head.
- **A clock that does not move.** An hour passed in the dark and the hands crawled a minute. They run round while the lights are down, and the camera shows the whole clock.
