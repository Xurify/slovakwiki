import items from "../../../../content/level-test/items.json";
import { audioConfigForCharacter } from "../audio/characters";
import { audioHash, type AudioConfig, type AudioKind } from "../audio/core";
import { audioClipKind, hasAudioClip } from "../audio/manifest";
import { resolveKeyedAudioSrc } from "../audio/resolve-server";
import { dictionaryImageView } from "../dictionary/images";
import type { LessonCharacterId } from "../lessons/character-ids";
import { tokenizeWords } from "$lib/level-test/grade";
import { CEFR_ANCHOR, type CefrLevel } from "$lib/level-test/scale";
import type {
  AdaptiveItem,
  ChooseVerbItem,
  CTestPart,
  FillBlankItem,
  InteractiveListeningSet,
  LevelTestBank,
  ListenLengthItem,
  ListenSelectItem,
  ListenTypeItem,
  PhotoPrompt,
  PlaceCliticItem,
  ReadAloudItem,
  ReadCompleteItem,
  SpokenLine,
} from "$lib/level-test/types";

import { aspectItems } from "./aspect";
import { LISTENING_NARRATOR, listeningSets, type AuthoredLine } from "./listening";
import {
  interactiveWritingPrompts,
  photoSlugs,
  readThenSpeakPrompts,
  speakingSamplePrompts,
  writingSamplePrompts,
} from "./prompts";
import { readingSets } from "./reading";
import { cliticItems } from "./word-order";
import { tagWord } from "./word-tags";

/** Below this many voiced pseudowords Listen and Select would be all real words. */
const MIN_LISTEN_SELECT_PSEUDOWORDS = 30;

/** Where an authored passage or set sits on the scale; A1 is mid-band, not its floor. */
export function levelDifficulty(level: CefrLevel): number {
  return level === "A1" ? 5 : CEFR_ANCHOR[level];
}

function voice(characterId?: LessonCharacterId): AudioConfig | undefined {
  return characterId ? audioConfigForCharacter(characterId) : undefined;
}

function clipSrc(text: string, kind: AudioKind, characterId?: LessonCharacterId) {
  const config = voice(characterId);
  if (!hasAudioClip(audioHash(text, config))) return undefined;
  return resolveKeyedAudioSrc(text, kind, config);
}

function spokenLine(
  line: AuthoredLine,
  characterId: LessonCharacterId,
): SpokenLine | undefined {
  const audio = clipSrc(line.text, "lesson", characterId);
  return audio ? { ...line, audio } : undefined;
}

function listenSelectItems(): ListenSelectItem[] {
  const voiced = items.listenSelect.flatMap((item) => {
    const audio = clipSrc(item.word, "lemma");
    return audio ? [{ ...item, format: "listenSelect" as const, audio }] : [];
  });
  const pseudowords = voiced.filter((item) => !item.real).length;
  return pseudowords >= MIN_LISTEN_SELECT_PSEUDOWORDS ? voiced : [];
}

/** A pair plays only when both of its words have a clip, or one answer would always be the other. */
function listenLengthItems(): ListenLengthItem[] {
  const voiced = (items.listenLength ?? []).flatMap((item) => {
    const audio = clipSrc(item.word, "lemma");
    return audio ? [{ ...item, format: "listenLength" as const, audio }] : [];
  });
  return voiced.filter(
    (item) => voiced.filter((other) => other.short === item.short).length === 2,
  );
}

function listenTypeItems(): ListenTypeItem[] {
  return items.listenType.flatMap((item) => {
    const kind = audioClipKind(audioHash(item.text));
    if (!kind) return [];
    return [
      {
        ...item,
        format: "listenType" as const,
        audio: resolveKeyedAudioSrc(item.text, kind),
        wordTags: tokenizeWords(item.text).map(tagWord),
      },
    ];
  });
}

function listeningSetsWithAudio(): InteractiveListeningSet[] {
  return listeningSets.flatMap((set) => {
    const scenario = spokenLine(set.scenario, LISTENING_NARRATOR);
    const turns = set.turns.map((turn) => {
      const line = spokenLine(turn.line, set.partner);
      return line ? { ...turn, line } : undefined;
    });
    if (!scenario || turns.some((turn) => !turn)) return [];

    return [
      {
        id: set.id,
        level: set.level,
        difficulty: levelDifficulty(set.level),
        partner: set.partner,
        partnerName: set.partnerName,
        scenario,
        complete: set.complete,
        turns: turns.filter((turn) => turn !== undefined),
        summaryKey: set.summaryKey,
      },
    ];
  });
}

function fillBlankItems(): FillBlankItem[] {
  return items.fillBlank.map((item) => ({
    ...item,
    format: "fillBlank" as const,
    tag: tagWord(item.prefix + item.missing),
  }));
}

function chooseVerbItems(): ChooseVerbItem[] {
  return aspectItems.map(({ level, ...item }) => ({
    ...item,
    format: "chooseVerb" as const,
    difficulty: levelDifficulty(level),
  }));
}

function placeCliticItems(): PlaceCliticItem[] {
  return cliticItems.map(({ level, ...item }) => ({
    ...item,
    format: "placeClitic" as const,
    difficulty: levelDifficulty(level),
  }));
}

function readCompleteItems(): ReadCompleteItem[] {
  return items.readComplete.map((item) => ({
    ...item,
    format: "readComplete" as const,
    parts: (item.parts as CTestPart[]).map((part) =>
      typeof part === "string"
        ? part
        : { ...part, tag: tagWord(part.prefix + part.missing) },
    ),
  }));
}

function photos(): PhotoPrompt[] {
  return photoSlugs.flatMap((slug) => {
    const view = dictionaryImageView(slug, slug);
    if (!view) return [];
    const credit = view.artist
      ? `${view.artist} · ${view.sourceLabel}`
      : view.sourceLabel;
    return [
      {
        id: slug,
        src: view.src,
        alt: view.caption,
        credit,
        creditUrl: view.sourcePageUrl,
      },
    ];
  });
}

/**
 * Server-only: the whole item bank with audio and image URLs resolved. Items
 * whose clip is not generated yet are left out rather than shipped silent.
 */
export function buildLevelTestBank(): LevelTestBank {
  const adaptive: AdaptiveItem[] = [
    ...(items.readSelect as AdaptiveItem[]),
    ...listenSelectItems(),
    ...listenLengthItems(),
    ...fillBlankItems(),
    ...chooseVerbItems(),
    ...placeCliticItems(),
    ...readCompleteItems(),
    ...listenTypeItems(),
  ];

  return {
    version: 1,
    adaptive,
    interactiveReading: readingSets.map((set) => ({
      ...set,
      difficulty: levelDifficulty(set.level),
    })),
    interactiveListening: listeningSetsWithAudio(),
    photos: photos(),
    interactiveWriting: interactiveWritingPrompts,
    writingSamples: writingSamplePrompts,
    readAloud: items.readAloud as ReadAloudItem[],
    readThenSpeak: readThenSpeakPrompts,
    speakingSamples: speakingSamplePrompts,
  };
}
