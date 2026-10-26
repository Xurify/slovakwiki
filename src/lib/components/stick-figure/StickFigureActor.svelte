<script lang="ts">
  import { untrack } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { Tween } from "svelte/motion";

  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import type { LineBeat, LinePlan } from "$lib/stick-figure/line-plan";
  import {
    performFrame,
    planTime,
    startPerformance,
    type PerformanceState,
    type SpeechClock,
  } from "$lib/stick-figure/performance";
  import type { StickPictureId } from "$lib/stick-figure/pictures";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import type { Dress } from "$lib/stick-figure/dress";
  import type { Held } from "$lib/stick-figure/props";
  import { walkPose } from "$lib/stick-figure/walk";
  import type { Emote } from "$lib/stick-figure/act-motions";
  import type { ObjectKind } from "$lib/stick-figure/acts";
  import StickFigure from "./StickFigure.svelte";

  /** Sitting down or getting up takes about as long as a step and a half. */
  const SIT_MS = 600;
  /** Bringing the phone up to the ear, or down. */
  const PHONE_MS = 400;

  let {
    characterId,
    clock,
    cue = 0,
    facing = 1,
    front = false,
    onbeat,
    plan,
    held,
    dress,
    seated = false,
    onCall = false,
    talking = false,
    turnDelay = 0,
    walk,
    doing,
    hands = {},
  }: {
    characterId: LessonCharacterId;
    /** Playback position of the line's clip; without one the line runs on the wall clock. */
    clock?: () => SpeechClock | undefined;
    /** Bump to perform `plan` from the start. */
    cue?: number;
    facing?: 1 | -1;
    /** Talking to the listeners: the head turned to the front. */
    front?: boolean;
    onbeat?: (beat: LineBeat) => void;
    plan?: LinePlan;
    /** In the lead hand. */
    held?: Held;
    /** What the weather on them does to what they wear. */
    dress?: Dress;
    /** On a chair: they sit once any walk there is over, and get up before walking on. */
    seated?: boolean;
    /** On a call: the phone at their ear. */
    onCall?: boolean;
    /** True while the line `plan` belongs to plays: this figure's own, or one it reacts to. */
    talking?: boolean;
    /** Ms before a change of `facing` starts. */
    turnDelay?: number;
    /** Bump `cue` to take steps for `ms` while the stage moves the figure. */
    walk?: { cue: number; ms: number };
    /** What the figure does on cue, over its talking: reach, taste, fan its mouth. A new object starts it. */
    doing?: {
      /** Wall time it is over; the last pose holds until then if `hold`. */
      until: number;
      sample(
        now: number,
        base: StickPose,
        sit: number,
      ): {
        pose: StickPose;
        turn: Partial<Record<"lead" | "rear", number>>;
        emote?: Emote;
      };
    };
    /** Objects of the set in each hand. */
    hands?: Partial<
      Record<"lead" | "rear", { full?: boolean; heat?: number; kind: ObjectKind }>
    >;
  } = $props();

  let turn = $state<Partial<Record<"lead" | "rear", number>>>({});
  let emote = $state<Emote>();

  let pose = $state<StickPose>(REST_POSE);
  const sitting = new Tween(0, { easing: cubicInOut });
  const calling = new Tween(0, { easing: cubicInOut });

  let picture = $state<StickPictureId>();
  /** The way a point in flight turns the figure, when its target is behind it. */
  let turned = $state<1 | -1>();

  let frame = 0;
  let startedAt = 0;
  let act: PerformanceState = startPerformance();
  let reducedMotion = false;
  let walkStartedAt = 0;
  let walkMs = 0;
  let walkCue = 0;

  $effect(() => {
    if (cue === 0) return;

    untrack(() => {
      startedAt = performance.now();
      act = startPerformance(startedAt, $state.snapshot(pose));
      run();
    });
  });

  $effect(() => {
    if (talking) untrack(run);
  });

  $effect(() => {
    // The stage hands out a new record of walks whenever anyone walks; only a
    // new cue means this figure steps, or it would walk on the spot.
    if (!walk?.cue || walk.cue === walkCue) return;
    walkCue = walk.cue;
    const ms = walk.ms;

    untrack(() => {
      walkStartedAt = performance.now();
      walkMs = ms;
      run();
    });
  });

  // After the walk's effect, so a walk to the chair this same line is counted.
  /** Seated as the stage first places the cast (behind the studio desk), a figure is just there. */
  let placedAt = 0;
  $effect(() => {
    const down = seated;
    untrack(() => {
      placedAt ||= performance.now();
      const still =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        performance.now() - placedAt < 250;
      const walkLeft = Math.max(0, walkStartedAt + walkMs - performance.now());
      void sitting.set(down ? 1 : 0, {
        delay: down && !still ? walkLeft : 0,
        duration: still ? 0 : SIT_MS,
      });
    });
  });

  $effect(() => {
    const up = onCall;
    untrack(() => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      void calling.set(up ? 1 : 0, { duration: still ? 0 : PHONE_MS });
    });
  });

  $effect(() => {
    if (doing) untrack(run);
  });

  $effect(() => () => cancelAnimationFrame(frame));

  function run(): void {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  // The loop runs only while a line, its last gesture, a picture or a walk is in
  // flight, then parks on the rest pose: no idle motion between lines.
  function tick(now: number): void {
    const next = plan
      ? performFrame(plan, act, {
          now,
          reducedMotion,
          speechMs: planTime(plan, clock?.(), now - startedAt),
          talking,
        })
      : undefined;
    if (next?.started) onbeat?.(next.started);
    if (next) act = next.state;
    if (next?.facing !== turned) turned = next?.facing;
    if (next?.picture !== picture) picture = next?.picture;

    const walked = now - walkStartedAt;
    const walking = walked < walkMs && !reducedMotion;
    const body = next?.pose ?? REST_POSE;
    const stepping = walking ? walkPose(body, walked, walkMs) : body;
    const acting = doing && now < doing.until;
    const acted = acting ? doing.sample(now, stepping, sitting.current) : undefined;
    pose = acted?.pose ?? stepping;
    turn = acted?.turn ?? {};
    emote = acted?.emote;

    frame =
      !(next?.settled ?? true) || walking || acting ? requestAnimationFrame(tick) : 0;
  }
</script>

<StickFigure
  {characterId}
  facing={turned ?? facing}
  {front}
  {picture}
  {pose}
  {held}
  {dress}
  sit={sitting.current}
  call={calling.current}
  turnDelay={turned ? 0 : turnDelay}
  {emote}
  hands={{
    lead: hands.lead && { ...hands.lead, turn: turn.lead },
    rear: hands.rear && { ...hands.rear, turn: turn.rear },
  }}
/>
