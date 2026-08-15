import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const stressBeats: LessonBeat[] = [
  {
    id: "stress",
    title: "First-syllable stress",
    teach: {
      sceneLineIds: ["anna-thanks", "stress-mark"],
      phrases: [
        {
          slovak: "ĎA-ku-jem",
          english: "thank you",
          note: "Stress the first syllable. Keep the other two lighter.",
          audio: { transcript: "ďakujem" },
        },
        {
          slovak: "BRA-ti-sla-va",
          english: "Bratislava",
          note: "The same first-syllable pattern.",
          audio: { transcript: "Bratislava" },
        },
      ],
      note: "In ordinary Slovak words, the first syllable carries the main beat.",
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

export function withStressExercises(
  choose: LessonExercise,
  build: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...stressBeats[0]!, exercises: [choose, build] },
    { ...stressBeats[1]!, exercises: [personal] },
  ];
}
