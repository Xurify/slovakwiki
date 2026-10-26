<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { n } from "$lib/stick-figure/draw";
  import { LOOKS } from "$lib/stick-figure/looks";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";

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
    characterId,
    part = "face",
    pose = REST_POSE,
    turn,
  }: {
    characterId: LessonCharacterId;
    part?: "back" | "face";
    pose?: StickPose;
    /** How far the features sit toward the facing side: a three-quarter view on stage, 0 for a portrait. */
    turn?: number;
  } = $props();

  const look = $derived(LOOKS[characterId]);
  const robot = $derived(look.robot);
  const dog = $derived(look.dog);
  const hair = $derived(look.grey ? "fill-portrait-hair-grey" : "fill-portrait-hair");
  const brows = $derived(
    look.grey ? "stroke-portrait-hair-grey" : "stroke-portrait-hair",
  );

  // The face sits turned toward the way the figure faces (a three-quarter
  // view), so a turn reads at a glance; `look` moves the eyes on top of that.
  const aside = $derived(turn ?? (robot ? 1.4 : dog ? 4 : 2.6));
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
</script>

{#if part === "back"}
  {#if characterId === "anna"}
    <path
      d="M15.4 48.8 14 39 15.2 29 14.2 20 18.2 11.4 25.2 7 33.2 6.4 41.6 8.6 47.8 15.2 50.4 24 48.6 34 50 43.5 47.6 50.8 42.4 47 37.2 51.6 31.4 47.2 25.6 51.4 20.2 47.2Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.7"
    />
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
{:else if robot}
  <path d="M32 14.5V9" class="stroke-portrait-ink" stroke-width="1.4" />
  <circle
    cx="32"
    cy="8.5"
    r="2.2"
    class="{robot.light} stroke-portrait-ink"
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
    <path
      d="M20.4 17.8C23.8 13.6 28.4 12.8 33.2 14.2C38.2 15.6 42.4 18.6 44.6 22.2C41.2 18.4 36.4 16.6 31.6 16.8C27.2 17 23.4 18 20.4 17.8Z"
      class="{hair} stroke-portrait-ink"
      stroke-width="1.55"
    />
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
  <circle cx={26.2 + eyeX} cy={eyeY} r="2" class="fill-portrait-ink" />
  <circle cx={37.8 + eyeX} cy={eyeY} r="2" class="fill-portrait-ink" />

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
{/if}
