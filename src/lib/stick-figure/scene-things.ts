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
  /** Folded stems that catch any case: `kolac` for koláč, koláča, koláčom. */
  stems?: string[];
  /** The nominative, as the dictionary lists it. */
  word: string;
}

function thing(
  id: string,
  word: string,
  gender: NounGender,
  english: string,
  match: { forms?: string[]; stems?: string[] },
  [x, y, width, height]: [number, number, number, number],
): SceneThing {
  return { box: { height, width, x, y }, english, gender, id, word, ...match };
}

const LAMP = { stems: ["lamp"] };
const PLANT = { stems: ["rastlin"] };
const CLOCK = { forms: ["hodiny", "hodin", "hodinach", "hodinami"] };
const TREE = { stems: ["strom"] };
const CLOUD = { stems: ["oblak"] };
const WINDOW = { stems: ["okn", "okien"] };
const BOARD = { stems: ["tabul"] };
const CHAIR = { stems: ["stolick", "stoliciek"] };
const COUNTER = { forms: ["pult", "pultu", "pulte", "pultom", "pulty", "pultov"] };
const TABLE = {
  forms: ["stol", "stola", "stolu", "stole", "stolom", "stoly", "stolov", "stoloch"],
};

/** Plants stand on the floor at their x; this is the box around pot and leaves. */
function plantAt(x: number, y: number): [number, number, number, number] {
  return [x - 22, y - 108, 44, 108];
}

export const SCENE_THINGS: Partial<Record<LessonSceneArtId, readonly SceneThing[]>> = {
  cafe: [
    thing("okno", "okno", "neuter", "window", WINDOW, [92, 24, 192, 186]),
    thing("lampa", "lampa", "feminine", "lamp", LAMP, [460, 36, 40, 24]),
    thing("tabula", "tabuľa", "feminine", "board", BOARD, [646, 46, 116, 98]),
    thing("pult", "pult", "masculine-inanimate", "counter", COUNTER, [772, 150, 210, 76]),
    thing(
      "kolac",
      "koláč",
      "masculine-inanimate",
      "cake",
      { stems: ["kolac"] },
      [795, 104, 54, 42],
    ),
    thing(
      "torta",
      "torta",
      "feminine",
      "layer cake",
      { stems: ["tort"] },
      [892, 44, 52, 42],
    ),
    thing(
      "kavovar",
      "kávovar",
      "masculine-inanimate",
      "coffee machine",
      {
        stems: ["kavovar"],
      },
      [880, 98, 58, 52],
    ),
    thing("stol", "stôl", "masculine-inanimate", "table", TABLE, [148, 204, 84, 52]),
    thing("stolicka", "stolička", "feminine", "chair", CHAIR, [114, 186, 42, 72]),
    thing("rastlina", "rastlina", "feminine", "plant", PLANT, plantAt(44, 246)),
  ],
  plaza: [
    thing(
      "veza",
      "veža",
      "feminine",
      "tower",
      {
        forms: ["veza", "veze", "vezu", "vezou", "vezi", "viez", "veziach", "vezami"],
      },
      [250, 28, 66, 198],
    ),
    thing("hodiny", "hodiny", "plural-only", "clock", CLOCK, [268, 113, 30, 30]),
    thing(
      "dom",
      "dom",
      "masculine-inanimate",
      "house",
      {
        forms: ["dom", "domu", "dome", "domom", "domy", "domoch", "domami"],
      },
      [474, 82, 124, 144],
    ),
    thing(
      "lavicka",
      "lavička",
      "feminine",
      "bench",
      { stems: ["lavick", "laviciek"] },
      [24, 198, 112, 54],
    ),
    thing("lampa", "lampa", "feminine", "street lamp", LAMP, [765, 66, 28, 166]),
    thing("strom", "strom", "masculine-inanimate", "tree", TREE, [854, 100, 98, 150]),
    thing("oblak", "oblak", "masculine-inanimate", "cloud", CLOUD, [522, 29, 76, 31]),
  ],
  home: [
    thing("okno", "okno", "neuter", "window", WINDOW, [96, 44, 150, 124]),
    thing(
      "zaves",
      "záves",
      "masculine-inanimate",
      "curtain",
      {
        forms: ["zaves", "zavesu", "zavese", "zavesom", "zavesy", "zavesov"],
      },
      [78, 36, 34, 142],
    ),
    thing(
      "obraz",
      "obraz",
      "masculine-inanimate",
      "picture",
      { stems: ["obraz"] },
      [742, 50, 104, 72],
    ),
    thing(
      "pohovka",
      "pohovka",
      "feminine",
      "sofa",
      { stems: ["pohovk", "pohoviek"] },
      [666, 152, 254, 86],
    ),
    thing(
      "vankus",
      "vankúš",
      "masculine-inanimate",
      "cushion",
      { stems: ["vankus"] },
      [704, 160, 48, 44],
    ),
    thing("lampa", "lampa", "feminine", "lamp", LAMP, [926, 70, 36, 172]),
    thing(
      "koberec",
      "koberec",
      "masculine-inanimate",
      "rug",
      {
        forms: ["koberec", "koberca", "koberci", "kobercom", "koberce", "kobercov"],
      },
      [230, 259, 500, 36],
    ),
    thing("rastlina", "rastlina", "feminine", "plant", PLANT, plantAt(40, 244)),
  ],
  registration: [
    thing("hodiny", "hodiny", "plural-only", "clock", CLOCK, [276, 48, 48, 48]),
    thing("stolicka", "stolička", "feminine", "chair", CHAIR, [36, 156, 58, 72]),
    thing("rastlina", "rastlina", "feminine", "plant", PLANT, plantAt(256, 228)),
    thing("pult", "pult", "masculine-inanimate", "counter", COUNTER, [640, 140, 340, 86]),
    thing(
      "pocitac",
      "počítač",
      "masculine-inanimate",
      "computer",
      {
        stems: ["pocitac"],
      },
      [842, 86, 72, 56],
    ),
    thing(
      "zvoncek",
      "zvonček",
      "masculine-inanimate",
      "bell",
      { stems: ["zvonc"] },
      [698, 126, 22, 16],
    ),
  ],
  market: [
    thing("ovocie", "ovocie", "neuter", "fruit", { stems: ["ovoc"] }, [40, 136, 260, 38]),
    thing(
      "zelenina",
      "zelenina",
      "feminine",
      "vegetables",
      { stems: ["zelenin"] },
      [660, 136, 260, 38],
    ),
    thing(
      "stanok",
      "stánok",
      "masculine-inanimate",
      "stall",
      {
        forms: ["stanok", "stanku", "stanky", "stankom", "stankov", "stankoch"],
      },
      [636, 66, 308, 162],
    ),
  ],
  classroom: [
    thing("tabula", "tabuľa", "feminine", "blackboard", BOARD, [44, 66, 220, 88]),
    thing(
      "abeceda",
      "abeceda",
      "feminine",
      "alphabet",
      { stems: ["abeced"] },
      [260, 34, 441, 34],
    ),
    thing("hodiny", "hodiny", "plural-only", "clock", CLOCK, [780, 58, 40, 40]),
    thing(
      "globus",
      "glóbus",
      "masculine-inanimate",
      "globe",
      { stems: ["globus"] },
      [844, 118, 46, 52],
    ),
    thing("stol", "stôl", "masculine-inanimate", "desk", TABLE, [686, 170, 228, 56]),
    thing("rastlina", "rastlina", "feminine", "plant", PLANT, plantAt(944, 232)),
  ],
  default: [
    thing(
      "hrad",
      "hrad",
      "masculine-inanimate",
      "castle",
      { stems: ["hrad"] },
      [636, 38, 88, 74],
    ),
    thing(
      "kopec",
      "kopec",
      "masculine-inanimate",
      "hill",
      {
        forms: ["kopec", "kopca", "kopci", "kopcom", "kopce", "kopcov"],
      },
      [520, 84, 440, 110],
    ),
    thing(
      "dunaj",
      "Dunaj",
      "masculine-inanimate",
      "the Danube",
      {
        stems: ["dunaj", "riek"],
      },
      [0, 194, 960, 18],
    ),
    thing("strom", "strom", "masculine-inanimate", "tree", TREE, [836, 86, 84, 140]),
    thing("oblak", "oblak", "masculine-inanimate", "cloud", CLOUD, [212, 33, 76, 29]),
  ],
};

export function thingCenter({ box }: SceneThing): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** The demonstrative a thing takes, so the word shows its gender: ten koláč, tá torta. */
export function thingWithDemonstrative({ gender, word }: SceneThing): string {
  const ten =
    gender === "feminine"
      ? "tá"
      : gender === "neuter"
        ? "to"
        : gender === "plural-only"
          ? "tie"
          : "ten";
  return `${ten} ${word}`;
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
