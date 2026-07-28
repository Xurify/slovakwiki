# Unframed Editorial Field

Date: 2026-07-28

## Goal

Remove the constrained application-card silhouette while preserving the warm textured canvas and paper material introduced by the editorial redesign.

## Direction

Use an unframed editorial field:

- no maximum-width application shell
- no outer border, rounded card corners, or dropped shadow
- header, content, and footer extend naturally across the viewport
- inner route layouts retain their readable content widths and rails
- the warm paper layer becomes lightly translucent so the canvas texture remains perceptible underneath
- horizontal rules, not a container edge, define regions

## Material System

The textured beige canvas remains the page background. The paper surface sits above it as a full-width field with enough translucency to retain depth, avoiding a white-wall effect. Header and footer use the same paper family without rounded endpoints.

## Layout

Remove the `app-frame` visual constraint from the root layout while retaining it as a semantic wrapper if useful. Its width becomes 100%, margin and desktop padding disappear, and route `.shell` widths continue to control reading measure. This preserves dense Wiki rails, lesson workspace, quiz workspace, and reference detail without restoring the card appearance.

## Responsive Behavior

Desktop and mobile use the same unframed principle. Existing internal responsive layouts remain unchanged. No new horizontal overflow is permitted.

## Verification

- inspect desktop and mobile route surfaces
- confirm canvas/paper layers remain visible
- test zero overflow at 390px and 320px
- run `bun run check`, `bun test`, `bun run build`, and `git diff --check`
