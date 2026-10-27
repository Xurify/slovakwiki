<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { n } from "$lib/stick-figure/draw";
  import { LOOKS } from "$lib/stick-figure/looks";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import { TURN_MS } from "$lib/stick-figure/turns";
  import { cubicInOut } from "svelte/easing";
  import { prefersReducedMotion, Tween } from "svelte/motion";

  const STILL = { x: 0, y: 0 };

  /**
   * A character's head, drawn once: in the 64×64 portrait space, the skull an
   * ellipse at 32,29 with radii 13.2 × 15.2. The stick figure scales it onto
   * its rig and the portrait beside a line shows it from the front, so a face
   * changed here changes on the stage and in the transcript together.
   *
   * `back` is the hair behind the head (a lob, a braid, a bun), drawn before
   * the body so the shoulders cover its ends; `face` is the rest.
   */
  let {
    calling = false,
    characterId,
    part = "face",
    pose = REST_POSE,
    turn,
    round = 1,
    sway = STILL,
    headphones = false,
  }: {
    /** On a call: a robot's antenna light blinks while it talks over the line. */
    calling?: boolean;
    characterId: LessonCharacterId;
    part?: "back" | "face";
    pose?: StickPose;
    /** How far the features sit toward the facing side: a three-quarter view on stage, 0 for a portrait. */
    turn?: number;
    /** How far round to the side the body is, 1 side-on and 0 facing the front halfway through a turn. */
    round?: number;
    /** Where the ends of long hair are carried from where they hang at rest, in this 64-unit space. */
    sway?: { x: number; y: number };
    /** Closed-back studio headphones worn over the hair. */
    headphones?: boolean;
  } = $props();

  const id = $props.id();
  const look = $derived(LOOKS[characterId]);
  const robot = $derived(look.robot);
  const dog = $derived(look.dog);
  const computing = $derived(
    Boolean(
      robot && pose.brow >= 0.7 && pose.tilt <= -6 && pose.nod >= 1.5 && pose.look >= 0.6,
    ),
  );
  const hair = $derived(look.grey ? "fill-portrait-hair-grey" : "fill-portrait-hair");
  const brows = $derived(
    look.grey ? "stroke-portrait-hair-grey" : "stroke-portrait-hair",
  );

  // The face sits turned toward the way the figure faces (a three-quarter
  // view), so a turn reads at a glance; `look` moves the eyes on top of that.
  // Turning to the listeners and back eases like a turn of the body; a jump
  // of the features read as a twitch.
  const turning = Tween.of(() => turn ?? (robot ? 1.4 : dog ? 4 : 2.6), {
    duration: () => (prefersReducedMotion.current ? 0 : TURN_MS),
    easing: cubicInOut,
  });
  const aside = $derived(turning.current * round);
  const eyeX = $derived(aside + pose.look * 2);
  const noseX = $derived(32 + aside * 1.15 + pose.look * 0.8);
  const mouthX = $derived(32 + aside * 0.9 + pose.look * 1.2);
  const eyeY = $derived(28.6 + pose.nod * 0.6);
  const browY = $derived(24.8 - Math.max(0, pose.brow) * 2.2);
  const browWorry = $derived(Math.max(0, -pose.brow) * 1.8);
  const mouthOpen = $derived(pose.mouth > 0.06);

  /**
   * A flat upper lip over a jaw curve reads as speech, where an ellipse reads
   * as "oh!". Rounding (o, u) narrows the corners and arches the top lip.
   */
  function mouthPath(cx: number, top: number): string {
    const half = ((5.8 - pose.mouth * 0.9) / 2) * pose.mouthWidth;
    const depth = 0.8 + pose.mouth * 3.6;
    const arch = depth * (0.18 + 0.55 * pose.round);
    const belly = half * (0.7 + 0.3 * pose.round);
    const bottom = n(top + depth);

    return `M${n(cx - half)} ${top}Q${n(cx)} ${n(top - arch)} ${n(cx + half)} ${top}Q${n(cx + belly)} ${bottom} ${n(cx)} ${bottom}Q${n(cx - belly)} ${bottom} ${n(cx - half)} ${top}Z`;
  }

  /**
   * A point of long hair, carried by its share of the sway: none where it
   * lies on the scalp and down the face, all of it at the ends. `shift` is
   * how much of the three-quarter turn it follows, for a parting and a
   * fringe that come round with the face.
   */
  function hairAt(x: number, y: number, shift = 0): string {
    const t = Math.min(1, Math.max(0, (y - 27) / 27));
    const k = t * t * (3 - 2 * t);
    return `${n(x + aside * shift + sway.x * k)} ${n(y + sway.y * k)}`;
  }

  // Anna: long hair falling past the shoulders in a few locks, parted on
  // the facing side with the fringe swept across to the far temple.
  const annaBack = $derived.by(() => {
    const p = hairAt;
    return `M${p(32, 7.6)}C${p(40.8, 7.4)} ${p(47.8, 12.4)} ${p(48.9, 21)}C${p(49.8, 28)} ${p(48.8, 34.5)} ${p(50, 40.5)}C${p(51, 45)} ${p(52, 49.6)} ${p(50.4, 53.6)}Q${p(48.4, 55.6)} ${p(46.4, 52.6)}Q${p(44.4, 55.2)} ${p(41.6, 52)}L${p(24, 51.6)}Q${p(21, 55.4)} ${p(18.2, 52.8)}Q${p(15.2, 55.4)} ${p(13.4, 52.2)}C${p(12.2, 47.6)} ${p(14.2, 43.6)} ${p(13.8, 38.6)}C${p(13.4, 32.6)} ${p(13.6, 27.2)} ${p(15.1, 21)}C${p(16.6, 12.6)} ${p(23.4, 7.8)} ${p(32, 7.6)}Z`;
  });
  const annaBackLocks = $derived(
    `M${hairAt(17.6, 38)}Q${hairAt(16.4, 45)} ${hairAt(18.2, 52.8)}M${hairAt(46.6, 38.6)}Q${hairAt(48.2, 45.6)} ${hairAt(46.4, 52.6)}`,
  );
  /**
   * Over the skull, so its outline does not show through the hair as a hood
   * would: the top's outline is the one behind the head, and down the far
   * side it keeps to the face's own edge, clear of the brow.
   */
  const annaTop = $derived.by(() => {
    const p = hairAt;
    return `M${p(15.1, 21)}C${p(16.6, 12.6)} ${p(23.4, 7.8)} ${p(32, 7.6)}C${p(40.8, 7.4)} ${p(47.8, 12.4)} ${p(48.9, 21)}C${p(49.3, 24.6)} ${p(49.2, 27.6)} ${p(48.4, 30.4)}Q${p(46.8, 31.4)} ${p(45.14, 30.4)}A13.2 15.2 0 0 0 ${p(43.72, 22)}Q${p(42.8, 16.4, 0.4)} ${p(37.6, 15.2, 0.9)}C${p(34.8, 18.4, 0.8)} ${p(29.6, 20.4, 0.5)} ${p(24.4, 21.4, 0.25)}Q${p(22.4, 22, 0.1)} ${p(22.2, 23.6)}Q${p(20.8, 28)} ${p(20.6, 31.6)}Q${p(20.2, 34)} ${p(19.4, 35.6)}C${p(17.4, 32.6)} ${p(14.8, 27.6)} ${p(15.1, 21)}Z`;
  });
  const annaStrands = $derived(
    `M${hairAt(35.6, 8.2, 0.6)}Q${hairAt(36.6, 11.6, 0.8)} ${hairAt(37.6, 15.2, 0.9)}M${hairAt(34.4, 10.4, 0.7)}Q${hairAt(29.4, 12.6, 0.5)} ${hairAt(25.2, 18.6, 0.3)}M${hairAt(19.6, 22.6)}Q${hairAt(18.4, 28)} ${hairAt(18.8, 33)}`,
  );

  /**
   * Worn headphones: a cup over each ear, the far one round behind the face,
   * and the band over the top of the hair, pressed a little into it so the
   * hair shows above it. Side-on the cups turn their faces to and from us;
   * from the front both are seen edge-on.
   */
  const phones = $derived.by(() => {
    const u = Math.min(1, Math.abs(aside) / 2.6);
    const cy = 29.8;
    const ry = 5.7;
    // Each cup's middle on the head's outline, so it hugs the ear; turned, the
    // far one goes in behind the face. Out past the outline with the band sunk
    // into the hair, they read as sliding off.
    const near = { x: 18.4 + 1.6 * u, rx: 2.9 + 0.9 * u };
    const far = { x: 45.6 - 1.4 * u, rx: 2.9 - 0.7 * u };
    const top = look.crown + 1.2;
    const from = { x: near.x + 0.2, y: cy - ry + 0.6 };
    const to = { x: far.x - 0.2, y: cy - ry + 0.6 };
    const mid = { x: 31.8 - 0.3 * u, y: top };
    const rise = from.y - top;
    const band = `M${n(from.x)} ${n(from.y)}C${n(from.x - 0.6)} ${n(from.y - rise * 0.58)} ${n(mid.x - (mid.x - from.x) * 0.56)} ${n(top)} ${n(mid.x)} ${n(top)}C${n(mid.x + (to.x - mid.x) * 0.56)} ${n(top)} ${n(to.x + 0.6)} ${n(to.y - rise * 0.58)} ${n(to.x)} ${n(to.y)}`;
    return { cy, ry, near, far, band };
  });
</script>

{#snippet cup(x: number, rx: number, toFace: 1 | -1)}
  <!-- The ear cushion shows on the side toward the head, the shell on the outside. -->
  <ellipse
    cx={n(x + toFace * rx * 0.4)}
    cy={phones.cy}
    {rx}
    ry={phones.ry + 0.4}
    class="fill-portrait-ink stroke-portrait-ink"
    stroke-width="1.1"
  />
  <ellipse
    cx={n(x)}
    cy={phones.cy}
    {rx}
    ry={phones.ry}
    class="fill-scene-line stroke-portrait-ink"
    stroke-width="1.1"
  />
  <ellipse
    cx={n(x - toFace * rx * 0.12)}
    cy={phones.cy + 0.2}
    rx={n(rx * 0.5)}
    ry={phones.ry * 0.58}
    class="fill-portrait-vest"
  />
{/snippet}

{#if part === "back"}
  {#if characterId === "anna"}
    <path d={annaBack} class="{hair} stroke-portrait-ink" stroke-width="1.7" />
    <path d={annaBackLocks} class="stroke-portrait-ink" stroke-width="1.05" />
  {:else if characterId === "lucia"}
    <path
      d="M39.4 34.2 43.2 32.4 47.8 36.2 46 42.4 50 47.2 46.6 52.6 49.4 58.2 45.6 62.4 39.8 61.2 37.4 55.2 40.2 49.6 36.8 43.8 38.2 38.2Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.7"
    />
    <path
      d="M42.8 37.4 46.2 41.2M41.6 44.6 46.8 48.2M40.6 52.4 46.2 55.8"
      class="stroke-portrait-ink"
      stroke-width="1.15"
    />
  {:else if characterId === "receptionist"}
    <!-- low bun at the nape, peeking out behind the head -->
    <circle
      cx="16.2"
      cy="36.4"
      r="5.2"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.6"
    />
    <path d="M19.4 32.6q1.6 3.4.4 7.4" class="stroke-portrait-ink" stroke-width="1.1" />
  {/if}
{:else if dog}
  <!-- A floppy-eared dog's head: the far ear, the skull, a pale muzzle toward the facing side, the near ear over it. -->
  <path
    d="M{40 +
      aside *
        0.4} 17.4c5.4-1.6 9.4 2.6 9.2 10.6-.2 5-2.2 8.4-4.6 8.6-2.6.2-3.4-5.4-4.4-10.6Z"
    class="{dog.patch} stroke-portrait-ink"
    stroke-width="1.5"
  />
  <ellipse
    cx="32"
    cy="28"
    rx="13.4"
    ry="12.6"
    class="{dog.coat} stroke-portrait-ink"
    stroke-width="1.7"
  />
  <ellipse
    cx={32 + aside * 0.9}
    cy="35.4"
    rx="8.4"
    ry="6.4"
    class="fill-scene-warm stroke-portrait-ink"
    stroke-width="1.4"
  />
  <circle cx={26 + eyeX} cy={eyeY - 2.6} r="2.1" class="fill-portrait-ink" />
  <circle cx={38 + eyeX} cy={eyeY - 2.6} r="2.1" class="fill-portrait-ink" />
  <circle cx={26.7 + eyeX} cy={eyeY - 3.3} r="0.6" class="fill-white" />
  <circle cx={38.7 + eyeX} cy={eyeY - 3.3} r="0.6" class="fill-white" />
  <ellipse cx={32 + aside * 1.2} cy="31.6" rx="3" ry="2.2" class="fill-portrait-ink" />

  {#if mouthOpen}
    <path d={mouthPath(32 + aside * 1.1, 36.4)} class="fill-portrait-ink" />
    <ellipse
      cx={32 + aside * 1.1}
      cy={36.8 + pose.mouth * 3}
      rx="1.9"
      ry={0.6 + pose.mouth * 1.1}
      class="fill-scene-red-mid"
    />
  {:else}
    <path
      d="M{28.6 + aside * 1.1} 36.2q1.7 1.6 3.4 0q1.7 1.6 3.4 0M{32 +
        aside * 1.1} 33.6v2.6"
      class="stroke-portrait-ink"
      stroke-width="1.3"
    />
  {/if}

  <path
    d="M{24 +
      aside *
        0.4} 17.4c-5.4-1.6-9.4 2.6-9.2 10.6.2 5 2.2 8.4 4.6 8.6 2.6.2 3.4-5.4 4.4-10.6Z"
    class="{dog.patch} stroke-portrait-ink"
    stroke-width="1.5"
  />
{:else if robot?.metal}
  <path d="M32 14V8.4" class="stroke-portrait-ink" stroke-width="1.4" />
  <circle
    cx="32"
    cy="7.6"
    r="2.2"
    class="{robot.light} stroke-portrait-ink {calling || computing
      ? 'motion-safe:animate-compute-dot'
      : ''}"
    stroke-width="1.2"
  />
  <rect
    x="12.6"
    y="23"
    width="4.4"
    height="9"
    rx="1.2"
    class="fill-scene-steel-dark stroke-portrait-ink"
    stroke-width="1.1"
  />
  <rect
    x="47"
    y="23"
    width="4.4"
    height="9"
    rx="1.2"
    class="fill-scene-steel-dark stroke-portrait-ink"
    stroke-width="1.1"
  />
  <rect
    x="16"
    y="14"
    width="32"
    height="29"
    rx="3.6"
    class="fill-scene-steel stroke-portrait-ink"
    stroke-width="1.6"
  />
  <path d="M19 16.4H45" class="stroke-scene-steel-light" stroke-width="1.3" />
  <rect
    x={n(19 + eyeX * 0.5)}
    y="20"
    width="26"
    height="11"
    rx="2.4"
    class="fill-portrait-ink"
  />
  <circle cx={n(25.6 + eyeX)} cy="25.5" r="2.6" class={robot.eyes} />
  <circle cx={n(38.4 + eyeX)} cy="25.5" r="2.6" class={robot.eyes} />
  <rect
    x={n(25 + eyeX * 0.5)}
    y="34"
    width="14"
    height="5.4"
    rx="1"
    class="fill-portrait-ink"
  />
  {#if mouthOpen}
    <!-- The grille lights up with the voice, like a level meter. -->
    {#each [0, 1, 2, 3] as bar (bar)}
      {@const h = n(1 + pose.mouth * (bar % 3 === 0 ? 2.6 : 4))}
      <rect
        x={n(26.4 + eyeX * 0.5 + bar * 3)}
        y={n(36.7 - Number(h) / 2)}
        width="2"
        height={h}
        class={robot.eyes}
      />
    {/each}
  {:else}
    <path d="M{n(28 + eyeX * 0.5)} 36.7h8" class={robot.smile} stroke-width="1.2" />
  {/if}
  {#each [[18.6, 16.8], [45.4, 16.8], [18.6, 40.4], [45.4, 40.4]] as [x, y] (`${x}-${y}`)}
    <circle cx={x} cy={y} r="0.85" class="fill-scene-steel-dark" />
  {/each}
{:else if robot}
  <path d="M32 14.5V9" class="stroke-portrait-ink" stroke-width="1.4" />
  <circle
    cx="32"
    cy="8.5"
    r="2.2"
    class="{robot.light} stroke-portrait-ink {calling || computing
      ? 'motion-safe:animate-compute-dot'
      : ''}"
    stroke-width="1.2"
  />
  <rect
    x="15.5"
    y="14.5"
    width="33"
    height="28.5"
    rx="12"
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="1.6"
  />
  <rect
    x="18"
    y="17"
    width="28"
    height="23.5"
    rx="9.5"
    class="fill-portrait-ink stroke-portrait-ink"
    stroke-width="1.3"
  />
  <rect x={21.5 + eyeX} y="23" width="4.8" height="6.8" rx="2.4" class={robot.eyes} />
  <rect x={37.7 + eyeX} y="23" width="4.8" height="6.8" rx="2.4" class={robot.eyes} />

  {#if mouthOpen}
    <path d={mouthPath(32 + eyeX, 33.4)} class={robot.eyes} />
  {:else}
    <path d="M{28.5 + eyeX} 34q3.5 2.5 7 0" class={robot.smile} stroke-width="1.35" />
  {/if}
{:else}
  {#if characterId === "maria"}
    <circle
      cx="32"
      cy="8.6"
      r="5.1"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.7"
    />
  {/if}

  <ellipse
    cx="32"
    cy="29"
    rx="13.2"
    ry="15.2"
    class="fill-portrait-skin stroke-portrait-ink"
    stroke-width="1.7"
  />

  {#if look.ear}
    <path
      d="M18.6 25.8c-2.2.6-3 4.6-1.1 7.4 1 1.3 2.3.7 2.1-.9-.4-2.2-.6-4.6-1-6.5Z"
      class="fill-portrait-skin stroke-portrait-ink"
      stroke-width="1.5"
    />
  {/if}

  {#if characterId === "alex"}
    <path
      d="M19.6 22.2 18.8 17.6 21.4 12.2 24.2 9.4 26.6 11.6 29.2 8.2 32.2 7.6 35.2 9.4 37.8 8 41.2 11.4 44.2 16.2 44.6 21.8Q40.2 17.6 32.2 17.2Q24.6 16.8 19.6 22.2Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.7"
    />
    <path
      d="M24.4 13.4q3.4-1.6 7 .2M34.4 12.8q3.8.6 6.6 2.8"
      class="stroke-portrait-ink"
      stroke-width="1.15"
    />
  {:else if characterId === "marek"}
    <path
      d="M17.8 24A2.8 2.8 0 0 1 17.3 19A2.9 2.9 0 0 1 19.3 14.3A3.1 3.1 0 0 1 23.4 10.6A3.3 3.3 0 0 1 29 8.7A3.4 3.4 0 0 1 35 8.7A3.3 3.3 0 0 1 40.6 10.6A3.1 3.1 0 0 1 44.7 14.3A2.9 2.9 0 0 1 46.7 19A2.8 2.8 0 0 1 46.2 24L44.2 25.6A3.4 3.4 0 0 1 42.4 20.2A3 3 0 0 1 37.6 18.6A3.2 3.2 0 0 1 32.2 18.2A3.3 3.3 0 0 1 26.8 18.8A3 3 0 0 1 22.2 20.6A3.3 3.3 0 0 1 19.8 25.6Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.6"
    />
    <path
      d="M23.6 16.6a2.6 2.6 0 0 1 4.6-1.4M30 13.4a2.6 2.6 0 0 1 4.8-.2M36.4 15a2.6 2.6 0 0 1 4.6 1"
      class="stroke-portrait-ink"
      stroke-width="1"
    />
  {:else if characterId === "anna"}
    <path d={annaTop} class="{hair} stroke-portrait-ink" stroke-width="1.7" />
    <path d={annaStrands} class="stroke-portrait-ink" stroke-width="1.05" />
  {:else if characterId === "lucia"}
    <path
      d="M18.8 23 18 16.4 21.8 10.6 27.6 6.6 33.8 5.8 40.4 8 45.6 13.6 47.6 20.6 47 27.4 45.4 30.4Q44.8 21.6 39 18.4Q35 16.6 31.2 17.6Q27.6 16.4 23.6 17.8Q20.2 19.6 18.8 23Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.7"
    />
    <!-- A side part; the hair frames the face down to the ear rather than over the cheek. -->
    <path d="M32.2 7.2 31.2 17.4" class="stroke-portrait-ink" stroke-width="1.15" />
    <circle
      cx="16.6"
      cy="33.6"
      r="1.45"
      class="stroke-portrait-ink"
      stroke-width="1.25"
    />
  {:else if characterId === "receptionist"}
    <!-- sleek side part, fringe swept across, tucked behind the ears -->
    <path
      d="M18.7 28.2C17.4 17.6 23.2 11.2 32.2 11.1C41.4 11 47 17.2 45.4 28C44.6 23.6 42.6 20.4 38.6 18.8C34.6 17.4 29.4 16.6 25.8 13.9C24.2 17.4 21.6 21.6 20.6 28.4Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.6"
    />
    <path d="M29.8 13.6Q37 15 42.6 20.2" class="stroke-portrait-ink" stroke-width="1" />
    <circle
      cx="18.3"
      cy="33.4"
      r="1"
      class="fill-portrait-bib stroke-portrait-ink"
      stroke-width="0.8"
    />
  {:else if characterId === "maria"}
    <path
      d="M20.4 21.4c.8-8.6 6-12.4 11.6-12.4s10.8 3.8 11.6 12.4c-2.2-4-6.2-6.6-11.6-6.6s-9.4 2.6-11.6 6.6Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.7"
    />
  {:else if characterId === "waiter"}
    <path
      d="M19.6 26.6C18.2 22.4 18.4 16.6 21.6 13C24.6 9.6 29.4 8.6 33.4 8.8C39.6 9.2 44.4 12.2 45.4 17.6C46 21 45.6 24.4 44.6 26.6L43.4 26.4C43.6 23.4 43.4 21.2 42 19.6C39.2 16.8 33.6 16 29 16.4L26.2 15.4C23.4 16.6 21 19.6 20.8 26.4Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.6"
    />
    <path
      d="M26.2 15.4 24.8 10.4M28.8 12.4Q35.4 11.2 41.6 14.8"
      class="stroke-portrait-ink"
      stroke-width="1"
    />
  {/if}

  {#if look.blush}
    <ellipse
      cx={24.4 + aside * 0.8}
      cy="33.4"
      rx="2"
      ry="1.3"
      class="fill-scene-red-mid/60"
    />
    <ellipse
      cx={39.6 + aside * 0.8}
      cy="33.4"
      rx="2"
      ry="1.3"
      class="fill-scene-red-mid/60"
    />
  {/if}

  <path
    d="M{23.2 + eyeX} {browY}q2.9-1.2 5.8 {-browWorry}M{35 + eyeX} {browY -
      browWorry}q2.9-1.2 5.8 {browWorry}"
    class={brows}
    stroke-width="1.25"
  />
  {#if pose.shut > 0.5}
    <path
      d="M{24 + eyeX} {eyeY + 0.6}q2.2-2 4.4 0M{35.6 + eyeX} {eyeY + 0.6}q2.2-2 4.4 0"
      class="stroke-portrait-ink"
      stroke-width="1.3"
    />
  {:else if pose.shut > 0}
    <!-- Lids coming down, as in a blink: shut at 0.5, past that the eyes squeeze. -->
    {@const ry = Math.max(0.35, 2 * (1 - pose.shut * 2))}
    <ellipse cx={26.2 + eyeX} cy={eyeY} rx="2" {ry} class="fill-portrait-ink" />
    <ellipse cx={37.8 + eyeX} cy={eyeY} rx="2" {ry} class="fill-portrait-ink" />
  {:else}
    <circle cx={26.2 + eyeX} cy={eyeY} r="2" class="fill-portrait-ink" />
    <circle cx={37.8 + eyeX} cy={eyeY} r="2" class="fill-portrait-ink" />
  {/if}

  {#if look.glasses}
    <circle
      cx={26.2 + aside}
      cy="28.5"
      r="4.55"
      class="stroke-portrait-ink"
      stroke-width="1.55"
    />
    <circle
      cx={37.8 + aside}
      cy="28.5"
      r="4.55"
      class="stroke-portrait-ink"
      stroke-width="1.55"
    />
    <path
      d="M{30.7 + aside} 28.5h2.6M{21.6 + aside} 28.4H19"
      class="stroke-portrait-ink"
      stroke-width="1.35"
    />
  {/if}

  <path d="M{noseX} 31.2v2.6" class="stroke-portrait-ink" stroke-width="1.25" />

  {#if mouthOpen}
    <path d={mouthPath(mouthX, 36.2)} class="fill-portrait-ink" />

    {#if pose.mouth > 0.5 && pose.round < 0.5}
      <ellipse
        cx={mouthX}
        cy={36.2 + (0.8 + pose.mouth * 3.6) * 0.76}
        rx="1.3"
        ry={0.3 + pose.mouth * 0.5}
        class="fill-scene-red-mid"
      />
    {/if}
  {:else}
    <path
      d="M{mouthX - 3.4} 36.6q3.4 2.2 6.8 0"
      class="stroke-portrait-ink"
      stroke-width="1.4"
    />
  {/if}

  {#if headphones}
    <clipPath id="{id}-behind-face">
      <path
        d="M-40 -40H104V104H-40ZM18.8 29a13.2 15.2 0 1 0 26.4 0a13.2 15.2 0 1 0-26.4 0Z"
        clip-rule="evenodd"
      />
    </clipPath>
    <g clip-path="url(#{id}-behind-face)">
      {@render cup(phones.far.x, phones.far.rx, -1)}
    </g>
    <path d={phones.band} class="stroke-portrait-ink" stroke-width="2.3" />
    <path d={phones.band} class="stroke-scene-line" stroke-width="0.9" />
    {@render cup(phones.near.x, phones.near.rx, 1)}
  {/if}
{/if}
