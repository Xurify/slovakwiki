import { keyPhraseAudioSrcs, sceneAudioSrcs } from "../lessons/audio";
import { episodeLines } from "./index";
import type { ListeningEpisode } from "./types";

export interface EpisodeAudioSrcs {
  srcByLineId: Record<string, string>;
  srcBySlovak: Record<string, string>;
}

export function episodeAudioSrcs(episode: ListeningEpisode): EpisodeAudioSrcs {
  return {
    srcByLineId: sceneAudioSrcs(episodeLines(episode)),
    srcBySlovak: keyPhraseAudioSrcs(episode.vocabulary),
  };
}
