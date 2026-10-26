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
  import { REST_POSE, overTable, type StickPose } from "$lib/stick-figure/pose";
  import type { Dress } from "$lib/stick-figure/dress";
  import type { Held } from "$lib/stick-figure/props";
  import { sitMs, stepMs, walkPose } from "$lib/stick-figure/walk";
  import {
    headClearOfMic,
    type Effect,
    type Emote,
    type Sign,
  } from "$lib/stick-figure/act-motions";
  import type { ObjectKind } from "$lib/stick-figure/acts";
  import StickFigure from "./StickFigure.svelte";
  import type { ObjectLook } from "./StickSetObject.svelte";

  /** Bringing the phone up to the ear, or down. */
  const PHONE_MS = 400;
  const RESTING_ARMS = {
    leadRaise: REST_POSE.leadRaise,
    leadBend: REST_POSE.leadBend,
    rearRaise: REST_POSE.rearRaise,
    rearBend: REST_POSE.rearBend,
  };
  /**
   * What spills if it hangs from the hand: soup on a spoon or ladle, coffee
   * in a cup. And a recorder, which hanging at a desk goes behind it.
   */
  const STEADY = new Set<ObjectKind>(["spoon", "ladle", "cup", "mic"]);
  /** Between moves such a thing is held up: elbow by the side, forearm a little up, the hand in front of the chest. Level, at a counter, a spoon stood on the board. */
  const STEADY_ARM = { raise: 18, bend: 104 };

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
    out = 0,
    atTable = false,
    mic,
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
    /** Rig units their chair is drawn back from its place, while they get on or off it. */
    out?: number;
    /** At their chair, about to sit or just up. */
    atTable?: boolean;
    /** Seated behind a desk mic: 1 on the side they face, -1 turned away from it. */
    mic?: 1 | -1;
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
        sign?: Partial<Record<"lead" | "rear", Sign>>;
      };
    };
    /** Objects of the set in each hand. */
    hands?: Partial<
      Record<
        "lead" | "rear",
        ObjectLook & {
          effect?: Effect["kind"];
          lands?: number;
          sunk?: { left: number; right: number; rim: number };
        }
      >
    >;
  } = $props();

  let turn = $state<Partial<Record<"lead" | "rear", number>>>({});
  let emote = $state<Emote>();
  let sign = $state<Partial<Record<"lead" | "rear", Sign>>>();

  let pose = $state<StickPose>(REST_POSE);
  // Linear: the rig shapes the hips' path and the bow along it.
  const sitting = new Tween(0);
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
        duration: still ? 0 : sitMs(characterId, !down),
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

  /** The arm of a hand holding something that spills, held up rather than at rest or gesturing; a cue's reach still takes it from there. */
  function steady(pose: StickPose): StickPose {
    const lead = hands.lead && STEADY.has(hands.lead.kind);
    const rear = hands.rear && STEADY.has(hands.rear.kind);
    // Anything else held hangs from the hand: a beat would swing a full can up to the chest.
    const leadDown = hands.lead && !lead;
    const rearDown = hands.rear && !rear;
    return {
      ...pose,
      ...(lead ? { leadRaise: STEADY_ARM.raise, leadBend: STEADY_ARM.bend } : {}),
      ...(rear ? { rearRaise: -STEADY_ARM.raise, rearBend: -STEADY_ARM.bend } : {}),
      ...(leadDown
        ? { leadRaise: REST_POSE.leadRaise, leadBend: REST_POSE.leadBend }
        : {}),
      ...(rearDown
        ? { rearRaise: REST_POSE.rearRaise, rearBend: REST_POSE.rearBend }
        : {}),
    };
  }

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
    const acting = doing && now < doing.until;
    const talked = next?.pose ?? REST_POSE;
    // Busy hands do not talk: a beat would swing the can that is pouring, or the hand the cue leaves alone.
    // Getting onto a chair or off it, the hands go to that; a talker's open hand swung into whoever sat beside.
    const busy = acting || (atTable && sitting.current < 1);
    const body = steady(
      busy ? { ...talked, ...RESTING_ARMS } : overTable(talked, sitting.current),
    );
    const stepping = walking ? walkPose(body, walked, walkMs, stepMs(characterId)) : body;
    const acted = acting ? doing.sample(now, stepping, sitting.current) : undefined;
    // A listener leaning in to a question leaned into the mic too.
    pose =
      mic && sitting.current > 0.5
        ? headClearOfMic(acted?.pose ?? stepping, sitting.current, mic)
        : (acted?.pose ?? stepping);
    turn = acted?.turn ?? {};
    emote = acted?.emote;
    sign = acted?.sign;

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
  sitPath={{ out, rising: !seated }}
  call={calling.current}
  turnDelay={turned ? 0 : turnDelay}
  {emote}
  sign={{
    lead: sign?.lead && { shape: sign.lead, turn: turn.lead ?? 0 },
    rear: sign?.rear && { shape: sign.rear, turn: turn.rear ?? 0 },
  }}
  hands={{
    lead: hands.lead && { ...hands.lead, turn: turn.lead },
    rear: hands.rear && { ...hands.rear, turn: turn.rear },
  }}
/>
