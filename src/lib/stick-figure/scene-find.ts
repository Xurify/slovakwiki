import type { TextMark } from "$lib/learning/marked-text";
import { isPlural, isProperName, type SceneThing } from "./scene-things";

/** Kde je torta? (where is it), Nájdi tortu. (find it), Ukáž na tú tortu. (point at that one). */
export type FindLevel = "where" | "find" | "point";

export const FIND_LEVELS: ReadonlyArray<{ id: FindLevel; label: string }> = [
  { id: "where", label: "Kde je…?" },
  { id: "find", label: "Nájdi…" },
  { id: "point", label: "Ukáž na…" },
];

export interface FindPrompt {
  english: string;
  marks: TextMark[];
  slovak: string;
}

/**
 * The accusative, as `nájdi` and `ukáž na` take it. Of the nouns drawn in
 * the scenes only the feminine ones in -a change (torta → tortu); masculine
 * things, neuter nouns and plurals like hodiny or jahody keep the nominative.
 */
export function accusativeOf(thing: SceneThing): string {
  const { gender, word } = thing;
  return gender === "feminine" && !isPlural(thing) && word.endsWith("a")
    ? `${word.slice(0, -1)}u`
    : word;
}

function accusativeDemonstrative(thing: SceneThing): string {
  if (isPlural(thing)) return "tie";
  if (thing.gender === "feminine") return "tú";
  if (thing.gender === "neuter") return "to";
  return "ten";
}

/** English says "the headphones are" where Slovak may not: slúchadlá, but also zelenina. */
function englishPlural({ english }: SceneThing): boolean {
  return english.endsWith("s");
}

/** Marks the ending a noun changes in the accusative, if it changes. */
function endingMark(thing: SceneThing, start: number): TextMark[] {
  const accusative = accusativeOf(thing);
  if (accusative === thing.word) return [];

  const end = start + accusative.length;
  return [{ start: end - 1, end, role: "ending" }];
}

export function findPrompt(thing: SceneThing, level: FindLevel): FindPrompt {
  const english = thing.english.startsWith("the ")
    ? thing.english
    : `the ${thing.english}`;

  if (level === "where") {
    return {
      english: `Where ${englishPlural(thing) ? "are" : "is"} ${english}?`,
      marks: [],
      slovak: `Kde ${isAre(thing)} ${thing.word}?`,
    };
  }

  if (level === "find") {
    const opening = "Nájdi ";
    return {
      english: `Find ${english}.`,
      marks: endingMark(thing, opening.length),
      slovak: `${opening}${accusativeOf(thing)}.`,
    };
  }

  const opening = "Ukáž na ";
  const demonstrative = isProperName(thing) ? "" : `${accusativeDemonstrative(thing)} `;
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

/** Shown when the learner gives up on one: "Tu je torta." */
export function hereIs(thing: SceneThing): string {
  return `Tu ${isAre(thing)} ${thing.word}.`;
}

/**
 * Why the form in the prompt looks the way it does, once the thing is
 * found. Nothing to say for "Kde je…?", which asks with the dictionary form.
 */
export function findWhy(thing: SceneThing, level: FindLevel): string | undefined {
  if (level === "where") return undefined;

  const accusative = accusativeOf(thing);
  const verb = level === "find" ? "nájdi" : "ukáž na";
  if (accusative !== thing.word) {
    return `After **${verb}** the noun takes the accusative: **${thing.word}** → **${accusative}**.`;
  }
  if (thing.gender === "plural-only") {
    return `**${thing.word}** is plural only and keeps its form after **${verb}**.`;
  }
  if (isPlural(thing)) {
    return `**${thing.word}** is plural, and plural things keep their form after **${verb}**.`;
  }
  return `**${thing.word}** keeps its form after **${verb}**: masculine things and neuter nouns look the same in the accusative.`;
}
