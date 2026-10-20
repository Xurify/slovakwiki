import { caseTopics, grammarEntries, pronunciationEntries, words } from "../entries";
import { dictionaryPathForSense } from "../dictionary/lemma-senses";
import { lessons } from "../lessons";
import { practiceSets } from "../practice";
import { searchFormsForLemma } from "./forms";
import { wordCategoryLabel } from "./pronouns";
import { normalizeSearchText, type SearchDocKind } from "./ui";
import type { WordRegister } from "../types";

export type { SearchDocKind } from "./ui";
export {
  searchIdleHints,
  searchKindChips,
  searchKindLabels,
  searchMetaLabel,
  sentenceCase,
} from "./ui";

import { SEARCH_WEIGHTS, type SearchWeight } from "./ui";

export { SEARCH_WEIGHTS, type SearchWeight };

export interface SearchSection {
  text: string;
  weight: SearchWeight;
}

export interface SearchExample {
  english: string;
  slovak: string;
}

export interface SearchDocument {
  category?: string;
  /** All sections joined, for tests and tooling. */
  content: string;
  /** Word example sentences, so the results page can show the matching line. */
  examples?: SearchExample[];
  kind: SearchDocKind;
  register?: WordRegister;
  sections: SearchSection[];
  summary: string;
  title: string;
  url: string;
}

function withNormalized(parts: string[]): string {
  const joined = parts.filter(Boolean).join("\n");
  const normalized = normalizeSearchText(joined);
  return normalized && normalized !== joined.toLocaleLowerCase("sk")
    ? `${joined}\n${normalized}`
    : joined;
}

type SectionParts = Partial<Record<SearchWeight, Array<string | undefined>>>;

function sections(parts: SectionParts): Pick<SearchDocument, "content" | "sections"> {
  const built: SearchSection[] = [];
  for (const weight of Object.keys(SEARCH_WEIGHTS) as SearchWeight[]) {
    const values = (parts[weight] ?? []).filter((value): value is string =>
      Boolean(value),
    );
    if (values.length > 0) {
      built.push({ weight, text: withNormalized(values) });
    }
  }
  return { sections: built, content: built.map((section) => section.text).join("\n") };
}

let cachedDocuments: SearchDocument[] | undefined;

export function buildSearchDocuments(): SearchDocument[] {
  if (cachedDocuments) return cachedDocuments;

  const documents: SearchDocument[] = [];

  for (const entry of words) {
    documents.push({
      url: dictionaryPathForSense(entry, words),
      kind: "word",
      title: entry.slovak,
      summary: entry.english,
      category: wordCategoryLabel(entry.slovak, entry.category),
      ...(entry.register ? { register: entry.register } : {}),
      ...sections({
        headword: [entry.slovak],
        forms: [
          ...(entry.aliases ?? []),
          ...searchFormsForLemma(entry.slovak, entry.category),
        ],
        gloss: [entry.english],
        body: [entry.summary, entry.category, ...entry.tags],
        examples: entry.examples.flatMap((example) => [example.slovak, example.english]),
      }),
      ...(entry.examples.length > 0
        ? {
            examples: entry.examples.map(({ slovak, english }) => ({ slovak, english })),
          }
        : {}),
    });
  }

  for (const entry of grammarEntries) {
    documents.push({
      url: `/grammar/${entry.slug}`,
      kind: "grammar",
      title: entry.slovak,
      summary: entry.summary,
      ...sections({
        headword: [entry.slovak, entry.english],
        forms: entry.aliases ?? [],
        gloss: [entry.summary, ...entry.tags],
        body: [
          entry.category,
          entry.lookFor,
          entry.watchOut.replace(/\*/g, ""),
          ...entry.rule,
          ...entry.pattern.lines,
          ...(entry.morePatterns ?? []).flatMap((pattern) => pattern.lines),
          ...entry.body,
        ],
        examples: entry.examples.flatMap((example) => [example.slovak, example.english]),
      }),
    });
  }

  for (const entry of pronunciationEntries) {
    documents.push({
      url: `/pronunciation/${entry.slug}`,
      kind: "pronunciation",
      title: entry.slovak,
      summary: entry.summary,
      ...sections({
        headword: [entry.slovak, entry.english],
        forms: entry.aliases ?? [],
        gloss: [entry.summary, ...entry.tags],
        body: [entry.goal, entry.mouthCue, entry.category],
        examples: [
          ...entry.practiceWords,
          entry.practicePhrase.slovak,
          entry.practicePhrase.english,
        ],
      }),
    });
  }

  for (const topic of caseTopics) {
    documents.push({
      url: `/grammar/cases/${topic.slug}`,
      kind: "case",
      title: topic.name,
      summary: topic.summary,
      ...sections({
        headword: [topic.name],
        gloss: [topic.question, topic.summary],
        body: [...topic.researchPrompts, ...topic.body],
        examples: topic.examples.flatMap((example) => [example.slovak, example.english]),
      }),
    });
  }

  for (const lesson of lessons) {
    documents.push({
      url: `/lessons/${lesson.track}/${lesson.slug}`,
      kind: "lesson",
      title: lesson.title,
      summary: lesson.promise,
      ...sections({
        headword: [lesson.title],
        gloss: [lesson.promise, lesson.group, lesson.pattern?.title],
        examples: lesson.keyPhrases.flatMap((phrase) => [phrase.slovak, phrase.english]),
      }),
    });
  }

  for (const set of practiceSets) {
    documents.push({
      url: `/practice/${set.id}`,
      kind: "practice",
      title: set.title,
      summary: `Practice set · ${set.track}`,
      ...sections({
        headword: [set.title],
        gloss: [set.summary],
        body: [set.id, set.track, set.lessonId],
      }),
    });
  }

  cachedDocuments = documents;
  return documents;
}
