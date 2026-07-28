# Slovak Wiki Rebrand Implementation

## 1. Pre-move safety checks

- Verify source repository is clean.
- Verify `C:\Users\Stream\Projects\slovakwiki` does not exist.
- Identify project-owned listener on port 4174 and stop it.

## 2. Move repository

- Move `C:\Users\Stream\Projects\slovak.wiki` to `C:\Users\Stream\Projects\slovakwiki`.
- Verify Git history and working tree remain intact.

## 3. Rebrand active project files

Files:

- `package.json`
- `bun.lock`
- `src/lib/components/Header.svelte`
- `src/lib/components/Footer.svelte`
- `src/lib/components/EntryDetail.svelte`
- `src/routes/+page.svelte`
- `src/routes/wiki/+page.svelte`
- `src/routes/learn/+page.svelte`
- `src/routes/quiz/+page.svelte`
- `src/routes/search/+page.svelte`

Actions:

- Change active Slovak Atlas product references to Slovak Wiki.
- Rename package to `slovakwiki`.
- Preserve historical plan documents without edits.

## 4. Restart and verify

- Restart dev server on port 4174 from new root.
- Search active app/config sources for stale product/folder names.
- Run `bun run check`, `bun test`, `bun run build`, and `git diff --check`.
