import type { TextMark } from "$lib/learning/marked-text";
import type { StickGestureId } from "$lib/stick-figure/gestures";
import type { StickPropId } from "$lib/stick-figure/props";

export type LessonTrackId = "everyday" | "grammar" | "pronunciation";

export interface AudioCue {
  src?: string;
  transcript: string;
}

export interface DialogueSayChoice {
  id: string;
  label: string;
  /** Shown under the options when the learner picks this wrong option. */
  whyWrong?: string;
}

export interface DialogueSayChoices {
  /** Single correct choice id (legacy / simple gates). */
  answerId?: string;
  /** Soft multi-correct: any of these ids continue the same path. */
  answerIds?: string[];
  choices: DialogueSayChoice[];
}

export interface DialogueTurn {
  audio?: AudioCue;
  english: string;
  /** Practice bubble starts with this gloss behind “Show English”. The task prompt stays visible. */
  englishToggle?: boolean;
  /**
   * Stick-figure gesture per sentence where the one picked from the text is
   * wrong; sentences past the end of the list stay automatic. Preview on
   * `/dev/stick-figures`.
   */
  gestures?: StickGestureId[];
  id: string;
  /**
   * Role spans into `slovak` (day, time, …). Plain `slovak` stays the spoken line.
   * Built with `markedText` so indexes cannot drift from a search.
   */
  marks?: TextMark[];
  /**
   * Stick-figure prop each sentence brings out, where its words do not name
   * one (`null` keeps a sentence empty-handed). Preview on `/dev/stick-figures`.
   */
  props?: Array<StickPropId | null>;
  /** Mid-story gate: pick what to say before this learner line reveals. */
  sayChoices?: DialogueSayChoices;
  slovak: string;
  speaker: string;
  /**
   * Speaker the stick figure says this to, when it is not the one it replies
   * to (Anna ordering from the waiter). Preview on `/dev/stick-figures`.
   */
  to?: string;
}

export interface LessonTrack {
  description: string;
  id: LessonTrackId;
  title: string;
}

export interface LessonReferenceLink {
  href: string;
  label: string;
}

export interface KeyPhrase {
  audio?: AudioCue;
  english: string;
  note?: string;
  slovak: string;
}

export interface LessonPattern {
  body: string;
  title: string;
}

export interface ExerciseFeedback {
  correction?: string;
  english?: string;
  why: string;
}

interface ExerciseBase {
  context?: DialogueTurn[];
  feedback: ExerciseFeedback;
  id: string;
  practiceItemId: string;
  /** Muted Slovak line above the English prompt (framed schedule items). */
  promptSk?: string;
  /** English by default; use "sk" for Slovak clock-matching prompts. */
  promptLang?: "en" | "sk";
  prompt: string;
}

export interface ClockTime {
  /** 1–12 as shown on the analog face. */
  hour: number;
  minute: number;
}

export interface ChoiceExercise extends ExerciseBase {
  answerId: string;
  /** pickCorrect: choose answerId. pickTrap: choose any line that does not fit the prompt. */
  choiceMode?: "pickCorrect" | "pickTrap";
  /** Analog face for the time named in the prompt (text choices only). */
  clock?: ClockTime;
  /** Text labels (default) or analog faces on each choice. */
  choiceStyle?: "text" | "clock";
  choices: Array<{
    clock?: ClockTime;
    id: string;
    label?: string;
    /** Odd-one-out: true when the line matches the prompt meaning. */
    fits?: boolean;
    /** Shown in feedback when the learner picks this wrong option. */
    whyWrong?: string;
  }>;
  hint?: ClozeHint;
  type: "choice";
}

export interface SelectAllExercise extends ExerciseBase {
  clock?: ClockTime;
  choices: Array<{
    correct: boolean;
    id: string;
    label: string;
    whyWrong?: string;
  }>;
  hint?: ClozeHint;
  type: "selectAll";
}

export interface ClockGridVisual {
  items: Array<{
    english: string;
    note?: string;
    slovak: string;
    time: ClockTime;
  }>;
  title: string;
  type: "clock-grid";
}

export interface FormTableHeading {
  english: string;
  example?: string;
  slovak?: string;
}

export interface FormTableSection {
  heading?: FormTableHeading;
  rows: Array<{ cells: string[]; heading: FormTableHeading }>;
}

export interface FormTableVisual {
  columns: FormTableHeading[];
  note?: string;
  sections: FormTableSection[];
  title: string;
  type: "form-table";
}

export type LessonVisual = ClockGridVisual | FormTableVisual;

/** A predictable wrong form in a built or typed answer, and why it is wrong. */
export interface AnswerMistake {
  /** Word or phrase in the learner's answer; matched as whole words, ignoring case and accents. */
  wrong: string;
  whyWrong: string;
}

export interface BuildExercise extends ExerciseBase {
  answer: string[];
  mistakes?: AnswerMistake[];
  tiles: string[];
  type: "build";
}

export interface TypedExercise extends ExerciseBase {
  acceptedAnswers?: string[];
  answer: string;
  inputLabel: string;
  mistakes?: AnswerMistake[];
  task: "complete" | "repair";
  type: "typed";
}

export interface ClozeHint {
  chip: string;
  grammarTopicId?: string;
  note: string;
  /** v1.1 progressive reveal — ignored by v1 UI */
  reveal?: string[];
}

export interface ClozeExercise extends ExerciseBase {
  acceptedAnswers?: string[];
  answer: string;
  /** Exactly one `{}` gap: "Dnes {} knihu." */
  frame: string;
  gapEn: string;
  hint: ClozeHint;
  lemmaId?: string;
  morphHint?: string;
  sentenceEn?: string;
  type: "cloze";
}

export interface FindMistakeExercise extends ExerciseBase {
  acceptedAnswers?: string[];
  answer: string;
  hint?: ClozeHint;
  type: "findMistake";
  wrongWordIndex: number | null;
  words: string[];
}

export interface PersonalExercise {
  example?: string;
  id: string;
  prompt: string;
  type: "personal";
}

export type GradedLessonExercise =
  ChoiceExercise | BuildExercise | TypedExercise | SelectAllExercise;
export type LessonExercise = GradedLessonExercise | PersonalExercise;

export interface LessonBeatTeach {
  note?: string;
  phrases?: KeyPhrase[];
  sceneLineIds?: string[];
  visual?: LessonVisual | LessonVisual[];
}

export interface LessonBeat {
  exercises: LessonExercise[];
  id: string;
  teach: LessonBeatTeach;
  title: string;
}

export interface Lesson {
  beats: LessonBeat[];
  group?: string;
  id: string;
  keyPhrases: KeyPhrase[];
  pattern?: LessonPattern;
  promise: string;
  referenceLinks: LessonReferenceLink[];
  scene: DialogueTurn[];
  slug: string;
  title: string;
  track: LessonTrackId;
  visual?: LessonVisual;
}

export type PracticeTask =
  | ChoiceExercise
  | BuildExercise
  | TypedExercise
  | ClozeExercise
  | SelectAllExercise
  | FindMistakeExercise;

export interface PracticeItem {
  feedback: ExerciseFeedback;
  id: string;
  newUse?: string;
  isRetryOfMissedCard?: boolean;
  source: {
    href: string;
    kind: "lesson" | "reference";
    label: string;
  };
  task: PracticeTask;
}
