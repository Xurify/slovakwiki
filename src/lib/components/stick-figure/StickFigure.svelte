<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import { TURN_MS } from "$lib/stick-figure/turns";
  import {
    GROUND_Y,
    HEAD_RADIUS,
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
  import type { Emote, Sign } from "$lib/stick-figure/act-motions";
  import type { Effect } from "$lib/stick-figure/act-motions";
  import { mouthOf } from "$lib/stick-figure/reach";
  import { OBJECT_SIZE, tipFromHand } from "$lib/stick-figure/set-pieces";
  import StickHead from "./StickHead.svelte";
  import StickSetObject, { type ObjectLook } from "./StickSetObject.svelte";
  import StickHeld from "./StickHeld.svelte";
  import StickHeadphones from "./StickHeadphones.svelte";
  import StickPicture from "./StickPicture.svelte";
  import StickProp from "./StickProp.svelte";
  import StickTorso from "./StickTorso.svelte";
  import { sineInOut } from "svelte/easing";
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
    sign = {},
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
    /** What each empty hand shows, turned `turn` degrees from pointing up: a finger wagged, a thumb up. */
    sign?: Partial<Record<"lead" | "rear", { shape: Sign; turn: number }>>;
  } = $props();

  interface InHand extends ObjectLook {
    turn?: number;
    /** Water, salt or peel coming off it while a cue pours, shakes or peels. */
    effect?: Effect["kind"];
    /** Where what pours lands, as a y in the figure's space: the rim it falls in over. */
    lands?: number;
    /** The opening it is down in, in the figure's space: what is under the rim is hidden behind the pot's side. */
    sunk?: { left: number; right: number; rim: number };
  }

  const id = $props.id();

  /** Where the tip of an object held at `at` is, turned `turn` degrees, in the figure's space. */
  function tipOf(at: Point, object: InHand): Point {
    const tip = tipFromHand(object.kind, object.turn ?? 0);
    return { x: at.x + tip.x, y: at.y + tip.y };
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
  /**
   * Headphones in both hands, a cup in each, while the hands are a band's
   * width or so apart. Round the head they are held as worn: the rear hand
   * on the near cup at the back of the head, drawn over it as a phone at
   * the ear is, and the lead hand on the far cup, hidden behind the head
   * with half the band. Brought round in front, both cups are in front.
   */
  const pair = $derived.by(() => {
    if (hands.lead?.kind !== "headphones" || hands.rear) return undefined;
    const lead = rig.leadArm.end;
    const rear = rig.rearArm.end;
    if (Math.hypot(lead.x - rear.x, lead.y - rear.y) > 30) return undefined;
    return { lead, rear, onHead: rear.x < rig.head.x - 6 };
  });

  /**
   * The lead hand up at the face, in front of the head rather than hidden
   * behind it: a spoon at the lips, a hand over a yawn, on the forehead, on
   * the near ear's cup.
   */
  const leadAtFace = $derived.by(() => {
    if (pair) return !pair.onHead;
    const at = rig.leadArm.end;
    const lips = mouthOf(pose, sit);
    if (hands.lead && Math.hypot(at.x - lips.x, at.y - lips.y) < 15) return true;
    return Math.hypot(at.x - rig.head.x, at.y - rig.head.y) < HEAD_RADIUS + 1;
  });

  // A turn comes round through the front, as a person does: the face slides
  // to the middle as the body narrows a little, the figure changes sides
  // while it faces the front, where the swap hardly shows, and comes round
  // the other way. A flip through edge-on read as a paper cut-out.
  const turning = new Tween<number>(
    untrack(() => facing),
    { easing: sineInOut },
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
   * Half of a band over the crown, its top `lift` above the hair: the near
   * half from the cup up, or the far half from the crown down behind the
   * head to the hidden ear. The crown is a little behind the middle of the
   * head, which faces three-quarters to the front; a band drawn to the
   * face side as well framed the face like a hood.
   */
  function headband(lift: number, half: "near" | "far"): string {
    const ry = n(25.6 - (look.crown - lift));
    const top = n(look.crown - lift);
    return half === "near"
      ? `M17.6 25.6A13.4 ${ry} 0 0 1 31 ${top}`
      : `M31 ${top}A13.4 ${ry} 0 0 1 44.4 25.6`;
  }
  const look = $derived(LOOKS[characterId]);
  const robot = $derived(look.robot);
  /** The near knee in the torso's own space, turned back by the lean, for a skirt over the lap. */
  const lapKnee = $derived.by(() => {
    const dx = rig.leadLeg.joint.x - rig.hip.x;
    const dy = rig.leadLeg.joint.y - rig.hip.y;
    const angle = (-rig.lean * Math.PI) / 180;
    return {
      x: dx * Math.cos(angle) - dy * Math.sin(angle),
      y: dx * Math.sin(angle) + dy * Math.cos(angle),
    };
  });
  const torsoTransform = $derived(
    `translate(${n(rig.hip.x)} ${n(rig.hip.y)}) rotate(${n(rig.lean)})`,
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

{#snippet hand(at: Point, which?: "lead" | "rear")}
  {@const shown = which && !hands[which] ? sign[which] : undefined}
  {#if shown}
    <!-- Under the fist, so only what sticks out of it shows; the finger is a skin-coloured stroke inside an ink one, like the arms. -->
    {@const d =
      shown.shape === "finger"
        ? "M0 -1v-5.2"
        : shown.shape === "thumb"
          ? "M-0.4 -1.2v-3.6"
          : "M-1.5 -1.2l-1.6 -2.6M0 -1.8v-3M1.5 -1.2l1.6 -2.6"}
    <g transform="translate({n(at.x)} {n(at.y)}) rotate({n(shown.turn)})">
      <path
        {d}
        class="stroke-portrait-ink"
        stroke-width={shown.shape === "thumb" ? 3.4 : 2.6}
      />
      <path
        {d}
        class={robot ? "stroke-portrait-bib" : "stroke-portrait-skin"}
        stroke-width={shown.shape === "thumb" ? 1.6 : 1}
      />
    </g>
  {/if}
  <circle
    cx={n(at.x)}
    cy={n(at.y)}
    r="2.3"
    class="{robot ? 'fill-portrait-bib' : 'fill-portrait-skin'} stroke-portrait-ink"
    stroke-width="1.2"
  />
{/snippet}

{#snippet inHand(at: Point, object: InHand, hand: "lead" | "rear")}
  {@const { grip } = OBJECT_SIZE[object.kind]}
  {#if object.sunk}
    {@const { left, right, rim } = object.sunk}
    <clipPath id="{id}-{hand}-sunk">
      <path
        d="M-300 -300H300V300H-300ZM{n(left)} {n(rim)}H{n(right)}V{n(rim + 60)}H{n(
          left,
        )}Z"
        clip-rule="evenodd"
      />
    </clipPath>
  {/if}
  <g clip-path={object.sunk ? `url(#${id}-${hand}-sunk)` : undefined}>
    <g
      transform="translate({n(at.x)} {n(at.y)}) rotate({n(
        object.turn ?? 0,
      )}) translate({n(-grip.x)} {n(grip.y)})"
    >
      <StickSetObject {...object} />
    </g>
  </g>
  {#if object.effect}
    {@const tip = tipOf(at, object)}
    <!-- Down to the rim it pours over, where the pot's side, drawn behind the figure, would otherwise show it falling past. -->
    {@const fall = Math.max(2, (object.lands ?? tip.y + 16) - tip.y)}
    {#if object.effect === "stream"}
      <!-- Outlined, so water shows against the white tiles. -->
      <path
        d="M{n(tip.x)} {n(tip.y)}v{n(fall)}"
        class="stroke-portrait-ink/35"
        stroke-width="2.6"
      />
      <!-- Off a board it is chopped carrot sliding off, in pieces rather than a stream. -->
      <path
        d="M{n(tip.x)} {n(tip.y)}v{n(fall)}"
        class="animate-pour {object.kind === 'ladle' || object.kind === 'board'
          ? 'stroke-scene-carrot'
          : 'stroke-scene-water'}"
        stroke-width={object.kind === "board" ? 2.2 : 1.7}
        stroke-dasharray={object.kind === "board" ? "1.6 2.4" : "3 1"}
      />
    {:else if object.effect === "salt"}
      <!-- A pinch from each flick, the grains spreading a little as they fall, outlined so white salt shows against white tiles. -->
      {@const grains = `M${n(tip.x)} ${n(tip.y + 0.5)}l-0.9 ${n(fall - 0.5)}M${n(tip.x + 0.3)} ${n(tip.y + 0.5)}v${n(fall - 0.5)}M${n(tip.x + 0.6)} ${n(tip.y + 0.5)}l0.9 ${n(fall - 0.5)}`}
      <path
        d={grains}
        class="animate-pour stroke-portrait-ink/60"
        stroke-width="1.7"
        stroke-dasharray="0.4 1.6"
      />
      <path
        d={grains}
        class="animate-pour stroke-white"
        stroke-width="1.05"
        stroke-dasharray="0.4 1.6"
      />
    {:else}
      <!-- Peel coming off the blade down onto the board the carrot lies on: a fixed fall ended in mid-air, or went through the board. -->
      <path
        d="M{n(tip.x)} {n(tip.y + 0.6)}v{n(fall - 0.6)}"
        class="animate-pour stroke-scene-honey"
        stroke-width="1"
        stroke-dasharray="1 1"
      />
      <path
        d="M{n(tip.x - 1.6)} {n(tip.y + fall - 0.4)}q0.8 -0.9 1.6 0t1.6 0"
        class="stroke-scene-honey"
        stroke-width="0.8"
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
  {#if pair?.onHead}
    <StickHeadphones far={pair.lead} near={pair.rear} part="far" />
  {:else if pair}
    <StickHeadphones far={pair.rear} near={pair.lead} />
    {@render hand(rig.rearArm.end)}
  {:else if hands.lead}
    {@render inHand(rig.leadArm.end, hands.lead, "lead")}
  {/if}
  <!-- The other hand on the pot's near handle or the board's far end, round from behind the body: drawn under it, it was not seen holding it. -->
  {#if hands.lead?.kind === "pot" || hands.lead?.kind === "board"}
    {@render hand(rig.rearArm.end)}
  {/if}

  {@render hand(rig.leadArm.end, "lead")}
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

      <!-- The band's far half goes down behind the head: only what clears the hair shows, and the far cup is hidden, as from three-quarters it would be. -->
      {#if dress.headwear === "headphones"}
        <path d={headband(1.4, "far")} class="stroke-portrait-ink" stroke-width="4.2" />
        <path d={headband(1.4, "far")} class="stroke-scene-line" stroke-width="2.2" />
      {:else if dress.headwear === "headset"}
        <path d={headband(0.4, "far")} class="stroke-portrait-ink" stroke-width="1.8" />
      {/if}
    </g>

    {@render arm(rig.rearShoulder, rig.rearArm)}
    {#if hands.rear && !phoneAtEar}
      {@render inHand(rig.rearArm.end, hands.rear, "rear")}
    {/if}
    {@render hand(rig.rearArm.end, "rear")}
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
      <StickTorso {characterId} knee={lapKnee} scarf={dress.scarf} {sit} />
    </g>

    {#if !leadAtFace}
      {@render leadSide()}
    {/if}

    <g transform={headTransform}>
      <StickHead {characterId} {pose} turn={front ? 0 : undefined} {round} />

      {#if dress.headwear === "headphones"}
        <!-- Closed-back studio headphones in the head's own 64-unit space: a padded band over the hair, a deep cup over the near ear. -->
        <path d={headband(1.4, "near")} class="stroke-portrait-ink" stroke-width="4.2" />
        <path d={headband(1.4, "near")} class="stroke-scene-line" stroke-width="2.2" />
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
        <path d={headband(0.4, "near")} class="stroke-portrait-ink" stroke-width="1.8" />
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

    {#if leadAtFace}
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

    {#if pair?.onHead}
      <StickHeadphones far={pair.lead} near={pair.rear} part="near" />
      {@render hand(rig.rearArm.end)}
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
