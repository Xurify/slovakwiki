import { boxD, curveD, lineD, type Point } from "./ink-paths";
import { GROUND, stroke, type SketchPart } from "./pieces";

/** A pencil lying on a page: two edges and a point, so it is not a stray slash. */
export function pencil(
  from: [number, number],
  to: [number, number],
  seed: number,
): SketchPart[] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  const nx = (-dy / length) * 2.6;
  const ny = (dx / length) * 2.6;
  const point: [number, number] = [
    from[0] + (dx / length) * 6,
    from[1] + (dy / length) * 6,
  ];
  return [
    stroke(
      lineD([point[0] + nx, point[1] + ny], [to[0] + nx, to[1] + ny], seed),
      "ink",
      1.5,
    ),
    stroke(
      lineD([point[0] - nx, point[1] - ny], [to[0] - nx, to[1] - ny], seed + 1),
      "ink",
      1.5,
    ),
    stroke(
      lineD([to[0] + nx, to[1] + ny], [to[0] - nx, to[1] - ny], seed + 2),
      "ink",
      1.5,
    ),
    stroke(lineD([point[0] + nx, point[1] + ny], from, seed + 3), "ink", 1.5),
    stroke(lineD([point[0] - nx, point[1] - ny], from, seed + 4), "ink", 1.5),
  ];
}

/** Where a far thing stands: a short horizon of its own, higher than the near ground. */
export function farGround(x1: number, x2: number, y: number, seed: number): SketchPart {
  return stroke(lineD([x1, y], [x2, y], seed), "soft", 1.2, 0.5);
}

/** A tie at the neck: an outlined, filled shape big enough to read at page size. */
export function tie(x: number, seed: number): SketchPart[] {
  const neck = GROUND - 36;
  const outline: Point[] = [
    [x - 3, neck + 2],
    [x + 3, neck + 2],
    [x + 6, neck + 18],
    [x, neck + 25],
    [x - 6, neck + 18],
  ];
  const d = `M${outline.map(([px, py]) => `${px} ${py}`).join(" L")} Z`;
  return [
    { type: "patch", d },
    stroke(lineD([x - 4, neck + 1], [x + 4, neck + 1], seed), "mark", 2.2),
    stroke(
      outline
        .map((point, index) =>
          lineD(point, outline[(index + 1) % outline.length] as Point, seed + 1 + index),
        )
        .join(" "),
      "mark",
      2,
    ),
  ];
}

/** A briefcase in the hand: a box with a handle, so a walking person is on their way from work. */
export function briefcase(x: number, y: number, seed: number): SketchPart[] {
  return [
    stroke(boxD(x, y, 16, 11, seed), "ink", 1.6),
    stroke(
      curveD(
        [
          [x + 4, y],
          [x + 5, y - 4],
          [x + 11, y - 4],
          [x + 12, y],
        ],
        seed + 5,
        0.2,
      ),
      "ink",
      1.5,
    ),
    stroke(lineD([x, y + 5], [x + 16, y + 5], seed + 6), "soft", 1.2),
  ];
}
