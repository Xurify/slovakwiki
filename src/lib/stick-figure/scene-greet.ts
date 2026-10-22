import type { TimeOfDay } from "./scene-mood";

export const GREETINGS = [
  "Dobré ráno.",
  "Dobrý deň.",
  "Dobrý večer.",
  "Dobrú noc.",
  "Dovidenia.",
] as const;

export type Greeting = (typeof GREETINGS)[number];

/** One moment on the square: Alex meets Mária, or takes leave of her. */
export interface GreetRound {
  /** What fits; the first is what a Slovak would most likely say. */
  answers: readonly Greeting[];
  id: string;
  leaving: boolean;
  /** Said when another accepted answer is picked. */
  note?: string;
  time: TimeOfDay;
}

export const GREET_ROUNDS: readonly GreetRound[] = [
  {
    answers: ["Dobré ráno.", "Dobrý deň."],
    id: "meet-morning",
    leaving: false,
    note: "**Dobrý deň** works all day, and in the morning you will often hear **Dobré ráno**.",
    time: "morning",
  },
  { answers: ["Dobrý deň."], id: "meet-day", leaving: false, time: "day" },
  { answers: ["Dobrý večer."], id: "meet-evening", leaving: false, time: "evening" },
  { answers: ["Dobrý večer."], id: "meet-night", leaving: false, time: "night" },
  { answers: ["Dovidenia."], id: "leave-day", leaving: true, time: "day" },
  {
    answers: ["Dobrú noc.", "Dovidenia."],
    id: "leave-night",
    leaving: true,
    note: "**Dovidenia** is fine, and late at night **Dobrú noc** is what people say.",
    time: "night",
  },
];

export const TIME_WORDS: Record<TimeOfDay, { english: string; slovak: string }> = {
  day: { english: "afternoon", slovak: "Popoludnie" },
  evening: { english: "evening", slovak: "Večer" },
  morning: { english: "morning", slovak: "Ráno" },
  night: { english: "late at night", slovak: "Noc" },
};

const USES: Record<Greeting, string> = {
  "Dobré ráno.": "a hello in the morning",
  "Dobrý deň.": "a hello in the daytime",
  "Dobrý večer.": "a hello from the evening on, late at night too",
  "Dobrú noc.": "a goodbye late at night, never a hello",
  "Dovidenia.": "a goodbye at any time of day",
};

const WHEN: Record<TimeOfDay, string> = {
  day: "in the afternoon",
  evening: "in the evening",
  morning: "in the morning",
  night: "late at night",
};

/** A greeting as a word, without the full stop it has when said. */
export function bare(greeting: Greeting): string {
  return greeting.slice(0, -1);
}

export function isGreetRight(round: GreetRound, picked: Greeting): boolean {
  return round.answers.includes(picked);
}

/** Why a pick is wrong here: what it is for, and what fits instead. */
export function greetWhy(round: GreetRound, picked: Greeting): string {
  const moment = round.leaving ? "Taking leave" : "Meeting someone";
  return `**${bare(picked)}** is ${USES[picked]}. ${moment} ${WHEN[round.time]}: **${bare(round.answers[0])}**.`;
}
