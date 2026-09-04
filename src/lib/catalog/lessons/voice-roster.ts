import audioConfig from "../../../../content/audio/config.json";
import {
  LESSON_CHARACTER_IDS,
  type CharacterKind,
  type LessonCharacterId,
} from "./character-ids";

export interface VoiceRosterEntry {
  audioHash: string;
  audioSrc: string;
  blurb: string;
  displayName: string;
  gender: "female" | "male" | "neutral";
  id: LessonCharacterId;
  kind: CharacterKind;
  sampleEnglish: string;
  sampleSlovak: string;
  voiceId: string;
  voiceName: string;
}

const VOICE_PREVIEWS: Record<
  LessonCharacterId,
  {
    audioHash: string;
    sampleEnglish: string;
    sampleSlovak: string;
  }
> = {
  alex: {
    sampleSlovak: "Dobrý deň. Volám sa Alex.",
    sampleEnglish: "Good day. My name is Alex.",
    audioHash: "dea92b23df95d04a6216",
  },
  anna: {
    sampleSlovak: "Dobrý deň. Volám sa Anna.",
    sampleEnglish: "Good day. My name is Anna.",
    audioHash: "6315a8bb7110493101bb",
  },
  guide: {
    sampleSlovak: "Dobrý deň.",
    sampleEnglish: "Good day.",
    audioHash: "c8cf2497f78316fd1ef9",
  },
  lucia: {
    sampleSlovak: "Dobrý deň. Ako vám môžem pomôcť?",
    sampleEnglish: "Good day. How can I help you?",
    audioHash: "fb9fb0733e7ef7bdf93b",
  },
  marek: {
    sampleSlovak: "Ahoj, ja som Marek. Teší ma.",
    sampleEnglish: "Hi, I am Marek. Nice to meet you.",
    audioHash: "a64d3101f3c5ccdcc17f",
  },
  maria: {
    sampleSlovak: "Dobrý deň. Ste tu na registráciu?",
    sampleEnglish: "Good day. Are you here for registration?",
    audioHash: "7e7f80e25bbe93bcc32d",
  },
  narrator: {
    sampleSlovak: "Dobrý deň. Vitajte na slovak.wiki.",
    sampleEnglish: "Good day. Welcome to slovak.wiki.",
    audioHash: "d33fc7c846029b846180",
  },
  receptionist: {
    sampleSlovak: "Dobrý deň. Ste Alex?",
    sampleEnglish: "Good day. Are you Alex?",
    audioHash: "d856a5eaf157c0b94684",
  },
  waiter: {
    sampleSlovak: "Dáte si kávu?",
    sampleEnglish: "Would you like coffee?",
    audioHash: "36ab9e85aa10f7644a59",
  },
};

export function getVoiceRoster(): VoiceRosterEntry[] {
  const characters = audioConfig.characters ?? {};

  return LESSON_CHARACTER_IDS.map((characterId) => {
    const rawCharacter = characters[characterId];
    const preview = VOICE_PREVIEWS[characterId];

    const gender: "female" | "male" | "neutral" =
      rawCharacter?.gender === "female" ||
      rawCharacter?.gender === "male" ||
      rawCharacter?.gender === "neutral"
        ? rawCharacter.gender
        : "neutral";

    const kind: CharacterKind =
      rawCharacter?.kind === "oneOff" ||
      rawCharacter?.kind === "recurring" ||
      rawCharacter?.kind === "system"
        ? rawCharacter.kind
        : "recurring";

    return {
      id: characterId,
      displayName: rawCharacter?.displayName ?? characterId,
      gender,
      kind,
      blurb: rawCharacter?.blurb ?? "",
      voiceId: rawCharacter?.voiceId ?? "",
      voiceName: rawCharacter?.voiceName ?? "",
      sampleSlovak: preview.sampleSlovak,
      sampleEnglish: preview.sampleEnglish,
      audioHash: preview.audioHash,
      audioSrc: `/audio/lesson/${preview.audioHash}.mp3`,
    };
  });
}
