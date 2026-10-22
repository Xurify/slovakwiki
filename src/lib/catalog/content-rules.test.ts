import { describe, expect, it } from "vitest";

import { maybeMaterializeBuildItem } from "$lib/learning/exercises/materialize-build";
import {
  DEMONSTRATIVE_KINDS,
  materializeDemonstrativeItem,
} from "$lib/learning/demonstratives/session";
import {
  POSSESSIVE_KINDS,
  materializePossessiveItem,
  seededRng,
} from "$lib/learning/possessives/session";
import { daysDatesTimePracticeItemIds } from "$lib/learning/time/practice-catalog";
import {
  materializeDaysDatesTimeItem,
  type DaysDatesTimeKind,
} from "$lib/learning/time/session";
import { caseTopics, grammarEntries, pronunciationEntries, words } from "./entries";
import { lessons } from "./lessons";
import { listeningEpisodes } from "./listening";
import { practiceItems } from "./practice";

interface ContentRule {
  /** Keys whose text is a deliberately wrong form shown to the learner. */
  allowIn?: string[];
  pattern: RegExp;
  rule: string;
}

/**
 * Statements that once shipped wrong. Each pattern matches the wrong phrasing;
 * `rule` is what is true instead. A form written as *form is a deliberate
 * example of an error and is skipped.
 */
const CONTENT_RULES: ContentRule[] = [
  {
    pattern: /\bnie\**\s+(?:attaches|joins)\b/iu,
    rule: "Verbs take the prefix ne- (nerozumiem, nemám); only present-tense byť keeps a separate nie: nie som, nie si, nie je, nie sme, nie ste, nie sú.",
  },
  {
    pattern: /\bput \**nie\** (?:with|on|before) the verb\b/iu,
    rule: "Verbs take the prefix ne-, not nie.",
  },
  {
    pattern: /\bdva\** (?:is|are|goes with|for)\b[^.;]*\bneuter\b/iu,
    rule: "Neuter nouns take dve (dve autá); dva is masculine inanimate (dva stoly) and men take dvaja.",
  },
  {
    pattern:
      /\bpeople (?:take|keep) \**(?:môjho|tvojho|svojho|nášho|vášho|toho|tohto|tamtoho)\b/iu,
    rule: "In the accusative singular, masculine nouns for people and animals take toho/môjho (toho psa, môjho psa).",
  },
  {
    pattern:
      /\**(?:môjho|tvojho|svojho|nášho|vášho|toho|tohto|tamtoho)\** (?:is|are) (?:only )?for people\b/iu,
    rule: "Toho/môjho is the accusative singular for people and animals alike (toho psa).",
  },
  {
    pattern: /\b(?:toho|môjho) for people, \**(?:ten|môj)\** for things\b/iu,
    rule: "Toho/môjho covers people and animals in the accusative singular.",
  },
  {
    pattern: /\bin the accusative, masculine nouns for people change\b/iu,
    rule: "Masculine nouns for people and animals change in the accusative singular.",
  },
  {
    pattern: /^masculine, a person$/iu,
    rule: "The accusative singular toho/tohto/tamtoho covers people and animals: label it a person or animal.",
  },
  {
    pattern: /\binstrumental, with one person\b/iu,
    rule: "Tým/týmto/tamtým is the masculine and neuter instrumental singular, for people and things; feminine is tou.",
  },
  {
    pattern: /\**tým\** is (?:the )?instrumental singular\b/iu,
    rule: "Tým is the masculine and neuter instrumental singular; feminine is tou (s tou ženou).",
  },
  {
    pattern: /\bto\** never changes\b/iu,
    rule: "Only presentational to (To je …, To sú …) stays to; elsewhere to declines: o tom, s tým, bojím sa toho.",
  },
  {
    pattern: /\bdoes the job of (?:english )?[“"]the[”"]/iu,
    rule: "Slovak has no articles; ten is a demonstrative, not a stand-in for “the”.",
  },
  {
    pattern: /\b(?:ísť|chodiť)\b[^.]{0,80}\bdifferent aspect\b/iu,
    rule: "Ísť and chodiť are both imperfective; they differ in one trip versus habit, not aspect.",
  },
  {
    pattern: /\bwhat moves to the front\b/iu,
    rule: "In Slovak the new or emphasized information comes last.",
  },
  {
    pattern: /\btools[^.]{0,40}especially after \**s\** or \**so\**/iu,
    rule: "Company takes s/so + instrumental; a tool or means takes the bare instrumental: píšem perom.",
  },
  {
    pattern: /\bduration uses \**o\** \+ accusative\b/iu,
    rule: "O + accusative is “in X time from now” (o dve hodiny); a duration is a bare accusative (dve hodiny).",
  },
  {
    pattern: /\**so\** comes only before\b/iu,
    rule: "So also appears before some clusters and pronouns: so psom, so mnou.",
  },
  {
    pattern: /\bcaron marks[^.]*\bvowels\b/iu,
    rule: "The caron (mäkčeň) marks consonants only; ä has two dots and ô a vokáň.",
  },
  {
    pattern: /\brokov\** after the number\b|\broky\** goes with 2, 3,? and 4\b/iu,
    rule: "1 rok, 2–4 roky, 5+ rokov; compounds take rokov too: dvadsaťdva rokov.",
  },
  {
    pattern: /\+ number \+ \**eur\b/iu,
    rule: "Euro agrees with the number: jedno euro, dve eurá, päť eur.",
  },
  {
    pattern: /\bdačo\** is (?:eastern|dialect)/iu,
    rule: "KSSJ and SSSJ list dačo without a label: it is standard Slovak.",
  },
  {
    allowIn: ["wrong"],
    pattern: /(?<![\p{L}*])nieje\b/iu,
    rule: "Nie je is two words.",
  },
  {
    allowIn: ["wrong"],
    pattern: /(?:^|[\s(„"])v štvrt(?:ok|ku|kom|ky|kami)\b/iu,
    rule: "Use vo before štvrtok: vo štvrtok.",
  },
  {
    // Proper names keep their Czech spelling (Dvořák), so only common words count.
    allowIn: ["wrong"],
    pattern: /(?<![\p{L}*])\p{Ll}\p{L}*[řěů]/u,
    rule: "Czech letter in Slovak text.",
  },
];

/**
 * A long syllable makes the next one short inside a word: čítam, krásny, vážnych.
 * Matches a long vowel or diphthong, its consonants, then a long ending.
 */
const RHYTHMIC_LAW =
  /(?<![\p{L}*])\p{L}*?(?:[áéíóúýô]|i[aeu])([^\P{L}aáäeéiíoóôuúyý]+)(?:ý|ého|ému|ých|ými|ám|áš|áme|áte|ím|íš|íme|íte)(?!\p{L})/giu;

/** Instrumental pronouns keep -ím after a long syllable (niečím, ničím). */
const RHYTHMIC_EXCEPTIONS = new Set(["niečím", "ničím", "čímsi", "hocičím"]);

/** A consonant run with r or l inside (ú-pl-ný) holds its own syllable, so the law skips it. */
function hasSyllabicLiquid(consonants: string): boolean {
  return /[^\P{L}lrĺŕ][lrĺŕ][^\P{L}lrĺŕ]/u.test(consonants);
}

function rhythmicLawBreaks(text: string): string[] {
  return [...text.matchAll(RHYTHMIC_LAW)]
    .filter(([word, consonants]) => {
      if (RHYTHMIC_EXCEPTIONS.has(word.toLocaleLowerCase("sk"))) return false;
      return !hasSyllabicLiquid(consonants ?? "");
    })
    .map(([word]) => word);
}

interface Text {
  key: string;
  path: string;
  text: string;
}

function collectTexts(value: unknown, path: string, key: string, out: Text[]): void {
  if (typeof value === "string") {
    out.push({ key, path, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectTexts(item, `${path}[${index}]`, key, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) {
      collectTexts(child, `${path}.${childKey}`, childKey, out);
    }
  }
}

function generatedTasks(): unknown[] {
  const seeds = Array.from({ length: 40 }, (_, seed) => seededRng(seed + 1));
  return [
    ...POSSESSIVE_KINDS.flatMap((kind) =>
      seeds.map((rng) => materializePossessiveItem(kind, rng)),
    ),
    ...DEMONSTRATIVE_KINDS.flatMap((kind) =>
      seeds.map((rng) => materializeDemonstrativeItem(kind, rng)),
    ),
    ...daysDatesTimePracticeItemIds.flatMap((kind) =>
      seeds.map((rng) => materializeDaysDatesTimeItem(kind as DaysDatesTimeKind, rng)),
    ),
    ...practiceItems.flatMap((item) =>
      seeds.map((rng) => maybeMaterializeBuildItem(item, rng)),
    ),
  ];
}

function learnerTexts(): Text[] {
  const texts: Text[] = [];
  const sources: Record<string, unknown> = {
    lessons,
    practiceItems,
    grammarEntries,
    caseTopics,
    pronunciationEntries,
    listeningEpisodes,
    words,
    generated: generatedTasks(),
  };
  for (const [name, source] of Object.entries(sources)) {
    collectTexts(source, name, name, texts);
  }
  return texts;
}

describe("learner-facing content rules", () => {
  it("does not repeat statements that once shipped wrong", () => {
    const problems = new Map<string, string>();
    for (const { key, path, text } of learnerTexts()) {
      for (const { allowIn, pattern, rule } of CONTENT_RULES) {
        if (allowIn?.includes(key) || !pattern.test(text)) continue;
        const problem = `"${text}" → ${rule}`;
        if (!problems.has(problem)) problems.set(problem, `${path}: ${problem}`);
      }
    }
    expect([...problems.values()]).toEqual([]);
  });

  it("keeps the rhythmic law: no two long syllables in a row", () => {
    const problems = new Map<string, string>();
    for (const { key, path, text } of learnerTexts()) {
      if (key === "wrong") continue;
      for (const word of rhythmicLawBreaks(text)) {
        if (!problems.has(word)) problems.set(word, `${path}: ${word} in "${text}"`);
      }
    }
    expect([...problems.values()]).toEqual([]);
  });
});
