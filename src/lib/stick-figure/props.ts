import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import { foldLine } from "./line-gesture";
import { lineSentences } from "./line-plan";

export const STICK_PROP_IDS = [
  "apple",
  "bag",
  "basket",
  "book",
  "camera",
  "card",
  "clipboard",
  "cup",
  "keys",
  "letter",
  "menu",
  "newspaper",
  "phone",
  "umbrella",
] as const;

export type StickPropId = (typeof STICK_PROP_IDS)[number];

/** What each figure has in hand. */
export type CastProps = Partial<Record<LessonCharacterId, StickPropId>>;

/**
 * Folded words that bring a prop out. Stems match any ending; whole words
 * stay whole where a stem would catch something else (`kav` is also in
 * `kaviareň`, `telefon` in `telefónne číslo`, which asks for a number).
 */
const PROP_CUES: Record<StickPropId, { stems?: string[]; words?: string[] }> = {
  apple: { stems: ["jablk", "jablc"] },
  bag: { stems: ["task", "tasiek"] },
  basket: { stems: ["kosik"] },
  book: { stems: ["knih"] },
  camera: { stems: ["fotk", "fotograf"] },
  card: { words: ["karta", "kartu", "karty", "kartou"] },
  clipboard: { stems: ["registrac", "formular"] },
  cup: { words: ["kava", "kavu", "kavy", "kavou", "caj", "caju", "cajom"] },
  keys: { stems: ["kluc"] },
  letter: { words: ["list", "listy", "listu", "liste", "listom", "listov"] },
  menu: { words: ["menu"] },
  newspaper: { words: ["noviny", "novin", "novinach", "novinami"] },
  phone: { words: ["telefon", "telefonu", "telefonom", "mobil", "mobilu", "mobilom"] },
  umbrella: { stems: ["dazdnik"] },
};

/** Props with pictures or words on them, which a question can be about: "Kto je ten muž?" */
const WITH_CONTENT: readonly StickPropId[] = [
  "book",
  "camera",
  "card",
  "clipboard",
  "letter",
  "menu",
  "newspaper",
  "phone",
];

export function hasContent(prop: StickPropId): boolean {
  return WITH_CONTENT.includes(prop);
}

/** Ordering is not holding: "Ja si dám čaj." brings out no cup. */
const ORDERING = ["dam si", "si dam", "dame si", "si dame"];
/** Not having it is not holding it either: "Nemám dáždnik." brings out no umbrella. */
const NOT_HAVING = ["nemam", "nemas", "nema", "nemame", "nemate", "nemaju"];
/** Bringing it another day is not holding it now: "Prineste fotku rodiny." brings out no camera. */
const BRINGING = [
  "prinesiem",
  "prinesies",
  "prinesie",
  "prinesieme",
  "prinesiete",
  "prinesu",
  "prines",
  "prineste",
  "prinesme",
];

/** Forms of `volať` (to call); with `sa` they mean "to be called" instead. */
const CALLING = ["volam", "volas", "vola", "volame", "volate", "volaju"];

export function isStickProp(value: string): value is StickPropId {
  return (STICK_PROP_IDS as readonly string[]).includes(value);
}

/** The prop a sentence names, if any: "Pozri, to sú fotky z leta." → camera. */
export function propForSentence(sentence: string): StickPropId | undefined {
  const folded = foldLine(sentence);
  const words = folded.split(" ");
  const ordering = ORDERING.some((phrase) => ` ${folded} `.includes(` ${phrase} `));
  if (words.some((word) => NOT_HAVING.includes(word) || BRINGING.includes(word))) {
    return undefined;
  }

  for (const id of STICK_PROP_IDS) {
    if (id === "cup" && ordering) continue;
    const { stems = [], words: whole = [] } = PROP_CUES[id];
    const named = words.some(
      (word) => whole.includes(word) || stems.some((stem) => word.startsWith(stem)),
    );
    if (named) return id;
  }

  if (words.some((word) => CALLING.includes(word)) && !words.includes("sa")) {
    return "phone";
  }

  return undefined;
}

/**
 * The prop each sentence of a line brings out. An author's entry wins, and
 * `null` keeps a sentence empty-handed; sentences past the list are read
 * from their words.
 */
export function lineProps(
  slovak: string,
  props: ReadonlyArray<StickPropId | null | undefined> = [],
): Array<StickPropId | undefined> {
  return lineSentences(slovak).map((sentence, index) =>
    props[index] === undefined ? propForSentence(sentence) : (props[index] ?? undefined),
  );
}

/** A sentence that brings out a prop shows it, unless the author picked its gesture. */
export function gesturesWithProps(
  props: ReadonlyArray<StickPropId | undefined>,
  gestures: readonly StickGestureId[] = [],
): Array<StickGestureId | undefined> {
  const length = Math.max(props.length, gestures.length);
  return Array.from(
    { length },
    (_, index) => gestures[index] ?? (props[index] ? "show" : undefined),
  );
}

type HeldLine = {
  characterId: LessonCharacterId | null;
  /** Who the speaker hands what they hold to as the line ends. */
  givesTo?: LessonCharacterId;
  props: ReadonlyArray<StickPropId | undefined>;
  /** Whose prop the speaker takes as the line starts. */
  takesFrom?: LessonCharacterId;
};

/** Who a prop comes out for: the holder's partner just before that line, else just after. */
function partnerAt(
  lines: readonly HeldLine[],
  index: number,
): LessonCharacterId | undefined {
  const holder = lines[index].characterId;
  const other = (line: HeldLine) =>
    line.characterId !== null && line.characterId !== holder;
  const partner =
    lines.slice(0, index).findLast(other) ?? lines.slice(index + 1).find(other);
  return partner?.characterId ?? undefined;
}

export function handOver(
  held: CastProps,
  from: LessonCharacterId,
  to: LessonCharacterId,
): CastProps {
  const prop = held[from];
  if (!prop) return held;

  const handed: CastProps = { ...held, [to]: prop };
  delete handed[from];
  return handed;
}

/**
 * What everyone holds while each line plays. A speaker takes out the last
 * prop their line names and keeps it until they bring out another, so Anna
 * still has the camera while Alex asks about the people in her photos. It
 * goes away when someone else joins in: Anna puts the camera away when the
 * waiter comes to take the order. A prop changes hands when its owner
 * claims it ("Áno, moje!") or its holder gives it away ("Nech sa páči."),
 * and what someone was given they keep.
 */
export function heldProps(lines: readonly HeldLine[]): CastProps[] {
  let held: CastProps = {};
  const shownTo: Partial<Record<LessonCharacterId, LessonCharacterId>> = {};
  const given = new Set<LessonCharacterId>();

  return lines.map(({ characterId, givesTo, props, takesFrom }, index) => {
    if (characterId && takesFrom && held[takesFrom]) {
      held = handOver(held, takesFrom, characterId);
      shownTo[characterId] = takesFrom;
    }

    if (characterId) {
      const kept: CastProps = {};
      for (const holder of Object.keys(held) as LessonCharacterId[]) {
        if (
          holder === characterId ||
          shownTo[holder] === characterId ||
          given.has(holder)
        ) {
          kept[holder] = held[holder];
        }
      }
      held = kept;
    }

    const prop = props.findLast((id) => id !== undefined);
    if (characterId && prop) {
      held = { ...held, [characterId]: prop };
      given.delete(characterId);
      shownTo[characterId] = partnerAt(lines, index);
    }

    const during = held;
    if (characterId && givesTo && held[characterId]) {
      held = handOver(held, characterId, givesTo);
      given.add(givesTo);
    }
    return during;
  });
}
