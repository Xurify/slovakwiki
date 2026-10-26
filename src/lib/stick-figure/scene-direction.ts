import { LOOKS } from "./looks";
import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { StickGestureId } from "./gestures";
import { planLine, type LinePlan } from "./line-plan";
import { readLines, type StageLine } from "./line-reading";
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
 * ear, through their goodbye. Anyone else on stage speaking ends it.
 */
function callers(
  lines: readonly DirectedLine[],
  cast: readonly LessonCharacterId[],
): Array<LessonCharacterId | undefined> {
  const on: Array<LessonCharacterId | undefined> = lines.map(() => undefined);
  lines.forEach((line, start) => {
    const answers = line.characterId;
    if ((line.ring !== "call" && line.ring !== "dial") || !answers) return;
    if (!cast.includes(answers)) return;

    let end = start;
    for (let index = start + 1; index < lines.length; index += 1) {
      const next = lines[index];
      if (next.overPhone) end = index;
      else if (next.characterId !== answers) break;
    }
    // The goodbye after the far end's last line is said into the phone too.
    while (lines[end + 1]?.characterId === answers && !lines[end + 1].overPhone) end += 1;
    for (let index = start; index <= end; index += 1) on[index] = answers;
  });
  return on;
}

export function directScene(
  lines: readonly DirectedLine[],
  setting: StageSetting,
  order?: readonly LessonCharacterId[],
  carried: CastProps = {},
): SceneDirection {
  const cast = castFor(lines, setting, order);
  const { atMarks, things } = PLACES[setting];
  const read = readLines(lines, cast, things);
  const calls = callers(lines, cast);
  const walkingIn = Object.fromEntries(
    Object.entries(carried).filter(([id]) => cast.includes(id as LessonCharacterId)),
  );
  const held = heldProps(read, walkingIn).map((props, index) => {
    const caller = calls[index];
    const withCall = caller ? { ...props, [caller]: "phone" as const } : props;
    // A robot is its own phone: it never takes one out, to call or to show.
    return Object.fromEntries(
      Object.entries(withCall).filter(
        ([id, prop]) => !(prop === "phone" && LOOKS[id as LessonCharacterId].robot),
      ),
    ) as typeof withCall;
  });
  // What the scene has named so far, which a bare tamten can point back at.
  const named: NamedThing[] = [];

  const directed = read.map((line, index): LineDirection => {
    const { characterId, gives, props, shownBy, slovak, takes } = line;
    const prop = shownBy ? held[index][shownBy] : undefined;
    const points = characterId
      ? linePoints(
          slovak,
          things,
          shownBy && prop ? { holder: shownBy, prop } : undefined,
          named,
        )
      : [];
    for (const { target } of points) {
      if (target.kind === "thing") named.push({ copy: target.copy, id: target.id });
    }

    const staging = stageLine(read, index, cast, things, points);
    const { gestures, mouth, said, vowels } = lines[index];
    return {
      handed:
        characterId && gives ? handOver(held[index], characterId, gives) : undefined,
      held: held[index],
      plan: planLine(slovak, {
        // Reaching for what is handed over comes before anything the words pick.
        gestures: gesturesWithProps(
          props,
          takes ? ["show", ...(gestures ?? []).slice(1)] : gestures,
        ),
        lips: vowels ? decodeVowelTrack(vowels) : undefined,
        points,
        said,
        track: mouth ? decodeMouthTrack(mouth) : undefined,
      }),
      props,
      staging: atMarks ? { ...staging, approach: undefined, goTo: undefined } : staging,
      ...(calls[index] ? { call: calls[index] } : {}),
    };
  });

  return { cast, lines: directed, things };
}
