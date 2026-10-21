import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
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
 * cakes the scenes point at are.
 */
const BACKDROP_ALIGN: Partial<Record<LessonSceneArtId, number>> = { cafe: 1 };

export function backdropAlign(setting: LessonSceneArtId): number {
  return BACKDROP_ALIGN[setting] ?? 0.5;
}

/** Something drawn in a backdrop that a line can name and a figure can point at. */
export interface SceneThing {
  id: string;
  /** Folded stems that name it in any case: `kolac` catches koláč, koláča, koláčom. */
  stems: string[];
  /** Its nominative, for notes in the lab. */
  word: string;
  /** Its middle in the backdrop. */
  x: number;
  y: number;
}

export const SCENE_THINGS: Partial<Record<LessonSceneArtId, readonly SceneThing[]>> = {
  cafe: [
    { id: "kolac", stems: ["kolac"], word: "koláč", x: 822, y: 128 },
    { id: "torta", stems: ["tort"], word: "torta", x: 918, y: 64 },
  ],
};

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
    const folded = foldLine(word);
    const thing = things.find((candidate) =>
      candidate.stems.some((stem) => folded.startsWith(stem)),
    );
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
