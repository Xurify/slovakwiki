import type { KeyPhrase, LessonBeat, LessonExercise } from "$lib/learning/types";

export const meetSomeoneLineIds = {
  annaGreets: "meet-someone-anna-greets",
  youIntroduce: "meet-someone-you-introduce",
  annaNiceToMeetYou: "meet-someone-anna-nice-to-meet-you",
  youFromCanada: "meet-someone-you-from-canada",
  annaAsksSlovak: "meet-someone-anna-asks-slovak",
  youStillLearning: "meet-someone-you-still-learning",
} as const;

const hello = "Saying hello";
const who = "Saying who you are";

/** Taught in the first beat and voiced as key phrases. */
export const meetSomeoneGreetPhrases: KeyPhrase[] = [
  {
    slovak: "Dobrý deň.",
    english: "Hello; good day.",
    group: hello,
    note: "Polite, at any time of day. The safe choice with someone new.",
    audio: { transcript: "Dobrý deň." },
  },
  {
    slovak: "Dobré ráno.",
    english: "Good morning.",
    group: hello,
    note: "Polite, early in the morning.",
    audio: { transcript: "Dobré ráno." },
  },
  {
    slovak: "Dobrý večer.",
    english: "Good evening.",
    group: hello,
    note: "Polite, in the evening.",
    audio: { transcript: "Dobrý večer." },
  },
  {
    slovak: "Ahoj. / Ahojte.",
    english: "Hi; bye.",
    group: hello,
    note: "Informal: friends, family, children, classmates. **Ahojte** when there are two or more of them.",
    audio: { transcript: "Ahoj. [pause] Ahojte." },
  },
  {
    slovak: "Čau. / Čaute.",
    english: "Hi; bye.",
    group: hello,
    note: "Like **Ahoj**, a little more casual. **Čaute** to a group.",
    audio: { transcript: "Čau. [pause] Čaute." },
  },
  {
    slovak: "Volám sa …",
    english: "My name is …",
    group: who,
    note: "**Volám sa** + your name. **Moje meno je …** is a stiff word-for-word calque.",
    audio: { transcript: "Volám sa." },
  },
  {
    slovak: "Som Alex.",
    english: "I'm Alex.",
    group: who,
    note: "Shorter and just as common: **Som** + your name.",
    audio: { transcript: "Som Alex." },
  },
  {
    slovak: "Ako sa voláte?",
    english: "What is your name?",
    group: who,
    note: "Polite. To a friend or a child: **Ako sa voláš?**",
    audio: { transcript: "Ako sa voláte?" },
  },
  {
    slovak: "A vy?",
    english: "And you?",
    group: who,
    note: "Hands the question back after your own name. To a friend: **A ty?**",
    audio: { transcript: "A vy?" },
  },
];

/** Taught in the second beat and voiced as key phrases. */
export const meetSomeoneOriginPhrases: KeyPhrase[] = [
  {
    slovak: "Teší ma.",
    english: "Nice to meet you.",
    note: "Said once you know each other's names. The reply is **Aj mňa.** (Me too.)",
    audio: { transcript: "Teší ma." },
  },
  {
    slovak: "Odkiaľ ste?",
    english: "Where are you from?",
    note: "Polite. To a friend: **Odkiaľ si?**",
    audio: { transcript: "Odkiaľ ste?" },
  },
  {
    slovak: "Som z …",
    english: "I am from …",
    note: "**z** takes the genitive: **Kanada** → **Kanady**.",
    audio: { transcript: "Som z." },
  },
];

export const meetSomeoneLearningPhrase: KeyPhrase = {
  slovak: "Ešte sa učím.",
  english: "I am still learning.",
  note: "A soft way to say your Slovak is still early — pairs well after Trochu.",
  audio: { transcript: "Ešte sa učím." },
};

export const meetSomeoneBeats: LessonBeat[] = [
  {
    id: "meet-someone-greet-and-introduce",
    title: "Greet and introduce",
    teach: {
      sceneLineIds: [meetSomeoneLineIds.annaGreets, meetSomeoneLineIds.youIntroduce],
      phrases: meetSomeoneGreetPhrases,
      note: "Say **Dobrý deň** in formal situations: in a shop, at the doctor's, to a teacher, a neighbour or anyone older you don't know well. **Ahoj** is for friends, family and children. Greeting a group of friends, add **-te**: **Ahojte**, **Čaute**.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "meet-someone-where-youre-from",
    title: "Where you're from",
    teach: {
      sceneLineIds: [
        meetSomeoneLineIds.annaNiceToMeetYou,
        meetSomeoneLineIds.youFromCanada,
      ],
      phrases: meetSomeoneOriginPhrases,
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "meet-someone-your-turn",
    title: "Still learning",
    teach: {
      sceneLineIds: [
        meetSomeoneLineIds.annaAsksSlovak,
        meetSomeoneLineIds.youStillLearning,
      ],
      phrases: [meetSomeoneLearningPhrase],
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
