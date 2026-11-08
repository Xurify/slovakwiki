/**
 * Paper-cut topic tiles for grammar pages without photographed art.
 * Each tile is drawn as flat shapes in the house palette (docs/lesson-motifs.md),
 * with felt grain and a soft contact shadow, and rendered to
 * static/lessons/motifs/<id>.webp at 1024 px.
 *
 * Usage: bun scripts/images/felt-motifs.ts
 *        bun scripts/images/felt-motifs.ts -- --ids aspect,imperative
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const SIZE = 1024;
const OUT_DIR = path.join(process.cwd(), "static/lessons/motifs");

const NAVY = "#1E3D6B";
const ROYAL = "#1A4F8F";
const SLATE = "#5F7489";
const SKY = "#8FB4D4";
const CREAM = "#F0EBE0";
const PAPER = "#F0E8D4";

type Point = readonly [number, number];

const round = (value: number) => Math.round(value * 10) / 10;

function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
): string {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}"/>`;
}

function circle(cx: number, cy: number, r: number, fill: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

function polygon(points: readonly Point[], fill: string): string {
  const list = points.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
  return `<polygon points="${list}" fill="${fill}" stroke="${fill}" stroke-width="18" stroke-linejoin="round"/>`;
}

function stroke(d: string, color: string, width: number): string {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function arrowRight(
  x: number,
  y: number,
  length: number,
  thickness: number,
  fill: string,
): string {
  const head = thickness * 1.9;
  const shaft = length - head * 0.7;
  return (
    rect(x, y - thickness / 2, shaft, thickness, thickness / 2, fill) +
    polygon(
      [
        [x + length - head, y - head * 0.85],
        [x + length, y],
        [x + length - head, y + head * 0.85],
      ],
      fill,
    )
  );
}

function arrowLeft(
  x: number,
  y: number,
  length: number,
  thickness: number,
  fill: string,
): string {
  const head = thickness * 1.9;
  return (
    rect(
      x + head * 0.7,
      y - thickness / 2,
      length - head * 0.7,
      thickness,
      thickness / 2,
      fill,
    ) +
    polygon(
      [
        [x + head, y - head * 0.85],
        [x, y],
        [x + head, y + head * 0.85],
      ],
      fill,
    )
  );
}

function star(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  fill: string,
): string {
  const points: Point[] = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return polygon(points, fill);
}

function loopArrow(
  cx: number,
  cy: number,
  radius: number,
  width: number,
  color: string,
): string {
  const start = (-30 * Math.PI) / 180;
  const end = (250 * Math.PI) / 180;
  const from: Point = [cx + radius * Math.cos(start), cy + radius * Math.sin(start)];
  const to: Point = [cx + radius * Math.cos(end), cy + radius * Math.sin(end)];
  const tangent: Point = [-Math.sin(end), Math.cos(end)];
  const normal: Point = [-tangent[1], tangent[0]];
  const base: Point = [to[0] + tangent[0] * 10, to[1] + tangent[1] * 10];
  const tip: Point = [base[0] + tangent[0] * 95, base[1] + tangent[1] * 95];
  const arc = `M ${round(from[0])} ${round(from[1])} A ${radius} ${radius} 0 1 1 ${round(to[0])} ${round(to[1])}`;
  return (
    stroke(arc, color, width) +
    polygon(
      [
        [base[0] + normal[0] * 62, base[1] + normal[1] * 62],
        tip,
        [base[0] - normal[0] * 62, base[1] - normal[1] * 62],
      ],
      color,
    )
  );
}

function petal(
  cx: number,
  cy: number,
  distance: number,
  angleDegrees: number,
  fill: string,
): string {
  const angle = (angleDegrees * Math.PI) / 180;
  const x = cx + distance * Math.cos(angle);
  const y = cy + distance * Math.sin(angle);
  return `<ellipse cx="${round(x)}" cy="${round(y)}" rx="74" ry="150" transform="rotate(${angleDegrees + 90} ${round(x)} ${round(y)})" fill="${fill}"/>`;
}

const SCENES: Record<string, string> = {
  "grammatical-gender": [
    [NAVY, 250],
    [ROYAL, 450],
    [SKY, 650],
  ]
    .map(([fill, top]) => {
      const y = Number(top);
      return (
        rect(190, y + 33, 230, 64, 32, String(fill)) +
        rect(450, y, 380, 130, 36, String(fill)) +
        circle(520, y + 65, 17, CREAM) +
        circle(572, y + 65, 17, CREAM) +
        circle(624, y + 65, 17, CREAM)
      );
    })
    .join(""),

  "cases-overview": [
    ...[0, 60, 120, 180, 240, 300].map((angle, index) =>
      petal(
        512,
        512,
        190,
        angle - 90,
        [NAVY, ROYAL, SKY, SLATE, ROYAL, SKY][index] ?? NAVY,
      ),
    ),
    circle(512, 512, 92, CREAM),
    circle(512, 512, 40, NAVY),
  ].join(""),

  "future-tense": [
    circle(140, 512, 22, SKY),
    circle(205, 512, 22, SKY),
    arrowRight(270, 512, 440, 82, NAVY),
    rect(770, 340, 26, 300, 13, SLATE),
    polygon(
      [
        [796, 350],
        [902, 405],
        [796, 460],
      ],
      SKY,
    ),
  ].join(""),

  "past-tense": [
    `<g transform="translate(${SIZE} 0) scale(-1 1)">`,
    circle(140, 512, 22, SKY),
    circle(205, 512, 22, SKY),
    arrowRight(270, 512, 440, 82, SLATE),
    rect(770, 340, 26, 300, 13, NAVY),
    polygon(
      [
        [796, 350],
        [902, 405],
        [796, 460],
      ],
      SKY,
    ),
    `</g>`,
  ].join(""),

  "case-nominative": [
    circle(340, 512, 150, NAVY),
    arrowRight(520, 512, 330, 78, ROYAL),
  ].join(""),

  "case-genitive": [
    circle(430, 512, 200, NAVY),
    rect(600, 482, 120, 60, 30, SLATE),
    circle(760, 512, 96, SKY),
  ].join(""),

  "case-dative": [
    rect(220, 400, 270, 250, 40, NAVY),
    rect(335, 400, 40, 250, 0, CREAM),
    rect(220, 490, 270, 40, 0, CREAM),
    arrowRight(530, 520, 190, 60, ROYAL),
    circle(790, 520, 100, SKY),
  ].join(""),

  "case-accusative": [
    circle(620, 512, 230, SKY),
    circle(620, 512, 150, ROYAL),
    circle(620, 512, 70, NAVY),
    arrowRight(130, 512, 420, 66, SLATE),
  ].join(""),

  "case-locative": [
    '<ellipse cx="512" cy="770" rx="230" ry="46" fill="' + SKY + '"/>',
    circle(512, 440, 190, NAVY),
    polygon(
      [
        [352, 540],
        [672, 540],
        [512, 770],
      ],
      NAVY,
    ),
    circle(512, 440, 74, CREAM),
  ].join(""),

  "case-instrumental": [
    '<g transform="rotate(-35 512 512)">',
    rect(210, 470, 60, 84, 16, SKY),
    rect(250, 470, 440, 84, 8, NAVY),
    rect(250, 505, 440, 14, 0, ROYAL),
    polygon(
      [
        [690, 470],
        [690, 554],
        [820, 512],
      ],
      CREAM,
    ),
    polygon(
      [
        [790, 497],
        [790, 527],
        [830, 512],
      ],
      NAVY,
    ),
    "</g>",
  ].join(""),

  aspect: [
    stroke("M 200 360 C 280 280, 360 440, 440 360 S 600 280, 680 360", SKY, 64),
    polygon(
      [
        [690, 292],
        [790, 360],
        [690, 428],
      ],
      SKY,
    ),
    rect(200, 610, 480, 64, 32, NAVY),
    circle(764, 642, 100, ROYAL),
    stroke("M 716 644 L 750 680 L 812 606", CREAM, 36),
  ].join(""),

  "motion-verbs": [
    arrowRight(230, 330, 520, 76, NAVY),
    arrowRight(230, 560, 470, 62, ROYAL),
    arrowLeft(330, 700, 470, 62, SKY),
  ].join(""),

  imperative: [
    rect(212, 240, 600, 400, 110, NAVY),
    polygon(
      [
        [330, 630],
        [292, 780],
        [480, 645],
      ],
      NAVY,
    ),
    rect(486, 320, 52, 200, 26, CREAM),
    circle(512, 586, 36, CREAM),
  ].join(""),

  conditional: [
    circle(400, 470, 130, SKY),
    circle(540, 400, 150, SKY),
    circle(670, 480, 120, SKY),
    rect(320, 470, 440, 170, 85, SKY),
    circle(350, 730, 46, SKY),
    circle(290, 820, 28, SLATE),
    star(540, 470, 100, 42, NAVY),
  ].join(""),

  "reflexive-verbs": [
    loopArrow(512, 512, 260, 66, ROYAL),
    circle(512, 512, 120, NAVY),
    circle(512, 512, 40, CREAM),
  ].join(""),

  possessives: [
    `<g transform="rotate(-18 512 512)">`,
    `<circle cx="330" cy="512" r="120" fill="none" stroke="${NAVY}" stroke-width="78"/>`,
    rect(430, 480, 400, 64, 32, NAVY),
    rect(690, 530, 58, 110, 16, NAVY),
    rect(772, 530, 58, 78, 16, ROYAL),
    `</g>`,
  ].join(""),

  "word-order": [
    rect(137, 450, 210, 210, 46, NAVY),
    rect(407, 450, 210, 210, 46, ROYAL),
    rect(677, 450, 210, 210, 46, SKY),
    stroke("M 242 410 C 242 200, 782 200, 782 410", SLATE, 46),
    polygon(
      [
        [198, 352],
        [286, 352],
        [242, 432],
      ],
      SLATE,
    ),
    polygon(
      [
        [738, 352],
        [826, 352],
        [782, 432],
      ],
      SLATE,
    ),
  ].join(""),
};

function svgFor(scene: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <filter id="paperGrain" filterUnits="userSpaceOnUse" x="0" y="0" width="${SIZE}" height="${SIZE}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.55 -0.2"/>
    </filter>
    <filter id="feltGrain" filterUnits="userSpaceOnUse" x="0" y="0" width="${SIZE}" height="${SIZE}">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="11" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.08  0 0 0 0 0.15  0 0 0 1.1 -0.45" result="speck"/>
      <feComposite in="speck" in2="SourceAlpha" operator="in" result="speckIn"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="speckIn"/></feMerge>
    </filter>
    <filter id="contactShadow" filterUnits="userSpaceOnUse" x="0" y="0" width="${SIZE}" height="${SIZE}">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur"/>
      <feOffset in="blur" dx="4" dy="8" result="offset"/>
      <feComponentTransfer in="offset" result="shadow"><feFuncA type="linear" slope="0.26"/></feComponentTransfer>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="${PAPER}"/>
  <rect width="${SIZE}" height="${SIZE}" fill="#000" filter="url(#paperGrain)" opacity="0.5"/>
  <g filter="url(#contactShadow)"><g filter="url(#feltGrain)">${scene}</g></g>
</svg>`;
}

async function edgePaper(png: Buffer): Promise<string> {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const totals = [0, 0, 0];
  let count = 0;
  for (
    let y = Math.round(info.height * 0.125);
    y < Math.round(info.height * 0.875);
    y += 4
  ) {
    for (let x = 0; x < 28; x += 2) {
      for (const side of [x, info.width - 1 - x]) {
        const at = (y * info.width + side) * info.channels;
        totals[0] = (totals[0] ?? 0) + (data[at] ?? 0);
        totals[1] = (totals[1] ?? 0) + (data[at + 1] ?? 0);
        totals[2] = (totals[2] ?? 0) + (data[at + 2] ?? 0);
        count += 1;
      }
    }
  }
  return `#${totals
    .map((total) =>
      Math.round(total / count)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

async function main(): Promise<void> {
  const flag = process.argv.indexOf("--ids");
  const wanted =
    flag === -1 ? Object.keys(SCENES) : (process.argv[flag + 1] ?? "").split(",");
  await mkdir(OUT_DIR, { recursive: true });

  for (const id of wanted) {
    const scene = SCENES[id];
    if (!scene) throw new Error(`No scene for ${id}`);
    const png = await sharp(Buffer.from(svgFor(scene)))
      .png()
      .toBuffer();
    const webp = await sharp(png).webp({ quality: 84 }).toBuffer();
    await writeFile(path.join(OUT_DIR, `${id}.webp`), webp);
    console.log(
      `${id.padEnd(20)} ${String(webp.length).padStart(7)} B  paper ${await edgePaper(png)}`,
    );
  }
}

await main();
