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

function book(x: number, y: number, seed: number): SketchPart[] {
  return [
    stroke(boxD(x, y, 46, 36, seed)),
    stroke(lineD([x + 8, y], [x + 8, y + 36], seed + 9), "soft"),
    stroke(lineD([x + 16, y + 12], [x + 38, y + 12], seed + 10), "soft", 1.2, 0.6),
    stroke(lineD([x + 16, y + 22], [x + 34, y + 22], seed + 11), "soft", 1.2, 0.6),
  ];
}

function gift(x: number, y: number, seed: number): SketchPart[] {
  return [
    stroke(boxD(x, y, 38, 30, seed)),
    stroke(lineD([x + 19, y], [x + 19, y + 30], seed + 6), "soft"),
    stroke(
      curveD(
        [
          [x + 19, y],
          [x + 11, y - 12],
          [x + 15, y - 17],
          [x + 19, y],
          [x + 23, y - 17],
          [x + 27, y - 12],
          [x + 19, y],
        ],
        seed + 7,
      ),
      "soft",
    ),
  ];
}

const SCENES: Record<string, () => SketchPart[]> = {
  nominative: () => [
    ...ground(),
    patch(90, 68, 26, 42, 5),
    ...figure(90, 21, 1),
    ...arrow([128, 70], [196, 80], 31, 4),
    ...book(204, 68, 41),
  ],

  genitive: () => [
    ...ground(),
    ...office(40, 12),
    ...figure(256, 22),
    patch(71, 92, 15, 17, 6),
    ...arrow([72, 90], [200, 84], 32, -7),
    note(150, 126, "z"),
  ],

  dative: () => [
    ...ground(),
    ...figure(62, 23, 1),
    ...gift(112, 64, 51),
    ...arrow([162, 78], [238, 72], 33, 4),
    patch(268, 68, 26, 40, 7),
    ...figure(268, 24),
    note(168, 126, "komu"),
  ],

  accusative: () => [
    ...ground(),
    ...figure(64, 25, 1),
    stroke(
      curveD(
        [
          [132, 42],
          [150, 30],
          [168, 42],
          [150, 52],
          [132, 42],
        ],
        76,
      ),
      "soft",
    ),
    { type: "dot", d: patchD(150, 41, 3.5, 3.5, 77) },
    patch(258, 68, 26, 40, 8),
    ...figure(258, 26),
    ...arrow([84, 56], [230, 60], 78, -4),
    note(160, 126, "vidím"),
  ],

  locative: () => [
    stroke(loopD(170, 58, 42, 38, 41), "soft", 1.9),
    patch(170, 58, 14, 14, 9),
    { type: "dot", d: patchD(170, 58, 6.5, 6.5, 10) },
    note(254, 64, "v"),
  ],

  instrumental: () => [
    ...ground(),
    ...figure(84, 27, 1),
    ...figure(252, 28, -1),
    patch(168, 70, 64, 14, 11),
    stroke(
      curveD(
        [
          [106, 74],
          [140, 68],
          [196, 72],
          [230, 66],
        ],
        35,
      ),
      "mark",
      2.1,
    ),
    note(168, 126, "s"),
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
