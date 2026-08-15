import type {
  ClockFaceTime,
  ClockTimeOfDay,
  DayPart,
  QuarterMinute,
} from "./clock-types";
import { DAY_PART_ALIASES } from "./clock-types";
import {
  analogFace,
  appointmentPhrase,
  aroundPhrase,
  comingHour12,
  englishTimeMeaningPhrase,
  exactMinuteTellingLabel,
  faceHour12,
  formatFaceDigital12,
  locativeOrdinal12,
  oDurationHoursPhrase,
  oDurationMinutesPhrase,
  tellingTimeLabel,
  TOWARD_HOUR,
} from "./clock-phrases";

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
