import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const daysDatesTimeLineIds = {
  annaTuesdayAtThree: "days-dates-and-time-anna-tuesday-at-three",
  youHalfPastTwo: "days-dates-and-time-you-half-past-two",
} as const;

export const daysDatesTimeBeatShells: Omit<LessonBeat, "exercises">[] = [
  {
    id: "days-dates-and-time-pick-a-day",
    title: "Pick a day",
    teach: {
      sceneLineIds: [daysDatesTimeLineIds.annaTuesdayAtThree],
      phrases: [
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
      ],
      note: "On a day: v + accusative — v utorok, v stredu, but vo štvrtok.",
    },
  },
  {
    id: "days-dates-and-time-clock-times",
    title: "Clock times",
    teach: {
      sceneLineIds: [
        daysDatesTimeLineIds.annaTuesdayAtThree,
        daysDatesTimeLineIds.youHalfPastTwo,
      ],
      phrases: [
        {
          slovak: "O tretej.",
          english: "3:00 — three o'clock.",
          audio: { transcript: "O tretej." },
        },
        {
          slovak: "O pol tretej.",
          english: "2:30 — half past two.",
          note: "Literally “half of the third (hour)” — halfway to three.",
          audio: { transcript: "O pol tretej." },
        },
        {
          slovak: "O pol druhej.",
          english: "1:30 — half past one.",
          note: "Pol counts toward the next hour: halfway to two.",
          audio: { transcript: "O pol druhej." },
        },
      ],
    },
  },
  {
    id: "days-dates-and-time-quarters",
    title: "Quarters and faces",
    teach: {
      phrases: [
        {
          slovak: "O štvrť na tri.",
          english: "2:15 — quarter past two.",
          audio: { transcript: "O štvrť na tri." },
        },
        {
          slovak: "O trištvrte na tri.",
          english: "2:45 — quarter to three.",
          audio: { transcript: "O trištvrte na tri." },
        },
      ],
      note: "Quarters name the hour ahead, like pol tretej.",
    },
  },
  {
    id: "days-dates-and-time-two-questions",
    title: "Two questions",
    teach: {
      phrases: [
        {
          slovak: "Koľko je hodín?",
          english: "What time is it?",
          audio: { transcript: "Koľko je hodín?" },
        },
        {
          slovak: "O koľkej?",
          english: "At what time?",
          audio: { transcript: "O koľkej?" },
        },
      ],
      note: "Koľko je hodín? → Je/Sú …. O koľkej? → O tretej (locative).",
    },
  },
  {
    id: "days-dates-and-time-duration",
    title: "In X minutes",
    teach: {
      phrases: [
        {
          slovak: "O dve hodiny.",
          english: "In two hours.",
          audio: { transcript: "O dve hodiny." },
        },
        {
          slovak: "O päť minút.",
          english: "In five minutes.",
          audio: { transcript: "O päť minút." },
        },
        {
          slovak: "Okolo tretej.",
          english: "Around three o'clock.",
          audio: { transcript: "Okolo tretej." },
        },
      ],
      note: "In X hours/minutes from now: o + accusative (o dve hodiny). Okolo is approximate.",
    },
  },
  {
    id: "days-dates-and-time-your-turn",
    title: "Your turn",
    teach: {},
  },
];

export function withDaysDatesTimeExercises(
  shells: Omit<LessonBeat, "exercises">[],
  graded: LessonExercise[],
  clockVisual?: LessonBeat["teach"]["visual"],
): LessonBeat[] {
  const personal = graded[graded.length - 1];
  const rest = graded.slice(0, -1);

  const clockShell = shells[1];
  const clockTeach =
    clockShell && clockVisual
      ? { ...clockShell, teach: { ...clockShell.teach, visual: clockVisual } }
      : clockShell;

  return [
    { ...shells[0]!, exercises: rest.slice(0, 2) },
    { ...(clockTeach ?? shells[1]!), exercises: rest.slice(2, 5) },
    { ...shells[2]!, exercises: rest.slice(5, 9) },
    { ...shells[3]!, exercises: rest.slice(9, 10) },
    { ...shells[4]!, exercises: rest.slice(10, 13) },
    { ...shells[5]!, exercises: personal ? [personal] : [] },
  ];
}
