import { normalizeLemma } from "../frequency";
import { searchFormsForLemma } from "../search/forms";

export type HighlightPart = { hit: boolean; text: string };

const TOKEN_RE = /[\p{L}\p{M}]+/gu;

/** Skip short surface forms (`je`, `si`, `sú`) — too many false positives. */
const MIN_FORM_LENGTH = 3;

function formKeysForLemma(lemma: string, category: string): Set<string> {
  const keys = new Set<string>();
  const lemmaLower = lemma.toLocaleLowerCase("sk");

  const add = (form: string) => {
    const trimmed = form.trim();
    if (!trimmed) return;

    const lower = trimmed.toLocaleLowerCase("sk");
    const isLemma = lower === lemmaLower;
    if (!isLemma && lower.length < MIN_FORM_LENGTH) return;

    keys.add(lower);
    keys.add(normalizeLemma(trimmed));
  };

  add(lemma);
  for (const form of searchFormsForLemma(lemma, category)) {
    add(form);
  }

  return keys;
}

function tokenMatches(token: string, keys: Set<string>): boolean {
  return keys.has(token.toLocaleLowerCase("sk")) || keys.has(normalizeLemma(token));
}

/**
 * Bold the first whole-word hit of the lemma or a known surface form.
 * Safer than raw substring: word boundaries + min form length.
 */
export function highlightLemmaInText(
  slovakLine: string,
  lemma: string,
  category = "",
): HighlightPart[] {
  const needle = lemma.trim();
  if (!needle) return [{ text: slovakLine, hit: false }];

  const keys = formKeysForLemma(needle, category);
  TOKEN_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(slovakLine)) !== null) {
    const token = match[0]!;
    if (!tokenMatches(token, keys)) continue;

    const at = match.index;
    const parts: HighlightPart[] = [];
    if (at > 0) parts.push({ text: slovakLine.slice(0, at), hit: false });
    parts.push({ text: slovakLine.slice(at, at + token.length), hit: true });
    if (at + token.length < slovakLine.length) {
      parts.push({ text: slovakLine.slice(at + token.length), hit: false });
    }
    return parts;
  }

  return [{ text: slovakLine, hit: false }];
}
