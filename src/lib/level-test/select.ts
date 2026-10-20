import { itemsOfFormat, pickNearest } from "./plan";
import type {
  AdaptiveFormat,
  AdaptiveItem,
  ListenSelectItem,
  ReadSelectItem,
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
): ReadSelectItem | undefined {
  const pool = itemsOfFormat(items, "readSelect");
  const wantReal = balance >= 2 ? false : balance <= -2 ? true : random() < 0.5;
  return (
    pickNearest(
      pool.filter((item) => item.real === wantReal),
      target,
      used,
      random,
    ) ?? pickNearest(pool, target, used, random)
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
      ) ?? pickNearest(pool, target, taken, random, 6);
    if (!item) break;
    taken.add(item.id);
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
): AdaptiveItem | undefined {
  return pickNearest(itemsOfFormat(items, format), target, used, random);
}

export function pickClosestSet<T extends { id: string; difficulty: number }>(
  sets: readonly T[],
  target: number,
): T | undefined {
  return [...sets].sort(
    (a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target),
  )[0];
}
