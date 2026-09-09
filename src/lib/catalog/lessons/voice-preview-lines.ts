import type { LessonCharacterId } from "./character-ids";

export type VoicePreviewLine = {
  sampleEnglish: string;
  sampleSlovak: string;
};

/** Gallery sample lines — also collected by `scripts/audio` as lesson clips. */
export const VOICE_PREVIEW_LINES: Record<LessonCharacterId, VoicePreviewLine> = {
  alex: {
    sampleSlovak: "Dobrý deň. Volám sa Alex.",
    sampleEnglish: "Good day. My name is Alex.",
  },
  anna: {
    sampleSlovak: "Dobrý deň. Volám sa Anna.",
    sampleEnglish: "Good day. My name is Anna.",
  },
  guide: {
    sampleSlovak: "Dobrý deň.",
    sampleEnglish: "Good day.",
  },
  lucia: {
    sampleSlovak: "Dobrý deň. Ako vám môžem pomôcť?",
    sampleEnglish: "Good day. How can I help you?",
  },
  marek: {
    sampleSlovak: "Ahoj, ja som Marek. Teší ma.",
    sampleEnglish: "Hi, I am Marek. Nice to meet you.",
  },
  maria: {
    sampleSlovak: "Dobrý deň. Ste tu na registráciu?",
    sampleEnglish: "Good day. Are you here for registration?",
  },
  narrator: {
    sampleSlovak: "Dobrý deň. Vitajte na slovak.wiki.",
    sampleEnglish: "Good day. Welcome to slovak.wiki.",
  },
  receptionist: {
    sampleSlovak: "Dobrý deň. Ste Alex?",
    sampleEnglish: "Good day. Are you Alex?",
  },
  waiter: {
    sampleSlovak: "Dáte si kávu?",
    sampleEnglish: "Would you like coffee?",
  },
};
