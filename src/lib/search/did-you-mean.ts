import { normalizeSearchText } from "$lib/catalog/search/ui";

export interface SpellingCandidate {
  /** Lower is more common; lemmas without a rank sort after ranked ones. */
  frequencyRank?: number;
  /** Normalized spelling compared against the query. */
  normalized: string;
  /** Spelling shown to the learner, with diacritics. */
  text: string;
}

/**
 * Optimal string alignment distance: Levenshtein plus adjacent swaps, so tohot → tohto
 * costs 1. Stops early once every cell in a row exceeds `max`.
 */
export function editDistance(first: string, second: string, max: number): number {
  if (Math.abs(first.length - second.length) > max) {
    return max + 1;
  }

  let previousPrevious: number[] = [];
  let previous = Array.from({ length: second.length + 1 }, (_, index) => index);

  for (let row = 1; row <= first.length; row += 1) {
    const current = [row];
    let rowMin = row;

    for (let column = 1; column <= second.length; column += 1) {
      const cost = first[row - 1] === second[column - 1] ? 0 : 1;
      let value = Math.min(
        previous[column]! + 1,
        current[column - 1]! + 1,
        previous[column - 1]! + cost,
      );

      if (
        row > 1 &&
        column > 1 &&
        first[row - 1] === second[column - 2] &&
        first[row - 2] === second[column - 1]
      ) {
        value = Math.min(value, previousPrevious[column - 2]! + 1);
      }

      current.push(value);
      rowMin = Math.min(rowMin, value);
    }

    if (rowMin > max) {
      return max + 1;
    }

    previousPrevious = previous;
    previous = current;
  }

  return previous[second.length]!;
}

/** One typo for short words, two from seven letters on. */
export function maxTypos(length: number): number {
  return length >= 7 ? 2 : 1;
}

/**
 * Closest known spelling to a single-word query, or null when the query is already
 * a known word, is too short to guess, or nothing is close enough.
 */
export function suggestSpelling(
  query: string,
  candidates: readonly SpellingCandidate[],
): SpellingCandidate | null {
  const normalized = normalizeSearchText(query);
  if (normalized.length < 3 || /\s/u.test(normalized)) {
    return null;
  }

  const max = maxTypos(normalized.length);
  let best: SpellingCandidate | null = null;
  let bestDistance = max + 1;

  for (const candidate of candidates) {
    if (candidate.normalized === normalized) {
      return null;
    }

    const distance = editDistance(normalized, candidate.normalized, max);
    if (distance > max) continue;

    if (
      distance < bestDistance ||
      (distance === bestDistance && best && isBetterTie(normalized, candidate, best))
    ) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

/**
 * Swapped or mistyped letters keep the length (tohot → tohto, not toho), so a
 * same-length spelling wins a tie before frequency decides.
 */
function isBetterTie(
  query: string,
  candidate: SpellingCandidate,
  current: SpellingCandidate,
): boolean {
  const candidateGap = Math.abs(candidate.normalized.length - query.length);
  const currentGap = Math.abs(current.normalized.length - query.length);
  if (candidateGap !== currentGap) return candidateGap < currentGap;
  return (
    (candidate.frequencyRank ?? Number.MAX_SAFE_INTEGER) <
    (current.frequencyRank ?? Number.MAX_SAFE_INTEGER)
  );
}
