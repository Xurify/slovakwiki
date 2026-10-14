import type { NounDeclension, NounGender } from "../types";

export interface DeclensionRow {
  caseName: string;
  caseSlug: string;
  plural: FormParts;
  question: string;
  singular: FormParts;
}

/** A form split where it stops matching the lemma, so the ending can be marked. */
export interface FormParts {
  ending: string;
  stem: string;
}

const CASES = [
  { slug: "nominative", name: "nominative", person: "Kto?", thing: "Čo?" },
  { slug: "genitive", name: "genitive", person: "Koho?", thing: "Čoho?" },
  { slug: "dative", name: "dative", person: "Komu?", thing: "Čomu?" },
  { slug: "accusative", name: "accusative", person: "Koho?", thing: "Čo?" },
  { slug: "locative", name: "locative", person: "O kom?", thing: "O čom?" },
  { slug: "instrumental", name: "instrumental", person: "S kým?", thing: "S čím?" },
] as const;

export function splitFormFromLemma(form: string, lemma: string): FormParts {
  let shared = 0;
  while (
    shared < form.length &&
    shared < lemma.length &&
    form[shared] === lemma[shared]
  ) {
    shared += 1;
  }

  return { stem: form.slice(0, shared), ending: form.slice(shared) };
}

/**
 * Rows for the Forms table. Masculine animate nouns name people and animals, so
 * they take the kto / koho questions; other genders get both question words.
 */
export function declensionRows(
  lemma: string,
  declension: NounDeclension,
  gender?: NounGender,
): DeclensionRow[] {
  return CASES.map((grammaticalCase, index) => ({
    caseName: grammaticalCase.name,
    caseSlug: grammaticalCase.slug,
    question:
      gender === "masculine-animate"
        ? grammaticalCase.person
        : `${grammaticalCase.person} ${grammaticalCase.thing}`,
    singular: splitFormFromLemma(declension.singular[index]!, lemma),
    plural: splitFormFromLemma(declension.plural[index]!, lemma),
  }));
}
