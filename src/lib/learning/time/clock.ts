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

export function formatDigital(time: ClockFaceTime): string {
  const hour = ((Math.trunc(time.hour) % 24) + 24) % 24;
  return `${String(hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

/** Screen-reader label for a 12-hour analog face. */
export function formatClockFaceLabel(clock: { hour: number; minute: number }): string {
  return `${clock.hour}:${String(clock.minute).padStart(2, "0")}`;
}

const QUARTERS: QuarterMinute[] = [0, 15, 30, 45];

export function randomDrillTime(random: () => number = Math.random): ClockFaceTime {
  const useFormal = random() < 0.2;
  const hour = useFormal ? 13 + Math.floor(random() * 11) : 1 + Math.floor(random() * 12);
  const minute = QUARTERS[Math.floor(random() * QUARTERS.length)] ?? 0;
  return { hour, minute };
}
