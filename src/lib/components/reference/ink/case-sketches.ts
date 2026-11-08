import { arrowD, boxD, curveD, lineD, loopD, patchD, type Point } from "./ink-paths";

export type Tone = "ink" | "soft" | "mark";

export type SketchPart =
  | { type: "stroke"; d: string; tone: Tone; width: number; opacity?: number }
  | { type: "patch"; d: string }
  | { type: "dot"; d: string }
  | { type: "note"; x: number; y: number; text: string };

const GROUND = 104;

function stroke(
  d: string,
  tone: Tone = "ink",
  width = 1.4,
  opacity?: number,
): SketchPart {
  return opacity === undefined
    ? { type: "stroke", d, tone, width }
    : { type: "stroke", d, tone, width, opacity };
}

function ground(): SketchPart[] {
  return [stroke(lineD([8, GROUND], [332, GROUND], 3), "soft", 1.3, 0.55)];
}

function note(x: number, y: number, text: string): SketchPart {
  return { type: "note", x, y, text };
}

function patch(cx: number, cy: number, rx: number, ry: number, seed: number): SketchPart {
  return { type: "patch", d: patchD(cx, cy, rx, ry, seed) };
}

function arrow(from: Point, to: Point, seed: number, bend = 0): SketchPart[] {
  const { shaft, head } = arrowD(from, to, seed, bend);
  return [stroke(shaft, "mark", 2.1), stroke(head, "mark", 2.1)];
}

function figure(x: number, seed: number, reach?: 1 | -1): SketchPart[] {
  const neck = GROUND - 36;
  const hip = GROUND - 13;
  const shoulder = neck + 9;
  const arms: SketchPart[] = reach
    ? [stroke(lineD([x, shoulder], [x + 22 * reach, shoulder - 9], seed + 2))]
    : [
        stroke(lineD([x, shoulder], [x - 11, shoulder + 14], seed + 2)),
        stroke(lineD([x, shoulder], [x + 11, shoulder + 14], seed + 5)),
      ];
  return [
    stroke(loopD(x, GROUND - 45, 8, 8, seed)),
    stroke(lineD([x, neck], [x, hip], seed + 1)),
    ...arms,
    stroke(lineD([x, hip], [x - 11, GROUND], seed + 3)),
    stroke(lineD([x, hip], [x + 11, GROUND], seed + 4)),
  ];
}

function office(x: number, seed: number): SketchPart[] {
  const top = GROUND - 82;
  const parts: SketchPart[] = [stroke(boxD(x, top, 62, 82, seed), "soft")];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 2; col += 1) {
      parts.push(
        stroke(
          boxD(x + 10 + col * 26, top + 10 + row * 16, 16, 10, seed + 20 + row * 2 + col),
          "soft",
          1.4,
          0.7,
        ),
      );
    }
  }
  parts.push(
    stroke(
      curveD(
        [
          [x + 25, GROUND],
          [x + 25, GROUND - 22],
          [x + 37, GROUND - 22],
          [x + 37, GROUND],
        ],
        seed + 12,
      ),
      "soft",
    ),
  );
  return parts;
}

function closedBook(x: number, y: number, seed: number): SketchPart[] {
  return [
    stroke(boxD(x, y, 46, 36, seed)),
    stroke(lineD([x + 8, y], [x + 8, y + 36], seed + 9), "soft"),
    stroke(lineD([x + 16, y + 12], [x + 38, y + 12], seed + 10), "soft", 1.2, 0.6),
    stroke(lineD([x + 16, y + 22], [x + 34, y + 22], seed + 11), "soft", 1.2, 0.6),
  ];
}

function openBook(x: number, y: number, seed: number): SketchPart[] {
  const spineTop: Point = [x + 18, y + 5];
  const spineBottom: Point = [x + 18, y + 31];
  return [
    stroke(
      [
        lineD(spineTop, [x, y], seed),
        lineD([x, y], [x, y + 25], seed + 1),
        lineD([x, y + 25], spineBottom, seed + 2),
        lineD(spineTop, [x + 36, y], seed + 3),
        lineD([x + 36, y], [x + 36, y + 25], seed + 4),
        lineD([x + 36, y + 25], spineBottom, seed + 5),
        lineD(spineTop, spineBottom, seed + 6),
      ].join(" "),
    ),
    stroke(lineD([x + 5, y + 8], [x + 14, y + 11], seed + 7), "soft", 1.2, 0.6),
    stroke(lineD([x + 5, y + 15], [x + 14, y + 18], seed + 8), "soft", 1.2, 0.6),
    stroke(lineD([x + 22, y + 11], [x + 31, y + 8], seed + 9), "soft", 1.2, 0.6),
    stroke(lineD([x + 22, y + 18], [x + 31, y + 15], seed + 10), "soft", 1.2, 0.6),
  ];
}

function building(x: number, width: number, height: number, seed: number): SketchPart[] {
  const top = GROUND - height;
  const parts: SketchPart[] = [stroke(boxD(x, top, width, height, seed), "soft")];
  const columns = Math.floor((width - 8) / 14);
  const rows = Math.floor((height - 16) / 16);
  const left = x + (width - (columns * 14 - 4)) / 2;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      parts.push(
        stroke(
          boxD(
            left + column * 14,
            top + 9 + row * 16,
            10,
            8,
            seed + 20 + row * 3 + column,
          ),
          "soft",
          1.3,
          0.65,
        ),
      );
    }
  }
  return parts;
}

function eye(cx: number, cy: number, seed: number): SketchPart[] {
  return [
    stroke(
      curveD(
        [
          [cx - 13, cy],
          [cx, cy - 8],
          [cx + 13, cy],
          [cx, cy + 8],
          [cx - 13, cy],
        ],
        seed,
        0.5,
      ),
      "soft",
      1.6,
    ),
    { type: "dot", d: patchD(cx, cy, 3.6, 3.6, seed + 1) },
  ];
}

const SCENES: Record<string, () => SketchPart[]> = {
  nominative: () => [
    ...ground(),
    patch(150, 68, 26, 42, 5),
    ...figure(150, 21, 1),
    ...openBook(170, 54, 41),
    note(168, 126, "kto"),
  ],

  genitive: () => [
    ...ground(),
    patch(116, 63, 44, 56, 6),
    ...office(85, 12),
    ...arrow([116, 92], [200, 88], 32, -6),
    ...figure(236, 22, 1),
    note(168, 126, "z"),
  ],

  dative: () => [
    ...ground(),
    ...figure(62, 23, 1),
    ...closedBook(90, 54, 51),
    ...arrow([148, 74], [236, 72], 33, 4),
    patch(268, 68, 26, 40, 7),
    ...figure(268, 24),
    note(168, 126, "komu"),
  ],

  accusative: () => [
    ...ground(),
    ...figure(70, 25),
    ...eye(106, 59, 76),
    ...arrow([126, 60], [220, 61], 78, -3),
    patch(248, 68, 26, 40, 8),
    ...figure(248, 26),
    note(160, 126, "vidím"),
  ],

  locative: () => [
    ...ground(),
    patch(169, 62, 112, 50, 9),
    ...building(70, 42, 70, 61),
    ...building(116, 40, 92, 62),
    ...figure(190, 29),
    ...building(226, 46, 78, 63),
    note(169, 126, "v"),
  ],

  instrumental: () => [
    ...ground(),
    ...figure(124, 27, 1),
    patch(188, 68, 26, 40, 11),
    ...figure(188, 28, -1),
    stroke(lineD([146, 68], [166, 68], 35), "mark", 2.1),
    note(156, 126, "s"),
  ],
};

export function caseSketchParts(slug: string): SketchPart[] {
  return SCENES[slug]?.() ?? [];
}

export interface MarkedPart {
  text: string;
  marked: boolean;
}

export function markedParts(sentence: string): MarkedPart[] {
  return sentence
    .split("**")
    .map((text, index) => ({ text, marked: index % 2 === 1 }))
    .filter((part) => part.text !== "");
}
