export type Point = readonly [number, number];

export function inkRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 10) / 10;
const point = ([x, y]: Point) => `${round(x)} ${round(y)}`;
const spread = (random: () => number, amount: number) => (random() - 0.5) * 2 * amount;

export function smoothD(points: readonly Point[], closed = false): string {
  const count = points.length;
  if (count < 2) return "";
  const at = (index: number): Point =>
    (closed
      ? points[((index % count) + count) % count]
      : points[Math.max(0, Math.min(count - 1, index))]) as Point;
  const segments = closed ? count : count - 1;
  let d = `M${point(at(0))}`;
  for (let index = 0; index < segments; index += 1) {
    const p0 = at(index - 1);
    const p1 = at(index);
    const p2 = at(index + 1);
    const p3 = at(index + 2);
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${point(c1)} ${point(c2)} ${point(p2)}`;
  }
  return closed ? `${d} Z` : d;
}

export function lineD(from: Point, to: Point, seed: number, bow = 1): string {
  const random = inkRandom(seed);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const over = Math.min(2, length * 0.03);
  const start: Point = [
    from[0] - ux * over * random() + spread(random, 0.4),
    from[1] - uy * over * random() + spread(random, 0.4),
  ];
  const end: Point = [
    to[0] + ux * over * random() + spread(random, 0.4),
    to[1] + uy * over * random() + spread(random, 0.4),
  ];
  const bend = spread(random, Math.min(3, length * 0.03)) * bow;
  const control: Point = [
    (start[0] + end[0]) / 2 - uy * bend,
    (start[1] + end[1]) / 2 + ux * bend,
  ];
  return `M${point(start)} Q${point(control)} ${point(end)}`;
}

export function boxD(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
): string {
  const corners: Point[] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
  return corners
    .map((corner, index) =>
      lineD(corner, corners[(index + 1) % 4] as Point, seed + index * 7),
    )
    .join(" ");
}

export function loopD(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
): string {
  const random = inkRandom(seed);
  const steps = 8;
  const first = random() * Math.PI * 2;
  const points: Point[] = [];
  for (let index = 0; index <= steps + 1; index += 1) {
    const angle = first + (index / steps) * Math.PI * 2;
    const wobble = 1 + spread(random, 0.035) - (index > steps ? 0.06 : 0);
    points.push([cx + Math.cos(angle) * rx * wobble, cy + Math.sin(angle) * ry * wobble]);
  }
  return smoothD(points);
}

export function patchD(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
): string {
  const random = inkRandom(seed);
  const steps = 9;
  const first = random() * Math.PI * 2;
  const points: Point[] = [];
  for (let index = 0; index < steps; index += 1) {
    const angle = first + (index / steps) * Math.PI * 2;
    const wobble = 1 + spread(random, 0.12);
    points.push([cx + Math.cos(angle) * rx * wobble, cy + Math.sin(angle) * ry * wobble]);
  }
  return smoothD(points, true);
}

export function curveD(points: readonly Point[], seed: number, jitter = 0.7): string {
  const random = inkRandom(seed);
  return smoothD(
    points.map(([x, y]): Point => [
      x + spread(random, jitter),
      y + spread(random, jitter),
    ]),
  );
}

export interface InkArrow {
  shaft: string;
  head: string;
}

export function arrowD(from: Point, to: Point, seed: number, bend = 0): InkArrow {
  const random = inkRandom(seed);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const sag = bend + spread(random, Math.min(2.5, length * 0.02));
  const middle: Point = [
    (from[0] + to[0]) / 2 + nx * sag,
    (from[1] + to[1]) / 2 + ny * sag,
  ];
  const shaft = smoothD([from, middle, to]);
  const tangent = Math.atan2(to[1] - middle[1], to[0] - middle[0]);
  const size = 10 + spread(random, 1);
  const wing = (side: number): Point => {
    const angle = tangent + Math.PI + side * (0.5 + spread(random, 0.08));
    return [to[0] + Math.cos(angle) * size, to[1] + Math.sin(angle) * size];
  };
  const left = wing(1);
  const right = wing(-1);
  const half = (corner: Point): Point => [
    (corner[0] + to[0]) / 2,
    (corner[1] + to[1]) / 2,
  ];
  const head = `M${point(left)} Q${point(half(left))} ${point(to)} Q${point(half(right))} ${point(right)}`;
  return { shaft, head };
}
