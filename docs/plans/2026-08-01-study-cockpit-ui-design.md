# Slovak Wiki Study Cockpit UI

## Goal

Replace the compact wiki/editorial presentation with a spacious language-learning application interface. Preserve existing routes and learning behavior. Change visual hierarchy, shell geometry, surfaces, navigation treatment, and empty states.

## Direction

Use a practical study cockpit inspired by language-learning products: clear app chrome, generous workspace, visible context, and strong action surfaces. Visual inspiration includes [Speakly's polished consumer-learning site](https://speakly.me/en), while structural references include Lingvist's active-course and daily-work layout, Glossika's focused review/learn controls, and slovake.eu's broad course/reference grouping. Borrow visual patterns only; keep Slovak Wiki's own palette and content.

## UI system

- Desktop shell uses a 248px navigation rail and a wider content workspace.
- Header becomes a substantial app bar with a wider search field and consistent horizontal alignment.
- Main pages use a max-width around 1180px with 56–72px vertical breathing room.
- Surfaces use larger radii, quieter borders, and soft elevation. Avoid thin editorial card strips and oversized serif-only compositions.
- Keep IBM Plex Sans for UI and Source Serif for Slovak examples/headlines, but make UI hierarchy carry more of the design.
- Use blue for structure and selected state, red for primary actions, green only for successful learning feedback.
- Establish reusable spacing and surface tokens in `src/styles.css`.

## First implementation slice

1. Shared layout: shell width, sidebar width, header height, canvas, surface treatment.
2. Sidebar: stronger app navigation grouping and more usable hit areas.
3. Header: more spacious search treatment and alignment.
4. Review empty state: broad cockpit panel with a clear status, supporting copy, primary next action, and secondary reference/lesson route.
5. Responsive behavior: preserve compact mobile layout; avoid horizontal overflow.

## Non-goals

- No XP, streaks, leaderboards, accounts, or fake progress metrics.
- No route migration or content-model changes.
- No copied branding, assets, imagery, or copy from reference products.

## Acceptance

- Screenshot no longer reads as a small isolated editorial card floating in excessive empty space.
- Main content has a clear app workspace with usable horizontal scale.
- Review empty state feels like a next-step dashboard surface, not an error/placeholder.
- Existing navigation, accessibility labels, and responsive behavior remain functional.
