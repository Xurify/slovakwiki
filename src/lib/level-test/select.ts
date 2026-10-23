import { AREA_TARGET, areaForTag } from "./areas";
import { itemsOfFormat, pickNearest } from "./plan";
import type {
  AdaptiveFormat,
  AdaptiveItem,
  FillBlankItem,
  ListenLengthItem,
  ListenSelectItem,
  ReadSelectItem,
  StudyArea,
} from "./types";

export const LISTEN_SELECT_GRID = 6;

/**
 * Read and Select draws real words and pseudowords from the same difficulty
 * region. Picks the kind at random but never lets one kind run two ahead, so a
 * learner who answers "no" to everything cannot score well.
 */
export function pickReadSelect(
  items: readonly AdaptiveItem[],
  target: number,
  used: ReadonlySet<string>,
  balance: number,
  random: () => number,
  seen?: ReadonlySet<string>,
): ReadSelectItem | undefined {
  const pool = itemsOfFormat(items, "readSelect");
  const wantReal = balance >= 2 ? false : balance <= -2 ? true : random() < 0.5;
  return (
    pickNearest(
      pool.filter((item) => item.real === wantReal),
      target,
      used,
      random,
      4,
      seen,
    ) ?? pickNearest(pool, target, used, random, 4, seen)
  );
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap] as T, copy[index] as T];
  }
  return copy;
}

/** A grid of sounds near the target: half real words, half pseudowords, shuffled. */
export function pickListenSelect(
  items: readonly AdaptiveItem[],
  target: number,
  used: ReadonlySet<string>,
  random: () => number,
  seen?: ReadonlySet<string>,
): ListenSelectItem[] {
  const pool = itemsOfFormat(items, "listenSelect");
  const taken = new Set(used);
  const picked: ListenSelectItem[] = [];

  for (let index = 0; index < LISTEN_SELECT_GRID; index++) {
    const wantReal = index % 2 === 0;
    const item =
      pickNearest(
        pool.filter((entry) => entry.real === wantReal),
        target,
        taken,
        random,
        6,
        seen,
      ) ?? pickNearest(pool, target, taken, random, 6, seen);
    if (!item) break;
    taken.add(item.id);
    picked.push(item);
  }

  return shuffle(picked, random);
}

export const LISTEN_LENGTH_GRID = 6;

/**
 * Six clips near the target, each from a different pair so the learner never
 * hears both words of one pair and compares them; half short, half long.
 */
export function pickListenLength(
  items: readonly AdaptiveItem[],
  target: number,
  used: ReadonlySet<string>,
  random: () => number,
  seen?: ReadonlySet<string>,
): ListenLengthItem[] {
  const pool = itemsOfFormat(items, "listenLength");
  const taken = new Set(used);
  const picked: ListenLengthItem[] = [];

  for (let index = 0; index < LISTEN_LENGTH_GRID; index++) {
    const wantLong = index % 2 === 0;
    const item = pickNearest(
      pool.filter((entry) => (entry.word === entry.long) === wantLong),
      target,
      taken,
      random,
      6,
      seen,
    );
    if (!item) break;
    for (const entry of pool) {
      if (entry.short === item.short) taken.add(entry.id);
    }
    picked.push(item);
  }

  return shuffle(picked, random);
}

export function pickAdaptiveItem(
  items: readonly AdaptiveItem[],
  format: Exclude<AdaptiveFormat, "readSelect" | "listenSelect">,
  target: number,
  used: ReadonlySet<string>,
  random: () => number,
  seen?: ReadonlySet<string>,
): AdaptiveItem | undefined {
  return pickNearest(itemsOfFormat(items, format), target, used, random, 4, seen);
}

/**
 * How far from the target (scale points, about a CEFR half-band) Fill in the
 * Blanks may reach for a word class still short of evidence.
 */
const FILL_BLANK_REACH = 12;

/**
 * Natural text is mostly nouns and verbs, so a C-test alone leaves adjectives
 * with two or three answers. Among the items close to the target, Fill in the
 * Blanks picks the word class furthest below its share of evidence.
 */
export function pickFillBlank(
  items: readonly AdaptiveItem[],
  target: number,
  used: ReadonlySet<string>,
  coverage: ReadonlyMap<StudyArea, number>,
  random: () => number,
  seen?: ReadonlySet<string>,
): FillBlankItem | undefined {
  const near = itemsOfFormat(items, "fillBlank").filter(
    (item) =>
      !used.has(item.id) && Math.abs(item.difficulty - target) <= FILL_BLANK_REACH,
  );

  let neediest: StudyArea | undefined;
  let deficit = 0;
  for (const item of near) {
    const area = areaForTag(item.tag);
    const short = AREA_TARGET - (coverage.get(area) ?? 0);
    if (short > deficit) {
      deficit = short;
      neediest = area;
    }
  }

  const pool = neediest
    ? near.filter((item) => areaForTag(item.tag) === neediest)
    : itemsOfFormat(items, "fillBlank");
  return pickNearest(pool, target, used, random, 4, seen);
}

/** The set closest to the target, preferring one the learner has not seen. */
export function pickClosestSet<T extends { id: string; difficulty: number }>(
  sets: readonly T[],
  target: number,
  random: () => number,
  seen?: ReadonlySet<string>,
): T | undefined {
  return pickNearest(sets, target, new Set(), random, 1, seen);
}
