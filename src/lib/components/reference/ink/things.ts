import {
  boxD,
  curveD,
  lineD,
  loopD,
  patchD,
  type Point,
  inkRandom,
  smoothD,
} from "./ink-paths";
import { GROUND, stroke, type SketchPart, type Tone } from "./pieces";

export const polar = (cx: number, cy: number, radius: number, degrees: number): Point => {
  const angle = (degrees * Math.PI) / 180;
  return [cx + Math.sin(angle) * radius, cy - Math.cos(angle) * radius];
};

export function dot(cx: number, cy: number, radius: number, seed: number): SketchPart {
  return { type: "dot", d: patchD(cx, cy, radius, radius, seed) };
}

export function woman(x: number, seed: number): SketchPart[] {
  const neck = GROUND - 36;
  const hip = GROUND - 13;
  const shoulder = neck + 9;
  const waist = hip - 8;
  return [
    stroke(loopD(x, GROUND - 45, 8, 8, seed)),
    stroke(lineD([x, neck], [x, waist], seed + 1)),
    stroke(lineD([x, shoulder], [x - 10, shoulder + 13], seed + 2)),
    stroke(lineD([x, shoulder], [x + 10, shoulder + 13], seed + 5)),
    stroke(lineD([x, waist], [x - 13, hip + 6], seed + 6)),
    stroke(lineD([x - 13, hip + 6], [x + 13, hip + 6], seed + 7)),
    stroke(lineD([x + 13, hip + 6], [x, waist], seed + 8)),
    stroke(lineD([x - 4, hip + 6], [x - 4, GROUND], seed + 3)),
    stroke(lineD([x + 4, hip + 6], [x + 4, GROUND], seed + 4)),
  ];
}

export function gradCap(x: number, seed: number): SketchPart[] {
  const top = GROUND - 54;
  return [
    stroke(
      [
        lineD([x - 14, top], [x, top - 6], seed),
        lineD([x, top - 6], [x + 14, top], seed + 1),
        lineD([x + 14, top], [x, top + 6], seed + 2),
        lineD([x, top + 6], [x - 14, top], seed + 3),
      ].join(" "),
      "mark",
      1.8,
    ),
    stroke(lineD([x + 10, top + 1], [x + 12, top + 11], seed + 4), "mark", 1.6),
  ];
}

export function cup(x: number, y: number, seed: number, scale = 1): SketchPart[] {
  const at = (dx: number, dy: number): Point => [x + dx * scale, y + dy * scale];
  return [
    stroke(lineD(at(0, 0), at(22, 0), seed)),
    stroke(
      curveD([at(0, 0), at(2, 13), at(10, 18), at(20, 13), at(22, 0)], seed + 1, 0.4),
    ),
    stroke(curveD([at(22, 4), at(30, 5), at(29, 13), at(21, 12)], seed + 2, 0.4), "soft"),
  ];
}

/** A speech bubble: one open outline whose ends are the two sides of the tail, so the tail joins cleanly. */
export function bubble(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tip: Point,
  seed: number,
): SketchPart[] {
  const around = Math.atan2((tip[1] - cy) / ry, (tip[0] - cx) / rx);
  const gap = 0.3;
  const steps = 14;
  const random = inkRandom(seed);
  const points: Point[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const angle = around + gap + ((Math.PI * 2 - gap * 2) * index) / steps;
    const wobble = 1 + (random() - 0.5) * 0.03;
    points.push([cx + Math.cos(angle) * rx * wobble, cy + Math.sin(angle) * ry * wobble]);
  }
  const first = points[0] as Point;
  const last = points[points.length - 1] as Point;
  return [
    stroke(
      [smoothD(points), lineD(last, tip, seed + 1), lineD(tip, first, seed + 2)].join(
        " ",
      ),
      "soft",
      1.6,
    ),
  ];
}

export function thought(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  small: readonly (readonly [number, number, number])[],
  seed: number,
): SketchPart[] {
  return [
    stroke(loopD(cx, cy, rx, ry, seed), "soft", 1.6),
    ...small.map(([x, y, radius], index) =>
      stroke(loopD(x, y, radius, radius, seed + 3 + index), "soft", 1.5),
    ),
  ];
}

export function sun(cx: number, cy: number, radius: number, seed: number): SketchPart[] {
  const rays: SketchPart[] = [];
  for (let index = 0; index < 8; index += 1) {
    const degrees = index * 45;
    rays.push(
      stroke(
        lineD(
          polar(cx, cy, radius * 1.45, degrees),
          polar(cx, cy, radius * 1.95, degrees),
          seed + 2 + index,
        ),
        "mark",
        1.6,
      ),
    );
  }
  return [stroke(loopD(cx, cy, radius, radius, seed), "mark", 1.7), ...rays];
}

export function waves(x: number, y: number, width: number, seed: number): SketchPart {
  const points: Point[] = [];
  const steps = Math.round(width / 10);
  for (let index = 0; index <= steps; index += 1) {
    points.push([x + (index / steps) * width, y + (index % 2 === 0 ? 0 : -4)]);
  }
  return stroke(curveD(points, seed, 0.3), "soft", 1.5);
}

export function sheet(
  x: number,
  y: number,
  width: number,
  height: number,
  lines: number,
  seed: number,
): SketchPart[] {
  const parts: SketchPart[] = [stroke(boxD(x, y, width, height, seed))];
  for (let index = 0; index < lines; index += 1) {
    const end = x + width - 8 - (index === lines - 1 ? 12 : 0);
    const y0 = y + 14 + index * 12;
    parts.push(
      stroke(lineD([x + 8, y0], [end, y0], seed + 10 + index), "soft", 1.3, 0.75),
    );
  }
  return parts;
}

export function check(x: number, y: number, seed: number): SketchPart {
  return stroke(
    curveD(
      [
        [x, y],
        [x + 6, y + 8],
        [x + 20, y - 12],
      ],
      seed,
      0.4,
    ),
    "mark",
    2.4,
  );
}

export function calendar(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
): SketchPart[] {
  const parts: SketchPart[] = [
    stroke(boxD(x, y, width, height, seed), "soft"),
    stroke(lineD([x + 2, y + 7], [x + width - 2, y + 7], seed + 5), "mark", 5, 0.5),
    stroke(lineD([x, y + 14], [x + width, y + 14], seed + 4), "soft"),
    stroke(lineD([x + width * 0.3, y - 5], [x + width * 0.3, y + 4], seed + 6), "soft"),
    stroke(lineD([x + width * 0.7, y - 5], [x + width * 0.7, y + 4], seed + 7), "soft"),
  ];
  const rowStep = (height - 14) / 3;
  for (let row = 1; row <= 2; row += 1) {
    const rowY = y + 14 + row * rowStep;
    parts.push(
      stroke(lineD([x, rowY], [x + width, rowY], seed + 8 + row), "soft", 1.2, 0.55),
    );
  }
  for (let column = 1; column <= 2; column += 1) {
    const columnX = x + (column * width) / 3;
    parts.push(
      stroke(
        lineD([columnX, y + 14], [columnX, y + height], seed + 12 + column),
        "soft",
        1.2,
        0.55,
      ),
    );
  }
  return parts;
}

export function house(
  x: number,
  width: number,
  height: number,
  seed: number,
  tone: Tone = "ink",
  base = GROUND,
  doorHeight = 16,
): SketchPart[] {
  const top = base - height;
  const middle = x + width / 2;
  return [
    stroke(boxD(x, top, width, height, seed), tone),
    stroke(lineD([x - 4, top], [middle, top - 14], seed + 5), tone),
    stroke(lineD([middle, top - 14], [x + width + 4, top], seed + 6), tone),
    stroke(
      curveD(
        [
          [middle - 5, base],
          [middle - 5, base - doorHeight],
          [middle + 5, base - doorHeight],
          [middle + 5, base],
        ],
        seed + 7,
        0.4,
      ),
      tone,
    ),
  ];
}

export function windowFrame(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
): SketchPart[] {
  return [
    stroke(boxD(x, y, width, height, seed), "soft"),
    stroke(lineD([x + width / 2, y], [x + width / 2, y + height], seed + 5), "soft"),
    stroke(lineD([x, y + height / 2], [x + width, y + height / 2], seed + 10), "soft"),
    stroke(lineD([x + 6, y + 14], [x + 13, y + 6], seed + 11), "soft", 1.3, 0.8),
    stroke(lineD([x + 10, y + 18], [x + 15, y + 12], seed + 12), "soft", 1.3, 0.8),
    stroke(lineD([x + width, y], [x + width + 20, y + 9], seed + 6), "mark", 1.9),
    stroke(
      lineD([x + width + 20, y + 9], [x + width + 20, y + height - 6], seed + 7),
      "mark",
      1.9,
    ),
    stroke(
      lineD([x + width + 20, y + height - 6], [x + width, y + height], seed + 8),
      "mark",
      1.9,
    ),
    stroke(
      lineD([x - 5, y + height + 3], [x + width + 5, y + height + 3], seed + 9),
      "soft",
      1.5,
    ),
  ];
}

export function pin(x: number, y: number, seed: number): SketchPart[] {
  return [
    stroke(
      curveD(
        [
          [x, y],
          [x - 7, y - 13],
          [x, y - 23],
          [x + 7, y - 13],
          [x, y],
        ],
        seed,
        0.3,
      ),
      "mark",
      1.9,
    ),
    dot(x, y - 13, 3, seed + 1),
  ];
}

export function clockAtHalfPastTwo(
  cx: number,
  cy: number,
  radius: number,
  seed: number,
): SketchPart[] {
  const parts: SketchPart[] = [stroke(loopD(cx, cy, radius, radius, seed), "ink", 1.7)];
  [0, 90, 180, 270].forEach((degrees, index) => {
    parts.push(
      stroke(
        lineD(
          polar(cx, cy, radius - 6, degrees),
          polar(cx, cy, radius - 1, degrees),
          seed + 2 + index,
        ),
        "soft",
        1.5,
      ),
    );
  });
  parts.push(
    stroke(lineD([cx, cy], polar(cx, cy, radius * 0.85, 180), seed + 8), "ink", 2.4),
    stroke(lineD([cx, cy], polar(cx, cy, radius * 0.58, 75), seed + 9), "mark", 3),
    dot(cx, cy, 2.4, seed + 10),
  );
  return parts;
}

export function tile(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
): SketchPart {
  return stroke(boxD(x, y, width, height, seed), "soft", 1.5);
}
