import type { ClockFaceTime, ClockTimeOfDay } from "./clock";
import {
  analogFace,
  englishTimeMeaningPhrase,
  faceHour12,
  exactMinuteDigitalLabel,
} from "./clock";

/** Clock-match: pick the face for a quoted Slovak time phrase. */
export function skWhichClockShows(barePhrase: string): string {
  return `Ktoré hodiny ukazujú „${barePhrase}“?`;
}

/** Phrase choice: pick the Slovak line for a quoted English meaning. */
export function skWhichPhraseMeans(meaning: string): string {
  return `Ktorý výraz znamená „${meaning}“?`;
}

export function enOddOneOutPrompt(meaningPhrase: string): string {
  return `Which phrase does not mean ${meaningPhrase}?`;
}

/** Strip leading At/Around from a gloss for odd-one-out headers. */
export function enPromptMeaningPhrase(prompt: string): string {
  return prompt
    .replace(/^At /, "")
    .replace(/^Around /, "")
    .replace(/\.$/, "");
}

export function enExactMinuteMeaningPhrase(time: ClockTimeOfDay): string {
  return enPromptMeaningPhrase(enExactMinuteSpoken(time));
}

export function enZaCountdownMeaningPhrase(targetHour12: number): string {
  return enPromptMeaningPhrase(enZaCountdownPrompt(targetHour12));
}

function enAroundMeaning(time: ClockFaceTime): string {
  const face = analogFace(time);
  if (time.minute === 30) {
    return `around half past ${face.hour}`;
  }
  if (time.minute === 45) {
    const toward = face.hour === 12 ? 1 : face.hour + 1;
    return `around quarter to ${toward}`;
  }
  if (time.minute === 15) {
    return `around quarter past ${face.hour}`;
  }
  return `around ${face.hour} o'clock`;
}

export function enAroundPrompt(time: ClockFaceTime): string {
  return skWhichPhraseMeans(enAroundMeaning(time));
}

export function enExactAroundPrompt(time: ClockFaceTime): string {
  return skWhichPhraseMeans(englishTimeMeaningPhrase(time));
}

export function enDayPartMorningPrompt(time: ClockFaceTime): string {
  return skWhichPhraseMeans(`${englishTimeMeaningPhrase(time)} in the morning`);
}

export function enDayPartEveningPrompt(time: ClockFaceTime): string {
  return skWhichPhraseMeans(`${englishTimeMeaningPhrase(time)} in the evening`);
}

const MINUTE_EN: Record<number, string> = {
  5: "five",
  10: "ten",
  20: "twenty",
  26: "twenty-six",
};

/** Spoken English target without question wrapper (for meaning helpers). */
export function enExactMinuteSpoken(time: ClockTimeOfDay): string {
  const h = faceHour12(time.hour);
  const minuteWord = MINUTE_EN[time.minute] ?? String(time.minute);
  return `At ${minuteWord} past ${h}.`;
}

/** Kept for digital exact-minute copy helpers / tests. */
export function enExactMinuteDigitalPrompt(time: ClockTimeOfDay): string {
  const label = exactMinuteDigitalLabel(time).replace(/\.$/, "");
  return skWhichPhraseMeans(label);
}

export function enZaCountdownPrompt(targetHour12: number): string {
  const hourEn =
    targetHour12 === 10 ? "ten" : targetHour12 === 12 ? "twelve" : String(targetHour12);
  return `Five minutes to ${hourEn}.`;
}
