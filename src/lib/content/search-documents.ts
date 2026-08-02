import { caseTopics, grammarEntries, pronunciationEntries, words } from "./data";
import { lessons } from "./lessons";
import { practiceSets } from "./practice";
import { normalizeSearchText } from "./search";
import { searchFormsForLemma } from "./search-forms";

export type SearchDocKind =
  "word" | "grammar" | "pronunciation" | "case" | "lesson" | "practice";

export interface SearchDocument {
  content: string;
  kind: SearchDocKind;
  summary: string;
  title: string;
  url: string;
}

export const searchKindLabels: Record<SearchDocKind, string> = {
  word: "Word",
  grammar: "Grammar",
  pronunciation: "Pronunciation",
  case: "Case",
  lesson: "Lesson",
  practice: "Practice",
};

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
        ...entry.body,
        ...entry.examples.flatMap((example) => [example.slovak, example.english]),
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
        ...entry.body,
        ...entry.rule,
        ...entry.pattern.lines,
        ...entry.examples.flatMap((example) => [example.slovak, example.english]),
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
        ...entry.body,
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
        ...topic.body,
        ...topic.researchPrompts,
        ...topic.examples.flatMap((example) => [example.slovak, example.english]),
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
        lesson.pattern?.body ?? "",
        ...lesson.keyPhrases.flatMap((phrase) => [
          phrase.slovak,
          phrase.english,
          phrase.note ?? "",
        ]),
        ...lesson.scene.flatMap((turn) => [turn.slovak, turn.english, turn.speaker]),
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

/** EN topic labels: first letter up; SK lemmas stay as stored. */
export function sentenceCase(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toLocaleUpperCase("en") + value.slice(1);
}

function requireIdleHintSource<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`Missing search idle hint source: ${label}`);
  }
  return value;
}

const idleHintWordAhoj = requireIdleHintSource(
  words.find((entry) => entry.slug === "ahoj"),
  "ahoj",
);
const idleHintWordDakujem = requireIdleHintSource(
  words.find((entry) => entry.slug === "dakujem"),
  "dakujem",
);
const idleHintCaseNominative = requireIdleHintSource(
  caseTopics.find((topic) => topic.slug === "nominative"),
  "nominative",
);
const idleHintLessonMeetSomeone = requireIdleHintSource(
  lessons.find((lesson) => lesson.slug === "meet-someone"),
  "meet-someone",
);
const idleHintPronunciationStress = requireIdleHintSource(
  pronunciationEntries.find((entry) => entry.slug === "first-syllable-stress"),
  "first-syllable-stress",
);

/** Try labels use canonical page titles: SK lemmas lowercase, EN names Title/Sentence case. */
export const searchIdleHints: Array<{
  href: string;
  kind: SearchDocKind;
  label: string;
  lang?: string;
}> = [
  {
    label: idleHintWordAhoj.slovak,
    kind: "word",
    href: `/dictionary/${idleHintWordAhoj.slug}`,
    lang: "sk",
  },
  {
    label: idleHintWordDakujem.slovak,
    kind: "word",
    href: `/dictionary/${idleHintWordDakujem.slug}`,
    lang: "sk",
  },
  {
    label: idleHintCaseNominative.name,
    kind: "case",
    href: `/grammar/cases/${idleHintCaseNominative.slug}`,
  },
  {
    label: idleHintLessonMeetSomeone.title,
    kind: "lesson",
    href: `/lessons/${idleHintLessonMeetSomeone.track}/${idleHintLessonMeetSomeone.slug}`,
  },
  {
    label: sentenceCase(idleHintPronunciationStress.english),
    kind: "pronunciation",
    href: `/pronunciation/${idleHintPronunciationStress.slug}`,
  },
];

export const searchKindChips: SearchDocKind[] = [
  "word",
  "grammar",
  "case",
  "pronunciation",
  "lesson",
  "practice",
];
