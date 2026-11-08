import { curveD, lineD, loopD, type Point } from "./ink-paths";
import { GROUND, stroke, type SketchPart } from "./pieces";
import { dot } from "./things";

const NECK = GROUND - 36;
const HIP = GROUND - 13;
const SHOULDER = NECK + 9;

interface PersonOptions {
  /** Where the hand ends up, for the arm on that side. The other arm hangs. */
  grip?: Point;
  /** A stride instead of two feet side by side. */
  walking?: boolean;
  /** A dress instead of trousers. */
  dress?: boolean;
  /** Both hands on the head. */
  washing?: boolean;
  /** Below 1 draws a child; the feet stay on the ground. */
  scale?: number;
}

/** One stick person: the same head, neck and arms everywhere, so a change in pose means a change in meaning. */
export function person(
  x: number,
  seed: number,
  options: PersonOptions = {},
): SketchPart[] {
  const { grip, walking = false, dress = false, washing = false, scale = 1 } = options;
  const at = ([px, py]: Point): Point => [
    x + (px - x) * scale,
    GROUND - (GROUND - py) * scale,
  ];
  const line = (from: Point, to: Point, offset: number) =>
    stroke(lineD(at(from), at(to), seed + offset));
  const gripSide = grip ? (grip[0] < x ? -1 : 1) : 0;
  const hangingArm = (side: -1 | 1, offset: number) =>
    line([x, SHOULDER], [x + side * 11, SHOULDER + 14], offset);
  const arms: SketchPart[] = washing
    ? [
        line([x, SHOULDER], [x - 9, GROUND - 49], 2),
        line([x, SHOULDER], [x + 9, GROUND - 49], 5),
      ]
    : grip
      ? [
          stroke(lineD(at([x, SHOULDER]), grip, seed + 2)),
          hangingArm(gripSide === 1 ? -1 : 1, 5),
        ]
      : [hangingArm(-1, 2), hangingArm(1, 5)];

  const waist = dress ? HIP - 8 : HIP;
  const hem = HIP + 6;
  const front: Point = dress ? [x + 6, GROUND] : [x + (walking ? 13 : 11), GROUND];
  const back: Point = dress
    ? [x - (walking ? 7 : 6), GROUND - (walking ? 3 : 0)]
    : [x - (walking ? 9 : 11), GROUND - (walking ? 3 : 0)];
  const legsFrom: Point = dress ? [x, hem] : [x, HIP];
  const [headX, headY] = at([x, GROUND - 45]);

  const body: SketchPart[] = [
    stroke(loopD(headX, headY, 8 * scale, 8 * scale, seed)),
    line([x, NECK], [x, waist], 1),
    ...arms,
    line(legsFrom, front, 3),
    line(legsFrom, back, 4),
  ];
  if (dress) {
    body.push(
      line([x, waist], [x - 13, hem], 6),
      line([x - 13, hem], [x + 13, hem], 7),
      line([x + 13, hem], [x, waist], 8),
    );
  }
  return body;
}

/** An almond eye on the right half of the head, so the person is looking right. */
export function faceEye(x: number, seed: number): SketchPart[] {
  const y = GROUND - 46;
  return [
    stroke(
      curveD(
        [
          [x, y],
          [x + 3.5, y - 2.6],
          [x + 7, y],
          [x + 3.5, y + 2.6],
          [x, y],
        ],
        seed,
        0.15,
      ),
      "ink",
      1.2,
    ),
    dot(x + 3.5, y, 1.3, seed + 1),
  ];
}

/** Short speed lines behind someone walking right. */
export function trail(x: number, seed: number): SketchPart[] {
  return [70, 80, 90].map((y, index) =>
    stroke(lineD([x - 22 + index * 2, y], [x - 8, y], seed + index), "soft", 1.3, 0.6),
  );
}

/** The one hand-clasp: two hands meet at a point. */
export function clasp(at: Point, seed: number): SketchPart {
  return dot(at[0], at[1], 3.4, seed);
}
