<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import { TURN_MS } from "$lib/stick-figure/turns";
  import {
    GROUND_Y,
    solveRig,
    STICK_VIEWBOX,
    type Point,
    type StickLimb,
  } from "$lib/stick-figure/rig";
  import type { StickPictureId } from "$lib/stick-figure/pictures";
  import { dressFor, type Dress } from "$lib/stick-figure/dress";
  import { limbPath, n, sleevePath } from "$lib/stick-figure/draw";
  import { LOOKS } from "$lib/stick-figure/looks";
  import type { Held } from "$lib/stick-figure/props";
  import type { Emote } from "$lib/stick-figure/act-motions";
  import type { Effect } from "$lib/stick-figure/act-motions";
  import { mouthOf } from "$lib/stick-figure/reach";
  import { OBJECT_SIZE } from "$lib/stick-figure/set-pieces";
  import StickHead from "./StickHead.svelte";
  import StickSetObject, { type ObjectLook } from "./StickSetObject.svelte";
  import StickHeld from "./StickHeld.svelte";
  import StickPicture from "./StickPicture.svelte";
  import StickProp from "./StickProp.svelte";
  import StickTorso from "./StickTorso.svelte";
  import { cubicInOut } from "svelte/easing";
  import { prefersReducedMotion, Tween } from "svelte/motion";
  import { untrack } from "svelte";

  let {
    characterId,
    class: className = "",
    facing = 1,
    front = false,
    picture,
    pose = REST_POSE,
    held,
    sit = 0,
    call = 0,
    dress = dressFor("clear"),
    turnDelay = 0,
    hands = {},
    emote,
  }: {
    characterId: LessonCharacterId;
    class?: string;
    facing?: 1 | -1;
    /** Talking to the listeners: the face turned to the front instead of three-quarters to the side. */
    front?: boolean;
    /** Shown in a bubble over the head, the right way round whichever way the figure faces. */
    picture?: StickPictureId;
    pose?: StickPose;
    /** In the lead hand. */
    held?: Held;
    /** 0 standing, 1 sitting on a chair. */
    sit?: number;
    /** 0 the phone in hand or none, 1 held at the ear. */
    call?: number;
    /** What the weather on them does to what they wear. */
    dress?: Dress;
    /** Ms before a change of `facing` starts: a listener turns a beat after the speaker. */
    turnDelay?: number;
    /** Objects of the set in each hand, turned `turn` degrees from upright. */
    hands?: Partial<Record<"lead" | "rear", InHand>>;
    /** A mark at the mouth: heat off a burnt tongue, a breath blown on a spoon. */
    emote?: Emote;
  } = $props();

  interface InHand extends ObjectLook {
    turn?: number;
    /** Water, salt or peel coming off it while a cue pours, shakes or peels. */
    effect?: Effect["kind"];
  }

  /** Where water, salt or peel leaves each kind, in its own drawing's space. */
  const TIP: Partial<Record<InHand["kind"], Point>> = {
    jug: { x: 7, y: -12 },
    can: { x: 14, y: -12 },
    ladle: { x: 0, y: -17 },
    salt: { x: 0, y: -9 },
    knife: { x: 5, y: -1 },
  };

  /** Where the tip of an object held at `at` is, turned `turn` degrees, in the figure's space. */
  function tipOf(at: Point, object: InHand): Point {
    const tip = TIP[object.kind] ?? { x: 0, y: 0 };
    const { grip } = OBJECT_SIZE[object.kind];
    const x = tip.x - grip.x;
    const y = tip.y + grip.y;
    const angle = ((object.turn ?? 0) * Math.PI) / 180;
    return {
      x: at.x + x * Math.cos(angle) - y * Math.sin(angle),
      y: at.y + x * Math.sin(angle) + y * Math.cos(angle),
    };
  }

  /**
   * The rear hand at the near ear, which the three-quarter view puts on the
   * back of the head, the elbow out below the shoulder: solved on the rig.
   */
  const EAR = { rearRaise: 94, rearBend: -254 };
  function atEar(from: StickPose, amount: number): StickPose {
    if (amount <= 0) return from;
    return {
      ...from,
      rearRaise: from.rearRaise + (EAR.rearRaise - from.rearRaise) * amount,
      rearBend: from.rearBend + (EAR.rearBend - from.rearBend) * amount,
    };
  }
  /** Most of the way up, the phone has changed hands to the one at the ear. */
  const phoneAtEar = $derived(
    call > 0.5 && (held?.id === "phone" || hands.rear?.kind === "phone"),
  );

  const rig = $derived(solveRig(atEar(pose, call), sit));
  /** The lead hand up at the lips with something in it: a spoon to taste, a cup to drink. */
  const leadAtMouth = $derived.by(() => {
    if (!hands.lead) return false;
    const lips = mouthOf(pose, sit);
    const at = rig.leadArm.end;
    return Math.hypot(at.x - lips.x, at.y - lips.y) < 15;
  });

  // A turn comes round through the front, as a person does: the face slides
  // to the middle as the body narrows a little, the figure changes sides
  // while it faces the front, where the swap hardly shows, and comes round
  // the other way. A flip through edge-on read as a paper cut-out.
  const turning = new Tween<number>(
    untrack(() => facing),
    { easing: cubicInOut },
  );
  $effect(() => {
    void turning.set(facing, {
      delay: turnDelay,
      duration: prefersReducedMotion.current ? 0 : TURN_MS,
    });
  });
  const side = $derived(turning.current >= 0 ? 1 : -1);
  /** 1 side-on, 0 facing the front mid-turn. */
  const round = $derived(Math.min(1, Math.abs(turning.current)));
  /**
   * From the near cup over the crown to the far one: half an ellipse round
   * the head whose top sits `lift` above the hair, so the band hugs the
   * hair all the way down instead of floating clear of it at the sides.
   */
  function headband(lift: number): string {
    return `M17.9 25.6A14.1 ${n(25.6 - (look.crown - lift))} 0 0 1 46.1 25.6`;
  }
  const look = $derived(LOOKS[characterId]);
  const robot = $derived(look.robot);
  const torsoTransform = $derived(
    `translate(${n(rig.hip.x)} ${n(rig.hip.y)}) rotate(${n(pose.lean)})`,
  );

  // The head is drawn in the 64×64 portrait space of StickHead, which the
  // portraits show as it is; 0.82 brings its 15.2 head radius to the rig's.
  const headTransform = $derived(
    `translate(${n(rig.head.x)} ${n(rig.head.y)}) rotate(${n(rig.headAngle)}) scale(0.82) translate(-32 -29)`,
  );
</script>

{#snippet arm(shoulder: Point, limb: StickLimb)}
  <path d={limbPath(shoulder, limb)} class="stroke-portrait-ink" stroke-width="3" />

  {#if look.sleeve}
    <path
      d={sleevePath(shoulder, limb, look.sleeve.reach)}
      class="stroke-portrait-ink"
      stroke-width="5.4"
    />
    <path
      d={sleevePath(shoulder, limb, look.sleeve.reach)}
      class={look.sleeve.class}
      stroke-width="3.4"
    />
  {/if}
{/snippet}

{#snippet hand(at: Point)}
  <circle
    cx={n(at.x)}
    cy={n(at.y)}
    r="2.3"
    class="{robot ? 'fill-portrait-bib' : 'fill-portrait-skin'} stroke-portrait-ink"
    stroke-width="1.2"
  />
{/snippet}

{#snippet inHand(at: Point, object: InHand)}
  {@const { grip } = OBJECT_SIZE[object.kind]}
  <g
    transform="translate({n(at.x)} {n(at.y)}) rotate({n(object.turn ?? 0)}) translate({n(
      -grip.x,
    )} {n(grip.y)})"
  >
    <StickSetObject {...object} carried={object.kind === "pot"} />
  </g>
  {#if object.effect}
    {@const tip = tipOf(at, object)}
    {#if object.effect === "stream"}
      <path
        d="M{n(tip.x)} {n(tip.y)}v16"
        class="animate-pour {object.kind === 'ladle'
          ? 'stroke-scene-carrot'
          : 'stroke-scene-sky'}"
        stroke-width="1.5"
        stroke-dasharray="2.5 1.5"
      />
    {:else if object.effect === "salt"}
      <path
        d="M{n(tip.x)} {n(tip.y + 1)}v12M{n(tip.x + 1.2)} {n(tip.y + 2)}v10"
        class="animate-pour stroke-white"
        stroke-width="0.8"
        stroke-dasharray="0.2 2"
      />
    {:else}
      <path
        d="M{n(tip.x)} {n(tip.y + 1)}v10"
        class="animate-pour stroke-scene-honey"
        stroke-width="0.9"
        stroke-dasharray="1.4 3"
      />
    {/if}
  {/if}
{/snippet}

{#snippet leadSide()}
  {@render arm(rig.leadShoulder, rig.leadArm)}

  {#if robot}
    {@render joint(rig.rearArm.joint, 1.5)}
    {@render joint(rig.leadArm.joint, 1.5)}
  {/if}

  {#if held && !phoneAtEar}
    <StickHeld {held} {rig} />
  {/if}
  {#if hands.lead}
    {@render inHand(rig.leadArm.end, hands.lead)}
  {/if}

  {@render hand(rig.leadArm.end)}
{/snippet}

{#snippet leg(limb: StickLimb)}
  <path d={limbPath(rig.hip, limb)} class="stroke-portrait-ink" stroke-width="3.4" />
{/snippet}

{#snippet joint(at: Point, r: number)}
  <circle
    cx={n(at.x)}
    cy={n(at.y)}
    {r}
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="0.9"
  />
{/snippet}

<svg
  class="block h-auto w-full overflow-visible {className}"
  viewBox={STICK_VIEWBOX}
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <g transform="scale({n(side * (0.88 + 0.12 * round))} 1)">
    <ellipse cx="0" cy={GROUND_Y + 0.5} rx="15" ry="2.2" class="fill-portrait-ink/15" />

    <g transform={headTransform}>
      <StickHead {characterId} part="back" {pose} turn={front ? 0 : undefined} {round} />

      {#if dress.headwear === "headphones"}
        <!-- The far cup, behind the head in the three-quarter view. -->
        <rect
          x="42.2"
          y="23"
          width="8.6"
          height="12.6"
          rx="4.1"
          class="fill-portrait-vest stroke-portrait-ink"
          stroke-width="1.3"
        />
      {:else if dress.headwear === "headset"}
        <circle
          cx="46.2"
          cy="29.4"
          r="3.4"
          class="fill-scene-line stroke-portrait-ink"
          stroke-width="1.2"
        />
      {/if}
    </g>

    {@render arm(rig.rearShoulder, rig.rearArm)}
    {#if hands.rear && !phoneAtEar}
      {@render inHand(rig.rearArm.end, hands.rear)}
    {/if}
    {@render hand(rig.rearArm.end)}
    {@render leg(rig.rearLeg)}
    {@render leg(rig.leadLeg)}
    <path
      d="M{n(rig.rearLeg.end.x - 1)} {n(rig.rearLeg.end.y - 1)}h5M{n(
        rig.leadLeg.end.x - 1,
      )} {n(rig.leadLeg.end.y - 1)}h5"
      class="stroke-portrait-ink"
      stroke-width="3.6"
    />

    {#if robot}
      {@render joint(rig.rearLeg.joint, 1.6)}
      {@render joint(rig.leadLeg.joint, 1.6)}
    {/if}

    <g transform={torsoTransform}>
      <StickTorso {characterId} scarf={dress.scarf} />
    </g>

    {#if !leadAtMouth}
      {@render leadSide()}
    {/if}

    <g transform={headTransform}>
      <StickHead {characterId} {pose} turn={front ? 0 : undefined} {round} />

      {#if dress.headwear === "headphones"}
        <!-- Closed-back studio headphones in the head's own 64-unit space: a padded band over the hair, a deep cup over the near ear. -->
        <path d={headband(1.2)} class="stroke-portrait-ink" stroke-width="4.4" />
        <path d={headband(1.2)} class="stroke-portrait-vest" stroke-width="2.6" />
        <rect
          x="13.4"
          y="23"
          width="8.8"
          height="12.8"
          rx="4.2"
          class="fill-portrait-ink stroke-portrait-ink"
          stroke-width="1.3"
        />
        <rect
          x="12.2"
          y="23.6"
          width="7.6"
          height="11.6"
          rx="3.8"
          class="fill-portrait-vest stroke-portrait-ink"
          stroke-width="1.3"
        />
        <rect
          x="13.9"
          y="25.6"
          width="4.2"
          height="7.6"
          rx="2.1"
          class="fill-scene-line/60"
        />
      {:else if dress.headwear === "headset"}
        <!-- A headset: slim band, a cup on the near ear, and a boom mic curving to the mouth. -->
        <path d={headband(0.2)} class="stroke-portrait-ink" stroke-width="1.8" />
        <circle
          cx="17.8"
          cy="29.4"
          r="3.4"
          class="fill-scene-line stroke-portrait-ink"
          stroke-width="1.2"
        />
        <circle cx="17.8" cy="29.4" r="1.4" class="fill-scene-edge" />
        <path
          d="M20.4 31.6C22 37.6 26.4 40.6 30.2 40.8"
          class="stroke-portrait-ink"
          stroke-width="1.3"
        />
        <circle
          cx="31"
          cy="40.9"
          r="1.7"
          class="fill-scene-line stroke-portrait-ink"
          stroke-width="1"
        />
      {/if}
    </g>

    {#if leadAtMouth}
      <!-- At the lips the near arm and what it holds are in front of the face: the spoon goes in, not behind the cheek. -->
      {@render leadSide()}
    {/if}

    {#if emote}
      {@const mouth = mouthOf(pose, sit)}
      <g transform="translate({n(mouth.x + 8.5)} {n(mouth.y - 1)})">
        <!-- A CSS animation's transform would replace the attribute's, so it rises in a group of its own. -->
        <g class="animate-rise">
          {#if emote === "hot"}
            <!-- Heat off a burnt tongue: wavy lines fanning out from the open mouth. -->
            <path
              d="M1 -2q2-1.5 4 0t4 0M1.5 1q2-1.5 4 0t4 0M1 4q2-1.5 4 0t4 0"
              class="stroke-scene-red"
              stroke-width="0.9"
            />
          {:else if emote === "sniff"}
            <!-- The smell of the soup, drifting up to the nose. -->
            <path
              d="M12 -2q-2-1.5-4 0t-4 0M13 -5.5q-2-1.5-4 0t-4 0"
              class="stroke-scene-honey"
              stroke-width="0.9"
            />
          {:else}
            <path
              d="M1.5 -1.2h5M2.5 0.6h7M1.5 2.4h5"
              class="stroke-scene-cool"
              stroke-width="0.9"
            />
          {/if}
        </g>
      </g>
    {/if}

    {#if phoneAtEar}
      <!-- Over the head, so the phone shows against the ear the rear arm reaches round to. -->
      <g transform="translate({n(rig.rearArm.end.x + 1.5)} {n(rig.rearArm.end.y + 4)})">
        <StickProp prop="phone" />
      </g>
      {@render hand(rig.rearArm.end)}
    {/if}
  </g>

  {#if picture}
    <g transform="translate({n(rig.head.x * side)} 4)">
      <g class="animate-rise">
        <path
          d="M-17 -13h34a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5h-13l-4 5-4-5h-13a5 5 0 0 1-5-5v-15a5 5 0 0 1 5-5Z"
          class="fill-white stroke-portrait-ink"
          stroke-width="1.1"
        />
        <g transform="translate(0 -0.5)">
          <StickPicture {picture} />
        </g>
      </g>
    </g>
  {/if}
</svg>
