import type { DialogueTurn, KeyPhrase } from "$lib/learning/types";
import type { StageSetting } from "$lib/stick-figure/stage-setting";

export interface ListeningCheck {
  answerId: string;
  choices: Array<{
    id: string;
    label: string;
    whyWrong?: string;
  }>;
  feedback: {
    english?: string;
    why: string;
  };
  /** A sentence from the chapter with a `___` gap, for "which word did you hear". */
  gap?: string;
  id: string;
  /** The question in plain Slovak; its English sits under it. */
  prompt: string;
  promptEnglish: string;
  replayLineId?: string;
}

export interface ListeningChapter {
  checks: ListeningCheck[];
  id: string;
  lines: DialogueTurn[];
  /** Where the stick-figure stage acts the segment out; the podcast studio unless set. */
  stage?: StageSetting;
  title: string;
  titleSk: string;
}

export interface EpisodeNextSteps {
  grammarHref: string;
  lessonHref?: string;
  practiceHref?: string;
}

export interface ListeningEpisode {
  chapters: ListeningChapter[];
  grammarSlug: string;
  speakers: string[];
  id: string;
  lessonId?: string;
  level: string;
  number: number;
  practiceSetId?: string;
  promise: string;
  slug: string;
  title: string;
  titleSk: string;
  topic: string;
  vocabulary: KeyPhrase[];
}
