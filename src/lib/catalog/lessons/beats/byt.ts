import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const bytBeats: LessonBeat[] = [
  {
    id: "identity",
    title: "Who you are",
    teach: {
      sceneLineIds: ["byt-check-in-name", "byt-check-in-answer"],
      phrases: [
        { slovak: "Som …", english: "I am …", audio: { transcript: "Som." } },
        {
          slovak: "Ste …?",
          english: "Are you …? (formal / plural)",
          audio: { transcript: "Ste?" },
        },
      ],
      note: "Som, si, je, sme, ste, sú — byť is irregular.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "location",
    title: "Where things are",
    teach: {
      sceneLineIds: ["byt-check-in-location", "byt-check-in-group"],
      phrases: [
        { slovak: "Je to …", english: "It is …", audio: { transcript: "Je to." } },
        { slovak: "Sme …", english: "We are …", audio: { transcript: "Sme." } },
      ],
      note: "Do not use byť for age — Slovak uses mať: Mám dvadsať rokov.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "your-turn",
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
