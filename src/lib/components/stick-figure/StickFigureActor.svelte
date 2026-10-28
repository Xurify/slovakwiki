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
  import {
    REST_POSE,
    easeInOut,
    lerpPose,
    overTable,
    type StickPose,
  } from "$lib/stick-figure/pose";
  import type { Dress } from "$lib/stick-figure/dress";
  import type { Held } from "$lib/stick-figure/props";
  import { alive } from "$lib/stick-figure/idle";
  import { restOnTable } from "$lib/stick-figure/reach";
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
    arrived = true,
    out = 0,
    atTable = false,
    atDesk = false,
    mic,
    onCall = false,
    relaying = false,
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
    /** The stage has shown the cast: until then a seat is taken at once, not sat down into. */
    arrived?: boolean;
    /** On a chair: they sit once any walk there is over, and get up before walking on. */
    seated?: boolean;
    /** Rig units their chair is drawn back from its place, while they get on or off it. */
    out?: number;
    /** At their chair, about to sit or just up. */
    atTable?: boolean;
    /** Seated behind the studio desk, whose top is lower than a table's. */
    atDesk?: boolean;
    /** Seated behind a desk mic: 1 on the side they face, -1 turned away from it. */
    mic?: 1 | -1;
    /** On a call: the phone at their ear. */
    onCall?: boolean;
    /** Playing the far end of the call out loud: a robot with no phone to hold. */
    relaying?: boolean;
    /** True while the line `plan` belongs to plays: this figure's own, or one it reacts to. */
    talking?: boolean;
    /** Ms before a change of `facing` starts. */
    turnDelay?: number;
    /** Bump `cue` to take steps for `ms` while the stage moves the figure. */
    walk?: { cue: number; ms: number; pace?: number };
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
          id?: string;
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
  let rawPose: StickPose = REST_POSE;
  // Linear: the rig shapes the hips' path and the bow along it.
  const sitting = new Tween(0);
  const calling = new Tween(0, { easing: cubicInOut });

  let picture = $state<StickPictureId>();
  /** The way a point in flight turns the figure, when its target is behind it. */
  let turned = $state<1 | -1>();

  let frame = 0;
  let startedAt = 0;
  let act: PerformanceState = startPerformance();
  /**
   * Where a cue left the body, eased out of over RELEASE_MS: the talking
   * pose that takes over holds the arms elsewhere, and a hand fanning a
   * burnt mouth dropped to the hip in one frame.
   */
  const RELEASE_MS = 300;
  let lastActed:
    { pose: StickPose; turn: Partial<Record<"lead" | "rear", number>> } | undefined;
  let released: (typeof lastActed & { at: number }) | undefined;
  /**
   * Where the body was as a cue began, eased out of over ENTER_MS: a cue
   * takes the arms from the rest pose, so a talking hand out over the pot
   * jumped to the hip before it went for the salt.
   */
  const ENTER_MS = 250;
  let entered: { pose: StickPose; at: number; doing: typeof doing } | undefined;
  let reducedMotion = false;
  let walkStartedAt = 0;
  let walkMs = 0;
  /** Steps per step of a walk: above 1 a run, the legs going round that much faster. */
  let walkPace = 1;
  let walkCue = 0;

  $effect(() => {
    if (cue === 0) return;

    untrack(() => {
      startedAt = performance.now();
      act = startPerformance(startedAt, rawPose);
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
    const { ms, pace = 1 } = walk;

    untrack(() => {
      walkStartedAt = performance.now();
      walkMs = ms;
      walkPace = pace;
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
        !arrived ||
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

  // Breathing from the start, before any line plays.
  $effect(() => {
    untrack(run);
    return () => cancelAnimationFrame(frame);
  });

  /** The arm of a hand holding something that spills, held up rather than at rest or gesturing; a cue's reach still takes it from there. */
  function steady(pose: StickPose): StickPose {
    const lead = hands.lead && STEADY.has(hands.lead.kind);
    const rear = hands.rear && STEADY.has(hands.rear.kind);
    // Anything else held hangs from the hand: a beat would swing a full can up to the chest. At the table it lies on it.
    const leadDown = hands.lead && !lead && !atTable && !atDesk;
    const rearDown = hands.rear && !rear && !atTable && !atDesk;
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

  // Between lines the loop keeps the figure breathing and blinking (idle.ts);
  // with reduced motion it parks on the rest pose once nothing is in flight.
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
    rawPose = talked;
    // Busy hands do not talk: a beat would swing the can that is pouring, or the hand the cue leaves alone.
    // Getting onto a chair or off it, the hands go to that; a talker's open hand swung into whoever sat beside.
    const busy = acting || (atTable && sitting.current < 1);
    const seated = busy
      ? { ...talked, ...RESTING_ARMS }
      : overTable(talked, sitting.current);
    // A desk host is at their chair too, but the desk's top is lower than a table's.
    const laid = atDesk
      ? restOnTable(seated, sitting.current, "desk")
      : atTable
        ? restOnTable(seated, sitting.current)
        : seated;
    const body = steady(laid);
    const stepping = walking
      ? walkPose(body, walked, walkMs, stepMs(characterId) / walkPace, characterId)
      : body;
    const sampled = acting ? doing.sample(now, stepping, sitting.current) : undefined;
    if (sampled && entered?.doing !== doing) {
      entered = { pose: $state.snapshot(pose), at: now, doing };
    }
    const entering =
      sampled && entered && !reducedMotion
        ? easeInOut(Math.min(1, (now - entered.at) / ENTER_MS))
        : 1;
    const acted =
      sampled && entered && entering < 1
        ? { ...sampled, pose: lerpPose(entered.pose, sampled.pose, entering) }
        : sampled;
    if (acted) {
      lastActed = { pose: acted.pose, turn: acted.turn };
      released = undefined;
    } else if (lastActed) {
      released = reducedMotion ? undefined : { ...lastActed, at: now };
      lastActed = undefined;
    }
    const easing = released
      ? easeInOut(Math.min(1, (now - released.at) / RELEASE_MS))
      : 1;
    const still = released ? lerpPose(released.pose, stepping, easing) : stepping;
    const living = reducedMotion
      ? (acted?.pose ?? still)
      : alive(acted?.pose ?? still, now, characterId, !acted && !released);
    // A listener leaning in to a question leaned into the mic too.
    pose =
      mic && sitting.current > 0.5
        ? headClearOfMic(living, sitting.current, mic)
        : living;
    turn =
      acted?.turn ??
      (released
        ? Object.fromEntries(
            Object.entries(released.turn).map(([hand, degrees]) => [
              hand,
              (degrees ?? 0) * (1 - easing),
            ]),
          )
        : {});
    if (easing >= 1) released = undefined;
    emote = acted?.emote;
    sign = acted?.sign;

    frame =
      !reducedMotion || !(next?.settled ?? true) || walking || acting || released
        ? requestAnimationFrame(tick)
        : 0;
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
  {relaying}
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
