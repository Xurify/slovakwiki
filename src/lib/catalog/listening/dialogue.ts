import { markedText, type MarkedPart } from "$lib/learning/marked-text";
import type { DialogueTurn } from "$lib/learning/types";

/**
 * Writing a podcast line for the ear. A line is its parts: words, a marked
 * word, and directions to the voice that the text does not show. The clip
 * text is built from the same parts, so the text and the voice never drift.
 *
 * What Eleven v4 does with a direction, measured on the first episode:
 * - `[pause]` inside a line makes about a second of silence; at the start or
 *   end of a line it makes next to none. A wait before a line is the player's
 *   job (`afterThinking`).
 * - An ellipsis is read as trailing off, and a line directed `[slowly]` came
 *   out as a drawn-out whisper. Put `STOP` where the text trails off, and
 *   never direct a line slowly: the pauses set the pace.
 * - `[sighs]` before the words is heard as a sigh, and Scribe hears the words
 *   alone. Say how every directed line should feel, and listen back to it.
 */

/** A direction to the voice, not shown in the text. */
export interface Direction {
  readonly tag: "chuckles" | "pause" | "sighs" | "yawns";
}

/** A beat of silence in the clip, where the speaker thinks or lets a clue sink in. */
export const PAUSE: Direction = { tag: "pause" };
/** A sigh before the words: fond exasperation, as when Marek has lost the keys again. */
export const SIGH: Direction = { tag: "sighs" };
/** A chuckle before the words: Anna keeping the cake's hiding place to herself. */
export const CHUCKLE: Direction = { tag: "chuckles" };
/** A yawn before the words: still half asleep. The stage acts each of these three out too. */
export const YAWN: Direction = { tag: "yawns" };
/** Words trailing off in the text, a full stop in the clip; the beat comes from the PAUSE after it. */
export const STOP = { said: ". ", shown: "… " } as const;
/** The listener gets this long to decide before the answer comes. */
export const THINK_MS = 2000;

export type Part = string | Exclude<MarkedPart, string> | Direction | typeof STOP;

export interface LineOptions {
  /** A gesture per sentence on the stage, where the one read from the words is wrong. */
  gestures?: DialogueTurn["gestures"];
  /** What the speaker holds per sentence on the stage, where the words would pick wrong. */
  props?: DialogueTurn["props"];
  /** Who it is said to, when that is not who it replies to. */
  to?: string;
  /** The phone rings or pings before the line; on a call the speaker answers. */
  ring?: DialogueTurn["ring"];
  /** Said at the far end of a call. */
  overPhone?: boolean;
}

/** The lines of one episode, their ids under `prefix`. */
export function lineWriter(prefix: string) {
  return function line(
    id: string,
    speaker: string,
    parts: Part[],
    english: string,
    { gestures, overPhone, props, ring, to }: LineOptions = {},
  ): DialogueTurn {
    const marked = markedText(
      parts.flatMap((part): MarkedPart[] =>
        typeof part === "string"
          ? [part]
          : "tag" in part
            ? []
            : "shown" in part
              ? [part.shown]
              : [part],
      ),
    );
    const said = parts
      .map((part) =>
        typeof part === "string"
          ? part
          : "tag" in part
            ? `[${part.tag}] `
            : "shown" in part
              ? part.said
              : part.text,
      )
      .join("");

    return {
      id: `${prefix}${id}`,
      speaker,
      slovak: marked.text,
      marks: marked.marks,
      english,
      ...(said !== marked.text ? { audio: { transcript: said } } : {}),
      ...(gestures ? { gestures } : {}),
      ...(props ? { props } : {}),
      ...(to ? { to } : {}),
      ...(ring ? { ring } : {}),
      ...(overPhone ? { overPhone } : {}),
    };
  };
}

/** The answer to a question put to the listener: the player waits before it. */
export function afterThinking(turn: DialogueTurn): DialogueTurn {
  return { ...turn, wait: THINK_MS };
}

/** A guess at something not yet shown: none of the speaker's sentences brings a prop out. */
export function guess(sentences: number): null[] {
  return Array.from({ length: sentences }, () => null);
}
