const VOWELS = new Set("aáäeéiíoóôuúyý");
const LONG_VOWELS = new Set("áéíóúýô");
const SYLLABIC_LIQUIDS = new Set("rŕlĺ");
const BILABIALS = new Set("mbp");

/** What the lips do on a syllable: `r` is a syllabic r/l or a hum, held near neutral. */
export type VowelShape = "a" | "e" | "i" | "o" | "u" | "r";

/** `ä` is said [e]; `y` like `i`; `ô` [u̯o] starts rounded. */
const VOWEL_SHAPES: Record<string, VowelShape> = {
  a: "a",
  á: "a",
  ä: "e",
  e: "e",
  é: "e",
  i: "i",
  í: "i",
  y: "i",
  ý: "i",
  o: "o",
  ó: "o",
  ô: "o",
  u: "u",
  ú: "u",
};

export interface SlovakSyllable {
  /** Consonants spoken before the vowel (word-final ones join the last syllable). */
  consonants: number;
  /** Long vowel or diphthong. */
  long: boolean;
  /** An m, b or p in the onset shuts the lips before the vowel. */
  shutBefore?: boolean;
  /** A word-final m, b or p shuts them after it (`som`, `mám`). */
  shutAfter?: boolean;
  vowel: VowelShape;
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
  let shut = false;

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

      // ia/ie/iu glide into their second vowel; au/eu/ou open on their first.
      const shapeLetter = diphthong && letter === "i" ? next : letter;
      syllables.push({
        consonants,
        long: diphthong || LONG_VOWELS.has(letter),
        ...(shut && { shutBefore: true }),
        vowel: VOWEL_SHAPES[shapeLetter],
      });
      consonants = 0;
      shut = false;
      if (diphthong) index += 1;
      continue;
    }

    const syllabic =
      SYLLABIC_LIQUIDS.has(letter) &&
      letters.length > 1 &&
      !VOWELS.has(previous) &&
      !VOWELS.has(next);

    if (syllabic) {
      syllables.push({
        consonants,
        long: letter === "ŕ" || letter === "ĺ",
        ...(shut && { shutBefore: true }),
        vowel: "r",
      });
      consonants = 0;
      shut = false;
      continue;
    }

    consonants += 1;
    shut ||= BILABIALS.has(letter);
  }

  const last = syllables.at(-1);
  if (last) {
    last.consonants += consonants;
    if (shut) last.shutAfter = true;
  }
  // A one-letter word (`v`, `s`, `z`, `k`) is said with the next one, but an
  // interjection with no vowel (`hm`, `pst`) is a syllable of its own.
  else if (letters.length > 1) {
    syllables.push({ consonants: letters.length - 1, long: false, vowel: "r" });
  }

  return syllables;
}
