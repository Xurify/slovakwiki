const VOWELS = new Set("aáäeéiíoóôuúyý");
const LONG_VOWELS = new Set("áéíóúýô");
const SYLLABIC_LIQUIDS = new Set("rŕlĺ");

export interface SlovakSyllable {
  /** Consonants spoken before the vowel (word-final ones join the last syllable). */
  consonants: number;
  /** Long vowel or diphthong. */
  long: boolean;
}

/**
 * Syllables of one Slovak word by its vowel nuclei: long vowels, the
 * diphthongs `ia ie iu ô` (plus final `-ou` and initial `au`/`eu`), and
 * syllabic `r ŕ l ĺ` between consonants (`krk`, `štvrtok`, `slnko`).
 *
 * After a long syllable, `i` + `a/e/u` is read as two syllables
 * (`Má-ri-a`, `re-gis-trá-ci-u`): the rhythmic law keeps native words from
 * putting a long diphthong there, so the sequence is a loanword hiatus.
 */
export function slovakSyllables(word: string): SlovakSyllable[] {
  const letters = [
    ...word
      .toLocaleLowerCase("sk")
      .replace(/ch|dž|dz/g, "x")
      .replace(/[^\p{L}]/gu, ""),
  ];
  const syllables: SlovakSyllable[] = [];
  let consonants = 0;

  for (let index = 0; index < letters.length; index += 1) {
    const letter = letters[index];
    const previous = letters[index - 1] ?? "";
    const next = letters[index + 1] ?? "";

    if (VOWELS.has(letter)) {
      const afterLong = syllables.at(-1)?.long ?? false;
      const diphthong =
        (letter === "i" && "aeu".includes(next) && next !== "" && !afterLong) ||
        (letter === "o" && next === "u" && index + 2 === letters.length) ||
        ("ae".includes(letter) && next === "u" && index === 0);

      syllables.push({ consonants, long: diphthong || LONG_VOWELS.has(letter) });
      consonants = 0;
      if (diphthong) index += 1;
      continue;
    }

    const syllabic =
      SYLLABIC_LIQUIDS.has(letter) &&
      letters.length > 1 &&
      !VOWELS.has(previous) &&
      !VOWELS.has(next);

    if (syllabic) {
      syllables.push({ consonants, long: letter === "ŕ" || letter === "ĺ" });
      consonants = 0;
      continue;
    }

    consonants += 1;
  }

  const last = syllables.at(-1);
  if (last) last.consonants += consonants;

  return syllables;
}
