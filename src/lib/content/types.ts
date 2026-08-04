import type { FrequencyPartOfSpeech } from "./frequency-types";

export type EntryKind = "word" | "grammar" | "pronunciation";

export type WordOrigin = "curated" | "frequency";

/**
 * One learner sentence under a lemma.
 * Hand-authoring rules (counts, notes, quality): `content/dictionary/README.md`.
 */
export interface Example {
  /** Short cue for pattern lemmas (e.g. "byť + location — where"). */
  demonstrates?: string;
  english: string;
  /** A safe, generated frame used when no corpus or hand-written sentence exists. */
  isPracticeFrame?: boolean;
  /** `"Curated"` | `"Tatoeba"` | other short attribution. */
  note?: string;
  practiceItemId?: string;
  slovak: string;
  /** Tatoeba sentence id for the Slovak side when note is "Tatoeba". */
  tatoebaId?: number;
}

export interface WordFrequency {
  partOfSpeech: FrequencyPartOfSpeech;
  rank: number;
}

/**
 * Runtime dictionary / grammar / pronunciation entry.
 * Hand-authored lemmas use only the `WordSeed` fields (slug, slovak, english,
 * category, examples, related, topics?) — see `content/dictionary/README.md`.
 * `origin`, `frequency`, `body`, `summary`, `tags`, and source* are filled in `data.ts`.
 */
export interface ContentEntry {
  aliases?: string[];
  body: string[];
  /**
   * Dictionary browse bucket: `Verbs` | `Nouns` | `Adjectives` | `Places` | `Phrases`.
   * Learner themes (Food, Greetings, …) live in `topics`, not here.
   */
  category: string;
  english: string;
  examples: Example[];
  /** Present when the lemma appears in an SNK top-1000 list. */
  frequency?: WordFrequency;
  kind: EntryKind;
  /** How this word entered the live dictionary. */
  origin?: WordOrigin;
  /** Existing lemma slugs only — never free-text labels. */
  related: string[];
  /** URL id from `lemmaToSlug(slovak)`; unique across curated seed + words.json. */
  slug: string;
  /** Lemma with correct Slovak diacritics. */
  slovak: string;
  source: string;
  /** Visible attribution label for the Source section. Falls back in UI when omitted. */
  sourceLabel?: string;
  /** Optional secondary attribution note. */
  sourceNote?: string;
  summary: string;
  tags: string[];
  /**
   * Optional learner themes for a future Essentials page (Food, Greetings, …).
   * Not used as dictionary browse chips.
   */
  topics?: string[];
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
