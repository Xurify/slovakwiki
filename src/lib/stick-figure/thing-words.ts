import type { NounGender } from "$lib/catalog/types";
import { demonstrativeForm, type Slot } from "$lib/learning/demonstratives/paradigm";
import type { PointReach } from "./gestures";
import type { Point } from "./rig";
import { matchesWord } from "./slovak-text";

/**
 * The words for things drawn in the backdrops, how they are drawn (one box
 * or several), and what Slovak puts in front of them. Where each thing
 * stands in which place is in places.ts.
 */

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

export type ThingWord = Omit<SceneThing, "box" | "more" | "twins">;
export type Rect = [x: number, y: number, width: number, height: number];

export function toBox([x, y, width, height]: Rect): ThingBox {
  return { height, width, x, y };
}

/** A word drawn at `main`, and at `more` where the scene has it again. */
export function drawn(word: ThingWord, main: Rect, ...more: Rect[]): SceneThing {
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
export function twins(
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

/** Where a thing sits in the demonstrative paradigm: its gender, or plural. */
export function slotOf(thing: SceneThing): Slot {
  return isPlural(thing)
    ? "plural"
    : (thing.gender as Exclude<NounGender, "plural-only">);
}

/** A name like Dunaj takes no demonstrative. */
export function isProperName({ word }: SceneThing): boolean {
  return word[0] !== word[0].toLocaleLowerCase("sk");
}

/** The thing with its demonstrative, so the word shows its gender: ten koláč, tá torta. */
export function thingWithDemonstrative(thing: SceneThing): string {
  return isProperName(thing)
    ? thing.word
    : `${demonstrativeForm("ten", slotOf(thing), "nominative")} ${thing.word}`;
}

export function thingNamed(
  folded: string,
  things: readonly SceneThing[],
): SceneThing | undefined {
  return things.find(({ forms, stems }) => matchesWord(folded, { stems, words: forms }));
}

export const THING_WORDS = {
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
  rieka: {
    english: "river",
    gender: "feminine",
    id: "rieka",
    // The park's river is the Danube, so a line naming it points there too.
    stems: ["riek", "dunaj"],
    word: "rieka",
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
  slnko: {
    english: "sun",
    gender: "neuter",
    id: "slnko",
    stems: ["slnk"],
    word: "slnko",
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
  zastavka: {
    english: "tram stop",
    gender: "feminine",
    id: "zastavka",
    stems: ["zastavk", "zastavok"],
    word: "zastávka",
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
