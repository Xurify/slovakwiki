/**
 * Parenthetical grammar tags that appear in dictionary glosses
 * (e.g. "to admit (imperfective)"). Sense disambiguators like
 * "(sports)" stay plain text — only registered keys become tips/links.
 */

export interface GlossGrammarTerm {
  /** Lowercased match for text inside parentheses. */
  key: string;
  /** Extra keys that resolve to this term. */
  aliases?: readonly string[];
  tip: string;
  href: string;
}

export const GLOSS_GRAMMAR_TERMS: readonly GlossGrammarTerm[] = [
  {
    key: "imperfective",
    tip: "Ongoing, habitual, or unbounded action — the process, not the finish.",
    href: "/grammar/aspect#imperfective",
  },
  {
    key: "perfective",
    tip: "Completed or result-focused event — one bounded action.",
    href: "/grammar/aspect#perfective",
  },
  {
    key: "habitual",
    aliases: ["habitually"],
    tip: "Repeated or multi-direction motion, not a single trip.",
    href: "/grammar/aspect#habitual",
  },
  {
    key: "f.",
    tip: "Feminine grammatical gender.",
    href: "/grammar/grammatical-gender",
  },
  {
    key: "m.",
    tip: "Masculine grammatical gender.",
    href: "/grammar/grammatical-gender",
  },
] as const;

const termByKey = new Map<string, GlossGrammarTerm>();

for (const term of GLOSS_GRAMMAR_TERMS) {
  termByKey.set(term.key, term);
  for (const alias of term.aliases ?? []) {
    termByKey.set(alias, term);
  }
}

export function glossGrammarTermFor(parenInner: string): GlossGrammarTerm | undefined {
  return termByKey.get(parenInner.trim().toLowerCase());
}

export type GlossSegment =
  | { type: "text"; value: string }
  | { type: "term"; value: string; term: GlossGrammarTerm };

const PAREN_TERM_RE = /\(([^)]+)\)/g;

/** Split a gloss into plain text and linked grammar-term segments. */
export function splitGlossGrammarTerms(gloss: string): GlossSegment[] {
  const segments: GlossSegment[] = [];
  let lastIndex = 0;

  for (const match of gloss.matchAll(PAREN_TERM_RE)) {
    const full = match[0];
    const inner = match[1] ?? "";
    const start = match.index ?? 0;
    const term = glossGrammarTermFor(inner);

    if (start > lastIndex) {
      segments.push({ type: "text", value: gloss.slice(lastIndex, start) });
    }

    if (term) {
      segments.push({ type: "term", value: full, term });
    } else {
      segments.push({ type: "text", value: full });
    }

    lastIndex = start + full.length;
  }

  if (lastIndex < gloss.length) {
    segments.push({ type: "text", value: gloss.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: gloss }];
}
