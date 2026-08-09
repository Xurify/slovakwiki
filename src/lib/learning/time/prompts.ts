import type { ClockFaceTime, ClockTimeOfDay } from "./clock";
import {
  analogFace,
  englishTimeGloss,
  faceHour12,
  formatDigital,
  exactMinuteDigitalLabel,
} from "./clock";

/** Direct English target line for appointment-time choices (matches lesson prompts). */
export function enAppointmentPrompt(time: ClockFaceTime): string {
  return englishTimeGloss(time);
}

export const SELECT_ALL_PROMPT = "Mark every correct way to say this time.";

export function enAroundPrompt(time: ClockFaceTime): string {
  const face = analogFace(time);
  if (time.minute === 30) {
    return `Around half past ${face.hour}.`;
  }
  if (time.minute === 45) {
    const toward = face.hour === 12 ? 1 : face.hour + 1;
    return `Around quarter to ${toward}.`;
  }
  if (time.minute === 15) {
    return `Around quarter past ${face.hour}.`;
  }
  return `Around ${face.hour} o'clock.`;
}

export function enExactAroundPrompt(time: ClockFaceTime): string {
  return englishTimeGloss(time);
}

export function enDayPartMorningPrompt(time: ClockFaceTime): string {
  const gloss = englishTimeGloss(time).replace(/\.$/, "");
  return `${gloss} in the morning.`;
}

export function enDayPartEveningPrompt(time: ClockFaceTime): string {
  const gloss = englishTimeGloss(time).replace(/\.$/, "");
  return `${gloss} in the evening.`;
}

export function enNoonPrompt(): string {
  return "At noon.";
}

export function enMidnightPrompt(): string {
  return "At midnight.";
}

export function enTimetablePrompt(time: ClockTimeOfDay): string {
  return formatDigital(time);
}

const MINUTE_EN: Record<number, string> = {
  5: "five",
  10: "ten",
  20: "twenty",
  26: "twenty-six",
};

export function enExactMinutePrompt(time: ClockTimeOfDay): string {
  const h = faceHour12(time.hour);
  const minuteWord = MINUTE_EN[time.minute] ?? String(time.minute);
  return `At ${minuteWord} past ${h}.`;
}

export function enExactMinuteDigitalPrompt(time: ClockTimeOfDay): string {
  const label = exactMinuteDigitalLabel(time).replace(/\.$/, "");
  return `Which line means “${label}”?`;
}

export function enZaCountdownPrompt(targetHour12: number): string {
  const hourEn =
    targetHour12 === 10 ? "ten" : targetHour12 === 12 ? "twelve" : String(targetHour12);
  return `Five minutes to ${hourEn}.`;
}
