/**
 * Noun gender = the reviewed exceptions list, else the Slovak ending rule.
 * Exceptions: content/dictionary/noun-gender-exceptions.json (checked against the
 * Slovak National Corpus treebank). Used by `assign-noun-gender.ts`.
 */

import {
  isPluralOnlyGender,
  type NounGender,
  type PluralOnlyGender,
} from "../../src/lib/catalog/types";

/**
 * Lemmas the ending rule gets wrong, grouped by their real gender.
 * `plural-only` maps lemma → the gender dictionaries give it (dvere: feminine);
 * `unset` maps lemma → why it is left without a gender.
 */
export interface NounGenderExceptions {
  "masculine-animate": string[];
  "masculine-inanimate": string[];
  feminine: string[];
  neuter: string[];
  "plural-only": Record<string, PluralOnlyGender>;
  unset: Record<string, string>;
}

export interface AssignedGender {
  gender?: NounGender;
  pluralOnlyGender?: PluralOnlyGender;
  source: "exception" | "ending-rule" | "unset";
}

const VOWELS = /[aáäeéiíoóuúyý]$/;

/**
 * The regular Slovak pattern by ending. Masculine nouns default to inanimate:
 * nouns for people and animals (masculine animate) are listed as exceptions,
 * because no ending tells a person from a thing.
 */
export function genderFromEnding(lemma: string): NounGender | undefined {
  const word = lemma.toLocaleLowerCase("sk");
  if (word.endsWith("osť")) return "feminine"; // kosť
  if (word.endsWith("um")) return "neuter"; // múzeum, štúdium
  if (/(?:ci|[ýí])$/.test(word)) return "masculine-animate"; // vedúci, dospelý
  if (!VOWELS.test(word)) return "masculine-inanimate"; // dub, stroj
  if (/[aá]$/.test(word)) return "feminine"; // žena, ulica, akcia
  if (/[oeé]$/.test(word)) return "neuter"; // mesto, srdce, vysvedčenie, vstupné
  return undefined;
}

export function assignNounGender(
  lemma: string,
  exceptions: NounGenderExceptions,
): AssignedGender {
  if (lemma in exceptions.unset) return { source: "unset" };

  const pluralOnlyGender = exceptions["plural-only"][lemma];
  if (pluralOnlyGender) {
    return { gender: "plural-only", pluralOnlyGender, source: "exception" };
  }

  for (const gender of [
    "masculine-animate",
    "masculine-inanimate",
    "feminine",
    "neuter",
  ] as const) {
    if (exceptions[gender].includes(lemma)) return { gender, source: "exception" };
  }

  const gender = genderFromEnding(lemma);
  return gender ? { gender, source: "ending-rule" } : { source: "unset" };
}

/** Throws on unknown genders or a lemma listed in more than one group. */
export function validateExceptions(exceptions: NounGenderExceptions): void {
  const seen = new Map<string, string>();
  const note = (lemma: string, group: string) => {
    const previous = seen.get(lemma);
    if (previous)
      throw new Error(`${lemma} is listed under both ${previous} and ${group}`);
    seen.set(lemma, group);
  };

  for (const group of [
    "masculine-animate",
    "masculine-inanimate",
    "feminine",
    "neuter",
  ] as const) {
    for (const lemma of exceptions[group]) note(lemma, group);
  }
  for (const [lemma, gender] of Object.entries(exceptions["plural-only"])) {
    if (!isPluralOnlyGender(gender)) {
      throw new Error(`${lemma}: unknown plural-only gender "${gender}"`);
    }
    note(lemma, "plural-only");
  }
  for (const lemma of Object.keys(exceptions.unset)) note(lemma, "unset");
}
