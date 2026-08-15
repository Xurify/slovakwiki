/** Slovak clock-time answer variants for learner drills (:00 / :15 / :30 / :45). */

export type {
  ClockFaceTime,
  ClockTimeOfDay,
  DayPart,
  QuarterMinute,
} from "./clock-types";
export { DAY_PART_ALIASES, EXACT_MINUTE_POOL } from "./clock-types";
import type {
  ClockFaceTime,
  ClockTimeOfDay,
  DayPart,
  QuarterMinute,
} from "./clock-types";
import { DAY_PART_ALIASES, EXACT_MINUTE_POOL } from "./clock-types";

const CARDINAL: Record<number, string> = {
  1: "jeden",
  2: "dva",
  3: "tri",
  4: "štyri",
  5: "päť",
  6: "šesť",
  7: "sedem",
  8: "osem",
  9: "deväť",
  10: "desať",
  11: "jedenásť",
  12: "dvanásť",
  13: "trinásť",
  14: "štrnásť",
  15: "pätnásť",
  16: "šestnásť",
  17: "sedemnásť",
  18: "osemnásť",
  19: "devätnásť",
  20: "dvadsať",
  21: "dvadsaťjeden",
  22: "dvadsaťdva",
  23: "dvadsaťtri",
};

/** Feminine genitive ordinals used after pol (pol tretej). Indexed by coming hour 1–12. */
const POL_ORDINAL: Record<number, string> = {
  1: "jednej",
  2: "druhej",
  3: "tretej",
  4: "štvrtej",
  5: "piatej",
  6: "šiestej",
  7: "siedmej",
  8: "ôsmej",
  9: "deviatej",
  10: "desiatej",
  11: "jedenástej",
  12: "dvanástej",
};

/** Forms after štvrť na / trištvrte na (toward next hour). */
const TOWARD_HOUR: Record<number, string> = {
  1: "jednu",
  2: "dve",
  3: "tri",
  4: "štyri",
  5: "päť",
  6: "šesť",
  7: "sedem",
  8: "osem",
  9: "deväť",
  10: "desať",
  11: "jedenásť",
  12: "dvanásť",
};

const MINUTE_WORD: Record<Exclude<QuarterMinute, 0>, string> = {
  15: "pätnásť",
  30: "tridsať",
  45: "štyridsaťpäť",
};

export function faceHour12(hour24: number): number {
  const mod = ((Math.trunc(hour24) % 24) + 24) % 24;
  const twelve = mod % 12;
  return twelve === 0 ? 12 : twelve;
}

function comingHour12(hour24: number): number {
  return (faceHour12(hour24) % 12) + 1;
}

function pushUnique(target: string[], ...values: string[]): void {
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (!target.includes(trimmed)) target.push(trimmed);
  }
}

function withOptionalJe(target: string[], phrase: string, verb: "Je" | "Sú"): void {
  // Preferred form first (with verb), then bare phrase.
  pushUnique(target, `${verb} ${phrase}`, phrase);
}

function hodinaPhrase(count: number): { verb: "Je" | "Sú"; nounPhrase: string } {
  if (count === 1) return { verb: "Je", nounPhrase: "jedna hodina" };
  if (count >= 2 && count <= 4) {
    const card = count === 2 ? "dve" : (CARDINAL[count] ?? String(count));
    return { verb: "Sú", nounPhrase: `${card} hodiny` };
  }
  const card = CARDINAL[count] ?? String(count);
  return { verb: "Je", nounPhrase: `${card} hodín` };
}

function hourMinuteAnswers(
  hourCount: number,
  minute: Exclude<QuarterMinute, 0>,
): string[] {
  const shape = hodinaPhrase(hourCount);
  const minuteWord = MINUTE_WORD[minute];
  return [
    `${shape.verb} ${shape.nounPhrase} a ${minuteWord} minút`,
    `${shape.nounPhrase} a ${minuteWord} minút`,
  ];
}

/** Bare digital reading: "štrnásť tridsať", "dve pätnásť". */
function digitalHourWord(hourCount: number): string {
  if (hourCount === 0) return "nula";
  if (hourCount === 1) return "jedna";
  if (hourCount === 2) return "dve";
  return CARDINAL[hourCount] ?? String(hourCount);
}

function digitalAnswers(hourCount: number, minute: QuarterMinute): string[] {
  const hourWord = digitalHourWord(hourCount);
  if (minute === 0) return [hourWord, `${hourWord} nula nula`];
  return [`${hourWord} ${MINUTE_WORD[minute]}`];
}

function fullHourAnswers(hour24: number): string[] {
  const answers: string[] = [];

  if (hour24 === 0) {
    withOptionalJe(answers, "polnoc", "Je");
    const midnightTwelve = hodinaPhrase(12);
    withOptionalJe(answers, midnightTwelve.nounPhrase, midnightTwelve.verb);
    return answers;
  }
  if (hour24 === 12) {
    withOptionalJe(answers, "poludnie", "Je");
    const noonTwelve = hodinaPhrase(12);
    withOptionalJe(answers, noonTwelve.nounPhrase, noonTwelve.verb);
    return answers;
  }

  const twelve = faceHour12(hour24);
  const twelveShape = hodinaPhrase(twelve);
  withOptionalJe(answers, twelveShape.nounPhrase, twelveShape.verb);

  if (hour24 >= 13 && hour24 <= 23) {
    const formal = hodinaPhrase(hour24);
    withOptionalJe(answers, formal.nounPhrase, formal.verb);
  }

  return answers;
}

/**
 * Preferred correction shown first in UI feedback.
 */
export function preferredAnswerForTime(time: ClockFaceTime): string {
  return answersForTime(time)[0] ?? "";
}

export function answersForTime(time: ClockFaceTime): string[] {
  const hour = ((Math.trunc(time.hour) % 24) + 24) % 24;
  const minute = time.minute;
  const answers: string[] = [];

  if (minute === 0) {
    pushUnique(answers, ...fullHourAnswers(hour));
    pushUnique(answers, ...digitalAnswers(faceHour12(hour), 0));
    if (hour >= 13 && hour <= 23) {
      pushUnique(answers, ...digitalAnswers(hour, 0));
    }
    if (hour === 0) {
      pushUnique(answers, ...digitalAnswers(0, 0));
    }
    return answers;
  }

  const toward = comingHour12(hour);
  const towardWord = TOWARD_HOUR[toward] ?? String(toward);
  const polWord = POL_ORDINAL[toward] ?? "";

  if (minute === 15) {
    withOptionalJe(answers, `štvrť na ${towardWord}`, "Je");
  } else if (minute === 30) {
    withOptionalJe(answers, `pol ${polWord}`, "Je");
  } else {
    withOptionalJe(answers, `trištvrte na ${towardWord}`, "Je");
  }

  // 12h informal hour + minutes
  pushUnique(answers, ...hourMinuteAnswers(faceHour12(hour), minute));
  pushUnique(answers, ...digitalAnswers(faceHour12(hour), minute));

  // 24h formal hour + minutes for afternoon/evening
  if (hour >= 13 && hour <= 23) {
    pushUnique(answers, ...hourMinuteAnswers(hour, minute));
    pushUnique(answers, ...digitalAnswers(hour, minute));
  }

  return answers;
}

export function analogFace(time: ClockFaceTime): { hour: number; minute: number } {
  return { hour: faceHour12(time.hour), minute: time.minute };
}

export function formatDigital(time: { hour: number; minute: number }): string {
  const hour = ((Math.trunc(time.hour) % 24) + 24) % 24;
  return `${String(hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

/** Screen-reader label for a 12-hour analog face. */
export function formatClockFaceLabel(clock: { hour: number; minute: number }): string {
  return `${clock.hour}:${String(clock.minute).padStart(2, "0")}`;
}

const QUARTERS: QuarterMinute[] = [0, 15, 30, 45];

function locativeOrdinal12(hour12: number): string {
  return POL_ORDINAL[hour12] ?? String(hour12);
}

/** Appointment form: O tretej. / O pol tretej. / O štvrť na tri. */
export function appointmentPhrase(time: ClockFaceTime): string {
  const hour = ((Math.trunc(time.hour) % 24) + 24) % 24;
  const minute = time.minute;

  if (minute === 0) {
    if (hour === 12) return "O poludní.";
    if (hour === 0) return "O polnoci.";
    const twelve = faceHour12(hour);
    return `O ${locativeOrdinal12(twelve)}.`;
  }

  const toward = comingHour12(hour);
  const towardWord = TOWARD_HOUR[toward] ?? String(toward);
  const polWord = locativeOrdinal12(toward);

  if (minute === 15) return `O štvrť na ${towardWord}.`;
  if (minute === 30) return `O pol ${polWord}.`;
  return `O trištvrte na ${towardWord}.`;
}

/** Preferred appointment answer for O koľkej? drills (no trailing period). */
export function preferredAppointmentAnswerForTime(time: ClockFaceTime): string {
  return appointmentPhrase(time).replace(/\.$/, "");
}

/** Accepted appointment forms for O koľkej? / Kedy? (noon/midnight alts; 1:00 is O jednej only). */
export function appointmentAnswersForTime(time: ClockFaceTime): string[] {
  return appointmentAlternates(time).map((phrase) => phrase.replace(/\.$/, ""));
}

/** English gloss for feedback (At half past two.). */
export function englishTimeGloss(time: ClockFaceTime): string {
  const face = analogFace(time);
  const h = face.hour;
  const m = face.minute;

  if (m === 0) return `At ${h} o’clock.`;
  if (m === 15) return `At quarter past ${h === 12 ? 12 : h}.`;
  if (m === 30) return `At half past ${h}.`;
  return `At quarter to ${h === 12 ? 1 : h + 1}.`;
}

/** Spoken English time without “At …” — for odd-one-out prompts. */
export function englishTimeMeaningPhrase(time: ClockFaceTime): string {
  return englishTimeGloss(time).replace(/^At /, "").replace(/\.$/, "");
}

/** 12-face digital label for prompts (2:45). */
export function formatFaceDigital12(time: ClockFaceTime): string {
  const face = analogFace(time);
  return `${face.hour}:${String(face.minute).padStart(2, "0")}`;
}

function tellingPhraseEmphasis(label: string): string {
  return label.replace(/^Je /, "").replace(/\.$/, "");
}

function appointmentPhraseEmphasis(phrase: string): string {
  return phrase.replace(/\.$/, "");
}

function towardWordForTime(time: ClockFaceTime): string {
  const toward = comingHour12(time.hour);
  return TOWARD_HOUR[toward] ?? String(toward);
}

function polWordForTime(time: ClockFaceTime): string {
  return locativeOrdinal12(comingHour12(time.hour));
}

/** Rule-first feedback for a correct appointment choice. */
export function appointmentChoiceWhy(time: ClockFaceTime): string {
  const digital = formatFaceDigital12(time);
  const meaning = englishTimeMeaningPhrase(time).toLowerCase();

  if (time.minute === 0) {
    const bare = appointmentPhraseEmphasis(appointmentPhrase(time));
    return `**${bare}** means ${meaning} — the appointment starts right at **${digital}**.`;
  }
  if (time.minute === 15) {
    const towardWord = towardWordForTime(time);
    const toward = comingHour12(time.hour);
    return `**štvrť na ${towardWord}** means ${meaning}: one quarter of the way toward **${toward}** (**${digital}**). After **na**, name the hour ahead.`;
  }
  if (time.minute === 30) {
    const toward = comingHour12(time.hour);
    const polWord = polWordForTime(time);
    return `**O pol ${polWord}** means ${meaning}: halfway toward **${toward}** (**${digital}**). **Pol** names the hour ahead, not the one the hand sits on.`;
  }

  const towardWord = towardWordForTime(time);
  const toward = comingHour12(time.hour);
  return `**trištvrte na ${towardWord}** means ${meaning}: three quarters of the way toward **${toward}** (**${digital}**). After **na**, name the hour ahead.`;
}

/** Rule-first feedback for a correct telling-time choice (Je/Sú …). */
export function tellingChoiceWhy(time: ClockFaceTime): string {
  const phrase = tellingPhraseEmphasis(tellingTimeLabel(time));
  const meaning = englishTimeMeaningPhrase(time).toLowerCase();
  const digital = formatFaceDigital12(time);

  if (time.minute === 0) {
    return `**${phrase}** means ${meaning} — **${digital}** on the clock.`;
  }
  if (time.minute === 15) {
    const toward = comingHour12(time.hour);
    return `**${phrase}** means ${meaning}: one quarter toward **${toward}** (**${digital}**). After **na**, name the hour ahead.`;
  }
  if (time.minute === 30) {
    const toward = comingHour12(time.hour);
    return `**${phrase}** means ${meaning}: halfway toward **${toward}** (**${digital}**). **Pol** names the hour ahead.`;
  }

  const toward = comingHour12(time.hour);
  return `**${phrase}** means ${meaning}: three quarters toward **${toward}** (**${digital}**). After **na**, name the hour ahead.`;
}

export function okoloExactTrapWhy(
  trapKind: "exact" | "around",
  phrase: string,
  time: ClockFaceTime,
): string {
  const bare = phrase.replace(/\.$/, "");
  const digital = formatFaceDigital12(time);
  if (trapKind === "exact") {
    return `**${bare}** is exact — the prompt asks for approximate **okolo** around **${digital}**.`;
  }
  return `**${bare}** is approximate — the prompt asks for exactly **${digital}**.`;
}

export function okoloChoiceWhy(time: ClockFaceTime, kind: "around" | "exact"): string {
  if (kind === "around") {
    const bare = aroundPhrase(time).replace(/\.$/, "");
    return `**${bare}** means around **${formatFaceDigital12(time)}** — **okolo** is approximate, not exact.`;
  }
  return appointmentChoiceWhy(time);
}

export function exactMinuteChoiceWhy(time: ClockTimeOfDay): string {
  const face = analogFace({ hour: time.hour, minute: time.minute as QuarterMinute });
  const label = exactMinuteTellingLabel(time).replace(/^Sú |^Je |\.$/g, "");
  return `**${label}** names **${face.hour}:${String(time.minute).padStart(2, "0")}** — hour agreement plus **a … minút**.`;
}

export function exactMinuteWrongWhy(
  kind: "minute" | "hour",
  label: string,
  time: ClockTimeOfDay,
): string {
  const bare = label.replace(/^Sú |^Je |\.$/g, "");
  const face = analogFace({ hour: time.hour, minute: time.minute as QuarterMinute });
  const digital = `${face.hour}:${String(time.minute).padStart(2, "0")}`;
  if (kind === "minute") {
    return `**${bare}** uses the wrong minute count — not **${digital}**.`;
  }
  return `**${bare}** names the wrong hour for **${digital}**.`;
}

function timeDistractorWhy(
  wrongPhrase: string,
  correct: ClockFaceTime,
  wrong: ClockFaceTime,
): string {
  const wrongDigital = formatFaceDigital12(wrong);
  const wrongMeaning = englishTimeMeaningPhrase(wrong).toLowerCase();
  const correctMeaning = englishTimeMeaningPhrase(correct).toLowerCase();
  const wrongFace = analogFace(wrong);
  const correctFace = analogFace(correct);

  if (wrongFace.hour === correctFace.hour && wrong.minute !== correct.minute) {
    if (wrong.minute === 0) {
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**) — on the hour, not ${correctMeaning}.`;
    }
    if (wrong.minute === 30 && correct.minute === 45) {
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**) — only halfway there. For ${correctMeaning}, use **trištvrte na ${towardWordForTime(correct)}**.`;
    }
    if (wrong.minute === 15 && correct.minute === 45) {
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**) — one quarter toward the next hour, not three.`;
    }
    if (wrong.minute === 45 && correct.minute === 15) {
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**) — three quarters toward the next hour, not one.`;
    }
    if (wrong.minute === 30 && correct.minute === 15) {
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**) — halfway, not a quarter past **${correctFace.hour}**.`;
    }
    return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**) — not ${correctMeaning}.`;
  }

  if (wrong.minute === correct.minute && wrongFace.hour !== correctFace.hour) {
    if (correct.minute === 45) {
      const correctToward = towardWordForTime(correct);
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**). For ${correctMeaning}, name **${correctToward}** after **na** — the hand is near **${correctFace.hour}**, but Slovak looks ahead.`;
    }
    if (correct.minute === 15) {
      const correctToward = towardWordForTime(correct);
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**). For ${correctMeaning}, name **${correctToward}** after **na** — not the hour behind.`;
    }
    if (correct.minute === 30) {
      const correctPol = polWordForTime(correct);
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**). For ${correctMeaning}, use **pol ${correctPol}** — **pol** names the hour ahead.`;
    }
    if (correct.minute === 0) {
      return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**) — not ${correctMeaning}.`;
    }
  }

  return `**${wrongPhrase}** means ${wrongMeaning} (**${wrongDigital}**) — not ${correctMeaning}.`;
}

/** Why a select-all trap label does not match the prompt time. */
export function selectAllTrapWhy(time: ClockFaceTime, trapLabel: string): string {
  const face = analogFace(time);
  const target = formatFaceDigital12(time);
  const phrase = tellingPhraseEmphasis(trapLabel);

  if (time.minute === 30) {
    const wrongHour = face.hour === 1 ? 12 : face.hour - 1;
    const wrongTime = formatFaceDigital12({ hour: wrongHour, minute: 30 });
    const towardPol = locativeOrdinal12(face.hour);
    return `**${phrase}** is halfway toward **${towardPol}** — **${wrongTime}**, not **${target}**.`;
  }
  if (time.minute === 15) {
    const wrongHour = face.hour === 1 ? 12 : face.hour - 1;
    const wrongTime = formatFaceDigital12({ hour: wrongHour, minute: 15 });
    const trapTowardWord = TOWARD_HOUR[face.hour] ?? String(face.hour);
    return `**${phrase}** is one quarter toward **${trapTowardWord}** — **${wrongTime}**, not **${target}**.`;
  }
  if (time.minute === 45) {
    const wrongHour = face.hour === 1 ? 12 : face.hour - 1;
    const wrongTime = formatFaceDigital12({ hour: wrongHour, minute: 45 });
    const trapTowardWord = TOWARD_HOUR[face.hour] ?? String(face.hour);
    return `**${phrase}** is three quarters toward **${trapTowardWord}** — **${wrongTime}**, not **${target}**.`;
  }

  const wrongTime = formatFaceDigital12({ hour: face.hour, minute: 30 });
  const nextOrdinal = comingHour12(time.hour);
  return `**${phrase}** is halfway toward **${nextOrdinal}** — **${wrongTime}**, not **${target}**.`;
}

export function appointmentDistractorWhy(
  correct: ClockFaceTime,
  wrong: ClockFaceTime,
): string {
  const wrongPhrase = appointmentPhraseEmphasis(appointmentPhrase(wrong));
  return timeDistractorWhy(wrongPhrase, correct, wrong);
}

export function appointmentPrvejTrapWhy(correct: ClockFaceTime): string {
  const digital = formatFaceDigital12(correct);
  if (correct.minute === 0 && faceHour12(correct.hour) === 1) {
    return `**O jednej** is **1:00** — **O prvej** does not name this time.`;
  }
  return `**1:00** is **O jednej** — not **O prvej** (**${digital}**).`;
}

export function tellingDistractorWhy(
  correct: ClockFaceTime,
  wrong: ClockFaceTime,
): string {
  const wrongPhrase = tellingPhraseEmphasis(tellingTimeLabel(wrong));
  return timeDistractorWhy(wrongPhrase, correct, wrong);
}

export function clockFaceDistractorWhy(
  correct: ClockFaceTime,
  wrong: ClockFaceTime,
): string {
  const wrongDigital = formatFaceDigital12(wrong);
  const correctDigital = formatFaceDigital12(correct);
  const wrongMeaning = englishTimeMeaningPhrase(wrong).toLowerCase();
  const correctMeaning = englishTimeMeaningPhrase(correct).toLowerCase();
  const wrongFace = analogFace(wrong);
  const correctFace = analogFace(correct);

  if (wrong.minute === correct.minute && wrongFace.hour !== correctFace.hour) {
    if (correct.minute === 45 || correct.minute === 15) {
      const towardWord = towardWordForTime(correct);
      return `This face is ${wrongMeaning} (**${wrongDigital}**). You need ${correctMeaning} (**${correctDigital}**) — name **${towardWord}** after **na**, not the hour behind.`;
    }
    if (correct.minute === 30) {
      const polWord = polWordForTime(correct);
      return `This face is ${wrongMeaning} (**${wrongDigital}**). You need ${correctMeaning} (**${correctDigital}**) — **pol ${polWord}**, not the hour behind.`;
    }
  }

  return `This face is ${wrongMeaning} (**${wrongDigital}**) — you need ${correctMeaning} (**${correctDigital}**).`;
}

export function randomFaceHour12(rng: () => number = Math.random): number {
  return 1 + Math.floor(rng() * 12);
}

export function randomQuarterMinute(rng: () => number = Math.random): QuarterMinute {
  return QUARTERS[Math.floor(rng() * QUARTERS.length)] ?? 0;
}

/** Preferred telling-time label with Je/Sú (Je pol tretej.). */
export function tellingTimeLabel(time: ClockFaceTime): string {
  const preferred = preferredAnswerForTime(time);
  if (!preferred) return "";
  return preferred.endsWith(".") ? preferred : `${preferred}.`;
}

export interface SelectAllChoiceDraft {
  id: string;
  label: string;
  correct: boolean;
  whyWrong?: string;
}

/** Choice list label: no trailing period; capitalize for parallel options. */
export function formatSelectAllLabel(label: string): string {
  const trimmed = label.trim().replace(/\.$/, "");
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toLocaleUpperCase("sk-SK") + trimmed.slice(1);
}

export interface OddOneOutChoice {
  id: string;
  label: string;
  fits?: boolean;
  whyWrong?: string;
}

function oddOneOutPhraseEmphasis(label: string): string {
  if (label.startsWith("O "))
    return appointmentPhraseEmphasis(label.endsWith(".") ? label : `${label}.`);
  return tellingPhraseEmphasis(label.endsWith(".") ? label : `${label}.`);
}

/** Why a fitting line is the wrong pick on an odd-one-out item. */
export function oddOneOutFitWhy(label: string, meaningPhrase: string): string {
  return `**${oddOneOutPhraseEmphasis(label)}** means ${meaningPhrase}.`;
}

function preferredOddOneOutTrap(drafts: SelectAllChoiceDraft[]): SelectAllChoiceDraft {
  const wrongLexical = drafts.find(
    (draft) => draft.id === "wrong-lexical" && !draft.correct,
  );
  if (wrongLexical) return wrongLexical;
  const trap = drafts.find((draft) => !draft.correct);
  if (!trap) throw new Error("odd-one-out exercise needs a trap choice");
  return trap;
}

export function oddOneOutFromOptions(
  options: Array<{ id: string; label: string; fits?: boolean; whyWrong?: string }>,
  primaryTrapId: string,
  meaningPhrase: string,
): { choices: OddOneOutChoice[]; trapWhy: string } {
  const primaryTrap = options.find((option) => option.id === primaryTrapId);
  if (!primaryTrap) throw new Error("odd-one-out exercise needs a trap choice");

  const choices = options.map((option) => {
    const isFit = option.fits === true;
    return {
      id: option.id,
      label: option.label,
      fits: isFit,
      whyWrong: isFit ? oddOneOutFitWhy(option.label, meaningPhrase) : option.whyWrong,
    };
  });

  return { choices, trapWhy: primaryTrap.whyWrong ?? "" };
}

/** Turn select-all drafts into a single-trap odd-one-out choice list. */
export function oddOneOutChoicesFromDrafts(
  drafts: SelectAllChoiceDraft[],
  meaningPhrase: string,
): { choices: OddOneOutChoice[]; answerId: string; trapWhy: string } {
  const trap = preferredOddOneOutTrap(drafts);
  const included = drafts.filter((draft) => draft.correct || draft.id === trap.id);
  const { choices, trapWhy } = oddOneOutFromOptions(
    included.map((draft) => ({
      id: draft.id,
      label: draft.label,
      fits: draft.correct,
      whyWrong: draft.correct ? undefined : draft.whyWrong,
    })),
    trap.id,
    meaningPhrase,
  );

  return { choices, answerId: trap.id, trapWhy: trapWhy || trap.whyWrong || "" };
}

/** Build select-all options for Koľko je hodín? style telling-time. */
export function selectAllChoicesForTime(time: ClockFaceTime): SelectAllChoiceDraft[] {
  const face = analogFace(time);
  const choices: SelectAllChoiceDraft[] = [];

  const add = (id: string, label: string, correct: boolean, whyWrong?: string): void => {
    choices.push({ id, label: formatSelectAllLabel(label), correct, whyWrong });
  };

  add("telling-primary", preferredAnswerForTime(time), true);

  if (time.minute === 30) {
    const trap = `Je pol ${locativeOrdinal12(face.hour)}`;
    add("pol-wrong-hour", trap, false, selectAllTrapWhy(time, trap));
  } else if (time.minute === 15) {
    const trap = `Je štvrť na ${TOWARD_HOUR[face.hour] ?? String(face.hour)}`;
    add("quarter-wrong", trap, false, selectAllTrapWhy(time, trap));
  } else if (time.minute === 45) {
    const trap = `Je trištvrte na ${TOWARD_HOUR[face.hour] ?? String(face.hour)}`;
    add("triquarter-wrong", trap, false, selectAllTrapWhy(time, trap));
  } else {
    const nextOrdinal = face.hour === 12 ? 1 : face.hour + 1;
    const trap = `Je pol ${locativeOrdinal12(nextOrdinal)}`;
    add("half-wrong", trap, false, selectAllTrapWhy(time, trap));
  }

  if (time.minute !== 0) {
    const hourMinute = hourMinuteAnswers(
      face.hour,
      time.minute as Exclude<QuarterMinute, 0>,
    )[0];
    if (hourMinute) add("hour-minute", hourMinute, true);
    const digital = digitalAnswers(face.hour, time.minute)[0];
    if (digital) add("digital", digital, true);
  }

  return choices;
}

/** Two distinct wrong faces for appointment choice distractors. */
export function nearMissTimes(
  correct: ClockFaceTime,
  rng: () => number = Math.random,
): ClockFaceTime[] {
  const hour = ((Math.trunc(correct.hour) % 24) + 24) % 24;
  const candidates: ClockFaceTime[] = [];

  for (const minute of QUARTERS) {
    if (minute !== correct.minute) candidates.push({ hour, minute });
  }

  const face = analogFace(correct);
  const prevHour12 = face.hour === 1 ? 12 : face.hour - 1;
  const nextHour12 = face.hour === 12 ? 1 : face.hour + 1;
  candidates.push({ hour: prevHour12, minute: correct.minute });
  candidates.push({ hour: nextHour12, minute: correct.minute });

  const seen = new Set<string>();
  const key = (t: ClockFaceTime) => `${t.hour}:${t.minute}`;
  seen.add(key(correct));

  const pool: ClockFaceTime[] = [];
  for (const candidate of candidates) {
    const k = key(candidate);
    if (seen.has(k)) continue;
    seen.add(k);
    pool.push(candidate);
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = a;
  }

  return shuffled.slice(0, 2);
}

export function shuffleArray<T>(
  items: readonly T[],
  rng: () => number = Math.random,
): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const current = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = current;
  }
  return pool;
}

export function randomDrillTime(random: () => number = Math.random): ClockFaceTime {
  const useFormal = random() < 0.2;
  const hour = useFormal ? 13 + Math.floor(random() * 11) : 1 + Math.floor(random() * 12);
  const minute = QUARTERS[Math.floor(random() * QUARTERS.length)] ?? 0;
  return { hour, minute };
}

const DAY_PART_ENGLISH: Record<DayPart, string> = {
  ráno: "morning",
  dopoludnia: "late morning",
  doobeda: "late morning",
  napoludnie: "noon",
  naobed: "noon",
  popoludní: "afternoon",
  poobede: "afternoon",
  večer: "evening",
  "v noci": "night",
};

/** Feedback when the correct line includes a day-part tag. */
export function appointmentDayPartChoiceWhy(
  time: ClockFaceTime,
  dayPart: DayPart,
): string {
  const timeWhy = appointmentChoiceWhy(time);
  if (DAY_PART_ALIASES[dayPart] === "napoludnie") return timeWhy;
  const part = DAY_PART_ENGLISH[dayPart];
  return `${timeWhy} Add **${dayPart}** so it is clearly ${part}.`;
}

export function appointmentDayPartWrongWhy(
  correctPart: DayPart,
  wrongPart: DayPart,
): string {
  const correct = DAY_PART_ENGLISH[correctPart];
  const wrong = DAY_PART_ENGLISH[wrongPart];
  return `**${wrongPart}** marks ${wrong} — this prompt asks for **${correctPart}** (${correct}).`;
}

const EXACT_MINUTE_DIGITS: Record<number, string> = {
  1: "jedna",
  2: "dve",
  3: "tri",
  4: "štyri",
  5: "päť",
  6: "šesť",
  7: "sedem",
  8: "osem",
  9: "deväť",
  10: "desať",
  11: "jedenásť",
  12: "dvanásť",
  13: "trinásť",
  14: "štrnásť",
  15: "pätnásť",
  16: "šestnásť",
  17: "sedemnásť",
  18: "osemnásť",
  19: "devätnásť",
  20: "dvadsať",
  21: "dvadsaťjeden",
  22: "dvadsaťdva",
  23: "dvadsaťtri",
  24: "dvadsaťštyri",
  25: "dvadsaťpäť",
  26: "dvadsaťšesť",
  27: "dvadsaťsedem",
  28: "dvadsaťosem",
  29: "dvadsaťdeväť",
  30: "tridsať",
  40: "štyridsať",
  50: "päťdesiat",
};

function normalizeHour24(hour: number): number {
  return ((Math.trunc(hour) % 24) + 24) % 24;
}

export function isNoonTime(time: ClockFaceTime | ClockTimeOfDay): boolean {
  const hour = normalizeHour24(time.hour);
  return hour === 12 && time.minute === 0;
}

export function isMidnightTime(time: ClockFaceTime | ClockTimeOfDay): boolean {
  const hour = normalizeHour24(time.hour);
  return hour === 0 && time.minute === 0;
}

/** Default day-part for a 24h hour (rough clock-of-day bands). */
export function dayPartForHour24(hour24: number): DayPart {
  const hour = normalizeHour24(hour24);
  if (hour === 12) return "napoludnie";
  if (hour >= 5 && hour <= 9) return "ráno";
  if (hour >= 10 && hour <= 11) return "dopoludnia";
  if (hour >= 13 && hour <= 17) return "popoludní";
  if (hour >= 18 && hour <= 21) return "večer";
  return "v noci";
}

/** Appointment phrase with optional day-part tag (O štvrť na sedem ráno.). */
export function appointmentPhraseWithDayPart(
  time: ClockFaceTime,
  dayPart: DayPart,
): string {
  const base = appointmentPhrase(time);
  const canonical = DAY_PART_ALIASES[dayPart];
  if (canonical === "napoludnie" && isNoonTime(time)) return base;
  return `${base.replace(/\.$/, "")} ${dayPart}.`;
}

/** Approximate time — locative without O (Okolo tretej.). */
export function aroundPhrase(time: ClockFaceTime): string {
  const hour = normalizeHour24(time.hour);
  const minute = time.minute;

  if (minute === 0) {
    const twelve = faceHour12(hour);
    return `Okolo ${locativeOrdinal12(twelve)}.`;
  }

  const toward = comingHour12(hour);
  const towardWord = TOWARD_HOUR[toward] ?? String(toward);
  const polWord = locativeOrdinal12(toward);

  if (minute === 15) return `Okolo štvrte na ${towardWord}.`;
  if (minute === 30) return `Okolo pol ${polWord}.`;
  return `Okolo trištvrte na ${towardWord}.`;
}

/** Appointment alternates where both forms are attested (o prvej for 1:00 is a trap, not accepted). */
export function appointmentAlternates(time: ClockFaceTime): string[] {
  const primary = appointmentPhrase(time);
  const alts: string[] = [primary];

  if (isNoonTime(time)) {
    pushUnique(alts, "O poludní.");
    pushUnique(alts, "O dvanástej napoludnie.");
  }
  if (isMidnightTime(time)) {
    pushUnique(alts, "O polnoci.");
    pushUnique(alts, "O dvanástej v noci.");
  }

  return alts;
}

const PRVEJ_APPOINTMENT = "O prvej.";

/** Wrong appointment labels for single-correct choice drills — includes o-prvej trap when it is not the answer. */
export function appointmentChoiceDistractors(
  time: ClockFaceTime,
  misses: ClockFaceTime[],
): Array<{ id: string; label: string; whyWrong?: string }> {
  const correct = appointmentPhrase(time);
  const prvejTrap = {
    id: "trap-prvej",
    label: PRVEJ_APPOINTMENT,
    whyWrong: appointmentPrvejTrapWhy(time),
  };

  const fromMisses = misses
    .map((miss) => ({
      id: `miss-${miss.hour}-${miss.minute}`,
      label: appointmentPhrase(miss),
      whyWrong: appointmentDistractorWhy(time, miss),
    }))
    .filter((choice) => choice.label !== correct && choice.label !== prvejTrap.label);

  if (correct !== prvejTrap.label) {
    const second = fromMisses[0];
    return second ? [prvejTrap, second] : [prvejTrap];
  }

  return fromMisses.slice(0, 2);
}

export function noonMidnightTellingLabels(time: ClockFaceTime): string[] {
  if (isNoonTime(time)) return ["Je poludnie.", "Je dvanásť hodín."];
  if (isMidnightTime(time)) return ["Je polnoc.", "Je dvanásť hodín."];
  return [];
}

/** Preferred + day-part-tagged appointment forms (bare O dvanástej. is ambiguous — not listed). */
export function noonMidnightAppointmentPhrases(time: ClockFaceTime): string[] {
  if (isNoonTime(time)) return ["O poludní.", "O dvanástej napoludnie."];
  if (isMidnightTime(time)) return ["O polnoci.", "O dvanástej v noci."];
  return [];
}

/** Select-all drafts: lexical + tagged clock form correct; bare O dvanástej is the trap. */
export function noonMidnightSelectAllChoices(
  time: ClockFaceTime,
): SelectAllChoiceDraft[] {
  if (isNoonTime(time)) {
    return [
      { id: "lexical", label: formatSelectAllLabel("O poludní."), correct: true },
      {
        id: "tagged",
        label: formatSelectAllLabel("O dvanástej napoludnie."),
        correct: true,
      },
      {
        id: "bare-twelve",
        label: formatSelectAllLabel("O dvanástej."),
        correct: false,
        whyWrong: "Bare **O dvanástej** is ambiguous — noon or midnight.",
      },
      {
        id: "wrong-lexical",
        label: formatSelectAllLabel("O polnoci."),
        correct: false,
        whyWrong: "**O polnoci** means midnight, not noon.",
      },
    ];
  }
  if (isMidnightTime(time)) {
    return [
      { id: "lexical", label: formatSelectAllLabel("O polnoci."), correct: true },
      { id: "tagged", label: formatSelectAllLabel("O dvanástej v noci."), correct: true },
      {
        id: "bare-twelve",
        label: formatSelectAllLabel("O dvanástej."),
        correct: false,
        whyWrong: "Bare **O dvanástej** is ambiguous — noon or midnight.",
      },
      {
        id: "wrong-lexical",
        label: formatSelectAllLabel("O poludní."),
        correct: false,
        whyWrong: "**O poludní** means noon, not midnight.",
      },
    ];
  }
  return [];
}

function minuteCountPhrase(minute: number): string {
  if (minute === 1) return "jedna minúta";
  if (minute >= 2 && minute <= 4) {
    const card = minute === 2 ? "dve" : (CARDINAL[minute] ?? String(minute));
    return `${card} minúty`;
  }
  const card = EXACT_MINUTE_DIGITS[minute] ?? CARDINAL[minute] ?? String(minute);
  return `${card} minút`;
}

/** Accusative hour count after o (duration): hodinu / dve hodiny / päť hodín. */
export function durationHourPhrase(count: number): string {
  if (count === 1) return "hodinu";
  if (count >= 2 && count <= 4) {
    const card = count === 2 ? "dve" : (CARDINAL[count] ?? String(count));
    return `${card} hodiny`;
  }
  const card = CARDINAL[count] ?? String(count);
  return `${card} hodín`;
}

/** Accusative minute count after o (duration). */
export function durationMinutePhrase(count: number): string {
  if (count === 1) return "jednu minútu";
  if (count >= 2 && count <= 4) {
    const card = count === 2 ? "dve" : (CARDINAL[count] ?? String(count));
    return `${card} minúty`;
  }
  const card = EXACT_MINUTE_DIGITS[count] ?? CARDINAL[count] ?? String(count);
  return `${card} minút`;
}

/** O dve hodiny. — in two hours (duration from now). */
export function oDurationHoursPhrase(hourCount: number): string {
  return `O ${durationHourPhrase(hourCount)}.`;
}

/** O päť minút. — in five minutes (duration from now). */
export function oDurationMinutesPhrase(minuteCount: number): string {
  return `O ${durationMinutePhrase(minuteCount)}.`;
}

/** Rule-first feedback for a correct o + accusative duration choice. */
export function oDurationHoursWhy(hourCount: number): string {
  const bare = oDurationHoursPhrase(hourCount).replace(/\.$/, "");
  const english =
    hourCount === 1
      ? "in one hour"
      : hourCount === 2
        ? "in two hours"
        : `in ${hourCount} hours`;
  return `**${bare}** means *${english}* — **o** + accusative counts a **duration** forward from now, not a clock position.`;
}

export function oDurationMinutesWhy(minuteCount: number): string {
  const bare = oDurationMinutesPhrase(minuteCount).replace(/\.$/, "");
  const english =
    minuteCount === 1
      ? "in one minute"
      : minuteCount === 2
        ? "in two minutes"
        : `in ${minuteCount} minutes`;
  return `**${bare}** means *${english}* — **o** + accusative counts a **duration** forward from now, not a clock position.`;
}

export function oDurationAppointmentTrapWhy(
  durationPhrase: string,
  trapPhrase: string,
): string {
  const duration = durationPhrase.replace(/\.$/, "");
  const trap = trapPhrase.replace(/\.$/, "");
  return `**${trap}** is **o** + locative — a clock appointment time, not a duration like **${duration}**.`;
}

/** Je tri hodiny a desať minút. */
export function exactMinuteTellingLabel(time: ClockTimeOfDay): string {
  const hour = normalizeHour24(time.hour);
  const twelve = faceHour12(hour);
  const shape = hodinaPhrase(twelve);
  const minutePhrase = minuteCountPhrase(time.minute);
  return `${shape.verb} ${shape.nounPhrase} a ${minutePhrase}.`;
}

/** Bare digital reading for exact minutes (tri desať.). */
export function exactMinuteDigitalLabel(time: ClockTimeOfDay): string {
  const twelve = faceHour12(time.hour);
  const hourWord = digitalHourWord(twelve);
  if (time.minute === 0) return `${hourWord}.`;
  const minuteWord = EXACT_MINUTE_DIGITS[time.minute] ?? String(time.minute);
  return `${hourWord} ${minuteWord}.`;
}

export function exactMinuteAnswers(time: ClockTimeOfDay): string[] {
  const answers: string[] = [];
  pushUnique(answers, exactMinuteTellingLabel(time).replace(/\.$/, ""));
  pushUnique(answers, exactMinuteDigitalLabel(time).replace(/\.$/, ""));

  const hour = normalizeHour24(time.hour);
  if (hour >= 13 && hour <= 23) {
    const formal = hodinaPhrase(hour);
    const minutePhrase = minuteCountPhrase(time.minute);
    pushUnique(answers, `${formal.verb} ${formal.nounPhrase} a ${minutePhrase}`);
  }

  return answers;
}

/** Parse 24h digital time (14:30) into hour/minute. */
export function parseDigital24(digital: string): ClockTimeOfDay | null {
  const match = digital.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/** Map 24h quarter time to 12h appointment phrase (14:30 → O pol tretej.). */
export function appointmentFrom24h(time: ClockTimeOfDay): string | null {
  if (![0, 15, 30, 45].includes(time.minute)) return null;
  return appointmentPhrase({
    hour: time.hour,
    minute: time.minute as QuarterMinute,
  });
}

/** Za päť minút desať. — minutes until the named hour. */
export function zaCountdownPhrase(minutesBefore: number, targetHour12: number): string {
  const minutePhrase = minuteCountPhrase(minutesBefore);
  const hourWord = TOWARD_HOUR[targetHour12] ?? String(targetHour12);
  return `Za ${minutePhrase} ${hourWord}.`;
}

/** Clock face for a za … countdown (e.g. 9:55 for five minutes to ten). */
export function zaCountdownClockFace(
  minutesBefore: number,
  targetHour12: number,
): { hour: number; minute: number } {
  const totalMinutes = targetHour12 * 60 - minutesBefore;
  const hour24 = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  return { hour: faceHour12(Math.floor(hour24 / 60)), minute: hour24 % 60 };
}

export function random24hQuarterTime(rng: () => number = Math.random): ClockFaceTime {
  const hour = 13 + Math.floor(rng() * 11);
  const minute = QUARTERS[Math.floor(rng() * QUARTERS.length)] ?? 0;
  return { hour, minute };
}

export function randomExactMinuteTime(rng: () => number = Math.random): ClockTimeOfDay {
  const hour = 1 + Math.floor(rng() * 12);
  const index = Math.floor(rng() * EXACT_MINUTE_POOL.length);
  const minute = EXACT_MINUTE_POOL[index] ?? 10;
  return { hour, minute };
}

export function randomNoonOrMidnight(rng: () => number = Math.random): ClockFaceTime {
  return rng() < 0.5 ? { hour: 12, minute: 0 } : { hour: 0, minute: 0 };
}

/** Morning vs evening pair for day-part drills (same face, different tag). */
export function dayPartDisambiguationPair(): {
  morning: ClockFaceTime;
  evening: ClockFaceTime;
  dayPartMorning: DayPart;
  dayPartEvening: DayPart;
} {
  return {
    morning: { hour: 6, minute: 15 },
    evening: { hour: 18, minute: 15 },
    dayPartMorning: dayPartForHour24(6),
    dayPartEvening: dayPartForHour24(18),
  };
}
