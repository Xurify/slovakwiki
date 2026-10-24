import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { AmbienceLayer } from "./ambience";
import { PARTS, benchBox, clockBox, lampBox, plantBox, treeBox } from "./backdrop-parts";
import type { Point } from "./rig";
import { isFair, type SceneMood } from "./scene-mood";
import type { StageSetting } from "./stage-setting";
import {
  THING_WORDS as WORDS,
  drawn,
  toBox,
  twins,
  type SceneThing,
  type ThingBox,
} from "./thing-words";

/** A room window's glass, inside its frame and sill: an arched one is round at the top. */
export interface Glass extends ThingBox {
  arch?: boolean;
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
  /** Everyone on stage wears headphones here, as podcast hosts do. */
  headphones?: boolean;
  /** Where rain and grey show indoors, and the way rain is heard; a room without one stays quiet. */
  glass?: Glass;
}

/** The park's afternoon sun, which a line can point at and Find it can ask for. */
const PARK_SUN = { x: 562, y: 36 };

export const PLACES: Readonly<Record<StageSetting, Place>> = {
  cafe: {
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
  },
  classroom: {
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
  },
  default: {
    label: "In the park by the Danube",
    outdoors: true,
    sun: { day: PARK_SUN, morning: { x: 370, y: 46 } },
    things: [
      drawn(WORDS.hrad, [632, 34, 96, 78]),
      drawn(WORDS.kopec, [520, 84, 440, 110]),
      drawn(WORDS.rieka, [0, 194, 960, 18]),
      drawn(WORDS.strom, [836, 86, 84, 140], [52, 88, 88, 136]),
      drawn(WORDS.oblak, [212, 33, 76, 29], [446, 27, 48, 19]),
      drawn(WORDS.slnko, [PARK_SUN.x - 22, PARK_SUN.y - 22, 44, 44]),
    ],
    sounds: ["birds", "wind"],
  },
  home: {
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
      drawn(WORDS.rastlina, plantBox(PARTS.home.plant)),
    ],
    sounds: ["hum"],
    // Left of the bag on the rug, so nobody stands on it.
    post: 360,
    glass: { height: 100, width: 130, x: 106, y: 54 },
  },
  market: {
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
  },
  plaza: {
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
  },
  registration: {
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
  },
  street: {
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
  },
  studio: {
    label: "In the podcast studio",
    outdoors: false,
    things: [
      drawn(WORDS.dvere, [246, 40, 82, 186]),
      drawn(WORDS.hodiny, clockBox(PARTS.studio.clock)),
      drawn(WORDS.stol, [450, 204, 60, 86], [24, 156, 180, 70]),
      drawn(WORDS.pocitac, [56, 116, 68, 44]),
      drawn(WORDS.sluchadla, [128, 130, 52, 30]),
      drawn(WORDS.mikrofon, [429, 120, 34, 22], [497, 120, 34, 22]),
      drawn(WORDS.okno, [660, 52, 140, 108]),
      drawn(WORDS.reproduktor, [832, 140, 40, 86]),
      drawn(WORDS.rastlina, plantBox(PARTS.studio.plant)),
      drawn(WORDS.koberec, [210, 252, 540, 40]),
    ],
    sounds: ["hum"],
    // Podcast hosts talk into their own mics, headphones on.
    atMarks: true,
    headphones: true,
    glass: { height: 94, width: 126, x: 667, y: 59 },
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
