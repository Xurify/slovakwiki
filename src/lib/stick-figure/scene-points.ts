import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { NounGender } from "$lib/catalog/types";
import {
  CASES,
  demonstrativeForm,
  type DemonstrativeSeries,
  type Slot,
} from "$lib/learning/demonstratives/paradigm";
import type { PointReach } from "./gestures";
import { foldLine } from "./line-gesture";
import { lineWords, wordSentences, type LinePoint, type PointTarget } from "./line-plan";
import { hasContent, propForSentence, type StickPropId } from "./props";
import { isPlural, thingNamed, type SceneThing } from "./thing-words";

const SLOTS: readonly Slot[] = [
  "masculine-animate",
  "masculine-inanimate",
  "feminine",
  "neuter",
  "plural-personal",
  "plural",
];
const REACH: Record<DemonstrativeSeries, PointReach | undefined> = {
  tamten: "far",
  ten: undefined,
  tento: "near",
};

/** Every form of ten, tento and tamten, with how far off it puts things and what it can stand for. */
const DEMONSTRATIVES = new Map<string, { reach?: PointReach; slots: Set<Slot> }>();
for (const series of ["ten", "tento", "tamten"] as const) {
  for (const slot of SLOTS) {
    for (const grammaticalCase of CASES) {
      const form = demonstrativeForm(series, slot, grammaticalCase);
      const known = DEMONSTRATIVES.get(form) ?? {
        reach: REACH[series],
        slots: new Set(),
      };
      known.slots.add(slot);
      DEMONSTRATIVES.set(form, known);
    }
  }
}

function demonstrative(word: string | undefined) {
  return DEMONSTRATIVES.get(word?.toLocaleLowerCase("sk") ?? "");
}

function slotOf(thing: SceneThing): Slot {
  return isPlural(thing)
    ? "plural"
    : (thing.gender as Exclude<NounGender, "plural-only">);
}

/** To, toto and tamto on their own mostly mean it, this and that, not a noun said before. */
const PRONOUNS = ["to", "toto", "tamto"];

/** Folded words after which a demonstrative stands for a noun said before: "Tamten je lacnejší." */
const VERBS_AFTER = [
  "je",
  "su",
  "bol",
  "bola",
  "bolo",
  "boli",
  "bude",
  "budu",
  "stoji",
  "stoja",
];

function clauseEnds(slovak: string): boolean[] {
  return [...slovak.matchAll(/\p{L}+([^\p{L}]*)/gu)].map(([, after]) =>
    /[,.!?…;:–—]/.test(after),
  );
}

export interface NamedThing {
  copy?: number;
  id: string;
}

/**
 * Which copy of a thing a point means. Of twins, tento takes the near one and
 * tamten the far one; plain ten keeps the one pointed at last, or the main one.
 */
function copyOf(
  thing: SceneThing,
  reach: PointReach | undefined,
  recent: readonly NamedThing[],
): number | undefined {
  if (!thing.twins) return undefined;
  if (reach) return thing.twins[reach];
  return recent.findLast(({ id }) => id === thing.id)?.copy ?? 0;
}

function sameTarget(a: PointTarget, b: PointTarget | undefined): boolean {
  if (a.kind === "thing") {
    return b?.kind === "thing" && b.id === a.id && b.copy === a.copy;
  }
  return b?.kind === "prop" && b.holder === a.holder;
}

export interface ShownProp {
  holder: LessonCharacterId;
  prop?: StickPropId;
}

/**
 * Where a line points: at each thing in the scene it names, from the
 * demonstrative in front of it when there is one ("tento koláč"); at a
 * thing named before, when a demonstrative stands for it on its own and
 * agrees with it ("Tamten je lacnejší." after "tamten syr"); and at what
 * `shownBy` holds up on the line's first other `ten`, `tá` or `tí` ("Kto
 * je ten muž?" over photos). Keys or an apple have nothing in them to ask
 * about, so a line points at them only when it names them ("tieto kľúče").
 * A bare `to` is mostly "it" ("Je to Marek?"), so on its own it points at
 * nothing. `recent` is what the scene named before this line, the latest
 * last. The same target is pointed at again only after a sentence without it.
 */
export function linePoints(
  slovak: string,
  things: readonly SceneThing[],
  shownBy?: ShownProp,
  recent: readonly NamedThing[] = [],
): LinePoint[] {
  const words = lineWords(slovak);
  const ends = clauseEnds(slovak);
  const named = [...recent];
  const points: LinePoint[] = [];

  words.forEach((word, index) => {
    const thing = thingNamed(foldLine(word), things);
    if (thing) {
      const from = [index - 1, index - 2].find((at) => demonstrative(words[at]));
      const reach = from === undefined ? undefined : demonstrative(words[from])?.reach;
      const copy = copyOf(thing, reach, named);
      points.push({
        reach,
        target: { kind: "thing", copy, id: thing.id },
        word: from ?? index,
      });
      named.push({ copy, id: thing.id });
      return;
    }

    const form = demonstrative(word);
    const alone = ends[index] || VERBS_AFTER.includes(foldLine(words[index + 1] ?? ""));
    if (!form || !alone || PRONOUNS.includes(foldLine(word))) return;

    const meant = named.findLast(({ id }) => {
      const candidate = things.find((option) => option.id === id);
      return candidate !== undefined && form.slots.has(slotOf(candidate));
    });
    const thingMeant = things.find((option) => option.id === meant?.id);
    if (!thingMeant) return;

    const copy = copyOf(thingMeant, form.reach, named);
    points.push({
      reach: form.reach,
      target: { kind: "thing", copy, id: thingMeant.id },
      word: index,
    });
    named.push({ copy, id: thingMeant.id });
  });

  if (shownBy) {
    const { holder, prop } = shownBy;
    const names = (at: number) =>
      prop !== undefined && propForSentence(words[at] ?? "") === prop;
    const word = words.findIndex(
      (candidate, index) =>
        demonstrative(candidate) &&
        candidate.toLocaleLowerCase("sk") !== "to" &&
        !points.some((point) => point.word === index) &&
        (prop === undefined || hasContent(prop) || names(index + 1) || names(index + 2)),
    );
    if (word !== -1) {
      points.push({
        reach: demonstrative(words[word])?.reach,
        target: { kind: "prop", holder },
        word,
      });
    }
  }

  const sentences = wordSentences(slovak);
  return points
    .sort((a, b) => a.word - b.word)
    .filter((point, index, sorted) => {
      const previous = sorted[index - 1];
      return (
        !previous ||
        !sameTarget(point.target, previous.target) ||
        sentences[point.word] - sentences[previous.word] > 1
      );
    });
}
