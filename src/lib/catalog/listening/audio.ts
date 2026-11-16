import type { DialogueTurn } from "$lib/learning/types";
import { MOUTH_FRAME_MS } from "$lib/stick-figure/mouth-track";
import { keyPhraseAudioSrcs, sceneAudioSrcs, sceneMouthTracks } from "../lessons/audio";
import { episodeLines, episodeMinutes } from "./index";
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

/** Server-only: about how long one listen through takes, in minutes, from the clips' own lengths. */
export function episodeRunMinutes(episode: ListeningEpisode): number {
  const tracks = sceneMouthTracks(episodeLines(episode));
  // A clip's mouth track has a frame every MOUTH_FRAME_MS from its first sample to its last.
  return episodeMinutes(episode, (line: DialogueTurn) => {
    const track = tracks[line.id];
    return track ? track.m.length * MOUTH_FRAME_MS : undefined;
  });
}
