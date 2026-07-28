# Editorial Reference System

Date: 2026-07-28

## Goal

Redesign Slovak Atlas around the supplied editorial Wiki reference while preserving existing content, routes, search, lesson, and quiz behavior.

## Direction

Use an adaptive editorial system across the full site. Share one material and typographic language without forcing every route into the same three-column structure.

Core qualities:

- warm paper canvas and cream application frame
- dark olive-black text
- muted ochre and antique-gold accents
- serif reading typography paired with compact sans-serif interface labels
- thin rules, quiet panels, restrained rounded corners
- dense reference navigation surrounding a generous reading column
- minimal motion and no decorative gradients

## Application Frame

Desktop pages sit inside one rounded frame with a subtle shadow and fine border. A compact top bar contains the Slovak Atlas identity, centered search, and primary navigation.

The frame fills available height while retaining a visible canvas margin. On narrow screens it becomes edge-to-edge, removes the outer radius, and keeps the search and navigation usable without horizontal overflow.

## Route Layouts

### Wiki and entry pages

Use the reference image most directly:

- left rail for content types, topics, or related entries
- central reading or results column
- right rail for section navigation, metadata, or linked entries
- serif titles and article copy
- ochre active rules and links

Wiki results stay filterable. Entry content and route loaders remain unchanged.

### Home

Use an editorial reference dashboard:

- concise introduction and search
- current beginner path
- featured Slovak entry
- compact word, grammar, and pronunciation indexes

Panels use rules and paper tone rather than conventional cards.

### Learn

Use three adaptive regions:

- lesson outline
- central phrase lesson
- progress and usage context

Keep native progress semantics, completed states, keyboard-operable phrase navigation, and existing lesson behavior.

### Quiz

Use an assessment desk:

- left progress summary
- central question and answer list
- right score and instructions

Keep visible correct/incorrect labels, disabled answered options, live feedback, results, and restart behavior.

### Search

Use a reference-results layout with query context, dense editorial rows, and optional filter/context rail. Preserve URL-derived search behavior and diacritic-insensitive matching.

## Responsive Behavior

At tablet widths, the right rail moves below central content. At mobile widths, all pages become one column. Rail controls become horizontal tabs or inline sections. Touch controls remain at least 44 pixels where practical. Content must reflow at 320 CSS pixels without horizontal scrolling.

## Accessibility

- preserve semantic landmarks and heading order
- retain skip navigation and visible focus states
- expose active navigation and filters with `aria-current` or `aria-pressed`
- retain live regions for search counts, lesson changes, and quiz feedback
- keep color contrast independent of texture
- respect reduced-motion preferences

## Technical Constraints

- Svelte 5 runes and current route structure
- no content schema or loader changes unless required by presentation
- local font packages only
- CSS-first implementation
- no dependency on `flags.games`

## Verification

- `bun run check`
- `bun test`
- `bun run build`
- desktop inspection at 1440 × 900
- mobile inspection at 390 × 844 and 320 pixels wide
- exercise global search, Wiki filters, lesson progression, quiz answer states, and representative entry routes
