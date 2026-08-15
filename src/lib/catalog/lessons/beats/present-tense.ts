import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const presentTenseBeats: LessonBeat[] = [
  {
    id: "endings",
    title: "Who is acting",
    teach: {
      sceneLineIds: ["peter-reads", "ask-you", "you-read"],
      phrases: [
        {
          slovak: "čítam",
          english: "I read",
          note: "ja · ending -m",
          audio: { transcript: "čítam" },
        },
        {
          slovak: "čítaš",
          english: "you read (informal)",
          note: "ty · ending -š",
          audio: { transcript: "čítaš" },
        },
        {
          slovak: "číta",
          english: "he/she reads",
          note: "on / ona",
          audio: { transcript: "číta" },
        },
      ],
      note: "Čítam, čítaš, číta, čítame, čítate, čítajú — the ending shows who acts.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "we-form",
    title: "We and they",
    teach: {
      phrases: [
        {
          slovak: "čítame",
          english: "we read",
          note: "my · ending -me",
          audio: { transcript: "čítame" },
        },
        {
          slovak: "čítate",
          english: "you read (plural / formal)",
          note: "vy · ending -te",
          audio: { transcript: "čítate" },
        },
        {
          slovak: "čítajú",
          english: "they read",
          note: "oni / ony · ending -jú",
          audio: { transcript: "čítajú" },
        },
      ],
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

export function withPresentTenseExercises(
  choose: LessonExercise,
  repair: LessonExercise,
  weChoose: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...presentTenseBeats[0]!, exercises: [choose, repair] },
    { ...presentTenseBeats[1]!, exercises: [weChoose] },
    { ...presentTenseBeats[2]!, exercises: [personal] },
  ];
}
