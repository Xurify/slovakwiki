<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import {
    GROUND_Y,
    STICK_VIEWBOX,
    solveRig,
    type Point,
    type StickLimb,
  } from "$lib/stick-figure/rig";
  import { STICK_SHIRT_CLASS } from "./stick-figure-ui";

  let {
    characterId,
    class: className = "",
    facing = 1,
    pose = REST_POSE,
  }: {
    characterId: LessonCharacterId;
    class?: string;
    facing?: 1 | -1;
    pose?: StickPose;
  } = $props();

  const rig = $derived(solveRig(pose));
  const robot = $derived(characterId === "narrator" || characterId === "guide");
  const hair = $derived(
    characterId === "maria" ? "fill-portrait-hair-grey" : "fill-portrait-hair",
  );
  const brows = $derived(
    characterId === "maria" ? "stroke-portrait-hair-grey" : "stroke-portrait-hair",
  );

  // Head art reuses the 64×64 portrait space of LessonCharacterAvatar, so hair
  // paths match the portraits; 0.82 brings its 15.2 head radius to the rig's.
  const headTransform = $derived(
    `translate(${n(rig.head.x)} ${n(rig.head.y)}) rotate(${n(rig.headAngle)}) scale(0.82) translate(-32 -29)`,
  );
  const eyeX = $derived(pose.look * 2);
  const eyeY = $derived(28.6 + pose.nod * 0.6);
  const browY = $derived(24.8 - Math.max(0, pose.brow) * 2.2);
  const browWorry = $derived(Math.max(0, -pose.brow) * 1.8);
  const mouthOpen = $derived(pose.mouth > 0.06);

  function n(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /** A flat upper lip over a jaw curve: reads as speech, where an ellipse reads as "oh!". */
  function mouthPath(cx: number, top: number, open: number): string {
    const half = (5.8 - open * 0.9) / 2;
    const depth = 0.8 + open * 3.6;
    const bottom = n(top + depth);

    return `M${n(cx - half)} ${top}Q${n(cx)} ${n(top - depth * 0.18)} ${n(cx + half)} ${top}Q${n(cx + half * 0.7)} ${bottom} ${n(cx)} ${bottom}Q${n(cx - half * 0.7)} ${bottom} ${n(cx - half)} ${top}Z`;
  }

  function limbPath(from: Point, limb: StickLimb): string {
    return `M${n(from.x)} ${n(from.y)}L${n(limb.joint.x)} ${n(limb.joint.y)}L${n(limb.end.x)} ${n(limb.end.y)}`;
  }
</script>

<svg
  class="block h-auto w-full overflow-visible {className}"
  viewBox={STICK_VIEWBOX}
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <g transform={facing === -1 ? "scale(-1 1)" : undefined}>
    <ellipse cx="0" cy={GROUND_Y + 0.5} rx="15" ry="2.2" class="fill-portrait-ink/15" />

    <g transform={headTransform}>
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
        <path
          d="M18 22c-1.5-12 5-16 14-16s15.5 4 14 16c2 8 0 18-6 23-4 3-6-3-8-3.5-2 .5-4 6.5-8 3.5-6-5-8-15-6-23Z"
          class="{hair} stroke-portrait-ink"
          stroke-width="1.7"
        />
      {/if}
    </g>

    <path
      d={limbPath(rig.rearShoulder, rig.rearArm)}
      class="stroke-portrait-ink"
      stroke-width="3"
    />
    <circle
      cx={n(rig.rearArm.end.x)}
      cy={n(rig.rearArm.end.y)}
      r="2.3"
      class="fill-portrait-skin stroke-portrait-ink"
      stroke-width="1.2"
    />

    <path
      d={limbPath(rig.hip, rig.rearLeg)}
      class="stroke-portrait-ink"
      stroke-width="3.4"
    />
    <path
      d={limbPath(rig.hip, rig.leadLeg)}
      class="stroke-portrait-ink"
      stroke-width="3.4"
    />
    <path
      d="M{n(rig.rearLeg.end.x - 1)} {GROUND_Y - 1}h5M{n(
        rig.leadLeg.end.x - 1,
      )} {GROUND_Y - 1}h5"
      class="stroke-portrait-ink"
      stroke-width="3.6"
    />

    <path
      d="M{n(rig.hip.x)} {n(rig.hip.y)}L{n(rig.neck.x)} {n(rig.neck.y)}"
      class={STICK_SHIRT_CLASS[characterId]}
      stroke-width="10"
    />

    {#if characterId === "waiter"}
      <path
        d="M{n(rig.neck.x - 3.6)} {n(rig.neck.y)}v3.4l3.6-1.7ZM{n(rig.neck.x + 3.6)} {n(
          rig.neck.y,
        )}v3.4l-3.6-1.7Z"
        class="fill-portrait-bib stroke-portrait-ink"
        stroke-width="1"
      />
    {/if}

    <path
      d={limbPath(rig.leadShoulder, rig.leadArm)}
      class="stroke-portrait-ink"
      stroke-width="3"
    />
    <circle
      cx={n(rig.leadArm.end.x)}
      cy={n(rig.leadArm.end.y)}
      r="2.3"
      class="fill-portrait-skin stroke-portrait-ink"
      stroke-width="1.2"
    />

    <g transform={headTransform}>
      {#if robot}
        <path d="M32 14.5V9" class="stroke-portrait-ink" stroke-width="1.4" />
        <circle
          cx="32"
          cy="8.5"
          r="2.2"
          class="{characterId === 'guide'
            ? 'fill-rose-500'
            : 'fill-rose-400'} stroke-portrait-ink"
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
          class="fill-slate-800 stroke-portrait-ink"
          stroke-width="1.3"
        />
        <rect
          x={21.5 + eyeX}
          y="23"
          width="4.8"
          height="6.8"
          rx="2.4"
          class={characterId === "guide" ? "fill-sky-400" : "fill-rose-300"}
        />
        <rect
          x={37.7 + eyeX}
          y="23"
          width="4.8"
          height="6.8"
          rx="2.4"
          class={characterId === "guide" ? "fill-sky-400" : "fill-rose-300"}
        />

        {#if mouthOpen}
          <path
            d={mouthPath(32 + eyeX, 33.4, pose.mouth)}
            class={characterId === "guide" ? "fill-sky-400" : "fill-rose-300"}
          />
        {:else}
          <path
            d="M{28.5 + eyeX} 34q3.5 2.5 7 0"
            class={characterId === "guide" ? "stroke-sky-400" : "stroke-rose-300"}
            stroke-width="1.35"
          />
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

        {#if characterId === "alex" || characterId === "marek" || characterId === "lucia"}
          <path
            d="M18.6 25.8c-2.2.6-3 4.6-1.1 7.4 1 1.3 2.3.7 2.1-.9-.4-2.2-.6-4.6-1-6.5Z"
            class="fill-portrait-skin stroke-portrait-ink"
            stroke-width="1.5"
          />
        {/if}

        {#if characterId === "alex" || characterId === "marek"}
          <path
            d="M45.4 25.8c2.2.6 3 4.6 1.1 7.4-1 1.3-2.3.7-2.1-.9.4-2.2.6-4.6 1-6.5Z"
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
            d="M19.8 21.6 19.4 17.2 22.6 13 25.8 11.2 27.6 13.2 29.4 11.4 31.2 14.6 33.4 9.2 36.8 7.4 40.6 9.6 44.2 14.2 45.6 19.4 44.8 22.2Q40.6 17.8 35.2 16.8Q32.4 16.4 30.6 18.6Q27.8 16.2 23.6 17.6Q21.2 18.6 19.8 21.6Z"
            class="{hair} stroke-portrait-ink"
            stroke-width="1.7"
          />
          <path
            d="M29.6 11.6 31 16.8M36.2 10.4q4.2 1.6 7 4.8"
            class="stroke-portrait-ink"
            stroke-width="1.15"
          />
        {:else if characterId === "anna"}
          <path
            d="M20.4 17.8C23.8 13.6 28.4 12.8 33.2 14.2C38.2 15.6 42.4 18.6 44.6 22.2C41.2 18.4 36.4 16.6 31.6 16.8C27.2 17 23.4 18 20.4 17.8Z"
            class="{hair} stroke-portrait-ink"
            stroke-width="1.55"
          />
        {:else if characterId === "lucia"}
          <path
            d="M18.8 22.2 18 16.4 21.8 10.6 27.6 6.6 33.8 5.8 40.4 8 45.6 13.6 47.6 20.6 46.4 27.2 43.6 33.4Q40.2 18.4 33.6 17Q31.6 16.6 30.2 19Q26.4 15.8 22.2 17.4Q20 18.8 18.8 22.2Z"
            class="{hair} stroke-portrait-ink"
            stroke-width="1.7"
          />
          <path d="M32.2 7.2 31.4 16.6" class="stroke-portrait-ink" stroke-width="1.15" />
          <circle
            cx="16.6"
            cy="33.6"
            r="1.45"
            class="stroke-portrait-ink"
            stroke-width="1.25"
          />
        {:else if characterId === "receptionist"}
          <path
            d="M20.6 18.8c3-2.8 7-4.2 11.4-4.2s8.4 1.4 11.4 4.2c-3-1.2-6.8-2-11.4-2s-8.4.8-11.4 2Z"
            class="{hair} stroke-portrait-ink"
            stroke-width="1.5"
          />
        {:else if characterId === "maria"}
          <path
            d="M20.4 21.4c.8-8.6 6-12.4 11.6-12.4s10.8 3.8 11.6 12.4c-2.2-4-6.2-6.6-11.6-6.6s-9.4 2.6-11.6 6.6Z"
            class="{hair} stroke-portrait-ink"
            stroke-width="1.7"
          />
        {:else if characterId === "waiter"}
          <path
            d="M20.2 20.6C21.2 11.8 25.8 7.4 32 7.4s10.8 4.4 11.8 13.2c-2.8-1.8-7-2.8-11.8-2.8s-9 1-11.8 2.8Z"
            class="{hair} stroke-portrait-ink"
            stroke-width="1.7"
          />
        {/if}

        {#if characterId === "anna" || characterId === "lucia"}
          <ellipse cx="24.4" cy="33.4" rx="2" ry="1.3" class="fill-rose-400/60" />
          <ellipse cx="39.6" cy="33.4" rx="2" ry="1.3" class="fill-rose-400/60" />
        {/if}

        <path
          d="M{23.2 + eyeX} {browY}q2.9-1.2 5.8 {-browWorry}M{35 + eyeX} {browY -
            browWorry}q2.9-1.2 5.8 {browWorry}"
          class={brows}
          stroke-width="1.25"
        />
        <circle cx={26.2 + eyeX} cy={eyeY} r="2" class="fill-portrait-ink" />
        <circle cx={37.8 + eyeX} cy={eyeY} r="2" class="fill-portrait-ink" />

        {#if characterId === "maria"}
          <circle
            cx="26.2"
            cy="28.5"
            r="4.55"
            class="stroke-portrait-ink"
            stroke-width="1.55"
          />
          <circle
            cx="37.8"
            cy="28.5"
            r="4.55"
            class="stroke-portrait-ink"
            stroke-width="1.55"
          />
          <path
            d="M30.7 28.5h2.6M21.6 28.4h-2.6M42.4 28.4h2.6"
            class="stroke-portrait-ink"
            stroke-width="1.35"
          />
        {/if}

        <path
          d="M{32 + eyeX * 0.4} 31.2v2.6"
          class="stroke-portrait-ink"
          stroke-width="1.25"
        />

        {#if mouthOpen}
          <path
            d={mouthPath(32 + eyeX * 0.6, 36.2, pose.mouth)}
            class="fill-portrait-ink"
          />

          {#if pose.mouth > 0.5}
            <ellipse
              cx={32 + eyeX * 0.6}
              cy={36.2 + (0.8 + pose.mouth * 3.6) * 0.76}
              rx="1.3"
              ry={0.3 + pose.mouth * 0.5}
              class="fill-rose-400"
            />
          {/if}
        {:else}
          <path
            d="M{28.6 + eyeX * 0.6} 36.6q3.4 2.2 6.8 0"
            class="stroke-portrait-ink"
            stroke-width="1.4"
          />
        {/if}
      {/if}
    </g>
  </g>
</svg>
