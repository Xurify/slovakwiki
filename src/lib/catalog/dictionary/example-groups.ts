import examplePatterns from "../../../../content/dictionary/example-patterns.json";
import type { Example } from "../types";
import { highlightLemmaInText } from "./highlight-lemma";

/** Hand-placed sentences the cues would misfile: slug → label → sentences. */
const PLACED: Record<string, Record<string, string[]>> = examplePatterns;

export interface ExampleGroupLemma {
  slug: string;
  slovak: string;
  /** The meanings list (`to lay; to put`); groups follow its order. */
  english?: string;
  category?: string;
  gender?: string;
}

export interface ExampleGroup<T extends { example: Example }> {
  label: string;
  items: T[];
}

type Cue = "sa" | "si" | "z" | "že" | "location" | "mať";

interface Pattern {
  label: string;
  cues: Cue[];
  glosses: string[];
}

const LITERAL_CUES: Record<string, Cue> = {
  sa: "sa",
  si: "si",
  z: "z",
  zo: "z",
  že: "že",
  location: "location",
  mať: "mať",
};

const CUE_WORDS: Record<Exclude<Cue, "že" | "mať">, Set<string>> = {
  sa: new Set(["sa"]),
  si: new Set(["si"]),
  z: new Set(["z", "zo"]),
  location: new Set(["v", "vo", "na", "pri", "doma", "tu", "tam"]),
};

/** `mať rád` puts the form of mať right before the headword: `Mám rád`, `nemal rád`. */
const MAT_FORM = /^(ne)?(mať|mám|máš|má|máme|máte|majú|mal|mala|malo|mali)$/u;

const GLOSS_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "someone",
  "something",
  "thing",
  "person",
  "yourself",
]);

const CLAUSE_BREAK = /[,;:.!?…]/u;
const WORD_RE = /[\p{L}\p{M}']+/gu;

function words(text: string): string[] {
  return (text.toLocaleLowerCase("sk").match(WORD_RE) ?? []).map((word) =>
    word.replace(/'.*$/u, ""),
  );
}

function stem(word: string): string {
  const stripped = word.replace(/(ing|ed|es|s|e)$/u, "");
  return stripped.length >= 3 ? stripped : word;
}

function parsePattern(label: string, lemma: string): Pattern {
  const dash = label.indexOf(" — ");
  const slovak = dash === -1 ? "" : label.slice(0, dash);
  const english = dash === -1 ? label : label.slice(dash + 3);

  const headword = new Set(words(lemma));
  const cues = words(slovak)
    .filter((word) => !headword.has(word))
    .flatMap((word) => (LITERAL_CUES[word] ? [LITERAL_CUES[word]] : []));

  return { label, cues, glosses: glossList(english) };
}

function glossList(english: string): string[] {
  return english
    .replace(/\([^)]*\)/gu, "")
    .split(/[/;,]/u)
    .map((gloss) =>
      gloss
        .trim()
        .toLowerCase()
        .replace(/^to\s+/u, ""),
    )
    .filter(Boolean);
}

/**
 * Put the groups in the order of the meanings list, so the first meaning's
 * sentences come first. Only when every curated group names one of the
 * meanings: moving a group that names none would bury the headword's own
 * pattern. A hand-placed meaning the list lacks goes last.
 */
function inMeaningOrder<T extends { example: Example }>(
  groups: ExampleGroup<T>[],
  english: string | undefined,
  lemma: string,
): ExampleGroup<T>[] {
  if (!english) return groups;
  const meanings = glossList(english);
  const own = groups.filter((group) => !group.label.includes("(see "));
  const rank = new Map<ExampleGroup<T>, number>();
  for (const group of own) {
    const glosses = parsePattern(group.label, lemma).glosses;
    const index = meanings.findIndex((meaning) => glosses.includes(meaning));
    const curated = group.items.some((item) => item.example.demonstrates);
    if (index === -1 && curated) return groups;
    rank.set(group, index === -1 ? meanings.length : index);
  }
  return [
    ...own.toSorted((a, b) => rank.get(a)! - rank.get(b)!),
    ...groups.filter((group) => !rank.has(group)),
  ];
}

interface LemmaContext {
  clause: string[];
  next: string[];
  before: string[];
}

/** The clause holding the headword, and the clause after it (for `…, že`). */
function lemmaClauses(
  slovak: string,
  lemma: string,
  category: string,
  gender?: string,
): LemmaContext | null {
  const parts = highlightLemmaInText(slovak, lemma, category, gender);
  const hitIndex = parts.findIndex((part) => part.hit);
  if (hitIndex === -1) return null;

  const before = parts
    .slice(0, hitIndex)
    .map((part) => part.text)
    .join("");
  const after = parts
    .slice(hitIndex + 1)
    .map((part) => part.text)
    .join("");
  const head = before.split(CLAUSE_BREAK).at(-1) ?? "";
  const [tail = "", ...rest] = after.split(CLAUSE_BREAK);

  return {
    clause: words(`${head} ${parts[hitIndex]!.text} ${tail}`),
    next: words(rest[0] ?? ""),
    before: words(head).slice(-2),
  };
}

function cueMatches(cue: Cue, clauses: LemmaContext | null): boolean {
  if (!clauses) return false;
  if (cue === "mať") return clauses.before.some((word) => MAT_FORM.test(word));
  if (cue === "že") return clauses.clause.includes("že") || clauses.next[0] === "že";
  const set = CUE_WORDS[cue];
  return clauses.clause.some((word) => set.has(word));
}

function glossScore(glosses: string[], english: string): number {
  const lower = english.toLowerCase();
  const exampleWords = words(english);
  let best = 0;

  for (const gloss of glosses) {
    if (
      new RegExp(`\\b${gloss.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\b`, "u").test(
        lower,
      )
    ) {
      best = Math.max(best, 100 + gloss.length);
      continue;
    }
    const hits = words(gloss)
      .filter((word) => word.length >= 3 && !GLOSS_STOPWORDS.has(word))
      .filter((word) =>
        exampleWords.some((candidate) => candidate.startsWith(stem(word))),
      );
    best = Math.max(best, hits.length);
  }

  return best;
}

/**
 * Group examples under their `demonstrates` pattern. A sentence without one
 * (Tatoeba fills those in) joins the pattern it shows: a `sa` / `si` / `z` /
 * `že` / `mať` / location cue in the headword's clause first, then the English gloss,
 * then the first pattern of the headword itself. Contrast patterns
 * (`… (see …)`) belong to another verb and never take extra sentences.
 * `content/dictionary/example-patterns.json` places by hand the sentences
 * those cues misfile, and may name a meaning no curated sentence shows.
 */
export function groupExamplesByPattern<T extends { example: Example }>(
  items: T[],
  { slug, slovak: lemma, english, category = "", gender }: ExampleGroupLemma,
): ExampleGroup<T>[] {
  const placed = new Map<string, string>();
  for (const [label, sentences] of Object.entries(PLACED[slug] ?? {})) {
    for (const sentence of sentences) placed.set(sentence, label);
  }

  const groups: ExampleGroup<T>[] = [];
  const byLabel = new Map<string, ExampleGroup<T>>();
  const unlabeled: T[] = [];

  const addTo = (label: string, item: T): void => {
    let group = byLabel.get(label);
    if (!group) {
      group = { label, items: [] };
      byLabel.set(label, group);
      groups.push(group);
    }
    group.items.push(item);
  };

  for (const item of items) {
    const label = item.example.demonstrates?.trim();
    if (label) addTo(label, item);
  }
  for (const item of items) {
    if (item.example.demonstrates?.trim()) continue;
    const label = placed.get(item.example.slovak);
    if (label) addTo(label, item);
    else unlabeled.push(item);
  }

  const patterns = groups
    .filter((group) => group.items.some((item) => item.example.demonstrates))
    .map((group) => parsePattern(group.label, lemma))
    .filter((pattern) => !pattern.label.includes("(see "));

  let other: ExampleGroup<T> | undefined;

  for (const item of unlabeled) {
    const clauses = lemmaClauses(item.example.slovak, lemma, category, gender);
    const fitting = patterns.filter((pattern) =>
      pattern.cues.every((cue) => cueMatches(cue, clauses)),
    );

    let best: Pattern | undefined;
    let bestRank = -1;
    for (const pattern of fitting) {
      const rank =
        (pattern.cues.length > 0 ? 1000 : 0) +
        glossScore(pattern.glosses, item.example.english);
      if (rank > bestRank) {
        best = pattern;
        bestRank = rank;
      }
    }
    best ??= patterns[0];

    if (best) {
      byLabel.get(best.label)!.items.push(item);
    } else {
      other ??= { label: "Other", items: [] };
      other.items.push(item);
    }
  }

  const ordered = inMeaningOrder(groups, english, lemma);
  return other ? [...ordered, other] : ordered;
}
