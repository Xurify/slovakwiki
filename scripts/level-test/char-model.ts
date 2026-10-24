import { foldDiacritics } from "../../src/lib/level-test/grade";
import { seededRandom } from "../../src/lib/level-test/plan";

export { foldDiacritics, seededRandom };

const START = "^";
const END = "$";

/**
 * Character n-gram model over lemmas. Sampling invents Slovak-looking strings
 * (pseudoword candidates); the average log-probability says how "wordlike" a
 * string is, the DET's frequency stand-in for words that have no frequency.
 */
export class CharModel {
  readonly order: number;
  private readonly counts: Map<string, Map<string, number>>[];
  private readonly alphabet = new Set<string>();

  constructor(order: number) {
    this.order = order;
    this.counts = Array.from({ length: order }, () => new Map());
  }

  private padded(word: string): string[] {
    return [...Array<string>(this.order - 1).fill(START), ...word, END];
  }

  train(words: readonly string[]): void {
    for (const word of words) {
      const chars = this.padded(word.toLocaleLowerCase("sk"));
      for (let index = this.order - 1; index < chars.length; index++) {
        const next = chars[index] ?? END;
        this.alphabet.add(next);
        for (let size = 0; size < this.order; size++) {
          const context = chars.slice(index - size, index).join("");
          const table = this.counts[size] as Map<string, Map<string, number>>;
          const row = table.get(context) ?? new Map<string, number>();
          row.set(next, (row.get(next) ?? 0) + 1);
          table.set(context, row);
        }
      }
    }
  }

  /** Interpolated estimate; higher orders get more weight when they have data. */
  private probability(history: readonly string[], next: string): number {
    const vocabulary = Math.max(1, this.alphabet.size);
    let probability = 1 / vocabulary;
    for (let size = 1; size < this.order + 1; size++) {
      const contextSize = size - 1;
      const context = history.slice(history.length - contextSize).join("");
      const row = this.counts[contextSize]?.get(context);
      if (!row) continue;
      const total = [...row.values()].reduce((sum, value) => sum + value, 0);
      const seen = row.size;
      const lambda = total / (total + seen);
      probability = lambda * ((row.get(next) ?? 0) / total) + (1 - lambda) * probability;
    }
    return probability;
  }

  averageLogProb(word: string): number {
    const chars = this.padded(word.toLocaleLowerCase("sk"));
    let total = 0;
    let steps = 0;
    for (let index = this.order - 1; index < chars.length; index++) {
      total += Math.log(this.probability(chars.slice(0, index), chars[index] ?? END));
      steps += 1;
    }
    return total / steps;
  }

  /** Back off to the longest context with data; `temperature` < 1 favours common paths. */
  sample(random: () => number, temperature = 1): string {
    const history = Array<string>(this.order - 1).fill(START);
    const out: string[] = [];

    while (out.length < 16) {
      let row: Map<string, number> | undefined;
      for (let size = this.order - 1; size >= 0 && !row; size--) {
        row = this.counts[size]?.get(history.slice(history.length - size).join(""));
      }
      if (!row) break;

      const entries = [...row.entries()].map(
        ([char, count]) => [char, Math.pow(count, 1 / temperature)] as const,
      );
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
      let pick = random() * total;
      let next = END;
      for (const [char, weight] of entries) {
        pick -= weight;
        if (pick <= 0) {
          next = char;
          break;
        }
      }

      if (next === END) break;
      out.push(next);
      history.push(next);
    }

    return out.join("");
  }
}

const SLOVAK_LETTERS = /^[a-záäčďéíĺľňóôŕšťúýž]+$/u;
const SHORT_VOWEL = new Set(["a", "ä", "e", "i", "o", "u", "y"]);
const LONG_VOWEL = new Set(["á", "é", "í", "ó", "ú", "ý", "ô"]);

/**
 * Spelling rules a real Slovak lemma would follow: `ä` only after a labial,
 * no `y` after a soft consonant, no caron before `e`/`i`, no doubled vowels,
 * and the rhythmic law (no two long syllables in a row).
 */
export function isPlausibleSlovak(word: string): boolean {
  if (!SLOVAK_LETTERS.test(word)) return false;
  if (/(^|[^bpmv])ä/u.test(word)) return false;
  if (/[ďťňľčšžcj][yý]/u.test(word)) return false;
  if (/[ďťňľ][eéiíy]/u.test(word)) return false;
  if (/([aeiouyáéíóúý])\1/u.test(word)) return false;
  if (/[aäeiouyáéíóúýô]{3}/u.test(word)) return false;

  const chars = [...word];
  let previousLong: boolean | null = null;
  for (let index = 0; index < chars.length; index++) {
    const char = chars[index] ?? "";
    let long: boolean | null = null;
    if (char === "i" && ["a", "e", "u"].includes(chars[index + 1] ?? "") && index > 0) {
      long = true;
      index += 1;
    } else if (LONG_VOWEL.has(char)) {
      long = true;
    } else if (SHORT_VOWEL.has(char)) {
      long = false;
    }
    if (long === null) continue;
    if (long && previousLong) return false;
    previousLong = long;
  }

  return true;
}
