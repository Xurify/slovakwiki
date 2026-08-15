import type { PracticeItem } from "$lib/learning/types";
import { shuffleArray } from "./clock";
import { buildClockMatchExercise, buildTellingAskExercise } from "./session-clock";
import {
  CLOCK_MATCH_KINDS,
  CORE_QUARTER_KINDS,
  FRAMED_KINDS,
  PHASE2_KINDS,
  PHASE3_KINDS,
  type DaysDatesTimeKind,
} from "./session-kinds";
import {
  buildDayPartExercise,
  buildNoonMidnightExercise,
  buildOkoloVsExactExercise,
  buildODurationExercise,
} from "./session-phase2";
import {
  buildExactMinuteExercise,
  buildTimetableExercise,
  buildZaCountdownExercise,
} from "./session-phase3";
import {
  buildRegisterContrastExercise,
  buildTimeVariantsOddOneOutExercise,
} from "./session-register";
import {
  buildFrameNegotiateExercise,
  buildFrameTimeBuildExercise,
  buildFrameTimeChoiceExercise,
  buildFrameTimeTypedExercise,
} from "./session-schedule";
import { dayMeetingItem, wrapTask } from "./session-shared";

export type { DaysDatesTimeKind } from "./session-kinds";

export function materializeDaysDatesTimeItem(
  kind: DaysDatesTimeKind,
  rng: () => number = Math.random,
): PracticeItem {
  if (kind === "everyday/day-meeting") return dayMeetingItem(rng);

  if (kind === "everyday/meeting-time") {
    return wrapTask(kind, buildClockMatchExercise(kind, 0, rng));
  }
  if (kind === "everyday/half-past-time") {
    return wrapTask(kind, buildClockMatchExercise(kind, 30, rng));
  }
  if (kind === "everyday/quarter-time") {
    const minute = rng() < 0.5 ? 15 : 45;
    return wrapTask(kind, buildClockMatchExercise(kind, minute, rng));
  }
  if (kind === "everyday/clock-half-past-match") {
    return wrapTask(kind, buildClockMatchExercise(kind, 30, rng));
  }
  if (kind === "everyday/clock-quarter-past-match") {
    return wrapTask(kind, buildClockMatchExercise(kind, 15, rng));
  }
  if (kind === "everyday/clock-quarter-to-match") {
    return wrapTask(kind, buildClockMatchExercise(kind, 45, rng));
  }
  if (kind === "everyday/clock-quarter-past-ask") {
    return wrapTask(kind, buildTellingAskExercise(kind, rng));
  }
  if (kind === "everyday/time-register") {
    return wrapTask(kind, buildRegisterContrastExercise(kind, rng));
  }
  if (kind === "everyday/time-variants") {
    return wrapTask(kind, buildTimeVariantsOddOneOutExercise(kind, rng));
  }
  if (kind === "everyday/day-part-time") {
    return wrapTask(kind, buildDayPartExercise(kind, rng));
  }
  if (kind === "everyday/noon-midnight") {
    return wrapTask(kind, buildNoonMidnightExercise(kind, rng));
  }
  if (kind === "everyday/okolo-vs-exact") {
    return wrapTask(kind, buildOkoloVsExactExercise(kind, rng));
  }
  if (kind === "everyday/o-duration") {
    return wrapTask(kind, buildODurationExercise(kind, rng));
  }
  if (kind === "everyday/timetable-24h") {
    return wrapTask(kind, buildTimetableExercise(kind, rng));
  }
  if (kind === "everyday/exact-minute") {
    return wrapTask(kind, buildExactMinuteExercise(kind, rng));
  }
  if (kind === "everyday/za-countdown") {
    return wrapTask(kind, buildZaCountdownExercise(kind, rng));
  }
  if (kind === "everyday/frame-time-choice") {
    return wrapTask(kind, buildFrameTimeChoiceExercise(kind, rng));
  }
  if (kind === "everyday/frame-time-build") {
    return wrapTask(kind, buildFrameTimeBuildExercise(kind, rng));
  }
  if (kind === "everyday/frame-time-typed") {
    return wrapTask(kind, buildFrameTimeTypedExercise(kind, rng));
  }
  if (kind === "everyday/frame-negotiate") {
    return wrapTask(kind, buildFrameNegotiateExercise(kind, rng));
  }

  throw new Error(`Unknown days-dates-time kind: ${kind}`);
}

export function buildDaysDatesTimeSession(
  rng: () => number = Math.random,
): PracticeItem[] {
  const items: PracticeItem[] = [
    materializeDaysDatesTimeItem("everyday/day-meeting", rng),
  ];

  const framedCount = rng() < 0.5 ? 2 : 3;
  const framedPicks = shuffleArray(FRAMED_KINDS, rng).slice(0, framedCount);
  for (const kind of framedPicks) {
    items.push(materializeDaysDatesTimeItem(kind, rng));
  }

  for (const kind of CORE_QUARTER_KINDS) {
    items.push(materializeDaysDatesTimeItem(kind, rng));
  }

  items.push(materializeDaysDatesTimeItem("everyday/clock-quarter-past-ask", rng));
  items.push(materializeDaysDatesTimeItem("everyday/time-register", rng));
  items.push(materializeDaysDatesTimeItem("everyday/time-variants", rng));

  const phase2 = shuffleArray(PHASE2_KINDS, rng);
  items.push(materializeDaysDatesTimeItem(phase2[0]!, rng));
  if (rng() < 0.55) {
    items.push(materializeDaysDatesTimeItem(phase2[1]!, rng));
  }

  const phase3Pick = shuffleArray(
    ["everyday/timetable-24h", "everyday/exact-minute"] as DaysDatesTimeKind[],
    rng,
  )[0]!;
  items.push(materializeDaysDatesTimeItem(phase3Pick, rng));

  if (rng() < 0.4) {
    items.push(materializeDaysDatesTimeItem("everyday/za-countdown", rng));
  }

  return shuffleArray(items, rng);
}

const ALL_KINDS: DaysDatesTimeKind[] = [
  "everyday/day-meeting",
  ...FRAMED_KINDS,
  ...CORE_QUARTER_KINDS,
  ...CLOCK_MATCH_KINDS,
  "everyday/clock-quarter-past-ask",
  "everyday/time-register",
  "everyday/time-variants",
  ...PHASE2_KINDS,
  ...PHASE3_KINDS,
];

export function isDaysDatesTimeKind(id: string): id is DaysDatesTimeKind {
  return (ALL_KINDS as string[]).includes(id);
}
