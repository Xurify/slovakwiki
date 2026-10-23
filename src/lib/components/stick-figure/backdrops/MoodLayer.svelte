<script lang="ts">
  import { fade } from "svelte/transition";

  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import {
    WEATHER_FADE_MS,
    isFair,
    isOutdoors,
    type SceneMood,
  } from "$lib/stick-figure/scene-mood";
  import { SCENE_THINGS, thingBoxes } from "$lib/stick-figure/scene-things";

  /**
   * Light and weather over a drawn place, in front of it: the tint of the
   * hour, wet ground and puddles, snow on the ground, the grey in a window.
   * What hangs in the sky is SkyLayer's, and falling rain and snow is
   * StickWeather's. Lamps from the place's things glow from evening on.
   */
  let { mood, setting }: { mood: SceneMood; setting: StageSetting } = $props();

  const id = $props.id();

  const outdoors = $derived(isOutdoors(setting));
  const things = $derived(SCENE_THINGS[setting] ?? []);
  const lamps = $derived(
    things
      .filter((thing) => thing.id === "lampa")
      .flatMap(thingBoxes)
      // A pendant shade lights from its rim; a standing lamp from its head.
      .map((box) => ({
        x: box.x + box.width / 2,
        y: box.height < 40 ? box.y + box.height : box.y + 18,
      })),
  );
  const windowBox = $derived(things.find((thing) => thing.id === "okno")?.box);
  const lit = $derived(mood.time === "evening" || mood.time === "night");
</script>

<defs>
  <radialGradient id="{id}-glow" class="text-scene-honey">
    <stop offset="0" stop-color="currentColor" stop-opacity="0.75" />
    <stop offset="1" stop-color="currentColor" stop-opacity="0" />
  </radialGradient>
  <linearGradient id="{id}-dusk" class="text-scene-clay" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity="0.8" />
    <stop offset="1" stop-color="currentColor" stop-opacity="0" />
  </linearGradient>
</defs>

{#if mood.time === "morning"}
  <rect x="-10" y="-10" width="980" height="320" class="fill-scene-honey/20" />
{:else if mood.time === "day" && mood.weather === "sunny"}
  <rect x="-10" y="-10" width="980" height="320" class="fill-scene-honey/10" />
{:else if mood.time === "evening"}
  <rect x="-10" y="-10" width="980" height="240" fill="url(#{id}-dusk)" />
  <rect x="-10" y="-10" width="980" height="320" class="fill-scene-clay/12" />
  <rect x="-10" y="-10" width="980" height="320" class="fill-portrait-suit/10" />
{:else if mood.time === "night"}
  <rect x="-10" y="-10" width="980" height="320" class="fill-portrait-suit/55" />
{/if}

{#if !outdoors && windowBox && !isFair(mood.weather)}
  <rect
    x={windowBox.x}
    y={windowBox.y}
    width={windowBox.width}
    height={windowBox.height}
    class="fill-scene-line/20"
    transition:fade={{ duration: WEATHER_FADE_MS }}
  />
{/if}

{#if outdoors && mood.weather === "rain"}
  <g transition:fade={{ duration: WEATHER_FADE_MS }}>
    <rect x="-10" y="-10" width="980" height="320" class="fill-portrait-suit/10" />
    {#each [110, 450, 880] as x (x)}
      <ellipse cx={x} cy={262 + (x % 3) * 8} rx="54" ry="5" class="fill-scene-sky/70" />
    {/each}
  </g>
{:else if outdoors && mood.weather === "snow"}
  <!-- From the floor line down, so the snow lies on the ground, not over the houses. -->
  <path
    d="M-10 232Q240 226 480 230T970 229V310H-10Z"
    class="fill-white/75"
    transition:fade={{ duration: WEATHER_FADE_MS }}
  />
{/if}

{#if lit}
  {#each lamps as lamp, index (index)}
    <circle
      cx={lamp.x}
      cy={lamp.y}
      r={mood.time === "night" ? 90 : 64}
      fill="url(#{id}-glow)"
    />
    <circle cx={lamp.x} cy={lamp.y} r="4" class="fill-white/90" />
  {/each}
{/if}
