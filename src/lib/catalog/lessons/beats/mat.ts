import type { LessonBeat, LessonExercise } from "$lib/learning/types";

/** Scene line ids. The scene and the beats both use these, so a typo fails typecheck. */
export const matLine = {
  annaTimeForCoffee: "mat-present-anna-time-for-coffee",
  youHaveTime: "mat-present-you-have-time",
  annaAsksAge: "mat-present-anna-asks-age",
  youAge: "mat-present-you-age-28",
  youNoCash: "mat-present-you-no-cash",
} as const;

export const matBeats: LessonBeat[] = [
  {
    id: "mat-present-what-you-have",
    title: "What you have",
    teach: {
      sceneLineIds: [matLine.annaTimeForCoffee, matLine.youHaveTime],
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
    id: "mat-present-age-and-negation",
    title: "Age and negation",
    teach: {
      sceneLineIds: [matLine.annaAsksAge, matLine.youAge, matLine.youNoCash],
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
    id: "mat-present-your-turn",
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
