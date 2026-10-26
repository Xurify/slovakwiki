import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { ListeningEpisode } from "$lib/catalog/listening/types";
import { directScene } from "$lib/stick-figure/scene-direction";
import { episodeStages } from "$lib/stick-figure/scene-sources";
import { blockingBefore, startLine } from "$lib/stick-figure/stage-blocking";
import {
  stageFrame,
  stageX,
  walkOns,
  type StageFrame,
} from "$lib/stick-figure/stage-frame";
import {
  foldLine,
  lineSentences,
  lineWords,
  mentions,
} from "$lib/stick-figure/slovak-text";
import { thingCenter, thingNamed } from "$lib/stick-figure/thing-words";
import { propForSentence } from "$lib/stick-figure/props";
import {
  CueError,
  applyCue,
  cueActor,
  isActed,
  opening,
  startWorld,
  type ActedLine,
  type Cue,
  type World,
} from "$lib/stick-figure/acts";
import { PLACES, type PlaceSet } from "$lib/stick-figure/places";
import { STICK_BOX } from "$lib/stick-figure/rig";
import {
  objectBase,
  placePieces,
  spotAt,
  surfaceAt,
  type SetGeometry,
} from "$lib/stick-figure/set-pieces";
import type { StageSetting } from "$lib/stick-figure/stage-setting";

/** A set shows a place when its id is listed or its label names it: the park is drawn as `default`. */
function shows(setting: StageSetting, settings: string[]): boolean {
  const label = foldLine(PLACES[setting].label ?? "");
  return settings.some((name) => name === setting || label.includes(name));
}

/**
 * One thing a viewer would catch. `error` means the words and the picture
 * disagree and CI fails; `review` is for the critics and the person.
 */
export interface Finding {
  rule: string;
  level: "error" | "review";
  chapter: string;
  line?: string;
  slovak?: string;
  message: string;
}

/** Folded phrases where the speaker gives, pours or uses something on someone or something. */
const ACTING = [
  "tu mas",
  "tu mate",
  "nech sa paci",
  "polej",
  "polejem",
  "podaj",
  "nalej",
  "hod",
  "hodim",
  "zober",
  "vezmi",
  "daj",
  "otvor",
  "zatvor",
  "zapni",
  "vypni",
  "ochutnaj",
  "nakrajaj",
];
/** Folded phrases that say an event is happening now, which the listener must hear. */
const EVENTS = [
  "prave pise",
  "prave napisal",
  "prave napisala",
  "zvoni",
  "niekto klope",
  "klope",
  "pipa",
  "prisla sprava",
  "prisla mi sprava",
  "pocuvaj",
  "pocujes",
];
/** Folded words for where a scene is, and the settings that can show each. */
const PLACE_WORDS: Array<{ words: string[]; settings: string[] }> = [
  { words: ["parku", "park"], settings: ["park"] },
  { words: ["kuchyne", "kuchyni", "kuchyna"], settings: ["kitchen"] },
  { words: ["triedy", "triede", "trieda"], settings: ["classroom"] },
  { words: ["namesti", "namestie"], settings: ["plaza"] },
  { words: ["trhu", "trh"], settings: ["market"] },
  { words: ["kaviarne", "kaviarni"], settings: ["cafe"] },
  { words: ["studia", "studiu", "studio"], settings: ["studio"] },
];
/** Phrases that say where the speaker is right now. */
const HERE = ["sme v", "sme na", "tu v", "tu na", "vitajte v", "vitajte na"];
/** Phrases that say where everyone is going next. */
const GOING = [
  "ideme do",
  "ideme na",
  "pojdeme do",
  "pojdeme na",
  "podme do",
  "podme na",
];
const GAME = /\b(hra|hry|kv[ií]z|game|quiz)\b/i;
const OUTRO = /\b(z[aá]ver|outro|that's all)\b/i;

/** Stage px for the reach check: a desktop stage at the player's 2:1. */
const WIDTH = 960;
const HEIGHT = 480;
/** How far a hand reaches, in figure widths from the figure's middle. */
const REACH = 1.25;

/**
 * Cross-checks an episode's words against what its stage does, line by line.
 * Each rule is one failure class from the reviews of #76, #77 and #78
 * (docs/listening-one-prompt.md, section 6).
 */
export function checkEpisode(episode: ListeningEpisode): Finding[] {
  const findings: Finding[] = [];
  const { scenes } = episodeStages(episode);

  episode.chapters.forEach((chapter, chapterIndex) => {
    const scene = scenes[chapter.id];
    const setting = scene.setting;
    const acted = isActed(scene.lines);
    const direction = directScene(scene.lines, setting, scene.order);
    const stagings = direction.lines.map((line) => line.staging);
    const speakers = scene.lines.map((line) => line.characterId);
    const frame = stageFrame(
      direction.cast,
      walkOns(stagings),
      setting,
      direction.things,
      WIDTH,
      HEIGHT,
    );
    if (acted) {
      const set = PLACES[setting].set ?? { pieces: [], objects: [] };
      findings.push(...checkCues(chapter, scene.lines, set, frame, scene.world));
    }
    const at = (index: number) => {
      const turn = chapter.lines[index];
      return { chapter: chapter.id, line: turn.id, slovak: turn.slovak };
    };

    // Pacing: games and quizzes come after the story, not before it.
    const isGame = GAME.test(chapter.title) || GAME.test(chapter.titleSk);
    const laterStory = episode.chapters
      .slice(chapterIndex + 1)
      .some(
        (later) =>
          !GAME.test(later.title) &&
          !GAME.test(later.titleSk) &&
          !OUTRO.test(later.title) &&
          !OUTRO.test(later.titleSk),
      );
    if (isGame && laterStory) {
      findings.push({
        rule: "pacing/game-before-story",
        level: "error",
        chapter: chapter.id,
        message: `"${chapter.titleSk}" is a game or quiz with story segments still to come. Games go after the story.`,
      });
    }

    direction.lines.forEach((directed, index) => {
      const line = scene.lines[index];
      const turn = chapter.lines[index];
      const speaker = line.characterId;
      const folded = foldLine(turn.slovak);
      const before = index > 0 ? direction.lines[index - 1].held : {};

      // Props: in a segment not acted from cues the stage brings one out
      // because a word was said, so it comes from nowhere.
      for (const [holder, prop] of acted
        ? []
        : (Object.entries(directed.held) as Array<[LessonCharacterId, string]>)) {
        if (before[holder] === prop) continue;
        const handed = Object.values(before).includes(prop as never);
        if (handed) continue;
        // A phone that rings comes out of a pocket; the ring is its cue.
        if (
          prop === "phone" &&
          (turn.ring || chapter.lines[index - 1]?.ring || turn.overPhone)
        )
          continue;
        const word = lineSentences(turn.slovak).find(
          (sentence) => propForSentence(sentence) === prop,
        );
        findings.push({
          rule: "props/from-nowhere",
          level: "error",
          ...at(index),
          message: word
            ? `${holder} suddenly holds a ${prop}, only because the line says "${word.trim()}". Nothing shows where it came from.`
            : `${holder} suddenly holds a ${prop} (set by the line's props), with no cue for where it came from.`,
        });
      }

      // Acting on something: giving, pouring, throwing. The speaker must be
      // in reach of what they act on, and what they hold must be what they give.
      // An order to someone else may be carried out on the reply, so the next two lines count too.
      const cued = scene.lines
        .slice(index, index + 3)
        .some((later) => (later.act?.length ?? 0) > 0);
      if (acted && mentions(folded, ACTING) && !cued) {
        findings.push({
          rule: "action/unstaged",
          level: "error",
          ...at(index),
          message:
            "The line gives, takes or uses something, and no cue on it or the two replies acts it out.",
        });
      } else if (!acted && speaker && mentions(folded, ACTING)) {
        const target = lineWords(turn.slovak)
          .map((word) => thingNamed(foldLine(word), direction.things))
          .find(Boolean);
        const state = startLine(
          blockingBefore(index, speakers, stagings, frame),
          directed.staging,
          speaker,
          frame,
        );
        const holding = directed.held[speaker];
        if (target) {
          const left =
            (frame.marks[speaker] ?? 0) +
            (state.offsets[speaker] ?? 0) * frame.figureWidth;
          const middle = left + frame.figureWidth / 2;
          const gap =
            Math.abs(stageX(frame, thingCenter(target)) - middle) / frame.figureWidth;
          if (gap > REACH && directed.staging.goTo !== target.id) {
            findings.push({
              rule: "space/out-of-reach",
              level: "error",
              ...at(index),
              message: `${speaker} acts on the ${target.word} from ${gap.toFixed(1)} figure widths away and nobody walks there.`,
            });
          }
          if (holding && directed.staging.gives) {
            findings.push({
              rule: "props/wrong-object",
              level: "error",
              ...at(index),
              message: `${speaker} gives the ${target.word} something while holding a ${holding}; the stage hands the ${holding} to ${directed.staging.gives}.`,
            });
          } else if (holding) {
            findings.push({
              rule: "props/wrong-object",
              level: "review",
              ...at(index),
              message: `${speaker} acts on the ${target.word} with a ${holding} in hand. Is that what the line uses?`,
            });
          }
        } else if (
          !directed.staging.gives &&
          !directed.staging.approach &&
          !directed.staging.goTo
        ) {
          findings.push({
            rule: "action/unstaged",
            level: "review",
            ...at(index),
            message: `The line gives or uses something, but the stage shows no hand-over, walk or object.${holding ? ` ${speaker} holds a ${holding}.` : ""}`,
          });
        }
      }

      // Events the line reports must be heard and seen.
      if (mentions(folded, EVENTS) && !turn.ring && !chapter.lines[index - 1]?.ring) {
        findings.push({
          rule: "sound/no-source",
          level: "error",
          ...at(index),
          message:
            "The line reports something happening now (a message, a ring, a knock) with no sound or cue for it.",
        });
      }

      // The place a line claims must be the place on stage, and where they go must be where the next segment is.
      for (const { words, settings } of PLACE_WORDS) {
        const named = words.some((word) => folded.split(" ").includes(word));
        if (!named) continue;
        if (HERE.some((phrase) => folded.includes(phrase)) && !shows(setting, settings)) {
          findings.push({
            rule: "set/place-mismatch",
            level: "error",
            ...at(index),
            message: `The line says they are at a ${settings[0]}, but this segment is staged in "${setting}".`,
          });
        }
        const next = episode.chapters[chapterIndex + 1];
        if (
          GOING.some((phrase) => folded.includes(phrase)) &&
          index >= chapter.lines.length - 3 &&
          next
        ) {
          const nextSetting: StageSetting = next.stage ?? "studio";
          if (!shows(nextSetting, settings)) {
            findings.push({
              rule: "set/place-mismatch",
              level: "error",
              ...at(index),
              message: `They say they're going to a ${settings[0]}, but the next segment is staged in "${nextSetting}".`,
            });
          }
        }
      }

      // Dialogue: a paradigm read out like a textbook heading.
      const words = lineWords(turn.slovak).map(foldLine);
      for (let start = 0; start + 2 < words.length; start += 1) {
        const run = words.slice(start, start + 3);
        if (
          run.every(
            (word) => word.length >= 3 && word.slice(0, 3) === run[0].slice(0, 3),
          ) &&
          new Set(run).size === 3
        ) {
          findings.push({
            rule: "dialogue/textbook-label",
            level: "review",
            ...at(index),
            message: `"${run.join(", ")}" reads as a grammar table said aloud. Would a person say this here?`,
          });
          break;
        }
      }

      // Dialogue: a line carrying three or more taught forms is probably there for the forms.
      // Wrong forms said on purpose are left unmarked, so every mark is a taught form.
      const taught = turn.marks?.length ?? 0;
      if (taught >= 3) {
        findings.push({
          rule: "dialogue/form-density",
          level: "review",
          ...at(index),
          message: `${taught} taught forms in one line. Check it is something a person would say, not a carrier for forms.`,
        });
      }
    });

    // Endings: the last beat needs room, not one or two words.
    if (chapterIndex === episode.chapters.length - 1) {
      const spoken = chapter.lines.filter((line) => line.speaker !== "Scene");
      const last = spoken[spoken.length - 1];
      if (last && lineWords(last.slovak).length <= 2) {
        findings.push({
          rule: "pacing/rushed-ending",
          level: "review",
          chapter: chapter.id,
          line: last.id,
          slovak: last.slovak,
          message:
            "The episode ends on a line of one or two words. Does the last beat have a set-up, a pause and a reaction?",
        });
      }
    }
  });

  return findings;
}

/** How far from where they stand someone reaches what they work on, in rig units: an arm, a lean, half the thing. */
const ARM = 36;
/**
 * Closer than this, in rig units, two people standing still crowd each other
 * (one's resting hand on the other's sleeve); side by side at a counter they
 * stand about 45 apart.
 */
const ELBOW_ROOM = 30;
/** Verbs that leave someone standing or sitting somewhere new. */
const MOVES = new Set<Cue["do"]>(["go", "enter", "sit"]);

/**
 * Replays an acted segment's cues: a cue that cannot happen (taking what the
 * set lacks, giving what is not held) is an error, and so is working on
 * something out of reach of where the cues have the doer stand, as the
 * stage lays the set out on `frame`.
 */
export function checkCues(
  chapter: Pick<ListeningEpisode["chapters"][number], "id" | "lines">,
  lines: readonly ActedLine[],
  set: PlaceSet,
  frame: StageFrame,
  start?: World,
): Finding[] {
  const findings: Finding[] = [];
  const unit = frame.figureWidth / STICK_BOX.width;
  const castX = (x: number) => stageX(frame, { x, y: 0 }) / unit;
  const { seats } = frame;
  const desk = seats.length
    ? (seats[0].x + seats[seats.length - 1].x) / 2 / unit
    : frame.width / 2 / unit;
  const placed = placePieces(set.pieces, (piece) =>
    piece.x !== undefined ? castX(piece.x) : piece.kind === "desk" ? desk : undefined,
  );
  const geometry: SetGeometry = { pieces: set.pieces, pieceX: (id) => placed.get(id) };

  /** Where `who` stands: their spot, their chair, their seat at the desk, or their mark. */
  const standsAt = (world: World, who: LessonCharacterId): number | undefined => {
    const spot = world.spots[who];
    if (spot) {
      const at = set.spots?.[spot];
      if (at && "chair" in at) return seats[at.chair] && seats[at.chair].x / unit;
      return spotAt(set, geometry, spot, castX)?.x;
    }
    const index = frame.cast.indexOf(who);
    if (frame.desk && index !== -1) return seats[index] && seats[index].x / unit;
    const mark = frame.marks[who];
    return mark === undefined ? undefined : (mark + frame.figureWidth / 2) / unit;
  };

  let world = opening(lines, start ?? startWorld(set.objects));
  lines.forEach((line, index) => {
    const turn = chapter.lines[index];
    const at = { chapter: chapter.id, line: turn.id, slovak: turn.slovak };
    for (const cue of line.act ?? []) {
      const who = cueActor(cue, line.characterId);
      if (!who) continue;
      let after: World;
      try {
        after = applyCue(world, who, cue, set);
      } catch (error) {
        if (!(error instanceof CueError)) throw error;
        findings.push({
          rule: "props/impossible-cue",
          level: "error",
          ...at,
          message: error.message,
        });
        continue;
      }
      const target = workedOn(world, after, cue, set, geometry);
      const from = standsAt(world, who);
      if (target !== undefined && from !== undefined && Math.abs(target - from) > ARM) {
        const spot = world.spots[who] ?? "their mark";
        findings.push({
          rule: "space/out-of-reach",
          level: "error",
          ...at,
          message: `${who} cues "${cue.do} ${cue.what ?? cue.to ?? ""}" ${Math.round(Math.abs(target - from))} rig units from where they stand (${spot}); a "go" cue must take them closer.`,
        });
      }
      const there =
        MOVES.has(cue.do) && after.spots[who] ? standsAt(after, who) : undefined;
      for (const other of there === undefined ? [] : frame.cast) {
        if (other === who || !after.spots[other] || after.out?.includes(other)) continue;
        const near = standsAt(after, other);
        if (near === undefined || Math.abs(near - there!) >= ELBOW_ROOM) continue;
        findings.push({
          rule: "space/crowded",
          level: "error",
          ...at,
          message: `${who} stops ${Math.round(Math.abs(near - there!))} rig units from ${other} (${after.spots[other]}); side by side people stand about 45 apart. Move ${other} off first, earlier in the cue list, or pick another spot.`,
        });
      }
      world = after;
    }
  });
  return findings;
}

/** The x of what a cue's hands work on, in cast units: what is taken, where it is put, what is poured into. */
function workedOn(
  world: World,
  after: World,
  cue: Cue,
  set: PlaceSet,
  geometry: SetGeometry,
): number | undefined {
  const base = (state: World, id: string | undefined) =>
    id ? objectBase(state, id, geometry)?.x : undefined;
  const place = (name: string) => {
    const at = set.places?.[name];
    return at ? surfaceAt(geometry, at.piece, at.dx)?.x : undefined;
  };
  switch (cue.do) {
    case "take":
      return base(world, cue.what);
    case "put":
      return base(after, cue.what);
    case "dip":
    case "pour":
    case "shake":
    case "dry":
      return base(world, cue.to);
    case "ladle":
      return base(world, cue.from);
    case "peel":
    case "chop":
      return base(world, cue.what);
    case "switch":
      return cue.what ? geometry.pieceX(cue.what) : undefined;
    case "wash":
    case "fill":
      return place(cue.to ?? "basin");
    default:
      return undefined;
  }
}
