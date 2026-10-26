<script lang="ts">
  import { untrack, type ComponentProps } from "svelte";

  import AudioButton from "$lib/audio/AudioButton.svelte";
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { nounGenderLabel } from "$lib/catalog/types";
  import TextLink from "$lib/components/ui/TextLink.svelte";
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
  import { turnDelays, type TurnDelays } from "$lib/stick-figure/turns";
  import type { SpeechClock } from "$lib/stick-figure/performance";
  import { REST_POSE, easeInOut, lerpPose, type StickPose } from "$lib/stick-figure/pose";
  import { GROUND_Y, STICK_BOX, solveRig, type Point } from "$lib/stick-figure/rig";
  import type { DirectedLine, SceneDirection } from "$lib/stick-figure/scene-direction";
  import {
    aimAt,
    backdropToStage,
    figureToStage,
  } from "$lib/stick-figure/backdrop-geometry";
  import { LOOKS } from "$lib/stick-figure/looks";
  import { PLACES, backdropAlign, thingsIn } from "$lib/stick-figure/places";
  import {
    boxCenter,
    litKey,
    thingBoxes,
    thingCenter,
    thingWithDemonstrative,
  } from "$lib/stick-figure/thing-words";
  import { dressFor } from "$lib/stick-figure/dress";
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
    stageFrame,
    stageX,
    standing,
    walkOns,
    type Offsets,
  } from "$lib/stick-figure/stage-frame";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import { restFacing, type CastFacing, type Facing } from "$lib/stick-figure/staging";
  import { playSteps, playTramCue } from "$lib/stick-figure/ambience";
  import type { TramState } from "$lib/stick-figure/street";
  import { STEP_MS, stepsFor, walkDuration } from "$lib/stick-figure/walk";
  import { cx } from "$lib/ui/classes";
  import StickBackdrop from "./StickBackdrop.svelte";
  import StickWeather from "./StickWeather.svelte";
  import StickFigureActor from "./StickFigureActor.svelte";
  import StickFurniture from "./StickFurniture.svelte";
  import StickSet from "./StickSet.svelte";
  import {
    sampleMotion,
    type Motion,
    type Surroundings,
  } from "$lib/stick-figure/act-motions";
  import {
    isActed,
    worlds,
    WIDE,
    heldBy as heldIn,
    type CameraShot,
    type World,
  } from "$lib/stick-figure/acts";
  import {
    leadTime,
    leadingCount,
    scheduleCues,
    type LineTimes,
    type ScheduledCue,
  } from "$lib/stick-figure/act-schedule";
  import { playFoley } from "$lib/stick-figure/foley";
  import { objectGrip, spotX, type SetGeometry } from "$lib/stick-figure/set-pieces";
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
  /** Long enough to read a short line said in a bubble. */
  const BUBBLE_MS = 2800;
  const CARD_WIDTH = 220;
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
  let walks = $state<Partial<Record<LessonCharacterId, { cue: number; ms: number }>>>({});
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
  const things = $derived(thingsIn(direction.things, setting, mood));
  const frame = $derived(
    stageFrame(
      direction.cast,
      walkOns(stagings),
      setting,
      things,
      stageWidth,
      stageHeight,
    ),
  );
  /** Someone on a chair faces the way it does, whoever points or talks. */
  const sitting = $derived(seatedFacings(seated, frame));
  const pickedThing = $derived(things.find((thing) => thing.id === picked));

  /** The place's set, when the scene is acted from cues: then what anyone holds comes from them alone. */
  const set = $derived(isActed(lines) ? PLACES[setting].set : undefined);
  /** The world before each line, and after the last. */
  const acted = $derived.by(() => {
    if (!set) return undefined;
    try {
      return worlds(lines, set.objects, start);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  });
  let world = $state<World>();
  let shot = $state<CameraShot>(WIDE);
  /** What each figure does on cue right now. */
  let acts = $state<Partial<Record<LessonCharacterId, NonNullable<ActorAct>>>>({});
  /** When each figure is done with the cues it is on. */
  let busy: Partial<Record<LessonCharacterId, number>> = {};
  /** The cues of the line on stage, once started before its voice. */
  let leading: { index: number; at: number; cues: ScheduledCue[] } | undefined;
  /** When the last cue of the line playing is over. */
  let actsEnd = 0;
  let actTimers: number[] = [];
  /** How long a motion takes to take over from the one before it. */
  const TAKE_OVER_MS = 260;
  /** Bumped when the stage stops or jumps, so cues still on the clock let go. */
  let actToken = 0;
  type ActorAct = ComponentProps<typeof StickFigureActor>["doing"];

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
  const geometry = $derived<SetGeometry>({
    pieces: set?.pieces ?? [],
    pieceX: (id) => {
      const piece = set?.pieces.find((candidate) => candidate.id === id);
      return piece && unit ? stageX(frame, { x: piece.x, y: 0 }) / unit : undefined;
    },
  });

  /** A figure's left edge in cast units, where it stands now. */
  function castLeft(id: LessonCharacterId): number {
    return standing(markOf(frame, id), offsets[id]).left / unit;
  }

  function toRig(id: LessonCharacterId, point: Point): Point {
    const facing = facings[id] ?? resting[id] ?? 1;
    return { x: (point.x - castLeft(id) + STICK_BOX.x) * facing, y: point.y };
  }

  function toCast(id: LessonCharacterId, point: Point): Point {
    const facing = facings[id] ?? resting[id] ?? 1;
    return { x: castLeft(id) + point.x * facing - STICK_BOX.x, y: point.y };
  }

  /** Where a figure's middle stands, in cast units. */
  function castMiddle(id: LessonCharacterId): number {
    return castLeft(id) - STICK_BOX.x;
  }

  function surroundings(id: LessonCharacterId): Surroundings {
    return {
      objectAt: (object) => {
        const at = world && set && objectGrip(world, object, set.objects, geometry);
        return at ? toRig(id, at) : undefined;
      },
      meetWith: (other) => {
        // Chest high, a little short of halfway: each reaches, neither has to step in.
        const x = (castMiddle(id) + castMiddle(other)) / 2;
        return toRig(id, { x, y: 76 });
      },
    };
  }

  /** Figure widths from `id`'s mark to where they stand for `to`: a piece of the set, or beside someone. */
  function offsetFor(
    id: LessonCharacterId,
    to: string,
  ): { offset: number; facing: Facing } {
    const x = spotX(geometry, to);
    if (x !== undefined) {
      const mark = markOf(frame, id);
      return {
        offset: (x * unit - (mark.left + mark.width / 2)) / mark.width,
        facing: 1,
      };
    }
    const other = to as LessonCharacterId;
    const toward: Facing =
      castMiddle(other) > castMiddle(id)
        ? 1
        : castMiddle(other) < castMiddle(id)
          ? -1
          : 1;
    return { offset: beside(frame, id, other, toward, offsets, 0.62), facing: toward };
  }

  function walkMsFor(id: LessonCharacterId, to: string): number {
    const { offset } = offsetFor(id, to);
    const from = offsets[id] ?? 0;
    return Math.abs(offset - from) < 0.05 ? 0 : walkDuration(stepsFor(offset - from));
  }

  /** Which way to face to reach `target`: an object, a piece, or a person. */
  function faceToward(
    id: LessonCharacterId,
    target: string | undefined,
  ): Facing | undefined {
    if (!target) return undefined;
    const object = world && set && objectGrip(world, target, set.objects, geometry);
    const x =
      object?.x ??
      geometry.pieceX(target) ??
      (direction.cast.includes(target as LessonCharacterId)
        ? castMiddle(target as LessonCharacterId)
        : undefined);
    if (x === undefined) return undefined;
    const middle = castMiddle(id);
    if (Math.abs(x - middle) < 2) return undefined;
    return x > middle ? 1 : -1;
  }

  function startCue(item: ScheduledCue, token: number): void {
    if (token !== actToken) return;
    const { cue, who, motion } = item;

    if (cue.do === "camera") {
      shot = item.after.camera;
      return;
    }
    if (cue.do === "go") {
      const { offset, facing } = offsetFor(who, cue.to ?? "");
      walkTo(who, offset);
      const ms = walks[who]?.ms ?? 0;
      actTimers.push(
        window.setTimeout(() => {
          if (token === actToken) facings = { ...facings, [who]: facing };
        }, ms),
      );
      return;
    }

    const face = faceToward(who, motion.face ?? cue.what);
    if (face) facings = { ...facings, [who]: face };
    perform(who, motion, item.start);
    for (const { at, id } of motion.sounds ?? []) {
      actTimers.push(window.setTimeout(() => token === actToken && playFoley(id), at));
    }
  }

  function perform(id: LessonCharacterId, motion: Motion, start: number): void {
    const around = surroundings(id);
    // A new motion takes over from the one still going over a moment, so a spoon held out is handed over from where it is, not from a dropped arm.
    const previous = acts[id];
    const from = previous && performance.now() < previous.until ? previous : undefined;
    acts = {
      ...acts,
      [id]: {
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
      },
    };
  }

  /** Run cues on the clock: each starts on time and changes the world as it takes effect. */
  function runCues(items: readonly ScheduledCue[]): void {
    const token = actToken;
    const now = performance.now();
    for (const item of items) {
      actTimers.push(window.setTimeout(() => startCue(item, token), item.start - now));
      const takes = item.cue.do === "go" ? 0 : (item.motion.takes ?? item.motion.ms);
      actTimers.push(
        window.setTimeout(
          () => {
            if (token === actToken) world = item.after;
          },
          item.start + takes - now,
        ),
      );
      if (item.cue.do !== "camera") {
        busy[item.who] = Math.max(busy[item.who] ?? 0, item.end);
        if (!item.motion.hold) actsEnd = Math.max(actsEnd, item.end);
      }
    }
  }

  function clearActs(): void {
    actToken += 1;
    for (const timer of actTimers) window.clearTimeout(timer);
    actTimers = [];
    busy = {};
    actsEnd = 0;
  }

  /** What a figure has in each hand, from the set. */
  function handsOf(id: LessonCharacterId) {
    if (!world || !set) return {};
    const held = heldIn(world, id);
    const drawn = (object: string | undefined) => {
      const kind = set?.objects.find((candidate) => candidate.id === object)?.kind;
      const state = object ? world?.objects[object] : undefined;
      return kind && state ? { kind, full: state.full, heat: state.heat } : undefined;
    };
    return { lead: drawn(held.lead), rear: drawn(held.rear) };
  }

  /** The camera's move: framing whoever it is on, never past the stage's edges. */
  const camera = $derived.by(() => {
    if (!shot.on || !measured || shot.zoom <= 1) return "none";
    const mark = standing(markOf(frame, shot.on), offsets[shot.on]);
    const zoom = shot.zoom;
    const x = mark.left + mark.width / 2;
    const y = mark.top + mark.width * 0.45;
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
    const ms = leadTime(cues, line.characterId, world, walkMsFor);
    const at = performance.now();
    const times: LineTimes = {
      lead: at,
      speech: at + ms,
      end: at + ms,
      word: () => undefined,
    };
    const items = scheduleCues(cues, line.characterId, world, times, walkMsFor, busy);
    leading = { index, at, cues: items };
    runCues(items);
    return ms;
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

  /** Who walks somewhere: the stage puts them on that spot when seeking past it. */
  function placeSpots(spots: World["spots"]): void {
    for (const [id, to] of Object.entries(spots) as Array<[LessonCharacterId, string]>) {
      if (!direction.cast.includes(id) || !to) continue;
      const { offset, facing } = offsetFor(id, to);
      offsets = { ...offsets, [id]: offset };
      facings = { ...facings, [id]: facing };
    }
  }

  /**
   * The word card sits under the thing, or over it when there is no room
   * below. A thing as tall as the stage (a house on the square) has room on
   * neither side, so the card covers its middle rather than leave the stage.
   */
  const card = $derived.by(() => {
    if (!pickedThing) return undefined;

    const align = backdropAlign(setting);
    const { box } = pickedThing;
    const top = backdropToStage(box, stageWidth, stageHeight, align);
    const bottom = backdropToStage(
      { x: box.x + box.width / 2, y: box.y + box.height },
      stageWidth,
      stageHeight,
      align,
    );
    const centre = backdropToStage(
      thingCenter(pickedThing),
      stageWidth,
      stageHeight,
      align,
    );
    const lowest = stageHeight - cardHeight - 8;
    const under = bottom.y + 8;
    const over = top.y - 8 - cardHeight;

    return {
      left: Math.min(
        Math.max(8, centre.x - CARD_WIDTH / 2),
        Math.max(8, stageWidth - CARD_WIDTH - 8),
      ),
      // Under the thing, or over it; on a stage too short for either (a phone's), under it and past the stage's edge, where the card is not clipped.
      top: under <= lowest ? under : over >= 8 ? over : under,
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
  function walkTo(id: LessonCharacterId, offset: number): void {
    const from = offsets[id] ?? 0;
    if (from === offset) return;

    const steps = stepsFor(offset - from);
    const ms = walkDuration(steps);
    walkCount += 1;
    walks = { ...walks, [id]: { cue: walkCount, ms } };
    offsets = { ...offsets, [id]: offset };
    // Reduced motion puts the figure there at once, so nobody waits on the walk.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      walkEndsAt[id] = performance.now() + ms;
      playSteps(steps, STEP_MS, {
        ground: PLACES[setting].ground,
        shoes: LOOKS[id].shoes,
      });
    }
  }

  function blocking(): Blocking {
    return { aboard, facings, offsets, seated, tram };
  }

  /** Turn everyone as `next` has them at once, and walk whoever it moves. */
  function block(next: Blocking): void {
    facings = next.facings;
    seated = next.seated;
    tram = next.tram;
    aboard = next.aboard;
    for (const id of direction.cast) {
      const to = next.offsets[id] ?? 0;
      if (to !== (offsets[id] ?? 0)) walkTo(id, to);
    }
  }

  function boardBefore(index: number): string | undefined {
    return lines.slice(0, index).findLast((line) => line.characterId === null)?.slovak;
  }

  /** What a figure has in hand: an umbrella stays open or folded as it came out. */
  function heldBy(id: LessonCharacterId): Held | undefined {
    const prop = holding[id];
    if (!prop) return undefined;
    return prop === "umbrella"
      ? { id: prop, open: umbrellas[id] ?? dress.umbrellaUp }
      : { id: prop };
  }

  /** Put every umbrella down: the rain has stopped, or they are getting on the tram. */
  export function foldUmbrellas(): void {
    umbrellas = Object.fromEntries(Object.keys(umbrellas).map((id) => [id, false]));
  }

  /** Put everyone where line `index` finds them, as if the scene had played to it, without walking there. */
  export function place(index: number): void {
    const placed = blockingBefore(
      index,
      lines.map((line) => line.characterId),
      stagings,
      frame,
    );

    umbrellas = {};
    facings = placed.facings;
    offsets = placed.offsets;
    seated = placed.seated;
    tram = placed.tram;
    aboard = placed.aboard;
    walks = {};
    walkEndsAt = {};
    heldAt = index - 1;
    handedAt = index - 1;
    board = boardBefore(index);

    clearActs();
    leading = undefined;
    acts = {};
    world = acted?.[index];
    shot = world?.camera ?? WIDE;
    if (world) placeSpots(world.spots);
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
    actors[id] = { cue: (actors[id]?.cue ?? 0) + 1, plan, talking: true };
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
    const plan = gesturePlan(gesture);
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
    window.clearTimeout(lineTimer);
    window.clearTimeout(bubbleTimer);
    bubble = undefined;
    stopStoryLineAudio();
    for (const actor of Object.values(actors)) actor.talking = false;
  }

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
      walkEndsAt[id] = performance.now() + walkDuration(stepsFor(offsets[id] ?? 0));
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
    spoken = { at: performance.now(), durationMs: plan?.durationMs ?? 1600, rate };
    // A voice over the phone has nobody on stage to move.
    const speaker =
      line.characterId && direction.cast.includes(line.characterId)
        ? line.characterId
        : null;
    front = staging?.audience && speaker ? speaker : undefined;
    turns = turnDelays(direction.cast, speaker);
    facings = { ...facings, ...staging?.facing };
    // Aimed from where the speaker stands before anyone walks this line.
    const aimed =
      speaker && plan
        ? aimLine(speaker, plan, Boolean(direction.lines[index]?.held[speaker]))
        : undefined;
    const standingAt = speaker ? offsets[speaker] : undefined;
    if (staging) block(startLine(blocking(), staging, speaker, frame));
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
      const start = worldAfterLeading(index) ?? world;
      runCues(
        scheduleCues(
          line.act.slice(skip),
          line.characterId,
          start,
          times,
          walkMsFor,
          busy,
        ),
      );
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
      if (staging?.gives) handedAt = index;
      if (staging) block(endLine(blocking(), staging, speaker, frame));
      if (staging?.boards) foldUmbrellas();
      if (stagings[index + 1]?.arrives) playTramCue();
      // The next line waits for what this one's cues are still doing.
      const left = actsLeft();
      if (left > 0) {
        actTimers.push(
          window.setTimeout(() => {
            if (token === playToken) onDone?.();
          }, left),
        );
      } else onDone?.();
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
      class="absolute inset-0 origin-top-left transition-transform duration-900 ease-in-out"
      style:transform={camera}
    >
      <StickBackdrop
        class="absolute inset-0 size-full"
        {board}
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
          <StickSet {geometry} objects={set.objects} view={castView} {world} />
        {/if}
        {#each PLACES[setting].furniture ?? [] as piece, index (index)}
          <div
            class="pointer-events-none absolute"
            style:bottom="{FLOOR}px"
            style:left="{stageX(frame, { x: piece.x, y: 0 }) - frame.figureWidth / 2}px"
            style:width="{frame.figureWidth}px"
          >
            <StickFurniture {piece} />
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
            class="pointer-events-none absolute transition-transform ease-linear"
            style:bottom="{FLOOR}px"
            style:left="{frame.marks[characterId] ?? 0}px"
            style:width="{frame.figureWidth}px"
            style:transform="translateX({(offsets[characterId] ?? 0) * 100}%)"
            style:transition-duration="{walks[characterId]?.ms ?? 0}ms"
          >
            <StickFigureActor
              {characterId}
              {clock}
              cue={actors[characterId]?.cue ?? 0}
              facing={sitting[characterId] ??
                facings[characterId] ??
                resting[characterId] ??
                1}
              front={front === characterId}
              onbeat={onBeat}
              plan={actors[characterId]?.plan}
              held={set ? undefined : heldBy(characterId)}
              doing={acts[characterId]}
              hands={handsOf(characterId)}
              seated={seated[characterId] !== undefined}
              onCall={direction.lines[heldAt]?.call === characterId}
              {dress}
              talking={actors[characterId]?.talking ?? false}
              turnDelay={turns[characterId] ?? 0}
              walk={walks[characterId]}
            />
          </div>
        {/each}
        {#if frame.desk}
          <StudioDesk
            height={stageHeight}
            layer="front"
            seats={frame.seats}
            {unit}
            width={stageWidth}
          />
        {/if}
      {/if}
    </div>

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
    <div
      data-word-card
      class={cx(
        "absolute z-10 animate-rise rounded-(--control-radius) bg-surface p-3",
        "shadow-(--shadow-float) ring-1 ring-slate-200",
      )}
      style:left="{card.left}px"
      style:top="{card.top}px"
      style:width="{CARD_WIDTH}px"
      bind:offsetHeight={cardHeight}
    >
      <div class="flex items-center gap-3">
        {#if word?.src}
          <AudioButton
            label="Listen: {pickedThing.word}"
            size="sm"
            src={word.src}
            text={pickedThing.word}
          />
        {/if}

        <div class="min-w-0">
          <p class="m-0 font-serif text-lg font-semibold text-slate-900" lang="sk">
            {thingWithDemonstrative(pickedThing)}
          </p>
          <p class="m-0 text-sm text-slate-600">{pickedThing.english}</p>
        </div>
      </div>

      <p class="m-0 mt-2 text-xs text-slate-500">
        {nounGenderLabel(pickedThing.gender).english}{pickedThing.plural
          ? ", plural"
          : ""}
      </p>

      {#if word?.href}
        <TextLink class="mt-1 inline-block" href={word.href}
          >Open in the dictionary</TextLink
        >
      {/if}
    </div>
  {/if}
</div>
