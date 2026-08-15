/** Slovak clock-time answer variants for learner drills (:00 / :15 / :30 / :45). */

export type {
  ClockFaceTime,
  ClockTimeOfDay,
  DayPart,
  QuarterMinute,
} from "./clock-types";
export { DAY_PART_ALIASES, EXACT_MINUTE_POOL, QUARTERS } from "./clock-types";

export {
  analogFace,
  answersForTime,
  appointmentAlternates,
  appointmentAnswersForTime,
  appointmentFrom24h,
  appointmentPhrase,
  appointmentPhraseWithDayPart,
  aroundPhrase,
  dayPartForHour24,
  durationHourPhrase,
  durationMinutePhrase,
  englishTimeGloss,
  englishTimeMeaningPhrase,
  exactMinuteAnswers,
  exactMinuteDigitalLabel,
  exactMinuteTellingLabel,
  faceHour12,
  formatClockFaceLabel,
  formatDigital,
  formatFaceDigital12,
  isMidnightTime,
  isNoonTime,
  noonMidnightAppointmentPhrases,
  noonMidnightTellingLabels,
  oDurationHoursPhrase,
  oDurationMinutesPhrase,
  parseDigital24,
  preferredAnswerForTime,
  preferredAppointmentAnswerForTime,
  tellingTimeLabel,
  zaCountdownClockFace,
  zaCountdownPhrase,
} from "./clock-phrases";

export {
  appointmentChoiceWhy,
  appointmentDayPartChoiceWhy,
  appointmentDayPartWrongWhy,
  appointmentDistractorWhy,
  appointmentPrvejTrapWhy,
  clockFaceDistractorWhy,
  exactMinuteChoiceWhy,
  exactMinuteWrongWhy,
  oDurationAppointmentTrapWhy,
  oDurationHoursWhy,
  oDurationMinutesWhy,
  okoloChoiceWhy,
  okoloExactTrapWhy,
  selectAllTrapWhy,
  tellingChoiceWhy,
  tellingDistractorWhy,
} from "./clock-feedback";

export type { OddOneOutChoice, SelectAllChoiceDraft } from "./clock-select";
export {
  appointmentChoiceDistractors,
  formatSelectAllLabel,
  nearMissTimes,
  noonMidnightSelectAllChoices,
  oddOneOutChoicesFromDrafts,
  oddOneOutFitWhy,
  oddOneOutFromOptions,
  selectAllChoicesForTime,
} from "./clock-select";

export {
  dayPartDisambiguationPair,
  random24hQuarterTime,
  randomDrillTime,
  randomExactMinuteTime,
  randomFaceHour12,
  randomNoonOrMidnight,
  randomQuarterMinute,
  shuffleArray,
} from "./clock-rng";
