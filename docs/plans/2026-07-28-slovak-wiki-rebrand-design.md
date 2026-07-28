# Slovak Wiki Rebrand

Date: 2026-07-28

## Goal

Rename the standalone project and user-facing identity from Slovak Atlas to Slovak Wiki.

## Scope

- move repository folder from `slovak.wiki` to `slovakwiki`
- rename package from `slovak.wiki` to `slovakwiki`
- update app header, footer, search labels, ARIA labels, page titles, and metadata to Slovak Wiki
- preserve existing routes, content, search, lessons, quiz behavior, and visual system

## Historical Documents

Existing planning documents remain unchanged. They describe prior decisions and may retain the historical Slovak Atlas name.

## Migration Safety

- verify destination folder does not exist before move
- stop the project dev server before moving the working directory
- make all code/config updates before restarting from the new directory
- preserve Git history by moving the repository directory intact

## Verification

- confirm repository root is `C:\Users\Stream\Projects\slovakwiki`
- confirm no current app/config source references Slovak Atlas or `slovak.wiki`
- start dev server from new root
- exercise root, Wiki, Learn, Quiz, Search, and entry title
- run check, tests, build, and diff check
