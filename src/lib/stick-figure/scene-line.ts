import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { ListeningCheck } from "$lib/catalog/listening/types";
import type { TextMark } from "$lib/learning/marked-text";
import type { DialogueSayChoices } from "$lib/learning/types";
import type { DirectedLine } from "./scene-direction";
import type { TimeOfDay } from "./scene-mood";
import type { StageSetting } from "./stage-setting";
import type { Said, TalkNode } from "./talk";

/**
 * One line of a scene, as the stage directs it and the player shows it,
 * whatever it came from: a lesson, a podcast segment, a talk.
 */
export interface SceneLine extends DirectedLine {
  english: string;
  id: string;
  /** Alex's line, which the learner can take. */
  learner: boolean;
  marks?: TextMark[];
  sayChoices?: DialogueSayChoices;
  /** The name over the line: Alex, not You. */
  speaker: string;
}

/** A conversation that branches on Alex's replies, with the one he talks with. */
export interface SceneTalk {
  nodes: Array<TalkNode<SceneLine>>;
  who: LessonCharacterId;
}

export interface Scene {
  /** Questions on what was heard, asked once the scene has played: a podcast segment's. */
  checks?: ListeningCheck[];
  /** Under the name in the list of scenes: the lesson's title, or the name in English. */
  english?: string;
  /** Where the scene comes from: its lesson or podcast episode. */
  href?: string;
  hrefLabel?: string;
  id: string;
  /** Before it starts, in place of the place and the cast: the hour and who comes. */
  intro?: Said;
  /** The lines as played without picking: a talk's along the first reply that fits. */
  lines: SceneLine[];
  /** A line it is named after, or the podcast segment's name. */
  name: string;
  /** Who stands where, left to right, so a series keeps its hosts in their places. */
  order?: LessonCharacterId[];
  setting: StageSetting;
  /** Branches on what Alex says, so its lines follow his picks. */
  talk?: SceneTalk;
  /** The hour, when the lines do not say it with a greeting. */
  time?: TimeOfDay;
}

export interface SceneGroup {
  label: string;
  /** The Slovak name after the label: the podcast episode's. */
  slovak?: string;
  scenes: Scene[];
}
