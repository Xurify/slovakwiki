import type { CefrLevel } from "../../../src/lib/level-test/scale";
import type { ScoreRequest } from "../../../src/lib/level-test/server/score";
import type {
  AiIssueTopic,
  AiScore,
  ProductionKind,
} from "../../../src/lib/level-test/types";

/** Who wrote a base answer. Kept per case so results can be split by author. */
export type EvalSource = "claude" | "own";

/** One known error: `from` appears exactly once in the clean answer and becomes `to`. */
export interface Mutation {
  topic: AiIssueTopic;
  /** Other topics a careful marker could file it under, e.g. a perfective read as future tense. */
  alsoTopics?: AiIssueTopic[];
  from: string;
  to: string;
}

/** A correct answer written for a real test prompt, with errors that can be put into it. */
export interface EvalBase {
  id: string;
  kind: ProductionKind;
  /** Writing or speaking prompt id from `src/lib/catalog/level-test/prompts.ts`. */
  promptId?: string;
  /** Photo slug from `photoSlugs`, for photo tasks. */
  photo?: string;
  /** A photo that does not match the answer, for the wrong-photo case. */
  wrongPhoto?: string;
  /** Listening set id, for Summarize the Conversation. */
  listening?: string;
  /** The level the answer was written at, by length, vocabulary and structure. */
  targetLevel: CefrLevel;
  response: string;
  /** Interactive Writing: the answer to the follow-up question. */
  followUp?: string;
  /** Spoken answers: how long the recording would be. */
  seconds?: number;
  source: EvalSource;
  /** Applied in this order: the 1-error case takes the first, the 3-error case the first three. */
  mutations: Mutation[];
}

export interface Expectation {
  maxScore?: number;
  minScore?: number;
  maxContent?: number;
  /** A clean answer: any listed issue is a false correction. */
  noIssues?: boolean;
}

/** An answer whose expected outcome is a rule of the scoring prompt, not a level. */
export interface AdversarialInput {
  id: string;
  kind: ProductionKind;
  promptId?: string;
  photo?: string;
  listening?: string;
  /** `null` sends back what the learner was shown: the prompt, or a listening set's scenario. */
  response: string | null;
  seconds?: number;
  why: string;
  expect: Expectation;
}

export type CaseVariant = "clean" | "errors" | "asr" | "wrongPhoto" | "adversarial";

export interface EvalCase {
  id: string;
  /** Base or adversarial id; variants of one base share it. */
  group: string;
  variant: CaseVariant;
  split: "dev" | "test";
  source: EvalSource;
  targetLevel?: CefrLevel;
  request: ScoreRequest;
  /** Errors in this answer, with where `to` sits in `request.response`. */
  errors: PlacedMutation[];
  expect: Expectation;
}

export interface PlacedMutation extends Mutation {
  start: number;
  end: number;
}

export interface PhotoRef {
  src: string;
  alt: string;
}

export interface EvalResult {
  caseId: string;
  model: string;
  repeat: number;
  ms: number;
  score?: AiScore;
  error?: string;
  refused?: boolean;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
}
