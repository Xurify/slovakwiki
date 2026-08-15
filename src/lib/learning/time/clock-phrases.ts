import type {
  ClockFaceTime,
  ClockTimeOfDay,
  DayPart,
  QuarterMinute,
} from "./clock-types";
import { DAY_PART_ALIASES } from "./clock-types";

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
export const TOWARD_HOUR: Record<number, string> = {
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

export function comingHour12(hour24: number): number {
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

export function hourMinuteAnswers(
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

export function digitalAnswers(hourCount: number, minute: QuarterMinute): string[] {
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

export function locativeOrdinal12(hour12: number): string {
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

/** Preferred telling-time label with Je/Sú (Je pol tretej.). */
export function tellingTimeLabel(time: ClockFaceTime): string {
  const preferred = preferredAnswerForTime(time);
  if (!preferred) return "";
  return preferred.endsWith(".") ? preferred : `${preferred}.`;
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
