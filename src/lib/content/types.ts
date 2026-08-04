import type { FrequencyPos } from "./frequency-types";

export type EntryKind = "word" | "grammar" | "pronunciation";

export type WordOrigin = "curated" | "frequency";

export interface Example {
  demonstrates?: string;
  english: string;
  /** A safe, generated frame used when no corpus or hand-written sentence exists. */
  isPracticeFrame?: boolean;
  note?: string;
  practiceItemId?: string;
  slovak: string;
  /** Tatoeba sentence id for the Slovak side when note is "Tatoeba". */
  tatoebaId?: number;
}

export interface WordFrequency {
  pos: FrequencyPos;
  rank: number;
}

export interface ContentEntry {
  aliases?: string[];
  body: string[];
  category: string;
  english: string;
  examples: Example[];
  /** Present when the lemma appears in an SNK top-1000 list. */
  frequency?: WordFrequency;
  kind: EntryKind;
  /** How this word entered the live dictionary. */
  origin?: WordOrigin;
  related: string[];
  slug: string;
  slovak: string;
  source: string;
  /** Visible attribution label for the Source section. Falls back in UI when omitted. */
  sourceLabel?: string;
  /** Optional secondary attribution note. */
  sourceNote?: string;
  summary: string;
  tags: string[];
}

export interface GrammarPattern {
  label: string;
  lines: string[];
}

/** In-page sections for gloss-term deep links (e.g. #imperfective). */
export interface GrammarTermSection {
  body: string;
  id: string;
  title: string;
}

export interface CaseReference {
  explanation?: string;
  name: string;
  question?: string;
  researchPrompt?: string;
  role?: string;
  slug: string;
}

export interface CaseTopic {
  body: string[];
  examples: Example[];
  name: string;
  question: string;
  researchPrompts: string[];
  slug: string;
  source: string;
  status: "draft" | "ready";
  summary: string;
}

export interface GrammarTopic extends ContentEntry {
  caseOverview?: CaseReference[];
  kind: "grammar";
  lookFor: string;
  lessonLink?: {
    href: string;
    label: string;
  };
  nextSlug?: string;
  order: number;
  pathGroup: "Nouns" | "Verbs" | "Sentence building" | "Numbers";
  pattern: GrammarPattern;
  rule: string[];
  /** Optional deep-link sections for dictionary gloss term tips. */
  termSections?: GrammarTermSection[];
  watchOut: string;
}

export interface PronunciationContrast {
  left: string;
  note: string;
  right: string;
}

export interface PronunciationTopic extends ContentEntry {
  kind: "pronunciation";
  contrasts: PronunciationContrast[];
  goal: string;
  mouthCue: string;
  nextSlug?: string;
  order: number;
  pathGroup: "Rhythm" | "Vowels" | "Consonants" | "Spelling";
  practicePhrase: Example;
  practiceWords: string[];
}
