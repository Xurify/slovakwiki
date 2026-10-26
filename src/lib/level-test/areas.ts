import type { ItemResponse, StudyArea, WordTag } from "./types";

/**
 * Answers per area the adaptive section aims for. Above MIN_EVIDENCE so an
 * area is judged, not guessed; the pickers steer toward areas still short.
 */
export const AREA_TARGET = 5;

/** Fewer answers than this and the results say "Not enough data" for a part. */
export const AREA_MINIMUM = 3;

export function areaForTag(tag: WordTag | undefined): StudyArea {
  switch (tag?.class) {
    case "noun":
      return "nouns";
    case "adjective":
      return "adjectives";
    case "pronoun":
      return "pronouns";
    case "numeral":
      return "numerals";
    case "verb":
      return "conjugation";
    case "functionWord":
      return "functionWords";
    default:
      return "vocabulary";
  }
}

/** Counts each answer once per area it is evidence for (a dictation can feed several). */
export function addCoverage(
  coverage: Map<StudyArea, number>,
  responses: readonly ItemResponse[],
): void {
  for (const response of responses) {
    const areas = new Set<StudyArea>();
    if (response.area) areas.add(response.area);
    for (const tag of response.wordTags ?? []) areas.add(areaForTag(tag));
    for (const area of areas) coverage.set(area, (coverage.get(area) ?? 0) + 1);
  }
}
