export type DaysDatesTimeKind =
  | "everyday/day-meeting"
  | "everyday/meeting-time"
  | "everyday/half-past-time"
  | "everyday/quarter-time"
  | "everyday/clock-half-past-match"
  | "everyday/clock-quarter-past-match"
  | "everyday/clock-quarter-to-match"
  | "everyday/clock-quarter-past-ask"
  | "everyday/time-register"
  | "everyday/time-variants"
  | "everyday/day-part-time"
  | "everyday/noon-midnight"
  | "everyday/okolo-vs-exact"
  | "everyday/o-duration"
  | "everyday/timetable-24h"
  | "everyday/exact-minute"
  | "everyday/za-countdown"
  | "everyday/frame-time-choice"
  | "everyday/frame-time-build"
  | "everyday/frame-time-typed"
  | "everyday/frame-negotiate";

export const FRAMED_KINDS: DaysDatesTimeKind[] = [
  "everyday/frame-time-choice",
  "everyday/frame-time-build",
  "everyday/frame-time-typed",
  "everyday/frame-negotiate",
];

export const CORE_QUARTER_KINDS: DaysDatesTimeKind[] = [
  "everyday/meeting-time",
  "everyday/half-past-time",
  "everyday/quarter-time",
];

export const CLOCK_MATCH_KINDS: DaysDatesTimeKind[] = [
  "everyday/clock-half-past-match",
  "everyday/clock-quarter-past-match",
  "everyday/clock-quarter-to-match",
];

export const PHASE2_KINDS: DaysDatesTimeKind[] = [
  "everyday/day-part-time",
  "everyday/noon-midnight",
  "everyday/okolo-vs-exact",
  "everyday/o-duration",
];

export const PHASE3_KINDS: DaysDatesTimeKind[] = [
  "everyday/timetable-24h",
  "everyday/exact-minute",
  "everyday/za-countdown",
];
