import type { LessonBeat, LessonExercise } from "$lib/learning/types";

export const negationLineIds = {
  waiterOffersCoffee: "negation-in-conversation-waiter-offers-coffee",
  youNoTime: "negation-in-conversation-you-no-time",
  waiterAsksMenu: "negation-in-conversation-waiter-asks-menu",
  youDontUnderstand: "negation-in-conversation-you-dont-understand",
} as const;

export const negationBeats: LessonBeat[] = [
  {
    id: "negation-in-conversation-refuse-politely",
    title: "Refuse politely",
    teach: {
      sceneLineIds: [negationLineIds.waiterOffersCoffee, negationLineIds.youNoTime],
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
    id: "negation-in-conversation-not-understand",
    title: "Say you do not understand",
    teach: {
      sceneLineIds: [negationLineIds.waiterAsksMenu, negationLineIds.youDontUnderstand],
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
      note: "The prefix ne- is written together with the verb: rozumiem → nerozumiem, mám → nemám. Present-tense byť keeps a separate nie: nie je, nie som.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "negation-in-conversation-your-turn",
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
