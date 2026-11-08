import { curveD, lineD, loopD, type Point } from "./ink-paths";
import { GROUND, stroke, type SketchPart, type Tone } from "./pieces";

/** A line made of short strokes: a line of sight, not a beam. */
export function dashed(
  from: Point,
  to: Point,
  seed: number,
  tone: Tone = "mark",
): SketchPart {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const steps = Math.max(2, Math.round(length / 11));
  const at = (t: number): Point => [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
  ];
  const dashes: string[] = [];
  for (let index = 0; index < steps; index += 1) {
    dashes.push(lineD(at(index / steps), at((index + 0.58) / steps), seed + index, 0.3));
  }
  return stroke(dashes.join(" "), tone, 1.7);
}

/** Footprints along the ground: where someone walked from. */
export function footprints(x1: number, x2: number, seed: number): SketchPart {
  const count = Math.max(2, Math.round((x2 - x1) / 14));
  const prints: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const x = x1 + ((x2 - x1) * index) / (count - 1);
    prints.push(loopD(x, GROUND - 2 - (index % 2) * 3, 3.4, 1.7, seed + index * 2));
  }
  return stroke(prints.join(" "), "soft", 1.3, 0.8);
}

/** A small sailing boat on the water: the thing that makes waves read as the sea. */
export function boat(x: number, y: number, seed: number): SketchPart[] {
  return [
    stroke(
      curveD(
        [
          [x - 12, y],
          [x - 8, y + 6],
          [x + 8, y + 6],
          [x + 13, y],
          [x - 12, y],
        ],
        seed,
        0.3,
      ),
      "ink",
      1.5,
    ),
    stroke(lineD([x, y], [x, y - 20], seed + 1), "ink", 1.5),
    stroke(lineD([x + 1, y - 19], [x + 11, y - 3], seed + 2), "mark", 1.5),
    stroke(lineD([x + 11, y - 3], [x + 1, y - 3], seed + 3), "mark", 1.5),
  ];
}

/** A shower head on a wall pipe, with drops that fall straight down onto whoever stands under it. */
export function overheadShower(x: number, seed: number): SketchPart[] {
  const parts: SketchPart[] = [
    stroke(lineD([x - 34, 8], [x - 8, 8], seed), "soft", 1.7),
    stroke(lineD([x - 8, 8], [x - 8, 20], seed + 1), "soft", 1.7),
    stroke(lineD([x - 8, 20], [x, 26], seed + 2), "soft", 1.7),
    stroke(
      [
        lineD([x - 15, 32], [x + 15, 32], seed + 3),
        lineD([x - 15, 32], [x - 8, 25], seed + 4),
        lineD([x + 15, 32], [x + 8, 25], seed + 5),
        lineD([x - 8, 25], [x + 8, 25], seed + 6),
      ].join(" "),
      "soft",
      1.6,
    ),
  ];
  [-11, -4, 3, 10].forEach((dx, index) => {
    const top = 38 + (index % 2) * 5;
    parts.push(
      stroke(lineD([x + dx, top], [x + dx, top + 7], seed + 7 + index), "mark", 1.8),
    );
  });
  return parts;
}

/** The slice of a clock face between two hour marks, as a highlighter patch. */
export function sectorPatch(
  cx: number,
  cy: number,
  radius: number,
  fromDegrees: number,
  toDegrees: number,
): SketchPart {
  const point = (degrees: number): Point => [
    cx + Math.sin((degrees * Math.PI) / 180) * radius,
    cy - Math.cos((degrees * Math.PI) / 180) * radius,
  ];
  const [x1, y1] = point(fromDegrees);
  const [x2, y2] = point(toDegrees);
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    type: "patch",
    d: `M${round(cx)} ${round(cy)} L${round(x1)} ${round(y1)} A${radius} ${radius} 0 0 1 ${round(x2)} ${round(y2)} Z`,
  };
}
