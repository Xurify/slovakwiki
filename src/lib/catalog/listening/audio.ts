import { keyPhraseAudioSrcs, sceneAudioSrcs } from "../lessons/audio";
import { episodeLines } from "./index";
import type { GrammarListen, ListeningEpisode } from "./types";

export interface EpisodeAudioSrcs {
  /** Line id → clip URL in that speaker's voice. */
  lines: Record<string, string>;
  /** Vocabulary slovak → clip URL in the guide voice. */
  vocabulary: Record<string, string>;
}

/** Server-only: line id → clip URL for a grammar page listen block. */
export function grammarListenAudioSrcs(listen: GrammarListen): Record<string, string> {
  return sceneAudioSrcs(listen.lines);
}

/** Server-only: resolvable clips for an episode (missing hashes are left out). */
export function episodeAudioSrcs(episode: ListeningEpisode): EpisodeAudioSrcs {
  return {
    lines: sceneAudioSrcs(episodeLines(episode)),
    vocabulary: keyPhraseAudioSrcs(episode.vocabulary),
  };
}
