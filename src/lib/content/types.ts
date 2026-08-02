import type { FrequencyPos } from "./frequency-types";

export type EntryKind = "word" | "grammar" | "pronunciation";

export type WordOrigin = "curated" | "frequency";

export interface Example {
  demonstrates?: string;
  english: string;
  note?: string;
  practiceItemId?: string;
  slovak: string;
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
  pathGroup: "Nouns" | "Verbs" | "Sentences";
  pattern: GrammarPattern;
  rule: string[];
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
