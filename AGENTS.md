# slovak.wiki — Agent conventions

Astro + Svelte 5 + Tailwind CSS v4. Read this before UI or styling work.

Domain-specific authoring and pipelines live next to the work — not here:

| Need                                        | Where                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| Dictionary / frequency / audio / images ops | [`scripts/README.md`](scripts/README.md)                                    |
| Hand-add a lemma                            | [`content/dictionary/README.md`](content/dictionary/README.md)              |
| Create or expand a lesson                   | [`docs/lesson-authoring.md`](docs/lesson-authoring.md) · `new-lesson` skill |
| Write a listening episode (podcast)         | [`docs/listening-authoring.md`](docs/listening-authoring.md)                |
| Voice roster                                | [`content/audio/README.md`](content/audio/README.md)                        |
| FOUC / blocking pre-paint boots             | [`src/lib/fouc/README.md`](src/lib/fouc/README.md)                          |
| Slovak linguistic accuracy                  | [`slovak-language` skill](.agents/skills/slovak-language/SKILL.md)          |

## Tooling

**Bun** is the package manager and script runner for this repo (`bun.lock`).

- Install: `bun install`
- Scripts: `bun run <script>` (e.g. `bun run dev`, `bun run test`, `bun run format`, `bun run lint`, `bun run typecheck`)
- Prefer Bun over npm/pnpm/yarn for installs and script runs
- Do not refresh or commit `package-lock.json`; use `bun.lock`

### Scripts (`scripts/`)

`bun run typecheck` (`astro check`, then `svelte-check`) typechecks **`scripts/**` as well as `src/`**, `.svelte` files included: `astro check` alone does not report type errors inside them. Husky pre-commit runs it after Prettier when the commit stages `src/` or `scripts/` code (or `package.json`, `tsconfig.json`, `astro.config.ts`, `svelte.config.js`, `eslint.config.js`). Manifest and other content-only commits skip it. New or edited scripts must still pass `bun run typecheck` before commit.

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
- **Listen back before calling dialogue done.** For each new dialogue clip, Scribe hears the line as written (`generate.ts -- --verify`), the pauses fall where the script puts them (`ffmpeg -af silencedetect`), and the mouth follows the voice (`bun scripts/audio/lipsync.ts -- --only "…"`, 80% or better). The tone of a directed line only a person can judge: list it in the PR's QA. The slips the first episode shipped are listed in [`docs/listening-authoring.md`](docs/listening-authoring.md) under **Slips we shipped**; read a script against them.

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

## Styling: Tailwind first (non-negotiable)

**Do not add new custom CSS classes for layout, spacing, typography, borders, or colors.**

1. Prefer Tailwind utility classes in the markup (`class="flex items-start …"`).
2. Prefer a Svelte component when the same pattern repeats (button, section label, rail, ruled list).
3. Touch `src/styles.css` only for:
   - `@theme` / design tokens (`:root` CSS variables)
   - true global base styles (`html`, `body`, `a`, `button`, headings, focus, reduced motion)
   - rare cases Tailwind cannot express cleanly

### Forbidden pattern

```css
/* ❌ Do not add rules like this */
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  border-bottom: 1px solid var(--line);
  padding-bottom: var(--space-4);
}
```

### Required pattern

```svelte
<!-- ✅ Utilities in markup -->
<div class="flex items-start justify-between gap-6 border-b border-slate-200 pb-4">…</div>
```

Or extract a small component if reused in 3+ places.

### Shared primitives

Keep Tailwind classes colocated in small Svelte components under `src/lib/components/ui/`.

- Use `Button.svelte`, `TextLink.svelte`, `Eyebrow.svelte`, `Lead.svelte`, `PageShell.svelte`, and `ContextRail.svelte` where appropriate.
- Components own their default Tailwind classes and expose a `class` prop only for layout-level adjustments.
- Do not export class-string bundles or `cx` helpers for page-level styling.
- Add Bits UI only for behavior-heavy, accessible widgets (dialog, popover, select, tabs, accordion, tooltip). Do not introduce it for static cards, text, or layout.

### Design tokens

Palette and spacing are mapped into Tailwind via `@theme` in `src/styles.css`:

- Colors: `bg-slate-*`, `text-blue-*`, `border-slate-200`, `bg-rose-*`, `bg-emerald-*`, etc. (aliased to the Slovak Wiki palette)
- Fonts: `font-sans` (UI), `font-serif` (reading)
- Prefer theme utilities over raw `var(--…)` in components

### Motion

One vocabulary site-wide, so interactions read as the same calm reference site as the pages:

- **State changes** (hover, pressed, selected, focus): transition `color`, `background-color`, `border-color`, `box-shadow`, `opacity` over `duration-150 ease-out`. Nothing else moves.
- **Overlays** (drawer, menus, popovers): one translate or fade on the panel, `duration-200 ease-out`, elevated with `shadow-(--shadow-float)`. No staggered children.
- **Content that appears** (feedback, revealed dialogue lines, results): `animate-rise` (200ms fade + 4px). Once, on mount.
- **Icon state** (sound on/off, menu open/close, theme): swap the icon. No scale/blur morphs.
- **Stick-figure cast** (`src/lib/stick-figure/`: on podcast episode pages, and at `/dev/stick-figures` and `/dev/scenes`; see **Stick-figure scenes**): figures move only while a line plays. The speaker gestures (planned from the line) and moves its mouth (from the clip's loudness track); the speaker turns to whoever they speak to in a 300 ms flip that slows into and out of edge-on, the others turn to the speaker a beat later, nearest first (`turns.ts`), and the one spoken to may answer with one silent gesture (lean in to a question, nod at an answer or thanks, hold up what is pointed at in their hands) or walk over to see what they are shown. In a talk, a reply that does not fit is taken as a Slovak would take it, with one reaction before they answer it: a puzzled tilt, a laugh, or folded arms. Someone who claims what is held up ("Áno, moje!") reaches out and takes it, and someone handed something ("Nech sa páči.", "…je pre teba.") reaches for it and keeps it. Someone called in under an umbrella ("Poď sem, pod dáždnik.") comes right up, shoulder to shoulder under the canopy (`SHELTER_WIDTHS`). A speaker who names something in the backdrop or held up for them points at it on its word with a free hand, turning to it if it is behind them: a straight reaching arm for `tamten`, a bent one for `tento`. Where the backdrop has two of a thing, `tento` means the one by the cast and `tamten` the one further off, and only that one lights up; a demonstrative on its own points back at the noun it agrees with ("Tamten je lacnejší."). Someone who arrives with a hello walks on during the line before; someone whose last line takes them away walks off the stage. A word with a picture (a country's flag) pops it over the speaker's head with `animate-rise` for under two seconds. Then they return to rest. No idle sway, breathing, or blinking. Under reduced motion each gesture is one held pose, turns and walks are instant, and the mouth stays still.
- **Weather:** rain and snow on the stage fall in a seamless loop (`animate-fall`), near drops faster than far ones, and fade in and out over 900 ms as the lines change the weather. It is the one loop on the site; reduced motion holds it still.
- **Not used:** `active:scale-*`, hover zooms, 3D "key" lips, pulsing or drifting loops, bouncy easings. Reduced motion is handled globally in `styles.css`.

### UI composition

General rules for status blocks, compare views, summaries, and any “nested card” moment:

- **Shell stays neutral; content carries tone.** Page chrome (footer, rail, shell) uses `bg-paper` / `bg-surface` and slate borders. Semantic color (success, error, hint) belongs on the **inner** block — not shell + full-bleed band + nested card (“stripe sandwich”).
- **One container, internal dividers.** For compare/contrast or multi-part summaries: one inset panel (`ring-1 ring-inset` on `bg-surface`), rows with a light tint and `border-b` between them. Not multiple sibling boxes each with their own border and radius.
- **Secondary copy outside the highlight.** Primary line + status tint stay in the colored row; teaching notes, metadata, and “why” sit below or beside — not inside the success/error block.
- **Do not repeat on-screen context.** Drop redundant glosses, labels, or answers the learner already saw one step above.
- **Variant / density on the component.** Same widget, tighter when inline (`compact`) vs roomier in recap or detail (`default`) — not duplicate components or page-specific markup.
- **Colocated `*-ui.ts` for repeated patterns.** Shared class bundles live next to the widget (e.g. `practice-feedback-ui.ts`); page shells handle layout only.

Reference: miss feedback — `PracticeExerciseFeedback.svelte` + `practice-feedback-ui.ts`.

### Avoid the generated look

The site should read like a calm reference someone made by hand, not a template. Each pattern below came up in review as "AI slop". Don't add them, and remove them from any page you touch.

**Labels and titles**

- **No small caps.** No tiny uppercase tracked labels (`CHAPTERS`, `WORDS YOU'LL HEAR`). Label lists, rails and form groups in sentence case with `Eyebrow.svelte` or `eyebrowClass`. Counts are plain text: `1 of 6`, `Question 1 of 3`.
- **No kicker over a heading.** Drop a word above a title that only repeats it: `Track` over "Everyday Slovak", `Area` over "Nouns", `Review` over "Nothing to review today". Keep a line above a title only when it adds something, such as the track a lesson belongs to on the continue card.
- **No meta strip over a title.** A dot-joined row above the h1, like `Ten, tá, to · 4 min · A1–A2` or `Case 2 of 6 · Direct object`, is the template signature. When a reader needs the facts before starting, list them under the lead as labelled pairs (`Length 4 min`, `Level A1–A2`, `Grammar ten, tá, to`), as the listening episode page does. Otherwise leave them to the body, which often says them already.
- **One language in a card or list title.** A story or episode name is the Slovak line alone (`Kde je ten kľúč?`). Its English goes under the title on its own page, not after a `·` on the card. A Slovak and English pair elsewhere sits side by side with a gap, as in `Koho? Čo?  Whom? What?`.
- **Name stories after a line.** An episode or story dialogue is named after a line the learner will hear, not after the grammar it teaches.

**Layout**

- **No dot legends.** A coloured dot never looks like the mark it explains. Explain marks with a sentence that uses a real word styled exactly like the rows: "the word you pick is blue, like _táto_".
- **No stacked headings.** A section heading, a subtitle and a card title in a row before the first action are three labels for one thing. Keep one.
- **One primary action per state.** Everything else is a quiet text button, shown only when it applies.
- **No empty sections.** Render a heading only when its content exists. Astro passes a named slot even when its condition is false, so check the data, not the snippet.
- **No dead width.** Rows and table columns fit their content. A short phrase list is a grid of cells, not two columns pushed to the edges.
- **No decoration for its own sake:** no gradient text, glows, sparkle or emoji icons, or badges on everything.

**Content**

- **Restyle, don't delete.** When a block looks wrong, change how it looks and keep what it says. The Slovak case terms on contrast cards were once removed for a cleaner look and had to come back. Ask before you drop information.
- **Copy never contradicts the UI.** "The text opens after three questions" next to a Show text button is wrong. Say what happens in plain words, and name buttons with verbs: Listen, Next chapter, Show text.
- **Plain copy.** No hype ("unlock", "master", "dive into", "journey", "seamless") and no emoji in UI text. Exclamation marks belong in the Slovak dialogue, not in the chrome.
- **One feature, one home.** Don't embed a second interactive copy of a feature on a reference page. Link to where it lives: grammar pages link to the listening episode instead of running their own player.

## Astro islands (hydration)

**Default: SSR static.** Hydrate only widgets that need browser JS. Nested Svelte inside an SSR parent does **not** hydrate — islands must be imported in `.astro` and passed via slots/snippets.

### Gold pattern

```astro
<!-- SSR shell — no client:* -->
<HomePage>
  <HomeHeroSearch client:load slot="heroSearch" {popularWords} />
</HomePage>
```

```svelte
<!-- HomePage.svelte -->
let { heroSearch }: { heroSearch: Snippet } = $props();
<!-- … -->
{@render heroSearch()}
```

### Do / don't

| Do                                                                                            | Don't                                                                               |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `client:load` / `client:only` on the interactive child                                        | `client:load` on the whole page shell for a few buttons                             |
| Pass islands through Astro `slot="…"` → Svelte `Snippet`                                      | Import interactive widgets only inside an SSR Svelte parent and expect them to work |
| Prefer `client:only="svelte"` when SSR would mismatch (random state, `localStorage`-first UI) | Hydrate large prose/reference trees “just in case”                                  |

**FOUC boots:** Shared kit in [`src/lib/fouc/`](src/lib/fouc/) (see [`README`](src/lib/fouc/README.md)). Lessons use it via `LessonsProgressBoot` (`stage="gate"` before page, `stage="script"` after) + `data-lessons-hydrate` / `data-lessons-ready`. Paint SSOT: `progress-view.ts` → `apply-progress.ts`; client island and generated IIFE share that path. After changing a boot entry or its imports, run `bun run fouc:boot` (or `bun run fouc:boot -- lessons`) and commit the `*.generated.ts` file. The generator refuses any Bun other than `package.json` `packageManager` — a newer minify changes the IIFE and fails `scripts/fouc/generate.test.ts` on CI.

Full-page hydrate only when the page **is** the interactive app (filters, player, localStorage-first UI), not static chrome with a widget. Prefer SSR shell + small slotted island for browse/list pages; do not embed huge datasets in HTML.

### Checklist before adding `client:*`

- [ ] Does this component need events, `localStorage`, or browser APIs?
- [ ] Can the parent stay SSR with this as a slotted island?
- [ ] If yes to full-page hydrate: is the page primarily interactive (not mostly prose)?

## Components

- Put reusable UI in `src/lib/components/`, grouped by domain (`dictionary/`, `lessons/`, `practice/`, …).
- Put page shells next to that domain (e.g. `DictionaryBrowsePage` in `components/dictionary/`). Home is `src/lib/home/`. Search page chrome is `src/lib/search/SearchPage.svelte`.
- Keep `src/pages/` to `.astro` routes (and endpoints). Do not colocate `.svelte` there.
- Use standard HTML/Svelte elements only — no invented component names, no Framer Motion / motion libraries unless already imported in that file.
- Colocate markup + Tailwind. Avoid a second stylesheet for a component.

## Stick-figure scenes

The animated cast, its places and the scene player. Logic lives in `src/lib/stick-figure/` (plain TypeScript with tests), drawing and UI state in `src/lib/components/stick-figure/`. The stage acts out podcast segments on the episode page: `ListenScene` in `ListenStage` plays each line the segment's `LinePlayer` hands it, so voice, mouth and moves stay in step, and `episodeStages()` in `scene-sources.ts` builds each segment's lines and place (a chapter's `stage`, the studio unless set). A segment that plays on from the last fades in on its place with the break's sting (`playSegmentCue`) and lets the place be heard before its first line. The sound of the place plays under the voices there unless the learner turns Background sound off, and one player carries it from segment to segment. The line being said shows under the stage as a subtitle (`SceneCaption`, the word being said lit, from its first word until the next line starts) unless the learner turns Subtitles off; the strip is a line tall before the first line comes, so the controls do not jump then, and grows only when a line wraps. The lab (`/dev/stick-figures`) and the scene player with its games (`/dev/scenes`) are still prototypes. How things move is under **Motion** above; these are the decisions behind the rest.

**Animate from the data, never by hand**

- Gestures are picked from the Slovak text, one per sentence (`line-gesture.ts` → `line-plan.ts`): a greeting waves, _áno_ nods, _nie_ shakes, a question opens the hands, an exclamation gets a beat of the hand (`stress`), words that trail off a tilt of the head (`muse`), and a plain statement a small open hand (`tell`). A long sentence gets a beat every 2.6 s, `tell` and `muse` in turn, never the same move twice running: one gesture for every sentence read as a tic. Set `DialogueTurn.gestures` only when the guess is wrong; lesson validation rejects more gestures than sentences.
- Mouths follow the clip's loudness and vowel track in `content/audio/mouth.json`, which `scripts/audio/generate.ts` writes with every clip. Never drive a mouth from a timer: timer mouths matched the voice at r = 0.29, the track at r = 1.00. The track is aligned on the clip text, pauses and all; `scripts/audio/lipsync.ts` scores it against Scribe's word times.
- Check a changed stage by playing it in a browser, not only in its snapshot. The snapshot did not show three mouths moving on one line, a five-second walk-on, or the same hand on every sentence; a Playwright script that samples the figures each frame did.
- Staging (who faces whom, enters, leaves, walks over, points, hands something over) is worked out from the dialogue. `line-reading.ts` reads each line once (who it is said to, what changes hands), `staging.ts` turns that into moves, and `directScene` puts them together in one pass, one record per line. Where that leaves everyone standing is `stage-blocking.ts`, on the measured `StageFrame`; StickStage only animates the change. Change a rule there, with a case in `scene-direction.test.ts` or `stage-blocking.test.ts`; never stage one scene by hand. A line sets `to` only when the order of replies guesses the listener wrong, and `stays` keeps Alex on stage after a goodbye.
- What differs by place is a field in its row of `places.ts` (`PLACES`), not an `if` in a component: its label, sky and sun, things, sounds, the ground underfoot, staff, where the cast gathers, its window glass. Hosts stay at their mics in the studio because its row sets `atMarks`, which drops walks there. A new place is a row there plus its drawing in `StickBackdrop`'s `DRAWINGS`; both are typed over every `StageSetting`, so leaving one out fails the typecheck.

**Places and the stage**

- Backdrops are drawn SVG in the cast's style with fixed light paints, so the dark-ink cast reads in both themes. Keep a place's landmark near the middle or above head height.
- The stage is twice as wide as tall, up to 300px, and figures scale with its height. Check a changed place at 390px and at desktop width; Find it asks only for what the stage shows.
- The sky (sun, stars, clouds) is drawn behind the scenery. The sun stands at its place's `sun` spot, and `places.test.ts` fails when it leaves what a phone shows or touches a thing's box. The sun is a thing to tap or find only while it is out (`thingsIn`).
- Scenery that several places share (a room's wall and floor, wall clocks, town trees, street lamps, benches, plants) is a part in `backdrops/`, placed by `PARTS` in `backdrop-parts.ts`; its tap box comes from the same numbers, so moving it there moves both. Any other tappable thing's box in its place's `things` is in backdrop units and must match the drawing: move both in the same change. The words for things live in `thing-words.ts`, the geometry in `backdrop-geometry.ts`, and what each weather does (open sky, what falls) in `scene-mood.ts`.
- Each character reads as themselves at a glance (Marek has curls so he is not a second Alex). Their colours and small marks (ear, blush, glasses, sleeves, scarf, name tag) are one entry in `looks.ts`. The head (hair, face, a robot's visor) is `StickHead`, drawn once: the figure scales it onto its rig and the portrait beside a line (`LessonCharacterAvatar`) shows it from the front over a bust in the clothes `StickTorso` dresses the figure in. `drawings.test.ts` renders every prop, picture and character, fails a new id until it has a drawing of its own, and fails a portrait whose head is not the figure's. On stage the learner's lines belong to Alex, not "You" (`stageName`), and a line nobody says, like a board or a notice, gets no name tag.

**Weather, dress and sound**

- The words set the mood: `sceneMood` reads the lines up to the current one for the hour and the weather. Past the last line, rain and snow let up. Weather changes fade over `WEATHER_FADE_MS`.
- Falling rain and snow are an HTML layer (`StickWeather`), never animation inside the backdrop SVG: WebKit repainted the whole stage every frame and dropped to 7.5 fps.
- `dress.ts` decides what the weather and the place do to a figure's things: umbrella up in rain, scarf in snow, neither indoors, and on the head what the place's row hands out (`headwear`: the studio's open-back headphones; a headset with a boom mic is drawn too, for a place or character to come). Each look's `crown` says where a headband sits over its hair. Once open, an umbrella stays open until the stage folds it with `foldUmbrellas()`, on boarding the tram or at the scene's end. It never folds by itself. The figure gets what is in its hand as `held: { id, open }`, and the stage sets `open` from the dress when the umbrella comes out. A new item that follows the weather works the same way: a field in the dress, and an explicit stage call to change it.
- Every walk is heard: `playSteps` puts a heel and a scuff on each footfall, in the sound of the place's `ground` (stone clicks, boards knock, carpet thuds, a path crunches) and of the walker's `shoes` in `looks.ts` (heels click, soft soles land dull), as the tram's arrival has its cue. These play with background sound off, but not with sound off. A step is about a person's stride for the figure's height (`STRIDE` in `rig.ts`), so someone walking on from the edge takes two or three seconds, and nobody speaks to them, or answers them, until they are there (`ready`).
- Background sound is synthesized with Web Audio in `ambience.ts`, so there is nothing to load. After dark a square's murmur and the wind drop to a fraction (`dark` on the ambience), since few are about and the wind falls with the day. In the scene player it is off until the learner turns it on, plays steadily under the voices, and one player lasts the visit: `set()` fades layers in and out instead of restarting them.

**Player and games**

- `/dev/scenes?scene=<id>` opens one scene; use these links in PR QA lists.
- Modes are Watch, Play as (Pick the line, Build it, Say it, Adaptive) and Find it. A game that is not about the scene picked is a scene of its own in the list, under Prototype with the other scripts, not a mode of the scene picked.
- Find it asks in Slovak only, since English would give the answer away. Someone on stage asks each thing and answers each tap out loud (`findAsker`, `findSayings` in `scene-find.ts`; the clips reach the generator through `findTurns()` in `scene-sources.ts` and the player through `Scene.finds`), gesturing instead only where a clip is missing. It names each find in English after the tap and ends with the case behind the forms.
- A talk (`talk.ts`) is a graph: the other person's lines, then Alex's replies. A reply that fits leads to a node and is voiced. A slip carries `why`, a reaction (`puzzle`, `laugh`, `frown`) and a voiced answer. `talk.test.ts` checks every talk: all nodes reachable, slips lead nowhere, ends are goodbyes, ty or vy fits who is spoken to. A talk has no script ahead of the learner: the text under the stage lists only what has been said.
- A talk has a casual topic, and its intro says who the person is to Alex. When a talk gets long or its topic deserves more, give it a game of its own rather than lengthen the day.
- Say it records in the browser and keeps the take there. Nothing is uploaded.
- Every voiced scene line gets a clip and a mouth track (see **Audio**), slip answers included. Talks reach the generator through `dayTurns()` in `scripts/audio/shared.ts`.

## Loading states

Pick the loading pattern by wait type:

- **Real async waits** (e.g. Pagefind search): use `src/lib/components/ui/DotLoader.svelte`.
- **Client hydration gates** / known layout placeholders: use **layout skeletons**, not the dot loader.

**Keep skeletons honest.** Any skeleton must stay a recognizable stand-in for the real UI it replaces. If that target layout changes drastically, update the matching skeleton in the same change. Do not leave a stale skeleton that no longer resembles the loaded page.

## Svelte readability (flags.games-style)

Prettier wraps lines; **airiness is manual**. Keep markup breathable:

1. Blank line between script clusters: imports → props → state → derived → effects/lifecycle → functions.
2. Never crush control flow: `{#if}` / `{:else}` / `{#each}` / `{#key}` open on their own line, body indented, close on its own line.
3. Blank line between major markup sections (`<nav>`, `<header>`, each `<section>`, `<footer>`).
4. Long Tailwind: split into a multiline `cx("…", "…")` on the element. Do not hoist classes into local `const …Class = "…"` variables in the script; keep them on the markup they style.
5. Sibling interactive elements (`<a>`, `<button>`, `<span>`) on separate lines inside flex/grid rows.

## Stack habits

- Svelte 5 runes (`$props`, `$state`, …) as used in the repo.
- TypeScript strict; no `any`.
- Keep changes focused: don't drive-by refactor unrelated files.
- Don't invent docs the user didn't ask for.
- **Format before done.** After any TS / Svelte / Astro / content / script edit: run `bun run format` (or at least `bun run format:check`). Not UI-only — lessons, practice, learning helpers, and tests count. Pre-commit `lint-staged` also runs Prettier on staged files, but agents often skip hooks; CI `format:check` still fails the PR. After Prettier, re-check Svelte `{#if}` / `{#each}` blocks weren't re-crushed. Skip reformatting pipeline JSON — `words.json`, related-clusters, curated-examples, frequency dumps, audio/image manifests are in `.prettierignore`.
- **Lint + typecheck when risk is high.** Run `bun run lint` and `bun run typecheck` (alias: `bun run check`) before calling done when:
  - many files changed in one pass, or
  - types, exports, shared helpers, content loaders, learning/session logic, Astro pages/islands, or package scripts/config likely shifted
  - **any** new or edited file under `scripts/` (see **Scripts** above — mandatory)
  - Skip for tiny copy-only or pure Tailwind class tweaks if `format` already ran. Fix failures before finishing — pre-commit runs `bun run check` only when staged files include `src/` or `scripts/` code (or root TS/Astro config), and CI runs `bun run typecheck` on every PR.

## Checklist before finishing UI work

- [ ] Ran `bun run format` (or `format:check` clean)
- [ ] If multi-file / type-touching / shared-logic change: `bun run lint` + `bun run typecheck` clean
- [ ] No new selectors added to `styles.css` for one-off layout/look
- [ ] Styling done with Tailwind utilities and/or an existing/shared component
- [ ] Used theme tokens (`slate` / `blue` / `rose` / `emerald`, `font-serif`, …) not one-off hex in components
- [ ] Nothing from **Avoid the generated look**: no small caps, kickers, meta strips over titles, dot legends or copy that contradicts the UI
- [ ] Desktop + mobile still look correct
- [ ] If a layout with a skeleton changed drastically: matching skeleton updated
- [ ] Hydration: no new full-page `client:*` on mostly-static shells (see **Astro islands**)

## Pull requests

Every PR description has a **QA** section ([template](.github/pull_request_template.md)): one link per page or part the PR changes, so review starts with a click.

- **Link the Vercel preview**, not production: `https://slovakwiki-git-<branch>-xurifys-projects.vercel.app` + path, with each `/` in the branch name turned into `-` (`feat/grammar-contrast-cards` → `slovakwiki-git-feat-grammar-contrast-cards-xurifys-projects.vercel.app`). Vercel shortens long branch names; if the `vercel[bot]` comment's **Preview** link has a different host, use that host.
- **Point at the exact part**: a section anchor (`/grammar/possessives#contrasts`), a search (`/search?q=tohto`), a practice item (`/practice/possessives?at=grammar%2Fpossessive-svoj-choice`). A bare page link is only for a new page.
- **One checkbox per link, saying what to check**: `- [ ] [Possessives — Who is the owner?](…/grammar/possessives#contrasts): five cards, case label on each, audio on every sentence`. Name the viewport or theme when the change is layout (mobile, dark).
- **Cover every surface the diff touches**, including pages that only reuse a changed component or link to a new page.
- When a later push adds a page or moves an anchor, update the QA list in the same push.
- Docs-only PRs get no preview build (`scripts/vercel-ignore-preview.mjs`); link the changed files on GitHub instead.
