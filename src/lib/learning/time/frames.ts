import { markedText } from "$lib/learning/marked-text";
import type { DialogueTurn } from "$lib/learning/types";
import {
  appointmentChoiceWhy,
  appointmentDayPartChoiceWhy,
  appointmentPhrase,
  appointmentPhraseWithDayPart,
  dayPartForHour24,
  englishTimeGloss,
  englishTimeMeaningPhrase,
  randomFaceHour12,
  randomQuarterMinute,
  shuffleArray,
  type ClockFaceTime,
  type DayPart,
} from "./clock";

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

/** One offer: day + clock time. Learner counters with Lepšie o pol … */
export function negotiateOfferTurn(
  day: MeetingDay,
  proposed: ClockFaceTime,
): DialogueTurn {
  const skTime = appointmentPhrase(proposed).replace(/\.$/, "").replace(/^O /, "o ");
  const enTime = englishTimeMeaningPhrase(proposed);
  const line = markedText([
    "Stretneme sa ",
    { role: "day", text: `v ${day.inPhrase}` },
    " ",
    { role: "time", text: skTime },
    "?",
  ]);
  return {
    id: `negotiate-${day.inPhrase}-${proposed.hour}-${proposed.minute}`,
    speaker: "Anna",
    slovak: line.text,
    marks: line.marks,
    english: `Shall we meet on ${day.en} at ${enTime}?`,
    englishToggle: true,
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
  return `Better at ${englishTimeMeaningPhrase(time)}.`;
}

export type NegotiateKind =
  "add-pol" | "drop-pol" | "agree-time" | "move-day" | "confirm-day";

export interface NegotiateRound {
  acceptedAnswers: string[];
  answer: string;
  context: DialogueTurn;
  kind: NegotiateKind;
  prompt: string;
  why: string;
}

/** Feminine days: the form after v is not the dictionary form. */
const DAY_MOVES: Array<{
  from: MeetingDay & { lemma: string };
  to: MeetingDay;
}> = [
  {
    from: { en: "Saturday", inPhrase: "sobotu", lemma: "sobota" },
    to: { en: "Sunday", inPhrase: "nedeľu" },
  },
  {
    from: { en: "Wednesday", inPhrase: "stredu", lemma: "streda" },
    to: { en: "Sunday", inPhrase: "nedeľu" },
  },
  {
    from: { en: "Sunday", inPhrase: "nedeľu", lemma: "nedeľa" },
    to: { en: "Saturday", inPhrase: "sobotu" },
  },
];

/** 1–11. 12:00 is O poludní, which is a different drill. */
function ordinalHour(rng: () => number): number {
  return 1 + Math.floor(rng() * 11);
}

function bareTime(time: ClockFaceTime): string {
  return appointmentPhrase(time).replace(/\.$/, "");
}

function citedTime(time: ClockFaceTime): string {
  return bareTime(time).replace(/^O /, "o ");
}

function pickFrom<T>(rng: () => number, items: readonly T[]): T {
  const index = Math.floor(rng() * items.length);
  return items[index] ?? items[0]!;
}

function addPolRound(rng: () => number): NegotiateRound {
  const day = pickFrom(rng, NEGOTIATE_DAYS);
  const proposedHour = ordinalHour(rng);
  const proposed: ClockFaceTime = { hour: proposedHour, minute: 0 };
  const better: ClockFaceTime = {
    hour: proposedHour === 1 ? 12 : proposedHour - 1,
    minute: 30,
  };
  const answer = negotiateAnswer(better);
  const bare = appointmentPhrase(better);
  const prompt = englishNegotiatePrompt(better);
  return {
    kind: "add-pol",
    context: negotiateOfferTurn(day, proposed),
    prompt,
    answer,
    acceptedAnswers: bare !== answer ? [bare] : [],
    why: `**Lepšie** moves the time. She said **${citedTime(proposed)}**. **${citedTime(better)}** is *${prompt.replace(/\.$/, "")}* — **pol** names the hour ahead, so keep her word.`,
  };
}

function dropPolRound(rng: () => number): NegotiateRound {
  const day = pickFrom(rng, NEGOTIATE_DAYS);
  // Half past 1–10. The hour she names is 2–11, never noon.
  const halfPastHour = 1 + Math.floor(rng() * 10);
  const proposed: ClockFaceTime = { hour: halfPastHour, minute: 30 };
  const better: ClockFaceTime = { hour: halfPastHour + 1, minute: 0 };
  const answer = negotiateAnswer(better);
  const prompt = englishNegotiatePrompt(better);
  return {
    kind: "drop-pol",
    context: negotiateOfferTurn(day, proposed),
    prompt,
    answer,
    acceptedAnswers: [appointmentPhrase(better)],
    why: `**Lepšie** drops **pol**. She said **${citedTime(proposed)}**. **${citedTime(better)}** is *${prompt.replace(/\.$/, "")}*.`,
  };
}

function agreeTimeRound(rng: () => number): NegotiateRound {
  const day = pickFrom(rng, NEGOTIATE_DAYS);
  const time: ClockFaceTime = { hour: ordinalHour(rng), minute: 0 };
  const phrase = bareTime(time);
  const prompt = `Yes. At ${englishTimeMeaningPhrase(time)}.`;
  return {
    kind: "agree-time",
    context: negotiateOfferTurn(day, time),
    prompt,
    answer: `Áno. ${phrase}.`,
    acceptedAnswers: [phrase, `${phrase}.`],
    why: `**Áno** agrees. **${citedTime(time)}** is her time, echoed back. It stays locative after **o**.`,
  };
}

function moveDayRound(rng: () => number): NegotiateRound {
  const move = pickFrom(rng, DAY_MOVES);
  const time: ClockFaceTime = { hour: ordinalHour(rng), minute: 0 };
  const answer = `V ${move.from.inPhrase} nemôžem. V ${move.to.inPhrase}?`;
  return {
    kind: "move-day",
    context: negotiateOfferTurn(move.from, time),
    prompt: `I can't on ${move.from.en}. ${move.to.en}?`,
    answer,
    acceptedAnswers: [],
    why: `**Nemôžem** means I can't. **${move.from.lemma}** after **v** is **v ${move.from.inPhrase}**.`,
  };
}

function confirmDayRound(rng: () => number): NegotiateRound {
  const move = pickFrom(rng, DAY_MOVES);
  const time: ClockFaceTime = { hour: ordinalHour(rng), minute: 0 };
  return {
    kind: "confirm-day",
    context: negotiateOfferTurn(move.from, time),
    prompt: `On ${move.from.en}? Yes.`,
    answer: `V ${move.from.inPhrase}? Áno.`,
    acceptedAnswers: [],
    why: `**v ${move.from.inPhrase}** is ${move.from.en} after **v** (**${move.from.lemma}**). **Áno** confirms that day.`,
  };
}

/**
 * One axis per card. Time is most rounds, a day change is common, a confirm is rare.
 * The first rng() call picks the kind so callers can pin it.
 */
export function pickNegotiateRound(rng: () => number): NegotiateRound {
  const roll = rng();
  if (roll < 0.5) return addPolRound(rng);
  if (roll < 0.68) return dropPolRound(rng);
  if (roll < 0.8) return agreeTimeRound(rng);
  if (roll < 0.94) return moveDayRound(rng);
  return confirmDayRound(rng);
}
