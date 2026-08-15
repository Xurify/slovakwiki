import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const negationBeats: LessonBeat[] = [
  {
    id: "refuse",
    title: "Refuse politely",
    teach: {
      sceneLineIds: ["cafe-offer", "cafe-refusal"],
      phrases: [
        {
          slovak: "Nie, ďakujem.",
          english: "No, thank you.",
          audio: { transcript: "Nie, ďakujem." },
        },
        {
          slovak: "Nemám …",
          english: "I do not have …",
          audio: { transcript: "Nemám." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "understand",
    title: "Say you do not understand",
    teach: {
      sceneLineIds: ["cafe-menu", "cafe-clarification"],
      phrases: [
        {
          slovak: "Nerozumiem.",
          english: "I do not understand.",
          audio: { transcript: "Nerozumiem." },
        },
        {
          slovak: "Nie je to …",
          english: "It is not …",
          audio: { transcript: "Nie je to." },
        },
      ],
      note: "Nie attaches to the verb: rozumiem → nerozumiem, mám → nemám.",
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

export function withNegationExercises(
  refusal: LessonExercise,
  understanding: LessonExercise,
  placement: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...negationBeats[0]!, exercises: [refusal, placement] },
    { ...negationBeats[1]!, exercises: [understanding] },
    { ...negationBeats[2]!, exercises: [personal] },
  ];
}
