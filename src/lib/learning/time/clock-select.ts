import type { ClockFaceTime, QuarterMinute } from "./clock-types";
import { QUARTERS } from "./clock-types";
import {
  analogFace,
  appointmentPhrase,
  digitalAnswers,
  hourMinuteAnswers,
  isMidnightTime,
  isNoonTime,
  locativeOrdinal12,
  preferredAnswerForTime,
  TOWARD_HOUR,
} from "./clock-phrases";
import {
  appointmentDistractorWhy,
  appointmentPrvejTrapWhy,
  selectAllTrapWhy,
} from "./clock-feedback";

function tellingPhraseEmphasis(label: string): string {
  return label.replace(/^Je /, "").replace(/\.$/, "");
}

function appointmentPhraseEmphasis(phrase: string): string {
  return phrase.replace(/\.$/, "");
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
