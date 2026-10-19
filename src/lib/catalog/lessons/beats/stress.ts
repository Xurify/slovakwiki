import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const stressLineIds = {
  annaThanks: "first-syllable-stress-anna-thanks",
  noticeDakujem: "first-syllable-stress-notice-dakujem",
} as const;

export const stressBeats: LessonBeat[] = [
  {
    id: "first-syllable-stress-dakujem",
    title: "First-syllable stress",
    teach: {
      sceneLineIds: [stressLineIds.annaThanks, stressLineIds.noticeDakujem],
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
    id: "first-syllable-stress-your-turn",
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
