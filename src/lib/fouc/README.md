# FOUC boots

Blocking **F**lash **O**f **U**nstyled/**U**pdated **C**ontent helpers for SSR pages that must paint from `localStorage` (or similar) **before** first paint.

Theme preference still lives as a tiny head IIFE in `SiteLayout.astro` — different job (set attrs globally, no hydrate hide). This kit is for **page surfaces** that hide a region until a boot script finishes painting.

## Mental model

```
SSR HTML (empty / default progress)
  + inline CSS: hide [data-*-hydrate] while JS ran and ready not set
  + inline JSON payload (#*-boot-data)
  + blocking IIFE (generated) → read storage → paint DOM → set data-*-ready
  → region becomes visible with correct state
Client island (optional) → same paint again later (storage updates)
```

Pieces:

| Piece                                 | Role                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `$lib/fouc/gate`                      | `defineFoucSurface`, hide-until-ready CSS, `markFoucReady` |
| `$lib/fouc/boot`                      | JSON escape, read payload from DOM, `runFoucBoot`          |
| `$lib/components/fouc/FoucBoot.astro` | Inline style + JSON + script shell                         |
| Domain entry (`boot-entry.ts`)        | What to paint (storage → view → apply)                     |
| `bun run fouc:boot`                   | Bundle entry → committed IIFE module                       |

## Why generate an IIFE?

The boot must be a **classic blocking** `<script is:inline>` — no modules, no Vite chunk, no await. Astro cannot import a TS module into that slot at runtime.

So:

1. You write normal TypeScript in `*-entry.ts` (imports `$lib/...`).
2. `bun run fouc:boot` runs `bun build --format=iife --target=browser --minify`.
3. Output lands in a `*.generated.ts` file as `export const FOO_BOOT_SCRIPT = "…"`.
4. Astro inlines that string.

Client islands import the **same** paint helpers (not the IIFE). One paint path; boot is just that path bundled for pre-paint.

## Commands

```bash
# Rebuild every registered boot
bun run fouc:boot

# Rebuild one (id from scripts/fouc/registry.ts)
bun run fouc:boot -- lessons
```

Stale check: `scripts/fouc/generate.test.ts` fails CI/local test if a committed `*.generated.ts` does not match a fresh build. After editing an entry / anything it imports, regenerate and commit.

## Add a new FOUC surface

1. **Surface id** — pick a short namespace (`practice`, `wiki`, …).

```ts
// e.g. src/lib/practice/fouc.ts
import { defineFoucSurface } from "$lib/fouc/gate";
export const PRACTICE_FOUC = defineFoucSurface("practice");
```

Markup hydrate hooks: `data-practice-hydrate` (from `hydrateAttr`). Ready attr becomes `data-practice-ready`.

2. **Pure view + DOM apply** (optional but preferred) — keep logic out of the entry; entry only wires storage → view → apply.

3. **Boot entry** — browser-only, no Astro/Svelte, no huge content graphs:

```ts
import { readFoucBootPayload, runFoucBoot } from "$lib/fouc/boot";
import { PRACTICE_FOUC } from "$lib/practice/fouc";

runFoucBoot(PRACTICE_FOUC.readyAttr, () => {
  const payload = readFoucBootPayload<MyPayload>(PRACTICE_FOUC.dataId);
  if (!payload) return;
  // read localStorage, paint…
});
```

4. **Register** in [`scripts/fouc/registry.ts`](../../../scripts/fouc/registry.ts):

```ts
{
  id: "practice",
  entry: path.join(ROOT, "src/lib/practice/boot-entry.ts"),
  out: path.join(ROOT, "src/lib/practice/boot-script.generated.ts"),
  exportName: "PRACTICE_BOOT_SCRIPT",
}
```

5. **Generate** — `bun run fouc:boot -- practice` (or all).

6. **Astro page** — put `FoucBoot` early in the document (before hydrate regions):

```astro
---
import FoucBoot from "$lib/components/fouc/FoucBoot.astro";
import { PRACTICE_BOOT_SCRIPT } from "$lib/practice/boot-script";
import { PRACTICE_FOUC } from "$lib/practice/fouc";
---

<FoucBoot surface={PRACTICE_FOUC} payload={payload} script={PRACTICE_BOOT_SCRIPT} />
```

7. Wrap progress UI: `data-practice-hydrate` (or whatever `hydrateAttr` is).

`html.js` must already be set (theme head script in `SiteLayout`). Gate CSS is `html.js:not([data-…-ready]) …` so no-JS users still see SSR content.

## Lessons consumer

- Surface: `$lib/lesson-progress/fouc`
- Entry: `$lib/lesson-progress/boot-entry.ts`
- Paint SSOT: `progress-view.ts` → `apply-progress.ts`
- Shell: `LessonsProgressBoot.astro` → wraps `FoucBoot`
- Island: `LessonsProgressClient.svelte` re-paints + marks ready after hydrate

## Do / don't

- **Do** keep boot entries tiny; avoid importing lesson catalogs / dictionary blobs into the entry.
- **Do** regenerate + commit `*.generated.ts` when entry or its imports change.
- **Do** always mark ready (`runFoucBoot` does this in `finally`) so a paint bug does not leave the page blank.
- **Don't** put FOUC gate CSS in `styles.css` as a permanent global unless every page needs it — prefer the inline style from `FoucBoot`.
- **Don't** hand-maintain a second ES5 copy of the paint logic.
