import type { DialogueTurn } from "$lib/learning/types";

/** The listener's pick at each asking line, by line id. */
export type Picks = Readonly<Record<string, string>>;

/** The path of an ask the listener left to the host, who gets it right. */
export const NO_PICK = "none";

export function pathPick(picks: Picks, askId: string): string {
  return picks[askId] ?? NO_PICK;
}

function asks(lines: readonly DialogueTurn[]): DialogueTurn[] {
  return lines.filter((line) => line.ask);
}

/** How many of the segment's asks the path answers right. */
export function pathScore(lines: readonly DialogueTurn[], picks: Picks): number {
  return asks(lines).filter((line) => {
    const pick = pathPick(picks, line.id);
    return pick === NO_PICK || pick === line.ask!.answerId;
  }).length;
}

export function onPath(
  line: DialogueTurn,
  lines: readonly DialogueTurn[],
  picks: Picks,
): boolean {
  const when = line.when;
  if (!when) return true;
  if ("ask" in when) return when.picks.includes(pathPick(picks, when.ask));
  const helped = asks(lines).some((ask) => ask.id in picks);
  if ("unaided" in when) return !helped;
  return helped && when.score.includes(pathScore(lines, picks));
}

/** The next line on the path after `index`, or undefined at the end. */
export function nextOnPath(
  lines: readonly DialogueTurn[],
  picks: Picks,
  index: number,
): number | undefined {
  for (let next = index + 1; next < lines.length; next += 1) {
    if (onPath(lines[next]!, lines, picks)) return next;
  }
  return undefined;
}

/** The previous line on the path before `index`, or undefined at the start. */
export function prevOnPath(
  lines: readonly DialogueTurn[],
  picks: Picks,
  index: number,
): number | undefined {
  for (let prev = index - 1; prev >= 0; prev -= 1) {
    if (onPath(lines[prev]!, lines, picks)) return prev;
  }
  return undefined;
}

/** The asking line whose card shows: held for an answer, or answered until the next ask. */
export function cardAt(
  lines: readonly DialogueTurn[],
  picks: Picks,
  cursor: number,
  held: boolean,
): number {
  if (held) return lines[cursor]?.ask ? cursor : -1;
  // From the current line: in the beat after a pick the cursor is still on the ask.
  for (let index = cursor; index >= 0; index -= 1) {
    const line = lines[index]!;
    if (line.ask) return picks[line.id] ? index : -1;
  }
  return -1;
}
