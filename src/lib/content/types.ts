export type EntryKind = "word" | "grammar" | "pronunciation";

export interface Example {
  demonstrates?: string;
  english: string;
  note?: string;
  practiceItemId?: string;
  slovak: string;
}

export interface ContentEntry {
  aliases?: string[];
  body: string[];
  category: string;
  english: string;
  examples: Example[];
  kind: EntryKind;
  related: string[];
  slug: string;
  slovak: string;
  source: string;
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
