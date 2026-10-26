import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { lineProps, propForSentence, type StickPropId } from "./props";
import { foldLine, lineSentences, lineWords, mentions } from "./slovak-text";
import { thingNamed, type SceneThing } from "./thing-words";

export interface StageLine {
  /** Null when nobody on stage says it: a notice, the narrator. */
  characterId: LessonCharacterId | null;
  /** Per-sentence prop overrides, as on the lesson line; `undefined` reads the words. */
  props?: ReadonlyArray<StickPropId | null | undefined>;
  slovak: string;
  /** Keeps their place after a goodbye: the host of a scene that goes on without the other. */
  stays?: boolean;
  /** Who it is said to, when that is not the person it replies to. */
  to?: LessonCharacterId;
  /** The phone rings or pings before the line; on a call the speaker answers, on a dial they made it. */
  ring?: "call" | "dial" | "message";
  /** Said at the far end of a call, by someone not on stage. */
  overPhone?: boolean;
}

/** A line as the direction reads it, once: its words, who it is said to, what passes hands. */
export interface ReadLine {
  /** Who it is said to: its `to`, else the person it replies to, else the next to speak. */
  addressee: LessonCharacterId | null;
  characterId: LessonCharacterId | null;
  /** Who the speaker hands what they hold to as the line ends. */
  gives?: LessonCharacterId;
  /** The prop each sentence brings out. */
  props: Array<StickPropId | undefined>;
  sentences: string[];
  /** Who holds up what the speaker is looking at. */
  shownBy?: LessonCharacterId;
  slovak: string;
  stays?: boolean;
  /** Whose prop the speaker takes as the line starts. */
  takes?: LessonCharacterId;
  /** The whole line, folded, word by word. */
  words: string[];
}

/** Folded words asking whose something is. */
const WHOSE = ["ci", "cia", "cie", "cieho", "ciu", "cej", "cim"];
/** Folded words claiming it: môj, moja, moje, moji. */
const MINE = ["moj", "moja", "moje", "moji"];
/** Folded phrases that hand over what the speaker holds. */
const GIVING = ["nech sa paci", "pre teba", "pre vas", "tu mas", "tu mate"];

/**
 * The author's props for each sentence, and `null` where the word that
 * would bring one out names something drawn in the scene instead: at home
 * "Je v tej taške." points at the bag on the floor.
 */
function propsBesides(
  line: StageLine,
  things: readonly SceneThing[],
): Array<StickPropId | null | undefined> {
  return lineSentences(line.slovak).map((sentence, index) => {
    const authored = line.props?.[index];
    if (authored !== undefined) return authored;

    const drawn = lineWords(sentence).some(
      (word) => propForSentence(word) && thingNamed(foldLine(word), things),
    );
    return drawn ? null : undefined;
  });
}

/**
 * Who a line is said to: the person it replies to, else the next one to
 * speak. A line's `to` wins, for turns like ordering from a waiter who has
 * not spoken yet.
 */
function addresseeOf(
  lines: readonly StageLine[],
  index: number,
): LessonCharacterId | null {
  const speaker = lines[index]?.characterId;
  if (!speaker) return null;

  const to = lines[index].to;
  if (to && to !== speaker) return to;

  const other = (line: StageLine) =>
    line.characterId !== null && line.characterId !== speaker;
  const replyTo = lines.slice(0, index).findLast(other);
  const next = lines.slice(index + 1).find(other);
  return replyTo?.characterId ?? next?.characterId ?? null;
}

/**
 * Whose prop the speaker takes: one held up while its holder asked whose it
 * is ("Čie sú tie kľúče?"), answered with "moje".
 */
function takesFrom(
  lines: readonly ReadLine[],
  index: number,
): LessonCharacterId | undefined {
  const line = lines[index];
  const previous = lines[index - 1];
  if (!line.characterId || !previous?.characterId) return undefined;
  if (previous.characterId === line.characterId) return undefined;

  const asked = previous.words.some((word) => WHOSE.includes(word));
  const claims = line.words.some((word) => MINE.includes(word));
  const holding = lines
    .slice(0, index)
    .some(
      (earlier) =>
        earlier.characterId === previous.characterId && earlier.props.some(Boolean),
    );

  return asked && claims && holding ? previous.characterId : undefined;
}

/**
 * Who the speaker hands what they hold to as the line ends: the one spoken
 * to, when they are on stage, on "Nech sa páči." or "A to jablko je pre
 * teba.", once the speaker has brought something out.
 */
function givesTo(
  lines: readonly ReadLine[],
  index: number,
  cast: readonly LessonCharacterId[],
): LessonCharacterId | undefined {
  const { addressee, characterId, sentences } = lines[index];
  if (!characterId || !addressee || !cast.includes(addressee)) return undefined;
  if (!sentences.some((sentence) => mentions(sentence, GIVING))) return undefined;

  const holding = lines
    .slice(0, index + 1)
    .some(
      (earlier) => earlier.characterId === characterId && earlier.props.some(Boolean),
    );
  return holding ? addressee : undefined;
}

/**
 * Who holds up what the speaker is looking at: the person they are talking
 * with, who showed it to them with nobody else speaking since, unless they
 * handed it over.
 */
function shownBy(
  lines: readonly ReadLine[],
  index: number,
): LessonCharacterId | undefined {
  const speaker = lines[index].characterId;
  let partner: LessonCharacterId | undefined;

  for (let at = index - 1; at >= 0; at -= 1) {
    const { addressee, characterId, gives, props } = lines[at];
    if (!characterId || characterId === speaker) continue;

    partner ??= characterId;
    if (characterId !== partner) return undefined;
    if (props.some(Boolean) && addressee === speaker) {
      return gives === speaker ? undefined : partner;
    }
  }

  return undefined;
}

/**
 * Reads every line once for the direction. `cast` is who is on stage, so
 * nothing is handed to someone who is not; `things` are what the backdrop
 * draws, so a word naming one of them brings out no prop.
 */
export function readLines(
  lines: readonly StageLine[],
  cast: readonly LessonCharacterId[],
  things: readonly SceneThing[] = [],
): ReadLine[] {
  const read: ReadLine[] = lines.map((line, index) => ({
    addressee: addresseeOf(lines, index),
    characterId: line.characterId,
    props: lineProps(line.slovak, propsBesides(line, things)),
    sentences: lineSentences(line.slovak),
    slovak: line.slovak,
    stays: line.stays,
    words: foldLine(line.slovak).split(" "),
  }));

  read.forEach((line, index) => {
    line.takes = takesFrom(read, index);
    line.gives = givesTo(read, index, cast);
    line.shownBy = shownBy(read, index);
  });
  return read;
}
