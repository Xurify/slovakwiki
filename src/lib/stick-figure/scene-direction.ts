import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import { planLine, type LinePlan } from "./line-plan";
import { readLines, type StageLine } from "./line-reading";
import { cueActor, isActed } from "./acts";
import { decodeMouthTrack, decodeVowelTrack } from "./mouth-track";
import {
  gesturesWithProps,
  handOver,
  heldProps,
  type CastProps,
  type StickPropId,
} from "./props";
import { PLACES } from "./places";
import { linePoints, type NamedThing } from "./scene-points";
import type { StageSetting } from "./stage-setting";
import { stageLine, type LineStaging } from "./staging";
import type { SceneThing } from "./thing-words";

export interface DirectedLine extends StageLine {
  gestures?: StickGestureId[];
  /** Loudness track of the clip, encoded (`content/audio/mouth.json`). */
  mouth?: string;
  /** The clip's text, when it marks pauses the line does not show. */
  said?: string;
  /** The clip; without one the line runs on its text timing. */
  src?: string;
  /** Aligned vowel per mouth frame, encoded. */
  vowels?: string;
}

/** What the stage does while one line plays. */
export interface LineDirection {
  /** What everyone holds once the line ends, when it gives something away. */
  handed?: CastProps;
  /** What each figure holds while the line plays. */
  held: CastProps;
  plan: LinePlan;
  /** The prop each sentence brings out. */
  props: Array<StickPropId | undefined>;
  staging: LineStaging;
  /** Who holds the phone to their ear while this line plays: a call is on. */
  call?: LessonCharacterId;
}

/** Everything the stage does with a scene, worked out once from its lines. */
export interface SceneDirection {
  cast: LessonCharacterId[];
  lines: LineDirection[];
  things: readonly SceneThing[];
}

/**
 * Everyone on stage in the order they first speak, or in `order` where it
 * names them, so a series keeps its hosts in their places; staff go last,
 * by their counter on the right.
 */
export function castFor(
  lines: readonly StageLine[],
  setting: StageSetting,
  order: readonly LessonCharacterId[] = [],
): LessonCharacterId[] {
  // Someone heard only over the phone is not on stage.
  const speakers = [
    ...new Set(
      lines.flatMap(({ characterId, overPhone }) =>
        characterId && !overPhone ? [characterId] : [],
      ),
    ),
  ];
  const cast = [
    ...order.filter((id) => speakers.includes(id)),
    ...speakers.filter((id) => !order.includes(id)),
  ];
  const staff = PLACES[setting].staff ?? [];
  return [
    ...cast.filter((id) => !staff.includes(id)),
    ...cast.filter((id) => staff.includes(id)),
  ];
}

/**
 * Who is on the phone during each line: from the line that answers a ringing
 * call to the last line said over it, the one who answered holds it to their
 * ear, through their goodbye, whoever else in the room joins in.
 */
function callers(
  lines: readonly DirectedLine[],
  cast: readonly LessonCharacterId[],
): Array<LessonCharacterId | undefined> {
  const on: Array<LessonCharacterId | undefined> = lines.map(() => undefined);
  lines.forEach((line, start) => {
    const answers = line.characterId;
    if (line.ring !== "call" || !answers || !cast.includes(answers)) return;

    // Someone else in the room may say something into the call ("Nech príde."); it lasts to the far end's last line.
    let end = start;
    for (let index = start + 1; index < lines.length; index += 1) {
      const next = lines[index];
      if (next.ring) break;
      if (next.overPhone) end = index;
    }
    // The goodbye after the far end's last line is said into the phone too.
    while (lines[end + 1]?.characterId === answers && !lines[end + 1].overPhone) end += 1;
    for (let index = start; index <= end; index += 1) on[index] = answers;
  });
  return on;
}

/** What a line's staging keeps in a scene acted from cues: who it is said to, and their reactions. The cues do the rest. */
/**
 * Which acted lines their speaker says into a phone: any line from the one
 * with their `call` cue to the one with their `hangup`.
 */
function intoPhone(lines: readonly StageLine[]): boolean[] {
  const calling = new Set<LessonCharacterId>();
  return lines.map(({ act, characterId }) => {
    let phoned = characterId ? calling.has(characterId) : false;
    for (const cue of act ?? []) {
      const who = cueActor(cue, characterId ?? null);
      if (!who || (cue.do !== "call" && cue.do !== "hangup")) continue;
      if (cue.do === "call") calling.add(who);
      else calling.delete(who);
      if (who === characterId) phoned = true;
    }
    return phoned;
  });
}

function actedStaging(staging: LineStaging): LineStaging {
  const { addressee, audience, facing, reactions } = staging;
  return { addressee, audience, facing, reactions };
}

export function directScene(
  lines: readonly DirectedLine[],
  setting: StageSetting,
  order?: readonly LessonCharacterId[],
): SceneDirection {
  const cast = castFor(lines, setting, order);
  const { atMarks, things } = PLACES[setting];
  const pointable = things.filter((thing) => !thing.quiet);
  const read = readLines(lines, cast, pointable);
  // Acted from cues, the cues alone move people and props: nothing comes out because a word was said.
  const acted = isActed(lines);
  const calls = acted ? [] : callers(lines, cast);
  const phoned = acted ? intoPhone(lines) : [];
  const held = heldProps(read).map((props, index) => {
    if (acted) return {};
    const caller = calls[index];
    return caller ? { ...props, [caller]: "phone" as const } : props;
  });
  // What the scene has named so far, which a bare tamten can point back at.
  const named: NamedThing[] = [];

  const directed = read.map((line, index): LineDirection => {
    const { characterId, gives, props, shownBy, slovak, takes } = line;
    const prop = shownBy ? held[index][shownBy] : undefined;
    const points =
      characterId && !acted
        ? linePoints(
            slovak,
            pointable,
            shownBy && prop ? { holder: shownBy, prop } : undefined,
            named,
          )
        : [];
    for (const { target } of points) {
      if (target.kind === "thing") named.push({ copy: target.copy, id: target.id });
    }

    const fromWords = stageLine(read, index, cast, pointable, points);
    const staging = acted ? actedStaging(fromWords) : fromWords;
    const { gestures, mouth, said, vowels } = lines[index];
    return {
      handed:
        characterId && gives && !acted
          ? handOver(held[index], characterId, gives)
          : undefined,
      held: held[index],
      plan: planLine(slovak, {
        // Reaching for what is handed over comes before anything the words pick.
        gestures: acted
          ? gestures
          : gesturesWithProps(
              props,
              takes ? ["show", ...(gestures ?? []).slice(1)] : gestures,
            ),
        lips: vowels ? decodeVowelTrack(vowels) : undefined,
        phone: phoned[index],
        points,
        said,
        track: mouth ? decodeMouthTrack(mouth) : undefined,
      }),
      props: acted ? [] : props,
      staging: atMarks ? { ...staging, approach: undefined, goTo: undefined } : staging,
      ...(calls[index] ? { call: calls[index] } : {}),
    };
  });

  return { cast, lines: directed, things };
}
