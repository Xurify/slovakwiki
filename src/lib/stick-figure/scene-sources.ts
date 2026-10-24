import { audioHash } from "$lib/catalog/audio/core";
import { hasAudioClip } from "$lib/catalog/audio/manifest";
import { resolveDictionaryAudioSrc } from "$lib/catalog/audio/resolve-server";
import { dictionaryPathForLemmaId } from "$lib/catalog/dictionary/lemma-href";
import { words } from "$lib/catalog/entries";
import { lessons } from "$lib/catalog/lessons";
import { sceneAudioSrcs, sceneMouthTracks } from "$lib/catalog/lessons/audio";
import {
  characterIdForSpeaker,
  isLearnerSpeaker,
  listedCharacters,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";
import { episodePath, listeningEpisodes } from "$lib/catalog/listening";
import type { ListeningEpisode } from "$lib/catalog/listening/types";
import { dialogueSpeakerLabel } from "$lib/components/practice/dialogue-speaker";
import type { DialogueTurn } from "$lib/learning/types";
import {
  storySettingForLesson,
  type LessonSceneArtId,
} from "$lib/lesson-story/story-settings";
import { RAIN_AND_TRAM, WEATHER_TODAY } from "./dev-scenes";
import { PLACES } from "./places";
import { dayTalks } from "./scene-day";
import type { DirectedLine } from "./scene-direction";
import type { Scene, SceneGroup, SceneLine, StagedScene } from "./scene-line";
import { stageName } from "./stage-name";
import { walkTalk, type Said, type Talk, type TalkNode } from "./talk";

/**
 * Every scene the stage plays, built from where its lines live: lessons,
 * podcast segments, prototype scripts and the day's talks. Server only:
 * clip URLs and mouth tracks come from the audio manifest.
 */

/** Dialogue turns as scene lines, with their clips and mouth tracks where they have them. */
export function sceneLines(turns: readonly DialogueTurn[]): SceneLine[] {
  const srcs = sceneAudioSrcs([...turns]);
  const mouths = sceneMouthTracks([...turns]);

  return turns.map((turn) => ({
    characterId:
      dialogueSpeakerLabel(turn.speaker) === null
        ? null
        : characterIdForSpeaker(turn.speaker),
    english: turn.english,
    gestures: turn.gestures,
    id: turn.id,
    learner: isLearnerSpeaker(turn.speaker),
    marks: turn.marks,
    mouth: mouths[turn.id]?.m,
    props: turn.props,
    said: turn.audio?.transcript,
    sayChoices: turn.sayChoices,
    slovak: turn.slovak,
    speaker: stageName(turn.speaker),
    src: srcs[turn.id],
    to: turn.to ? characterIdForSpeaker(turn.to) : undefined,
    vowels: mouths[turn.id]?.v,
    wait: turn.wait,
  }));
}

/**
 * Lessons whose story setting does not fit their dialogue: the waiter offering
 * coffee and a menu is in a café, the receptionist checking Alex in is at the
 * front desk. Both are set "home" in story-settings.ts.
 */
const LESSON_SETTINGS: Record<string, LessonSceneArtId> = {
  "everyday/negation-in-conversation": "cafe",
  "grammar/byt-present": "registration",
};

/** Every lesson whose dialogue has someone on stage. */
export function lessonScenes(): Scene[] {
  return lessons
    .filter((lesson) => lesson.scene.some((line) => dialogueSpeakerLabel(line.speaker)))
    .map((lesson) => ({
      english: lesson.title,
      href: `/lessons/${lesson.id}`,
      hrefLabel: "Open the lesson",
      id: lesson.id,
      lines: sceneLines(lesson.scene),
      name: lesson.scene[0]?.slovak ?? lesson.title,
      setting: LESSON_SETTINGS[lesson.id] ?? storySettingForLesson(lesson.id).art,
    }));
}

/** Each podcast episode's segments, its hosts in the same places throughout. */
export function podcastGroups(): SceneGroup[] {
  return listeningEpisodes.map((episode) => ({
    label: "From the podcast",
    slovak: episode.titleSk,
    scenes: episode.chapters.map((chapter) => ({
      checks: chapter.checks,
      english: chapter.title,
      href: episodePath(episode),
      hrefLabel: "Open the episode",
      id: chapter.id,
      lines: sceneLines(chapter.lines),
      name: chapter.titleSk,
      order: episode.speakers.map(characterIdForSpeaker),
      setting: chapter.stage ?? "studio",
    })),
  }));
}

/** The part of a scene line the stage reads, so a page sends no more than it plays. */
function directedLine({
  characterId,
  gestures,
  mouth,
  props,
  said,
  slovak,
  src,
  stays,
  to,
  vowels,
}: SceneLine): DirectedLine {
  return { characterId, gestures, mouth, props, said, slovak, src, stays, to, vowels };
}

/**
 * An episode's segments as the stage acts them out on its page, keyed by
 * segment, with the dictionary link and clip for each thing on their stages.
 */
export function episodeStages(episode: ListeningEpisode): {
  scenes: Record<string, StagedScene>;
  thingWords: Record<string, { href?: string; src?: string }>;
} {
  const order = episode.speakers.map(characterIdForSpeaker);
  const scenes = Object.fromEntries(
    episode.chapters.map((chapter) => [
      chapter.id,
      {
        lines: sceneLines(chapter.lines).map(directedLine),
        order,
        setting: chapter.stage ?? "studio",
      },
    ]),
  );
  const onStage = new Set(
    Object.values(scenes).flatMap(({ setting }) =>
      PLACES[setting].things.map((thing) => thing.word),
    ),
  );
  const thingWords = Object.fromEntries(
    Object.entries(sceneThingWords()).filter(([word]) => onStage.has(word)),
  );

  return { scenes, thingWords };
}

function prototypeScene(
  id: string,
  turns: DialogueTurn[],
  setting: Scene["setting"],
): Scene {
  return {
    english: turns[0].english,
    id: `dev/${id}`,
    lines: sceneLines(turns),
    name: turns[0].slovak,
    setting,
  };
}

const SPEAKERS = Object.fromEntries(
  listedCharacters().map((character) => [character.id, character.speakers[0] ?? ""]),
) as Record<LessonCharacterId, string>;

/** A talk of the day on the square as a scene that branches on what Alex says. */
function talkScene(talk: Talk<Said & { id: string }>): Scene {
  const line = (said: Said & { id: string }, who: LessonCharacterId): SceneLine =>
    sceneLines([{ ...said, speaker: SPEAKERS[who] }])[0];
  // Alex stays on the square after every goodbye; it is the others who walk on.
  const alex = (said: Said & { id: string }): SceneLine => ({
    ...line(said, "alex"),
    stays: true,
  });
  const nodes: Array<TalkNode<SceneLine>> = talk.nodes.map((node) => ({
    id: node.id,
    says: node.says.map((said) => line(said, talk.who)),
    replies: node.replies?.map((reply) => ({
      line: alex(reply.line),
      miss: reply.miss && {
        ...reply.miss,
        answer: reply.miss.answer && line(reply.miss.answer, talk.who),
      },
      next: reply.next,
    })),
  }));

  return {
    english: talk.topic,
    id: talk.id,
    intro: talk.intro,
    lines: walkTalk(nodes).lines,
    name: talk.name,
    setting: talk.setting,
    talk: { nodes, who: talk.who },
    time: talk.time,
  };
}

/** Everything on /dev/scenes, in the order the list shows it. */
export function sceneGroups(): SceneGroup[] {
  return [
    { label: "From the lessons", scenes: lessonScenes() },
    ...podcastGroups(),
    {
      label: "Prototype",
      scenes: [
        prototypeScene("rain-and-tram", RAIN_AND_TRAM, "street"),
        prototypeScene("weather-today", WEATHER_TODAY, "default"),
      ],
    },
    { label: "Games", slovak: "Deň na námestí", scenes: dayTalks().map(talkScene) },
  ];
}

/**
 * The dictionary page and lemma clip for each scene thing's word, where the
 * dictionary has it. Server only: clip URLs differ between dev and prod.
 */
export function sceneThingWords(): Record<string, { href?: string; src?: string }> {
  const found: Record<string, { href?: string; src?: string }> = {};

  for (const thing of Object.values(PLACES).flatMap((place) => place.things)) {
    if (thing.word in found) continue;

    const entry = words.find((word) => word.slovak === thing.word && word.gender);
    found[thing.word] = {
      href: entry ? dictionaryPathForLemmaId(entry.slug) : undefined,
      src: hasAudioClip(audioHash(thing.word))
        ? resolveDictionaryAudioSrc(thing.word, "lemma")
        : undefined,
    };
  }

  return found;
}
