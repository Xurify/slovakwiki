import type { DialogueTurn, KeyPhrase } from "$lib/learning/types";

/** One multiple-choice question about what the learner just heard. */
export interface ListeningCheck {
  answerId: string;
  choices: Array<{
    id: string;
    label: string;
    /** Shown when the learner picks this wrong option. */
    whyWrong?: string;
  }>;
  feedback: {
    /** English gloss of the line the answer comes from. */
    english?: string;
    /** One teaching line; Slovak in `**bold**`. */
    why: string;
  };
  id: string;
  /** English question, or the English target line. */
  prompt: string;
  /** Gapped Slovak line shown above the question: "___ kľúč je od auta." */
  promptSk?: string;
  /** Line the learner can replay (audio only) before answering. */
  replayLineId?: string;
}

export interface ListeningChapter {
  /** Asked after the chapter has played; may be empty for an outro. */
  checks: ListeningCheck[];
  id: string;
  lines: DialogueTurn[];
  /** English title. */
  title: string;
  /** Slovak title, shown first. */
  titleSk: string;
}

export interface ListeningHost {
  /** What this person does in the episode (Host, Sells fruit at the market). */
  role: string;
  /** Speaker label from `content/audio/config.json`. */
  speaker: string;
}

export interface ListeningEpisode {
  chapters: ListeningChapter[];
  /** Grammar page this episode listens for. */
  grammarSlug: string;
  hosts: ListeningHost[];
  id: string;
  lessonId?: string;
  /** CEFR band, e.g. "A1–A2". */
  level: string;
  /** Episode number in the series. */
  number: number;
  practiceSetId?: string;
  /** One sentence: what you will hear. */
  promise: string;
  slug: string;
  /** English title. */
  title: string;
  /** Slovak title, shown under the English one. */
  titleSk: string;
  /** Words to listen for, read by the guide voice. */
  vocabulary: KeyPhrase[];
}
