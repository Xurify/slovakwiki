import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const daysDatesTimeBeatShells: Omit<LessonBeat, "exercises">[] = [
  {
    id: "meeting-day",
    title: "Pick a day",
    teach: {
      sceneLineIds: ["meeting-today", "meeting-suggestion"],
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
      note: "Use v before the day when arranging a meeting.",
    },
  },
  {
    id: "clock-basics",
    title: "Clock times",
    teach: {
      sceneLineIds: ["meeting-time", "meeting-half-past"],
      phrases: [
        {
          slovak: "O tretej.",
          english: "3:00 — three o'clock.",
          audio: { transcript: "O tretej." },
        },
        {
          slovak: "O pol tretej.",
          english: "2:30 — half past two.",
          note: "Literally, halfway to three.",
          audio: { transcript: "O pol tretej." },
        },
      ],
    },
  },
  {
    id: "quarters",
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
    id: "registers",
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
    id: "duration",
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
      note: "Duration uses o + accusative. Okolo is approximate.",
    },
  },
  {
    id: "your-turn",
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
    { ...shells[2]!, exercises: rest.slice(5, 8) },
    { ...shells[3]!, exercises: rest.slice(8, 10) },
    { ...shells[4]!, exercises: rest.slice(10, 12) },
    { ...shells[5]!, exercises: personal ? [personal] : [] },
  ];
}
