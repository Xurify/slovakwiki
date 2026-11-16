import type { Headwear } from "./dress";

/** What a place has underfoot: pavement and cobbles, floorboards, a carpet, a path or grass. */
export type Ground = "stone" | "wood" | "carpet" | "soil" | "tile";
import {
  LESSON_CHARACTER_IDS,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";
import type { AmbienceLayer } from "./ambience";
import { PARTS, benchBox, clockBox, lampBox, plantBox, treeBox } from "./backdrop-parts";
import type { SetPlan } from "./acts";
import type { Point } from "./rig";
import type { SetPiece } from "./set-pieces";
import { isDark, isFair, type SceneMood } from "./scene-mood";
import type { StageSetting } from "./stage-setting";
import {
  THING_WORDS as WORDS,
  drawn,
  onSet,
  thingBoxes,
  toBox,
  twins,
  type Rect,
  type SceneThing,
  type ThingBox,
} from "./thing-words";
import type { TramState } from "./street";

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
  /** False drops the stage's pool of light: on the market's pale stalls and crates it read as fog. */
  glow?: false;
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
    { id: "counter", kind: "counter", x: 592, width: 110, sink: -20 },
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
    {
      id: "rail",
      kind: "rail",
      at: { piece: "side", dx: 0 },
      width: 30,
      height: 88,
      utensils: true,
    },
    // A small table for four, so the floor between its end chairs and the door and the counter is free to stand on, clear of the chairs' backs.
    { id: "table", kind: "table", x: 370, width: 84, front: true, cloth: true },
  ],
  objects: [
    { id: "pot", kind: "pot", start: { where: { on: "cupboard", dx: 0 } } },
    { id: "ladle", kind: "ladle", start: { where: { on: "rail", dx: 12 } } },
    { id: "towel", kind: "towel", start: { where: { on: "oven-bar", dx: -7 } } },
    { id: "board", kind: "board", start: { where: { on: "counter", dx: 24 } } },
    { id: "carrot", kind: "carrot", start: { where: { in: "board", dx: -2 } } },
    { id: "knife", kind: "knife", start: { where: { on: "counter", dx: 31 } } },
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
    chat: { x: 559, facing: -1 },
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
    "knife-place": { piece: "counter", dx: 31 },
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
    { id: "pegs", kind: "rail", x: 304, width: 24, height: 86, coats: true },
    { id: "by-sofa", kind: "floor", x: 634, width: 22, mat: true },
    // In front of the sofa, short of its end: a dog eating at the by-sofa bowl stood at a phone's edge.
    { id: "bowl-mat", kind: "floor", x: 578, width: 22, mat: true },
    // Floor spot in front of the dog's nose at rug-left, where its bowl stands; a dog there faces right.
    { id: "by-dog", kind: "floor", x: 380, width: 24 },
    // Beside the dog's bed under the window, where his bowl is kept between meals.
    { id: "by-bed", kind: "floor", x: 204, width: 22 },
    // The bag set down by the window, so a scene can keep something in it.
    { id: "window-bag", kind: "bag", x: 171 },
  ],
  objects: [],
  spots: {
    // Beside the rail, facing it, to take the lead down: a step short, so the reach goes up and out to it.
    pegs: { piece: "pegs", dx: -26, facing: 1 },
    // The same reach from the room side, for someone coming from the rug while the dog waits under the rail.
    "pegs-right": { piece: "pegs", dx: 26, facing: -1 },
    // Past each edge of what the widest stage shows, to walk on from.
    "off-left": { x: -80, facing: 1 },
    "off-right": { x: 820, facing: -1 },
    // On the rug, where a cast of three or four stands talking; the right one past the bag on it.
    "rug-left": { x: 333, facing: 1 },
    // A step right of the pegs: at rug-left the lead hung over the shoulder of whoever stood there.
    "by-pegs": { x: 362, facing: 1 },
    "rug-mid": { x: 410, facing: 1 },
    "rug-mid-right": { x: 487, facing: -1 },
    "rug-right": { x: 585, facing: -1 },
    // A step in from the rug's right, to meet whoever comes in from that side.
    "to-right": { x: 420, facing: 1 },
    // The dog's spot at the rug's left edge, and where someone kneels by its head on the room side.
    "dog-spot": { x: 300, facing: 1 },
    "kneel-by-dog": { x: 355, facing: -1 },
    // At the window, looking out: the dog under the sill, the one waiting with it beside.
    window: { x: 235, facing: -1 },
    // On his bed under the sill, turned up toward the glass.
    "dog-bed": { x: 154, facing: -1 },
    "window-dog": { x: 118, facing: -1 },
    // Dunčo by his bed under the window, in frame on a phone, looking up at the glass.
    "dunco-window": { x: 128, facing: 1 },
    "by-sofa": { piece: "by-sofa", dx: 0, facing: -1 },
    // The dog eating: just left of the bowl, facing it, so its head is down in it and its tail inside a phone's stage.
    "bowl-dog": { piece: "by-sofa", dx: -16, facing: 1 },
    // Further back at the mat's bowl, so the nose is over it and the front paws stop short of it.
    "bowl-mat-dog": { piece: "bowl-mat", dx: -25, facing: 1 },
    // Beside the bag by the window, to reach down into it.
    "window-bag": { piece: "window-bag", dx: 30, facing: -1 },
    // By the right curtain, facing the glass: someone looking out from here leaves the couple outside in view.
    "by-window": { x: 258, facing: -1 },
    // The hall door opens into the room on hinges at its left, like the kitchen's: in on its latch
    // side, then past it to push it to; leaving, the same spot to pull it open from.
    door: { x: 412, facing: -1 },
    inside: { x: 372, facing: 1 },
  },
  door: "door",
};

/**
 * The café's bar on the right, at the cast's scale so the cups the waiter
 * takes stand on its top at any stage size: the coffees wait under the
 * espresso machine at its near end, the grinder, card reader and pastry
 * case past them, and he steps up to them from where he takes orders. The cast's floor is the bar's, so a cast of
 * two, drawn bigger, still has all of it inside a phone's stage.
 */
const CAFE_SET: PlaceSet = {
  pieces: [
    // Drawn over the waiter, who works behind it and comes out through the flap at its left end.
    { id: "bar", kind: "bar", x: 856, width: 80, front: true },
    // The window table, clear of where a cast of two or three stands, and of a phone's left edge.
    { id: "table", kind: "bistro", x: 450, width: 76 },
    // Under the machine's group heads, so the coffees wait there on their saucers.
    {
      id: "back",
      kind: "ledge",
      at: { piece: "bar", dx: -13 },
      width: 24,
      height: 44,
      front: true,
    },
    { id: "stool-1", kind: "stool", at: { piece: "bar", dx: 8 }, front: true },
    { id: "stool-2", kind: "stool", at: { piece: "bar", dx: 24 }, front: true },
  ],
  objects: [],
  spots: {
    back: { piece: "back", dx: -18, facing: 1 },
    waiter: { x: 767, facing: -1 },
    // A guest at the counter, across from the waiter, at the elbow room people keep at a counter (about 50 rig units from waiter).
    counter: { x: 674, facing: 1 },
    // The next guest, a step back from the one being served.
    queue: { x: 590, facing: 1 },
    // The window table's chairs (stage-frame.ts seats them), for "Sadnite si."
    "chair-l": { chair: 0 },
    "chair-r": { chair: 1 },
    // Where the waiter serves the window table from, past the right chair.
    "by-table": { piece: "table", dx: 70, facing: -1 },
    // The street door opens into the room on hinges at its left, like the studio's: in on its latch side, then past it to push it to.
    door: { x: 290, facing: -1 },
    inside: { x: 262, facing: 1 },
  },
  door: "door",
};

/**
 * The front desk, drawn over Mária, who works behind it: a cast's last
 * place is hers (scene-direction.ts puts staff last), and with a cast of
 * two or three she stands a step in from the desk's left end.
 */
const REGISTRATION_SET: PlaceSet = {
  pieces: [{ id: "counter", kind: "reception", x: 642, width: 76, front: true }],
  objects: [],
  spots: {
    "behind-counter": { piece: "counter", dx: 0, facing: -1 },
    // Across the desk from her, clear of its left end.
    guest: { x: 528, facing: 1 },
  },
};

/**
 * The farm stall on the right, Lucia behind its selling counter in the
 * middle, the crates on the stall's own counter behind her. Whoever buys
 * steps up to the counter's left end, by the dearer cheese, and the one done
 * stands back a step left of them.
 */
const MARKET_SET: PlaceSet = {
  // The stall's own counter is drawn in the backdrop, whose scale against the cast's changes with
  // the stage, so a surface at its height would float off it on another screen: the selling counter
  // stands on the cast's floor in front of it, drawn over Lucia's legs.
  pieces: [{ id: "counter", kind: "stand", x: 784, width: 100, front: true }],
  objects: [],
  spots: {
    stall: { x: 700, facing: 1 },
    "behind-counter": { piece: "counter", dx: 0, facing: -1 },
    // Behind the counter's ends: by the buyer to hand things over, by the far cheeses to take one.
    "counter-near": { piece: "counter", dx: -26, facing: -1 },
    "counter-far": { piece: "counter", dx: 26, facing: -1 },
    aside: { x: 620, facing: 1 },
  },
};

/** The stopped tram as Street.svelte draws it: from its nose past the stage's right edge, roof to rails. */
const TRAM_BOX: Rect = [280, 28, 680, 232];

/** The park's afternoon sun, which a line can point at and Find it can ask for. */
const PARK_SUN = { x: 562, y: 36 };

/**
 * The tram stop: where two wait right of the street clock's post, clear
 * of it, and where they step up to the tram's door to get on.
 */
const STREET_SET: PlaceSet = {
  pieces: [],
  objects: [],
  spots: {
    "wait-l": { x: 540, facing: 1 },
    "wait-r": { x: 625, facing: -1 },
    door: { x: 680, facing: 1 },
    "door-back": { x: 600, facing: 1 },
  },
};

/** A place with no pieces of its own: a scene brings what it acts with in its setup. */
const EMPTY_SET: PlaceSet = {
  pieces: [],
  objects: [],
};

/** The old town square: open paving, where a walker and a dog on a lead stop to talk to someone. */
const PLAZA_SET: PlaceSet = {
  pieces: [],
  objects: [],
  spots: {
    // The one holding the lead, the dog a lead's length ahead, and whoever greets the dog facing it.
    // The walker stands right of the pharmacy's lettering (x 365 to 417), so his head never hides it.
    walker: { x: 440, facing: 1 },
    "walked-dog": { x: 520, facing: 1 },
    greeter: { x: 578, facing: -1 },
    // The edges, past what the widest stage shows, to walk on from.
    "off-left": { x: 40, facing: 1 },
    "off-right": { x: 1000, facing: -1 },
    // In front of the café's tables, turned to them, for someone sitting out there to come over from.
    cafe: { x: 680, facing: 1 },
  },
};

export const PLACES: Readonly<Record<StageSetting, Place>> = {
  cafe: {
    ground: "wood",
    label: "At the café",
    outdoors: false,
    // The counter, where the cakes the scenes point at are.
    align: 1,
    things: [
      drawn(WORDS.okno, [400, 20, 164, 137], [42, 24, 192, 186]),
      drawn(WORDS.lampa, [450, 40, 32, 20], [769, 28, 18, 16]),
      drawn(WORDS.tabula, [636, 12, 124, 58]),
      // The bar, its machine, the window table and the chairs are the set's, at the cast's scale (StickSet.svelte).
      { ...drawn(WORDS.pult, [782, 196, 150, 82]), of: ["bar"] },
      drawn(WORDS.kolac, [843, 62, 26, 32]),
      drawn(WORDS.torta, [885, 68, 30, 26]),
      { ...drawn(WORDS.kavovar, [808, 150, 48, 66]), of: ["bar-machine"] },
      { ...drawn(WORDS.stol, [420, 194, 60, 84]), of: ["table-top"] },
      // A scene's coffees, wherever they stand or are held: they are the scene's objects, so only measured.
      { ...drawn(WORDS.salka, [796, 180, 24, 12]), of: ["anna-cup", "marek-cup"] },
      // A host's recorder set down on the table, there only while one is.
      onSet(WORDS.diktafon, ["recorder"], [452, 188, 8, 6]),
      {
        ...drawn(WORDS.stolicka, [380, 160, 40, 118]),
        of: ["table-chair-l", "table-chair-r", "stool-1", "stool-2"],
      },
      drawn(WORDS.rastlina, plantBox(PARTS.cafe.plant)),
      drawn(WORDS.dvere, [246, 68, 66, 160]),
      drawn(WORDS.hodiny, clockBox(PARTS.cafe.clock)),
      drawn(WORDS.vesiak, [320, 88, 40, 142]),
      drawn({ ...WORDS.lavicka, english: "banquette" }, [392, 174, 180, 54]),
      drawn({ ...WORDS.polica, english: "back bar" }, [800, 28, 128, 104]),
    ],
    sounds: ["murmur", "clinks"],
    staff: ["waiter"],
    post: 690,
    glass: { height: 116, width: 148, x: 408, y: 28 },
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
    label: "By the Danube",
    outdoors: true,
    sun: { day: PARK_SUN, morning: { x: 446, y: 46 } },
    things: [
      drawn(WORDS.hrad, [632, 16, 96, 78]),
      drawn(WORDS.kopec, [520, 66, 440, 110]),
      drawn(WORDS.rieka, [0, 177, 960, 47]),
      // The plane trees stand on the lawn behind the promenade: their boxes stop above the cast's floor,
      // so the cast can stand in front of a trunk.
      drawn(WORDS.strom, [202, 82, 96, 147], [12, 80, 104, 149], [834, 78, 112, 151]),
      drawn(WORDS.lavicka, benchBox(PARTS.default.bench)),
      drawn(
        WORDS.lampa,
        lampBox(PARTS.default.lamp),
        lampBox({ ...PARTS.default.lamp, x: 752 }),
      ),
      drawn(WORDS.oblak, [216, 30, 68, 28], [746, 20, 48, 20], [860, 33, 60, 25]),
      drawn(WORDS.slnko, [PARK_SUN.x - 22, PARK_SUN.y - 22, 44, 44]),
      drawn(WORDS.lod, [578, 170, 76, 26]),
      drawn({ ...WORDS.kostol, english: "cathedral" }, [484, 48, 38, 126]),
      drawn(WORDS.dom, [0, 132, 628, 42]),
      drawn(WORDS.kos, [590, 228, 20, 38]),
      drawn(WORDS.kvety, [380, 234, 48, 14], [854, 234, 60, 14]),
      onSet(WORDS.lopticka, ["ball"], [452, 196, 10, 10]),
      onSet(WORDS.voditko, ["park-lead"], [300, 200, 30, 40]),
    ],
    sounds: ["birds", "wind", "water"],
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
        // On the lead at heel, on Anna's left, out of the way between her and Domo.
        "park-heel": { x: 248, facing: 1 },
        // Back from a run off the right, facing whoever threw.
        "back-right": { x: 550, facing: -1 },
        // Halfway after the ball, short of the bench, so he is still in sight as he runs.
        "far-right": { x: 566, facing: 1 },
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
      drawn(WORDS.muz, [150, 108, 24, 45]),
      drawn(WORDS.zena, [194, 111, 25, 41]),
      drawn(WORDS.okno, [106, 44, 150, 124]),
      // The one by the window is the set's, measured where it is drawn at the cast's scale.
      {
        ...twins(WORDS.taska, [330, 200, 28, 29], [159, 254, 25, 26], "far"),
        of: ["window-bag"],
      },
      drawn(WORDS.zaves, [88, 36, 34, 142], [240, 36, 34, 142]),
      drawn(
        WORDS.obraz,
        [530, 62, 80, 58],
        [618, 62, 28, 26],
        [618, 94, 28, 26],
        [10, 78, 30, 40],
      ),
      drawn(WORDS.pohovka, [516, 148, 132, 86]),
      drawn(WORDS.vankus, [540, 156, 36, 33], [588, 156, 36, 33]),
      drawn(WORDS.lampa, [392, 4, 36, 38], [676, 74, 28, 160]),
      drawn(WORDS.koberec, [256, 248, 360, 52]),
      onSet(WORDS.voditko, ["lead"], [282, 92, 44, 66]),
      onSet(WORDS.miska, ["bowl"], [370, 240, 20, 10]),
      onSet(WORDS.kufor, ["suitcase"], [372, 214, 22, 34]),
      onSet(WORDS.lopticka, ["ball"], [628, 254, 10, 10]),
      drawn(WORDS.rastlina, plantBox(PARTS.home.plant)),
      drawn(WORDS.dvere, [358, 48, 72, 178]),
      drawn(WORDS.knihy, [454, 74, 36, 66]),
      drawn(WORDS.televizor, [456, 140, 40, 32]),
      drawn(WORDS.kniznica, [448, 46, 64, 188]),
      drawn(WORDS.stolik, [538, 218, 88, 34]),
      drawn(WORDS.radiator, [128, 178, 106, 36]),
      drawn(WORDS.zrkadlo, [290, 30, 44, 58]),
      drawn(WORDS.pelech, [106, 228, 64, 20]),
      { ...drawn(WORDS.vesiak, [288, 92, 34, 40]), of: ["pegs"] },
      drawn(WORDS.hodiny, clockBox(PARTS.home.clock)),
      { ...drawn(WORDS.kabat, [318, 92, 14, 30]), of: ["pegs-coat"] },
      drawn(WORDS.hrncek, [484, 121, 20, 16], [595, 216, 12, 9]),
      onSet(WORDS.pes, ["dog"], [280, 200, 60, 40]),
      onSet(WORDS.robot, ["robot"], [400, 120, 40, 110]),
      drawn(WORDS.topanky, [276, 224, 66, 13]),
    ],
    sounds: ["hum"],
    // On the rug (480 ± 250), left of the bag on it so nobody stands on that.
    post: 410,
    glass: { height: 100, width: 130, x: 116, y: 54 },
    set: HOME_SET,
  },
  kitchen: {
    // At home people are in slippers on the kitchen tiles: a soft pat and shuffle.
    ground: "tile",
    label: "In the kitchen",
    outdoors: false,
    things: [
      drawn(WORDS.dvere, [190, 40, 72, 186], [36, 56, 62, 170]),
      drawn(WORDS.chladnicka, [468, 136, 38, 94]),
      drawn(WORDS.okno, [352, 54, 104, 80]),
      drawn(WORDS.zaves, [338, 46, 20, 96], [450, 46, 20, 96]),
      drawn(WORDS.lampa, [352, 60, 36, 20]),
      drawn(WORDS.hodiny, clockBox(PARTS.kitchen.clock)),
      // The sink, pot and stove are the set's, at the cast's scale: these boxes fit a cast of three or
      // more (StickSet.svelte), whose floor is at y 280, in front of the wall's foot.
      { ...drawn(WORDS.umyvadlo, [548, 212, 34, 12]), of: ["counter-sink"] },
      { ...drawn(WORDS.hrniec, [675, 196, 44, 24]), of: ["pot"] },
      { ...drawn(WORDS.sporak, [668, 219, 52, 61]), of: ["stove-body"] },
      { ...drawn(WORDS.digestor, [674, 138, 44, 41]), of: ["stove-hood"] },
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
        [692, 180, 6, 20],
      ),
      onSet(WORDS.doska, ["board"], [620, 210, 22, 4]),
      { ...onSet(WORDS.mrkva, ["carrot"], [622, 206, 14, 4]), onto: "doska" },
      { ...onSet(WORDS.noz, ["knife"], [636, 210, 12, 3]), onto: "doska" },
      onSet(WORDS.diktafon, ["recorder"], [560, 204, 8, 6]),
      onSet(WORDS.dzban, ["jug"], [646, 200, 10, 12]),
      onSet(WORDS.sol, ["salt"], [728, 204, 5, 9]),
      drawn(WORDS.kredenc, [273, 54, 74, 180]),
      drawn(WORDS.skrinky, [514, 32, 256, 60]),
      drawn({ ...WORDS.kvety, english: "geraniums" }, [358, 102, 92, 32]),
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
    // Below the lace curtain, which hides the top of the glass; the lamp hangs in front of that.
    glass: { height: 36, width: 88, x: 360, y: 90 },
    set: KITCHEN_SET,
  },
  market: {
    ground: "stone",
    label: "At the market",
    outdoors: true,
    glow: false,
    // The stall Lucia sells cheese and strawberries from.
    align: 1,
    sun: { day: { x: 738, y: 30 }, morning: { x: 738, y: 32 } },
    things: [
      drawn(WORDS.ovocie, [430, 122, 164, 52]),
      drawn(WORDS.zelenina, [736, 114, 84, 60]),
      // On the selling counter: tento syr, the smoked wheel by the buyer, and tamten, the small oštiepky at the far end.
      {
        ...drawn(WORDS.syr, [722, 194, 30, 26], [824, 194, 30, 26]),
        twins: { far: 1, near: 0 },
        of: ["counter-near-cheese", "counter-far-cheese"],
      },
      // Tieto up on the back row at the buyer's end, over the heads of whoever stands there; tamtie on the counter at the far end.
      twins(WORDS.jahody, [648, 112, 76, 20], [824, 134, 76, 24]),
      { ...drawn(WORDS.vaha, [796, 190, 22, 26]), of: ["counter-scale"] },
      // The prices pinned to the cloth under each cheese, and each stall's name board on its beam.
      {
        ...drawn(WORDS.cenovka, [721, 212, 30, 16], [823, 212, 30, 16]),
        of: ["counter-price-near", "counter-price-far"],
      },
      drawn(WORDS.napis, [468, 80, 84, 16], [738, 64, 84, 16]),
      { ...drawn(WORDS.kosik, [758, 194, 24, 22]), of: ["basket"] },
      drawn({ ...WORDS.lampa, english: "street lamp" }, lampBox(PARTS.market.lamp)),
      drawn(WORDS.stanok, [626, 60, 308, 166], [408, 76, 204, 150]),
      // The houses across the square, only where no stall stands in front of them.
      drawn(
        WORDS.dom,
        [350, 70, 58, 142],
        [930, 68, 30, 144],
        [230, 32, 120, 180],
        [120, 76, 110, 136],
        [-10, 36, 130, 176],
      ),
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
      drawn(WORDS.veza, [246, 8, 74, 218]),
      drawn(WORDS.hodiny, clockBox(PARTS.plaza.clock)),
      drawn(
        WORDS.dom,
        [466, 50, 120, 176],
        [0, 48, 114, 178],
        [114, 74, 136, 152],
        [316, 82, 150, 144],
        [586, 74, 124, 152],
        [710, 46, 112, 180],
        [822, 76, 138, 150],
      ),
      drawn(WORDS.lavicka, benchBox(PARTS.plaza.bench)),
      drawn({ ...WORDS.lampa, english: "street lamp" }, lampBox(PARTS.plaza.lamp)),
      drawn(WORDS.strom, treeBox(PARTS.plaza.tree)),
      drawn(WORDS.oblak, [522, 29, 76, 31], [833, 42, 54, 22], [80, 31, 61, 25]),
      drawn(WORDS.fontana, [670, 164, 76, 88]),
      // For tapping only: the scenes here say where they are going, and nobody points there.
      { ...drawn(WORDS.kaviaren, [588, 182, 78, 60]), quiet: true },
      drawn(WORDS.lekaren, [320, 182, 142, 44]),
      drawn(WORDS.bicykel, [132, 220, 34, 22]),
      drawn(WORDS.kos, [190, 220, 20, 23]),
      drawn(
        { ...WORDS.stolik, english: "café table" },
        [590, 222, 32, 18],
        [630, 222, 32, 18],
      ),
      onSet(WORDS.pes, ["dog"], [480, 200, 60, 40]),
      onSet(WORDS.robot, ["robot"], [420, 120, 40, 110]),
    ],
    sounds: ["murmur", "birds", "tram"],
    set: PLAZA_SET,
  },
  registration: {
    ground: "stone",
    label: "At the front desk",
    outdoors: false,
    things: [
      drawn(WORDS.hodiny, clockBox(PARTS.registration.clock)),
      drawn(WORDS.stolicka, [270, 148, 40, 78], [312, 148, 40, 78], [354, 148, 40, 78]),
      drawn(WORDS.rastlina, [720, 108, 26, 36]),
      // The desk and what stands on it are the set's, at the cast's scale (StickSet.svelte).
      { ...drawn(WORDS.pult, [570, 188, 144, 90]), of: ["counter"] },
      { ...drawn(WORDS.pocitac, [664, 150, 36, 42]), of: ["counter-computer"] },
      { ...drawn(WORDS.zvoncek, [576, 194, 28, 18]), of: ["counter-bell"] },
      // A scene's own clipboard on the desk, there only while one is.
      onSet(WORDS.formular, ["form"], [610, 180, 20, 8]),
      drawn(WORDS.dvere, [192, 74, 64, 152], [866, 70, 80, 156]),
      drawn(WORDS.vesiak, [132, 86, 44, 144]),
      drawn(WORDS.nastenka, [272, 60, 124, 74]),
      drawn(WORDS.priecinky, [404, 88, 36, 44]),
      drawn(WORDS.vydajnik, [408, 140, 34, 88]),
      drawn(WORDS.plagat, [500, 10, 50, 62]),
      drawn(WORDS.napis, [592, 20, 118, 26]),
      // For tapping only: a line about keys means the ones handed over the desk.
      { ...drawn(WORDS.kluce, [652, 48, 92, 52]), quiet: true },
      { ...drawn(WORDS.sanony, [656, 106, 62, 28]), quiet: true },
    ],
    sounds: ["hum", "murmur"],
    staff: ["receptionist", "maria"],
    post: 560,
    set: REGISTRATION_SET,
  },
  street: {
    ground: "stone",
    label: "On the street, by the tram stop",
    outdoors: true,
    // Left of the tram's roof when it stands at the stop.
    sun: { day: { x: 255, y: 28 }, morning: { x: 250, y: 30 } },
    things: [
      drawn(
        WORDS.dom,
        [480, 80, 150, 146],
        [0, 76, 140, 150],
        [140, 50, 100, 176],
        [240, 82, 130, 144],
        [370, 48, 110, 178],
        [630, 52, 110, 174],
        [740, 84, 120, 142],
        [860, 50, 100, 176],
      ),
      drawn(WORDS.strom, treeBox(PARTS.street.tree)),
      drawn(WORDS.hodiny, clockBox(PARTS.street.clock)),
      drawn({ ...WORDS.lampa, english: "street lamp" }, lampBox(PARTS.street.lamp)),
      drawn(WORDS.zastavka, [200, 54, 160, 234], [384, 8, 54, 280]),
      drawn(WORDS.lavicka, benchBox(PARTS.street.bench)),
      drawn(WORDS.oblak, [120, 11, 61, 25], [577, 3, 46, 19]),
      // There to tap only while it stands at the stop (thingsIn); the cast watches it pull in rather than point.
      { ...drawn(WORDS.elektricka, TRAM_BOX), quiet: true },
      drawn({ ...WORDS.mapa, english: "city map" }, [218, 76, 48, 208]),
      drawn({ ...WORDS.tabula, english: "departure board" }, [274, 72, 62, 23]),
      drawn(WORDS.kos, [359, 250, 16, 36]),
    ],
    sounds: ["murmur"],
    set: STREET_SET,
  },
  studio: {
    ground: "carpet",
    label: "In the podcast studio",
    outdoors: false,
    things: [
      drawn(WORDS.dvere, [202, 38, 80, 188]),
      drawn(WORDS.hodiny, clockBox(PARTS.studio.clock)),
      // The desk and mics are drawn at the cast's scale (StudioDesk.svelte); these boxes are where they land on a wide stage.
      { ...drawn(WORDS.stol, [322, 208, 316, 70]), of: ["studio-desk"] },
      {
        ...drawn(WORDS.mikrofon, [423, 158, 28, 22]),
        of: ["studio-mic-0", "studio-mic-1", "studio-mic-2"],
      },
      { ...drawn(WORDS.rastlina, plantBox(PARTS.studio.plant)), of: ["plant"] },
      {
        ...drawn(WORDS.hrncek, [376, 186, 10, 12]),
        of: ["studio-mug-0", "studio-mug-1", "studio-mug-2"],
        ofKind: "cup",
      },
      onSet(WORDS.krhla, ["can"], [704, 222, 40, 24]),
      // A scene's own plate on the desk, there only while one is.
      onSet(WORDS.tanier, ["plate"], [600, 204, 30, 6]),
      onSet(WORDS.diktafon, ["recorder"], [500, 196, 8, 6]),
      {
        ...onSet(WORDS.sluchadla, ["headphones"], [420, 120, 16, 14]),
        // Worn, they are drawn on the head (StickHead), one id per wearer.
        of: ["headphones", ...LESSON_CHARACTER_IDS.map((id) => `headphones-on-${id}`)],
      },
      // On the shelf, for tapping only: a line about a book means one in someone's hands, not these.
      { ...drawn(WORDS.platna, [650, 30, 72, 54]), quiet: true },
      { ...drawn(WORDS.knihy, [652, 86, 40, 30]), quiet: true },
      { ...drawn(WORDS.polica, [648, 114, 104, 8]), quiet: true },
      drawn(WORDS.koberec, [226, 250, 508, 48]),
      drawn(WORDS.lampa, [362, 30, 36, 26], [562, 30, 36, 26]),
      drawn({ ...WORDS.napis, english: "on-air sign" }, [404, 26, 152, 38]),
      { ...drawn(WORDS.reproduktor, [700, 90, 18, 26]), quiet: true },
      { ...drawn(WORDS.notebook, [334, 178, 30, 26]), of: ["studio-laptop"] },
      { ...drawn(WORDS.mixpult, [460, 186, 40, 16]), of: ["studio-mixer"] },
      {
        ...drawn(WORDS.stolicka, [330, 150, 40, 76]),
        of: ["studio-chair-0", "studio-chair-1", "studio-chair-2"],
      },
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
        // Beside the pot on the far side, within the waterer's reach: the gap to the desk's end is where the waterer stands.
        {
          id: "can",
          kind: "can",
          start: { where: { on: "corner", dx: 15 }, fill: "water" },
        },
        { id: "plant", kind: "plant", start: { where: { on: "corner", dx: 0 } } },
      ],
      spots: {
        plant: { piece: "corner", dx: -21, facing: 1 },
        "desk-left": { chair: 0 },
        "desk-right": { chair: 1 },
        // The same door as the kitchen's: in on its latch side, then past it to push it to.
        door: { x: 260, facing: -1 },
        inside: { x: 218, facing: 1 },
      },
      door: "door",
    },
  },
};

/**
 * Props a learner can tap wherever the set draws one, in any place: a
 * phone out of the pocket, keys in a hand, a bag set down. Each has no
 * box of its own; it is measured where the set draws it, and is not there
 * to tap while it is out of sight in a pocket or a bag.
 */
export const PROP_THINGS: Readonly<Partial<Record<string, SceneThing>>> = {
  phone: { ...WORDS.telefon, box: { x: 0, y: 0, width: 0, height: 0 }, quiet: true },
  keys: { ...WORDS.kluce, box: { x: 0, y: 0, width: 0, height: 0 }, quiet: true },
  bag: { ...WORDS.taska, box: { x: 0, y: 0, width: 0, height: 0 }, quiet: true },
  // Held, or clipped on and walked: the home's own vodítko covers it on its peg.
  lead: { ...WORDS.voditko, box: { x: 0, y: 0, width: 0, height: 0 }, quiet: true },
  umbrella: { ...WORDS.dazdnik, box: { x: 0, y: 0, width: 0, height: 0 }, quiet: true },
  clipboard: { ...WORDS.papier, box: { x: 0, y: 0, width: 0, height: 0 }, quiet: true },
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

/**
 * The things a place shows in a mood: the sun only while it is out, and
 * where it is drawn; the couple outside home only by day; the tram only while it stands at the stop, and then
 * the houses only where they show past it.
 */
export function thingsIn(
  things: readonly SceneThing[],
  setting: StageSetting,
  mood: SceneMood,
  tram: TramState = "away",
): readonly SceneThing[] {
  const sun = sunIn(setting, mood);
  // "coming" is drawn at the stop too, eased in from the right over TRAM.ms (Street.svelte).
  const atStop = tram !== "away";
  return things.flatMap((thing) => {
    if (thing.id === "slnko") {
      return sun ? [{ ...thing, box: toBox([sun.x - 22, sun.y - 22, 44, 44]) }] : [];
    }
    if (thing.id === "elektricka") return atStop ? [thing] : [];
    if (
      setting === "home" &&
      OUT_IN_DAYLIGHT.has(thing.id) &&
      (isDark(mood.time) || mood.time === "morning")
    )
      return [];
    if (setting !== "street" || thing.id !== "dom" || !atStop) return [thing];
    const [box, ...more] = thingBoxes(thing).flatMap(pastTram);
    return box ? [{ ...thing, box, more }] : [];
  });
}

/** Home's window shows the couple on the street only by day, back from the shop, so not first thing (Home.svelte). */
const OUT_IN_DAYLIGHT = new Set(["muz", "zena"]);

/** The part of a box the stopped tram leaves in view: what lies left of its nose. */
function pastTram(box: ThingBox): ThingBox[] {
  const width = Math.min(box.width, TRAM_BOX[0] - box.x);
  return width > 10 ? [{ ...box, width }] : [];
}
