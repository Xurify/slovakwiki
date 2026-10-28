import type { Headwear } from "./dress";

/** What a place has underfoot: pavement and cobbles, floorboards, a carpet, a path or grass. */
export type Ground = "stone" | "wood" | "carpet" | "soil" | "tile";
import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { AmbienceLayer } from "./ambience";
import { PARTS, benchBox, clockBox, lampBox, plantBox, treeBox } from "./backdrop-parts";
import type { SetPlan } from "./acts";
import type { Point } from "./rig";
import type { SetPiece } from "./set-pieces";
import { isFair, type SceneMood } from "./scene-mood";
import type { StageSetting } from "./stage-setting";
import {
  THING_WORDS as WORDS,
  drawn,
  onSet,
  toBox,
  twins,
  type SceneThing,
  type ThingBox,
} from "./thing-words";

/** A room window's glass, inside its frame and sill: an arched one is round at the top. */
export interface Glass extends ThingBox {
  arch?: boolean;
}

/**
 * A chair or table standing on the floor at `x` in the drawing. It is drawn at
 * the cast's scale (StickFurniture.svelte), not the backdrop's, so a figure
 * sits on the seat at any stage size. A chair's back is behind whoever sits
 * on it, facing `facing`.
 */
export interface Furniture {
  kind: "chair" | "table";
  x: number;
  facing?: 1 | -1;
  /** A school desk in front of the chair. */
  desk?: boolean;
}

/** Everything about a place the stage needs, besides its drawing (StickBackdrop.svelte). */
export interface Place {
  /** Before a scene starts, where it is. */
  label: string;
  /** Under the sky: weather falls on everything, the sun and stars show, the cast dresses for it. */
  outdoors: boolean;
  /** Which part of the drawing a narrow stage keeps: 0 the left end, 1 the right, the middle unless set. */
  align?: number;
  /**
   * Where the sun stands, morning and afternoon: in open sky clear of towers,
   * lamps, bunting and the place's own clouds, and inside the part a phone's
   * stage shows (the middle 600 of the 960, the right end at the market).
   */
  sun?: Record<"morning" | "day", Point>;
  /** What a line can name, a figure point at and a learner tap, in the order lines look for them. */
  things: readonly SceneThing[];
  /** What the place sounds like under the voices (ambience.ts adds the weather and the hour). */
  sounds: readonly AmbienceLayer[];
  /** Who works here, so they stand at the counter end of the stage. */
  staff?: readonly LessonCharacterId[];
  /** Where the cast gathers, as an x in the drawing; the middle of the stage unless set. */
  post?: number;
  /** The cast keeps to its marks whatever is said, so nobody walks over or to a thing a line names. */
  atMarks?: boolean;
  /** What is underfoot, for the sound of a walk. */
  ground: Ground;
  /** What everyone on stage wears on their head here: the podcast hosts' headphones. */
  headwear?: Headwear;
  /** Where rain and grey show indoors, and the way rain is heard; a room without one stays quiet. */
  glass?: Glass;
  /** Everyone sits at one long desk from the start, turned to each other (the podcast studio). */
  desk?: boolean;
  /** Chairs a line can sit someone on ("Sadnite si."), and tables. */
  furniture?: readonly Furniture[];
  /**
   * What the cast works at and with, for scenes acted from cues: the
   * surfaces at the cast's scale, every object with where it starts, and
   * the spots people stand at. Every place has one, so a segment anywhere
   * can bring what it acts with in its setup.
   */
  set: PlaceSet;
}

export type PlaceSet = Omit<SetPlan, "pieces"> & { pieces: readonly SetPiece[] };

/** Where each seat's bowl stands on the kitchen table, from its middle. */
const PLACE_DX = { l: -35, bl: -15, br: 15, r: 35 } as const;

/**
 * Mária's kitchen, against the tiles on the right: the counter with the sink
 * (the big pot in the open cupboard under it) and the board, the stove, and
 * past it a short side counter where Mária cooks, the salt at her hand, clear
 * of her body so it is seen, and the rail with the spoon and ladle over it.
 * Nothing hangs behind her head: a lid there read as a hood. The soup
 * simmers uncovered. The towel hangs on the oven door's handle, on the far
 * side of the sink from the room: dried there, nobody leans into whoever waits
 * at the counter's end. The table under the window is laid for
 * four: Anna's place at the left end, Lucia's and Marek's behind it, Mária's
 * at the right end. Rig units from each piece's middle; a cast of three
 * draws one rig unit about 1.375 backdrop units wide.
 *
 * Who works where keeps people about 45 rig units apart, a natural gap
 * between two people at a counter: the sink, the board, the stove's left,
 * and the side counter. Nobody stands between the table and its chairs, or
 * idles in front of the towel or a chair's back, where a resting hand would
 * seem to hold it.
 */
const KITCHEN_SET: PlaceSet = {
  pieces: [
    { id: "counter", kind: "counter", x: 600, width: 110, sink: -20 },
    {
      id: "cupboard",
      kind: "ledge",
      at: { piece: "counter", dx: -24 },
      width: 30,
      height: 12,
    },
    { id: "stove", kind: "stove", at: { piece: "counter", dx: 74 } },
    // The oven door's handle, which the stove draws: the towel hangs over it.
    {
      id: "oven-bar",
      kind: "rail",
      at: { piece: "stove", dx: 0 },
      width: 24,
      height: 35,
      bare: true,
    },
    { id: "side", kind: "counter", at: { piece: "stove", dx: 37 }, width: 36 },
    // Under the wall cupboards, out of a tall pot's way.
    { id: "rail", kind: "rail", at: { piece: "side", dx: 0 }, width: 30, height: 88 },
    // A small table for four, so the floor between its end chairs and the door and the counter is free to stand on, clear of the chairs' backs.
    { id: "table", kind: "table", x: 370, width: 84, front: true },
  ],
  objects: [
    { id: "pot", kind: "pot", start: { where: { on: "cupboard", dx: 0 } } },
    { id: "ladle", kind: "ladle", start: { where: { on: "rail", dx: 12 } } },
    { id: "towel", kind: "towel", start: { where: { on: "oven-bar", dx: -7 } } },
    { id: "board", kind: "board", start: { where: { on: "counter", dx: 24 } } },
    { id: "carrot", kind: "carrot", start: { where: { in: "board", dx: -2 } } },
    { id: "knife", kind: "knife", start: { where: { on: "counter", dx: 40 } } },
    {
      id: "jug",
      kind: "jug",
      start: { where: { on: "counter", dx: 49 }, fill: "water" },
    },
    { id: "salt", kind: "salt", start: { where: { on: "side", dx: 6 } } },
    { id: "spoon", kind: "spoon", start: { where: { on: "rail", dx: 5 } } },
    ...(["l", "bl", "br", "r"] as const).flatMap((seat) => [
      {
        id: `bowl-${seat}`,
        kind: "bowl" as const,
        start: { where: { on: "table", dx: PLACE_DX[seat] } },
      },
      {
        id: `spoon-${seat}`,
        kind: "cutlery" as const,
        start: {
          where: { on: "table", dx: PLACE_DX[seat] + (PLACE_DX[seat] < 0 ? 10 : -10) },
        },
      },
    ]),
  ],
  spots: {
    // The door opens into the room on hinges at its left: whoever pushes it open stands on its latch side, facing it.
    door: { x: 244, facing: -1 },
    // In past the open door, on its hinge side, to push it to from where its handle faces.
    inside: { x: 202, facing: 1 },
    // Clear of the table's end chair, where the guests stand about and talk, a step apart.
    middle: { x: 498, facing: 1 },
    chat: { x: 567, facing: -1 },
    // Out of the cooks' way past the table's end, watching.
    aside: { x: 502, facing: 1 },
    // Short of the counter's end, to set something on it: further left, a resting hand is at the end chair's back; further right, a head at the sink's.
    "counter-end": { piece: "counter", dx: -67, facing: 1 },
    // At the stove's left, facing the towel on the oven door.
    "by-towel": { piece: "stove", dx: -24, facing: 1 },
    sink: { piece: "counter", dx: -34, facing: 1 },
    // Where the pot comes out of the cupboard under the sink.
    cupboard: { piece: "counter", dx: -36, facing: 1 },
    board: { piece: "counter", dx: 10, facing: 1 },
    // A step back from the board, to watch someone show how.
    "board-back": { piece: "counter", dx: -4, facing: 1 },
    // Across the board from whoever is at it, to show them.
    "board-across": { piece: "counter", dx: 42, facing: -1 },
    // A step short of the jug, so the hand is seen going to it: from pot-left the jug stood behind her body.
    "jug-left": { piece: "counter", dx: 30, facing: 1 },
    // At the stove from the counter's side, far enough back that a jug or shaker held over the pot is in front of the chest, not the face.
    "pot-left": { piece: "stove", dx: -30, facing: 1 },
    // Close in at the stove's left, to set the big pot on the hob by both handles.
    "hob-near": { piece: "stove", dx: -16, facing: 1 },
    // In front of the pot on the hob, just right of its middle, to hand something to whoever is at pot-left: from her place the two arms met across the pot at head height.
    "at-stove": { piece: "stove", dx: 5, facing: -1 },
    // Mária's place, at the side counter by the stove, facing the room.
    cook: { piece: "side", dx: -10, facing: -1 },
    "seat-l": { chair: 0 },
    "seat-bl": { chair: 1 },
    "seat-br": { chair: 2 },
    "seat-r": { chair: 3 },
  },
  places: {
    basin: { piece: "counter", dx: -20 },
    hob: { piece: "stove", dx: 2 },
    "board-place": { piece: "counter", dx: 24 },
    "knife-place": { piece: "counter", dx: 40 },
    "jug-place": { piece: "counter", dx: 49 },
    "salt-place": { piece: "side", dx: 6 },
    phone: { piece: "table", dx: 4 },
  },
  door: "door",
};

/**
 * Marek's flat: a peg rail on the wall by the window, where the dog's lead
 * hangs, and the floor by the sofa, where the dog's bowl stands. A scene
 * that has them adds the lead and the bowl (its `setup`), so a home without
 * a dog has only the empty rail.
 */
const HOME_SET: PlaceSet = {
  pieces: [
    { id: "pegs", kind: "rail", x: 304, width: 24 },
    { id: "by-sofa", kind: "floor", x: 640, width: 24 },
    { id: "by-dog", kind: "floor", x: 375, width: 24 },
    // Where the backdrop draws the bag by the window, so a scene can keep something in it.
    { id: "window-bag", kind: "floor", x: 171, width: 34 },
  ],
  objects: [],
  spots: {
    // Beside the rail, facing it, to take the lead down: a step short, so the reach goes up and out to it.
    pegs: { piece: "pegs", dx: -26, facing: 1 },
    // Past each edge of what the widest stage shows, to walk on from.
    "off-left": { x: -80, facing: 1 },
    "off-right": { x: 820, facing: -1 },
    // On the rug, where a cast of three or four stands talking; the right one past the bag on it.
    "rug-left": { x: 333, facing: 1 },
    "rug-mid": { x: 410, facing: 1 },
    "rug-mid-right": { x: 487, facing: -1 },
    "rug-right": { x: 585, facing: -1 },
    // A step in from the rug's right, to meet whoever comes in from that side.
    "to-right": { x: 420, facing: 1 },
    // At the window, looking out: the dog under the sill, the one waiting with it beside.
    window: { x: 235, facing: -1 },
    "window-dog": { x: 155, facing: -1 },
    "by-sofa": { piece: "by-sofa", dx: 0, facing: -1 },
    // Beside the bag by the window, to reach down into it.
    "window-bag": { piece: "window-bag", dx: 30, facing: -1 },
  },
};

/**
 * The café counter in the backdrop stands far behind the cast, its top
 * above their heads: the waiter fetches from the back, past the stage's
 * right edge, where a shelf at the hip holds what he brings out. His place
 * at the counter's end is where a cast of three has him.
 */
const CAFE_SET: PlaceSet = {
  pieces: [{ id: "back", kind: "ledge", x: 1050, width: 30, height: 44 }],
  objects: [],
  spots: {
    back: { piece: "back", dx: -16, facing: 1 },
    waiter: { x: 767, facing: -1 },
  },
};

/**
 * The stall on the right, Lucia at its end. Whoever buys next steps up
 * beside her, where a cast of three has the one next to her, and the one
 * done stands back a step left of the other.
 */
const MARKET_SET: PlaceSet = {
  // The stall's counter top behind Lucia, at the hip, where she keeps what she has weighed and wrapped.
  pieces: [{ id: "counter", kind: "ledge", x: 774, width: 40, height: 44 }],
  objects: [],
  spots: {
    stall: { x: 660, facing: 1 },
    aside: { x: 530, facing: 1 },
  },
};

/** The park's afternoon sun, which a line can point at and Find it can ask for. */
const PARK_SUN = { x: 562, y: 36 };

/** A place with no pieces of its own: a scene brings what it acts with in its setup. */
const EMPTY_SET: PlaceSet = {
  pieces: [],
  objects: [],
};

export const PLACES: Readonly<Record<StageSetting, Place>> = {
  cafe: {
    ground: "wood",
    label: "At the café",
    outdoors: false,
    // The counter, where the cakes the scenes point at are.
    align: 1,
    things: [
      drawn(WORDS.okno, [92, 24, 192, 186]),
      drawn(WORDS.lampa, [460, 36, 40, 24], [360, 36, 40, 24], [560, 36, 40, 24]),
      drawn(WORDS.tabula, [646, 46, 116, 98]),
      drawn(WORDS.pult, [772, 150, 210, 76]),
      drawn(WORDS.kolac, [795, 104, 54, 42]),
      drawn(WORDS.torta, [892, 44, 52, 42]),
      drawn(WORDS.kavovar, [880, 98, 58, 52]),
      drawn(WORDS.stol, [148, 204, 84, 52]),
      drawn(WORDS.stolicka, [114, 186, 42, 72], [224, 186, 42, 72]),
      drawn(WORDS.rastlina, plantBox(PARTS.cafe.plant)),
    ],
    sounds: ["murmur", "clinks"],
    staff: ["waiter"],
    post: 690,
    glass: { arch: true, height: 166, width: 156, x: 110, y: 34 },
    set: CAFE_SET,
  },
  classroom: {
    ground: "wood",
    label: "In class",
    outdoors: false,
    // The board.
    align: 0,
    things: [
      drawn({ ...WORDS.tabula, english: "blackboard" }, [44, 66, 220, 88]),
      drawn(WORDS.abeceda, [260, 34, 441, 34]),
      drawn(WORDS.hodiny, clockBox(PARTS.classroom.clock)),
      drawn(WORDS.globus, [844, 118, 46, 52]),
      drawn({ ...WORDS.stol, english: "desk" }, [686, 170, 228, 56]),
      drawn(WORDS.rastlina, plantBox(PARTS.classroom.plant)),
    ],
    sounds: ["hum"],
    // The teacher stands by her desk; the pupils' desks face her, inside what a phone shows.
    staff: ["maria"],
    furniture: [
      { kind: "chair", x: 200, facing: 1, desk: true },
      { kind: "chair", x: 330, facing: 1, desk: true },
    ],
    set: EMPTY_SET,
  },
  default: {
    ground: "soil",
    label: "In the park by the Danube",
    outdoors: true,
    sun: { day: PARK_SUN, morning: { x: 370, y: 46 } },
    things: [
      drawn(WORDS.hrad, [632, 34, 96, 78]),
      drawn(WORDS.kopec, [520, 84, 440, 110]),
      drawn(WORDS.rieka, [0, 194, 960, 18]),
      drawn(WORDS.strom, [792, 82, 92, 144], [108, 86, 86, 140], [290, 98, 64, 128]),
      drawn(WORDS.lavicka, benchBox(PARTS.default.bench)),
      drawn(WORDS.lampa, lampBox(PARTS.default.lamp)),
      drawn(WORDS.oblak, [212, 33, 76, 29], [446, 27, 48, 19]),
      drawn(WORDS.slnko, [PARK_SUN.x - 22, PARK_SUN.y - 22, 44, 44]),
    ],
    sounds: ["birds", "wind"],
    // Nothing of its own, so other scenes here stay as they were: a scene brings what it acts with (setup).
    set: {
      pieces: [],
      objects: [],
      spots: {
        // Past each edge of what the widest stage shows, to walk on from or off to.
        "off-left": { x: 40, facing: 1 },
        "off-right": { x: 1000, facing: -1 },
        // Cast marks in the park: Anna on the left, Domo in the middle, Dunčo ready for the throw on the right.
        "park-left": { x: 300, facing: 1 },
        "park-mid": { x: 440, facing: 1 },
        "park-dog": { x: 540, facing: -1 },
        // Back from a run off the right, facing whoever threw.
        "back-right": { x: 550, facing: -1 },
      },
    },
  },
  home: {
    ground: "wood",
    label: "At home",
    outdoors: false,
    // The window.
    align: 0.2,
    things: [
      drawn(WORDS.muz, [140, 108, 24, 45]),
      drawn(WORDS.zena, [184, 111, 25, 41]),
      drawn(WORDS.okno, [96, 44, 150, 124]),
      twins(WORDS.taska, [510, 240, 48, 50], [152, 189, 38, 38], "far"),
      drawn(WORDS.zaves, [78, 36, 34, 142], [230, 36, 34, 142]),
      drawn(WORDS.obraz, [742, 50, 104, 72], [424, 36, 50, 40], [488, 42, 40, 34]),
      drawn(WORDS.pohovka, [666, 152, 254, 86]),
      drawn(WORDS.vankus, [704, 160, 48, 44], [834, 160, 48, 44]),
      drawn(WORDS.lampa, [926, 70, 36, 172]),
      drawn(WORDS.koberec, [230, 259, 500, 36]),
      onSet(WORDS.voditko, ["lead"], [282, 92, 44, 66]),
      drawn(WORDS.rastlina, plantBox(PARTS.home.plant)),
    ],
    sounds: ["hum"],
    // On the rug (480 ± 250), left of the bag on it so nobody stands on that.
    post: 410,
    glass: { height: 100, width: 130, x: 106, y: 54 },
    set: HOME_SET,
  },
  kitchen: {
    // At home people are in slippers on the kitchen tiles: a soft pat and shuffle.
    ground: "tile",
    label: "In the kitchen",
    outdoors: false,
    things: [
      drawn(WORDS.dvere, [190, 40, 72, 186]),
      drawn(WORDS.chladnicka, [280, 66, 56, 160]),
      drawn(WORDS.okno, [352, 54, 104, 80]),
      drawn(WORDS.hodiny, clockBox(PARTS.kitchen.clock)),
      // The sink, pot and stove are the set's, at the cast's scale: these boxes fit a cast of three or
      // more (StickSet.svelte), whose floor is at y 280, in front of the wall's foot.
      drawn(WORDS.umyvadlo, [556, 212, 34, 12]),
      { ...drawn(WORDS.hrniec, [683, 196, 44, 24]), of: ["pot"] },
      { ...drawn(WORDS.sporak, [676, 219, 52, 61]), of: ["stove"] },
      onSet(WORDS.stol, ["table"], [330, 236, 80, 30]),
      onSet(
        WORDS.stolicka,
        ["chair-0", "chair-1", "chair-2", "chair-3"],
        [280, 240, 24, 40],
      ),
      onSet(
        WORDS.miska,
        (["l", "bl", "br", "r"] as const).map((seat) => `bowl-${seat}`),
        [340, 230, 10, 5],
      ),
      onSet(
        WORDS.lyzica,
        ["spoon", ...(["l", "bl", "br", "r"] as const).map((seat) => `spoon-${seat}`)],
        [700, 180, 6, 20],
      ),
      onSet(WORDS.doska, ["board"], [620, 210, 22, 4]),
      onSet(WORDS.mrkva, ["carrot"], [622, 206, 14, 4]),
      onSet(WORDS.noz, ["knife"], [636, 210, 12, 3]),
      onSet(WORDS.dzban, ["jug"], [646, 200, 10, 12]),
      onSet(WORDS.sol, ["salt"], [728, 204, 5, 9]),
    ],
    sounds: ["hum"],
    // The cook works at the stove end; guests eat at the table by the window.
    staff: ["maria"],
    // At the counter, the cook at the side counter by the stove.
    post: 618,
    // Round the table: one at each end, two behind it.
    furniture: [
      { kind: "chair", x: 292, facing: 1 },
      { kind: "chair", x: 349, facing: 1 },
      { kind: "chair", x: 391, facing: -1 },
      // Close in to the table's end, so whoever sits there has their knees under it.
      { kind: "chair", x: 446, facing: -1 },
    ],
    glass: { height: 64, width: 88, x: 360, y: 62 },
    set: KITCHEN_SET,
  },
  market: {
    ground: "stone",
    label: "At the market",
    outdoors: true,
    // The stall Lucia sells cheese and strawberries from.
    align: 1,
    sun: { day: { x: 738, y: 30 }, morning: { x: 738, y: 32 } },
    things: [
      drawn(WORDS.ovocie, [40, 136, 260, 38]),
      drawn(WORDS.zelenina, [748, 128, 84, 46]),
      twins(WORDS.syr, [662, 100, 28, 42], [890, 100, 28, 42]),
      twins(WORDS.jahody, [660, 134, 84, 24], [836, 134, 84, 24]),
      drawn(WORDS.stanok, [636, 66, 308, 162], [16, 66, 308, 162]),
    ],
    sounds: ["murmur", "birds"],
    // Lucia sells at the market in the podcast, from the stall on the right.
    staff: ["lucia"],
    post: 660,
    set: MARKET_SET,
  },
  plaza: {
    ground: "stone",
    label: "On the old town square",
    outdoors: true,
    sun: { day: { x: 688, y: 36 }, morning: { x: 400, y: 46 } },
    things: [
      drawn(WORDS.veza, [250, 28, 66, 198]),
      drawn(WORDS.hodiny, clockBox(PARTS.plaza.clock)),
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
      drawn(WORDS.lavicka, benchBox(PARTS.plaza.bench)),
      drawn({ ...WORDS.lampa, english: "street lamp" }, lampBox(PARTS.plaza.lamp)),
      drawn(WORDS.strom, treeBox(PARTS.plaza.tree)),
      drawn(WORDS.oblak, [522, 29, 76, 31], [833, 42, 54, 22], [80, 31, 61, 25]),
    ],
    sounds: ["murmur", "birds", "tram"],
    set: EMPTY_SET,
  },
  registration: {
    ground: "stone",
    label: "At the front desk",
    outdoors: false,
    things: [
      drawn(WORDS.hodiny, clockBox(PARTS.registration.clock)),
      drawn(WORDS.stolicka, [36, 156, 58, 72], [104, 156, 58, 72], [172, 156, 58, 72]),
      drawn(WORDS.rastlina, plantBox(PARTS.registration.plant)),
      drawn(WORDS.pult, [640, 140, 340, 86]),
      drawn(WORDS.pocitac, [842, 86, 72, 56]),
      drawn(WORDS.zvoncek, [698, 126, 22, 16]),
    ],
    sounds: ["hum", "murmur"],
    staff: ["receptionist", "maria"],
    post: 560,
    set: EMPTY_SET,
  },
  street: {
    ground: "stone",
    label: "On the street, by the tram stop",
    outdoors: true,
    sun: { day: { x: 640, y: 36 }, morning: { x: 520, y: 46 } },
    things: [
      drawn(
        WORDS.dom,
        [470, 104, 160, 122],
        [0, 100, 140, 126],
        [140, 88, 90, 138],
        [230, 96, 130, 130],
        [360, 94, 110, 132],
        [630, 86, 100, 140],
        [730, 94, 130, 132],
        [860, 90, 110, 136],
      ),
      drawn(WORDS.strom, treeBox(PARTS.street.tree)),
      drawn({ ...WORDS.lampa, english: "street lamp" }, lampBox(PARTS.street.lamp)),
      drawn(WORDS.zastavka, [630, 144, 40, 112]),
      drawn(WORDS.lavicka, benchBox(PARTS.street.bench)),
      drawn(WORDS.oblak, [382, 19, 76, 31], [733, 40, 54, 22]),
    ],
    sounds: ["murmur"],
    set: EMPTY_SET,
  },
  studio: {
    ground: "carpet",
    label: "In the podcast studio",
    outdoors: false,
    things: [
      drawn(WORDS.dvere, [190, 40, 72, 186]),
      drawn(WORDS.hodiny, clockBox(PARTS.studio.clock)),
      // The desk and mics are drawn at the cast's scale (StudioDesk.svelte); these boxes are where they land on a wide stage.
      drawn(WORDS.stol, [285, 208, 390, 70]),
      drawn(WORDS.mikrofon, [423, 158, 28, 22], [509, 158, 28, 22]),
      // The plant by the desk is the set's; the little one on the shelf is drawn with the shelf.
      {
        ...drawn(WORDS.rastlina, plantBox(PARTS.studio.plant), [742, 94, 22, 26]),
        of: ["plant"],
      },
      onSet(WORDS.krhla, ["can"], [690, 230, 22, 18]),
      // On the shelf, for tapping only: a line about a book means one in someone's hands, not these.
      { ...drawn(WORDS.platna, [686, 30, 70, 52]), quiet: true },
      { ...drawn(WORDS.knihy, [682, 90, 52, 30]), quiet: true },
      { ...drawn(WORDS.polica, [676, 118, 96, 8]), quiet: true },
      drawn(WORDS.koberec, [190, 256, 580, 40]),
    ],
    sounds: ["hum"],
    // Podcast hosts sit at their desk mics, headphones on.
    atMarks: true,
    desk: true,
    headwear: "headphones",
    set: {
      pieces: [
        // StudioDesk.svelte draws it, between the hosts' seats.
        { id: "desk", kind: "desk", front: true },
        { id: "corner", kind: "floor", x: PARTS.studio.plant.x },
      ],
      objects: [
        { id: "plant", kind: "plant", start: { where: { on: "corner", dx: 0 } } },
        // In front of the pot: the gap to the desk's end is too narrow for it.
        {
          id: "can",
          kind: "can",
          start: { where: { on: "corner", dx: -15 }, fill: "water" },
        },
      ],
      spots: {
        plant: { piece: "corner", dx: -32, facing: 1 },
        "desk-left": { chair: 0 },
        "desk-right": { chair: 1 },
        // The same door as the kitchen's: in on its latch side, then past it to push it to.
        door: { x: 244, facing: -1 },
        inside: { x: 202, facing: 1 },
      },
      door: "door",
    },
  },
};

export function backdropAlign(setting: StageSetting): number {
  return PLACES[setting].align ?? 0.5;
}

export function isOutdoors(setting: StageSetting): boolean {
  return PLACES[setting].outdoors;
}

/** Where the sun is drawn, if it is out: outdoors, on a fair morning or a sunny afternoon. */
export function sunIn(
  setting: StageSetting,
  mood: SceneMood,
): (Point & { r: number }) | undefined {
  const spots = PLACES[setting].sun;
  if (!spots) return undefined;
  if (mood.time === "morning" && isFair(mood.weather)) return { ...spots.morning, r: 17 };
  if (mood.time === "day" && mood.weather === "sunny") return { ...spots.day, r: 19 };
  return undefined;
}

/** The things a place shows in a mood: the sun only while it is out, and where it is drawn. */
export function thingsIn(
  things: readonly SceneThing[],
  setting: StageSetting,
  mood: SceneMood,
): readonly SceneThing[] {
  const sun = sunIn(setting, mood);
  return things.flatMap((thing) => {
    if (thing.id !== "slnko") return [thing];
    return sun ? [{ ...thing, box: toBox([sun.x - 22, sun.y - 22, 44, 44]) }] : [];
  });
}
