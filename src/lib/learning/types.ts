export type LessonTrackId = "everyday" | "grammar" | "pronunciation";

export interface AudioCue {
  src?: string;
  transcript: string;
}

export interface DialogueTurn {
  audio?: AudioCue;
  english: string;
  id: string;
  slovak: string;
  speaker: string;
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

export interface LessonVisual {
  items: Array<{
    english: string;
    note?: string;
    slovak: string;
    time: ClockTime;
  }>;
  title: string;
  type: "clock-grid";
}

export interface BuildExercise extends ExerciseBase {
  answer: string[];
  tiles: string[];
  type: "build";
}

export interface TypedExercise extends ExerciseBase {
  acceptedAnswers?: string[];
  answer: string;
  inputLabel: string;
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

export interface PersonalExercise {
  example?: string;
  id: string;
  prompt: string;
  type: "personal";
}

export type GradedLessonExercise =
  ChoiceExercise | BuildExercise | TypedExercise | SelectAllExercise;
export type LessonExercise = GradedLessonExercise | PersonalExercise;

export interface Lesson {
  exercises: LessonExercise[];
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
  ChoiceExercise | BuildExercise | TypedExercise | ClozeExercise | SelectAllExercise;

export interface PracticeItem {
  feedback: ExerciseFeedback;
  id: string;
  newUse?: string;
  source: {
    href: string;
    kind: "lesson" | "reference";
    label: string;
  };
  task: PracticeTask;
}
