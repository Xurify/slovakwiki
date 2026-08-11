---
name: visual-recap
description: >-
  Write a before/after recap of a learner-facing change as one HTML file in recaps/.
  Use for /visual-recap or when the user wants a readable summary of a UI or grading
  delta — not the flags.games plan.mdx workflow.
---

# Visual recap (slovak.wiki)

A recap is `recaps/<slug>.html`: plain HTML that links `./_shared.css`. Open it in any
browser. Write no CSS in the recap file — if something is unstyled, add the rule to
`_shared.css` so every recap gets it.

**Copy** `recaps/_template.html`. **Examples:** `clock-drill-face-first.html` (with a
visual), `slovak-time-grading-alignment.html` (several deltas, text only).

## When to write

- UI or learner flow changed (layout, feedback, drill chrome).
- Grading or copy was inconsistent and you fixed it.
- User asks for a visual recap or runs `/visual-recap`.

## Workflow

1. Capture the **Before** screenshot before you change anything (see below).
2. Copy `recaps/_template.html` → `recaps/<slug>.html`.
3. Capture the **After** screenshot once the change is running.
4. Fill the header, then one `section-title` + `compare` block per delta.
5. `bun run recap:index`
6. `bun run recap:open <slug>` — look at it, and fix what reads badly.

## Structure

```html
<header>
  <h1>Short title</h1>
  <p class="meta">slovak.wiki · YYYY-MM-DD · /path#anchor</p>
  <p class="brief">Two sentences: what a learner experiences now, and why.</p>
</header>

<h2 class="section-title">One delta</h2>
<div class="compare">
  <div class="side before">
    <p class="side-label">Before</p>
    <ul class="points">
      <li>Observable detail. <span class="quote">Exact on-screen text.</span></li>
    </ul>
    <p class="verdict">The problem it caused.</p>
  </div>
  <div class="side after">…</div>
</div>
```

Repeat `section-title` + `compare` for each unrelated delta. Close with
`<p class="note">` for context the columns cannot hold, an optional `.flow` row, and the
`footer.files` list.

## Writing the columns

- **`.points` are observations, not code.** What the learner saw, read, or had to do.
  One idea per `<li>`; both columns should line up item for item.
- **`.quote` holds literal on-screen Slovak or UI text** — the thing you would screenshot.
- **`.verdict` is one line**: the cost in Before, the benefit in After. Never restate the
  brief.
- No function names, file paths, or prop names outside `footer.files`.

## Screenshots (default)

Capture the real UI with chrome-devtools and put it in `.shot` above `.points`. Images
live in `recaps/<slug>/`.

```html
<div class="shot"><img src="./<slug>/after.png" alt="" /></div>
```

### Capturing

Take the **After** shot while the change is still running in the dev server. Take the
**Before** shot _before_ you edit, or from `git stash` / the previous commit — once the
old code is gone it cannot be recreated honestly.

1. `navigate_page` to the dev URL (`http://localhost:4321/…`).
2. `resize_page` to `900 × 1000` so Before and After share a viewport.
3. `take_snapshot`, find the `uid` of the widget that changed.
4. `take_screenshot` with that `uid` and a `filePath` **in the OS temp dir**.
5. `bun run recap:shot <slug> before|after <thatTempFile>` to file it under `recaps/<slug>/`.

Screenshot the **element**, not the whole page — a full page shot buries the delta.
`uid`s go stale after any DOM change, so re-snapshot before each capture.

> chrome-devtools-mcp only writes inside the OS temp directory unless it is launched with
> `--allowUnrestrictedPaths`, which is why step 4 goes to temp and step 5 moves the file.

### When a screenshot is impossible

If the Before state no longer exists and cannot be checked out, either drop `.shot` from
that column and describe the change in `.points`, or draw a small inline SVG for something
simple and verifiable, like a clock face:

```html
<div class="shot"><svg viewBox="0 0 260 150">…</svg></div>
```

Clock hands: minute = minute×6°, hour = hour×30 + minute×0.5, via `transform="rotate(…)"`.
Never rebuild a whole widget as HTML — it drifts from the real UI and reads worse than a
sentence.

## Do not

- Add a `<style>` block to a recap, or restyle one file only.
- Rebuild product components as HTML mocks.
- Use `plans/`, MDX, or flags.games tooling. Add no npm packages.

## Checklist

- [ ] Links `./_shared.css`, no inline styles
- [ ] Screenshots are real captures at a shared viewport, or the column has none
- [ ] Before and After columns have matching, parallel points
- [ ] Every `.verdict` says something the brief did not
- [ ] `bun run recap:index`
- [ ] Opened it and checked no `.quote` left orphan punctuation on its own line
- [ ] Readable at phone width (`.compare` stacks below 900px)
