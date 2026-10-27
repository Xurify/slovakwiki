<script lang="ts">
  import { untrack, type ComponentProps } from "svelte";
  import { cubicInOut, sineIn } from "svelte/easing";
  import { Tween } from "svelte/motion";

  import AudioButton from "$lib/audio/AudioButton.svelte";
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { nounGenderLabel } from "$lib/catalog/types";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import {
    playStoryLineAudio,
    stopStoryLineAudio,
    storyAudioClock,
  } from "$lib/lesson-story/story-audio";
  import {
    gestureDuration,
    gesturePeak,
    type StickGestureId,
  } from "$lib/stick-figure/gestures";
  import {
    gesturePlan,
    planLine,
    reactionPlan,
    type LineBeat,
    type LinePlan,
    type PointTarget,
  } from "$lib/stick-figure/line-plan";
  import { decodeMouthTrack, decodeVowelTrack } from "$lib/stick-figure/mouth-track";
  import { TURN_MS, turnDelays, type TurnDelays } from "$lib/stick-figure/turns";
  import type { SpeechClock } from "$lib/stick-figure/performance";
  import { REST_POSE, easeInOut, lerpPose, type StickPose } from "$lib/stick-figure/pose";
  import { GROUND_Y, STICK_BOX, solveRig, type Point } from "$lib/stick-figure/rig";
  import type { DirectedLine, SceneDirection } from "$lib/stick-figure/scene-direction";
  import {
    aimAt,
    backdropToStage,
    figureToStage,
  } from "$lib/stick-figure/backdrop-geometry";
  import { demonstrativeForm } from "$lib/learning/demonstratives/paradigm";
  import { LOOKS } from "$lib/stick-figure/looks";
  import { PLACES, backdropAlign, thingsIn } from "$lib/stick-figure/places";
  import {
    boxCenter,
    isPlural,
    isProperName,
    litKey,
    pointedThing,
    slotOf,
    thingBoxes,
    thingCenter,
    withDrawn,
    type ThingBox,
  } from "$lib/stick-figure/thing-words";
  import { dressFor, type Dress } from "$lib/stick-figure/dress";
  import type { Held } from "$lib/stick-figure/props";
  import { DAYTIME, type SceneMood } from "$lib/stick-figure/scene-mood";
  import {
    blockingBefore,
    endLine,
    seatedFacings,
    startLine,
    type Blocking,
  } from "$lib/stick-figure/stage-blocking";
  import {
    FLOOR,
    beside,
    markOf,
    offStage,
    onSeat,
    stageFrame,
    stageX,
    standing,
    walkOns,
    type Offsets,
  } from "$lib/stick-figure/stage-frame";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import { restFacing, type CastFacing, type Facing } from "$lib/stick-figure/staging";
  import { playSteps, playTramCue, stopCues } from "$lib/stick-figure/ambience";
  import type { TramState } from "$lib/stick-figure/street";
  import {
    CHAIR_OUT,
    SCOOT_MS,
    sitMs,
    stepMs,
    stepsFor,
    walkDuration,
  } from "$lib/stick-figure/walk";
  import { cx } from "$lib/ui/classes";
  import StickBackdrop from "./StickBackdrop.svelte";
  import StickWeather from "./StickWeather.svelte";
  import StickFigureActor from "./StickFigureActor.svelte";
  import StickFurniture from "./StickFurniture.svelte";
  import StickLeash from "./StickLeash.svelte";
  import StickProp from "./StickProp.svelte";
  import StickSet from "./StickSet.svelte";
  import type { ObjectLook } from "./StickSetObject.svelte";
  import {
    BOARD_CARRYING,
    CARRYING,
    CLOSE_DOOR,
    OPEN_DOOR,
    sampleMotion,
    type Effect,
    type Motion,
    type Surroundings,
  } from "$lib/stick-figure/act-motions";
  import {
    TWO_HANDED,
    WIDE,
    applyCue,
    contents,
    cueActor as actorOfCue,
    cueEntrances,
    heldBy as heldIn,
    isActed,
    startWorld,
    worlds,
    type Cue,
    type ObjectKind,
    type World,
  } from "$lib/stick-figure/acts";
  import {
    leadTime,
    leadingCount,
    scheduleCues,
    type LineTimes,
    type ScheduledCue,
  } from "$lib/stick-figure/act-schedule";
  import {
    AJAR,
    DOORS,
    DOOR_OPEN_MS,
    DOOR_SHUT_MS,
    HANDLE,
    doorPoint,
  } from "$lib/stick-figure/door";
  import { playFoley } from "$lib/stick-figure/foley";
  import type { Hand } from "$lib/stick-figure/reach";
  import {
    OBJECT_SIZE,
    OPENING,
    SINK,
    handOverY,
    isSink,
    objectGrip,
    pieceSize,
    placePieces,
    spotAt,
    stagePoint,
    type SetGeometry,
    type StageContext,
  } from "$lib/stick-figure/set-pieces";
  import { foldLine } from "$lib/stick-figure/slovak-text";
  import StudioDesk from "./StudioDesk.svelte";

  interface ActorState {
    cue: number;
    plan?: LinePlan;
    talking: boolean;
  }

  let {
    class: className = "",
    direction,
    found = [],
    lines,
    mood = DAYTIME,
    onthing,
    setting,
    start,
    thingWords = {},
  }: {
    class?: string;
    direction: SceneDirection;
    /** Things found in a game, ringed in green. */
    found?: readonly string[];
    lines: readonly DirectedLine[];
    mood?: SceneMood;
    /** Takes over a tap on a thing; without it the tap opens the thing's word card. */
    onthing?: (id: string) => void;
    setting: StageSetting;
    /** The set as an earlier segment in the same place left it. */
    start?: World;
    /** Dictionary link and clip for a thing's word, keyed by the word. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  const LIT_MS = 1600;
  /** A dog after a ball runs this many times as fast as anyone walks. */
  const RUN_PACE = 2.6;
  /** How long a thrown ball takes to leave the stage. */
  const THROW_MS = 700;
  /** Turning round to a chair, as far as a person gets before they start to lower. */
  const SIT_TURN_MS = TURN_MS * 0.7;
  /** Where StickDog draws the collar, in its rig space. */
  const DOG_COLLAR = { x: 12.8, y: 102 };
  const WALKING = new Set<Cue["do"]>(["go", "enter", "leave", "sit"]);
  /** Long enough to read a short line said in a bubble. */
  const BUBBLE_MS = 2800;
  const CARD_WIDTH = 232;
  /**
   * Passing someone, or the table and its chairs, a walker steps down and
   * grows a little, as a step nearer the camera would, and is drawn over
   * them. Less read as walking through them.
   */
  const PASS_LANE = 0.1;
  const PASS_SCALE = 1.07;
  /**
   * Whoever is passed makes room: a step back, away from the camera, up and
   * a little smaller. With the walker only a step nearer, at the floor's
   * edge, heads met and they read as walking through each other; at 0.14
   * back, the heads still lay one over the other as he went by.
   */
  const ROOM_LANE = -0.22;
  const ROOM_SCALE = 0.9;
  /**
   * Passing someone at the counter, who has no room to step back, the walker
   * goes as far toward the camera as the floor in front allows: at PASS_LANE
   * alone his head lay over hers.
   */
  const DEEP_LANE = 0.17;
  const DEEP_SCALE = 1.12;
  /** Half a body, in figure widths: overlapping a counter by this much, a step back would be into it. */
  const BODY_HALF = 0.15;
  /** Half a chair's width, in figure widths: StickFurniture draws one narrower than its box. */
  const CHAIR_HALF = 0.22;
  /** A seated host's point, degrees below level: the hand ends in under the desk mic, short of its boom (probed with solveRig). */
  const DESK_POINT_RISE = -30;
  /** The step back into line starts this long before the walk ends, and the lane's transition is about as long. */
  const PASS_MS = 350;
  /** Stopping beside someone, in figure widths, is not passing them: two bodies' widths, as the checks count it. */
  const PASS_CLEAR = 0.25;
  /** Where an arm leaves the body, and where a hand holds a prop out to show it, in rig space. */
  const SHOULDER: Point = { x: 0, y: solveRig(REST_POSE).leadShoulder.y };
  const SHOWN_HAND: Point = solveRig(gesturePeak("show")).leadArm.end;

  let actors = $state<Partial<Record<LessonCharacterId, ActorState>>>({});
  let facings = $state<CastFacing>({});
  /** Who is talking to the listeners, head turned to the front. */
  let front = $state<LessonCharacterId | undefined>();
  /** When each figure begins a turn: the speaker at once, the others a beat later. */
  let turns = $state<TurnDelays>({});
  let offsets = $state<Offsets>({});
  let seated = $state<Blocking["seated"]>({});
  /**
   * How far each chair stands drawn back from its place, in rig units: an
   * empty one out from the table, so whoever sits there steps in front of it
   * rather than stand wedged between it and the table.
   */
  const chairsOut = Array.from(
    { length: 6 },
    () => new Tween(CHAIR_OUT, { easing: cubicInOut }),
  );
  /** The chair someone walks to sit on, sits on, or has just got up from, so its pull moves them with it. */
  let perched = $state<Blocking["seated"]>({});
  let walks = $state<
    Partial<Record<LessonCharacterId, { cue: number; ms: number; pace?: number }>>
  >({});
  /** Who is on the move: drawn over whoever stands still, as they pass behind their back. */
  let striding = $state<LessonCharacterId[]>([]);
  /** Who walks past someone standing: a step toward the camera, so they pass in front, not through. */
  let passing = $state<LessonCharacterId[]>([]);
  /** Who passes someone with their back to the counter, so a step further toward the camera. */
  let passingDeep = $state<LessonCharacterId[]>([]);
  /** Who is being walked past, and steps back to make room. */
  let roomFor = $state<LessonCharacterId[]>([]);
  /** Who stands back in the doorway, or by the door to push it to, on its sill rather than in the room (`doorLane`). */
  let doorway = $state<LessonCharacterId[]>([]);
  /** A ball in the air, from the thrower's hand off the edge of the stage. */
  let flight = $state<{ cue: number; from: Point; to: Point }>();
  /** The line whose throw has left the thrower's hand. */
  let thrownAt = $state(-1);
  /** The line whose props are in hand: the one playing, or the last one played. */
  let heldAt = $state(-1);
  /** A line that gave something away and has ended, so it is in the new hand. */
  let handedAt = $state(-1);
  let lit = $state<string[]>([]);
  let picked = $state<string>();
  let cardHeight = $state(120);
  let board = $state<string>();
  let bubble = $state<{ characterId: LessonCharacterId; cue: number; text: string }>();
  let bubbleTimer = 0;
  let bubbleHeight = $state(0);
  let tram = $state<TramState>("away");
  /** Everyone has got on the tram, out of the weather. */
  let aboard = $state(false);
  let stageWidth = $state(0);
  let stageHeight = $state(0);
  /** The page has measured the stage, so marks and walk-ons are known. */
  const measured = $derived(stageWidth > 0 && stageHeight > 0);

  /** When each walk in flight ends, on the `performance.now()` clock. */
  let walkEndsAt: Partial<Record<LessonCharacterId, number>> = {};
  /** Never reset, so a figure's next walk always has a cue it has not seen. */
  let walkCount = 0;
  let playToken = 0;
  let lineTimer = 0;
  /** The line being said, for the clock the figures move to when no clip plays. */
  let spoken = { at: 0, durationMs: 0, rate: 1 };

  const resting = $derived(restFacing(direction.cast));
  /** The place's set, drawn whenever it has one. */
  const set = $derived(PLACES[setting].set);
  /** Acted from cues: then where anyone stands and what they hold comes from the cues alone. */
  const acted = $derived(isActed(lines));
  const stagings = $derived(direction.lines.map(({ staging }) => staging));
  const holding = $derived(
    (handedAt === heldAt ? direction.lines[heldAt]?.handed : undefined) ??
      direction.lines[heldAt]?.held ??
      {},
  );
  /** The weather on the cast: none indoors or once on the tram. */
  const dress = $derived(
    dressFor(
      PLACES[setting].outdoors && !aboard ? mood.weather : "clear",
      PLACES[setting],
    ),
  );
  /**
   * Each umbrella in hand, up or not. It comes out the way the weather on
   * its holder calls for; after that only foldUmbrellas() puts it down, when
   * the scene says so: everyone gets on the tram, or the story is over.
   */
  let umbrellas = $state<Partial<Record<LessonCharacterId, boolean>>>({});

  $effect(() => {
    const held = direction.cast.filter((id) => holding[id] === "umbrella");
    untrack(() => {
      umbrellas = Object.fromEntries(
        held.map((id) => [id, umbrellas[id] ?? dress.umbrellaUp]),
      );
    });
  });
  /** The scene's things as the stage shows them now: the sun only while it is out. */
  const fixedThings = $derived(thingsIn(direction.things, setting, mood));
  /** The set's things where they are drawn now, as the backdrop measures them. */
  let drawnAt = $state<Record<string, ThingBox | null>>({});
  const things = $derived(withDrawn(fixedThings, drawnAt));
  const entrances = $derived({
    ...walkOns(stagings),
    ...cueEntrances(lines, set),
  });
  const frame = $derived(
    stageFrame(direction.cast, entrances, setting, fixedThings, stageWidth, stageHeight),
  );
  /** Someone on a chair faces the way it does, whoever points or talks. */
  const sitting = $derived(seatedFacings(seated, frame));
  const pickedParsed = $derived.by(() => {
    if (!picked) return undefined;
    const [id, copyStr] = picked.split("#");
    const thing = things.find((candidate) => candidate.id === id);
    if (!thing) return undefined;
    const copy = copyStr !== undefined ? Number.parseInt(copyStr, 10) : 0;
    const box = thingBoxes(thing)[copy] ?? thing.box;
    return { thing, copy, box };
  });
  const pickedThing = $derived(pickedParsed?.thing);

  /** The world before each line, and after the last; a scene nobody acts keeps the one it starts with. */
  const actedWorlds = $derived.by((): World[] | undefined => {
    if (!set) return undefined;
    const first = start ?? startWorld(set.objects);
    if (!acted) return [first];
    try {
      return worlds(lines, set, first);
    } catch (error) {
      console.error(error);
      return [first];
    }
  });
  let world = $state.raw<World>();
  /** What each figure does on cue right now. */
  let acts = $state.raw<Partial<Record<LessonCharacterId, Act>>>({});
  /** Pieces whose tap runs, and what pours from a hand: water from a jug, salt. */
  let running = $state<string[]>([]);
  let pouring = $state<
    Partial<Record<LessonCharacterId, Partial<Record<Hand, Pick<Effect, "kind" | "to">>>>>
  >({});
  /** What glides along the surface it was pushed on, and over how long: a bag slid across the desk. */
  let gliding = $state<Record<string, number>>({});
  /** What each hand's tool is down in: a spoon in the pot, hidden under its rim. */
  let sunk = $state<Partial<Record<LessonCharacterId, Partial<Record<Hand, string>>>>>(
    {},
  );
  /** Who has swung round on their chair to do something: back to the chair's way once it is done. */
  let turned = $state<CastFacing>({});
  /** Who, seated, has turned their head to the front to look at something behind them. */
  let glancing = $state<LessonCharacterId[]>([]);
  /** The lights down while the story skips ahead. */
  let dimmed = $state(false);
  // While the story skips ahead the whole place shows, so the clock in its pool of light is never cut by a close shot.
  const shot = $derived(dimmed ? WIDE : (world?.camera ?? WIDE));
  /** How far the door has swung in, from 0 shut. */
  const doorSwing = new Tween(0);
  /** Who has not come in yet. */
  let outside = $state<LessonCharacterId[]>([]);
  /** In the doorway, the hall dark behind them. */
  let shaded = $state<LessonCharacterId[]>([]);
  /** When each figure is done with the cues it is on. */
  let busy: Partial<Record<LessonCharacterId, number>> = {};
  /** The cues of the line on stage, once started before its voice. */
  let leading: { index: number; at: number; cues: ScheduledCue[] } | undefined;
  /** When the last cue of the line playing is over. */
  let actsEnd = 0;
  let actTimers: number[] = [];
  /** How long a motion takes to take over from the one before it. */
  const TAKE_OVER_MS = 260;
  /** From the door opening to the one coming in stepping through it, as their hand leaves it (OPEN_DOOR). */
  const DOOR_MS = DOOR_OPEN_MS + 400;
  /** How long the door takes to swing open far enough to show whoever is pushing it, their face clear of its edge. */
  const DOOR_OPENING_MS = 560;
  /** Bumped when the stage stops or jumps, so cues still on the clock let go. */
  let actToken = 0;
  type ActorAct = ComponentProps<typeof StickFigureActor>["doing"];
  /** A motion running on a figure; `line` ones let go when the line is over. */
  type Act = NonNullable<ActorAct> & { line?: boolean };

  /** Px per rig unit: how big the cast is drawn. */
  const unit = $derived(frame.figureWidth / STICK_BOX.width);
  /** The stage in the cast's units, for the set drawn at their scale. */
  const castView = $derived.by(() => {
    const ground =
      stageHeight - FLOOR - (STICK_BOX.y + STICK_BOX.height - GROUND_Y) * unit;
    return {
      x: 0,
      y: GROUND_Y - ground / unit,
      width: stageWidth / unit,
      height: stageHeight / unit,
    };
  });

  /** A backdrop x in cast units. */
  function castX(x: number): number {
    return unit ? stageX(frame, { x, y: 0 }) / unit : 0;
  }

  function castY(y: number): number {
    const at = backdropToStage(
      { x: 0, y },
      stageWidth,
      stageHeight,
      backdropAlign(setting),
    );
    return unit ? castView.y + at.y / unit : 0;
  }

  /** Each piece's middle in cast units: the studio desk's between its seats. */
  const pieceXs = $derived.by(() => {
    if (!set || !unit) return new Map<string, number>();
    const { seats } = frame;
    const desk = seats.length
      ? (seats[0].x + seats[seats.length - 1].x) / 2 / unit
      : stageWidth / 2 / unit;
    return placePieces(set.pieces, (piece) =>
      piece.x !== undefined ? castX(piece.x) : piece.kind === "desk" ? desk : undefined,
    );
  });
  const geometry = $derived<SetGeometry>({
    pieces: set?.pieces ?? [],
    pieceX: (id) => pieceXs.get(id),
  });

  function facingOf(id: LessonCharacterId): Facing {
    return turned[id] ?? sitting[id] ?? facings[id] ?? resting[id] ?? 1;
  }

  /** A figure's left edge in cast units, where it stands now. */
  function castLeft(id: LessonCharacterId): number {
    return standing(markOf(frame, id), offsets[id]).left / unit;
  }

  function toRig(id: LessonCharacterId, point: Point): Point {
    const y = doorway.includes(id) ? point.y - doorLane : point.y;
    return { x: (point.x - castLeft(id) + STICK_BOX.x) * facingOf(id), y };
  }

  /**
   * From the room's floor up to the door's sill, the floor line of the wall
   * it is in, in cast units (negative, as up): whoever is in the doorway or
   * by the door stands on it, at the size they are in the room. Standing in
   * the room, in front of that wall, the handle was over their heads; drawn
   * smaller too, it was at their mouth.
   */
  const doorLane = $derived.by(() => {
    const door = DOORS[setting];
    return door && unit ? castY(door.top + door.height) - GROUND_Y : 0;
  });

  /** Where a figure's middle stands, in cast units. */
  function castMiddle(id: LessonCharacterId): number {
    return castLeft(id) - STICK_BOX.x;
  }

  function isCast(name: string | undefined): name is LessonCharacterId {
    return direction.cast.includes(name as LessonCharacterId);
  }

  function stageContext(at = world): StageContext {
    return {
      world: at,
      set,
      geometry,
      castX,
      middleOf: (name) => (isCast(name) ? castMiddle(name) : undefined),
      seatX: (chair) => {
        const seat = frame.seats[chair];
        return seat && seat.x / unit;
      },
    };
  }

  /** A named point of the stage in cast units (`stagePoint`), or a thing of the backdrop. */
  function castPoint(
    name: string,
    as: "grip" | "top" | "base",
    facing: Facing,
    state = world,
  ): Point | undefined {
    const door = DOORS[setting];
    if (name === "door-handle" && door) {
      const handle = doorPoint(door, doorSwing.current, HANDLE.u, HANDLE.v);
      return { x: castX(handle.x), y: castY(handle.y) };
    }
    const at = stagePoint(stageContext(state), name, as, facing);
    if (at) return at;
    // A dog's collar, where a lead clips on.
    if (isCast(name) && LOOKS[name].dog) {
      return { x: castMiddle(name) + facingOf(name) * DOG_COLLAR.x, y: DOG_COLLAR.y };
    }
    const pointed = pointedThing(things, name);
    const box = pointed && thingBoxes(pointed.thing)[pointed.copy ?? 0];
    if (!box) return undefined;
    const centre = boxCenter(box);
    return { x: castX(centre.x), y: castY(centre.y) };
  }

  function surroundings(id: LessonCharacterId, item?: ScheduledCue): Surroundings {
    return {
      pointOf: (name, as = "grip") => {
        // What the cue has just taken is where it was taken from, so the hand moves on from there rather than snapping to its side.
        const at =
          castPoint(name, as, facingOf(id)) ??
          (item && castPoint(name, as, facingOf(id), item.before));
        return at && toRig(id, at);
      },
      pointBefore: (name, as = "grip") => {
        const at = item && castPoint(name, as, facingOf(id), item.before);
        return at && toRig(id, at);
      },
      meetWith: (other) => {
        // Halfway, so each reaches and neither has to step in.
        const x = (castMiddle(id) + castMiddle(other)) / 2;
        const y = world
          ? handOverY(world, geometry, castMiddle(id), castMiddle(other))
          : 76;
        return toRig(id, { x, y });
      },
      landing: () => {
        const what = item?.cue.what;
        const at = what && objectGrip(item.after, what, geometry, facingOf(id));
        return at ? toRig(id, at) : undefined;
      },
      mic: deskMic(id, item?.before ?? world, item?.after),
    };
  }

  /**
   * The desk mic in front of a host in their seat at the studio desk, on the
   * side they face it from, with what each hand holds over the cue: what it
   * takes up as well as what it has.
   */
  function deskMic(
    id: LessonCharacterId,
    before: World | undefined,
    after: World | undefined,
  ): Surroundings["mic"] {
    if (!frame.desk || !before || before.spots[id] || before.out?.includes(id))
      return undefined;
    const seat = frame.seats[direction.cast.indexOf(id)];
    if (!seat) return undefined;
    const kind = (hand: Hand) =>
      [before, after].map((at) => {
        const held = at && heldIn(at, id)[hand];
        return held ? at.objects[held]?.kind : undefined;
      });
    return {
      side: seat.facing === facingOf(id) ? 1 : -1,
      held: {
        lead: kind("lead").find(Boolean),
        rear: kind("rear").find(Boolean),
      },
    };
  }

  /** Seated behind the studio desk, in a segment acted from cues or not. */
  function behindDesk(id: LessonCharacterId): boolean {
    if (!frame.desk || world?.spots[id] || world?.out?.includes(id)) return false;
    return frame.seats[direction.cast.indexOf(id)] !== undefined;
  }

  /** Where `id` stands for spot `to`, in figure widths from their mark, the way they face there, and the chair if it is one. */
  function spotOf(
    id: LessonCharacterId,
    to: string,
  ): { offset: number; facing: Facing; chair?: number } | undefined {
    const spot = set?.spots?.[to];
    if (spot && "chair" in spot) {
      const chair = frame.seats[spot.chair];
      return chair
        ? { offset: onSeat(frame, id, chair.x), facing: chair.facing, chair: spot.chair }
        : undefined;
    }
    const at = set && spotAt(set, geometry, to, castX);
    if (at) {
      const mark = markOf(frame, id);
      return {
        offset: (at.x * unit - (mark.left + mark.width / 2)) / mark.width,
        facing: at.facing,
      };
    }
    if (!isCast(to)) return undefined;
    const toward: Facing = castMiddle(to) >= castMiddle(id) ? 1 : -1;
    // A dog is a body length long: stopping as close as to a person stands on it.
    const gap = LOOKS[to].dog ? 1 : 0.62;
    return { offset: beside(frame, id, to, toward, offsets, gap), facing: toward };
  }

  /** How long `go`, `enter`, `leave` or `sit` takes `id`, from where `before` has them. */
  function walkMsFor(id: LessonCharacterId, cue: Cue, before: World): number {
    const was = before.spots[id];
    if (cue.do === "leave") {
      const from = (was ? spotOf(id, was)?.offset : undefined) ?? offsets[id] ?? 0;
      return walkDuration(
        stepsFor(offStage(frame, id, cue.to === "left" ? -1 : 1) - from),
        id,
      );
    }
    const from =
      cue.do === "enter"
        ? spotOf(id, set?.door ?? cue.from ?? "door")?.offset
        : ((was ? spotOf(id, was)?.offset : undefined) ?? offsets[id] ?? 0);
    const to = cue.to ? spotOf(id, cue.to)?.offset : undefined;
    const walk =
      from === undefined || to === undefined || Math.abs(to - from) < 0.05
        ? 0
        : walkDuration(stepsFor(to - from), id);
    const enter =
      cue.do === "enter" && set?.door
        ? DOOR_MS + TURN_MS * 0.6 + CLOSE_DOOR.ms + TURN_MS
        : 0;
    const sit =
      cue.do === "sit" ? SIT_TURN_MS + sitMs(id) + (frame.desk ? 0 : SCOOT_MS) : 0;
    return walk + enter + sit;
  }

  /** Which way `id` turns to reach `target`: an object, a piece, a person, a thing. */
  function faceToward(
    id: LessonCharacterId,
    target: string | undefined,
  ): Facing | undefined {
    if (!target) return undefined;
    const x = castPoint(target, "base", facingOf(id))?.x;
    if (x === undefined) return undefined;
    const middle = castMiddle(id);
    // Right by their feet (the towel at the counter's end), nobody turns round for it.
    if (Math.abs(x - middle) < 6) return undefined;
    return x > middle ? 1 : -1;
  }

  /** Run `then` in `ms`, unless the stage stops or jumps first. */
  function later(ms: number, then: () => void): void {
    const token = actToken;
    actTimers.push(
      window.setTimeout(
        () => {
          if (token === actToken) then();
        },
        Math.max(0, ms),
      ),
    );
  }

  /** Walk `id` to spot `to`, facing the way they go, then the way the spot does; onto its chair for `sit`. */
  /** Walk `id` off the stage by the `side` edge; once out of sight they are out. */
  function walkOff(id: LessonCharacterId, side: Facing): void {
    const to = offStage(frame, id, side);
    facings = { ...facings, [id]: side };
    walkTo(id, to);
    later(walkDuration(stepsFor(to - (offsets[id] ?? 0)), id), () => {
      outside = [...new Set([...outside, id])];
    });
  }

  function walkToSpot(id: LessonCharacterId, to: string | undefined, sit = false): void {
    const at = to ? spotOf(id, to) : undefined;
    if (!at) return;
    const from = offsets[id] ?? 0;
    const moves = Math.abs(at.offset - from) > 0.05;
    const walking = at.offset > from ? 1 : -1;
    if (moves) facings = { ...facings, [id]: walking };
    walkTo(id, at.offset);
    const there = moves ? walkDuration(stepsFor(at.offset - from), id) : 0;
    later(there, () => (facings = { ...facings, [id]: at.facing }));
    if (!sit || at.chair === undefined) return;
    // Back to the chair before lowering onto it: a bow begun mid-turn bends away from the table.
    const turned = moves && at.facing !== walking ? SIT_TURN_MS : 0;
    const chair = at.chair;
    perched = { ...perched, [id]: chair };
    later(there + turned, () => (seated = { ...seated, [id]: chair }));
    if (frame.desk) return;
    // Down on it, they scoot it in to the table under them.
    later(there + turned + sitMs(id), () => {
      void chairsOut[chair]?.set(0, { duration: SCOOT_MS });
      playFoley("chair");
    });
  }

  function chairOut(chair: number | undefined): number {
    return chair === undefined || frame.desk ? 0 : (chairsOut[chair]?.current ?? 0);
  }

  /** Each chair in or out as `seated` has it, at once. */
  function settleChairs(): void {
    const taken = Object.values(seated);
    for (const [index, chair] of chairsOut.entries())
      void chair.set(taken.includes(index) ? 0 : CHAIR_OUT, { duration: 0 });
    perched = { ...seated };
  }

  /**
   * The door swung open or shut. Shut, it speeds up to the end, so it
   * bumps into its frame under the hand pushing it rather than easing in.
   */
  function swingDoor(open: boolean): void {
    void doorSwing.set(
      open ? AJAR : 0,
      open
        ? { duration: DOOR_OPEN_MS, easing: cubicInOut }
        : { duration: DOOR_SHUT_MS, easing: sineIn },
    );
  }

  /** Down from by the door into the room, as they set off. */
  function stepDown(id: LessonCharacterId): void {
    if (doorway.includes(id)) doorway = doorway.filter((other) => other !== id);
  }

  /** `motion` on `id` from `start`, with its sounds. */
  function performHeard(id: LessonCharacterId, motion: Motion, start: number): void {
    perform(id, motion, start);
    for (const { at, id: sound } of motion.sounds ?? [])
      later(start + at - performance.now(), () => playFoley(sound));
  }

  /** On from the edge spot `from` (a park, a room with no door drawn), walking to `to`. */
  function walkOn(id: LessonCharacterId, from: string, to: string | undefined): void {
    const at = spotOf(id, from);
    const { [id]: _, ...still } = walks;
    walks = still;
    if (at) offsets = { ...offsets, [id]: at.offset };
    outside = outside.filter((other) => other !== id);
    walkToSpot(id, to);
  }

  /** In through the door: they push it open, step in past it, and push it to behind them. */
  function comeIn(id: LessonCharacterId, to: string | undefined, from?: string): void {
    if (!set?.door && from) return walkOn(id, from, to);
    const door = set?.door ?? "door";
    const at = spotOf(id, door);
    const { [id]: _, ...still } = walks;
    walks = still;
    if (at) {
      offsets = { ...offsets, [id]: at.offset };
      facings = { ...facings, [id]: at.facing };
    }
    // They stand back in the doorway, in the hall's shadow, a hand on the
    // handle from the click of the latch, and show once the door has swung
    // far enough: there at once, as a door opening shows someone, not faded
    // in. They stay back by the door to push it to, and step down into the
    // room on their next walk.
    swingDoor(true);
    shaded = [...shaded, id];
    doorway = [...doorway, id];
    performHeard(id, OPEN_DOOR, performance.now());
    later(DOOR_OPENING_MS, () => {
      outside = outside.filter((other) => other !== id);
    });
    later(DOOR_MS, () => {
      shaded = shaded.filter((other) => other !== id);
      const inside = to && to !== door ? spotOf(id, to) : undefined;
      if (!inside || !at) {
        swingDoor(false);
        later(DOOR_SHUT_MS, () => playFoley("door-shut"));
        return;
      }
      walkToSpot(id, to);
      // In, they turn to the door and push it to behind them, then face the room.
      const walk = walkDuration(stepsFor(inside.offset - at.offset), id);
      later(walk, () => {
        const handle = castPoint("door-handle", "grip", facingOf(id));
        const back: Facing = handle && handle.x < castMiddle(id) ? -1 : 1;
        facings = { ...facings, [id]: back };
        performHeard(id, CLOSE_DOOR, performance.now() + TURN_MS * 0.6);
        later(TURN_MS * 0.6 + CLOSE_DOOR.takes!, () => swingDoor(false));
        later(TURN_MS * 0.6 + CLOSE_DOOR.ms, () => {
          facings = { ...facings, [id]: inside.facing };
        });
      });
    });
  }

  function startCue(item: ScheduledCue): void {
    const { cue, who, motion } = item;

    // In the dark it simply happens: nobody is seen doing it.
    if (cue.on === "dark") {
      takeEffect(item);
      if (acts[who]) acts = { ...acts, [who]: undefined };
      placeSpots(world ?? item.after, [who]);
      if (carrying(who)) carry(who);
      return;
    }
    switch (cue.do) {
      case "camera":
        return;
      case "enter":
        comeIn(who, cue.to, cue.from);
        return;
      case "leave":
        walkOff(who, cue.to === "left" ? -1 : 1);
        return;
      case "go":
        stepDown(who);
        walkToSpot(who, cue.to);
        return;
      case "sit":
        stepDown(who);
        walkToSpot(who, cue.to, true);
        return;
      case "face": {
        const face = faceToward(who, cue.to);
        if (face) facings = { ...facings, [who]: face };
        return;
      }
      case "point": {
        // Acted, a thing of the backdrop lights up and draws the others' eyes only on its cue, not on its word.
        const pointed = cue.to ? pointedThing(things, cue.to) : undefined;
        if (pointed) {
          light(pointed.thing.id, pointed.copy);
          lookAt({ kind: "thing", id: pointed.thing.id, copy: pointed.copy });
        }
        break;
      }
      case "throw":
        later(motion.takes ?? 0, () => throwBall(who, facingOf(who), heldAt));
        break;
      case "slide": {
        const what = cue.what ?? "";
        gliding = { ...gliding, [what]: motion.glide ?? 0 };
        later((motion.takes ?? 0) + (motion.glide ?? 0) + 50, () => {
          const { [what]: _, ...rest } = gliding;
          gliding = rest;
        });
        break;
      }
      case "skip":
        dimmed = true;
        later(motion.ms, () => {
          dimmed = false;
        });
        break;
      case "stand": {
        const chair = seated[who];
        const rise = () => {
          const { [who]: _, ...rest } = seated;
          seated = rest;
          unturn(who);
        };
        // The chair pushed back first, then up off it: getting up wedged against the table read as rising through it.
        if (chair === undefined || frame.desk) rise();
        else {
          void chairsOut[chair]?.set(CHAIR_OUT, { duration: SCOOT_MS });
          later(SCOOT_MS, rise);
        }
        break;
      }
    }

    const face = faceToward(who, motion.face ?? cue.what);
    const handsFree = motion.keys.every((key) => !key.lead && !key.rear);
    const behind =
      face !== undefined && seated[who] !== undefined && face !== facingOf(who);
    let played = motion;
    if (behind && (handsFree || cue.do === "point")) {
      // Seated, a look behind is a turn of the head: the chair swung round with the legs read as sitting backwards.
      // A point back goes over the shoulder with the far hand.
      glancing = [...glancing.filter((other) => other !== who), who];
      if (!handsFree) played = overShoulder(motion);
    } else if (face && seated[who] !== undefined) turned = { ...turned, [who]: face };
    else if (face) facings = { ...facings, [who]: face };
    perform(who, played, item.start, item);
    for (const { at, id } of motion.sounds ?? []) later(at, () => playFoley(id));
    for (const effect of motion.effects ?? []) {
      later(effect.from, () => showEffect(who, effect, true));
      later(effect.until, () => showEffect(who, effect, false));
    }
    for (const contact of motion.contacts ?? []) {
      if ((contact.tip !== "in" && contact.tip !== "down") || !contact.to) continue;
      const into = contact.to;
      // From a little before the tip reaches the rim to a little after it leaves, so no frame shows it in front of the pot.
      // A pot stood in the sink is lifted over the worktop in the 400 ms either side, and is over it by then.
      const margin = contact.tip === "in" ? 200 : 300;
      later(contact.from - margin, () => sink(who, contact.hand, into));
      later(contact.until + margin, () => sink(who, contact.hand, undefined));
    }
  }

  /** A one-handed motion done with the rear hand instead, the eyes going back with it. */
  function overShoulder(motion: Motion): Motion {
    return {
      ...motion,
      keys: motion.keys.map(({ lead, sign, body, ...key }) => ({
        ...key,
        ...(lead ? { rear: lead } : {}),
        ...(sign?.lead ? { sign: { rear: sign.lead } } : {}),
        ...(body
          ? { body: { ...body, look: body.look === undefined ? undefined : -body.look } }
          : {}),
      })),
    };
  }

  function sink(id: LessonCharacterId, hand: Hand, into: string | undefined): void {
    sunk = { ...sunk, [id]: { ...sunk[id], [hand]: into } };
  }

  function showEffect(id: LessonCharacterId, effect: Effect, on: boolean): void {
    if (effect.kind === "tap") {
      const piece = set?.places?.[effect.piece ?? ""]?.piece ?? effect.piece ?? "";
      const at = running.indexOf(piece);
      running = on ? [...running, piece] : at === -1 ? running : running.toSpliced(at, 1);
      return;
    }
    if (!effect.hand) return;
    pouring = {
      ...pouring,
      [id]: {
        ...pouring[id],
        [effect.hand]: on ? { kind: effect.kind, to: effect.to } : undefined,
      },
    };
  }

  /** The world as `item` leaves it, played on the world as it is now: other people's cues may have come between. */
  function takeEffect(item: ScheduledCue): void {
    try {
      world = applyCue(world ?? item.before, item.who, item.cue, set);
    } catch {
      world = item.after;
    }
    // Put down the way it was held, so it does not flip round as the hand lets go.
    const put = item.cue.do === "put" ? world.objects[item.cue.what ?? ""] : undefined;
    if (put && world) {
      const turned = facingOf(item.who) === -1;
      if (Boolean(put.turned) !== turned) {
        world = {
          ...world,
          objects: { ...world.objects, [item.cue.what!]: { ...put, turned } },
        };
      }
    }
  }

  function perform(
    id: LessonCharacterId,
    motion: Motion,
    start: number,
    item?: ScheduledCue,
  ): void {
    const around = surroundings(id, item);
    // A new motion takes over from the one still going over a moment, so a spoon held out is handed over from where it is, not from a dropped arm.
    const previous = acts[id];
    const from = previous && performance.now() < previous.until ? previous : undefined;
    const act: Act = {
      line: motion.hold === "line",
      until: motion.hold ? Number.POSITIVE_INFINITY : start + motion.ms,
      sample: (now: number, base: StickPose, sit: number) => {
        const next = sampleMotion(motion, now - start, base, around, sit);
        // Over the motion's first move, so a hand already out goes straight to its next mark.
        const t = (now - start) / Math.max(TAKE_OVER_MS, motion.keys[1]?.at ?? 0);
        if (!from || t >= 1) return next;
        const was = from.sample(now, base, sit);
        return {
          ...next,
          pose: lerpPose(was.pose, next.pose, easeInOut(Math.max(0, t))),
        };
      },
    };
    acts = { ...acts, [id]: act };
    // Done: still holding the pot, the arms stay on its handles; turned on a chair, back round.
    if (!motion.hold) {
      later(start + motion.ms - performance.now(), () => {
        if (acts[id] !== act) return;
        if (carrying(id)) carry(id);
        unturn(id);
      });
    }
  }

  /** What `id` holds in both hands, if anything. */
  function carrying(id: LessonCharacterId): ObjectKind | undefined {
    if (!world) return undefined;
    return Object.values(world.objects).find(
      ({ kind, where }) =>
        "hand" in where && where.hand === id && TWO_HANDED.includes(kind),
    )?.kind;
  }

  function carry(id: LessonCharacterId): void {
    const hold = carrying(id) === "board" ? BOARD_CARRYING : CARRYING;
    perform(
      id,
      {
        ms: 1,
        hold: true,
        keys: [
          { at: 0, ...hold },
          { at: 1, ...hold },
        ],
      },
      performance.now(),
    );
  }

  /** Let go of what is held while the line is said: folded arms, a lean in. */
  function release(): void {
    for (const [id, act] of Object.entries(acts) as Array<
      [LessonCharacterId, Act | undefined]
    >) {
      if (act?.line)
        perform(id, { ms: 500, keys: [{ at: 0 }, { at: 500 }] }, performance.now());
    }
  }

  function unturn(id: LessonCharacterId): void {
    if (glancing.includes(id)) glancing = glancing.filter((other) => other !== id);
    if (turned[id] === undefined) return;
    const { [id]: _, ...rest } = turned;
    turned = rest;
  }

  /** Run cues on the clock: each starts on time and changes the world as it takes effect. */
  function runCues(items: readonly ScheduledCue[]): void {
    const now = performance.now();
    for (const item of items) {
      later(item.start - now, () => startCue(item));
      if (item.cue.on === "dark" || item.partner) continue;
      const takes = WALKING.has(item.cue.do) ? 0 : (item.motion.takes ?? item.motion.ms);
      later(item.start + takes - now, () => takeEffect(item));
      if (item.cue.do === "camera") continue;
      busy[item.who] = Math.max(busy[item.who] ?? 0, item.end);
      actsEnd = Math.max(actsEnd, item.motion.hold ? item.start + takes : item.end);
    }
  }

  function clearActs(): void {
    actToken += 1;
    for (const timer of actTimers) window.clearTimeout(timer);
    actTimers = [];
    busy = {};
    actsEnd = 0;
    running = [];
    gliding = {};
    pouring = {};
    sunk = {};
    dimmed = false;
    void doorSwing.set(0, { duration: 0 });
  }

  /** What a figure has in each hand: a pot carried in both is drawn once, in the lead hand. */
  function handsOf(
    id: LessonCharacterId,
  ): ComponentProps<typeof StickFigureActor>["hands"] {
    if (!world) return {};
    const held = heldIn(world, id);
    const look = (hand: Hand) => {
      const object = held[hand];
      if (!object || (hand === "rear" && held.lead === object)) return undefined;
      const pours = pouring[id]?.[hand];
      const into = sunk[id]?.[hand];
      return {
        id: object,
        ...lookOf(object),
        effect: pours?.kind,
        sliding: pours?.kind === "stream",
        // Into an opening at its rim; onto a board or worktop at its top.
        lands: pours?.to
          ? (openingFor(id, pours.to)?.rim ??
            surroundings(id).pointOf(pours.to, "top")?.y)
          : undefined,
        sunk: into ? openingFor(id, into) : undefined,
      };
    };
    return { lead: look("lead"), rear: look("rear") };
  }

  /** The opening of what `id` pours into or dips in, in their figure's space: across its rim, and the rim's height. */
  function openingFor(
    id: LessonCharacterId,
    name: string,
  ): { left: number; right: number; rim: number } | undefined {
    const kind = world?.objects[name]?.kind;
    // A unit past a sink's sides, so the outline of a pot that fills it goes under the worktop too.
    const size = kind
      ? OPENING[kind]
      : isSink(set, geometry, name)
        ? { half: SINK.half + 1 }
        : undefined;
    const top = surroundings(id).pointOf(name, "top");
    if (!size || !top) return undefined;
    return { left: top.x - size.half, right: top.x + size.half, rim: top.y };
  }

  /** How an object looks, with what lies in or on it: the carrots on the board. */
  function lookOf(id: string): ObjectLook {
    const state = world!.objects[id];
    const inside = contents(world!, id);
    return {
      kind: state.kind,
      fill: state.fill,
      heat: state.heat,
      cut: state.cut,
      wilt: state.wilt,
      clipped: state.clipped,
      ...(state.kind === "pot"
        ? {
            open: !inside.some((other) => world!.objects[other]?.kind === "lid"),
            bits: inside.some((other) => world!.objects[other]?.kind === "carrot"),
          }
        : {}),
      on: inside.flatMap((other) => {
        const where = world!.objects[other].where;
        return state.kind === "board" && "in" in where
          ? [{ ...lookOf(other), dx: where.dx ?? 0, dy: -OBJECT_SIZE.board.top }]
          : [];
      }),
    };
  }

  /** On the phone: holding one with a call on. */
  function onCall(id: LessonCharacterId): boolean {
    return Object.values(world?.objects ?? {}).some(
      ({ call, where }) => call && "hand" in where && where.hand === id,
    );
  }

  /** What `id` wears: a host whose headphones are off is bareheaded. */
  function dressOf(id: LessonCharacterId): Dress {
    const off = Object.values(world?.objects ?? {}).some(
      ({ kind, of, where }) =>
        kind === "headphones" && of === id && !("wear" in where && where.wear === id),
    );
    return off ? { ...dress, headwear: undefined } : dress;
  }

  /** The clock the lights stay on while the story skips ahead, in stage px. */
  const spotlight = $derived.by(() => {
    const clock = things.find((thing) => thing.id === "hodiny");
    const box = clock && thingBoxes(clock)[0];
    if (!box || !measured) return undefined;
    const centre = backdropToStage(
      boxCenter(box),
      stageWidth,
      stageHeight,
      backdropAlign(setting),
    );
    const edge = backdropToStage(
      { x: box.x + box.width, y: box.y },
      stageWidth,
      stageHeight,
      backdropAlign(setting),
    );
    return { ...centre, r: Math.max(18, edge.x - centre.x + 6) };
  });

  /** The camera's move: framing whoever it is on, never past the stage's edges. */
  const camera = $derived.by(() => {
    if (!shot.on || !measured || shot.zoom <= 1) return "none";
    const zoom = shot.zoom;
    let x: number;
    let y: number;
    if (isCast(shot.on)) {
      const mark = standing(markOf(frame, shot.on), offsets[shot.on]);
      x = mark.left + mark.width / 2;
      y = mark.top + mark.width * 0.45;
    } else {
      // A part of the set: its middle, at the height of the cast's heads.
      const at = set && spotAt(set, geometry, shot.on, castX);
      const middle = at?.x ?? geometry.pieceX(shot.on);
      if (middle === undefined) return "none";
      const mark = markOf(frame, direction.cast[0]);
      x = middle * unit;
      y = mark.top + mark.width * 0.45;
    }
    const tx = Math.min(0, Math.max(stageWidth * (1 - zoom), stageWidth / 2 - x * zoom));
    const ty = Math.min(
      0,
      Math.max(stageHeight * (1 - zoom), stageHeight * 0.42 - y * zoom),
    );
    return `translate(${tx}px, ${ty}px) scale(${zoom})`;
  });

  /**
   * Start on line `index` ahead of its voice: the cues before it. The voice
   * waits the ms this returns.
   */
  export function lead(index: number): number {
    const line = lines[index];
    if (!acted || !line?.act || !world) return 0;
    const count = leadingCount(line.act);
    if (count === 0) return 0;

    const cues = line.act.slice(0, count);
    try {
      const ms = leadTime(cues, line.characterId, world, walkMsFor, set);
      const at = performance.now();
      const times: LineTimes = {
        lead: at,
        speech: at + ms,
        end: at + ms,
        word: () => undefined,
      };
      const items = scheduleCues(
        cues,
        line.characterId,
        world,
        times,
        walkMsFor,
        busy,
        set,
      );
      leading = { index, at, cues: items };
      runCues(items);
      return ms;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  /** When everything the line's cues do is done: the next line waits for it. */
  function actsLeft(): number {
    return Math.max(0, actsEnd - performance.now());
  }

  /** The world as the line's leading cues leave it. */
  function worldAfterLeading(index: number): World | undefined {
    if (leading?.index !== index) return world;
    return leading.cues.at(-1)?.after ?? world;
  }

  /** When @word is said in line `index`, on the stage's clock from `speech`. */
  function wordTimes(index: number, speech: number, rate: number): LineTimes["word"] {
    const plan = direction.lines[index]?.plan;
    const words = foldLine(lines[index]?.slovak ?? "").split(" ");
    return (folded) => {
      const at = words.indexOf(folded);
      const span = at === -1 ? undefined : plan?.words?.[at];
      return span ? speech + span.start / rate : undefined;
    };
  }

  /** Put `ids` (everyone, unless given) where `world` has them: on their spot, on its chair if they sit. */
  function placeSpots(
    world: World,
    ids: readonly LessonCharacterId[] = direction.cast,
  ): void {
    for (const id of ids) {
      const to = world.spots[id];
      const at = to ? spotOf(id, to) : undefined;
      if (!at) continue;
      // Put there, not walked there: the last walk's transition would slide them across the room.
      const { [id]: _walk, ...still } = walks;
      walks = still;
      offsets = { ...offsets, [id]: at.offset };
      facings = { ...facings, [id]: at.facing };
      const { [id]: _, ...rest } = seated;
      seated =
        world.seated?.includes(id) && at.chair !== undefined
          ? { ...rest, [id]: at.chair }
          : rest;
    }
    settleChairs();
    outside = world.out ?? [];
  }

  /**
   * The word card sits under the thing, or over it when there is no room
   * below. A thing as tall as the stage (a house on the square) has room on
   * neither side, so the card covers its middle rather than leave the stage.
   */
  const card = $derived.by(() => {
    if (!pickedThing || !pickedParsed) return undefined;

    const align = backdropAlign(setting);
    const { box } = pickedParsed;
    const top = backdropToStage(box, stageWidth, stageHeight, align);
    const bottom = backdropToStage(
      { x: box.x + box.width / 2, y: box.y + box.height },
      stageWidth,
      stageHeight,
      align,
    );
    const centre = backdropToStage(boxCenter(box), stageWidth, stageHeight, align);
    const lowest = stageHeight - cardHeight - 8;
    const under = bottom.y + 10;
    const over = top.y - 10 - cardHeight;

    const left = Math.min(
      Math.max(8, centre.x - CARD_WIDTH / 2),
      Math.max(8, stageWidth - CARD_WIDTH - 8),
    );
    // Under the thing, or over it; on a stage too short for either (a phone's), under it and past the stage's edge, where the card is not clipped.
    const below = under <= lowest || over < 8;
    return {
      left,
      top: below ? under : over,
      below,
      // Clear of the rounded corners.
      tip: Math.min(CARD_WIDTH - 16, Math.max(16, centre.x - left)),
    };
  });

  // A new scene, or an edit to the script, starts everyone where its first line finds them.
  // Placing needs the stage's size: who walks on stands off its edge.
  $effect(() => {
    void direction;
    if (!measured) return;
    untrack(() => {
      stop();
      actors = {};
      picked = undefined;
      lit = [];
      place(0);
    });
  });

  /** Walk a figure to `offset` figure widths from its mark, a step at a time. */
  function walkTo(id: LessonCharacterId, offset: number, pace = 1): void {
    const from = offsets[id] ?? 0;
    if (from === offset) return;

    const steps = stepsFor(offset - from);
    const ms = walkDuration(steps, id) / pace;
    const { [id]: _, ...still } = perched;
    perched = still;
    walkCount += 1;
    walks = { ...walks, [id]: { cue: walkCount, ms, pace } };
    offsets = { ...offsets, [id]: offset };
    striding = [...striding.filter((other) => other !== id), id];
    later(ms, () => (striding = striding.filter((other) => other !== id)));
    const passed = passedBy(id, from, offset);
    if (passed.length || passesFurniture(id, from, offset)) {
      passing = [...passing.filter((other) => other !== id), id];
      // Someone at the counter or the stove has their back to it: stepping back, they went into it.
      const room = passed.filter((other) => !backed(other));
      roomFor = [...roomFor.filter((other) => !passed.includes(other)), ...room];
      if (room.length < passed.length) passingDeep = [...passingDeep, id];
      later(Math.max(0, ms - PASS_MS), () => {
        passing = passing.filter((other) => other !== id);
        passingDeep = passingDeep.filter((other) => other !== id);
        roomFor = roomFor.filter((other) => !passed.includes(other));
      });
    }
    // Reduced motion puts the figure there at once, so nobody waits on the walk.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      walkEndsAt[id] = performance.now() + ms;
      playSteps(steps, stepMs(id) / pace, {
        ground: PLACES[setting].ground,
        shoes: LOOKS[id].shoes,
      });
    }
  }

  /** Who stands still in the way: their middle lies inside the walk, not at its ends. */
  function passedBy(
    id: LessonCharacterId,
    from: number,
    to: number,
  ): LessonCharacterId[] {
    const left = Math.min(from, to) + PASS_CLEAR;
    const right = Math.max(from, to) - PASS_CLEAR;
    const mark = frame.marks[id] ?? 0;
    return direction.cast.filter((other) => {
      if (other === id || striding.includes(other) || outside.includes(other))
        return false;
      const at =
        ((frame.marks[other] ?? 0) - mark) / frame.figureWidth + (offsets[other] ?? 0);
      return at > left && at < right;
    });
  }

  /** Whether a counter or the stove stands right behind `id`, so there is no room to step back. */
  function backed(id: LessonCharacterId): boolean {
    const middle =
      (frame.marks[id] ?? 0) +
      frame.figureWidth / 2 +
      (offsets[id] ?? 0) * frame.figureWidth;
    return geometry.pieces.some((piece) => {
      if (piece.front || (piece.kind !== "counter" && piece.kind !== "stove"))
        return false;
      const at = (geometry.pieceX(piece.id) ?? 0) * unit;
      const half = (pieceSize(piece).width / 2) * unit + BODY_HALF * frame.figureWidth;
      return Math.abs(middle - at) < half;
    });
  }

  /** Whether a walk from `from` to `to` figure widths off the mark goes past a chair or the table, which the walker passes in front of. */
  function passesFurniture(id: LessonCharacterId, from: number, to: number): boolean {
    const middle = (frame.marks[id] ?? 0) + frame.figureWidth / 2;
    const left = middle + Math.min(from, to) * frame.figureWidth;
    const right = middle + Math.max(from, to) * frame.figureWidth;
    const end = middle + to * frame.figureWidth;
    // Not the chair they walk up to, to sit on.
    const chairs = (PLACES[setting].furniture ?? [])
      .map(({ x }) => stageX(frame, { x, y: 0 }))
      .filter((at) => Math.abs(end - at) > CHAIR_HALF * frame.figureWidth)
      .map((at) => [
        at - CHAIR_HALF * frame.figureWidth,
        at + CHAIR_HALF * frame.figureWidth,
      ]);
    const start = middle + from * frame.figureWidth;
    const within = ([left, right]: number[], x: number) => x > left && x < right;
    const fronts = geometry.pieces
      .filter((piece) => piece.front)
      .map((piece) => {
        const at = (geometry.pieceX(piece.id) ?? 0) * unit;
        const half = (pieceSize(piece).width / 2) * unit;
        return { kind: piece.kind, span: [at - half, at + half] };
      })
      // The studio desk's chairs are behind it: getting up from one, or going
      // back to it, is a walk behind the desk, not round its front.
      .filter(
        ({ kind, span }) =>
          kind !== "desk" || !(within(span, start) || within(span, end)),
      )
      .map(({ span }) => span);
    return [...chairs, ...fronts].some(([start, end]) => right > start && left < end);
  }

  /** Who turns to the one talking: in an acted scene, only those not at a spot of the set and not busy with a cue. */
  function turning(facing: CastFacing | undefined): CastFacing {
    if (!acted || !facing) return facing ?? {};
    const now = performance.now();
    return Object.fromEntries(
      Object.entries(facing).filter(
        ([id]) =>
          !world?.spots[id as LessonCharacterId] &&
          (busy[id as LessonCharacterId] ?? 0) < now,
      ),
    );
  }

  function blocking(): Blocking {
    return { aboard, facings, offsets, seated, tram };
  }

  /** Turn everyone as `next` has them at once, and walk whoever it moves; `running` run. */
  function block(next: Blocking, running?: LessonCharacterId): void {
    facings = next.facings;
    seated = next.seated;
    settleChairs();
    tram = next.tram;
    aboard = next.aboard;
    for (const id of direction.cast) {
      const to = next.offsets[id] ?? 0;
      if (to !== (offsets[id] ?? 0)) walkTo(id, to, id === running ? RUN_PACE : 1);
    }
  }

  /** The ball leaves the thrower's hand and flies off the `side` edge in an arc. */
  function throwBall(thrower: LessonCharacterId, side: Facing, index: number): void {
    const facing = facings[thrower] ?? resting[thrower] ?? 1;
    const from = figureToStage(
      SHOWN_HAND,
      standing(markOf(frame, thrower), offsets[thrower]),
      facing,
    );
    thrownAt = index;
    flight = {
      cue: (flight?.cue ?? 0) + 1,
      from,
      to: { x: side > 0 ? stageWidth + 16 : -16, y: from.y + stageHeight * 0.08 },
    };
  }

  /** Moves the ball along its arc: level travel, rising and then dropping a stage-fifth. */
  function arc(node: HTMLElement, path: { from: Point; to: Point }): void {
    const { from, to } = path;
    const rise = stageHeight * 0.22;
    const frames = Array.from({ length: 9 }, (_, step) => {
      const t = step / 8;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t - rise * 4 * t * (1 - t);
      return { transform: `translate(${x}px, ${y}px)` };
    });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.animate(frames, { duration: reduced ? 0 : THROW_MS, fill: "forwards" });
  }

  function boardBefore(index: number): string | undefined {
    return lines.slice(0, index).findLast((line) => line.characterId === null)?.slovak;
  }

  /** What a figure has in hand: an umbrella stays open or folded as it came out. */
  function heldBy(id: LessonCharacterId): Held | undefined {
    const prop = holding[id];
    if (!prop) return undefined;
    if (
      thrownAt === heldAt &&
      stagings[heldAt]?.throws &&
      id === lines[heldAt]?.characterId
    )
      return undefined;
    if (prop === "umbrella") return { id: prop, open: umbrellas[id] ?? dress.umbrellaUp };
    // A lead is open once it is on the dog.
    if (prop === "leash") return { id: prop, open: dog !== undefined };
    return { id: prop };
  }

  const dog = $derived(direction.cast.find((id) => LOOKS[id].dog));
  /** The robot on a call while the far end speaks: it plays the voice out loud. */
  let relaying = $state<LessonCharacterId>();

  const leashed = $derived(
    dog !== undefined &&
      (direction.cast.some((id) => holding[id] === "leash") ||
        Object.values(world?.objects ?? {}).some(
          ({ kind, clipped, where }) => kind === "lead" && clipped && "hand" in where,
        )),
  );

  /** Put every umbrella down: the rain has stopped, or they are getting on the tram. */
  export function foldUmbrellas(): void {
    umbrellas = Object.fromEntries(Object.keys(umbrellas).map((id) => [id, false]));
  }

  /** Where an offstage figure stands before walking on, or after leaving. */
  function entrySpot(id: LessonCharacterId): { offset: number; facing: Facing } {
    for (const line of lines) {
      const enterCue = line.act?.find(
        (cue) => cue.do === "enter" && actorOfCue(cue, line.characterId) === id,
      );
      if (enterCue) {
        const at = enterCue.from ? spotOf(id, enterCue.from) : undefined;
        if (at) return at;
        const side: Facing = enterCue.from?.includes("left") ? -1 : 1;
        return {
          offset: offStage(frame, id, side),
          facing: (side === -1 ? 1 : -1) as Facing,
        };
      }
    }
    for (const line of lines) {
      const leaveCue = line.act?.find(
        (cue) => cue.do === "leave" && actorOfCue(cue, line.characterId) === id,
      );
      if (leaveCue) {
        const side: Facing = leaveCue.to === "left" ? -1 : 1;
        return { offset: offStage(frame, id, side), facing: side };
      }
    }
    return { offset: offStage(frame, id, 1), facing: -1 };
  }

  /** Put everyone where line `index` finds them, as if the scene had played to it, without walking there. */
  export function place(index: number): void {
    // Nobody walks there, so no walk scheduled before should go on sounding.
    stopCues();

    umbrellas = {};
    walks = {};
    walkEndsAt = {};
    striding = [];
    passing = [];
    passingDeep = [];
    roomFor = [];
    doorway = [];
    heldAt = index - 1;
    handedAt = index - 1;
    thrownAt = stagings[index - 1]?.throws ? index - 1 : -1;
    flight = undefined;
    board = boardBefore(index);

    clearActs();
    leading = undefined;
    acts = {};
    turned = {};
    glancing = [];
    shaded = [];

    if (acted) {
      world = actedWorlds?.[Math.min(index, actedWorlds.length - 1)];
      tram = "away";
      aboard = [];
      outside = world?.out ?? [];

      const nextOffsets: Offsets = {};
      const nextFacings: Partial<Record<LessonCharacterId, Facing>> = {};
      const nextSeated: Partial<Record<LessonCharacterId, number>> = {};

      for (const id of direction.cast) {
        if (world?.out?.includes(id)) {
          const entry = entrySpot(id);
          nextOffsets[id] = entry.offset;
          nextFacings[id] = entry.facing;
        } else if (world?.spots[id]) {
          const at = spotOf(id, world.spots[id]);
          if (at) {
            nextOffsets[id] = at.offset;
            nextFacings[id] = at.facing;
            if (world.seated?.includes(id) && at.chair !== undefined) {
              nextSeated[id] = at.chair;
            }
          } else {
            nextOffsets[id] = 0;
            nextFacings[id] = resting[id] ?? 1;
          }
        } else if (behindDesk(id)) {
          const chairIndex = direction.cast.indexOf(id);
          const chair = frame.seats[chairIndex];
          if (chair) {
            nextOffsets[id] = onSeat(frame, id, chair.x);
            nextFacings[id] = chair.facing;
          } else {
            nextOffsets[id] = 0;
            nextFacings[id] = resting[id] ?? 1;
          }
        } else {
          nextOffsets[id] = 0;
          nextFacings[id] = resting[id] ?? 1;
        }
      }

      offsets = nextOffsets;
      facings = nextFacings;
      seated = nextSeated;
      settleChairs();
      for (const id of direction.cast) if (carrying(id)) carry(id);
      return;
    }

    const placed = blockingBefore(
      index,
      lines.map((line) => line.characterId),
      stagings,
      frame,
    );

    facings = placed.facings;
    offsets = placed.offsets;
    seated = placed.seated;
    settleChairs();
    tram = placed.tram;
    aboard = placed.aboard;
    world = actedWorlds?.[Math.min(index, actedWorlds.length - 1)];
    outside = [];
    if (!world) return;
    placeSpots(world);
    for (const id of direction.cast) if (carrying(id)) carry(id);
  }

  /** Stage px of what a point aims at, as everyone stands now. */
  function targetOf(target: PointTarget): Point | undefined {
    if (target.kind === "thing") {
      const thing = things.find((candidate) => candidate.id === target.id);
      const box = thing && thingBoxes(thing)[target.copy ?? 0];
      if (!box || !stageWidth) return undefined;
      return backdropToStage(
        boxCenter(box),
        stageWidth,
        stageHeight,
        backdropAlign(setting),
      );
    }

    const facing = facings[target.holder] ?? resting[target.holder] ?? 1;
    return figureToStage(
      SHOWN_HAND,
      standing(markOf(frame, target.holder), offsets[target.holder]),
      facing,
    );
  }

  /**
   * The plan with each point aimed from where the speaker stands, and the
   * way the first one turns them. A hand holding a prop leaves the pointing
   * to the other one.
   */
  function aimLine(
    id: LessonCharacterId,
    plan: LinePlan,
    holding: boolean,
  ): { facing?: Facing; plan: LinePlan } {
    const from = figureToStage(SHOULDER, standing(markOf(frame, id), offsets[id]), 1);
    let facing: Facing | undefined;

    const beats = plan.beats.map((beat) => {
      const to = beat.point && targetOf(beat.point.target);
      if (!beat.point || !to) return beat;

      const aim = aimAt(from, to);
      facing ??= aim.facing;
      return {
        ...beat,
        point: { ...beat.point, ...aim, hand: holding ? ("rear" as const) : undefined },
      };
    });

    return { facing, plan: { ...plan, beats } };
  }

  /** Light a thing up for a moment, as when a line names it: one `copy` of it, or all. */
  export function light(id: string, copy?: number): void {
    const key = litKey(id, copy);
    lit = [...lit, key];
    window.setTimeout(() => {
      const at = lit.indexOf(key);
      if (at !== -1) lit = lit.toSpliced(at, 1);
    }, LIT_MS);
  }

  function onBeat(beat: LineBeat): void {
    const target = beat.point?.target;
    if (target?.kind !== "thing") return;

    light(target.id, target.copy);
    lookAt(target);
  }

  /**
   * Everyone else on stage turns to what the speaker points at and looks
   * at it for a moment, then turns back to the speaker.
   */
  function lookAt(target: PointTarget): void {
    const to = targetOf(target);
    const line = lines[heldAt];
    if (!to || !line) return;

    const token = playToken;
    for (const id of direction.cast) {
      if (id === line.characterId) continue;
      const mark = standing(markOf(frame, id), offsets[id]);
      if (mark.left + mark.width < 0 || mark.left > stageWidth) continue;

      const centre = mark.left + mark.width / 2;
      if (Math.abs(to.x - centre) > mark.width * 0.2) {
        facings = { ...facings, [id]: to.x > centre ? 1 : -1 };
      }
      gesture(id, "glance");
    }

    window.setTimeout(() => {
      if (token !== playToken) return;
      facings = { ...facings, ...stagings[heldAt]?.facing };
    }, gestureDuration("glance"));
  }

  function cueActor(id: LessonCharacterId, plan: LinePlan | undefined): void {
    actors[id] = {
      cue: (actors[id]?.cue ?? 0) + 1,
      plan: atDesk(id, plan),
      talking: true,
    };
  }

  /**
   * A seated host's gestures kept off the desk mic in front of them: a wave
   * with the outer hand, and a point low and near, in under the mic. Out
   * level, the near hand landed behind the mic's boom and read as gripping it.
   */
  function atDesk(id: LessonCharacterId, plan: LinePlan): LinePlan;
  function atDesk(
    id: LessonCharacterId,
    plan: LinePlan | undefined,
  ): LinePlan | undefined;
  function atDesk(
    id: LessonCharacterId,
    plan: LinePlan | undefined,
  ): LinePlan | undefined {
    if (!plan || deskMic(id, world, undefined)?.side !== 1) return plan;
    const beats = plan.beats.map((beat) =>
      beat.gesture === "wave"
        ? { ...beat, gesture: "waveOut" as const }
        : beat.point
          ? {
              ...beat,
              point: { ...beat.point, reach: "near" as const, rise: DESK_POINT_RISE },
            }
          : beat,
    );
    return { ...plan, beats };
  }

  export function size(): { height: number; width: number } {
    return { height: stageHeight, width: stageWidth };
  }

  /**
   * Ms until the speaker of line `index` and the one they speak to stand
   * where they say it, 0 when both do: nobody answers someone still on
   * their way over.
   */
  export function ready(index: number): number {
    const people = [lines[index]?.characterId, stagings[index]?.addressee];
    return Math.max(
      0,
      ...people.map((id) => (id ? (walkEndsAt[id] ?? 0) - performance.now() : 0)),
    );
  }

  /** One silent gesture, outside any line: a listener puzzled by what they heard. */
  export function gesture(id: LessonCharacterId, gesture: StickGestureId): void {
    const plan = atDesk(id, gesturePlan(gesture));
    const cue = (actors[id]?.cue ?? 0) + 1;
    actors[id] = { cue, plan, talking: true };
    window.setTimeout(() => {
      const actor = actors[id];
      if (actor?.cue === cue) actor.talking = false;
    }, plan.durationMs);
  }

  export function stop(): void {
    clearActs();
    playToken += 1;
    stopCues();
    window.clearTimeout(lineTimer);
    window.clearTimeout(bubbleTimer);
    bubble = undefined;
    stopStoryLineAudio();
    for (const actor of Object.values(actors)) actor.talking = false;
    relaying = undefined;
    walks = {};
    walkEndsAt = {};
    striding = [];
    flight = undefined;
  }

  // An effect's teardown, not onDestroy: onDestroy also runs after a server render, where there is no window.
  $effect(() => () => untrack(stop));

  /**
   * Walk `id` on from the `from` edge to their mark, as someone coming over
   * to say hello, while the others turn to watch them come.
   */
  export function arrive(id: LessonCharacterId, from: Facing): void {
    const rest = { ...walks };
    delete rest[id];
    walks = rest;
    offsets = { ...offsets, [id]: offStage(frame, id, from) };

    const cast = direction.cast;
    const turned = Object.fromEntries(
      cast
        .filter((other) => other !== id)
        .map((other) => [other, cast.indexOf(id) > cast.indexOf(other) ? 1 : -1]),
    );
    turns = turnDelays(direction.cast, id);
    facings = { ...facings, ...turned, [id]: from === 1 ? -1 : 1 };
    // Counted from now, so whoever waits on the walk waits from the start.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      walkEndsAt[id] = performance.now() + walkDuration(stepsFor(offsets[id] ?? 0), id);
    }
    // The jump off stage has to paint before the walk back, or it animates too.
    window.requestAnimationFrame(() => walkTo(id, 0));
  }

  /** A line in a speech bubble over a figure, for words that have no clip: a wrong guess said aloud. */
  export function say(id: LessonCharacterId, text: string, ms = BUBBLE_MS): void {
    window.clearTimeout(bubbleTimer);
    bubble = { characterId: id, cue: (bubble?.cue ?? 0) + 1, text };
    bubbleTimer = window.setTimeout(() => {
      bubble = undefined;
    }, ms);
  }

  /**
   * A line said outside the script, as a talk's answer to a slip: in a
   * bubble for as long as it lasts, voiced, the mouth on its clip.
   */
  export function answer(
    id: LessonCharacterId,
    line: Pick<DirectedLine, "mouth" | "said" | "slovak" | "src" | "vowels">,
    rate = 1,
    bubble = true,
  ): void {
    const plan = planLine(line.slovak, {
      lips: line.vowels ? decodeVowelTrack(line.vowels) : undefined,
      said: line.said,
      track: line.mouth ? decodeMouthTrack(line.mouth) : undefined,
    });
    if (bubble) say(id, line.slovak, Math.max(BUBBLE_MS, plan.durationMs / rate));
    if (!line.src) return;

    playToken += 1;
    const token = playToken;
    spoken = { at: performance.now(), durationMs: plan.durationMs, rate };
    cueActor(id, plan);
    playStoryLineAudio(line.src, line.slovak, {
      onEnded: () => {
        const actor = actors[id];
        if (token === playToken && actor) actor.talking = false;
      },
      playbackRate: rate,
      silentMs: plan.durationMs / rate,
    });
  }

  /**
   * Where the line being said is, for every figure acting it out: its clip,
   * or with none playing (no clip, or sound off) the wall clock at the
   * line's rate, so a slowed line and the timer that ends it agree.
   */
  export function clock(): SpeechClock | undefined {
    return (
      storyAudioClock() ?? {
        durationMs: spoken.durationMs,
        timeMs: (performance.now() - spoken.at) * spoken.rate,
      }
    );
  }

  /**
   * Play line `index`: the speaker gestures and talks, the rest turn,
   * react, walk. `rate` below 1 slows the clip, and the figures with it.
   * `take` is the learner's recording of the line, said in its place.
   */
  export function play(
    index: number,
    onDone?: () => void,
    rate = 1,
    take?: { plan: LinePlan; src: string },
  ): void {
    playToken += 1;
    const token = playToken;
    const line = lines[index];
    const plan = take?.plan ?? direction.lines[index]?.plan;
    const staging = stagings[index];
    if (!line) return;

    heldAt = index;
    handedAt = -1;
    if (line.characterId === null) board = line.slovak;

    for (const actor of Object.values(actors)) actor.talking = false;
    const caller = direction.lines[index]?.call;
    relaying = line.overPhone && caller && LOOKS[caller].robot ? caller : undefined;
    spoken = { at: performance.now(), durationMs: plan?.durationMs ?? 1600, rate };
    // A voice over the phone has nobody on stage to move.
    const speaker =
      line.characterId && direction.cast.includes(line.characterId)
        ? line.characterId
        : null;
    front = staging?.audience && speaker ? speaker : undefined;
    turns = turnDelays(direction.cast, speaker);
    facings = { ...facings, ...turning(staging?.facing) };
    // Aimed from where the speaker stands before anyone walks this line.
    const aimed =
      speaker && plan
        ? aimLine(speaker, plan, Boolean(direction.lines[index]?.held[speaker]))
        : undefined;
    const standingAt = speaker ? offsets[speaker] : undefined;
    if (!acted && staging) {
      block(startLine(blocking(), staging, speaker, frame), staging.returns?.characterId);
    }
    // A speaker walking somewhere faces the way they go, not where they point.
    if (speaker && aimed?.facing && offsets[speaker] === standingAt) {
      facings = { ...facings, [speaker]: aimed.facing };
    }
    if (speaker && aimed) cueActor(speaker, aimed.plan);

    if (acted && line.act && world) {
      const now = performance.now();
      const skip = leading?.index === index ? leadingCount(line.act) : 0;
      const times: LineTimes = {
        lead: leading?.index === index ? leading.at : now,
        speech: now,
        end: now + (plan?.durationMs ?? 1600) / rate,
        word: wordTimes(index, now, rate),
      };
      try {
        runCues(
          scheduleCues(
            line.act.slice(skip),
            line.characterId,
            worldAfterLeading(index) ?? world,
            times,
            walkMsFor,
            busy,
            set,
          ),
        );
      } catch (error) {
        console.error(error);
      }
    }

    for (const reaction of staging?.reactions ?? []) {
      const span = plan?.sentences[reaction.sentence];
      if (!plan || !span) continue;

      const at = span.start + (span.end - span.start) * reaction.at;
      cueActor(reaction.characterId, reactionPlan(plan, reaction.gesture, at));
    }

    const onEnded = () => {
      if (token !== playToken) return;

      for (const actor of Object.values(actors)) actor.talking = false;
      relaying = undefined;
      if (staging?.gives) handedAt = index;
      if (staging?.throws && speaker) throwBall(speaker, staging.throws.side, index);
      if (!acted && staging)
        block(endLine(blocking(), staging, speaker, frame), staging.throws?.fetcher);
      if (staging?.boards) foldUmbrellas();
      if (stagings[index + 1]?.arrives) playTramCue();
      release();
      // The next line waits for what this one's cues are still doing, then starts from the world they leave.
      later(actsLeft(), () => {
        if (token !== playToken) return;
        if (acted) world = actedWorlds?.[index + 1] ?? world;
        onDone?.();
      });
    };

    const src = take?.src ?? line.src;
    if (src) {
      playStoryLineAudio(src, line.slovak, {
        onEnded,
        playbackRate: rate,
        silentMs: spoken.durationMs / rate,
      });
      return;
    }

    // No clip yet: run the line for its text-timed length on the wall clock.
    stopStoryLineAudio();
    window.clearTimeout(lineTimer);
    lineTimer = window.setTimeout(onEnded, spoken.durationMs / rate);
  }

  /** A tap anywhere but the card or a thing puts the card away; so does Escape. */
  function closeCard(event: PointerEvent | KeyboardEvent): void {
    if (!picked) return;
    if ("key" in event) {
      if (event.key === "Escape") picked = undefined;
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("[data-word-card]") || target?.closest('svg [role="button"]'))
      return;
    picked = undefined;
  }

  function pickThing(id: string): void {
    if (onthing) {
      onthing(id);
      return;
    }
    picked = picked === id ? undefined : id;
  }
</script>

<svelte:window onpointerdown={closeCard} onkeydown={closeCard} />

<!-- The word card sits outside the clipped stage so it can hang past its edge on a short stage. -->
<div class="relative">
  <div
    class={cx(
      // Twice as wide as tall up to 300px, so a phone sees most of the place rather than a slice of its middle.
      "relative aspect-[2/1] max-h-[300px] w-full overflow-hidden",
      className,
    )}
    bind:clientWidth={stageWidth}
    bind:clientHeight={stageHeight}
  >
    <div
      class="absolute inset-0 isolate origin-top-left transition-transform duration-900 ease-in-out"
      style:transform={camera}
    >
      <StickBackdrop
        class="absolute inset-0 size-full"
        {board}
        door={doorSwing.current}
        bind:drawnAt
        minutes={world?.minutes ?? 0}
        skipping={dimmed}
        {found}
        height={stageHeight}
        hint={onthing ? undefined : "Show the word"}
        {lit}
        {mood}
        onpick={pickThing}
        {picked}
        {setting}
        {tram}
        width={stageWidth}
      />
      <StickWeather height={stageHeight} {mood} {setting} width={stageWidth} />

      <!-- Unmeasured, the server's render and the first frame would draw the cast tiny in a corner. -->
      {#if measured}
        {#if set && world}
          <StickSet
            {geometry}
            {gliding}
            layer="behind"
            {running}
            view={castView}
            {world}
          />
        {/if}
        {#each PLACES[setting].furniture ?? [] as piece, index (index)}
          {@const chair = (PLACES[setting].furniture ?? [])
            .slice(0, index)
            .filter(({ kind }) => kind === "chair").length}
          <div
            class="pointer-events-none absolute"
            style:bottom="{FLOOR}px"
            style:left="{stageX(frame, { x: piece.x, y: 0 }) -
              frame.figureWidth / 2 -
              (piece.kind === 'chair'
                ? (piece.facing ?? 1) * chairOut(chair) * unit
                : 0)}px"
            style:width="{frame.figureWidth}px"
          >
            <StickFurniture
              {piece}
              id={piece.kind === "chair" ? `chair-${chair}` : undefined}
            />
          </div>
        {/each}
        {#if frame.desk}
          <StudioDesk
            height={stageHeight}
            layer="behind"
            seats={frame.seats}
            {unit}
            width={stageWidth}
          />
        {/if}
        {#each direction.cast as characterId (characterId)}
          <div
            class="pointer-events-none absolute transition-[transform,opacity,filter] ease-linear"
            style:bottom="{FLOOR}px"
            style:left="{frame.marks[characterId] ?? 0}px"
            style:width="{frame.figureWidth}px"
            style:transform="translateX({(offsets[characterId] ?? 0) * 100}%)"
            style:transition-duration="{walks[characterId]?.ms ?? 0}ms, 0ms, 600ms"
            style:opacity={outside.includes(characterId) ? 0 : 1}
            style:filter={shaded.includes(characterId) ? "brightness(0.9)" : "none"}
            style:z-index={passing.includes(characterId)
              ? 4
              : striding.includes(characterId)
                ? 2
                : 1}
          >
            <div
              class="origin-bottom transition-transform duration-300 ease-in-out"
              style:transform={passingDeep.includes(characterId)
                ? `translateY(${frame.figureWidth * DEEP_LANE}px) scale(${DEEP_SCALE})`
                : passing.includes(characterId)
                  ? `translateY(${frame.figureWidth * PASS_LANE}px) scale(${PASS_SCALE})`
                  : doorway.includes(characterId)
                    ? `translateY(${doorLane * unit}px)`
                    : roomFor.includes(characterId)
                      ? `translateY(${frame.figureWidth * ROOM_LANE}px) scale(${ROOM_SCALE})`
                      : "none"}
            >
              <StickFigureActor
                {characterId}
                {clock}
                cue={actors[characterId]?.cue ?? 0}
                facing={facingOf(characterId)}
                front={front === characterId || glancing.includes(characterId)}
                onbeat={onBeat}
                plan={actors[characterId]?.plan}
                held={acted ? undefined : heldBy(characterId)}
                doing={acts[characterId]}
                hands={handsOf(characterId)}
                seated={seated[characterId] !== undefined}
                out={chairOut(perched[characterId])}
                atTable={perched[characterId] !== undefined}
                atDesk={behindDesk(characterId)}
                mic={deskMic(characterId, world, undefined)?.side}
                onCall={acted
                  ? onCall(characterId)
                  : direction.lines[heldAt]?.call === characterId}
                relaying={relaying === characterId}
                dress={dressOf(characterId)}
                talking={actors[characterId]?.talking ?? false}
                turnDelay={turns[characterId] ?? 0}
                walk={walks[characterId]}
              />
            </div>
          </div>
        {/each}
        {#if leashed}
          <!-- Short enough to hang in a gentle dip at heel and pull straight a step further off. -->
          <StickLeash length={frame.figureWidth * 0.8} />
        {/if}
        <div class="pointer-events-none absolute inset-0 z-3">
          {#if frame.desk}
            <StudioDesk
              height={stageHeight}
              layer="front"
              mugs={!Object.values(world?.objects ?? {}).some(
                ({ kind }) => kind === "cup",
              )}
              seats={frame.seats}
              {unit}
              width={stageWidth}
            />
          {/if}
          {#if set && world}
            <StickSet
              {geometry}
              {gliding}
              layer="front"
              {running}
              view={castView}
              {world}
            />
          {/if}
        </div>
      {/if}

      <!-- The lights go down while the story skips ahead, all but a pool on the clock as its hands run on.
           Inside the camera, so the pool stays on the clock however close the shot is. -->
      <div
        class="pointer-events-none absolute inset-0 z-4 transition-opacity duration-700 ease-in-out"
        style:opacity={dimmed ? 1 : 0}
        style:background={spotlight
          ? `radial-gradient(circle at ${spotlight.x}px ${spotlight.y}px, transparent ${spotlight.r}px, rgb(15 23 42 / 0.94) ${spotlight.r + 14}px)`
          : "rgb(15 23 42 / 0.94)"}
        aria-hidden="true"
      ></div>
    </div>

    {#if flight}
      {#key flight.cue}
        <svg
          class="pointer-events-none absolute top-0 left-0 overflow-visible"
          width={frame.figureWidth * 0.1}
          height={frame.figureWidth * 0.1}
          viewBox="-5 -9 10 10"
          aria-hidden="true"
          use:arc={flight}
        >
          <StickProp prop="ball" />
        </svg>
      {/key}
    {/if}

    {#if bubble}
      {@const mark = standing(
        markOf(frame, bubble.characterId),
        offsets[bubble.characterId],
      )}
      {@const head = mark.left + mark.width / 2}
      {@const centre = Math.min(Math.max(head, 128), Math.max(128, stageWidth - 128))}
      {#key bubble.cue}
        <p
          class={cx(
            "absolute z-10 m-0 w-max max-w-60 -translate-x-1/2 animate-rise rounded-(--control-radius)",
            "bg-surface px-3 py-2 text-center font-serif text-base text-balance text-slate-900 shadow-(--shadow-float) ring-1 ring-slate-200",
          )}
          style:left="{centre}px"
          style:top="{Math.max(4, mark.top - 8 - bubbleHeight)}px"
          bind:offsetHeight={bubbleHeight}
          lang="sk"
        >
          {bubble.text}
          <svg
            class="absolute top-[calc(100%-1px)] h-2 w-4"
            style:left="calc(50% + {head - centre}px - 8px)"
            viewBox="0 0 16 8"
            aria-hidden="true"
          >
            <path d="M0 0L8 8L16 0" class="fill-surface stroke-slate-200" />
          </svg>
        </p>
      {/key}
    {/if}
  </div>

  {#if pickedThing && card}
    {@const word = thingWords[pickedThing.word]}
    {@const pointer = isProperName(pickedThing)
      ? undefined
      : demonstrativeForm("ten", slotOf(pickedThing), "nominative")}
    <div
      data-word-card
      role="dialog"
      aria-label={pickedThing.word}
      class={cx(
        "absolute z-10 animate-rise rounded-(--control-radius) bg-surface text-left",
        "shadow-(--shadow-float) ring-1 ring-slate-200",
      )}
      style:left="{card.left}px"
      style:top="{card.top}px"
      style:width="{CARD_WIDTH}px"
      bind:offsetHeight={cardHeight}
    >
      <!-- The tip points at the thing, so with several things close together it is clear which one this is. -->
      <svg
        class={cx(
          "absolute h-2 w-4",
          card.below ? "bottom-[calc(100%-1px)]" : "top-[calc(100%-1px)]",
        )}
        style:left="{card.tip - 8}px"
        viewBox="0 0 16 8"
        aria-hidden="true"
      >
        <path
          d={card.below ? "M0 8L8 0L16 8" : "M0 0L8 8L16 0"}
          class="fill-surface stroke-slate-200"
        />
      </svg>

      <div class="flex items-center gap-3 px-3 pt-3 pb-2.5">
        {#if word?.src}
          <AudioButton
            label="Listen: {pickedThing.word}"
            size="sm"
            src={word.src}
            text={pickedThing.word}
          />
        {/if}
        <div class="min-w-0">
          <p
            class="m-0 font-serif text-xl leading-tight font-semibold text-slate-900"
            lang="sk"
          >
            {pickedThing.word}
          </p>
          <p class="m-0 text-sm text-slate-600">{pickedThing.english}</p>
        </div>
      </div>

      <!-- Gender as Slovak shows it: by the word for "this" in front. On its own over the noun, "ten" read as part of its name. -->
      <p class="m-0 border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
        {#if pointer}
          <span class="font-serif text-sm text-slate-700" lang="sk"
            ><strong class="font-semibold text-slate-900">{pointer}</strong>
            {pickedThing.word}</span
          >
          <span aria-hidden="true"> · </span>
        {/if}
        {nounGenderLabel(pickedThing.gender).english}{isPlural(pickedThing)
          ? ", plural"
          : ""}
      </p>

      {#if word?.href}
        <a
          class={cx(
            "flex items-center justify-between gap-2 rounded-b-(--control-radius) border-t border-slate-100",
            "px-3 py-2 text-sm font-medium text-blue-700 no-underline transition-colors",
            "hover:bg-slate-50 focus-visible:bg-slate-50",
          )}
          href={word.href}
        >
          Open in the dictionary
          <ArrowRight />
        </a>
      {/if}
    </div>
  {/if}
</div>
