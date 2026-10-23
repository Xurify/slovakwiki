import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import { foldLine } from "./line-gesture";
import { lineSentences, lineWords, wordSentences } from "./line-plan";
import { lineProps, type StickPropId } from "./props";
import { linePoints, type ShownProp } from "./scene-points";
import { thingNamed, type SceneThing } from "./thing-words";

/** 1 faces right (+x), -1 faces left. */
export type Facing = 1 | -1;

export type CastFacing = Partial<Record<LessonCharacterId, Facing>>;

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
}

export interface StageReaction {
  characterId: LessonCharacterId;
  gesture: StickGestureId;
  /** The sentence of the line it answers… */
  sentence: number;
  /** …and how far into it: 0 its start, 1 its end. */
  at: number;
}

export interface LineStaging {
  addressee: LessonCharacterId | null;
  /** Where each figure faces while the line plays; figures left out keep theirs. */
  facing: CastFacing;
  /** Silent gestures from the one spoken to. */
  reactions: StageReaction[];
  /** The one spoken to walks up to the speaker, who shows them something or calls them over. */
  approach?: { characterId: LessonCharacterId; toward: Facing };
  /** Which way the speaker turns and walks off once their last line, a goodbye, ends. */
  exit?: Facing;
  /** Someone who walks on from that side during this line, to say hello next. */
  enter?: { characterId: LessonCharacterId; from: Facing };
  /** Who the speaker hands what they hold to as the line ends. */
  gives?: LessonCharacterId;
  /** Who holds up what the speaker is looking at. */
  looksAt?: LessonCharacterId;
  /** The thing everyone on stage walks over to during this line: "Poďme na zastávku." */
  goTo?: string;
  /** The tram pulls in from the right during this line, and everyone turns to watch it. */
  arrives?: "tram";
  /** Everyone walks to the tram's door as this line ends. */
  boards?: boolean;
}

/** Folded sentence openers the one spoken to nods at. */
const NOD_AT = ["dakujem", "dakujeme", "vdaka", "tesi ma", "prepacte", "prepac"];
/** Folded phrases that end someone's part in a scene: goodbyes, or going to fetch the order. */
const LEAVING = [
  "dovidenia",
  "do videnia",
  "maj sa",
  "majte sa",
  "zbohom",
  "dobru noc",
  "pekny den",
  "hned to bude",
  "hned som spat",
  "musim ist",
];
/** Folded phrases that call the one spoken to over. */
const COME_OVER = ["pod dalej", "podte dalej", "pod sem", "podte sem"];
/** Folded openers that take everyone along to a thing the line names. */
const COME_ALONG = ["podme", "podte"];
/** Folded phrases that say the tram is pulling in; only a street with a stop has one. */
const TRAM_COMING = ["uz ide", "uz prichadza", "tu je elektricka"];
/** Folded phrases for getting on it. */
const BOARDING = ["nastupme", "nastupte", "nastup", "nastupime"];
/** Folded words asking whose something is. */
const WHOSE = ["ci", "cia", "cie", "cieho", "ciu", "cej", "cim"];
/** Folded words claiming it: môj, moja, moje, moji. */
const MINE = ["moj", "moja", "moje", "moji"];
/** Folded phrases that hand over what the speaker holds. */
const GIVING = ["nech sa paci", "pre teba", "pre vas", "tu mas", "tu mate"];

/** Folded openers of someone arriving. */
const GREETINGS = [
  "ahoj",
  "cau",
  "dobry den",
  "dobry vecer",
  "dobre rano",
  "vitajte",
  "vitaj",
  "zdravim",
  "nazdar",
];

function opensWith(sentence: string, openers: string[]): boolean {
  const folded = foldLine(sentence);
  return openers.some((opener) => folded === opener || folded.startsWith(`${opener} `));
}

function mentions(sentence: string, phrases: string[]): boolean {
  const folded = ` ${foldLine(sentence)} `;
  return phrases.some((phrase) => folded.includes(` ${phrase} `));
}

/** Where the line takes everyone: the last thing it names, when it says "Poďme" or "Poď!". */
function destination(line: StageLine, things: readonly SceneThing[]): string | undefined {
  const along = lineSentences(line.slovak).some(
    (sentence) => opensWith(sentence, COME_ALONG) || foldLine(sentence) === "pod",
  );
  if (!along) return undefined;

  return lineWords(line.slovak)
    .map((word) => thingNamed(foldLine(word), things))
    .findLast(Boolean)?.id;
}

function tramComing(line: StageLine): boolean {
  return lineSentences(line.slovak).some((sentence) => mentions(sentence, TRAM_COMING));
}

function toward(
  cast: readonly LessonCharacterId[],
  from: LessonCharacterId,
  to: LessonCharacterId,
): Facing {
  return cast.indexOf(to) > cast.indexOf(from) ? 1 : -1;
}

/** Before anyone speaks, each figure faces the middle of the stage. */
export function restFacing(cast: readonly LessonCharacterId[]): CastFacing {
  return Object.fromEntries(
    cast.map((id, index) => [id, index < cast.length / 2 ? 1 : -1]),
  );
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

function greets(line: StageLine | undefined): boolean {
  const first = line ? lineSentences(line.slovak)[0] : undefined;
  return first !== undefined && opensWith(first, GREETINGS);
}

/**
 * Who walks on during line `index`: the next speaker, when that is their
 * first line and a hello that does not answer one. Someone greeting after
 * the scene has started has just arrived; the side is the stage edge
 * nearest their mark.
 */
function entrance(
  lines: readonly StageLine[],
  index: number,
  cast: readonly LessonCharacterId[],
): LineStaging["enter"] {
  const next = lines[index + 1];
  const id = next?.characterId;
  if (!id || !cast.includes(id) || !greets(next) || greets(lines[index])) return;
  if (lines.slice(0, index + 1).some((line) => line.characterId === id)) return;

  return { characterId: id, from: cast.indexOf(id) < cast.length / 2 ? -1 : 1 };
}

/**
 * What the speaker is looking at and who holds it up: a prop shown to them
 * by the person they are talking with, with nobody else speaking since,
 * unless it was handed to the speaker.
 */
function shownTo(lines: readonly StageLine[], index: number): ShownProp | undefined {
  const speaker = lines[index]?.characterId;
  let partner: LessonCharacterId | undefined;

  for (let at = index - 1; at >= 0; at -= 1) {
    const other = lines[at].characterId;
    if (!other || other === speaker) continue;

    partner ??= other;
    if (other !== partner) return undefined;

    const prop = lineProps(lines[at].slovak, lines[at].props).findLast(Boolean);
    if (prop && addresseeOf(lines, at) === speaker) {
      return givesTo(lines, at) === speaker ? undefined : { holder: partner, prop };
    }
  }

  return undefined;
}

/**
 * Whose prop the speaker takes: one held up while its holder asked whose it
 * is ("Čie sú tie kľúče?"), answered with "moje".
 */
export function takesFrom(
  lines: readonly StageLine[],
  index: number,
): LessonCharacterId | undefined {
  const line = lines[index];
  const previous = lines[index - 1];
  if (!line?.characterId || !previous?.characterId) return undefined;
  if (previous.characterId === line.characterId) return undefined;

  const asked = foldLine(previous.slovak)
    .split(" ")
    .some((word) => WHOSE.includes(word));
  const claims = foldLine(line.slovak)
    .split(" ")
    .some((word) => MINE.includes(word));
  const holding = lines
    .slice(0, index)
    .some(
      (earlier) =>
        earlier.characterId === previous.characterId &&
        lineProps(earlier.slovak, earlier.props).some(Boolean),
    );

  return asked && claims && holding ? previous.characterId : undefined;
}

/**
 * Who the speaker hands what they hold to as the line ends: the one spoken
 * to, on "Nech sa páči." or "A to jablko je pre teba.", once the speaker
 * has brought something out.
 */
function givesTo(
  lines: readonly StageLine[],
  index: number,
): LessonCharacterId | undefined {
  const line = lines[index];
  const speaker = line?.characterId;
  if (!speaker) return undefined;
  if (!lineSentences(line.slovak).some((sentence) => mentions(sentence, GIVING))) {
    return undefined;
  }

  const holding = lines
    .slice(0, index + 1)
    .some(
      (earlier) =>
        earlier.characterId === speaker &&
        lineProps(earlier.slovak, earlier.props).some(Boolean),
    );
  return holding ? (addresseeOf(lines, index) ?? undefined) : undefined;
}

/**
 * One reaction at most, so a listener answers the line instead of
 * fidgeting: reach for what they are handed, hold up what the speaker
 * points at in their hands, lean in to a question, nod at the answer to
 * their own question, or at thanks and apologies.
 */
function reactionTo(
  lines: readonly StageLine[],
  index: number,
  addressee: LessonCharacterId,
  things: readonly SceneThing[],
): StageReaction | undefined {
  const { slovak } = lines[index];
  const sentences = lineSentences(slovak);

  if (givesTo(lines, index) === addressee) {
    return {
      characterId: addressee,
      gesture: "show",
      sentence: sentences.length - 1,
      at: 0.8,
    };
  }

  const shown = shownTo(lines, index);
  if (shown?.holder === addressee) {
    const point = linePoints(slovak, things, shown).find(
      ({ target }) => target.kind === "prop",
    );
    const sentence = point ? wordSentences(slovak)[point.word] : undefined;
    if (sentence !== undefined) {
      return { characterId: addressee, gesture: "show", sentence, at: 0 };
    }
  }

  const question = sentences.findLastIndex((sentence) => sentence.includes("?"));
  if (question !== -1) {
    return { characterId: addressee, gesture: "lean", sentence: question, at: 0.5 };
  }

  const previous = lines[index - 1];
  if (previous?.characterId === addressee && previous.slovak.trim().endsWith("?")) {
    return {
      characterId: addressee,
      gesture: "nod",
      sentence: sentences.length - 1,
      at: 1,
    };
  }

  const thanks = sentences.findIndex((sentence) => opensWith(sentence, NOD_AT));
  if (thanks !== -1) {
    return { characterId: addressee, gesture: "nod", sentence: thanks, at: 1 };
  }

  return undefined;
}

/**
 * Stage direction for one line: the speaker turns to the one spoken to,
 * everyone else turns to the speaker, and the one spoken to may react or
 * walk over to look at what they are shown. A speaker whose last line is a
 * goodbye turns and walks off when it ends; someone about to say hello
 * walks on. `things` are what the backdrop has to point at.
 */
export function stageLine(
  lines: readonly StageLine[],
  index: number,
  cast: readonly LessonCharacterId[],
  things: readonly SceneThing[] = [],
): LineStaging {
  const speaker = lines[index]?.characterId;
  const enter = entrance(lines, index, cast);
  if (!speaker || !cast.includes(speaker)) {
    return { addressee: null, facing: {}, reactions: [], enter };
  }

  const addressee = addresseeOf(lines, index);
  const onStage = addressee !== null && cast.includes(addressee);
  const facing: CastFacing = {};
  const hasStop = things.some((thing) => thing.id === "zastavka");
  const arrives = hasStop && tramComing(lines[index]);

  for (const id of cast) {
    if (arrives) facing[id] = 1;
    else if (id !== speaker) facing[id] = toward(cast, id, speaker);
    else if (onStage) facing[id] = toward(cast, id, addressee);
  }

  const reaction = onStage ? reactionTo(lines, index, addressee, things) : undefined;
  const sentences = lineSentences(lines[index].slovak);
  const shows = lineProps(lines[index].slovak, lines[index].props).some(Boolean);
  const callsOver = sentences.some((sentence) => mentions(sentence, COME_OVER));
  // Only a neighbour walks over; anyone further would walk through someone.
  const neighbour =
    onStage && Math.abs(cast.indexOf(addressee) - cast.indexOf(speaker)) === 1;
  const lastOwnLine = !lines
    .slice(index + 1)
    .some((line) => line.characterId === speaker);
  const leaving = sentences.some((sentence) => mentions(sentence, LEAVING));
  const turnedTo = facing[speaker];
  const tramHere = hasStop && lines.slice(0, index).some(tramComing);

  return {
    addressee,
    facing,
    reactions: reaction ? [reaction] : [],
    approach:
      neighbour && (shows || callsOver)
        ? { characterId: addressee, toward: toward(cast, addressee, speaker) }
        : undefined,
    exit:
      lastOwnLine && leaving && turnedTo && !lines[index].stays
        ? (-turnedTo as Facing)
        : undefined,
    enter,
    gives: onStage ? givesTo(lines, index) : undefined,
    looksAt: shownTo(lines, index)?.holder,
    goTo: destination(lines[index], things),
    arrives: arrives ? "tram" : undefined,
    boards:
      tramHere && sentences.some((sentence) => mentions(sentence, BOARDING))
        ? true
        : undefined,
  };
}
