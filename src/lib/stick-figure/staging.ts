import {
  listedCharacters,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import type { LinePoint } from "./line-plan";
import type { ReadLine } from "./line-reading";
import {
  APOLOGIES,
  GOODBYES,
  HELLOS,
  THANKS,
  foldLine,
  mentions,
  opensWith,
  wordSentences,
} from "./slovak-text";
import { thingNamed, type SceneThing } from "./thing-words";

/** 1 faces right (+x), -1 faces left. */
export type Facing = 1 | -1;

export type CastFacing = Partial<Record<LessonCharacterId, Facing>>;

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
  approach?: { characterId: LessonCharacterId; toward: Facing; close?: boolean };
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
  /** Said to the listeners ("Hádajte s nami!"): the speaker faces the front, not a figure. */
  audience?: boolean;
  /** Who walks to a free chair and sits down during this line: "Sadnite si." */
  sit?: LessonCharacterId[];
  /** Who gets up: "Vstaňte." */
  stand?: LessonCharacterId[];
}

/** Folded sentence openers the one spoken to nods at. */
const NOD_AT = [...THANKS, "tesi ma", ...APOLOGIES];
/** Folded phrases that end someone's part in a scene: goodbyes, or going to fetch the order. */
const LEAVING = [...GOODBYES, "pekny den", "hned to bude", "hned som spat", "musim ist"];
/**
 * Folded phrases a host says to the listeners, not to anyone on stage: the
 * show's hellos and goodbyes, a riddle put to them, and telling them where
 * the hosts are or go next.
 */
const TO_LISTENERS = [
  "hadajte s nami",
  "dakujeme ze pocuvate",
  "majte sa pekne",
  "tu je podcast",
  "toto je podcast",
  "ideme na to",
  "to je vsetko na dnes",
  "vitajte",
  "ahojte",
  "teraz sme",
  "teraz do",
  "teraz spat do",
  "teraz na",
];

/**
 * Whether the line calls someone in `cast` by name ("Prepáč, Anna, meškám"):
 * then it is to them, whatever else it says. "Ja som Anna" names nobody.
 */
function callsByName(slovak: string, cast: readonly LessonCharacterId[]): boolean {
  return calledByName(slovak, cast) !== undefined;
}

/** Who in `cast` the line calls by name, if anyone. */
function calledByName(
  slovak: string,
  cast: readonly LessonCharacterId[],
): LessonCharacterId | undefined {
  return listedCharacters()
    .filter((character) => cast.includes(character.id))
    .find((character) => {
      const name = character.displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(
        `(^|[.!?…]\\s*)${name}[,!?]|,\\s*(pani |pán )?${name}\\b`,
        "u",
      ).test(slovak);
    })?.id;
}

/** Folded phrases that call the one spoken to over. */
const COME_OVER = ["pod dalej", "podte dalej", "pod sem", "podte sem"];
/** Folded phrases that call someone in under the speaker's umbrella, so they come right up. */
const SHELTER = ["pod dazdnik"];
/** Folded openers that take everyone along to a thing the line names. */
const COME_ALONG = ["podme", "podte"];
/** Folded phrases that say the tram is pulling in; only a street with a stop has one. */
const TRAM_COMING = ["uz ide", "uz prichadza", "tu je elektricka"];
/** Folded phrases for getting on it. */
const BOARDING = ["nastupme", "nastupte", "nastup", "nastupime"];
/** Where the line takes everyone: the last thing it names, when it says "Poďme" or "Poď!". */
function destination(line: ReadLine, things: readonly SceneThing[]): string | undefined {
  const along = line.sentences.some(
    (sentence) => opensWith(sentence, COME_ALONG) || foldLine(sentence) === "pod",
  );
  if (!along) return undefined;

  return line.words.map((word) => thingNamed(word, things)).findLast(Boolean)?.id;
}

/** Folded phrases that sit the one spoken to down, or everyone spoken to with -te. */
const SIT_YOU = ["sadni si", "posad sa"];
const SIT_ALL_OF_YOU = ["sadnite si", "posadte sa"];
/** …the speaker and everyone with them. */
const SIT_US = ["sadnime si", "sadneme si", "posadme sa"];
const SIT_ME = ["sadnem si"];
const STAND_YOU = ["vstan", "postav sa"];
const STAND_ALL_OF_YOU = ["vstante", "postavte sa"];
const STAND_US = ["vstanme", "vstaneme"];

/** Who a line sits down, and who it gets up. */
function seating(
  line: ReadLine,
  speaker: LessonCharacterId,
  addressee: LessonCharacterId | null,
  cast: readonly LessonCharacterId[],
): Pick<LineStaging, "sit" | "stand"> {
  const says = (phrases: readonly string[]) =>
    line.sentences.some((sentence) => mentions(sentence, phrases));
  const others = cast.filter((id) => id !== speaker);
  const pick = (you: string[], allOfYou: string[], us: string[], me: string[] = []) => {
    if (says(us)) return [...cast];
    if (says(allOfYou)) return others;
    if (says(you) && addressee && cast.includes(addressee)) return [addressee];
    if (says(me)) return [speaker];
    return undefined;
  };

  const sit = pick(SIT_YOU, SIT_ALL_OF_YOU, SIT_US, SIT_ME);
  const stand = pick(STAND_YOU, STAND_ALL_OF_YOU, STAND_US);
  return { ...(sit ? { sit } : {}), ...(stand ? { stand } : {}) };
}

function tramComing(line: ReadLine): boolean {
  return line.sentences.some((sentence) => mentions(sentence, TRAM_COMING));
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

function greets(line: ReadLine | undefined): boolean {
  const first = line?.sentences[0];
  return first !== undefined && opensWith(first, HELLOS);
}

/**
 * Who walks on during line `index`: the next speaker, when that is their
 * first line and a hello that does not answer one. Someone greeting after
 * the scene has started has just arrived; the side is the stage edge
 * nearest their mark.
 */
function entrance(
  lines: readonly ReadLine[],
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
 * One reaction at most, so a listener answers the line instead of
 * fidgeting: reach for what they are handed, hold up what the speaker
 * points at in their hands, lean in to a question, nod at the answer to
 * their own question, or at thanks and apologies. `points` are where the
 * line points.
 */
function reactionTo(
  lines: readonly ReadLine[],
  index: number,
  addressee: LessonCharacterId,
  points: readonly LinePoint[],
): StageReaction | undefined {
  const { gives, sentences, slovak } = lines[index];

  if (gives === addressee) {
    return {
      characterId: addressee,
      gesture: "show",
      sentence: sentences.length - 1,
      at: 0.8,
    };
  }

  const atTheirs = points.find(
    ({ target }) => target.kind === "prop" && target.holder === addressee,
  );
  const sentence = atTheirs ? wordSentences(slovak)[atTheirs.word] : undefined;
  if (sentence !== undefined) {
    return { characterId: addressee, gesture: "show", sentence, at: 0 };
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
 * walks on. `things` are what the backdrop has to point at, and `points`
 * where this line points.
 */
export function stageLine(
  lines: readonly ReadLine[],
  index: number,
  cast: readonly LessonCharacterId[],
  things: readonly SceneThing[] = [],
  points: readonly LinePoint[] = [],
): LineStaging {
  const line = lines[index];
  const speaker = line?.characterId;
  const enter = entrance(lines, index, cast);
  if (!speaker || !cast.includes(speaker)) {
    return { addressee: null, facing: {}, reactions: [], enter };
  }

  const { addressee, sentences } = line;
  const onStage = addressee !== null && cast.includes(addressee);
  const facing: CastFacing = {};
  const hasStop = things.some((thing) => thing.id === "zastavka");
  const arrives = hasStop && tramComing(line);

  const audience =
    sentences.some((sentence) => mentions(sentence, TO_LISTENERS)) &&
    !callsByName(line.slovak, cast);

  for (const id of cast) {
    if (arrives) facing[id] = 1;
    else if (id !== speaker) facing[id] = toward(cast, id, speaker);
    else if (onStage && !audience) facing[id] = toward(cast, id, addressee);
  }

  const reaction = onStage ? reactionTo(lines, index, addressee, points) : undefined;
  const shows = line.props.some(Boolean);
  const callsOver = sentences.some((sentence) => mentions(sentence, COME_OVER));
  const shelters = sentences.some((sentence) => mentions(sentence, SHELTER));
  // Only a neighbour walks over; anyone further would walk through someone.
  const neighbour =
    onStage && Math.abs(cast.indexOf(addressee) - cast.indexOf(speaker)) === 1;
  const lastOwnLine = !lines
    .slice(index + 1)
    .some((later) => later.characterId === speaker);
  const leaving = sentences.some((sentence) => mentions(sentence, LEAVING));
  const turnedTo = facing[speaker];
  const tramHere = hasStop && lines.slice(0, index).some(tramComing);

  return {
    addressee,
    facing,
    reactions: reaction ? [reaction] : [],
    approach:
      neighbour && (shows || callsOver)
        ? {
            characterId: addressee,
            toward: toward(cast, addressee, speaker),
            ...(shelters ? { close: true } : {}),
          }
        : undefined,
    exit:
      lastOwnLine && leaving && turnedTo && !line.stays
        ? (-turnedTo as Facing)
        : undefined,
    enter,
    gives: line.gives,
    looksAt: line.shownBy,
    goTo: destination(line, things),
    arrives: arrives ? "tram" : undefined,
    boards:
      tramHere && sentences.some((sentence) => mentions(sentence, BOARDING))
        ? true
        : undefined,
    audience: audience ? true : undefined,
    ...seating(line, speaker, calledByName(line.slovak, cast) ?? addressee, cast),
  };
}
