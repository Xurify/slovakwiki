import type { AnswerGrade } from "$lib/components/practice/practice-state";
import type { OtherChoiceNote } from "$lib/learning/exercises/feedback-why";

/** What the learner entered, enough to redraw a graded exercise locked. */
export type LessonAnswerSnapshot = {
  builtBankIndexes: number[];
  input: string;
  revealed: boolean;
  selectedId: string | null;
  selectedIds: string[];
};

export type LessonGradeResult = {
  answer?: LessonAnswerSnapshot;
  attempt?: string;
  correct: boolean;
  correction?: string;
  english?: string;
  grade: AnswerGrade;
  markWords?: boolean;
  missHeadline?: string;
  otherChoices?: OtherChoiceNote[];
  revealed?: boolean;
  showCorrection?: boolean;
  why: string;
};
