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
  heldBy,
  isActed,
  opening,
  startWorld,
  type ActedLine,
  type Cue,
  type ObjectKind,
  type World,
} from "$lib/stick-figure/acts";
import { PLACES, type PlaceSet } from "$lib/stick-figure/places";
import { HEAD_RADIUS, STICK_BOX, solveRig, type Point } from "$lib/stick-figure/rig";
import { REST_POSE } from "$lib/stick-figure/pose";
import {
  DESK_REACH,
  OBJECT_SIZE,
  OPENING,
  SINK,
  handOverY,
  intoDeskMic,
  isSink,
  objectBase,
  pieceSize,
  objectGrip,
  placePieces,
  spotAt,
  stagePoint,
  surfaceAt,
  tipFromHand,
  type SetGeometry,
  type StageContext,
} from "$lib/stick-figure/set-pieces";
import {
  motionFor,
  motionMisses,
  sampleMotion,
  type Motion,
  type Opening,
  type Surroundings,
} from "$lib/stick-figure/act-motions";
import type { Hand } from "$lib/stick-figure/reach";
import type { Facing } from "$lib/stick-figure/staging";
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
/** A chair's back and seat front from its middle (StickFurniture.svelte), facing +x. */
const CHAIR = { back: 13.5, front: 11 };
/** Half a standing figure's width, its hands resting at its sides. */
const BODY = 9;
/** Two heads with their hair, in rig units: centres closer than this touch. */
const HEADS = 30;
/** From the hip to the middle of the head, which a lean swings forward. */
const HEAD_ABOVE_HIP = 45.5;
/** Someone stood more than this inside a walk, in rig units, is passed, not stopped beside (StickStage's PASS_CLEAR). */
const PASS_CLEAR = 20;
/** Two things set down on one surface may touch by this much, in rig units, before one sits in the other. */
const OVERLAP_SLACK = 2;
/** A hand, about 2 rig units across the knuckles, by the desk mic. */
const HAND_HALF = 1;
/** Into the desk mic by this much, about 3 px on a wide stage, nobody sees it. */
const MIC_SLACK = 1;
/** How often a motion is sampled for what crosses the mic. */
const MIC_SAMPLE_MS = 50;
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

  /** What a person standing at cast x `x` would stand in: a chair, or the strip behind a table people sit at. */
  const furnitureAt = (x: number): string | undefined => {
    for (const [index, seat] of seats.entries()) {
      if (frame.desk) break;
      const middle = seat.x / unit;
      const [back, front] = [
        middle - CHAIR.back * seat.facing,
        middle + CHAIR.front * seat.facing,
      ];
      const [left, right] = back < front ? [back, front] : [front, back];
      if (x > left - BODY && x < right + BODY)
        return `${Math.round(Math.min(Math.abs(x - left), Math.abs(x - right)))} rig units into chair ${index}`;
    }
    if (frame.desk && seats.length) {
      const [left, right] = [
        seats[0].x / unit - DESK_REACH,
        seats[seats.length - 1].x / unit + DESK_REACH,
      ];
      if (x > left - BODY && x < right + BODY)
        return `${Math.round(Math.min(Math.abs(x - left), Math.abs(x - right)) + BODY)} rig units behind the desk's end`;
    }
    for (const piece of set.pieces) {
      if (piece.kind !== "table" || !piece.front) continue;
      const middle = geometry.pieceX(piece.id);
      if (middle === undefined) continue;
      const half = pieceSize(piece).width / 2;
      if (Math.abs(x - middle) < half + BODY / 2)
        return `behind the ${piece.id}, between it and its chairs`;
    }
    return undefined;
  };

  /** The way `who` faces there: their spot's, their chair's or desk seat's, then round to what the cue works on. */
  const facingFor = (world: World, who: LessonCharacterId, toward?: string): Facing => {
    const spot = world.spots[who];
    const at = spot ? set.spots?.[spot] : undefined;
    const index = frame.cast.indexOf(who);
    let facing: Facing =
      at && "chair" in at
        ? (seats[at.chair]?.facing ?? 1)
        : spot
          ? (spotAt(set, geometry, spot, castX)?.facing ?? 1)
          : frame.desk && index !== -1
            ? (seats[index]?.facing ?? 1)
            : 1;
    const middle = standsAt(world, who);
    const x = toward
      ? stagePoint(stageContext(world), toward, "base", facing)?.x
      : undefined;
    if (x !== undefined && middle !== undefined && Math.abs(x - middle) >= 6)
      facing = x > middle ? 1 : -1;
    return facing;
  };
  const stageContext = (world: World): StageContext => ({
    world,
    set,
    geometry,
    castX,
    middleOf: (name) =>
      frame.cast.includes(name as LessonCharacterId)
        ? standsAt(world, name as LessonCharacterId)
        : undefined,
    seatX: (chair) => seats[chair] && seats[chair].x / unit,
  });

  /** What a cue's motion for `mover` reaches toward, in their rig space as they face for it. */
  const surroundings = (
    world: World,
    after: World,
    mover: LessonCharacterId,
    cue: Cue,
    toward?: string,
  ): { around: Surroundings; facing: Facing } | undefined => {
    const centre = standsAt(world, mover);
    if (centre === undefined) return undefined;
    const facing = facingFor(world, mover, toward);
    const context = stageContext(world);
    const toRig = (point: Point): Point => ({
      x: (point.x - centre) * facing,
      y: point.y,
    });
    const around: Surroundings = {
      pointOf: (name, as = "grip") => {
        const point = stagePoint(context, name, as, facing);
        return point && toRig(point);
      },
      meetWith: (other) => {
        const there = standsAt(world, other);
        return there === undefined
          ? undefined
          : toRig({
              x: (centre + there) / 2,
              y: handOverY(world, geometry, centre, there),
            });
      },
      landing: () => {
        const grip = cue.what && objectGrip(after, cue.what, geometry, facing);
        return grip ? toRig(grip) : undefined;
      },
    };
    return { around, facing };
  };

  /** Where the hands of `who` go and what they hold land, on the stage as the cue finds it. */
  const contactMisses = (
    world: World,
    after: World,
    who: LessonCharacterId,
    cue: Cue,
  ): string[] => {
    const middle = standsAt(world, who);
    if (middle === undefined || cue.on === "dark") return [];
    const { motion, partner } = motionFor(cue, who, world, set);
    const check = (
      mover: LessonCharacterId,
      moves: Motion,
      toward?: string,
    ): string[] => {
      const seen = surroundings(world, after, mover, cue, toward);
      if (!seen) return [];
      const { around } = seen;
      const held = heldBy(world, mover);
      const holding: Partial<Record<Hand, ObjectKind>> = {
        lead: held.lead ? world.objects[held.lead]?.kind : undefined,
        rear: held.rear ? world.objects[held.rear]?.kind : undefined,
      };
      const openingOf = (name: string): Opening | undefined => {
        const kind = world.objects[name]?.kind;
        // A sink is only stood in, by a pot to fill: nothing dips down to a depth in it.
        const sink = !kind && isSink(set, geometry, name);
        const size = kind
          ? OPENING[kind]
          : sink
            ? { half: SINK.half, depth: 0 }
            : undefined;
        const top = around.pointOf(name, "top");
        return size && top ? { top, ...size } : undefined;
      };
      const sit =
        world.seated?.includes(mover) || (frame.desk && !world.spots[mover]) ? 1 : 0;
      return motionMisses(moves, around, holding, openingOf, sit);
    };
    return [
      ...check(who, motion, motion.face ?? cue.what),
      ...(partner ? check(partner.who, partner.motion, partner.motion.face) : []),
    ];
  };

  /** Whose head a lean of `who` brings within touching of their own, and how close. */
  const headClashes = (world: World, who: LessonCharacterId, cue: Cue): string[] => {
    const middle = standsAt(world, who);
    if (middle === undefined || cue.on === "dark") return [];
    const { motion } = motionFor(cue, who, world, set);
    const lean = Math.max(0, ...motion.keys.map((key) => key.body?.lean ?? 0));
    if (lean < 3) return [];
    const facing = facingFor(world, who, motion.face ?? cue.what);
    const head = middle + facing * Math.sin((lean * Math.PI) / 180) * HEAD_ABOVE_HIP;
    return frame.cast.flatMap((other) => {
      if (other === who || world.out?.includes(other)) return [];
      const there = standsAt(world, other);
      if (there === undefined) return [];
      const apart = Math.abs(head - there);
      return apart < HEADS && apart < Math.abs(middle - there)
        ? [
            `${who} leans ${lean}° toward ${other}: heads ${Math.round(apart)} apart, and they touch under ${HEADS}`,
          ]
        : [];
    });
  };

  /** The desk seat `who` sits at with a mic in front of them, if they do. */
  const deskSeat = (world: World, who: LessonCharacterId) => {
    if (!frame.desk || world.out?.includes(who)) return undefined;
    const spot = world.spots[who];
    if (!spot) return seats[frame.cast.indexOf(who)];
    const at = set.spots?.[spot];
    return at && "chair" in at ? seats[at.chair] : undefined;
  };

  /** What of a seated host's goes into their desk mic over a cue: the head, a hand, what a hand holds. */
  const micClashes = (
    world: World,
    after: World,
    who: LessonCharacterId,
    cue: Cue,
  ): string[] => {
    if (!frame.desk || cue.on === "dark" || MOVES.has(cue.do)) return [];
    const { motion, partner } = motionFor(cue, who, world, set);
    const check = (
      mover: LessonCharacterId,
      moves: Motion,
      toward?: string,
    ): string[] => {
      const seat = deskSeat(world, mover);
      const seen = seat && surroundings(world, after, mover, cue, toward);
      if (!seat || !seen) return [];
      // The mic stays on the seat's side: a host turned round has it behind them.
      const side = (seat.facing * seen.facing) as Facing;
      const into = (point: Point, half: number) => intoDeskMic(point, half, side);
      const kind = (hand: "lead" | "rear") =>
        [world, after]
          .map((at) => {
            const id = heldBy(at, mover)[hand];
            return id ? at.objects[id]?.kind : undefined;
          })
          .find(Boolean);
      // As the stage plays it: the motion steers round the mic it knows about.
      const around: Surroundings = {
        ...seen.around,
        mic: { side, held: { lead: kind("lead"), rear: kind("rear") } },
      };
      const first = new Map<string, { at: number; depth: number }>();
      const note = (what: string, at: number, depth: number) => {
        if (depth > MIC_SLACK && !first.has(what)) first.set(what, { at, depth });
      };
      for (let at = 0; at <= moves.ms; at += MIC_SAMPLE_MS) {
        const moment = sampleMotion(moves, at, REST_POSE, around, 1);
        const rig = solveRig(moment.pose, 1);
        note("head", at, into(rig.head, HEAD_RADIUS));
        const held = heldBy(at < (moves.takes ?? moves.ms) ? world : after, mover);
        for (const hand of ["lead", "rear"] as const) {
          const end = rig[hand === "lead" ? "leadArm" : "rearArm"].end;
          note(`${hand} hand`, at, into(end, HAND_HALF));
          const id = held[hand];
          const kind = id && (world.objects[id] ?? after.objects[id])?.kind;
          if (!kind) continue;
          const tip = tipFromHand(kind, moment.turn[hand] ?? 0);
          const along = [0.25, 0.5, 0.75, 1].map((t) =>
            into({ x: end.x + tip.x * t, y: end.y + tip.y * t }, 0),
          );
          note(id, at, Math.max(...along));
        }
      }
      return [...first].map(
        ([what, { at, depth }]) =>
          `${mover}'s ${what} goes ${depth.toFixed(1)} rig units into the desk mic ${at} ms in`,
      );
    };
    return [
      ...check(who, motion, motion.face ?? cue.what),
      ...(partner ? check(partner.who, partner.motion, partner.motion.face) : []),
    ];
  };

  const layout = startWorld(set.objects);
  /** Whether `id` stands where the set lays it out: there, overlapping its neighbour is drawn on purpose, one in front of the other. */
  const laidOut = (world: World, id: string): boolean => {
    const [was, now] = [layout.objects[id]?.where, world.objects[id]?.where];
    return (
      !!was &&
      !!now &&
      "on" in was &&
      "on" in now &&
      was.on === now.on &&
      was.dx === now.dx
    );
  };

  let world = opening(lines, start ?? layout);
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
      for (const clash of headClashes(world, who, cue)) {
        findings.push({
          rule: "space/heads",
          level: "error",
          ...at,
          message: `${clash}. Stand further off, or lean less.`,
        });
      }
      for (const clash of micClashes(world, after, who, cue)) {
        findings.push({
          rule: "space/mic",
          level: "error",
          ...at,
          message: `${who} "${cue.do} ${cue.what ?? cue.to ?? ""}": ${clash}. Keep clear of it: the outer hand, a path below it, or sitting back.`,
        });
      }
      for (const [id, state] of Object.entries(after.objects)) {
        const where = state.where;
        if (!("on" in where) || world.objects[id]?.where === where) continue;
        for (const [other, there] of Object.entries(after.objects)) {
          const near = there.where;
          if (other === id || !("on" in near) || near.on !== where.on) continue;
          if (laidOut(after, id) && laidOut(after, other)) continue;
          const overlap =
            (OBJECT_SIZE[state.kind].width + OBJECT_SIZE[there.kind].width) / 2 -
            Math.abs(where.dx - near.dx);
          if (overlap <= OVERLAP_SLACK) continue;
          findings.push({
            rule: "props/overlap",
            level: "error",
            ...at,
            message: `${who} "${cue.do} ${cue.what ?? ""}" leaves the ${id} ${Math.round(overlap)} rig units over the ${other} on the ${where.on} (dx ${where.dx} and ${near.dx}). Put it where the surface is clear.`,
          });
        }
      }
      for (const miss of contactMisses(world, after, who, cue)) {
        findings.push({
          rule: "contact/miss",
          level: "error",
          ...at,
          message: `${who} "${cue.do} ${cue.what ?? cue.to ?? ""}": ${miss}.`,
        });
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
      const blocked =
        there !== undefined && !after.seated?.includes(who)
          ? furnitureAt(there)
          : undefined;
      if (blocked) {
        findings.push({
          rule: "space/furniture",
          level: "error",
          ...at,
          message: `${who} stands at ${after.spots[who]}, ${blocked}. A standing spot is clear of the table and its chairs.`,
        });
      }
      const walked = from !== undefined && !world.out?.includes(who) && cue.on !== "dark";
      for (const other of there === undefined || !walked ? [] : frame.cast) {
        if (other === who || after.out?.includes(other)) continue;
        const near = standsAt(after, other);
        const [left, right] = from! < there! ? [from!, there!] : [there!, from!];
        if (near === undefined || near < left + PASS_CLEAR || near > right - PASS_CLEAR)
          continue;
        findings.push({
          rule: "space/passing",
          level: "review",
          ...at,
          message: `${who} walks past ${other} (${after.spots[other] ?? "their mark"}) and steps toward the camera to pass in front. Check the pass reads as a step round them, not through.`,
        });
      }
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
