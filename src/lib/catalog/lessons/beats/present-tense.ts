import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const presentTenseLineIds = {
  annaWhatAreYouDoing: "present-tense-i-anna-what-are-you-doing",
  youReadABook: "present-tense-i-you-read-a-book",
  annaPeterReads: "present-tense-i-anna-peter-reads",
  youEveryMorning: "present-tense-i-you-every-morning",
  annaWeRead: "present-tense-i-anna-we-read",
} as const;

export const presentTenseBeats: LessonBeat[] = [
  {
    id: "present-tense-i-endings",
    title: "Who is acting",
    teach: {
      sceneLineIds: [
        presentTenseLineIds.annaWhatAreYouDoing,
        presentTenseLineIds.youReadABook,
        presentTenseLineIds.annaPeterReads,
      ],
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
    id: "present-tense-i-we-and-they",
    title: "We and they",
    teach: {
      sceneLineIds: [
        presentTenseLineIds.annaPeterReads,
        presentTenseLineIds.youEveryMorning,
        presentTenseLineIds.annaWeRead,
      ],
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
    id: "present-tense-i-your-turn",
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
