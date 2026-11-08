import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { grammarEntries } from "../../src/lib/catalog/reference/grammar";
import {
  markedParts,
  sketchParts,
} from "../../src/lib/components/reference/ink/sketches";

const CASE_SLUGS = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "locative",
  "instrumental",
];
const NOTE_SIZE = { small: 11, normal: 15, large: 22 } as const;

const outDir = resolve(process.argv[2] ?? "ink-sheet");
const requested = process.argv.slice(3);
const slugs =
  requested.length > 0
    ? requested
    : [...CASE_SLUGS, ...grammarEntries.map((entry) => entry.slug)];

function svg(slug: string): string {
  const body = sketchParts(slug)
    .map((part) => {
      if (part.type === "stroke") {
        return `<path d="${part.d}" fill="none" class="${part.tone}" stroke-width="${part.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${part.opacity ?? 1}"/>`;
      }
      if (part.type === "patch") return `<path d="${part.d}" class="patch"/>`;
      if (part.type === "dot") return `<path d="${part.d}" class="dot"/>`;
      const spans = markedParts(part.text)
        .map(
          (piece) => `<tspan class="${piece.marked ? "lit" : ""}">${piece.text}</tspan>`,
        )
        .join("");
      return `<text x="${part.x}" y="${part.y}" text-anchor="middle" class="note ${part.tone}f" style="font-size:${NOTE_SIZE[part.size]}px">${spans}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 340 132"><defs><filter id="f-${slug}" filterUnits="userSpaceOnUse" x="0" y="0" width="340" height="132"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="g"/><feDisplacementMap in="SourceGraphic" in2="g" scale="1.5" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#f-${slug})">${body}</g></svg>`;
}

function page(theme: "light" | "dark"): string {
  const dark = theme === "dark";
  const ink = dark ? "#e2e8f0" : "#0f172a";
  const soft = dark ? "#94a3b8" : "#64748b";
  const mark = dark ? "#93c5fd" : "#1e40af";
  return `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:16px;display:grid;grid-template-columns:repeat(3,420px);gap:12px;background:${dark ? "#0f172a" : "#fff"}}
.c{background:${dark ? "#1e293b" : "#fff"};border:1px solid ${dark ? "#334155" : "#e2e8f0"};border-radius:10px;padding:10px;color:${ink};font:12px sans-serif}
svg{width:100%;display:block}
.ink{stroke:${ink}}.soft{stroke:${soft}}.mark{stroke:${mark}}
.patch{fill:${dark ? "rgba(96,165,250,.22)" : "rgba(37,99,235,.2)"}}.dot{fill:${mark}}
.note{font-family:Georgia,serif;font-weight:600}.inkf{fill:${ink}}.softf{fill:${soft}}.markf{fill:${mark}}.lit{fill:${mark}}
</style>${slugs.map((slug) => `<div class="c">${slug}${svg(slug)}</div>`).join("")}`;
}

mkdirSync(outDir, { recursive: true });
for (const theme of ["light", "dark"] as const) {
  writeFileSync(join(outDir, `sheet-${theme}.html`), page(theme));
}
console.log(
  `Wrote ${join(outDir, "sheet-light.html")} and sheet-dark.html (${slugs.length} sketches).`,
);
console.log(
  `Screenshot: chrome --headless --window-size=1340,1600 --screenshot=${join(outDir, "light.png")} file:///${join(outDir, "sheet-light.html").replaceAll("\\", "/")}`,
);
