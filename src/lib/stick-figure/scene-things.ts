import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { NounGender } from "$lib/catalog/types";
import {
  CASES,
  demonstrativeForm,
  type DemonstrativeSeries,
  type Slot,
} from "$lib/learning/demonstratives/paradigm";
import type { PointReach } from "./gestures";
import { foldLine } from "./line-gesture";
import { lineWords, wordSentences, type LinePoint, type PointTarget } from "./line-plan";
import { hasContent, propForSentence, type StickPropId } from "./props";
import { STICK_BOX, type Point } from "./rig";
import type { StageSetting } from "./stage-setting";

/** The backdrops' drawing space (StickBackdrop.svelte). */
export const BACKDROP_WIDTH = 960;
export const BACKDROP_HEIGHT = 300;

/**
 * Which part of the backdrop a narrow stage keeps: 0 the left end, 1 the
 * right, the middle unless set. The café keeps its counter, where the
 * cakes the scenes point at are, the classroom its board, home its window
 * and the market the stall Lucia sells cheese and strawberries from.
 */
const BACKDROP_ALIGN: Partial<Record<StageSetting, number>> = {
  cafe: 1,
  classroom: 0,
  home: 0.2,
  market: 1,
};

export function backdropAlign(setting: StageSetting): number {
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
  /** The accusative where it is not the nominative or a feminine -a turned -u: muž → muža. */
  accusative?: string;
  box: ThingBox;
  english: string;
  /** Folded whole forms, where a stem would catch other words: `stol` is also in `stolička`. */
  forms?: string[];
  gender: NounGender;
  id: string;
  /** Other copies of it in the scene, which a tap finds too: the café's three lamps. */
  more?: ThingBox[];
  /** A plural drawn as a heap, like jahody, of a noun that has a singular. */
  plural?: boolean;
  /** Folded stems that catch any case: `kolac` for koláč, koláča, koláčom. */
  stems?: string[];
  /**
   * The copies tento and tamten tell apart, as indexes into thingBoxes: the
   * one by the cast and the one further off. Plain ten means the main box.
   */
  twins?: { far: number; near: number };
  /** The nominative, as the dictionary lists it. */
  word: string;
}

type ThingWord = Omit<SceneThing, "box" | "more" | "twins">;
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

/**
 * Two of a thing, one by the cast and one further off, so tento and tamten
 * each have one. `main` is the one a plain ten means before either is
 * pointed at.
 */
function twins(
  word: ThingWord,
  near: Rect,
  far: Rect,
  main: PointReach = "near",
): SceneThing {
  return main === "near"
    ? { ...drawn(word, near, far), twins: { far: 1, near: 0 } }
    : { ...drawn(word, far, near), twins: { far: 0, near: 1 } };
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
  dvere: {
    english: "door",
    forms: ["dvere", "dveri", "dverach", "dvermi"],
    gender: "plural-only",
    id: "dvere",
    word: "dvere",
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
  jahody: {
    english: "strawberries",
    gender: "feminine",
    id: "jahody",
    plural: true,
    stems: ["jahod"],
    word: "jahody",
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
  mikrofon: {
    english: "microphone",
    gender: "masculine-inanimate",
    id: "mikrofon",
    stems: ["mikrofon"],
    word: "mikrofón",
  },
  muz: {
    accusative: "muža",
    english: "man",
    forms: ["muz", "muza", "muzovi", "muzom", "muzi", "muzov", "muzoch", "muzmi"],
    gender: "masculine-animate",
    id: "muz",
    word: "muž",
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
  reproduktor: {
    english: "speaker",
    gender: "masculine-inanimate",
    id: "reproduktor",
    stems: ["reproduktor"],
    word: "reproduktor",
  },
  sluchadla: {
    english: "headphones",
    gender: "neuter",
    id: "sluchadla",
    plural: true,
    stems: ["sluchad"],
    word: "slúchadlá",
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
  syr: {
    english: "cheese",
    forms: ["syr", "syra", "syru", "syre", "syrom", "syry", "syrov", "syroch", "syrmi"],
    gender: "masculine-inanimate",
    id: "syr",
    word: "syr",
  },
  tabula: {
    english: "board",
    gender: "feminine",
    id: "tabula",
    stems: ["tabul"],
    word: "tabuľa",
  },
  taska: {
    english: "bag",
    gender: "feminine",
    id: "taska",
    stems: ["task", "tasiek"],
    word: "taška",
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
  zena: {
    english: "woman",
    forms: ["zena", "zeny", "zene", "zenu", "zenou", "zien", "zenam", "zenach", "zenami"],
    gender: "feminine",
    id: "zena",
    word: "žena",
  },
  zvoncek: {
    english: "bell",
    gender: "masculine-inanimate",
    id: "zvoncek",
    stems: ["zvonc"],
    word: "zvonček",
  },
} satisfies Record<string, ThingWord>;

export const SCENE_THINGS: Partial<Record<StageSetting, readonly SceneThing[]>> = {
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
    drawn(WORDS.muz, [140, 104, 22, 46]),
    drawn(WORDS.zena, [182, 108, 22, 42]),
    drawn(WORDS.okno, [96, 44, 150, 124]),
    twins(WORDS.taska, [510, 240, 48, 50], [152, 189, 38, 38], "far"),
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
    drawn(WORDS.zelenina, [748, 136, 84, 38]),
    twins(WORDS.syr, [662, 100, 28, 42], [890, 100, 28, 42]),
    twins(WORDS.jahody, [660, 134, 84, 24], [836, 134, 84, 24]),
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
  studio: [
    drawn(WORDS.dvere, [246, 40, 82, 186]),
    drawn(WORDS.hodiny, [93, 45, 42, 42]),
    drawn(WORDS.stol, [450, 204, 60, 86], [24, 156, 180, 70]),
    drawn(WORDS.pocitac, [56, 116, 68, 44]),
    drawn(WORDS.sluchadla, [128, 130, 52, 30]),
    drawn(WORDS.mikrofon, [429, 120, 34, 22], [497, 120, 34, 22]),
    drawn(WORDS.okno, [660, 52, 140, 108]),
    drawn(WORDS.reproduktor, [832, 140, 40, 86]),
    drawn(WORDS.rastlina, plantAt(922, 240)),
    drawn(WORDS.koberec, [210, 252, 540, 40]),
  ],
  default: [
    drawn(WORDS.hrad, [636, 38, 88, 74]),
    drawn(WORDS.kopec, [520, 84, 440, 110]),
    drawn(WORDS.dunaj, [0, 194, 960, 18]),
    drawn(WORDS.strom, [836, 86, 84, 140], [52, 88, 88, 136]),
    drawn(WORDS.oblak, [212, 33, 76, 29], [446, 27, 48, 19]),
  ],
};

export function boxCenter(box: ThingBox): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export function thingCenter({ box }: SceneThing): Point {
  return boxCenter(box);
}

/** What lights up when a line points at one copy of a thing: that copy, or every copy. */
export function litKey(id: string, copy?: number): string {
  return copy === undefined ? id : `${id}#${copy}`;
}

/** Whether a thing is drawn as more than one, so it takes tie and sú. */
export function isPlural({ gender, plural }: SceneThing): boolean {
  return plural === true || gender === "plural-only";
}

/** ten, tá, to or tie for a thing: what goes in front of it in the nominative. */
export function demonstrativeFor(thing: SceneThing): string {
  if (isPlural(thing)) return "tie";
  if (thing.gender === "feminine") return "tá";
  if (thing.gender === "neuter") return "to";
  return "ten";
}

/** A name like Dunaj takes no demonstrative. */
export function isProperName({ word }: SceneThing): boolean {
  return word[0] !== word[0].toLocaleLowerCase("sk");
}

/** The thing with its demonstrative, so the word shows its gender: ten koláč, tá torta. */
export function thingWithDemonstrative(thing: SceneThing): string {
  return isProperName(thing) ? thing.word : `${demonstrativeFor(thing)} ${thing.word}`;
}

export function thingNamed(
  folded: string,
  things: readonly SceneThing[],
): SceneThing | undefined {
  return things.find(
    ({ forms = [], stems = [] }) =>
      forms.includes(folded) || stems.some((stem) => folded.startsWith(stem)),
  );
}

const SLOTS: readonly Slot[] = [
  "masculine-animate",
  "masculine-inanimate",
  "feminine",
  "neuter",
  "plural-personal",
  "plural",
];
const REACH: Record<DemonstrativeSeries, PointReach | undefined> = {
  tamten: "far",
  ten: undefined,
  tento: "near",
};

/** Every form of ten, tento and tamten, with how far off it puts things and what it can stand for. */
const DEMONSTRATIVES = new Map<string, { reach?: PointReach; slots: Set<Slot> }>();
for (const series of ["ten", "tento", "tamten"] as const) {
  for (const slot of SLOTS) {
    for (const grammaticalCase of CASES) {
      const form = demonstrativeForm(series, slot, grammaticalCase);
      const known = DEMONSTRATIVES.get(form) ?? {
        reach: REACH[series],
        slots: new Set(),
      };
      known.slots.add(slot);
      DEMONSTRATIVES.set(form, known);
    }
  }
}

function demonstrative(word: string | undefined) {
  return DEMONSTRATIVES.get(word?.toLocaleLowerCase("sk") ?? "");
}

function slotOf(thing: SceneThing): Slot {
  return isPlural(thing)
    ? "plural"
    : (thing.gender as Exclude<NounGender, "plural-only">);
}

/** To, toto and tamto on their own mostly mean it, this and that, not a noun said before. */
const PRONOUNS = ["to", "toto", "tamto"];

/** Folded words after which a demonstrative stands for a noun said before: "Tamten je lacnejší." */
const VERBS_AFTER = [
  "je",
  "su",
  "bol",
  "bola",
  "bolo",
  "boli",
  "bude",
  "budu",
  "stoji",
  "stoja",
];

function clauseEnds(slovak: string): boolean[] {
  return [...slovak.matchAll(/\p{L}+([^\p{L}]*)/gu)].map(([, after]) =>
    /[,.!?…;:–—]/.test(after),
  );
}

export interface NamedThing {
  copy?: number;
  id: string;
}

/**
 * Which copy of a thing a point means. Of twins, tento takes the near one and
 * tamten the far one; plain ten keeps the one pointed at last, or the main one.
 */
function copyOf(
  thing: SceneThing,
  reach: PointReach | undefined,
  recent: readonly NamedThing[],
): number | undefined {
  if (!thing.twins) return undefined;
  if (reach) return thing.twins[reach];
  return recent.findLast(({ id }) => id === thing.id)?.copy ?? 0;
}

function sameTarget(a: PointTarget, b: PointTarget | undefined): boolean {
  if (a.kind === "thing") {
    return b?.kind === "thing" && b.id === a.id && b.copy === a.copy;
  }
  return b?.kind === "prop" && b.holder === a.holder;
}

export interface ShownProp {
  holder: LessonCharacterId;
  prop?: StickPropId;
}

/**
 * Where a line points: at each thing in the scene it names, from the
 * demonstrative in front of it when there is one ("tento koláč"); at a
 * thing named before, when a demonstrative stands for it on its own and
 * agrees with it ("Tamten je lacnejší." after "tamten syr"); and at what
 * `shownBy` holds up on the line's first other `ten`, `tá` or `tí` ("Kto
 * je ten muž?" over photos). Keys or an apple have nothing in them to ask
 * about, so a line points at them only when it names them ("tieto kľúče").
 * A bare `to` is mostly "it" ("Je to Marek?"), so on its own it points at
 * nothing. `recent` is what the scene named before this line, the latest
 * last. The same target is pointed at again only after a sentence without it.
 */
export function linePoints(
  slovak: string,
  things: readonly SceneThing[],
  shownBy?: ShownProp,
  recent: readonly NamedThing[] = [],
): LinePoint[] {
  const words = lineWords(slovak);
  const ends = clauseEnds(slovak);
  const named = [...recent];
  const points: LinePoint[] = [];

  words.forEach((word, index) => {
    const thing = thingNamed(foldLine(word), things);
    if (thing) {
      const from = [index - 1, index - 2].find((at) => demonstrative(words[at]));
      const reach = from === undefined ? undefined : demonstrative(words[from])?.reach;
      const copy = copyOf(thing, reach, named);
      points.push({
        reach,
        target: { kind: "thing", copy, id: thing.id },
        word: from ?? index,
      });
      named.push({ copy, id: thing.id });
      return;
    }

    const form = demonstrative(word);
    const alone = ends[index] || VERBS_AFTER.includes(foldLine(words[index + 1] ?? ""));
    if (!form || !alone || PRONOUNS.includes(foldLine(word))) return;

    const meant = named.findLast(({ id }) => {
      const candidate = things.find((option) => option.id === id);
      return candidate !== undefined && form.slots.has(slotOf(candidate));
    });
    const thingMeant = things.find((option) => option.id === meant?.id);
    if (!thingMeant) return;

    const copy = copyOf(thingMeant, form.reach, named);
    points.push({
      reach: form.reach,
      target: { kind: "thing", copy, id: thingMeant.id },
      word: index,
    });
    named.push({ copy, id: thingMeant.id });
  });

  if (shownBy) {
    const { holder, prop } = shownBy;
    const names = (at: number) =>
      prop !== undefined && propForSentence(words[at] ?? "") === prop;
    const word = words.findIndex(
      (candidate, index) =>
        demonstrative(candidate) &&
        candidate.toLocaleLowerCase("sk") !== "to" &&
        !points.some((point) => point.word === index) &&
        (prop === undefined || hasContent(prop) || names(index + 1) || names(index + 2)),
    );
    if (word !== -1) {
      points.push({
        reach: demonstrative(words[word])?.reach,
        target: { kind: "prop", holder },
        word,
      });
    }
  }

  const sentences = wordSentences(slovak);
  return points
    .sort((a, b) => a.word - b.word)
    .filter((point, index, sorted) => {
      const previous = sorted[index - 1];
      return (
        !previous ||
        !sameTarget(point.target, previous.target) ||
        sentences[point.word] - sentences[previous.word] > 1
      );
    });
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

/** How much of a copy must be on the stage for it to count as there to tap. */
const IN_VIEW_SHARE = 0.6;

/**
 * The things a stage `width` × `height` px shows enough of to tap, most of
 * one copy inside it as the backdrop is sliced to fill it. A phone shows
 * the café's counter but not its window.
 */
export function thingsInView(
  things: readonly SceneThing[],
  setting: StageSetting,
  width: number,
  height: number,
): SceneThing[] {
  if (!width || !height) return [...things];

  const align = backdropAlign(setting);
  return things.filter((thing) =>
    thingBoxes(thing).some((box) => {
      const left = backdropToStage({ x: box.x, y: 0 }, width, height, align).x;
      const right = backdropToStage(
        { x: box.x + box.width, y: 0 },
        width,
        height,
        align,
      ).x;
      return Math.min(right, width) - Math.max(left, 0) >= (right - left) * IN_VIEW_SHARE;
    }),
  );
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
