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
  import StickHead from "./StickHead.svelte";
  import StickHeld from "./StickHeld.svelte";
  import StickPicture from "./StickPicture.svelte";
  import StickProp from "./StickProp.svelte";
  import StickTorso from "./StickTorso.svelte";

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
  } = $props();

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
  const phoneAtEar = $derived(call > 0.5 && held?.id === "phone");

  const rig = $derived(solveRig(atEar(pose, call), sit));
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
  <!-- A turn is a flip through edge-on, like a paper cut-out, slowing into and out of it. -->
  <g
    class="transition-transform ease-in-out"
    style:transform="scaleX({facing})"
    style:transition-duration="{TURN_MS}ms"
    style:transition-delay="{turnDelay}ms"
  >
    <ellipse cx="0" cy={GROUND_Y + 0.5} rx="15" ry="2.2" class="fill-portrait-ink/15" />

    <g transform={headTransform}>
      <StickHead {characterId} part="back" {pose} turn={front ? 0 : undefined} />

      {#if dress.headwear === "headphones"}
        <!-- The far cup, behind the head in the three-quarter view. -->
        <rect
          x="42.9"
          y="25.2"
          width="6.6"
          height="8.4"
          rx="3.2"
          class="fill-scene-cool stroke-portrait-ink"
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

    {@render arm(rig.leadShoulder, rig.leadArm)}

    {#if robot}
      {@render joint(rig.rearArm.joint, 1.5)}
      {@render joint(rig.leadArm.joint, 1.5)}
    {/if}

    {#if held && !phoneAtEar}
      <StickHeld {held} {rig} />
    {/if}

    {@render hand(rig.leadArm.end)}

    <g transform={headTransform}>
      <StickHead {characterId} {pose} turn={front ? 0 : undefined} />

      {#if dress.headwear === "headphones"}
        <!-- Open-back headphones in the head's own 64-unit space: a thin band over the hair, a light cup with a grille on the near ear. -->
        <path d={headband(0.4)} class="stroke-portrait-ink" stroke-width="2" />
        <path d={headband(0.4)} class="stroke-scene-edge" stroke-width="0.8" />
        <rect
          x="14.5"
          y="25.2"
          width="6.6"
          height="8.4"
          rx="3.2"
          class="fill-scene-cool stroke-portrait-ink"
          stroke-width="1.3"
        />
        <path
          d="M16.2 27.4h3.2M16.2 29.4h3.2M16.2 31.4h3.2"
          class="stroke-scene-line"
          stroke-width="0.9"
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

    {#if phoneAtEar}
      <!-- Over the head, so the phone shows against the ear the rear arm reaches round to. -->
      <g transform="translate({n(rig.rearArm.end.x + 1.5)} {n(rig.rearArm.end.y + 4)})">
        <StickProp prop="phone" />
      </g>
      {@render hand(rig.rearArm.end)}
    {/if}
  </g>

  {#if picture}
    <g transform="translate({n(rig.head.x * facing)} 4)">
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
