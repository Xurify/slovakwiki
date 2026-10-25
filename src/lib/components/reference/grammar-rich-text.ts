import {
  splitRichText,
  type EmphasisPart,
} from "$lib/components/practice/practice-feedback-ui";

export type GrammarRichPart =
  EmphasisPart | { type: "link"; value: string; href: string };

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** `[Aspect](/grammar/aspect)` links another page; the text between links keeps `**form**` marks. */
export function splitGrammarRichText(text: string): GrammarRichPart[] {
  const parts: GrammarRichPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  LINK.lastIndex = 0;
  while ((match = LINK.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...splitRichText(text.slice(lastIndex, match.index)));
    }
    parts.push({ type: "link", value: match[1] ?? "", href: match[2] ?? "" });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(...splitRichText(text.slice(lastIndex)));
  }

  return parts;
}
