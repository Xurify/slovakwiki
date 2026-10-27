import type { StickPropId } from "$lib/stick-figure/props";
import type { DialogueTurn, KeyPhrase } from "$lib/learning/types";
import type { SetSetup } from "$lib/stick-figure/acts";
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
  /**
   * What the cast walks in holding, by speaker, where the segment goes on from
   * the one before: Robo still has Bobík on the lead when they reach the square.
   */
  carrying?: Record<string, StickPropId>;
  checks: ListeningCheck[];
  id: string;
  lines: DialogueTurn[];
  /** Where the stick-figure stage acts the segment out; the podcast studio unless set. */
  stage?: StageSetting;
  /**
   * What the place's set has or looks like as the segment starts, on top of
   * how the last segment there left it: the yellow plant, the phone in a
   * pocket, the recorder back on the desk the next morning.
   */
  setup?: SetSetup;
  title: string;
  titleSk: string;
}

export interface EpisodeNextSteps {
  grammarHref?: string;
  lessonHref?: string;
  practiceHref?: string;
}

export interface ListeningEpisode {
  chapters: ListeningChapter[];
  /** The grammar page the episode teaches; a story told for its own sake has none. */
  grammarSlug?: string;
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
  /** The grammar label, read as "an episode on …"; none for a story with no topic. */
  topic?: string;
  vocabulary: KeyPhrase[];
}
