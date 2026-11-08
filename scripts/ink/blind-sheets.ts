import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { grammarEntries } from "../../src/lib/catalog/reference/grammar";
import {
  markedParts,
  sketchParts,
} from "../../src/lib/components/reference/ink/sketches";

/**
 * Numbered sheets with no names, for a blind review (ink-drawing skill):
 *   bun scripts/ink/blind-sheets.ts <dir> [perSheet] [slug…]
 * Screenshot each sheet-N.html to sheet-N.png and hand a reviewer only the PNGs.
 * The key (number → slug) goes next to the folder, not in it.
 */

const CASE_SLUGS = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "locative",
  "instrumental",
];
const NOTE_SIZE = { tiny: 9, small: 11, normal: 15, large: 22 } as const;

const outDir = resolve(process.argv[2] ?? "blind-sheets");
const perSheet = Number(process.argv[3] ?? 6);
const requested = process.argv.slice(4);
const slugs =
  requested.length > 0
    ? requested
    : [...CASE_SLUGS, ...grammarEntries.map((entry) => entry.slug)];

let state = 7;
const random = () => {
  state = (state * 1664525 + 1013904223) >>> 0;
  return state / 4294967296;
};
const shuffled = [...slugs].sort(() => random() - 0.5);

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

const css = `body{margin:0;padding:20px;display:grid;grid-template-columns:repeat(2,440px);gap:20px;background:#fff;font-family:sans-serif}
.c{border:1px solid #cbd5e1;border-radius:10px;padding:10px}.n{font:700 22px sans-serif;color:#0f172a;margin:0 0 4px}svg{width:100%;display:block}
.ink{stroke:#0f172a}.soft{stroke:#64748b}.mark{stroke:#1e40af}.patch{fill:rgba(37,99,235,.2)}.dot{fill:#1e40af}
.note{font-family:Georgia,serif;font-weight:600}.inkf{fill:#0f172a}.softf{fill:#64748b}.markf{fill:#1e40af}.lit{fill:#1e40af}`;

mkdirSync(outDir, { recursive: true });
const key: Record<string, string> = {};
for (let sheet = 0; sheet * perSheet < shuffled.length; sheet += 1) {
  const cells = shuffled
    .slice(sheet * perSheet, (sheet + 1) * perSheet)
    .map((slug, index) => {
      const number = sheet * perSheet + index + 1;
      key[String(number)] = slug;
      return `<div class="c"><p class="n">${number}</p>${svg(slug)}</div>`;
    });
  writeFileSync(
    join(outDir, `sheet-${sheet + 1}.html`),
    `<!doctype html><meta charset="utf-8"><style>${css}</style>${cells.join("")}`,
  );
}
const keyFile = `${outDir}-key.json`;
writeFileSync(keyFile, JSON.stringify(key, null, 1));
console.log(
  `Wrote ${Math.ceil(shuffled.length / perSheet)} sheets to ${outDir} and the key to ${keyFile}.`,
);
console.log(
  `Screenshot each: chrome --headless --window-size=960,1500 --force-device-scale-factor=1.6 --screenshot=${join(outDir, "sheet-1.png")} file:///${join(outDir, "sheet-1.html").replaceAll("\\", "/")}`,
);
