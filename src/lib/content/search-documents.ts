import { caseTopics, grammarEntries, pronunciationEntries, words } from "./data";
import { lessons } from "./lessons";
import { practiceSets } from "./practice";
import { searchFormsForLemma } from "./search-forms";
import { normalizeSearchText, type SearchDocKind } from "./search-ui";

export type { SearchDocKind } from "./search-ui";
export {
  searchIdleHints,
  searchKindChips,
  searchKindLabels,
  sentenceCase,
} from "./search-ui";

export interface SearchDocument {
  content: string;
  kind: SearchDocKind;
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

export function buildSearchDocuments(): SearchDocument[] {
  const documents: SearchDocument[] = [];

  for (const entry of words) {
    documents.push({
      url: `/dictionary/${entry.slug}`,
      kind: "word",
      title: entry.slovak,
      summary: entry.english,
      content: withNormalized([
        entry.slovak,
        entry.english,
        entry.summary,
        entry.category,
        ...entry.tags,
        ...(entry.aliases ?? []),
        ...searchFormsForLemma(entry.slovak, entry.category),
      ]),
    });
  }

  for (const entry of grammarEntries) {
    documents.push({
      url: `/grammar/${entry.slug}`,
      kind: "grammar",
      title: entry.slovak,
      summary: entry.summary,
      content: withNormalized([
        entry.slovak,
        entry.english,
        entry.summary,
        entry.category,
        entry.lookFor,
        entry.watchOut,
        ...entry.tags,
        ...(entry.aliases ?? []),
        ...entry.rule,
        ...entry.pattern.lines,
      ]),
    });
  }

  for (const entry of pronunciationEntries) {
    documents.push({
      url: `/pronunciation/${entry.slug}`,
      kind: "pronunciation",
      title: entry.slovak,
      summary: entry.summary,
      content: withNormalized([
        entry.slovak,
        entry.english,
        entry.summary,
        entry.goal,
        entry.mouthCue,
        entry.category,
        ...entry.tags,
        ...(entry.aliases ?? []),
        ...entry.practiceWords,
        entry.practicePhrase.slovak,
        entry.practicePhrase.english,
      ]),
    });
  }

  for (const topic of caseTopics) {
    documents.push({
      url: `/grammar/cases/${topic.slug}`,
      kind: "case",
      title: topic.name,
      summary: topic.summary,
      content: withNormalized([
        topic.name,
        topic.question,
        topic.summary,
        ...topic.researchPrompts,
      ]),
    });
  }

  for (const lesson of lessons) {
    documents.push({
      url: `/lessons/${lesson.track}/${lesson.slug}`,
      kind: "lesson",
      title: lesson.title,
      summary: lesson.promise,
      content: withNormalized([
        lesson.title,
        lesson.promise,
        lesson.group ?? "",
        lesson.pattern?.title ?? "",
        ...lesson.keyPhrases.flatMap((phrase) => [phrase.slovak, phrase.english]),
      ]),
    });
  }

  for (const set of practiceSets) {
    documents.push({
      url: `/practice/${set.id}`,
      kind: "practice",
      title: set.title,
      summary: `Practice set · ${set.track}`,
      content: withNormalized([set.title, set.id, set.track, set.lessonId]),
    });
  }

  return documents;
}
