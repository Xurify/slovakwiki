import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const numbersLineIds = {
  mariaWelcome: "numbers-and-personal-details-maria-welcome",
  youHereToRegister: "numbers-and-personal-details-you-here-to-register",
  mariaAsksAge: "numbers-and-personal-details-maria-asks-age",
  youAge: "numbers-and-personal-details-you-age-28",
  mariaAsksPhone: "numbers-and-personal-details-maria-asks-phone",
  youPhoneNumber: "numbers-and-personal-details-you-phone-number",
} as const;

export const numbersBeats: LessonBeat[] = [
  {
    id: "numbers-and-personal-details-say-age",
    title: "Say your age",
    teach: {
      sceneLineIds: [
        numbersLineIds.mariaWelcome,
        numbersLineIds.youHereToRegister,
        numbersLineIds.mariaAsksAge,
        numbersLineIds.youAge,
      ],
      phrases: [
        {
          slovak: "Mám … rokov.",
          english: "I am … years old.",
          note: "Use rokov after the number when you say your age.",
          audio: { transcript: "Mám rokov." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "numbers-and-personal-details-phone-digits",
    title: "Phone digits",
    teach: {
      sceneLineIds: [numbersLineIds.mariaAsksPhone, numbersLineIds.youPhoneNumber],
      phrases: [
        {
          slovak: "Moje číslo je …",
          english: "My number is …",
          note: "Say each phone digit separately.",
          audio: { transcript: "Moje číslo je." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "numbers-and-personal-details-how-much",
    title: "How much does it cost?",
    teach: {
      phrases: [
        {
          slovak: "Koľko to stojí?",
          english: "How much does it cost?",
          audio: { transcript: "Koľko to stojí?" },
        },
        {
          slovak: "Stojí to päť eur.",
          english: "It costs five euros.",
          audio: { transcript: "Stojí to päť eur." },
        },
      ],
      note: "Ask Koľko to stojí? and answer Stojí to + price.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "numbers-and-personal-details-your-turn",
    title: "Your turn",
    teach: {},
    exercises: [] as LessonExercise[],
  },
];

export function withNumbersExercises(
  age: LessonExercise,
  phone: LessonExercise,
  price: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...numbersBeats[0]!, exercises: [age] },
    { ...numbersBeats[1]!, exercises: [phone] },
    { ...numbersBeats[2]!, exercises: [price] },
    { ...numbersBeats[3]!, exercises: [personal] },
  ];
}
