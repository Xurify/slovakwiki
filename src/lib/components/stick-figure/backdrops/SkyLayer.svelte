<script lang="ts">
  import { fade } from "svelte/transition";

  import type { SceneMood } from "$lib/stick-figure/scene-mood";
  import { SUN_SPOTS } from "$lib/stick-figure/scene-things";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import Cloud from "./Cloud.svelte";

  /**
   * What hangs in an outdoor place's sky: the sun, the stars, an overcast
   * grey and its clouds. Each backdrop draws it straight over its sky, so
   * towers, lamps and bunting stand in front of it.
   */
  let { mood, setting }: { mood: SceneMood; setting: StageSetting } = $props();

  const id = $props.id();

  /** As MoodLayer's weather, so the sky changes with the rain. */
  const WEATHER_MS = 900;

  const fair = $derived(mood.weather === "clear" || mood.weather === "sunny");
  const sun = $derived.by(() => {
    const spots = SUN_SPOTS[setting];
    if (!spots) return undefined;
    if (mood.time === "morning" && fair) return { ...spots.morning, r: 17 };
    if (mood.time === "day" && mood.weather === "sunny") return { ...spots.day, r: 19 };
    return undefined;
  });

  /** The same scatter every time, so the stars do not move between renders. */
  const stars = (() => {
    let state = 3;
    const next = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
    return Array.from({ length: 30 }, () => ({
      size: next(),
      x: next() * 960,
      y: 6 + next() * 80,
    }));
  })();
</script>

<defs>
  <radialGradient id="{id}-sun" class="text-scene-honey">
    <stop offset="0" stop-color="currentColor" stop-opacity="0.75" />
    <stop offset="1" stop-color="currentColor" stop-opacity="0" />
  </radialGradient>
</defs>

{#if sun}
  <g transition:fade={{ duration: WEATHER_MS }}>
    <circle cx={sun.x} cy={sun.y} r={sun.r * 2.3} fill="url(#{id}-sun)" />
    <circle cx={sun.x} cy={sun.y} r={sun.r} class="fill-scene-honey" />
  </g>
{/if}

{#if mood.time === "night"}
  <!-- The night's tint lies over the whole place, stars too; a darker sky under them keeps them bright against it. -->
  <rect x="-10" y="-10" width="980" height="236" class="fill-portrait-suit/60" />
  {#if fair}
    {#each stars as star, index (index)}
      <circle cx={star.x} cy={star.y} r={1 + star.size * 1.2} class="fill-white" />
    {/each}
  {/if}
{/if}

{#if mood.weather === "cloudy" || mood.weather === "rain" || mood.weather === "snow"}
  <g transition:fade={{ duration: WEATHER_MS }}>
    <rect x="-10" y="-10" width="980" height="236" class="fill-scene-line/15" />
    {#if mood.weather === "cloudy"}
      <Cloud x={200} y={64} size={1.3} />
      <Cloud x={500} y={48} size={1.5} />
      <Cloud x={790} y={58} size={1.2} />
    {/if}
  </g>
{/if}
