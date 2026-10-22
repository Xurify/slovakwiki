import { caseTopics, grammarEntries, pronunciationEntries, words } from "../entries";
import { dictionaryPathForSense } from "../dictionary/lemma-senses";
import { lessons } from "../lessons";
import { episodeLines, episodePath, listeningEpisodes } from "../listening";
import { practiceSets } from "../practice";
import { patternSearchLines } from "../reference/grammar-pattern";
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

/** Grammar copy marks Slovak with `**bold**` and `*avoid*`. */
function plainText(text: string): string {
  return text.replace(/\*/g, "");
}

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
          ...searchFormsForLemma(entry.slovak, entry.category, entry.gender),
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
    const patterns = [entry.pattern, ...(entry.morePatterns ?? [])];
    const frames = [...(entry.contrasts?.frames ?? []), ...(entry.contrasts?.more ?? [])];
    const choices = frames.flatMap((frame) => frame.choices);
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
          plainText(entry.lookFor),
          ...entry.watchOut.map((item) =>
            plainText(
              typeof item === "string" ? item : `${item.wrong} ${item.right} ${item.why}`,
            ),
          ),
          ...entry.rule.map(plainText),
          ...patterns.flatMap(patternSearchLines),
          ...entry.body,
          ...frames.map((frame) => frame.question),
          ...choices.map((choice) => choice.when),
        ],
        examples: [
          ...[
            ...patterns.flatMap((pattern) => pattern.examples ?? []),
            ...entry.examples,
          ].flatMap((example) => [example.slovak, example.english]),
          ...choices.flatMap((choice) => [choice.slovak.text, choice.english]),
        ],
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
        body: [...topic.researchPrompts, ...topic.body].map(plainText),
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

  for (const episode of listeningEpisodes) {
    const lines = episodeLines(episode);
    documents.push({
      url: episodePath(episode),
      kind: "listening",
      title: episode.titleSk,
      summary: episode.promise,
      ...sections({
        headword: [episode.titleSk, episode.title, episode.topic],
        gloss: [episode.promise, episode.level],
        body: episode.chapters.flatMap((chapter) => [chapter.titleSk, chapter.title]),
        examples: [
          ...episode.vocabulary.flatMap((phrase) => [phrase.slovak, phrase.english]),
          ...lines.flatMap((line) => [line.slovak, line.english]),
        ],
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
