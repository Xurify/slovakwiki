/** Forms that are Czech, not Slovak. Letters ř, ě, ů are checked separately. */
const CZECH_WORDS = new Set([
  "jsem",
  "jsi",
  "jsme",
  "jste",
  "jsou",
  "jak",
  "já",
  "ovoce",
  "podzim",
  "dovolená",
  "restaurace",
  "nyní",
  "kromě",
  "protože",
]);

export function hasCzech(text: string): boolean {
  if (/[řěůŘĚŮ]/u.test(text)) return true;
  return text
    .toLocaleLowerCase("sk")
    .split(/[^\p{L}]+/u)
    .some((word) => CZECH_WORDS.has(word));
}

export function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}

/** Every start index of `needle` in `haystack`, ignoring case. */
export function findAll(haystack: string, needle: string): number[] {
  if (!needle) return [];
  const hay = haystack.toLocaleLowerCase("sk");
  const target = needle.toLocaleLowerCase("sk");
  const found: number[] = [];
  for (let at = hay.indexOf(target); at >= 0; at = hay.indexOf(target, at + 1)) {
    found.push(at);
  }
  return found;
}

/** A quote from a model's issue, without the punctuation and ellipses around it. */
export function quotePieces(quote: string): string[] {
  return quote
    .split(/…|\.\.\./u)
    .map((piece) => piece.replace(/^[\s"„“'.,!?;:()-]+|[\s"„“'.,!?;:()-]+$/gu, ""))
    .filter((piece) => piece.length > 0);
}

/** What a spoken answer looks like when speech-to-text drops punctuation and capitals. */
export function asTranscript(text: string): string {
  return text
    .toLocaleLowerCase("sk")
    .replace(/[.,!?;:„“"…–]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}
