# Entry rail removal — implementation plan

## Scope

Remove the redundant left rail from individual dictionary, grammar, and pronunciation entries. Keep the article, breadcrumb, and useful right-side table of contents and related-entry navigation. Leave the functional filter sidebar on `/wiki` unchanged.

## Changes

1. In `src/lib/components/EntryDetail.svelte`, remove the `entry-nav` aside and its static classification and browse links.
2. Change the desktop shell to a two-column layout: article plus right context rail.
3. Remove CSS that supports only the deleted rail. Scope remaining navigation styles to `entry-context`.
4. At `1080px` and below, stack the context section beneath the article; retain its page anchors and related links. Preserve the existing single-column small-screen layout.

## Verification

1. Run `bun run check`, `bun test`, and `bun run build`.
2. Inspect entry pages at desktop, 1080px, 760px, and 390px widths for overflow and readable article measure.
3. Confirm page anchors and related-entry links still work. Confirm the `/wiki` index sidebar still filters content.
