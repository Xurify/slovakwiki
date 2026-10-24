import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";

/**
 * What tells a character apart beyond the shapes of their hair and clothes,
 * which StickFigure and StickTorso draw: the colours they wear and the
 * small things a glance picks up.
 */
/** What their steps sound like: heels click on a hard floor, soft soles (trainers) land dull; the rest are plain shoes. */
export type Shoes = "heels" | "soft";

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
   * and the one on the chest.
   */
  robot?: { chest: string; eyes: string; light: string; smile: string };
  /** Wrapped round the neck in the snow, in a colour that stands off the outfit. */
  scarfClass?: string;
  shoes?: Shoes;
  /** Over the ink arm. `reach` runs along it: 1 ends at the elbow, 2 at the wrist. */
  sleeve?: { class: string; reach: number };
}

export const LOOKS: Readonly<Record<LessonCharacterId, Look>> = {
  alex: {
    shoes: "soft",
    crown: 7.6,
    ear: true,
    nameClass: "text-blue-700",
    scarfClass: "fill-scene-honey",
    sleeve: { class: "stroke-blue-600", reach: 1.85 },
  },
  anna: {
    crown: 6.4,
    blush: true,
    nameClass: "text-rose-700",
    scarfClass: "fill-scene-sage",
    sleeve: { class: "stroke-rose-500", reach: 1.6 },
  },
  // The loudspeaker: a companion robot like the guide, in the tram's green.
  announcer: {
    crown: 6.3,
    robot: {
      chest: "fill-emerald-400",
      eyes: "fill-emerald-300",
      light: "fill-emerald-400",
      smile: "stroke-emerald-300",
    },
  },
  guide: {
    crown: 6.3,
    robot: {
      chest: "fill-sky-400",
      eyes: "fill-sky-400",
      light: "fill-rose-500",
      smile: "stroke-sky-400",
    },
  },
  lucia: {
    crown: 5.8,
    blush: true,
    ear: true,
    nameClass: "text-emerald-700",
    scarfClass: "fill-scene-clay",
    sleeve: { class: "stroke-emerald-600", reach: 0.6 },
  },
  marek: {
    crown: 8.7,
    ear: true,
    nameClass: "text-slate-700",
    scarfClass: "fill-scene-clay",
    sleeve: { class: "stroke-portrait-vest", reach: 1.85 },
  },
  maria: {
    shoes: "heels",
    crown: 3.5,
    glasses: true,
    grey: true,
    nameClass: "text-rose-700",
    scarfClass: "fill-blue-600",
    sleeve: { class: "stroke-rose-500", reach: 1.85 },
  },
  narrator: {
    crown: 13.8,
    robot: {
      chest: "fill-rose-400",
      eyes: "fill-rose-300",
      light: "fill-rose-400",
      smile: "stroke-rose-300",
    },
  },
  receptionist: {
    shoes: "heels",
    crown: 11.1,
    ear: true,
    nameClass: "text-blue-700",
    scarfClass: "fill-scene-honey",
    sleeve: { class: "stroke-blue-600", reach: 1.85 },
  },
  waiter: {
    crown: 8.6,
    ear: true,
    nameClass: "text-slate-700",
    scarfClass: "fill-scene-clay",
    sleeve: { class: "stroke-portrait-bib", reach: 1.85 },
  },
};
