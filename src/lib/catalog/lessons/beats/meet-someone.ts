import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const meetSomeoneBeats: LessonBeat[] = [
  {
    id: "greeting",
    title: "Greet and introduce",
    teach: {
      sceneLineIds: ["anna-greeting", "you-introduction"],
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
    id: "origin",
    title: "Where you're from",
    teach: {
      sceneLineIds: ["anna-origin", "you-origin"],
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
    id: "your-turn",
    title: "Your turn",
    teach: {
      sceneLineIds: ["anna-slovak", "you-learning"],
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
