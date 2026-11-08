import { arrowD, boxD, lineD, loopD } from "./ink-paths";
import {
  GROUND,
  arrow,
  building,
  figure,
  ground,
  note,
  patch,
  stroke,
  type SketchPart,
} from "./pieces";
import {
  bubble,
  calendar,
  check,
  clockAtHalfPastTwo,
  cup,
  gradCap,
  house,
  pin,
  polar,
  sheet,
  sun,
  thought,
  tie,
  tile,
  waves,
  windowFrame,
  woman,
} from "./things";

const CUP_SCALE = 1;
const cupTop = GROUND - 18 * CUP_SCALE;

function cupsAt(xs: readonly number[], seed: number): SketchPart[] {
  return xs.flatMap((x, index) => cup(x, cupTop, seed + index * 3, CUP_SCALE));
}

function wordTile(
  x: number,
  y: number,
  width: number,
  word: string,
  seed: number,
): SketchPart[] {
  return [tile(x, y, width, 30, seed), note(x + width / 2, y + 20, word)];
}

function swapArrows(): SketchPart[] {
  const moved = arrowD([229, 50], [75, 76], 1031, 0);
  const pushed = arrowD([71, 50], [225, 76], 1033, 0);
  return [
    stroke(moved.shaft, "mark", 2.1),
    stroke(moved.head, "mark", 2.1),
    stroke(pushed.shaft, "soft", 1.6),
    stroke(pushed.head, "soft", 1.6),
  ];
}

const CASE_NAMES = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "locative",
  "instrumental",
];
const MAMA_FORMS = ["mama", "mamy", "mame", "mamu", "mame", "mamou"];
const ROWS = [30, 66, 102];

function oneNounSixEndings(): SketchPart[] {
  const parts: SketchPart[] = [...figure(170, 1201)];
  CASE_NAMES.forEach((name, index) => {
    const left = index < 3;
    const y = ROWS[index % 3] as number;
    const x = left ? 62 : 278;
    const genitive = index === 1;
    parts.push(
      stroke(
        lineD([left ? 160 : 180, 70], [left ? 106 : 234, y - 5], 1210 + index),
        genitive ? "mark" : "soft",
        genitive ? 2.1 : 1.3,
        genitive ? 1 : 0.7,
      ),
      note(x, y, MAMA_FORMS[index] as string),
      note(x, y + 12, name, { tone: "soft", size: "small" }),
    );
  });
  parts.push(patch(62, 62, 36, 18, 1220));
  return parts;
}

export const TOPIC_SCENES: Record<string, () => SketchPart[]> = {
  "grammatical-gender": () => [
    ...ground(),
    ...figure(70, 101),
    ...woman(170, 111),
    ...building(240, 30, 44, 121),
    ...building(274, 28, 62, 126),
    note(70, 126, "muž"),
    note(170, 126, "žena"),
    note(272, 126, "mesto"),
  ],

  "numbers-and-numerals": () => [
    ...ground(),
    ...cupsAt([22], 131),
    ...cupsAt([84, 116], 141),
    ...cupsAt([164, 196, 228, 260, 292], 161),
    note(37, 126, "1"),
    note(113, 126, "2"),
    note(240, 126, "5"),
  ],

  "present-tense": () => [
    ...ground(),
    ...figure(86, 141),
    ...bubble(206, 50, 74, 26, [100, 58], 151),
    note(168, 55, "ja", { tone: "soft" }),
    stroke(lineD([157, 50], [180, 50], 160), "soft", 1.6),
    note(236, 55, "rozum**iem**"),
  ],

  "byt-present": () => [
    ...ground(),
    ...figure(60, 171),
    ...gradCap(60, 176),
    note(60, 126, "kto", { tone: "soft" }),
    ...house(170, 84, 56, 181),
    ...figure(190, 191),
    note(212, 126, "kde", { tone: "soft" }),
  ],

  "mat-present": () => [
    ...ground(),
    ...figure(130, 201, 1),
    stroke(boxD(154, 52, 48, 30, 211)),
    stroke(lineD([154, 62], [202, 62], 215), "soft", 3),
    stroke(boxD(160, 70, 12, 8, 216), "soft", 1.3),
  ],

  "past-tense": () => [
    ...ground(),
    ...figure(86, 231),
    ...woman(254, 241),
    ...arrow([200, 40], [140, 40], 251, -2),
    note(170, 26, "včera", { tone: "soft", size: "small" }),
    note(86, 126, "pracova**l**"),
    note(254, 126, "pracova**la**"),
  ],

  aspect: () => [
    patch(252, 62, 50, 48, 301),
    ...sheet(40, 26, 76, 72, 2, 311),
    stroke(lineD([97, 52], [111, 37], 321), "ink", 2.6),
    ...sheet(214, 26, 76, 72, 4, 331),
    check(258, 88, 341),
    note(78, 124, "písal"),
    note(252, 124, "**na**písal"),
  ],

  "future-tense": () => [
    ...ground(),
    ...figure(56, 271),
    ...arrow([92, 72], [214, 72], 281, 5),
    patch(263, 72, 40, 46, 291),
    ...calendar(236, 44, 54, 58, 301),
    stroke(loopD(263, 80, 6, 6, 331), "mark", 2),
    note(56, 126, "dnes", { tone: "soft" }),
    note(263, 126, "zajtra"),
  ],

  "motion-verbs": () => [
    ...ground(),
    ...figure(36, 311, 1),
    ...arrow([64, 66], [124, 66], 321, -3),
    ...building(136, 34, 52, 331),
    ...figure(204, 341, 1),
    ...arrow([232, 60], [278, 60], 361, -3),
    ...arrow([278, 86], [232, 86], 371, 3),
    ...building(284, 34, 52, 351),
    note(90, 126, "ísť"),
    note(260, 126, "chodiť"),
  ],

  imperative: () => [
    ...ground(),
    ...figure(60, 401, 1),
    ...bubble(132, 40, 40, 17, [76, 56], 411),
    note(132, 45, "Zatvor!"),
    ...figure(206, 421),
    ...windowFrame(252, 40, 40, 48, 431),
  ],

  conditional: () => [
    ...ground(),
    ...figure(90, 451),
    ...thought(
      215,
      46,
      64,
      30,
      [
        [108, 56, 3],
        [124, 64, 4.5],
      ],
      461,
    ),
    ...sun(190, 42, 9, 471),
    waves(214, 58, 56, 490),
    waves(224, 66, 44, 492),
    note(170, 126, "**by**"),
  ],

  "reflexive-verbs": () => [
    ...ground(),
    ...figure(150, 501),
    ...arrow([153, 71], [153, 91], 511, -40),
    note(150, 126, "**sa**"),
  ],

  "cases-overview": oneNounSixEndings,

  demonstratives: () => [
    ...ground(),
    ...figure(48, 601, 1),
    ...house(100, 46, 40, 611),
    ...house(212, 26, 24, 621, "soft"),
    note(123, 126, "ten**to**"),
    note(225, 126, "**tam**ten"),
  ],

  possessives: () => [
    ...ground(),
    ...figure(100, 701, 1),
    patch(190, 64, 46, 40, 705),
    ...house(160, 60, 44, 711),
    note(190, 126, "**môj**"),
  ],

  "word-order": () => [
    patch(229, 93, 46, 22, 1021),
    ...wordTile(36, 14, 70, "Peter", 1001),
    ...wordTile(118, 14, 64, "číta", 1005),
    ...wordTile(194, 14, 70, "knihu", 1009),
    ...wordTile(36, 78, 70, "knihu", 1013),
    ...wordTile(118, 78, 64, "číta", 1017),
    ...wordTile(194, 78, 70, "Peter", 1025),
    ...swapArrows(),
  ],

  "ty-vs-vy": () => [
    ...ground(),
    ...figure(34, 801, 1),
    ...arrow([60, 68], [104, 68], 811, 2),
    ...figure(130, 821),
    note(130, 126, "ty"),
    ...figure(190, 831, 1),
    ...arrow([216, 68], [258, 68], 841, 2),
    ...figure(282, 851),
    ...tie(282, 871),
    ...figure(312, 861),
    note(297, 126, "vy"),
  ],

  negation: () => [
    ...ground(),
    ...figure(80, 901),
    ...bubble(200, 50, 72, 26, [96, 58], 911),
    note(200, 55, "**ne**rozumiem"),
  ],

  questions: () => [
    ...ground(),
    ...figure(70, 951),
    ...bubble(150, 44, 44, 24, [84, 58], 961),
    note(150, 52, "**kde**?", { size: "large" }),
    ...pin(250, GROUND - 2, 971),
  ],

  "telling-time": () => [
    ...clockAtHalfPastTwo(150, 60, 40, 1001),
    note(...polar(150, 66, 28, 60), "2", { tone: "soft", size: "small" }),
    note(...polar(150, 66, 28, 90), "3", { tone: "soft", size: "small" }),
    ...arrow(polar(150, 60, 54, 52), polar(150, 60, 54, 88), 1021, 4),
  ],
};
