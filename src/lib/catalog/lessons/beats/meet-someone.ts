import type { LessonBeat, LessonExercise } from "$lib/learning/types";

/** Scene line ids. The scene and the beats both use these, so a typo fails typecheck. */
export const meetSomeoneLine = {
  annaGreets: "meet-someone-anna-greets",
  youIntroduce: "meet-someone-you-introduce",
  annaNiceToMeetYou: "meet-someone-anna-nice-to-meet-you",
  youFromCanada: "meet-someone-you-from-canada",
  annaAsksSlovak: "meet-someone-anna-asks-slovak",
  youStillLearning: "meet-someone-you-still-learning",
} as const;

export const meetSomeoneBeats: LessonBeat[] = [
  {
    id: "meet-someone-greet-and-introduce",
    title: "Greet and introduce",
    teach: {
      sceneLineIds: [meetSomeoneLine.annaGreets, meetSomeoneLine.youIntroduce],
      phrases: [
        {
          slovak: "Volám sa …",
          english: "My name is …",
          note: "Use volám sa + your name. Avoid an English-shaped “My name is …” calque.",
          audio: { transcript: "Volám sa." },
        },
      ],
      note: "Start with Dobrý deň when you do not know the person. Ahoj is for friends and informal settings.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "meet-someone-where-youre-from",
    title: "Where you're from",
    teach: {
      sceneLineIds: [meetSomeoneLine.annaNiceToMeetYou, meetSomeoneLine.youFromCanada],
      phrases: [
        {
          slovak: "Som z …",
          english: "I am from …",
          note: "z takes genitive: Kanada → Kanady. Odkiaľ ste? is the polite ask.",
          audio: { transcript: "Som z." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "meet-someone-your-turn",
    title: "Your turn",
    teach: {
      sceneLineIds: [meetSomeoneLine.annaAsksSlovak, meetSomeoneLine.youStillLearning],
      phrases: [
        {
          slovak: "Ešte sa učím.",
          english: "I am still learning.",
          note: "A soft way to say your Slovak is still early — pairs well after Trochu.",
          audio: { transcript: "Ešte sa učím." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
];

export function withMeetSomeoneExercises(
  greeting: LessonExercise,
  name: LessonExercise,
  origin: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...meetSomeoneBeats[0]!, exercises: [greeting, name] },
    { ...meetSomeoneBeats[1]!, exercises: [origin] },
    { ...meetSomeoneBeats[2]!, exercises: [personal] },
  ];
}
