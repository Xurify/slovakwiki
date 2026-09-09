import { hasAudioClip } from "../audio/manifest";
import { audioHash } from "../audio/core";
import { resolveKeyedAudioSrc } from "../audio/resolve-server";
import { audioConfigForCharacter } from "../audio/characters";
import {
  LESSON_CHARACTER_IDS,
  type CharacterKind,
  type LessonCharacterId,
} from "./character-ids";
import { VOICE_PREVIEW_LINES } from "./voice-preview-lines";
import audioConfig from "../../../../content/audio/config.json";

export { VOICE_PREVIEW_LINES } from "./voice-preview-lines";

export interface VoiceRosterEntry {
  audioHash: string;
  audioSrc?: string;
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

export function getVoiceRoster(): VoiceRosterEntry[] {
  const characters = audioConfig.characters ?? {};

  return LESSON_CHARACTER_IDS.map((characterId) => {
    const rawCharacter = characters[characterId];
    const preview = VOICE_PREVIEW_LINES[characterId];
    const config = audioConfigForCharacter(characterId);
    const hash = audioHash(preview.sampleSlovak, config);

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
      audioHash: hash,
      audioSrc: hasAudioClip(hash)
        ? resolveKeyedAudioSrc(preview.sampleSlovak, "lesson", config)
        : undefined,
    };
  });
}
