import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { NounGender } from "$lib/catalog/types";
import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
import type { PointReach } from "./gestures";
import { foldLine } from "./line-gesture";
import { lineWords, type LinePoint, type PointTarget } from "./line-plan";
import { STICK_BOX, type Point } from "./rig";

/** The backdrops' drawing space (StickBackdrop.svelte). */
export const BACKDROP_WIDTH = 960;
export const BACKDROP_HEIGHT = 300;

/**
 * Which part of the backdrop a narrow stage keeps: 0 the left end, 1 the
 * right, the middle unless set. The café keeps its counter, where the
 * cakes the scenes point at are, and the classroom its board.
 */
const BACKDROP_ALIGN: Partial<Record<LessonSceneArtId, number>> = {
  cafe: 1,
  classroom: 0,
};

export function backdropAlign(setting: LessonSceneArtId): number {
  return BACKDROP_ALIGN[setting] ?? 0.5;
}

export interface ThingBox {
  height: number;
  width: number;
  x: number;
  y: number;
}

/** Something drawn in a backdrop that a line can name, a figure can point at and a learner can tap. */
export interface SceneThing {
  box: ThingBox;
  english: string;
  /** Folded whole forms, where a stem would catch other words: `stol` is also in `stolička`. */
  forms?: string[];
  gender: NounGender;
  id: string;
  /** Other copies of it in the scene, which a tap finds too: the café's three lamps. */
  more?: ThingBox[];
  /** Folded stems that catch any case: `kolac` for koláč, koláča, koláčom. */
  stems?: string[];
  /** The nominative, as the dictionary lists it. */
  word: string;
}

type ThingWord = Omit<SceneThing, "box" | "more">;
type Rect = [x: number, y: number, width: number, height: number];

function toBox([x, y, width, height]: Rect): ThingBox {
  return { height, width, x, y };
}

/** A word drawn at `main`, and at `more` where the scene has it again. */
function drawn(word: ThingWord, main: Rect, ...more: Rect[]): SceneThing {
  return {
    ...word,
    box: toBox(main),
    ...(more.length > 0 ? { more: more.map(toBox) } : {}),
  };
}

/** Every box a thing is drawn in, its main one first. */
export function thingBoxes(thing: SceneThing): ThingBox[] {
  return [thing.box, ...(thing.more ?? [])];
}

/** Plants stand on the floor at their x; this is the box around pot and leaves. */
function plantAt(x: number, y: number): Rect {
  return [x - 22, y - 108, 44, 108];
}

const WORDS = {
  abeceda: {
    english: "alphabet",
    gender: "feminine",
    id: "abeceda",
    stems: ["abeced"],
    word: "abeceda",
  },
  dom: {
    english: "house",
    forms: ["dom", "domu", "dome", "domom", "domy", "domoch", "domami"],
    gender: "masculine-inanimate",
    id: "dom",
    word: "dom",
  },
  dunaj: {
    english: "the Danube",
    gender: "masculine-inanimate",
    id: "dunaj",
    stems: ["dunaj", "riek"],
    word: "Dunaj",
  },
  globus: {
    english: "globe",
    gender: "masculine-inanimate",
    id: "globus",
    stems: ["globus"],
    word: "glóbus",
  },
  hodiny: {
    english: "clock",
    forms: ["hodiny", "hodin", "hodinach", "hodinami"],
    gender: "plural-only",
    id: "hodiny",
    word: "hodiny",
  },
  hrad: {
    english: "castle",
    gender: "masculine-inanimate",
    id: "hrad",
    stems: ["hrad"],
    word: "hrad",
  },
  kavovar: {
    english: "coffee machine",
    gender: "masculine-inanimate",
    id: "kavovar",
    stems: ["kavovar"],
    word: "kávovar",
  },
  koberec: {
    english: "rug",
    forms: ["koberec", "koberca", "koberci", "kobercom", "koberce", "kobercov"],
    gender: "masculine-inanimate",
    id: "koberec",
    word: "koberec",
  },
  kolac: {
    english: "cake",
    gender: "masculine-inanimate",
    id: "kolac",
    stems: ["kolac"],
    word: "koláč",
  },
  kopec: {
    english: "hill",
    forms: ["kopec", "kopca", "kopci", "kopcom", "kopce", "kopcov"],
    gender: "masculine-inanimate",
    id: "kopec",
    word: "kopec",
  },
  lampa: {
    english: "lamp",
    gender: "feminine",
    id: "lampa",
    stems: ["lamp"],
    word: "lampa",
  },
  lavicka: {
    english: "bench",
    gender: "feminine",
    id: "lavicka",
    stems: ["lavick", "laviciek"],
    word: "lavička",
  },
  oblak: {
    english: "cloud",
    gender: "masculine-inanimate",
    id: "oblak",
    stems: ["oblak"],
    word: "oblak",
  },
  obraz: {
    english: "picture",
    gender: "masculine-inanimate",
    id: "obraz",
    stems: ["obraz"],
    word: "obraz",
  },
  okno: {
    english: "window",
    gender: "neuter",
    id: "okno",
    stems: ["okn", "okien"],
    word: "okno",
  },
  ovocie: {
    english: "fruit",
    gender: "neuter",
    id: "ovocie",
    stems: ["ovoc"],
    word: "ovocie",
  },
  pocitac: {
    english: "computer",
    gender: "masculine-inanimate",
    id: "pocitac",
    stems: ["pocitac"],
    word: "počítač",
  },
  pohovka: {
    english: "sofa",
    gender: "feminine",
    id: "pohovka",
    stems: ["pohovk", "pohoviek"],
    word: "pohovka",
  },
  pult: {
    english: "counter",
    forms: ["pult", "pultu", "pulte", "pultom", "pulty", "pultov"],
    gender: "masculine-inanimate",
    id: "pult",
    word: "pult",
  },
  rastlina: {
    english: "plant",
    gender: "feminine",
    id: "rastlina",
    stems: ["rastlin"],
    word: "rastlina",
  },
  stanok: {
    english: "stall",
    forms: ["stanok", "stanku", "stanky", "stankom", "stankov", "stankoch"],
    gender: "masculine-inanimate",
    id: "stanok",
    word: "stánok",
  },
  stol: {
    english: "table",
    forms: ["stol", "stola", "stolu", "stole", "stolom", "stoly", "stolov", "stoloch"],
    gender: "masculine-inanimate",
    id: "stol",
    word: "stôl",
  },
  stolicka: {
    english: "chair",
    gender: "feminine",
    id: "stolicka",
    stems: ["stolick", "stoliciek"],
    word: "stolička",
  },
  strom: {
    english: "tree",
    gender: "masculine-inanimate",
    id: "strom",
    stems: ["strom"],
    word: "strom",
  },
  tabula: {
    english: "board",
    gender: "feminine",
    id: "tabula",
    stems: ["tabul"],
    word: "tabuľa",
  },
  torta: {
    english: "layer cake",
    gender: "feminine",
    id: "torta",
    stems: ["tort"],
    word: "torta",
  },
  vankus: {
    english: "cushion",
    gender: "masculine-inanimate",
    id: "vankus",
    stems: ["vankus"],
    word: "vankúš",
  },
  veza: {
    english: "tower",
    forms: ["veza", "veze", "vezu", "vezou", "vezi", "viez", "veziach", "vezami"],
    gender: "feminine",
    id: "veza",
    word: "veža",
  },
  zaves: {
    english: "curtain",
    forms: ["zaves", "zavesu", "zavese", "zavesom", "zavesy", "zavesov"],
    gender: "masculine-inanimate",
    id: "zaves",
    word: "záves",
  },
  zelenina: {
    english: "vegetables",
    gender: "feminine",
    id: "zelenina",
    stems: ["zelenin"],
    word: "zelenina",
  },
  zvoncek: {
    english: "bell",
    gender: "masculine-inanimate",
    id: "zvoncek",
    stems: ["zvonc"],
    word: "zvonček",
  },
} satisfies Record<string, ThingWord>;

export const SCENE_THINGS: Partial<Record<LessonSceneArtId, readonly SceneThing[]>> = {
  cafe: [
    drawn(WORDS.okno, [92, 24, 192, 186]),
    drawn(WORDS.lampa, [460, 36, 40, 24], [360, 36, 40, 24], [560, 36, 40, 24]),
    drawn(WORDS.tabula, [646, 46, 116, 98]),
    drawn(WORDS.pult, [772, 150, 210, 76]),
    drawn(WORDS.kolac, [795, 104, 54, 42]),
    drawn(WORDS.torta, [892, 44, 52, 42]),
    drawn(WORDS.kavovar, [880, 98, 58, 52]),
    drawn(WORDS.stol, [148, 204, 84, 52]),
    drawn(WORDS.stolicka, [114, 186, 42, 72], [224, 186, 42, 72]),
    drawn(WORDS.rastlina, plantAt(44, 246)),
  ],
  plaza: [
    drawn(WORDS.veza, [250, 28, 66, 198]),
    drawn(WORDS.hodiny, [268, 113, 30, 30]),
    drawn(
      WORDS.dom,
      [474, 82, 124, 144],
      [0, 62, 110, 164],
      [110, 116, 70, 110],
      [180, 74, 70, 152],
      [316, 124, 158, 102],
      [598, 98, 112, 128],
      [710, 88, 112, 138],
      [822, 90, 138, 136],
    ),
    drawn(WORDS.lavicka, [24, 198, 112, 54]),
    drawn({ ...WORDS.lampa, english: "street lamp" }, [765, 66, 28, 166]),
    drawn(WORDS.strom, [854, 100, 98, 150]),
    drawn(WORDS.oblak, [522, 29, 76, 31], [833, 42, 54, 22], [80, 31, 61, 25]),
  ],
  home: [
    drawn(WORDS.okno, [96, 44, 150, 124]),
    drawn(WORDS.zaves, [78, 36, 34, 142], [230, 36, 34, 142]),
    drawn(WORDS.obraz, [742, 50, 104, 72], [424, 36, 50, 40], [488, 42, 40, 34]),
    drawn(WORDS.pohovka, [666, 152, 254, 86]),
    drawn(WORDS.vankus, [704, 160, 48, 44], [834, 160, 48, 44]),
    drawn(WORDS.lampa, [926, 70, 36, 172]),
    drawn(WORDS.koberec, [230, 259, 500, 36]),
    drawn(WORDS.rastlina, plantAt(40, 244)),
  ],
  registration: [
    drawn(WORDS.hodiny, [276, 48, 48, 48]),
    drawn(WORDS.stolicka, [36, 156, 58, 72], [104, 156, 58, 72], [172, 156, 58, 72]),
    drawn(WORDS.rastlina, plantAt(256, 228)),
    drawn(WORDS.pult, [640, 140, 340, 86]),
    drawn(WORDS.pocitac, [842, 86, 72, 56]),
    drawn(WORDS.zvoncek, [698, 126, 22, 16]),
  ],
  market: [
    drawn(WORDS.ovocie, [40, 136, 260, 38]),
    drawn(WORDS.zelenina, [660, 136, 260, 38]),
    drawn(WORDS.stanok, [636, 66, 308, 162], [16, 66, 308, 162]),
  ],
  classroom: [
    drawn({ ...WORDS.tabula, english: "blackboard" }, [44, 66, 220, 88]),
    drawn(WORDS.abeceda, [260, 34, 441, 34]),
    drawn(WORDS.hodiny, [780, 58, 40, 40]),
    drawn(WORDS.globus, [844, 118, 46, 52]),
    drawn({ ...WORDS.stol, english: "desk" }, [686, 170, 228, 56]),
    drawn(WORDS.rastlina, plantAt(944, 232)),
  ],
  default: [
    drawn(WORDS.hrad, [636, 38, 88, 74]),
    drawn(WORDS.kopec, [520, 84, 440, 110]),
    drawn(WORDS.dunaj, [0, 194, 960, 18]),
    drawn(WORDS.strom, [836, 86, 84, 140], [52, 88, 88, 136]),
    drawn(WORDS.oblak, [212, 33, 76, 29], [446, 27, 48, 19]),
  ],
};

export function thingCenter({ box }: SceneThing): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** ten, tá, to or tie for a thing's gender. */
export function demonstrativeFor(gender: NounGender): string {
  if (gender === "feminine") return "tá";
  if (gender === "neuter") return "to";
  if (gender === "plural-only") return "tie";
  return "ten";
}

/** A name like Dunaj takes no demonstrative. */
export function isProperName({ word }: SceneThing): boolean {
  return word[0] !== word[0].toLocaleLowerCase("sk");
}

/** The thing with its demonstrative, so the word shows its gender: ten koláč, tá torta. */
export function thingWithDemonstrative(thing: SceneThing): string {
  return isProperName(thing)
    ? thing.word
    : `${demonstrativeFor(thing.gender)} ${thing.word}`;
}

/** The thing a folded word names, if the scene has one. */
export function thingNamed(
  folded: string,
  things: readonly SceneThing[],
): SceneThing | undefined {
  return things.find(
    ({ forms = [], stems = [] }) =>
      forms.includes(folded) || stems.some((stem) => folded.startsWith(stem)),
  );
}

const TEN = [
  "ten",
  "tá",
  "to",
  "tí",
  "tie",
  "toho",
  "tej",
  "tomu",
  "tú",
  "tom",
  "tým",
  "tou",
  "tých",
  "tými",
];
/** `ten` + `to` gives tento, táto, toto, títo…, beside the everyday `tohto`. */
const NEAR = new Set([...TEN.map((form) => `${form}to`), "tohto"]);
const FAR = new Set(TEN.map((form) => `tam${form}`));
const PLAIN = new Set(TEN);

/** A form of ten, tento or tamten, and how far off it puts what it points at. */
function demonstrative(word: string | undefined): { reach?: PointReach } | undefined {
  const lower = word?.toLocaleLowerCase("sk") ?? "";
  if (NEAR.has(lower)) return { reach: "near" };
  if (FAR.has(lower)) return { reach: "far" };
  return PLAIN.has(lower) ? {} : undefined;
}

function sameTarget(a: PointTarget, b: PointTarget | undefined): boolean {
  if (a.kind === "thing") return b?.kind === "thing" && b.id === a.id;
  return b?.kind === "prop" && b.holder === a.holder;
}

/**
 * Where a line points: at each thing in the scene it names, from the
 * demonstrative in front of it when there is one ("tento koláč"), and at
 * what `shownBy` holds up on the line's first `ten`, `tá` or `tí` ("Kto je
 * ten muž?"). A bare `to` is mostly "it" ("Je to Marek?"), so on its own it
 * points at nothing. The same target twice running is pointed at once.
 */
export function linePoints(
  slovak: string,
  things: readonly SceneThing[],
  shownBy?: LessonCharacterId,
): LinePoint[] {
  const words = lineWords(slovak);
  const points: LinePoint[] = [];

  words.forEach((word, index) => {
    const thing = thingNamed(foldLine(word), things);
    if (!thing) return;

    const from = [index - 1, index - 2].find((at) => demonstrative(words[at]));
    points.push({
      reach: from === undefined ? undefined : demonstrative(words[from])?.reach,
      target: { kind: "thing", id: thing.id },
      word: from ?? index,
    });
  });

  if (shownBy) {
    const word = words.findIndex(
      (candidate, index) =>
        demonstrative(candidate) &&
        candidate.toLocaleLowerCase("sk") !== "to" &&
        !points.some((point) => point.word === index),
    );
    if (word !== -1) {
      points.push({
        reach: demonstrative(words[word])?.reach,
        target: { kind: "prop", holder: shownBy },
        word,
      });
    }
  }

  return points
    .sort((a, b) => a.word - b.word)
    .filter(
      (point, index, sorted) => !sameTarget(point.target, sorted[index - 1]?.target),
    );
}

/** Where a backdrop point lands on a stage `width` × `height` px, sliced to fill it as StickBackdrop draws it. */
export function backdropToStage(
  { x, y }: Point,
  width: number,
  height: number,
  align = 0.5,
): Point {
  const scale = Math.max(width / BACKDROP_WIDTH, height / BACKDROP_HEIGHT);
  return {
    x: (width - BACKDROP_WIDTH * scale) * align + x * scale,
    y: height - BACKDROP_HEIGHT * scale + y * scale,
  };
}

/** Where a point of the rig lands for a figure drawn `width` px wide at `left`, `top`. */
export function figureToStage(
  { x, y }: Point,
  { left, top, width }: { left: number; top: number; width: number },
  facing: 1 | -1,
): Point {
  const scale = width / STICK_BOX.width;
  return {
    x: left + (x * facing - STICK_BOX.x) * scale,
    y: top + (y - STICK_BOX.y) * scale,
  };
}

/** Pointing much lower or higher than this reads as a hanging arm or a hand up to ask. */
const MIN_RISE = -40;
const MAX_RISE = 40;

/** Which way to face and how many degrees above level to point, from `from` to `to` in screen px. */
export function aimAt(from: Point, to: Point): { facing: 1 | -1; rise: number } {
  const dx = to.x - from.x;
  const rise = (Math.atan2(from.y - to.y, Math.abs(dx)) * 180) / Math.PI;
  return {
    facing: dx < 0 ? -1 : 1,
    rise: Math.min(MAX_RISE, Math.max(MIN_RISE, rise)),
  };
}
