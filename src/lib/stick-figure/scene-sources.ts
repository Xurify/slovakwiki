import { WIDE, setUp, startWorld, worlds, type World } from "./acts";
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
import { PLACES, type PlaceSet } from "./places";
import { dayTalks } from "./scene-day";
import { directScene, type DirectedLine } from "./scene-direction";
import { findAsker, findSayings } from "./scene-find";
import type { FindVoice, Scene, SceneGroup, SceneLine, StagedScene } from "./scene-line";
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
    act: turn.act,
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
    overPhone: turn.overPhone,
    props: turn.props,
    ring: turn.ring,
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
      order: (chapter.cast ?? episode.speakers).map(characterIdForSpeaker),
      setting: chapter.stage ?? "studio",
    })),
  }));
}

/** The part of a scene line the stage reads, so a page sends no more than it plays. */
function directedLine({
  act,
  characterId,
  gestures,
  mouth,
  overPhone,
  props,
  ring,
  said,
  slovak,
  src,
  stays,
  to,
  vowels,
}: SceneLine): DirectedLine {
  return {
    act,
    characterId,
    gestures,
    mouth,
    overPhone,
    props,
    ring,
    said,
    slovak,
    src,
    stays,
    to,
    vowels,
  };
}

/**
 * An episode's segments as the stage acts them out on its page, keyed by
 * segment, with the dictionary link and clip for each thing on their stages.
 */
export function episodeStages(episode: ListeningEpisode): {
  scenes: Record<string, StagedScene>;
  thingWords: Record<string, { href?: string; src?: string }>;
} {
  let said: string[] = [];
  /** Each place's set as the last segment there left it: the soup still on the stove, the plant still yellow. */
  const left = new Map<string, World>();
  const scenes = Object.fromEntries(
    episode.chapters.map((chapter, index) => {
      const setting = chapter.stage ?? "studio";
      const previous = episode.chapters[index - 1];
      if ((previous?.stage ?? "studio") !== setting) said = [];
      const before = said;
      said = [...said, ...chapter.lines.map((line) => line.slovak)];
      const lines = sceneLines(chapter.lines).map(directedLine);
      const set = PLACES[setting].set;
      // Each segment starts on a wide shot, whatever the last one ended on.
      const opening = set
        ? setUp(
            { ...(left.get(setting) ?? startWorld(set.objects)), camera: WIDE },
            chapter.setup,
          )
        : undefined;
      const start = opening && PLACES[setting].desk ? atDesk(opening, lines) : opening;
      if (set && start) left.set(setting, playedThrough(lines, set, start));
      return [
        chapter.id,
        {
          ...(index > 0 && before.length > 0 ? { before } : {}),
          ...(start ? { world: start } : {}),
          lines,
          order: (chapter.cast ?? episode.speakers).map(characterIdForSpeaker),
          setting,
        },
      ];
    }),
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

/** Hosts the stage seats at the desk, being nowhere else, are seated in the world too, so a cue knows they sit. */
function atDesk(world: World, lines: readonly DirectedLine[]): World {
  const hosts = [...new Set(lines.map(({ characterId }) => characterId))].filter(
    (id): id is LessonCharacterId => !!id && !world.spots[id] && !world.out?.includes(id),
  );
  const seated = [...new Set([...(world.seated ?? []), ...hosts])];
  return seated.length ? { ...world, seated } : world;
}

/** The world once a segment's cues have played; a cue that cannot be played (the episode checks name it) leaves it as it was. */
function playedThrough(lines: DirectedLine[], set: PlaceSet, start: World): World {
  try {
    return worlds(lines, set, start).at(-1) ?? start;
  } catch (error) {
    console.error(error);
    return start;
  }
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

/** The name a character's lines are written under, for their voice. */
function speakerOf(characterId: LessonCharacterId): string {
  return (
    listedCharacters().find((character) => character.id === characterId)?.speakers[0] ??
    ""
  );
}

/** The Find it asker's lines over a scene's things, each as a turn in the asker's voice. */
function findTurnsOf(scene: Scene): DialogueTurn[] {
  const direction = directScene(scene.lines, scene.setting, scene.order);
  const asker = findAsker(direction);
  if (!asker) return [];

  const speaker = speakerOf(asker);
  return findSayings(direction.things).map((slovak) => ({
    english: "",
    id: slovak,
    slovak,
    speaker,
  }));
}

/** What the Find it asker says in `scene`, with its clip and mouth track where it has them. */
function findVoices(scene: Scene): Record<string, FindVoice> {
  const turns = findTurnsOf(scene);
  const srcs = sceneAudioSrcs(turns);
  const mouths = sceneMouthTracks(turns);
  return Object.fromEntries(
    turns.map((turn) => [
      turn.slovak,
      { mouth: mouths[turn.id]?.m, src: srcs[turn.id], vowels: mouths[turn.id]?.v },
    ]),
  );
}

/** Every line a Find it asker says across the scenes, one per voice and words, for the clips to make. */
export function findTurns(): DialogueTurn[] {
  const turns = new Map<string, DialogueTurn>();
  for (const scene of sceneGroups().flatMap((group) => group.scenes)) {
    for (const turn of findTurnsOf(scene))
      turns.set(`${turn.speaker}:${turn.slovak}`, turn);
  }
  return [...turns.values()];
}

/** Everything on /dev/scenes, in the order the list shows it. */
export function sceneGroups(): SceneGroup[] {
  const groups: SceneGroup[] = [
    { label: "From the lessons", scenes: lessonScenes() },
    ...podcastGroups(),
    {
      label: "Prototype",
      scenes: [
        prototypeScene("rain-and-tram", RAIN_AND_TRAM, "street"),
        prototypeScene("weather-today", WEATHER_TODAY, "default"),
        ...dayTalks().map(talkScene),
      ],
    },
  ];
  return groups.map((group) => ({
    ...group,
    scenes: group.scenes.map((scene) => ({ ...scene, finds: findVoices(scene) })),
  }));
}

/**
 * The dictionary page and lemma clip for each scene thing's word, where the
 * dictionary has it. Server only: clip URLs differ between dev and prod.
 */
export function sceneThingWords(): Record<string, { href?: string; src?: string }> {
  const found: Record<string, { href?: string; src?: string }> = {};

  for (const thing of Object.values(PLACES).flatMap((place) => place.things)) {
    if (thing.word in found) continue;

    const entry = words.find(
      (word) => word.slovak === (thing.lemma ?? thing.word) && word.gender,
    );
    found[thing.word] = {
      href: entry ? dictionaryPathForLemmaId(entry.slug) : undefined,
      src: hasAudioClip(audioHash(thing.word))
        ? resolveDictionaryAudioSrc(thing.word, "lemma")
        : undefined,
    };
  }

  return found;
}
