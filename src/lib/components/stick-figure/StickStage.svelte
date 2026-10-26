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
  import { REST_POSE } from "$lib/stick-figure/pose";
  import { solveRig, type Point } from "$lib/stick-figure/rig";
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
  import { playSteps, playTramCue, stopCues } from "$lib/stick-figure/ambience";
  import type { TramState } from "$lib/stick-figure/street";
  import { STEP_MS, stepsFor, walkDuration } from "$lib/stick-figure/walk";
  import { cx } from "$lib/ui/classes";
  import StickBackdrop from "./StickBackdrop.svelte";
  import StickWeather from "./StickWeather.svelte";
  import StickFigureActor from "./StickFigureActor.svelte";
  import StickFurniture from "./StickFurniture.svelte";
  import StickLeash from "./StickLeash.svelte";
  import StudioDesk from "./StudioDesk.svelte";
  import { STICK_BOX } from "$lib/stick-figure/rig";

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
    if (prop === "umbrella") return { id: prop, open: umbrellas[id] ?? dress.umbrellaUp };
    // A lead is open once it is on the dog.
    if (prop === "leash") return { id: prop, open: dog !== undefined };
    return { id: prop };
  }

  const dog = $derived(direction.cast.find((id) => LOOKS[id].dog));
  /** The robot on a call while the far end speaks: it plays the voice out loud. */
  let relaying = $state<LessonCharacterId>();

  const leashed = $derived(
    dog !== undefined && direction.cast.some((id) => holding[id] === "leash"),
  );

  /** Put every umbrella down: the rain has stopped, or they are getting on the tram. */
  export function foldUmbrellas(): void {
    umbrellas = Object.fromEntries(Object.keys(umbrellas).map((id) => [id, false]));
  }

  /** Put everyone where line `index` finds them, as if the scene had played to it, without walking there. */
  export function place(index: number): void {
    // Nobody walks there, so no walk scheduled before should go on sounding.
    stopCues();
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
    playToken += 1;
    stopCues();
    window.clearTimeout(lineTimer);
    window.clearTimeout(bubbleTimer);
    bubble = undefined;
    stopStoryLineAudio();
    for (const actor of Object.values(actors)) actor.talking = false;
    relaying = undefined;
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
      if (staging) block(endLine(blocking(), staging, speaker, frame));
      if (staging?.boards) foldUmbrellas();
      if (stagings[index + 1]?.arrives) playTramCue();
      onDone?.();
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
      taken={Object.values(holding).filter((prop) => prop !== undefined)}
      {tram}
      width={stageWidth}
    />
    <StickWeather height={stageHeight} {mood} {setting} width={stageWidth} />

    <!-- Unmeasured, the server's render and the first frame would draw the cast tiny in a corner. -->
    {#if measured}
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
          unit={frame.figureWidth / STICK_BOX.width}
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
            held={heldBy(characterId)}
            seated={seated[characterId] !== undefined}
            onCall={direction.lines[heldAt]?.call === characterId}
            relaying={relaying === characterId}
            {dress}
            talking={actors[characterId]?.talking ?? false}
            turnDelay={turns[characterId] ?? 0}
            walk={walks[characterId]}
          />
        </div>
      {/each}
      {#if leashed}
        <!-- Short enough to hang in a gentle dip at heel and pull straight a step further off. -->
        <StickLeash length={frame.figureWidth * 0.8} />
      {/if}
      {#if frame.desk}
        <StudioDesk
          height={stageHeight}
          layer="front"
          seats={frame.seats}
          unit={frame.figureWidth / STICK_BOX.width}
          width={stageWidth}
        />
      {/if}
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
