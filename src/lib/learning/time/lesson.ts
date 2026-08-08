import type { Lesson, LessonExercise } from "$lib/learning/types";

export const daysDatesTimeLessonId = "everyday/days-dates-and-time";

export const daysDatesTimeVisual: NonNullable<Lesson["visual"]> = {
  type: "clock-grid",
  title: "Match the face to the phrase",
  items: [
    {
      time: { hour: 3, minute: 0 },
      slovak: "O tretej.",
      english: "At three o’clock.",
    },
    {
      time: { hour: 2, minute: 30 },
      slovak: "O pol tretej.",
      english: "At half past two.",
    },
    {
      time: { hour: 2, minute: 15 },
      slovak: "O štvrť na tri.",
      english: "At quarter past two.",
    },
    {
      time: { hour: 2, minute: 45 },
      slovak: "O trištvrte na tri.",
      english: "At quarter to three.",
    },
  ],
};

/** Graded exercises: typed, build, choice (text + clock), before the personal wrap-up. */
export const daysDatesTimeGradedExercises: LessonExercise[] = [
  {
    id: "days-meeting-day",
    type: "typed",
    task: "complete",
    practiceItemId: "everyday/day-meeting",
    prompt: "We will meet on Tuesday.",
    inputLabel: "Your Slovak answer",
    answer: "Stretneme sa v utorok.",
    feedback: {
      correction: "Stretneme sa v utorok.",
      english: "We will meet on Tuesday.",
      why: "Use v before the day when arranging a meeting.",
    },
  },
  {
    id: "days-meeting-time",
    type: "choice",
    practiceItemId: "everyday/meeting-time",
    prompt: "At three o'clock.",
    clock: { hour: 3, minute: 0 },
    choices: [
      { id: "three", label: "O tretej." },
      { id: "four", label: "O štvrtej." },
      { id: "half-past", label: "O pol tretej." },
    ],
    answerId: "three",
    feedback: {
      correction: "O tretej.",
      english: "At three o’clock.",
      why: "Use o + the time for an appointment.",
    },
  },
  {
    id: "days-half-past",
    type: "build",
    practiceItemId: "everyday/half-past-time",
    prompt: "At two thirty.",
    tiles: ["tretej.", "O", "pol"],
    answer: ["O", "pol", "tretej."],
    feedback: {
      correction: "O pol tretej.",
      english: "At half past two.",
      why: "Pol tretej is halfway to three, so it means 2:30.",
    },
  },
  {
    id: "days-quarter-time",
    type: "choice",
    practiceItemId: "everyday/quarter-time",
    prompt: "At quarter to three.",
    clock: { hour: 2, minute: 45 },
    choices: [
      { id: "three-quarters", label: "O trištvrte na tri." },
      { id: "quarter", label: "O štvrť na tri." },
      { id: "half-past", label: "O pol tretej." },
    ],
    answerId: "three-quarters",
    feedback: {
      correction: "O trištvrte na tri.",
      english: "At quarter to three.",
      why: "Trištvrte na tri is three-quarters toward three, so it means 2:45.",
    },
  },
  {
    id: "days-clock-half-past",
    type: "choice",
    practiceItemId: "everyday/clock-half-past-match",
    prompt: "Ktorý čas je o pol tretej?",
    promptLang: "sk",
    choiceStyle: "clock",
    choices: [
      { id: "half-past-two", clock: { hour: 2, minute: 30 } },
      { id: "half-past-three", clock: { hour: 3, minute: 30 } },
      { id: "quarter-to-three", clock: { hour: 2, minute: 45 } },
    ],
    answerId: "half-past-two",
    feedback: {
      correction: "O pol tretej.",
      english: "At half past two.",
      why: "Pol tretej counts toward three, so the face shows 2:30.",
    },
  },
  {
    id: "days-clock-quarter-past",
    type: "choice",
    practiceItemId: "everyday/clock-quarter-past-match",
    prompt: "Ktorý čas je o štvrť na tri?",
    promptLang: "sk",
    choiceStyle: "clock",
    choices: [
      { id: "quarter-past-two", clock: { hour: 2, minute: 15 } },
      { id: "quarter-to-three", clock: { hour: 2, minute: 45 } },
      { id: "half-past-two", clock: { hour: 2, minute: 30 } },
    ],
    answerId: "quarter-past-two",
    feedback: {
      correction: "O štvrť na tri.",
      english: "At quarter past two.",
      why: "Štvrť na tri is one quarter toward three, so the face shows 2:15.",
    },
  },
  {
    id: "days-clock-quarter-to",
    type: "choice",
    practiceItemId: "everyday/clock-quarter-to-match",
    prompt: "Ktorý čas je o trištvrte na tri?",
    promptLang: "sk",
    choiceStyle: "clock",
    choices: [
      { id: "quarter-to-three", clock: { hour: 2, minute: 45 } },
      { id: "quarter-past-two", clock: { hour: 2, minute: 15 } },
      { id: "three-oclock", clock: { hour: 3, minute: 0 } },
    ],
    answerId: "quarter-to-three",
    feedback: {
      correction: "O trištvrte na tri.",
      english: "At quarter to three.",
      why: "Trištvrte na tri is three-quarters toward three, so the face shows 2:45.",
    },
  },
];

export const daysDatesTimePersonalExercise: LessonExercise = {
  id: "days-personal",
  type: "personal",
  prompt: "Arrange a real or imagined meeting: choose a day and a time.",
  example: "Stretneme sa v piatok o tretej.",
};

export const daysDatesTimeLesson: Lesson = {
  id: daysDatesTimeLessonId,
  track: "everyday",
  slug: "days-dates-and-time",
  group: "Core tools",
  title: "Days, dates, and time",
  promise: "Arrange a meeting with a day and a clock time.",
  scene: [
    {
      id: "meeting-today",
      speaker: "Anna",
      slovak: "Dnes je pondelok.",
      english: "Today is Monday.",
      audio: { transcript: "Dnes je pondelok." },
    },
    {
      id: "meeting-suggestion",
      speaker: "Anna",
      slovak: "Stretneme sa v utorok?",
      english: "Shall we meet on Tuesday?",
      audio: { transcript: "Stretneme sa v utorok?" },
    },
    {
      id: "meeting-time",
      speaker: "You",
      slovak: "Áno. O tretej?",
      english: "Yes. At three?",
      audio: { transcript: "Áno. O tretej?" },
    },
    {
      id: "meeting-half-past",
      speaker: "Anna",
      slovak: "Lepšie o pol tretej.",
      english: "Better at half past two.",
      audio: { transcript: "Lepšie o pol tretej." },
    },
  ],
  keyPhrases: [
    {
      slovak: "Dnes je pondelok.",
      english: "Today is Monday.",
      audio: { transcript: "Dnes je pondelok." },
    },
    {
      slovak: "Stretneme sa v utorok.",
      english: "We will meet on Tuesday.",
      audio: { transcript: "Stretneme sa v utorok." },
    },
    {
      slovak: "O tretej.",
      english: "At three o’clock.",
      audio: { transcript: "O tretej." },
    },
    {
      slovak: "O pol tretej.",
      english: "At half past two.",
      note: "Literally, halfway to three.",
      audio: { transcript: "O pol tretej." },
    },
  ],
  pattern: {
    title: "Days and appointment times",
    body: "Use v + a day for when something happens: Stretneme sa v utorok. Use o + a clock time for an appointment: O tretej. O pol tretej means 2:30, halfway to three. Quarters also look ahead: O štvrť na tri is 2:15, and O trištvrte na tri is 2:45.",
  },
  visual: daysDatesTimeVisual,
  exercises: [...daysDatesTimeGradedExercises, daysDatesTimePersonalExercise],
  referenceLinks: [
    { href: "/grammar/telling-time", label: "Telling time" },
    { href: "/grammar/numbers-and-numerals", label: "Numbers and numerals" },
    { href: "/grammar/questions", label: "Questions" },
  ],
};
