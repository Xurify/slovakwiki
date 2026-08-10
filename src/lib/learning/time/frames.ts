import type { DialogueTurn } from "$lib/learning/types";
import {
  appointmentChoiceWhy,
  appointmentDayPartChoiceWhy,
  appointmentPhrase,
  appointmentPhraseWithDayPart,
  analogFace,
  dayPartForHour24,
  englishTimeGloss,
  englishTimeMeaningPhrase,
  randomFaceHour12,
  randomQuarterMinute,
  shuffleArray,
  type ClockFaceTime,
  type DayPart,
} from "./clock";

const HOUR_ENGLISH_WORD: Record<number, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "eleven",
  12: "twelve",
};

export interface ScheduleFrame {
  id: string;
  skStem: string;
  enStem: string;
  skPrefixTokens: string[];
  enEvent: string;
  skQuestion: string;
  enQuestion: string;
  whyCarriers: string;
}

export const SCHEDULE_FRAMES: ScheduleFrame[] = [
  {
    id: "film-starts",
    skStem: "Film začína…",
    enStem: "The film starts…",
    skPrefixTokens: ["Film", "začína"],
    enEvent: "The film starts",
    skQuestion: "O koľkej začína film?",
    enQuestion: "When does the film start?",
    whyCarriers: "**Film** means film. **Začína** means starts.",
  },
  {
    id: "lunch",
    skStem: "Obedujeme…",
    enStem: "We have lunch…",
    skPrefixTokens: ["Obedujeme"],
    enEvent: "We have lunch",
    skQuestion: "Kedy obedujeme?",
    enQuestion: "When do we have lunch?",
    whyCarriers: "**Obed** is lunch. **Obedujeme** means we have lunch.",
  },
  {
    id: "train-leaves",
    skStem: "Vlak odchádza…",
    enStem: "The train leaves…",
    skPrefixTokens: ["Vlak", "odchádza"],
    enEvent: "The train leaves",
    skQuestion: "O koľkej odchádza vlak?",
    enQuestion: "When does the train leave?",
    whyCarriers: "**Vlak** means train. **Odchádza** means leaves.",
  },
  {
    id: "meeting-starts",
    skStem: "Stretnutie začína…",
    enStem: "The meeting starts…",
    skPrefixTokens: ["Stretnutie", "začína"],
    enEvent: "The meeting starts",
    skQuestion: "O koľkej začína stretnutie?",
    enQuestion: "When does the meeting start?",
    whyCarriers: "**Stretnutie** means meeting. **Začína** means starts.",
  },
];

export interface MeetingDay {
  en: string;
  inPhrase: string;
}

export const NEGOTIATE_DAYS: MeetingDay[] = [
  { en: "Tuesday", inPhrase: "utorok" },
  { en: "Wednesday", inPhrase: "stredu" },
  { en: "Friday", inPhrase: "piatok" },
];

export function pickRandomScheduleFrame(rng: () => number): ScheduleFrame {
  const index = Math.floor(rng() * SCHEDULE_FRAMES.length);
  return SCHEDULE_FRAMES[index] ?? SCHEDULE_FRAMES[0]!;
}

export function partialContextTurn(frame: ScheduleFrame): DialogueTurn {
  return {
    id: `frame-${frame.id}-stem`,
    speaker: "Scene",
    slovak: frame.skStem,
    english: frame.enStem,
  };
}

export function questionContextTurn(frame: ScheduleFrame): DialogueTurn {
  return {
    id: `frame-${frame.id}-question`,
    speaker: "Scene",
    slovak: frame.skQuestion,
    english: frame.enQuestion,
  };
}

export function negotiateContextTurn(day: MeetingDay): DialogueTurn {
  return {
    id: `negotiate-${day.inPhrase}`,
    speaker: "Anna",
    slovak: `Stretneme sa v ${day.inPhrase}?`,
    english: `Shall we meet on ${day.en}?`,
  };
}

/** Prior offer to counter — lesson beat: Áno. O tretej? → Lepšie o pol tretej. */
export function negotiateProposalTurn(proposed: ClockFaceTime): DialogueTurn {
  const skTime = appointmentPhrase(proposed).replace(/\.$/, "");
  const enTime = englishTimeGloss(proposed).replace(/\.$/, "");
  return {
    id: `negotiate-proposal-${proposed.hour}-${proposed.minute}`,
    speaker: "You",
    slovak: `Áno. ${skTime}?`,
    english: `Yes. ${enTime}?`,
  };
}

/**
 * Proposed on-the-hour time + earlier half-past counter
 * (O tretej → O pol tretej).
 */
export function pickNegotiateTimes(rng: () => number): {
  proposed: ClockFaceTime;
  better: ClockFaceTime;
} {
  const proposedHour = randomFaceHour12(rng);
  const betterHour = proposedHour === 1 ? 12 : proposedHour - 1;
  return {
    proposed: { hour: proposedHour, minute: 0 },
    better: { hour: betterHour, minute: 30 },
  };
}

export function isAmbiguousOnTheHour(time: ClockFaceTime): boolean {
  return time.minute === 0 && (time.hour === 7 || time.hour === 8);
}

export function pickScheduleTime(rng: () => number): {
  time: ClockFaceTime;
  dayPart?: DayPart;
} {
  const hour = randomFaceHour12(rng);
  const minute = randomQuarterMinute(rng);
  const time: ClockFaceTime = { hour, minute };

  if (isAmbiguousOnTheHour(time)) {
    const useEvening = rng() < 0.5;
    const hour24 = useEvening ? 20 : 8;
    const dayPart = dayPartForHour24(hour24);
    return { time, dayPart };
  }

  return { time };
}

export function pickScheduleTimeWithoutDayPart(rng: () => number): ClockFaceTime {
  let picked = pickScheduleTime(rng);
  while (picked.dayPart) {
    picked = pickScheduleTime(rng);
  }
  return picked.time;
}

export function englishAppointmentPrompt(time: ClockFaceTime, dayPart?: DayPart): string {
  const gloss = englishTimeGloss(time).replace(/\.$/, "");
  if (!dayPart) return `${gloss}.`;
  const tag = dayPart === "ráno" ? "in the morning" : "in the evening";
  return `${gloss} ${tag}.`;
}

export function fullEnglishSchedulePrompt(
  frame: ScheduleFrame,
  time: ClockFaceTime,
  dayPart?: DayPart,
): string {
  const timePhrase = englishTimeMeaningPhrase(time);
  if (dayPart) {
    const tag = dayPart === "ráno" ? "in the morning" : "in the evening";
    return `${frame.enEvent} at ${timePhrase} ${tag}.`;
  }
  return `${frame.enEvent} at ${timePhrase}.`;
}

/** One reading block: Slovak stem + full English schedule line (no dialogue bubble). */
export function scheduleExercisePrompt(
  frame: ScheduleFrame,
  time: ClockFaceTime,
  dayPart?: DayPart,
): { promptSk: string; prompt: string } {
  return {
    promptSk: frame.skStem,
    prompt: fullEnglishSchedulePrompt(frame, time, dayPart),
  };
}

export function fullScheduleLine(
  frame: ScheduleFrame,
  time: ClockFaceTime,
  dayPart?: DayPart,
): string {
  const phrase = dayPart
    ? appointmentPhraseWithDayPart(time, dayPart)
    : appointmentPhrase(time);
  const timeTail = phrase.replace(/^O /, "o ");
  return `${frame.skPrefixTokens.join(" ")} ${timeTail}`;
}

export function preferredAppointmentAnswer(
  time: ClockFaceTime,
  dayPart?: DayPart,
): string {
  if (dayPart) return appointmentPhraseWithDayPart(time, dayPart);
  return appointmentPhrase(time);
}

export function frameWhy(
  frame: ScheduleFrame,
  time: ClockFaceTime,
  dayPart?: DayPart,
): string {
  const timeWhy = dayPart
    ? appointmentDayPartChoiceWhy(time, dayPart)
    : appointmentChoiceWhy(time);
  return `${timeWhy} ${frame.whyCarriers}`;
}

export function appointmentTimeTiles(time: ClockFaceTime): string[] {
  const phrase = appointmentPhrase(time).replace(/\.$/, "");
  if (phrase.startsWith("O ")) {
    const rest = phrase.slice(2);
    const restWords = rest.split(" ");
    const last = restWords[restWords.length - 1]!;
    restWords[restWords.length - 1] = `${last}.`;
    return ["o", ...restWords];
  }

  const words = phrase.split(" ");
  const last = words[words.length - 1]!;
  words[words.length - 1] = `${last}.`;
  return words;
}

export function buildTilesForFrame(
  frame: ScheduleFrame,
  time: ClockFaceTime,
  rng: () => number,
  distractorTiles: string[],
): { tiles: string[]; answer: string[] } {
  const timeTiles = appointmentTimeTiles(time);
  const answer = [...frame.skPrefixTokens, ...timeTiles];
  const tiles = shuffleArray([...answer, ...distractorTiles], rng);
  return { tiles, answer };
}

export function typedAcceptedAnswers(
  frame: ScheduleFrame,
  time: ClockFaceTime,
  dayPart?: DayPart,
): string[] {
  const preferred = preferredAppointmentAnswer(time, dayPart);
  const full = fullScheduleLine(frame, time, dayPart);
  const alts = [preferred, full];
  return [...new Set(alts)];
}

export function negotiateAnswer(time: ClockFaceTime): string {
  const bare = appointmentPhrase(time).replace(/^O /, "").replace(/\.$/, "");
  return `Lepšie o ${bare}.`;
}

export function englishNegotiatePrompt(time: ClockFaceTime): string {
  const face = analogFace(time);
  if (time.minute === 30) {
    const hourWord = HOUR_ENGLISH_WORD[face.hour] ?? String(face.hour);
    return `Better at half past ${hourWord}.`;
  }
  return `Better at ${englishTimeMeaningPhrase(time)}.`;
}

export function negotiateWhy(time: ClockFaceTime): string {
  const answer = negotiateAnswer(time).replace(/\.$/, "");
  const english = englishNegotiatePrompt(time).replace(/\.$/, "");
  return `**Lepšie** counters with a better time — **${answer}** means *${english}*.`;
}
