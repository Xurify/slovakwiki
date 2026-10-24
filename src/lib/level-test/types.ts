import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { GrammaticalCase } from "$lib/learning/possessives/paradigm";

import type { CefrLevel } from "./scale";

export type Skill = "reading" | "listening" | "writing" | "speaking";

/** The parts of Slovak the results page breaks a score into. */
export type StudyArea =
  | "vocabulary"
  | "nouns"
  | "adjectives"
  | "pronouns"
  | "numerals"
  | "conjugation"
  | "aspect"
  | "wordOrder"
  | "functionWords"
  | "spelling"
  | "vowelLength"
  | "intelligibility";

export type WordClass =
  "noun" | "adjective" | "pronoun" | "numeral" | "verb" | "functionWord" | "other";

export type { GrammaticalCase } from "$lib/learning/possessives/paradigm";

/** What a damaged or missing word is, so a miss can say which grammar it tests. */
export interface WordTag {
  class: WordClass;
  lemma?: string;
  /** Dictionary slug, for a link to the word's page. */
  slug?: string;
  /** Grammar page slug for pronouns and byť/mať (`demonstratives`, `byt-present`). */
  topic?: string;
  /** Pronoun forms only: the cases this form can be. */
  cases?: GrammaticalCase[];
}

/** Formats the adaptive section cycles through; each item carries its own difficulty. */
export type AdaptiveFormat =
  | "readSelect"
  | "listenSelect"
  | "listenLength"
  | "fillBlank"
  | "readComplete"
  | "listenType"
  | "chooseVerb"
  | "placeClitic";

interface AdaptiveItemBase {
  id: string;
  /** Predicted difficulty on the 0–100 scale. */
  difficulty: number;
}

/** "Is this a real Slovak word?" — real lemmas link back to the dictionary on the results page. */
export interface ReadSelectItem extends AdaptiveItemBase {
  format: "readSelect";
  word: string;
  real: boolean;
  slug?: string;
  english?: string;
}

export interface ListenSelectItem extends AdaptiveItemBase {
  format: "listenSelect";
  word: string;
  real: boolean;
  audio: string;
  slug?: string;
  english?: string;
}

/** Short or Long: one clip of a pair that differs only in a vowel's length. */
export interface ListenLengthItem extends AdaptiveItemBase {
  format: "listenLength";
  /** The word the clip says. */
  word: string;
  short: string;
  long: string;
  audio: string;
}

export interface FillBlankItem extends AdaptiveItemBase {
  format: "fillBlank";
  before: string;
  prefix: string;
  missing: string;
  after: string;
  english: string;
  tag?: WordTag;
}

export interface CTestGap {
  prefix: string;
  missing: string;
  difficulty: number;
  tag?: WordTag;
}

/** Plain text runs and damaged words, in reading order. */
export type CTestPart = string | CTestGap;

export interface ReadCompleteItem extends AdaptiveItemBase {
  format: "readComplete";
  title: string;
  parts: CTestPart[];
}

export interface ListenTypeItem extends AdaptiveItemBase {
  format: "listenType";
  text: string;
  english: string;
  audio: string;
  /** One tag per word of `text`, in `tokenizeWords` order. */
  wordTags?: WordTag[];
}

/** Choose the Verb: a sentence with one verb gap and the aspect pair for it. */
export interface ChooseVerbItem extends AdaptiveItemBase {
  format: "chooseVerb";
  before: string;
  after: string;
  /** Imperfective first, then perfective: the same person, number and tense. */
  options: [string, string];
  answer: 0 | 1;
  english: string;
  /** The cue in the sentence that decides the aspect, in one English sentence. */
  why: string;
}

/** Where Does It Go: the learner puts a group of clitics into one gap between words. */
export interface PlaceCliticItem extends AdaptiveItemBase {
  format: "placeClitic";
  /** The sentence without the clitics; punctuation stays on its word. */
  words: string[];
  /** One or more clitics in their fixed order: "sa", "som sa", "by sme mu ho". */
  clitic: string;
  /** The gap the group belongs in: 0 is before the first word. */
  answer: number;
  english: string;
  /** Why that gap, in one English sentence. */
  why: string;
}

export type AdaptiveItem =
  | ReadSelectItem
  | ListenSelectItem
  | ListenLengthItem
  | FillBlankItem
  | ReadCompleteItem
  | ListenTypeItem
  | ChooseVerbItem
  | PlaceCliticItem;

export interface ChoiceQuestion {
  options: string[];
  answer: number;
}

export interface ReadingBlank extends ChoiceQuestion {
  id: string;
  /** The part of Slovak the options differ in. */
  area: StudyArea;
}

/** Text runs and drop-down blanks for "Complete the sentences". */
export type ReadingPart = string | ReadingBlank;

export interface HighlightQuestion {
  question: string;
  english: string;
  /** Exact substring of the full passage. */
  answer: string;
}

export interface InteractiveReadingSet {
  id: string;
  level: CefrLevel;
  difficulty: number;
  kind: "narrative" | "expository";
  opening: ReadingPart[];
  missingSentence: ChoiceQuestion;
  closing: string;
  highlights: [HighlightQuestion, HighlightQuestion];
  mainIdea: ChoiceQuestion;
  title: ChoiceQuestion;
}

export interface SpokenLine {
  text: string;
  english: string;
  audio: string;
}

export interface ListenCompleteQuestion {
  before: string;
  after: string;
  english: string;
  /** Any of these, typed in the gap, earns full credit. */
  accepted: string[];
}

export interface ListenRespondTurn {
  line: SpokenLine;
  options: string[];
  answer: number;
}

export interface InteractiveListeningSet {
  id: string;
  level: CefrLevel;
  difficulty: number;
  partner: LessonCharacterId;
  partnerName: string;
  scenario: SpokenLine;
  complete: ListenCompleteQuestion[];
  turns: ListenRespondTurn[];
  /** The ideas a summary should mention; given to the scorer as the content key. */
  summaryKey: string[];
}

export interface PhotoPrompt {
  id: string;
  src: string;
  alt: string;
  credit: string;
  creditUrl?: string;
}

export interface BilingualText {
  slovak: string;
  english: string;
}

export interface WritingPrompt extends BilingualText {
  id: string;
  followUp?: BilingualText;
}

export interface SpeakingPrompt extends BilingualText {
  id: string;
  points?: BilingualText[];
}

export interface ReadAloudItem {
  id: string;
  text: string;
  english: string;
  difficulty: number;
}

export interface LevelTestBank {
  version: 1;
  adaptive: AdaptiveItem[];
  interactiveReading: InteractiveReadingSet[];
  interactiveListening: InteractiveListeningSet[];
  photos: PhotoPrompt[];
  interactiveWriting: WritingPrompt[];
  writingSamples: WritingPrompt[];
  readAloud: ReadAloudItem[];
  readThenSpeak: SpeakingPrompt[];
  speakingSamples: SpeakingPrompt[];
}

export type TestMode = "quick" | "full";

export type TestSection = "adaptive" | "reading" | "listening" | "writing" | "speaking";

/** Tasks that work today and tasks shown as "planned" placeholders. */
export type StepKind =
  | AdaptiveFormat
  | "interactiveReading"
  | "interactiveListening"
  | "writePhoto"
  | "interactiveWriting"
  | "writingSample"
  | "readAloud"
  | "speakPhoto"
  | "readThenSpeak"
  | "speakingSample"
  | "planned";

export type PlannedTask =
  | "summarizeConversation"
  | "writePhoto"
  | "interactiveWriting"
  | "writingSample"
  | "readAloud"
  | "speakPhoto"
  | "readThenSpeak"
  | "interactiveSpeaking"
  | "speakingSample";

export interface PlanStep {
  kind: StepKind;
  section: TestSection;
  /** Fixed target difficulty for the opening calibration items. */
  calibration?: number;
  /** For `planned` steps: what would run here. */
  planned?: PlannedTask[];
}

/** What the server can score right now (`/api/level-test/status`). */
export interface ScoringCapabilities {
  /** AI scoring of written (and transcribed) answers. */
  scoring: boolean;
  /** Speech-to-text for spoken answers. */
  transcription: boolean;
}

/** One graded response that feeds the ability estimate. */
export interface ItemResponse {
  itemId: string;
  kind: string;
  skill: Skill;
  difficulty: number;
  score: number;
  guess?: number;
  adaptive: boolean;
  /** Which study area this answer is evidence for. */
  area?: StudyArea;
  /** Typed answers: what was wanted and what came in, for spelling and examples. */
  expected?: string;
  given?: string;
  tag?: WordTag;
  /** Listen and Type: one tag per word of `expected`, so each word counts for its area. */
  wordTags?: WordTag[];
  /** Read and Select / Listen and Select: the word, and whether it was real. */
  word?: { text: string; real: boolean; slug?: string; english?: string };
  /**
   * A picked answer, for the study examples. Kept apart from `expected` and
   * `given`, which are typed and so also count as spelling.
   */
  choice?: { expected: string; given: string; why?: string };
}

export type ProductionKind =
  | "summarizeConversation"
  | "writePhoto"
  | "interactiveWriting"
  | "writingSample"
  | "speakPhoto"
  | "readThenSpeak"
  | "speakingSample";

export interface AiCriterionScores {
  content: number;
  coherence: number;
  grammar: number;
  lexis: number;
  fluency?: number;
}

/** Grammar and spelling slips the AI scorer names in a written or spoken answer. */
export const AI_ISSUE_TOPICS = [
  "nounEndings",
  "verbForms",
  "aspect",
  "adjectiveAgreement",
  "functionWords",
  "wordOrder",
  "accents",
  "vocabulary",
] as const;

export type AiIssueTopic = (typeof AI_ISSUE_TOPICS)[number];

export interface AiIssue {
  topic: AiIssueTopic;
  wrote: string;
  correct: string;
}

/** How often a point of grammar came up in the learner's own words, and how often it was right. */
export interface AiUsage {
  right: number;
  wrong: number;
}

export interface AiScore {
  score: number;
  level: CefrLevel;
  criteria: AiCriterionScores;
  feedback: string;
  issues?: AiIssue[];
  usage?: Partial<Record<AiIssueTopic, AiUsage>>;
}

export interface ProductionRecord {
  id: string;
  kind: ProductionKind;
  skill: "writing" | "speaking";
  prompt: string;
  response: string;
  status: "pending" | "scored" | "failed" | "empty";
  result?: AiScore;
}
