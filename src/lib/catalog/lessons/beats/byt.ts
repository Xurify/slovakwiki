import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const bytLineIds = {
  receptionistAreYouAlex: "byt-present-receptionist-are-you-alex",
  youAreAlex: "byt-present-you-are-alex",
  receptionistFirstTime: "byt-present-receptionist-first-time",
  youWithFriends: "byt-present-you-with-friends",
} as const;

export const bytBeats: LessonBeat[] = [
  {
    id: "byt-present-who-you-are",
    title: "Who you are",
    teach: {
      sceneLineIds: [bytLineIds.receptionistAreYouAlex, bytLineIds.youAreAlex],
      phrases: [
        { slovak: "Som …", english: "I am …", audio: { transcript: "Som." } },
        {
          slovak: "Ste …?",
          english: "Are you …? (formal / plural)",
          audio: { transcript: "Ste?" },
        },
      ],
      note: "Som, si, je, sme, ste, sú — byť is irregular. Its negative is two words: nie som, nie je.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "byt-present-where-things-are",
    title: "Where things are",
    teach: {
      sceneLineIds: [bytLineIds.receptionistFirstTime, bytLineIds.youWithFriends],
      phrases: [
        { slovak: "Je to …", english: "It is …", audio: { transcript: "Je to." } },
        { slovak: "Sme …", english: "We are …", audio: { transcript: "Sme." } },
      ],
      note: "Do not use byť for age — Slovak uses mať: Mám dvadsať rokov.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "byt-present-your-turn",
    title: "Your turn",
    teach: {},
    exercises: [] as LessonExercise[],
  },
];

export function withBytExercises(
  som: LessonExercise,
  ste: LessonExercise,
  je: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...bytBeats[0]!, exercises: [som, ste] },
    { ...bytBeats[1]!, exercises: [je] },
    { ...bytBeats[2]!, exercises: [personal] },
  ];
}
