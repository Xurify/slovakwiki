# Episode audit (target: every dimension 9/10 or better)

You audit ONE listening episode of slovak.wiki (Astro + Svelte 5; stick-figure stage; Slovak-learning podcast shows and radio-play stories). You did not make it and owe the makers nothing. The owner, Xurify, wants every episode at least **9/10** in every dimension: set design and look, interactions, story, story climax, audio, and anything else that matters. Be as strict as a picky director and a native Slovak listener would be. A 9 means one small nit at most.

## Setup

- Work in your own worktree from origin/master with its own `bun install` and dev server port (`bunx astro dev --port <port> --background`).
- Start a dev server on YOUR port: `bunx astro dev --host 0.0.0.0 --port <port> --background`. Never run `astro dev stop` or `pkill -f`; kill only your own pid at the end. Don't edit src/.
- Playwright: segments have no title buttons; reach segment N by clicking "Next segment" N times. For frames at chosen moments use the virtual clock as `scripts/stage-review/render-frames.cjs` does. `scripts/critic/` has snap-frames.cjs, contact-sheets.py, motion-strips.py and game-walk.cjs.
- Judge on the episode page `/listening/<slug>`, at 1280 and 390 wide, light and dark.

## Read first

`docs/critics/rubric.md` (11 dimensions), `docs/critics/script-critic.md`, `picture-critic.md`, `motion-critic.md`, `set-critic.md`, `cast-critic.md`, AGENTS.md (Places and the stage, Audio), and the episode's file `src/lib/catalog/listening/episodes/<slug>.ts`. Dump the script with `scripts/critic/dump-script.test.ts` (see its header).

## What to score (each 1–10)

1. Rubric dimensions 1–11 (naturalness, story and arc, pacing, character and voice, natural Slovak, learning value, set and stage, sound, lip sync, motion and contact, player and game).
2. **Story climax**: does the episode build to a peak and pay it off with a set-up, a pause and a reaction? Is the ending funny or warm, never rushed?
3. **Set look**, per place: use set-critic.md on frames.
   **Cast**, per segment: use cast-critic.md on line stills and strips (every person and animal faces and reacts the way that being would).
4. **Interaction**: tap the scene's objects (the backdrop's things have tap/focus targets, and arrow keys move between them). Do the targets sit on the objects, and are all the obvious objects tappable? Does a tap do the right thing? Check the line player controls, the transcript, replay, the game and quiz paths (game-walk.cjs on every path, at 1280 and 390), and keyboard focus.
5. **Audio**: listen through the evidence you can get. Run the Scribe verify scores if the tooling allows (`scripts/audio/` has stt.ts and judge.ts; read AGENTS.md → Audio; ELEVENLABS_API_KEY is set). Check the timing between lines (no long dead air, no overlaps), ambience and foley that should be there, and that the loudness feels even. Say what you could not measure.
6. Anything else a learner or the owner would notice: the transcript, translations, the page layout around the stage, loading, dark mode.

## Report (your final message only, never a file)

A table of every dimension with its score. Then, for each dimension under 9, the concrete findings that cost the points, most important first, as JSON lines: `{"dim": "...", "segment": n, "line": n or null, "t_ms": n or null, "what": "...", "fix": "..."}`. Fixes must be concrete enough for another agent to do: which line to rewrite and to what (Slovak + English), which prop to move where. Then at most 5 nits. Put any frames you want the fixer to see in `a folder the person can open` (a network mount: use a trailing slash, never search the whole folder) and list their paths.

Clean up: kill your dev server and `git worktree remove --force <your worktree>`.
