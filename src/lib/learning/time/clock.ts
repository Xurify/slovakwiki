/** Slovak clock-time answer variants for learner drills (:00 / :15 / :30 / :45). */

export type QuarterMinute = 0 | 15 | 30 | 45;

export interface ClockFaceTime {
  /** 0–23 hour of day */
  hour: number;
  minute: QuarterMinute;
}

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
  const twelve = faceHour12(hour24);
  const twelveShape = hodinaPhrase(twelve);
  withOptionalJe(answers, twelveShape.nounPhrase, twelveShape.verb);

  if (hour24 === 0) {
    withOptionalJe(answers, "polnoc", "Je");
  }
  if (hour24 === 12) {
    withOptionalJe(answers, "poludnie", "Je");
  }
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

/** Why a select-all trap label does not match the prompt time. */
export function selectAllTrapWhy(time: ClockFaceTime, trapLabel: string): string {
  const face = analogFace(time);
  const target = formatFaceDigital12(time);
  const phrase = tellingPhraseEmphasis(trapLabel);

  if (time.minute === 30) {
    const wrongHour = face.hour === 1 ? 12 : face.hour - 1;
    const wrongTime = formatFaceDigital12({ hour: wrongHour, minute: 30 });
    return `**${phrase}** counts toward **${face.hour}** — that's **${wrongTime}**, not **${target}**.`;
  }
  if (time.minute === 15) {
    const wrongHour = face.hour === 1 ? 12 : face.hour - 1;
    const wrongTime = formatFaceDigital12({ hour: wrongHour, minute: 15 });
    const towardWord = TOWARD_HOUR[face.hour] ?? String(face.hour);
    return `**${phrase}** is one quarter toward **${towardWord}** — **${wrongTime}**, not **${target}**.`;
  }
  if (time.minute === 45) {
    const wrongHour = face.hour === 1 ? 12 : face.hour - 1;
    const wrongTime = formatFaceDigital12({ hour: wrongHour, minute: 45 });
    const towardWord = TOWARD_HOUR[face.hour] ?? String(face.hour);
    return `**${phrase}** is three quarters toward **${towardWord}** — **${wrongTime}**, not **${target}**.`;
  }

  const nextOrdinal = face.hour === 12 ? 1 : face.hour + 1;
  const wrongTime = formatFaceDigital12({ hour: face.hour, minute: 30 });
  return `**${phrase}** is halfway toward **${nextOrdinal}** — **${wrongTime}**, not **${target}**.`;
}

export function appointmentDistractorWhy(
  correct: ClockFaceTime,
  wrong: ClockFaceTime,
): string {
  const wrongPhrase = appointmentPhraseEmphasis(appointmentPhrase(wrong));
  return `**${wrongPhrase}** is **${formatFaceDigital12(wrong)}** — this prompt is **${formatFaceDigital12(correct)}**.`;
}

export function appointmentPrvejTrapWhy(correct: ClockFaceTime): string {
  return `**O prvej** is also heard for **1:00** — not **${formatFaceDigital12(correct)}**.`;
}

export function tellingDistractorWhy(
  correct: ClockFaceTime,
  wrong: ClockFaceTime,
): string {
  const wrongPhrase = tellingPhraseEmphasis(tellingTimeLabel(wrong));
  return `**${wrongPhrase}** matches **${formatFaceDigital12(wrong)}**, not **${formatFaceDigital12(correct)}**.`;
}

export function clockFaceDistractorWhy(
  correct: ClockFaceTime,
  wrong: ClockFaceTime,
): string {
  return `This face shows **${formatFaceDigital12(wrong)}** — you need **${formatFaceDigital12(correct)}**.`;
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

/** Build select-all options for Koľko je hodín? style telling-time. */
export function selectAllChoicesForTime(time: ClockFaceTime): SelectAllChoiceDraft[] {
  const face = analogFace(time);
  const hour = ((Math.trunc(time.hour) % 24) + 24) % 24;
  const choices: SelectAllChoiceDraft[] = [];

  const add = (id: string, label: string, correct: boolean, whyWrong?: string): void => {
    choices.push({ id, label, correct, whyWrong });
  };

  add("telling-primary", tellingTimeLabel(time), true);

  if (time.minute === 30) {
    const trap = `Je pol ${locativeOrdinal12(face.hour)}.`;
    add("pol-wrong-hour", trap, false, selectAllTrapWhy(time, trap));
  } else if (time.minute === 15) {
    const trap = `Je štvrť na ${TOWARD_HOUR[face.hour] ?? String(face.hour)}.`;
    add("quarter-wrong", trap, false, selectAllTrapWhy(time, trap));
  } else if (time.minute === 45) {
    const trap = `Je trištvrte na ${TOWARD_HOUR[face.hour] ?? String(face.hour)}.`;
    add("triquarter-wrong", trap, false, selectAllTrapWhy(time, trap));
  } else {
    const nextOrdinal = face.hour === 12 ? 1 : face.hour + 1;
    const trap = `Je pol ${locativeOrdinal12(nextOrdinal)}.`;
    add("half-wrong", trap, false, selectAllTrapWhy(time, trap));
  }

  if (time.minute !== 0) {
    const hourMinute = hourMinuteAnswers(
      face.hour,
      time.minute as Exclude<QuarterMinute, 0>,
    )[0];
    if (hourMinute) add("hour-minute", `${hourMinute}.`, true);
    const digital = digitalAnswers(face.hour, time.minute)[0];
    if (digital) add("digital", `${digital}.`, true);
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

/** Any minute on the clock (0–23h, 0–59m). */
export interface ClockTimeOfDay {
  hour: number;
  minute: number;
}

export type DayPart =
  "ráno" | "dopoludnia" | "napoludnie" | "popoludní" | "večer" | "v noci";

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

export const EXACT_MINUTE_POOL = [5, 10, 20, 26] as const;

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
  if (dayPart === "napoludnie") return base;
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

/** Appointment alternates where both forms are attested (o prvej for 1:00). */
export function appointmentAlternates(time: ClockFaceTime): string[] {
  const hour = normalizeHour24(time.hour);
  const primary = appointmentPhrase(time);
  const alts: string[] = [primary];

  if (time.minute === 0 && faceHour12(hour) === 1) {
    pushUnique(alts, "O prvej.");
  }
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

/** Select-all drafts: lexical + tagged clock form correct; bare O dvanástej. is the trap. */
export function noonMidnightSelectAllChoices(
  time: ClockFaceTime,
): SelectAllChoiceDraft[] {
  if (isNoonTime(time)) {
    return [
      { id: "lexical", label: "O poludní.", correct: true },
      { id: "tagged", label: "O dvanástej napoludnie.", correct: true },
      {
        id: "bare-twelve",
        label: "O dvanástej.",
        correct: false,
        whyWrong: "Bare **O dvanástej** is ambiguous — noon or midnight.",
      },
      {
        id: "wrong-lexical",
        label: "O polnoci.",
        correct: false,
        whyWrong: "**O polnoci** means midnight, not noon.",
      },
    ];
  }
  if (isMidnightTime(time)) {
    return [
      { id: "lexical", label: "O polnoci.", correct: true },
      { id: "tagged", label: "O dvanástej v noci.", correct: true },
      {
        id: "bare-twelve",
        label: "O dvanástej.",
        correct: false,
        whyWrong: "Bare **O dvanástej** is ambiguous — noon or midnight.",
      },
      {
        id: "wrong-lexical",
        label: "O poludní.",
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
