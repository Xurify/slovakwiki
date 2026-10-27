import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";

/**
 * What tells a character apart beyond the shapes of their hair and clothes,
 * which StickFigure and StickTorso draw: the colours they wear and the
 * small things a glance picks up.
 */
/** What their steps sound like: heels click on a hard floor, soft soles (trainers) land dull, servos tick; the rest are plain shoes. */
export type Shoes = "heels" | "soft" | "servo";

export interface Look {
  /** The top of the hair (a bare head's crown, a robot's antenna light) in the head's 64-unit space, where a headband sits. */
  crown: number;
  /** Shows beside short hair; long hair covers it. */
  ear?: boolean;
  blush?: boolean;
  glasses?: boolean;
  /** Grey hair and brows instead of dark. */
  grey?: boolean;
  /** The name on the dialogue box, in the colour the figure wears. */
  nameClass?: string;
  /**
   * A screen for a face and joints at the knees and elbows: the eyes and an
   * open mouth in `eyes`, the closed mouth in `smile`, the antenna's `light`
   * and the one on the chest. A `metal` one is a household machine rather
   * than a companion like the guide: a grey box of a head with a visor,
   * rivets and metal limbs, so it never reads as the narrator.
   */
  robot?: { chest: string; eyes: string; light: string; metal?: boolean; smile: string };
  /**
   * Four legs and a tail instead of the rig: the coat (and the coat as a
   * stroke, for the tail), the ears and patch in `patch`, and the collar.
   */
  dog?: { coat: string; collar: string; patch: string; tail: string };
  /** Wrapped round the neck in the snow, in a colour that stands off the outfit. */
  scarfClass?: string;
  shoes?: Shoes;
  /** How long each step takes against the usual: two people walking together never step as one. */
  gait?: number;
  /** Over the ink arm. `reach` runs along it: 1 ends at the elbow, 2 at the wrist. */
  sleeve?: { class: string; reach: number };
}

export const LOOKS: Readonly<Record<LessonCharacterId, Look>> = {
  alex: {
    gait: 1.02,
    shoes: "soft",
    crown: 7.6,
    ear: true,
    nameClass: "text-blue-700",
    scarfClass: "fill-scene-honey",
    sleeve: { class: "stroke-scene-blue", reach: 1.85 },
  },
  anna: {
    gait: 0.92,
    crown: 7.6,
    blush: true,
    nameClass: "text-rose-700",
    scarfClass: "fill-scene-sage",
    sleeve: { class: "stroke-scene-red", reach: 1.6 },
  },
  // The loudspeaker: a companion robot like the guide, in the tram's green.
  announcer: {
    crown: 6.3,
    robot: {
      chest: "fill-scene-green-mid",
      eyes: "fill-emerald-300",
      light: "fill-scene-green-mid",
      smile: "stroke-emerald-300",
    },
  },
  // Robo's charge: a sandy dog with darker ears, so he never passes for Dunčo.
  bobik: {
    crown: 18,
    nameClass: "text-amber-800",
    dog: {
      coat: "fill-scene-sand",
      collar: "stroke-scene-red",
      patch: "fill-scene-wood",
      tail: "stroke-scene-sand",
    },
  },
  // Marek's dog: a tan mutt with brown ears and a red collar, small beside the cast.
  dog: {
    crown: 14,
    nameClass: "text-amber-800",
    dog: {
      coat: "fill-scene-wood",
      collar: "stroke-scene-red",
      patch: "fill-scene-potato",
      tail: "stroke-scene-wood",
    },
  },
  guide: {
    crown: 6.3,
    robot: {
      chest: "fill-sky-400",
      eyes: "fill-sky-400",
      light: "fill-scene-red",
      smile: "stroke-sky-400",
    },
  },
  lucia: {
    gait: 0.97,
    crown: 5.8,
    blush: true,
    ear: true,
    nameClass: "text-emerald-700",
    scarfClass: "fill-scene-clay",
    sleeve: { class: "stroke-scene-green", reach: 0.6 },
  },
  marek: {
    gait: 1.06,
    crown: 5.4,
    ear: true,
    nameClass: "text-slate-700",
    scarfClass: "fill-scene-clay",
    sleeve: { class: "stroke-portrait-vest", reach: 1.85 },
  },
  maria: {
    gait: 1.16,
    shoes: "heels",
    crown: 3.5,
    glasses: true,
    grey: true,
    nameClass: "text-rose-700",
    scarfClass: "fill-scene-blue",
    sleeve: { class: "stroke-scene-red", reach: 1.85 },
  },
  narrator: {
    crown: 13.8,
    robot: {
      chest: "fill-scene-red-mid",
      eyes: "fill-scene-pale",
      light: "fill-scene-red-mid",
      smile: "stroke-scene-pale",
    },
  },
  receptionist: {
    shoes: "heels",
    crown: 11.1,
    ear: true,
    nameClass: "text-blue-700",
    scarfClass: "fill-scene-honey",
    sleeve: { class: "stroke-scene-blue", reach: 1.85 },
  },
  // Marek's home robot: a companion like the guide, in warm orange so the two never pass for one.
  robo: {
    gait: 0.85,
    shoes: "servo",
    crown: 7,
    nameClass: "text-orange-700",
    robot: {
      chest: "fill-scene-carrot",
      eyes: "fill-scene-honey",
      light: "fill-scene-carrot",
      metal: true,
      smile: "stroke-scene-honey",
    },
  },
  // Marek's home robot: the guide's chassis in honey, so it is not mistaken for the guide.
  robot: {
    gait: 0.85,
    shoes: "servo",
    crown: 6.3,
    nameClass: "text-amber-800",
    robot: {
      chest: "fill-scene-carrot",
      eyes: "fill-amber-300",
      light: "fill-scene-carrot",
      smile: "stroke-amber-300",
    },
  },
  waiter: {
    crown: 8.6,
    ear: true,
    nameClass: "text-slate-700",
    scarfClass: "fill-scene-clay",
    sleeve: { class: "stroke-portrait-bib", reach: 1.85 },
  },
};
