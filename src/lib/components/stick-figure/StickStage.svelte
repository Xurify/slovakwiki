<script lang="ts">
  import { untrack } from "svelte";

  import AudioButton from "$lib/audio/AudioButton.svelte";
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { nounGenderLabel } from "$lib/catalog/types";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import {
    playStoryLineAudio,
    stopStoryLineAudio,
    storyAudioClock,
  } from "$lib/lesson-story/story-audio";
  import { lessonSceneSrc } from "$lib/lesson-story/story-settings";
  import {
    gestureDuration,
    gesturePeak,
    type StickGestureId,
  } from "$lib/stick-figure/gestures";
  import {
    gesturePlan,
    reactionPlan,
    type LineBeat,
    type LinePlan,
    type PointTarget,
  } from "$lib/stick-figure/line-plan";
  import { REST_POSE } from "$lib/stick-figure/pose";
  import { STICK_BOX, solveRig, type Point } from "$lib/stick-figure/rig";
  import type { DirectedLine, SceneDirection } from "$lib/stick-figure/scene-direction";
  import {
    aimAt,
    backdropAlign,
    backdropToStage,
    boxCenter,
    figureToStage,
    litKey,
    thingBoxes,
    thingCenter,
    thingWithDemonstrative,
  } from "$lib/stick-figure/scene-things";
  import { DAYTIME, isOutdoors, type SceneMood } from "$lib/stick-figure/scene-mood";
  import { STAGE_PADDING, STAGE_POSTS, stageMarks } from "$lib/stick-figure/stage-layout";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import {
    restFacing,
    type CastFacing,
    type Facing,
    type LineStaging,
  } from "$lib/stick-figure/staging";
  import { playTramCue } from "$lib/stick-figure/ambience";
  import { TRAM, type TramState } from "$lib/stick-figure/street";
  import { stepsFor, walkDuration } from "$lib/stick-figure/walk";
  import { cx } from "$lib/ui/classes";
  import StickBackdrop from "./StickBackdrop.svelte";
  import StickFigureActor from "./StickFigureActor.svelte";

  interface ActorState {
    cue: number;
    plan?: LinePlan;
    talking: boolean;
  }

  /** Figure widths each figure stands from its mark. */
  type Offsets = Partial<Record<LessonCharacterId, number>>;

  /** Where a figure's box is drawn, before any walk moves it. */
  interface Mark {
    left: number;
    top: number;
    width: number;
  }

  let {
    class: className = "",
    direction,
    found = [],
    lines,
    mood = DAYTIME,
    onthing,
    painted = false,
    setting,
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
    /** Show the painted lesson plate instead of the drawn backdrop. */
    painted?: boolean;
    setting: StageSetting;
    /** Dictionary link and clip for a thing's word, keyed by the word. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  /** The stage's bottom padding, where the figures' feet stand. */
  const FLOOR = 12;
  /** Centre to centre, in figure widths, when one figure stands beside another to look at something. */
  const BESIDE_WIDTHS = 0.8;
  const LIT_MS = 1600;
  /** Long enough to read a short line said in a bubble. */
  const BUBBLE_MS = 2800;
  const CARD_WIDTH = 220;
  /** Where an arm leaves the body, and where a hand holds a prop out to show it, in rig space. */
  const SHOULDER: Point = { x: 0, y: solveRig(REST_POSE).leadShoulder.y };
  const SHOWN_HAND: Point = solveRig(gesturePeak("show")).leadArm.end;

  let actors = $state<Partial<Record<LessonCharacterId, ActorState>>>({});
  let facings = $state<CastFacing>({});
  let offsets = $state<Offsets>({});
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
  let tram = $state<TramState>("away");
  let stageWidth = $state(0);
  let stageHeight = $state(0);

  /** When each walk in flight ends, on the `performance.now()` clock. */
  let walkEndsAt: Partial<Record<LessonCharacterId, number>> = {};
  /** Never reset, so a figure's next walk always has a cue it has not seen. */
  let walkCount = 0;
  let playToken = 0;
  let lineTimer = 0;

  const resting = $derived(restFacing(direction.cast));
  const holding = $derived(
    (handedAt === heldAt ? direction.handed[heldAt] : undefined) ??
      direction.held[heldAt] ??
      {},
  );
  /** The studio and the street have no painted plate, so they stay drawn. */
  const plate = $derived(painted ? plateFor(setting) : undefined);
  const wrapped = $derived(mood.weather === "snow" && isOutdoors(setting));
  const entering = $derived(
    Object.fromEntries(
      direction.stagings.flatMap(({ enter }) =>
        enter ? [[enter.characterId, enter.from]] : [],
      ),
    ) as Partial<Record<LessonCharacterId, Facing>>,
  );
  const post = $derived(STAGE_POSTS[setting]);
  const layout = $derived(
    stageMarks(
      direction.cast,
      entering,
      stageWidth,
      post === undefined || !stageWidth
        ? undefined
        : backdropToStage(
            { x: post, y: 0 },
            stageWidth,
            stageHeight,
            backdropAlign(setting),
          ).x,
      stageHeight || undefined,
    ),
  );
  const pickedThing = $derived(direction.things.find((thing) => thing.id === picked));
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
      top:
        under <= lowest
          ? under
          : over >= 8
            ? over
            : Math.min(Math.max(8, centre.y - cardHeight / 2), Math.max(8, lowest)),
    };
  });

  // A new scene, or an edit to the script, starts everyone where its first line finds them.
  $effect(() => {
    void direction;
    untrack(() => {
      stop();
      actors = {};
      picked = undefined;
      lit = [];
      place(0);
    });
  });

  function plateFor(setting: StageSetting): string | undefined {
    if (setting === "street" || setting === "studio") return undefined;
    return lessonSceneSrc[setting];
  }

  function markOf(id: LessonCharacterId): Mark {
    const width = layout.width;
    return {
      left: layout.marks[id] ?? 0,
      top: stageHeight - FLOOR - (width * STICK_BOX.height) / STICK_BOX.width,
      width,
    };
  }

  function standing(mark: Mark, offset = 0): Mark {
    return { ...mark, left: mark.left + offset * mark.width };
  }

  /** Walk a figure to `offset` figure widths from its mark, a step at a time. */
  function walkTo(id: LessonCharacterId, offset: number): void {
    const from = offsets[id] ?? 0;
    if (from === offset) return;

    const ms = walkDuration(stepsFor(offset - from));
    walkCount += 1;
    walks = { ...walks, [id]: { cue: walkCount, ms } };
    offsets = { ...offsets, [id]: offset };
    // Reduced motion puts the figure there at once, so nobody waits on the walk.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      walkEndsAt[id] = performance.now() + ms;
    }
  }

  /** Figure widths from a figure's mark to where it stands beside `to`, wherever `to` stands in `at`. */
  function beside(
    id: LessonCharacterId,
    to: LessonCharacterId,
    toward: Facing,
    at: Offsets = offsets,
  ): number {
    if (!stageWidth) return toward * 0.5;

    const mark = markOf(id);
    const gap = (standing(markOf(to), at[to]).left - mark.left) / mark.width;
    const now = at[id] ?? 0;
    // Close enough already, after a walk the two made together, is close enough.
    return Math.abs(gap - now) > BESIDE_WIDTHS
      ? gap - Math.sign(gap - now) * BESIDE_WIDTHS
      : now;
  }

  /** Figure widths from a figure's mark to just past the stage edge on that side. */
  function offStage(id: LessonCharacterId, direction: Facing): number {
    if (!stageWidth) return direction * 4;

    const mark = markOf(id);
    const distance = direction > 0 ? stageWidth - mark.left : mark.left + mark.width;
    return direction * (distance / mark.width + 0.1);
  }

  /** Whether a figure stands on the stage, as opposed to off one side of it. */
  function onStage(id: LessonCharacterId, at: Offsets): boolean {
    const mark = standing(markOf(id), at[id]);
    return mark.left + mark.width > 0 && mark.left < stageWidth;
  }

  /**
   * Figure widths everyone on stage moves, keeping their places in the row,
   * to stand centred on stage x `to`, or as near as the stage edge allows.
   */
  function shiftTo(to: number, at: Offsets): { by: number; ids: LessonCharacterId[] } {
    const ids = direction.cast.filter((id) => onStage(id, at));
    if (!stageWidth || ids.length === 0) return { by: 0, ids };

    const marks = ids.map((id) => standing(markOf(id), at[id]));
    const left = Math.min(...marks.map((mark) => mark.left));
    const right = Math.max(...marks.map((mark) => mark.left + mark.width));
    const shift = to - (left + right) / 2;
    const clamped = Math.min(
      stageWidth - STAGE_PADDING - right,
      Math.max(STAGE_PADDING - left, shift),
    );
    return { by: clamped / marks[0].width, ids };
  }

  /** Stage x of where a line takes everyone: a thing it names, or the tram's door. */
  function destinationOf(staging: LineStaging, boarding: boolean): number | undefined {
    const thing = direction.things.find((candidate) => candidate.id === staging.goTo);
    const point = boarding ? { x: TRAM.door, y: 0 } : thing && thingCenter(thing);
    if (!point || !stageWidth) return undefined;
    return backdropToStage(point, stageWidth, stageHeight, backdropAlign(setting)).x;
  }

  /** Walk everyone on stage over to stand by stage x `to`, facing the way they go. */
  function walkGroup(to: number): void {
    const { by, ids } = shiftTo(to, offsets);
    if (by === 0) return;

    facings = {
      ...facings,
      ...Object.fromEntries(ids.map((id) => [id, by > 0 ? 1 : -1])),
    };
    for (const id of ids) walkTo(id, (offsets[id] ?? 0) + by);
  }

  function boardBefore(index: number): string | undefined {
    return lines.slice(0, index).findLast((line) => line.characterId === null)?.slovak;
  }

  /** Put everyone where line `index` finds them, as if the scene had played to it, without walking there. */
  export function place(index: number): void {
    let placedFacings: CastFacing = {};
    const placed: Offsets = {};

    for (const { enter } of direction.stagings) {
      if (enter) placed[enter.characterId] = offStage(enter.characterId, enter.from);
    }

    direction.stagings.slice(0, index).forEach((staging, at) => {
      const speaker = lines[at].characterId;
      placedFacings = { ...placedFacings, ...staging.facing };

      if (staging.enter) placed[staging.enter.characterId] = 0;
      if (staging.approach && speaker) {
        const { characterId, toward } = staging.approach;
        placed[characterId] = beside(characterId, speaker, toward, placed);
      }
      if (staging.exit && speaker) {
        placedFacings[speaker] = staging.exit;
        placed[speaker] = offStage(speaker, staging.exit);
      }
      const to =
        staging.goTo || staging.boards
          ? destinationOf(staging, Boolean(staging.boards))
          : undefined;
      if (to !== undefined) {
        const { by, ids } = shiftTo(to, placed);
        for (const id of ids) {
          placed[id] = (placed[id] ?? 0) + by;
          if (by !== 0) placedFacings[id] = by > 0 ? 1 : -1;
        }
      }
    });

    facings = placedFacings;
    offsets = placed;
    walks = {};
    walkEndsAt = {};
    tram = direction.stagings.slice(0, index).some(({ arrives }) => arrives)
      ? "here"
      : "away";
    heldAt = index - 1;
    handedAt = index - 1;
    board = boardBefore(index);
  }

  /** Stage px of what a point aims at, as everyone stands now. */
  function targetOf(target: PointTarget): Point | undefined {
    if (target.kind === "thing") {
      const thing = direction.things.find((candidate) => candidate.id === target.id);
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
      standing(markOf(target.holder), offsets[target.holder]),
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
    const from = figureToStage(SHOULDER, standing(markOf(id), offsets[id]), 1);
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
      const mark = standing(markOf(id), offsets[id]);
      if (mark.left + mark.width < 0 || mark.left > stageWidth) continue;

      const centre = mark.left + mark.width / 2;
      if (Math.abs(to.x - centre) > mark.width * 0.2) {
        facings = { ...facings, [id]: to.x > centre ? 1 : -1 };
      }
      gesture(id, "glance");
    }

    window.setTimeout(() => {
      if (token !== playToken) return;
      facings = { ...facings, ...direction.stagings[heldAt]?.facing };
    }, gestureDuration("glance"));
  }

  function cueActor(id: LessonCharacterId, plan: LinePlan | undefined): void {
    actors[id] = { cue: (actors[id]?.cue ?? 0) + 1, plan, talking: true };
  }

  export function size(): { height: number; width: number } {
    return { height: stageHeight, width: stageWidth };
  }

  /** Ms until `id` reaches where they are walking, 0 when they stand. */
  export function walking(id: LessonCharacterId | null): number {
    return id ? Math.max(0, (walkEndsAt[id] ?? 0) - performance.now()) : 0;
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
    offsets = { ...offsets, [id]: offStage(id, from) };

    const cast = direction.cast;
    const turned = Object.fromEntries(
      cast
        .filter((other) => other !== id)
        .map((other) => [other, cast.indexOf(id) > cast.indexOf(other) ? 1 : -1]),
    );
    facings = { ...facings, ...turned, [id]: from === 1 ? -1 : 1 };
    // The jump off stage has to paint before the walk back, or it animates too.
    window.requestAnimationFrame(() => walkTo(id, 0));
  }

  /** A line in a speech bubble over a figure, for words that have no clip: a wrong guess said aloud. */
  export function say(id: LessonCharacterId, text: string): void {
    window.clearTimeout(bubbleTimer);
    bubble = { characterId: id, cue: (bubble?.cue ?? 0) + 1, text };
    bubbleTimer = window.setTimeout(() => {
      bubble = undefined;
    }, BUBBLE_MS);
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
    const plan = take?.plan ?? direction.plans[index];
    const staging = direction.stagings[index];
    if (!line) return;

    heldAt = index;
    handedAt = -1;
    if (line.characterId === null) board = line.slovak;

    for (const actor of Object.values(actors)) actor.talking = false;
    facings = { ...facings, ...staging?.facing };
    if (line.characterId && plan) {
      const aimed = aimLine(
        line.characterId,
        plan,
        Boolean(direction.held[index]?.[line.characterId]),
      );
      if (aimed.facing) facings = { ...facings, [line.characterId]: aimed.facing };
      cueActor(line.characterId, aimed.plan);
    }
    if (staging?.approach && line.characterId) {
      const { characterId, toward } = staging.approach;
      walkTo(characterId, beside(characterId, line.characterId, toward));
    }
    if (staging?.enter) {
      const { characterId, from } = staging.enter;
      facings = { ...facings, [characterId]: from === 1 ? -1 : 1 };
      walkTo(characterId, 0);
    }
    if (staging?.goTo) {
      const to = destinationOf(staging, false);
      if (to !== undefined) walkGroup(to);
    }
    if (staging?.arrives) tram = "coming";

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
      if (staging?.exit && line.characterId) {
        facings = { ...facings, [line.characterId]: staging.exit };
        walkTo(line.characterId, offStage(line.characterId, staging.exit));
      }
      if (staging?.boards) {
        const to = destinationOf(staging, true);
        if (to !== undefined) walkGroup(to);
      }
      if (direction.stagings[index + 1]?.arrives) playTramCue();
      onDone?.();
    };

    const src = take?.src ?? line.src;
    if (src) {
      playStoryLineAudio(src, line.slovak, { onEnded, playbackRate: rate });
      return;
    }

    // No clip yet: run the line for its text-timed length on the wall clock.
    stopStoryLineAudio();
    window.clearTimeout(lineTimer);
    lineTimer = window.setTimeout(onEnded, (plan?.durationMs ?? 1600) / rate);
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

<div
  class={cx(
    // Twice as wide as tall up to 300px, so a phone sees most of the place rather than a slice of its middle.
    "relative aspect-[2/1] max-h-[300px] w-full overflow-hidden",
    className,
  )}
  bind:clientWidth={stageWidth}
  bind:clientHeight={stageHeight}
>
  {#if plate}
    <img
      class="absolute inset-0 size-full object-cover object-center"
      src={plate}
      alt=""
      width="1536"
      height="1024"
      decoding="async"
    />
  {:else}
    <StickBackdrop
      class="absolute inset-0 size-full"
      {board}
      {found}
      height={stageHeight}
      {lit}
      {mood}
      onpick={pickThing}
      {picked}
      {setting}
      {tram}
      width={stageWidth}
    />
  {/if}

  {#each direction.cast as characterId (characterId)}
    <div
      class="pointer-events-none absolute transition-transform ease-linear"
      style:bottom="{FLOOR}px"
      style:left="{layout.marks[characterId] ?? 0}px"
      style:width="{layout.width}px"
      style:transform="translateX({(offsets[characterId] ?? 0) * 100}%)"
      style:transition-duration="{walks[characterId]?.ms ?? 0}ms"
    >
      <StickFigureActor
        {characterId}
        clock={storyAudioClock}
        cue={actors[characterId]?.cue ?? 0}
        facing={facings[characterId] ?? resting[characterId] ?? 1}
        onbeat={onBeat}
        plan={actors[characterId]?.plan}
        prop={holding[characterId]}
        furled={mood.weather !== "rain"}
        scarf={wrapped}
        talking={actors[characterId]?.talking ?? false}
        walk={walks[characterId]}
      />
    </div>
  {/each}

  {#if bubble}
    {@const mark = standing(markOf(bubble.characterId), offsets[bubble.characterId])}
    {@const head = mark.left + mark.width / 2}
    {@const centre = Math.min(Math.max(head, 128), Math.max(128, stageWidth - 128))}
    {#key bubble.cue}
      <p
        class={cx(
          "absolute z-10 m-0 max-w-60 -translate-x-1/2 animate-rise rounded-(--control-radius)",
          "bg-surface px-3 py-2 font-serif text-base text-slate-900 shadow-(--shadow-float) ring-1 ring-slate-200",
        )}
        style:left="{centre}px"
        style:bottom="{stageHeight - mark.top + 8}px"
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

  {#if pickedThing && card && !plate}
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
