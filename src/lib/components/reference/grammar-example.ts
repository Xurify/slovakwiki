import { searchFormsForLemma } from "$lib/catalog/search/forms";
import { splitGrammarRichText } from "$lib/components/reference/grammar-rich-text";

export type ExamplePart = { text: string; highlighted: boolean };

const WORD = /\p{L}+/gu;

function lower(text: string): string {
  return text.toLocaleLowerCase("sk");
}

/**
 * The word sequences a note bolds, each as it may stand in the sentence. A
 * note names the infinitive (`**učiť sa**`) while the sentence conjugates it
 * or moves `sa` (`sa učím`), so an infinitive also matches its forms, alone or
 * with the rest of the phrase; an affix (`**-to**`) matches nothing.
 */
function boldPhrases(note: string): string[][] {
  const phrases: string[][] = [];

  for (const part of splitGrammarRichText(note)) {
    if (part.type !== "em" || /^-|-$/.test(part.value)) continue;

    const [head, ...rest] = (part.value.match(WORD) ?? []).map(lower);
    if (!head) continue;

    phrases.push([head, ...rest]);
    if (!head.endsWith("ť")) continue;

    for (const form of [head, ...searchFormsForLemma(head, "Verbs").map(lower)]) {
      phrases.push([form], [form, ...rest]);
    }
  }

  return phrases;
}

/**
 * An example sentence split into words and the rest, with the words to notice
 * lit: any form the table above shows, and whatever the note bolds where the
 * sentence says it in full.
 */
export function exampleParts(
  slovak: string,
  forms: ReadonlySet<string>,
  note?: string,
): ExamplePart[] {
  const parts = slovak
    .split(/(\p{L}+)/u)
    .filter((text) => text !== "")
    .map((text) => ({ text, highlighted: forms.has(lower(text)) }));

  if (!note) return parts;

  const words = parts.filter((part) => /^\p{L}/u.test(part.text));
  for (const phrase of boldPhrases(note)) {
    for (let start = 0; start + phrase.length <= words.length; start += 1) {
      const run = words.slice(start, start + phrase.length);
      if (run.every((word, index) => lower(word.text) === phrase[index])) {
        for (const word of run) word.highlighted = true;
      }
    }
  }

  return parts;
}
