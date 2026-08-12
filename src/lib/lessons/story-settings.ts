/** Atmosphere for the immersive lesson story stage. */

export type LessonSceneArtId =
  | "cafe"
  | "classroom"
  | "counter"
  | "home"
  | "market"
  | "plaza"
  | "registration"
  | "default";

export interface LessonStorySetting {
  art: LessonSceneArtId;
  /** Short place line under the beat title. */
  place: string;
  /** Optional Slovak flavor for the setting chip. */
  placeSk?: string;
}

const byLessonId: Record<string, LessonStorySetting> = {
  "everyday/meet-someone": {
    art: "plaza",
    place: "A quiet square in Bratislava",
    placeSk: "Na námestí",
  },
  "everyday/numbers-and-personal-details": {
    art: "registration",
    place: "At the registration desk",
    placeSk: "Na registrácii",
  },
  "everyday/days-dates-and-time": {
    art: "cafe",
    place: "Ordering at a café",
    placeSk: "V kaviarni",
  },
  "everyday/negation-in-conversation": {
    art: "home",
    place: "Catching up at home",
    placeSk: "Doma",
  },
  "grammar/present-tense-i": {
    art: "plaza",
    place: "Talking about today",
    placeSk: "Dnes",
  },
  "grammar/byt-present": {
    art: "home",
    place: "Where things are",
    placeSk: "Kde to je",
  },
  "grammar/mat-present": {
    art: "market",
    place: "What you have",
    placeSk: "Čo máš",
  },
  "pronunciation/first-syllable-stress": {
    art: "classroom",
    place: "Hearing the beat of Slovak",
    placeSk: "Prízvuk",
  },
};

const defaultSetting: LessonStorySetting = {
  art: "default",
  place: "In conversation",
  placeSk: "Rozhovor",
};

export function storySettingForLesson(lessonId: string): LessonStorySetting {
  return byLessonId[lessonId] ?? defaultSetting;
}
