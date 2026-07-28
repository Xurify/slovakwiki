# Editorial Reference System Implementation

## 1. Establish typography and global materials

Files:

- `package.json`
- `bun.lock`
- `src/styles.css`

Actions:

- Add local Source Serif 4 variable font.
- Define UI and reading font variables.
- Replace white/blue system with warm canvas, cream papers, olive-black ink, ochre accent, fine warm rules, and accessible red/green states.
- Add subtle CSS paper texture independent of content contrast.
- Preserve focus, reduced-motion, shared button, shell, and responsive primitives.

Checkpoint:

- `bun run check`

## 2. Build the framed application shell

Files:

- `src/routes/+layout.svelte`
- `src/lib/components/Header.svelte`
- `src/lib/components/Footer.svelte`

Actions:

- Wrap Header, route content, and Footer inside one desktop application frame.
- Reorder header into brand, centered search, and right navigation.
- Keep global search behavior, active navigation, skip link, and semantic footer.
- Make frame edge-to-edge and header two-row at mobile widths.

Checkpoint:

- Verify header search and active navigation at desktop and mobile widths.

## 3. Rework Wiki into the reference layout

File:

- `src/routes/wiki/+page.svelte`

Actions:

- Preserve filter/search state and result routing.
- Use left browse/topics rail, central results column, and right context rail.
- Restyle search, alphabet, table, and active filters using editorial paper/rule language.
- Keep mobile filter controls and move the context rail below results.

Checkpoint:

- Exercise type, topic, letter, text search, and reset controls.

## 4. Rework shared entry pages

File:

- `src/lib/components/EntryDetail.svelte`

Actions:

- Build a three-region layout shared by dictionary, grammar, and pronunciation.
- Add compact left entry context rail and right on-page/related rail.
- Add stable section anchors for usage, examples, and source.
- Preserve content data, loaders, breadcrumbs, sources, and related routes.

Checkpoint:

- Inspect one route from each entry type.

## 5. Adapt Home dashboard

File:

- `src/routes/+page.svelte`

Actions:

- Convert current panels into editorial reference modules.
- Keep intro search, featured entry, beginner path, word index, grammar links, and pronunciation links.
- Use asymmetrical reading/dashboard columns inside the shared frame.

Checkpoint:

- Verify home search and all route links.

## 6. Adapt Learn workspace

File:

- `src/routes/learn/+page.svelte`

Actions:

- Create left lesson outline, central phrase article, and right progress/usage rail.
- Preserve lesson state, native progress, completion, review, live region, and phrase selection.
- Stack right rail below content at tablet and all regions at mobile.

Checkpoint:

- Complete a lesson, review it, and select phrases directly.

## 7. Adapt Quiz workspace

File:

- `src/routes/quiz/+page.svelte`

Actions:

- Create left progress rail, central question/answers, and right score/instructions/feedback rail.
- Preserve question generation, scoring, disabled answered options, correct/wrong labels, live feedback, results, and restart.
- Retain non-color status text.

Checkpoint:

- Test correct and incorrect answers, final result, and restart.

## 8. Adapt Search and reusable entry rows

Files:

- `src/routes/search/+page.svelte`
- `src/lib/components/EntryCard.svelte`

Actions:

- Keep URL-derived query and diacritic-insensitive search.
- Use dense editorial rows in a results reading column with compact context.
- Preserve result count live region and empty state.

Checkpoint:

- Search Slovak with and without diacritics and search an English meaning.

## 9. Final responsive and production verification

Actions:

- Inspect 1440 × 900, 390 × 844, and 320-pixel widths.
- Confirm no horizontal document overflow.
- Check keyboard focus, sticky regions, active navigation, and mobile filter access.
- Run:

```text
bun run check
bun test
bun run build
git diff --check
```
