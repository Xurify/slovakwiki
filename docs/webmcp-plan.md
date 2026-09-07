# WebMCP plan — slovak.wiki

Target: [The WebMCP Challenge](https://webmcp.devpost.com/) (Devpost / OpenAI). Deadline **Sep 3, 2026, 1:00 PM PDT**.

Judging, four equal criteria: WebMCP leverage · Execution · Potential impact · Creativity. Stage One is a pass/fail on "fits the theme and applies WebMCP". Judges may grade from the video and text alone, so the demo video carries most of the weight.

## Pitch

**A Slovak tutor that never types the answer for you.** ChatGPT opens slovak.wiki in its in-app browser, looks up words, walks you into a lesson or a drill, and — while you sit in a typed exercise — gives visible hints and explains your last attempt. The learner keeps Check, Reveal, and Next. Every tool result shows up on the page you are looking at.

Why WebMCP and not a plain MCP server: lesson progress lives on this device, the drill you are inside has live state (which item, submitted or not, what you typed), and hints render inside the exercise UI. None of that exists off-page.

## Constraints (verified against the rules)

- Public repo with an OSI license file visible in GitHub's About box. `Xurify/slovakwiki` is public; **no LICENSE yet → add MIT first**.
- Pre-existing project is fine if "meaningfully extended using WebMCP" after Aug 25 with dated commits. Every commit below lands in-window; the site itself was last pushed Aug 30, so the split is clean.
- Live HTTPS URL judges open in ChatGPT's in-app browser (or Chrome 149 with `chrome://flags/#enable-webmcp-testing`).
- ChatGPT supports the **imperative** API only: `document.modelContext.registerTool(...)`. No declarative HTML tools, no `navigator.modelContext` fallback. Unregister with an `AbortSignal`.
- Video < 3 min on YouTube with narration. Text description must answer: why WebMCP fits, how UX improves, what people + agents can now do together, how it was implemented.

## Runtime

Port `webmcp-runtime.ts` from flags.games (`register` / `dispose`, `objectSchema`, input readers, status callback). Astro is an MPA: each page is a fresh document, so registration per page load is natural. Islands unmount → `AbortSignal` fires.

```
src/lib/webmcp/
  webmcp-runtime.ts        register/dispose, schema + input helpers
  webmcp-gate.ts           ?webmcp=1 persisted · PUBLIC_ENABLE_WEBMCP · dev
  site-tools.ts            pure builders, deps injected (tests without DOM)
  WebMcpSiteTools.svelte   island mounted from SiteLayout.astro (client:idle)
  webmcp-status.svelte.ts  "connected" pill for the header
```

Gate: tools only register when `document.modelContext` exists, so enabling by default costs a normal browser one lazy chunk. Flip `PUBLIC_ENABLE_WEBMCP=true` for the judging window (Sep 4–21); judges will not read `?webmcp=1` instructions.

## Tools

### Site-wide (every page)

| Tool                   | Input                | Effect                                                                                                                                                                       | `readOnlyHint` |
| ---------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `lookup_word`          | `{ query }`          | Top matches from the browse index via `lookupDictionary()` (`$lib/search/dictionary-lookup.ts`, already client-side): slovak, english, category, register, url               | true           |
| `get_word_entry`       | `{ slug }`           | Headword, meaning, example sentences + translations, related entries, source, page path. Needs a static JSON endpoint (below)                                                | true           |
| `explain_phrase`       | `{ phrase }`         | Word-by-word gloss using the index (`forms` match inflected words), each with its entry url; marks unknown tokens. Agent does the teaching on top                            | true           |
| `get_learner_progress` | `{}`                 | Completed lessons per track from the on-device store (`lesson-progress/`), next lesson per track (`nextLessonInList`), practice set for that lesson (`practiceSetForLesson`) | true           |
| `open_lesson`          | `{ track, lesson? }` | Validate against `lessons` / `lessonTracks`, then `location.assign(lessonPath(...))`                                                                                         | false          |
| `open_practice_set`    | `{ set }`            | Validate against `practiceSets`, navigate to `/practice/<id>`                                                                                                                | false          |
| `open_reference`       | `{ topic }`          | Validate against `grammarEntries`, `caseTopics`, `pronunciationEntries`; navigate                                                                                            | false          |

Data endpoint: `src/pages/api/dictionary/[slug].json.ts` prerendered from `words` (`getStaticPaths` over ~7k lemmas — cheap static files, same `contentCacheKey` pattern as the pages). Returns the entry shape `EntryDetail.svelte` already renders.

### Practice page only (`PracticeSetPage.svelte` → `PracticePlayer.svelte`)

| Tool                    | Input                                             | Effect                                                                                                                                                                                     | `readOnlyHint` |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `get_practice_state`    | `{}`                                              | Set id/title, item index / total, task type, English prompt, context bubble, submitted?, grade, revealed?. **Expected answer withheld until submitted or revealed**                        | true           |
| `hint_current_exercise` | `{ kind?: "first-word" \| "shape" \| "grammar" }` | Renders a visible hint chip in the player: first word, word count + accent letters used, or opens `GrammarHintAccordion` / `ClozeHintPanel`. Never the full answer                         | false          |
| `explain_last_attempt`  | `{}`                                              | After Check: learner's attempt, correction, `feedback.why`, dictionary hrefs for words in the correction. Errors before submit ("The learner has not checked this one yet. Offer a hint.") | true           |

No tool types into the box, presses Check, Reveal, or Next, or marks a set complete.

### Lesson page only (`LessonRailPlayer.svelte` → `LessonInteraction.svelte`)

Same three tools with lesson naming: `get_lesson_state`, `hint_current_prompt`, `explain_last_attempt`. Scene lines already spoken are readable; the active "your turn" answer is withheld until the learner picks or submits.

### Host contract

Players expose a small host object instead of leaking component state:

```ts
interface PracticeToolHost {
  getSnapshot(): PracticeSnapshot; // answer omitted unless submitted || revealed
  showHint(kind: HintKind): HintResult; // returns what was shown
  getLastAttempt(): LastAttempt | null; // null before submit
}
```

Tool builders take the host and are unit-tested with a fake. Property test: for every practice item, `showHint(kind).text` never contains an accepted answer string (mirrors the flags.games no-spoiler test).

## Visible surfaces

- Header pill next to the theme toggle: "Agent connected" when status is `ready`; hidden otherwise.
- Hint chip inside the exercise card, styled like existing feedback chips (`PracticeExerciseFeedback` tones). Label it as coming from the agent.
- Toast on agent-initiated navigation: "Opened by your agent" with a Back link, so a learner never wonders why the page changed.

## Build order

1. `LICENSE` (MIT) + README "WebMCP" section. Commit. (10 min)
2. Runtime, gate, status, `WebMcpSiteTools.svelte` in `SiteLayout.astro`. `lookup_word`, `explain_phrase`, `get_learner_progress`, the three `open_*` tools. Tests for builders. (2–3 h)
3. `api/dictionary/[slug].json.ts` + `get_word_entry`. (45 min)
4. Practice host + three tools + hint chip. Property test. (2 h)
5. Lesson host + three tools. (1 h)
6. Header pill + navigation toast. (30 min)
7. `bun run typecheck`, `bun run test`, `bun run lint`, `bun run build`, `bun run index:search` unaffected (no content change). Husky runs typecheck on commit.
8. Deploy. Open `https://www.slovak.wiki/practice/meet-someone` in ChatGPT desktop's browser: ask for a hint, type the answer yourself, ask why it was wrong. Open `/` and ask "what does _Ako sa máte_ mean word by word?".
9. Video (< 3 min): homepage lookup → `explain_phrase` → agent opens the greetings drill → hint chip appears → learner types `Som z Kanady.` → Check → `explain_last_attempt` → agent opens the _byť_ reference page. Narrate the boundary once: "it never typed for me."
10. Devpost form: live URL, repo, video, description (four prompts), testing notes ("no login; tools register automatically in ChatGPT's browser").

## Out of scope for this entry

- No link to flags.games. Different product, different repo, different submission if any.
- No engine-style answer checking by the agent; grading stays in `gradeAnswer` / `gradeChoice`.
- No new lesson content. Audio pipeline untouched (no spoken text changes → no ElevenLabs run).
