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
  /** The dictionary's headword where `word` is a plural drawn as a heap: knihy → kniha. */
  lemma?: string;
  /**
   * The set's pieces or objects drawn as it, by id. The set draws at the
   * cast's scale and things move, so its box is measured where they are
   * drawn now: a fixed box missed the studio's plant and a carried pot.
   */
  of?: readonly string[];
  /** The set's objects of this kind are drawn copies too, whatever an episode calls them: its own mugs on the studio desk. */
  ofKind?: string;
  /** Only tapped for its word: the cast handles it by cues, so a line naming it is not pointed at. */
  quiet?: boolean;
  /**
   * The thing it lies on, by id: while their boxes touch it is tapped as that
   * thing. A carrot and a knife on the board were three targets in 40×18 px.
   */
  onto?: string;
  /** What lies on it now and is tapped as part of it (`onto`), named on its card too: the carrot on the board. */
  lying?: readonly SceneThing[];
}

export type ThingWord = Omit<
  SceneThing,
  "box" | "more" | "twins" | "of" | "quiet" | "onto" | "lying"
>;
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

/**
 * The thing a `point` cue names in `things`, and which of its copies:
 * `syr#near` for tento's, `syr#far` for tamten's, the main one otherwise.
 * Named by reach, not by index, as which copy is first differs by place.
 */
export function pointedThing(
  things: readonly SceneThing[],
  name: string,
): { thing: SceneThing; copy?: number } | undefined {
  const [id, reach] = name.split("#");
  const thing = things.find((candidate) => candidate.id === id);
  if (!thing) return undefined;
  if (reach === undefined) return { thing };
  if (reach !== "near" && reach !== "far") return undefined;
  const copy = thing.twins?.[reach];
  return copy === undefined ? undefined : { thing, copy };
}

/** A thing the set draws and the cast handles by cues; `main` is its box until the stage measures it. */
export function onSet(word: ThingWord, of: readonly string[], main: Rect): SceneThing {
  return { ...drawn(word, main), of, quiet: true };
}

/**
 * The things with the boxes the set draws them in now, measured by id (null:
 * not drawn). One all put away, like carrots tipped into the soup, is not
 * there to tap.
 */
export function withDrawn(
  things: readonly SceneThing[],
  drawnAt: Readonly<Record<string, ThingBox | null>>,
): SceneThing[] {
  const placed = things.flatMap((thing) => {
    if (!thing.of?.some((id) => id in drawnAt)) return [thing];
    const [box, ...more] = thing.of.flatMap((id) => drawnAt[id] ?? []);
    if (!box) return [];
    // Each id in `of` stands for one drawn box, in order: only the drawn boxes past them are kept,
    // or the cheese's far box showed twice, measured and drawn.
    const kept = [...more, ...(thing.more ?? []).slice(Math.max(0, thing.of.length - 1))];
    return [{ ...thing, box, more: kept.length ? kept : undefined }];
  });
  const onTop = (thing: SceneThing) => {
    const under = thing.onto
      ? placed.find((other) => other.id === thing.onto)
      : undefined;
    return under !== undefined && touching(thing.box, under.box);
  };
  return placed.flatMap((thing) => {
    if (onTop(thing)) return [];
    const lying = placed.filter((other) => other.onto === thing.id && onTop(other));
    return [lying.length ? { ...thing, lying } : thing];
  });
}

function touching(a: ThingBox, b: ThingBox): boolean {
  return (
    a.x <= b.x + b.width + 1 &&
    b.x <= a.x + a.width + 1 &&
    a.y <= b.y + b.height + 1 &&
    b.y <= a.y + a.height + 1
  );
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
  digestor: {
    english: "cooker hood",
    gender: "masculine-inanimate",
    id: "digestor",
    stems: ["digestor"],
    word: "digestor",
  },
  diktafon: {
    english: "voice recorder",
    gender: "masculine-inanimate",
    id: "diktafon",
    stems: ["diktafon"],
    word: "diktafón",
  },
  doska: {
    english: "chopping board",
    gender: "feminine",
    id: "doska",
    stems: ["dosk", "dosiek"],
    word: "doska",
  },
  dzban: {
    english: "jug",
    gender: "masculine-inanimate",
    id: "dzban",
    stems: ["dzban"],
    word: "džbán",
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
  chladnicka: {
    english: "fridge",
    gender: "feminine",
    id: "chladnicka",
    stems: ["chladnick", "chladniciek"],
    word: "chladnička",
  },
  hrniec: {
    english: "pot",
    forms: ["hrniec", "hrnca", "hrnci", "hrncom", "hrnce", "hrncov"],
    gender: "masculine-inanimate",
    id: "hrniec",
    word: "hrniec",
  },
  kavovar: {
    english: "coffee machine",
    gender: "masculine-inanimate",
    id: "kavovar",
    stems: ["kavovar"],
    word: "kávovar",
  },
  knihy: {
    english: "books",
    gender: "feminine",
    id: "knihy",
    lemma: "kniha",
    plural: true,
    stems: ["knih", "knizk"],
    word: "knihy",
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
  krhla: {
    english: "watering can",
    gender: "feminine",
    id: "krhla",
    stems: ["krhl", "krhiel"],
    word: "krhla",
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
  lyzica: {
    english: "spoon",
    gender: "feminine",
    id: "lyzica",
    stems: ["lyzic", "lyzick"],
    word: "lyžica",
  },
  mikrofon: {
    english: "microphone",
    gender: "masculine-inanimate",
    id: "mikrofon",
    stems: ["mikrofon"],
    word: "mikrofón",
  },
  lopticka: {
    english: "ball",
    gender: "feminine",
    id: "lopticka",
    stems: ["loptick", "lopticiek"],
    word: "loptička",
  },
  miska: {
    english: "bowl",
    gender: "feminine",
    id: "miska",
    stems: ["misk", "misiek"],
    word: "miska",
  },
  mrkva: {
    english: "carrot",
    gender: "feminine",
    id: "mrkva",
    stems: ["mrkv", "mrkiev"],
    word: "mrkva",
  },
  muz: {
    accusative: "muža",
    english: "man",
    forms: ["muz", "muza", "muzovi", "muzom", "muzi", "muzov", "muzoch", "muzmi"],
    gender: "masculine-animate",
    id: "muz",
    word: "muž",
  },
  noz: {
    english: "knife",
    forms: ["noz", "noza", "nozom", "nozi", "noze", "nozov", "nozmi", "nozoch"],
    gender: "masculine-inanimate",
    id: "noz",
    word: "nôž",
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
  platna: {
    accusative: "zlatú platňu",
    english: "gold record",
    gender: "feminine",
    id: "platna",
    lemma: "platňa",
    stems: ["platn"],
    word: "zlatá platňa",
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
  polica: {
    english: "shelf",
    gender: "feminine",
    id: "polica",
    stems: ["polic"],
    word: "polica",
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
  sol: {
    english: "salt",
    forms: ["sol", "soli", "solou"],
    gender: "feminine",
    id: "sol",
    word: "soľ",
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
  sporak: {
    english: "stove",
    gender: "masculine-inanimate",
    id: "sporak",
    stems: ["sporak"],
    word: "sporák",
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
  telefon: {
    english: "phone",
    gender: "masculine-inanimate",
    id: "telefon",
    stems: ["telefon"],
    word: "telefón",
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
  umyvadlo: {
    english: "sink",
    gender: "neuter",
    id: "umyvadlo",
    stems: ["umyvadl", "umyvadiel"],
    word: "umývadlo",
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
  voditko: {
    english: "lead",
    gender: "neuter",
    id: "voditko",
    stems: ["voditk"],
    word: "vodítko",
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
  bicykel: {
    english: "bike",
    gender: "masculine-inanimate",
    id: "bicykel",
    stems: ["bicyk"],
    word: "bicykel",
  },
  elektricka: {
    english: "tram",
    gender: "feminine",
    id: "elektricka",
    stems: ["elektrick", "elektriciek"],
    word: "električka",
  },
  fontana: {
    english: "fountain",
    gender: "feminine",
    id: "fontana",
    stems: ["fontan"],
    word: "fontána",
  },
  hrncek: {
    english: "mug",
    gender: "masculine-inanimate",
    id: "hrncek",
    stems: ["hrncek"],
    word: "hrnček",
  },
  robot: {
    accusative: "robota",
    english: "robot",
    forms: [
      "robot",
      "robota",
      "robotovi",
      "robotom",
      "roboti",
      "robotov",
      "robotmi",
      "robotoch",
    ],
    gender: "masculine-animate",
    id: "robot",
    word: "robot",
  },
  topanky: {
    english: "shoes",
    gender: "feminine",
    id: "topanky",
    lemma: "topánka",
    plural: true,
    stems: ["topank", "topanok"],
    word: "topánky",
  },
  kabat: {
    english: "coat",
    gender: "masculine-inanimate",
    id: "kabat",
    stems: ["kabat"],
    word: "kabát",
  },
  kaviaren: {
    english: "café",
    gender: "feminine",
    id: "kaviaren",
    stems: ["kaviarn", "kaviaren"],
    word: "kaviareň",
  },
  kluce: {
    english: "keys",
    forms: ["kluce", "klucov", "klucom", "klucoch", "klucmi", "kluc", "kluca", "klucu"],
    gender: "masculine-inanimate",
    id: "kluce",
    lemma: "kľúč",
    plural: true,
    word: "kľúče",
  },
  kniznica: {
    english: "bookcase",
    gender: "feminine",
    id: "kniznica",
    stems: ["kniznic"],
    word: "knižnica",
  },
  kos: {
    english: "bin",
    forms: ["kos", "kosa", "kosu", "kosi", "kosom", "kose", "kosov", "kosoch", "kosmi"],
    gender: "masculine-inanimate",
    id: "kos",
    word: "kôš",
  },
  kufor: {
    english: "suitcase",
    forms: [
      "kufor",
      "kufra",
      "kufru",
      "kufri",
      "kufrom",
      "kufre",
      "kufrov",
      "kuframi",
      "kufroch",
    ],
    gender: "masculine-inanimate",
    id: "kufor",
    word: "kufor",
  },
  kosik: {
    english: "basket",
    forms: ["kosik", "kosika", "kosiku", "kosikom", "kosiky", "kosikov", "kosikoch"],
    gender: "masculine-inanimate",
    id: "kosik",
    word: "košík",
  },
  kostol: {
    english: "church",
    forms: ["kostol", "kostola", "kostole", "kostolom", "kostoly", "kostolov"],
    gender: "masculine-inanimate",
    id: "kostol",
    word: "kostol",
  },
  kredenc: {
    english: "dresser",
    gender: "masculine-inanimate",
    id: "kredenc",
    stems: ["kredenc"],
    word: "kredenc",
  },
  kvety: {
    english: "flowers",
    // Whole forms: a stem would catch kvetináč and kvetinárstvo.
    forms: ["kvety", "kvetov", "kvetom", "kvetoch", "kvetmi", "kvet", "kvetu", "kvete"],
    gender: "masculine-inanimate",
    id: "kvety",
    lemma: "kvet",
    plural: true,
    word: "kvety",
  },
  lekaren: {
    english: "pharmacy",
    gender: "feminine",
    id: "lekaren",
    stems: ["lekarn", "lekaren"],
    word: "lekáreň",
  },
  lod: {
    english: "boat",
    forms: ["lod", "lode", "lodi", "lodou", "lodiach", "lodami"],
    gender: "feminine",
    id: "lod",
    word: "loď",
  },
  mapa: {
    english: "map",
    gender: "feminine",
    id: "mapa",
    stems: ["map"],
    word: "mapa",
  },
  mixpult: {
    english: "mixer",
    forms: ["pult", "pultu", "pulte", "pultom", "pulty", "pultov"],
    gender: "masculine-inanimate",
    id: "mixpult",
    word: "mixážny pult",
  },
  cenovka: {
    english: "price tag",
    gender: "feminine",
    id: "cenovka",
    stems: ["cenov"],
    word: "cenovka",
  },
  napis: {
    english: "sign",
    gender: "masculine-inanimate",
    // Whole forms: a stem would catch napíš and napísal.
    forms: ["napis", "napisu", "napise", "napisom", "napisy", "napisov"],
    id: "napis",
    word: "nápis",
  },
  nastenka: {
    english: "notice board",
    gender: "feminine",
    id: "nastenka",
    stems: ["nastenk", "nastenok"],
    word: "nástenka",
  },
  notebook: {
    english: "laptop",
    gender: "masculine-inanimate",
    id: "notebook",
    stems: ["notebook"],
    word: "notebook",
  },
  pelech: {
    english: "dog bed",
    gender: "masculine-inanimate",
    id: "pelech",
    stems: ["pelech"],
    word: "pelech",
  },
  pes: {
    accusative: "psa",
    english: "dog",
    // Not "psi": folded, psí jazyk would be a dog too.
    forms: ["pes", "psa", "psovi", "psom", "psoch", "psy", "psov", "psami"],
    gender: "masculine-animate",
    id: "pes",
    word: "pes",
  },
  plagat: {
    english: "poster",
    gender: "masculine-inanimate",
    id: "plagat",
    stems: ["plagat"],
    word: "plagát",
  },
  radiator: {
    english: "radiator",
    gender: "masculine-inanimate",
    id: "radiator",
    stems: ["radiator"],
    word: "radiátor",
  },
  sanony: {
    english: "binders",
    forms: [
      "sanony",
      "sanonov",
      "sanonom",
      "sanonoch",
      "sanonmi",
      "sanon",
      "sanonu",
      "sanone",
    ],
    gender: "masculine-inanimate",
    id: "sanony",
    lemma: "šanón",
    plural: true,
    word: "šanóny",
  },
  salka: {
    english: "cup",
    gender: "feminine",
    id: "salka",
    stems: ["salk", "salok"],
    word: "šálka",
  },
  skrinky: {
    english: "cupboards",
    gender: "feminine",
    id: "skrinky",
    lemma: "skrinka",
    plural: true,
    stems: ["skrink", "skriniek"],
    word: "skrinky",
  },
  stolik: {
    english: "coffee table",
    gender: "masculine-inanimate",
    id: "stolik",
    stems: ["stolik"],
    word: "stolík",
  },
  televizor: {
    english: "TV",
    gender: "masculine-inanimate",
    id: "televizor",
    stems: ["televizor"],
    word: "televízor",
  },
  vaha: {
    english: "scale",
    forms: ["vaha", "vahy", "vahe", "vahu", "vahou", "vah", "vaham", "vahach", "vahami"],
    gender: "feminine",
    id: "vaha",
    word: "váha",
  },
  vesiak: {
    english: "coat stand",
    gender: "masculine-inanimate",
    id: "vesiak",
    stems: ["vesiak"],
    word: "vešiak",
  },
  dazdnik: {
    english: "umbrella",
    gender: "masculine-inanimate",
    id: "dazdnik",
    stems: ["dazdnik"],
    word: "dáždnik",
  },
  papier: {
    english: "paper",
    gender: "masculine-inanimate",
    id: "papier",
    stems: ["papier"],
    word: "papier",
  },
  formular: {
    english: "form",
    gender: "masculine-inanimate",
    id: "formular",
    stems: ["formular"],
    word: "formulár",
  },
  tanier: {
    english: "plate",
    gender: "masculine-inanimate",
    id: "tanier",
    stems: ["tanier"],
    word: "tanier",
  },
  vydajnik: {
    english: "water cooler",
    gender: "masculine-inanimate",
    id: "vydajnik",
    stems: ["vydajnik"],
    word: "výdajník",
  },
  priecinky: {
    english: "pigeonholes",
    gender: "masculine-inanimate",
    id: "priecinky",
    lemma: "priečinok",
    plural: true,
    stems: ["priecink", "priecinok"],
    word: "priečinky",
  },
  zrkadlo: {
    english: "mirror",
    gender: "neuter",
    id: "zrkadlo",
    stems: ["zrkadl", "zrkadiel"],
    word: "zrkadlo",
  },
} satisfies Record<string, ThingWord>;
