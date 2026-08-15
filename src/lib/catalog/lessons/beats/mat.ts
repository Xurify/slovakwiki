import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const matBeats: LessonBeat[] = [
  {
    id: "have",
    title: "What you have",
    teach: {
      sceneLineIds: ["mat-cafe-time", "mat-cafe-answer"],
      phrases: [
        { slovak: "Mám …", english: "I have …", audio: { transcript: "Mám." } },
        {
          slovak: "Máš …?",
          english: "Do you have …? (informal)",
          audio: { transcript: "Máš?" },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "age-negative",
    title: "Age and negation",
    teach: {
      sceneLineIds: ["mat-cafe-age", "mat-cafe-age-answer", "mat-cafe-possession"],
      phrases: [
        {
          slovak: "Mám … rokov.",
          english: "I am … years old.",
          audio: { transcript: "Mám rokov." },
        },
        {
          slovak: "Nemám …",
          english: "I do not have …",
          audio: { transcript: "Nemám." },
        },
      ],
      note: "Mám dvadsať rokov for age. Add ne- for negative: nemám.",
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

export function withMatExercises(
  mam: LessonExercise,
  mas: LessonExercise,
  nemam: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...matBeats[0]!, exercises: [mam, mas] },
    { ...matBeats[1]!, exercises: [nemam] },
    { ...matBeats[2]!, exercises: [personal] },
  ];
}
