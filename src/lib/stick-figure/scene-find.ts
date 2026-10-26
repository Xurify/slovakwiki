import { LOOKS } from "./looks";
import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { TextMark } from "$lib/learning/marked-text";
import { demonstrativeForm } from "$lib/learning/demonstratives/paradigm";
import { isPlural, isProperName, slotOf, type SceneThing } from "./thing-words";

/** Kde je torta? (where is it, the dictionary form) or Ukáž na tú tortu. (point at that one, the accusative). */
export type FindAsk = "where" | "point";

export interface FindPrompt {
  english: string;
  marks: TextMark[];
  slovak: string;
}

/**
 * The accusative, as `ukáž na` takes it. Of the nouns drawn in
 * the scenes the feminine ones in -a change (torta → tortu) and so does a
 * man (muž → muža); masculine things, neuter nouns and plurals like hodiny
 * or jahody keep the nominative.
 */
export function accusativeOf(thing: SceneThing): string {
  const { accusative, gender, word } = thing;
  if (accusative) return accusative;
  return gender === "feminine" && !isPlural(thing) && word.endsWith("a")
    ? `${word.slice(0, -1)}u`
    : word;
}

/** English says "the headphones are" where Slovak may not: slúchadlá, but also zelenina. */
function englishPlural({ english }: SceneThing): boolean {
  return english.endsWith("s");
}

function theEnglish({ english }: SceneThing): string {
  return english.startsWith("the ") ? english : `the ${english}`;
}

function endingMark(thing: SceneThing, start: number): TextMark[] {
  const accusative = accusativeOf(thing);
  if (accusative === thing.word) return [];

  const end = start + accusative.length;
  return [{ start: end - 1, end, role: "ending" }];
}

/** The noun takes another ending after `ukáž na`: torta → tortu, muž → muža. */
export function formChanges(thing: SceneThing): boolean {
  return accusativeOf(thing) !== thing.word;
}

/**
 * How a round asks for each thing, in the round's order, so one round
 * mixes both forms and needs no levels: a noun whose form changes is
 * always pointed at, so the change is seen; the rest take turns, so the
 * dictionary form is heard as well.
 */
export function findAsks(things: readonly SceneThing[]): FindAsk[] {
  let keeps = 0;
  return things.map((thing) => {
    if (formChanges(thing)) return "point";
    keeps += 1;
    return keeps % 2 === 1 ? "where" : "point";
  });
}

export function findPrompt(thing: SceneThing, ask: FindAsk): FindPrompt {
  const english = theEnglish(thing);

  if (ask === "where") {
    return {
      english: `Where ${englishPlural(thing) ? "are" : "is"} ${english}?`,
      marks: [],
      slovak: `Kde ${isAre(thing)} ${thing.word}?`,
    };
  }

  const opening = "Ukáž na ";
  const demonstrative = isProperName(thing)
    ? ""
    : `${demonstrativeForm("ten", slotOf(thing), "accusative")} `;
  const nounAt = opening.length + demonstrative.length;
  const pointed = isProperName(thing)
    ? english
    : `${englishPlural(thing) ? "those" : "that"} ${thing.english}`;
  return {
    english: `Point at ${pointed}.`,
    marks: [
      ...(demonstrative
        ? [
            {
              start: opening.length,
              end: opening.length + demonstrative.length - 1,
              role: "demonstrative" as const,
            },
          ]
        : []),
      ...endingMark(thing, nounAt),
    ],
    slovak: `${opening}${demonstrative}${accusativeOf(thing)}.`,
  };
}

function isAre(thing: SceneThing): string {
  return isPlural(thing) ? "sú" : "je";
}

/** What the learner hears back on a wrong tap: "To je okno." */
export function thatIs(thing: SceneThing): string {
  return `To ${isAre(thing)} ${thing.word}.`;
}

/** What the learner hears on the right tap: "Áno, to je kopec." */
export function yesThatIs(thing: SceneThing): string {
  return `Áno, to ${isAre(thing)} ${thing.word}.`;
}

/**
 * Who asks for each thing and answers each tap: the first of the cast who
 * is on stage from the start, since someone still walking on cannot ask,
 * and someone other than Alex where there is one, since the learner is
 * the one looking. A dog cannot ask.
 */
export function findAsker(direction: {
  cast: readonly LessonCharacterId[];
  lines: ReadonlyArray<{ staging: { enter?: { characterId: LessonCharacterId } } }>;
}): LessonCharacterId | undefined {
  const entering = new Set(
    direction.lines.flatMap(({ staging }) =>
      staging.enter ? [staging.enter.characterId] : [],
    ),
  );
  const present = direction.cast.filter((id) => !entering.has(id) && !LOOKS[id].dog);
  return present.find((id) => id !== "alex") ?? present[0];
}

/**
 * Everything the asker may say in a round over `things`, so each gets a
 * clip: both asks and the three answers for each thing.
 */
export function findSayings(things: readonly SceneThing[]): string[] {
  return [
    ...new Set(
      things.flatMap((thing) => [
        findPrompt(thing, "where").slovak,
        findPrompt(thing, "point").slovak,
        thatIs(thing),
        hereIs(thing),
        yesThatIs(thing),
      ]),
    ),
  ];
}

/** Shown when the learner gives up on one: "Tu je torta." */
export function hereIs(thing: SceneThing): string {
  return `Tu ${isAre(thing)} ${thing.word}.`;
}

/**
 * The English under a tap's answer, so each tap teaches the word: what was
 * tapped by mistake, the one found, or the one shown.
 */
export function findEnglish(thing: SceneThing, tap: "wrong" | "right" | "shown"): string {
  const name = theEnglish(thing);
  const be = englishPlural(thing) ? "are" : "is";
  if (tap === "wrong") return `That ${be} ${name}.`;
  if (tap === "right") return `Yes, that ${be} ${name}.`;
  return `Here ${be} ${name}.`;
}

/**
 * How the accusative treats a noun, in a few words: what `ukáž na` does to
 * its ending, or that it leaves it be.
 */
export function accusativeRule(thing: SceneThing): string {
  if (thing.gender === "masculine-animate") return "a man or an animal: adds -a";
  if (thing.gender === "plural-only") return "plural only: stays the same";
  if (isPlural(thing)) return "plural: stays the same";
  if (formChanges(thing)) return "feminine in -a: -a becomes -u";
  if (thing.gender === "feminine") return "feminine, not in -a: stays the same";
  if (thing.gender === "neuter") return "neuter: stays the same";
  return "masculine thing: stays the same";
}

/**
 * Why the form in the prompt looks the way it does, once the thing is
 * found. Nothing to say for "Kde je…?", which asks with the dictionary form.
 */
export function findWhy(thing: SceneThing, ask: FindAsk): string | undefined {
  if (ask === "where") return undefined;

  if (formChanges(thing)) {
    return `After **ukáž na** the noun takes the accusative: **${thing.word}** → **${accusativeOf(thing)}**.`;
  }
  if (thing.gender === "plural-only") {
    return `**${thing.word}** is plural only and keeps its form after **ukáž na**.`;
  }
  if (isPlural(thing)) {
    return `**${thing.word}** is plural, and plural things keep their form after **ukáž na**.`;
  }
  return `**${thing.word}** keeps its form after **ukáž na**: masculine things and neuter nouns look the same in the accusative.`;
}
