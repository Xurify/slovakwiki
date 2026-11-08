import { arrowD, lineD, loopD } from "./ink-paths";
import { boat, overheadShower, sectorPatch } from "./marks";
import { farGround, pencil, tie } from "./objects";
import { person } from "./people";
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
  tile,
  waves,
  windowFrame,
} from "./things";

const cupTop = GROUND - 18;

function cupsAt(xs: readonly number[], seed: number): SketchPart[] {
  return xs.flatMap((x, index) => cup(x, cupTop, seed + index * 3));
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
  const parts: SketchPart[] = [...person(170, 1201, { dress: true })];
  CASE_NAMES.forEach((name, index) => {
    const left = index < 3;
    const y = ROWS[index % 3] as number;
    const x = left ? 62 : 278;
    const first = index === 0;
    parts.push(
      stroke(
        lineD([left ? 160 : 180, 70], [left ? 106 : 234, y - 5], 1210 + index),
        first ? "mark" : "soft",
        first ? 2.1 : 1.3,
        first ? 1 : 0.7,
      ),
      note(x, y, MAMA_FORMS[index] as string),
      note(x, y + 16, name, { tone: "soft", size: "small" }),
    );
  });
  parts.push(patch(62, 26, 36, 18, 1220));
  return parts;
}

export const TOPIC_SCENES: Record<string, () => SketchPart[]> = {
  "grammatical-gender": () => [
    ...ground(),
    ...figure(60, 101),
    ...person(150, 111, { dress: true }),
    ...building(224, 26, 50, 121),
    ...building(252, 30, 64, 126),
    ...building(286, 28, 44, 131),
    note(60, 126, "**ten** muž"),
    note(150, 126, "**tá** žena"),
    note(269, 126, "**to** mesto"),
  ],

  "numbers-and-numerals": () => [
    ...ground(),
    note(37, 78, "1", { tone: "soft" }),
    note(113, 78, "2", { tone: "soft" }),
    note(240, 78, "5", { tone: "soft" }),
    ...cupsAt([22], 131),
    ...cupsAt([84, 116], 141),
    ...cupsAt([164, 196, 228, 260, 292], 161),
    note(37, 126, "káv**a**"),
    note(113, 126, "káv**y**"),
    note(240, 126, "káv"),
  ],

  "present-tense": () => [
    ...ground(),
    ...figure(86, 141),
    ...bubble(214, 50, 84, 29, [100, 58], 151),
    note(170, 55, "(ja)", { tone: "soft" }),
    note(244, 55, "rozum**iem**"),
  ],

  "byt-present": () => [
    ...ground(),
    ...figure(60, 171),
    ...gradCap(60, 176),
    note(60, 126, "**som** študent"),
    ...house(170, 84, 56, 181, "ink", GROUND, 26),
    ...figure(190, 191),
    note(212, 126, "**som** doma"),
  ],

  "mat-present": () => [
    ...ground(),
    ...figure(110, 201, 1),
    ...cup(131, 58, 211, 1.15),
    ...bubble(58, 40, 42, 21, [102, 56], 221),
    note(58, 45, "**mám**"),
  ],

  "past-tense": () => [
    ...ground(),
    ...figure(86, 231),
    ...person(254, 241, { dress: true }),
    note(170, 22, "včera"),
    note(86, 126, "pracova**l**"),
    note(254, 126, "pracova**la**"),
  ],

  aspect: () => [
    patch(252, 62, 50, 48, 301),
    ...sheet(40, 26, 76, 72, 2, 311),
    ...pencil([92, 56], [112, 36], 321),
    ...sheet(214, 26, 76, 72, 4, 331),
    check(258, 88, 341),
    note(78, 124, "písal"),
    note(252, 124, "**na**písal"),
  ],

  "future-tense": () => [
    ...ground(),
    ...figure(56, 271),
    ...arrow([92, 72], [214, 72], 281, 5),
    note(153, 52, "**budem**"),
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
    ...house(138, 36, 30, 331),
    ...figure(204, 341, 1),
    ...arrow([232, 60], [278, 60], 361, -3),
    ...arrow([278, 86], [232, 86], 371, 3),
    ...house(286, 36, 30, 351),
    note(94, 46, "teraz", { tone: "soft", size: "small" }),
    note(260, 42, "každý deň", { tone: "soft", size: "small" }),
    note(90, 126, "ísť"),
    note(260, 126, "chodiť"),
  ],

  imperative: () => [
    ...ground(),
    ...figure(60, 401, 1),
    ...bubble(136, 38, 48, 21, [76, 56], 411),
    note(136, 43, "Zatvor!"),
    ...figure(206, 421),
    ...windowFrame(252, 40, 40, 48, 431),
    ...arrow([316, 58], [296, 86], 441, 8),
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
    ...boat(246, 55, 495),
  ],

  "reflexive-verbs": () => [
    ...ground(),
    ...overheadShower(176, 501),
    ...person(176, 511, { washing: true }),
    note(176, 126, "**sa**"),
  ],

  "cases-overview": oneNounSixEndings,

  demonstratives: () => [
    ...ground(),
    ...figure(48, 601, 1),
    ...house(100, 46, 40, 611),
    farGround(196, 252, 88, 618),
    ...house(212, 26, 24, 621, "soft", 88),
    note(123, 126, "ten**to**"),
    note(225, 126, "**tam**ten"),
  ],

  possessives: () => [
    ...ground(),
    ...person(134, 701, { grip: [157, 80] }),
    ...bubble(80, 38, 36, 20, [126, 54], 705),
    note(80, 43, "**môj**"),
    patch(190, 64, 46, 40, 709),
    ...house(160, 60, 44, 711),
    note(190, 126, "**môj** dom"),
  ],

  "word-order": () => [
    patch(229, 93, 46, 22, 1021),
    ...wordTile(36, 14, 70, "Peter", 1001),
    ...wordTile(118, 14, 64, "číta", 1005),
    ...wordTile(194, 14, 70, "knih**u**", 1009),
    ...wordTile(36, 78, 70, "knih**u**", 1013),
    ...wordTile(118, 78, 64, "číta", 1017),
    ...wordTile(194, 78, 70, "Peter", 1025),
    ...swapArrows(),
  ],

  "ty-vs-vy": () => [
    ...ground(),
    ...figure(18, 801, 1),
    ...arrow([40, 68], [62, 68], 811, 2),
    ...figure(80, 821),
    note(80, 126, "ty"),
    note(80, 42, "informal", { tone: "soft", size: "small" }),
    ...figure(130, 831, 1),
    ...arrow([152, 68], [174, 68], 841, 2),
    ...figure(192, 851),
    ...tie(192, 871),
    note(192, 126, "vy"),
    note(192, 42, "formal", { tone: "soft", size: "small" }),
    ...figure(242, 881, 1),
    ...arrow([264, 68], [286, 68], 891, 2),
    ...figure(304, 901),
    ...figure(326, 911),
    note(315, 126, "vy"),
    note(304, 42, "several", { tone: "soft", size: "small" }),
  ],

  negation: () => [
    ...ground(),
    ...figure(80, 901),
    note(80, 40, "?", { tone: "soft", size: "large" }),
    ...bubble(200, 50, 72, 26, [96, 58], 911),
    note(200, 55, "**ne**rozumiem"),
  ],

  questions: () => [
    ...ground(),
    ...person(52, 951, { grip: [76, 68] }),
    ...bubble(120, 38, 50, 25, [66, 52], 961),
    note(120, 46, "**kde**?", { size: "large" }),
    ...person(186, 965),
    ...house(236, 38, 30, 975),
    ...pin(255, 56, 971),
  ],

  "telling-time": () => [
    sectorPatch(170, 52, 30, 60, 90),
    ...clockAtHalfPastTwo(170, 52, 38, 1001),
    note(...polar(170, 56, 51, 60), "2", { tone: "soft", size: "small" }),
    note(...polar(170, 56, 51, 90), "3", { tone: "soft", size: "small" }),
    note(170, 118, "**pol** tretej"),
    note(104, 58, "2:30", { tone: "soft" }),
  ],
};
