# Unframed Editorial Field Implementation

## Files

- `src/styles.css`
- `src/lib/components/Header.svelte`
- `src/lib/components/Footer.svelte`

## Steps

1. Remove desktop body padding and visual card treatment from `.app-frame`: width constraint, border, radius, and shadow.
2. Retain paper material as a full-width semi-transparent field over the existing textured canvas.
3. Remove header/footer endpoint rounding. Keep their regional divider rules.
4. Keep route-level `.shell` widths and all existing responsive breakpoints unchanged.
5. Verify desktop and mobile visual hierarchy plus no horizontal overflow.

## Verification

- `bun run check`
- `bun test`
- `bun run build`
- `git diff --check`
- Inspect `/`, `/wiki`, `/learn`, `/quiz`, `/dictionary/dakujem` at 1440px, 390px, and 320px.
