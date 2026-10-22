import {
  listedCharacters,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";
import type { DialogueTurn } from "$lib/learning/types";
import type { TimeOfDay } from "./scene-mood";

export const GREETINGS = [
  "Ahoj.",
  "Čau.",
  "Dobré ráno.",
  "Dobrý deň.",
  "Dobrý večer.",
  "Dobrú noc.",
  "Dovidenia.",
  "Maj sa.",
] as const;

export type Greeting = (typeof GREETINGS)[number];

/** One person crossing the square: Alex meets them, or sees them off. */
export interface DayRound {
  /** What fits; the first is what a Slovak would most likely say. */
  answers: readonly Greeting[];
  id: string;
  leaving: boolean;
  /** Said when another accepted answer is picked. */
  notes?: Partial<Record<Greeting, string>>;
  /** Who it is and what they are doing, in both languages. */
  prompt: { english: string; slovak: string };
  /** What they say back, in their own voice. */
  reply: { english: string; slovak: string };
  time: TimeOfDay;
  who: LessonCharacterId;
}

/** Alex says ty to them, so Ahoj and Čau are theirs. */
const FRIENDS: readonly LessonCharacterId[] = ["anna", "marek"];

export const DAY_ROUNDS: readonly DayRound[] = [
  {
    answers: ["Ahoj.", "Čau.", "Dobré ráno."],
    id: "marek-meets",
    leaving: false,
    notes: {
      "Dobré ráno.":
        "**Dobré ráno** is fine with a friend too; **Ahoj** is what you will hear most.",
    },
    prompt: {
      english: "Marek, your friend, is coming over.",
      slovak: "Prichádza Marek, tvoj kamarát.",
    },
    reply: { english: "Hi, Alex! How are you?", slovak: "Ahoj, Alex! Ako sa máš?" },
    time: "morning",
    who: "marek",
  },
  {
    answers: ["Ahoj.", "Čau.", "Maj sa."],
    id: "marek-leaves",
    leaving: true,
    prompt: { english: "Marek is leaving.", slovak: "Marek odchádza." },
    reply: { english: "Take care, Alex!", slovak: "Maj sa, Alex!" },
    time: "morning",
    who: "marek",
  },
  {
    answers: ["Dobrý deň."],
    id: "lucia-meets",
    leaving: false,
    prompt: {
      english: "Lucia from the shop is coming over.",
      slovak: "Prichádza Lucia z obchodu.",
    },
    reply: { english: "Good day. How are you?", slovak: "Dobrý deň. Ako sa máte?" },
    time: "day",
    who: "lucia",
  },
  {
    answers: ["Dovidenia."],
    id: "lucia-leaves",
    leaving: true,
    prompt: { english: "Lucia is leaving.", slovak: "Lucia odchádza." },
    reply: { english: "Goodbye. Have a nice day!", slovak: "Dovidenia. Pekný deň!" },
    time: "day",
    who: "lucia",
  },
  {
    answers: ["Ahoj.", "Čau.", "Dobrý večer."],
    id: "anna-meets",
    leaving: false,
    notes: {
      "Dobrý večer.":
        "**Dobrý večer** works with a friend too; **Ahoj** is what you will hear most.",
    },
    prompt: {
      english: "Anna, your friend, is coming over.",
      slovak: "Prichádza Anna, tvoja kamarátka.",
    },
    reply: { english: "Hi, Alex! Where are you going?", slovak: "Ahoj, Alex! Kam ideš?" },
    time: "evening",
    who: "anna",
  },
  {
    answers: ["Ahoj.", "Čau.", "Maj sa.", "Dobrú noc."],
    id: "anna-leaves",
    leaving: true,
    notes: {
      "Dobrú noc.":
        "**Dobrú noc** is for parting for the night; with a friend **Ahoj** or **Čau** is more usual.",
    },
    prompt: { english: "Anna is leaving.", slovak: "Anna odchádza." },
    reply: { english: "Bye! Take care!", slovak: "Čau! Maj sa pekne!" },
    time: "evening",
    who: "anna",
  },
  {
    answers: ["Dobrý večer."],
    id: "maria-meets",
    leaving: false,
    prompt: {
      english: "Mária from the language school is coming over.",
      slovak: "Prichádza pani Mária zo školy.",
    },
    reply: { english: "Good evening, Alex.", slovak: "Dobrý večer, Alex." },
    time: "night",
    who: "maria",
  },
  {
    answers: ["Dobrú noc.", "Dovidenia."],
    id: "maria-leaves",
    leaving: true,
    notes: {
      "Dovidenia.":
        "**Dovidenia** is fine at any hour; late at night people say **Dobrú noc**.",
    },
    prompt: { english: "Mária is leaving.", slovak: "Pani Mária odchádza." },
    reply: { english: "Good night, Alex.", slovak: "Dobrú noc, Alex." },
    time: "night",
    who: "maria",
  },
];

export const TIME_WORDS: Record<TimeOfDay, { english: string; slovak: string }> = {
  day: { english: "afternoon", slovak: "Popoludnie" },
  evening: { english: "evening", slovak: "Večer" },
  morning: { english: "morning", slovak: "Ráno" },
  night: { english: "late at night", slovak: "Noc" },
};

const USES: Record<Greeting, string> = {
  "Ahoj.": "a hello or a goodbye between friends",
  "Čau.": "a hello or a goodbye between friends",
  "Dobré ráno.": "a hello in the morning",
  "Dobrý deň.": "a hello in the daytime, to people you say vy to",
  "Dobrý večer.": "a hello from the evening on, late at night too",
  "Dobrú noc.": "a goodbye when you part for the night, never a hello",
  "Dovidenia.": "a goodbye to people you say vy to",
  "Maj sa.": "a goodbye between friends",
};

const WHEN: Record<TimeOfDay, string> = {
  day: "in the afternoon",
  evening: "in the evening",
  morning: "in the morning",
  night: "late at night",
};

const GLOSSES: Record<Greeting, string> = {
  "Ahoj.": "Hi.",
  "Čau.": "Hi.",
  "Dobré ráno.": "Good morning.",
  "Dobrý deň.": "Good day.",
  "Dobrý večer.": "Good evening.",
  "Dobrú noc.": "Good night.",
  "Dovidenia.": "Goodbye.",
  "Maj sa.": "Take care.",
};

/** A greeting as a word, without the full stop it has when said. */
export function bare(greeting: Greeting): string {
  return greeting.slice(0, -1);
}

export function dayName(id: LessonCharacterId): string {
  return listedCharacters().find((character) => character.id === id)?.displayName ?? id;
}

export function isDayRight(round: DayRound, picked: Greeting): boolean {
  return round.answers.includes(picked);
}

/** Why a pick is wrong here: what it is for, and what fits instead. */
export function dayWhy(round: DayRound, picked: Greeting): string {
  const name = `${dayName(round.who)}${FRIENDS.includes(round.who) ? ", a friend," : ""}`;
  const moment = round.leaving ? `Saying goodbye to ${name}` : `Greeting ${name}`;
  return `**${bare(picked)}** is ${USES[picked]}. ${moment} ${WHEN[round.time]}: **${bare(round.answers[0])}**.`;
}

/** The rounds with the same person as round `at`: meeting them, then seeing them off. */
export function pairOf(rounds: readonly DayRound[], at: number): DayRound[] {
  const who = rounds[at]?.who;
  let start = at;
  while (start > 0 && rounds[start - 1].who === who) start -= 1;
  let end = at;
  while (end + 1 < rounds.length && rounds[end + 1].who === who) end += 1;
  return rounds.slice(start, end + 1);
}

export function greetingTurnId(greeting: Greeting): string {
  const slug = greeting
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk")
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
  return `day/say/${slug}`;
}

export function replyTurnId(round: DayRound): string {
  return `day/${round.id}`;
}

/** Every line of the game as a dialogue turn, so it is voiced and timed like a lesson scene. */
export function dayTurns(): DialogueTurn[] {
  const speakers = Object.fromEntries(
    listedCharacters().map((character) => [character.id, character.speakers[0] ?? ""]),
  );

  return [
    ...GREETINGS.map((greeting) => ({
      english: GLOSSES[greeting],
      id: greetingTurnId(greeting),
      slovak: greeting,
      speaker: speakers.alex,
    })),
    ...DAY_ROUNDS.map((round) => ({
      english: round.reply.english,
      id: replyTurnId(round),
      slovak: round.reply.slovak,
      speaker: speakers[round.who],
    })),
  ];
}
