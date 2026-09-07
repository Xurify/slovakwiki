/**
 * Whether a dictionary example actually contains this lemma.
 * Case-insensitive only — never fold diacritics (`vina` ≠ `vína`, `chyba` ≠ `chýba`).
 */

import { searchFormsForLemma } from "../search/forms";

const TOKEN_RE = /[\p{L}\p{M}]+/gu;

/** Inflectional leftovers after a verb stem — keeps nemocnici from matching nemôcť. */
const VERB_REST =
  /^(ť|t|l|la|lo|li|ly|ím|íš|í|íme|íte|ia|am|áš|á|áme|áte|ajú|em|eš|e|ieme|iete|ú|iem|ol|ola|olo|oli|m|š|s|me|te|u|a|ou|ej)?$/iu;

export function tokenizeSlovak(text: string): string[] {
  return (text.match(TOKEN_RE) ?? []).map((token) => token.toLocaleLowerCase("sk"));
}

function verbStem(lemma: string): string | undefined {
  const lower = lemma.toLocaleLowerCase("sk");
  if (!lower.endsWith("ť") || lower.length < 5) return undefined;
  const stem = lower.slice(0, -1);
  return stem.length >= 4 ? stem : undefined;
}

export function lemmaAppearsAsToken(text: string, lemma: string): boolean {
  const lemmaLower = lemma.toLocaleLowerCase("sk");
  return tokenizeSlovak(text).some((token) => token === lemmaLower);
}

export function morphFormKeys(lemma: string, category: string): Set<string> {
  const keys = new Set<string>();
  for (const form of searchFormsForLemma(lemma, category)) {
    const lower = form.toLocaleLowerCase("sk");
    if (lower) keys.add(lower);
  }
  return keys;
}

export function morphAppearsAsToken(
  text: string,
  lemma: string,
  category: string,
): boolean {
  const keys = morphFormKeys(lemma, category);
  if (keys.size === 0) return false;
  return tokenizeSlovak(text).some((token) => keys.has(token));
}

export function verbInflectionEvidence(text: string, lemma: string): boolean {
  const stem = verbStem(lemma);
  if (!stem || stem.length < 5) return false;

  return tokenizeSlovak(text).some((token) => tokenMatchesVerbStem(token, stem));
}

export function tokenMatchesVerbStem(token: string, stem: string): boolean {
  if (!token.startsWith(stem)) return false;
  if (token.length < stem.length || token.length > stem.length + 5) return false;
  const rest = token.slice(stem.length);
  return VERB_REST.test(rest);
}

export function verbStemForMatch(lemma: string): string | undefined {
  const stem = verbStem(lemma);
  if (!stem || stem.length < 5) return undefined;
  return stem;
}

export function exampleContainsLemma(
  slovak: string,
  lemma: string,
  category: string,
): boolean {
  if (lemmaAppearsAsToken(slovak, lemma)) return true;
  if (morphAppearsAsToken(slovak, lemma, category)) return true;
  if (category === "Verbs" && verbInflectionEvidence(slovak, lemma)) return true;
  return false;
}
