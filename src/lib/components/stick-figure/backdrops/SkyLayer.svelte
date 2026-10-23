<script lang="ts">
  import { fade } from "svelte/transition";

  import { scatter } from "$lib/stick-figure/scatter";
  import { WEATHER_FADE_MS, isFair, type SceneMood } from "$lib/stick-figure/scene-mood";
  import { sunIn } from "$lib/stick-figure/places";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import Cloud from "./Cloud.svelte";

  /**
   * An outdoor place's sky and what hangs in it: the sun, the stars, an
   * overcast grey and its clouds. StickBackdrop draws it before the place,
   * so towers, lamps and bunting stand in front of it.
   */
  let { mood, setting }: { mood: SceneMood; setting: StageSetting } = $props();

  const id = $props.id();

  const fair = $derived(isFair(mood.weather));
  const sun = $derived(sunIn(setting, mood));

  const stars = scatter(30, 3, 960, 80);
</script>

<defs>
  <radialGradient id="{id}-sun" class="text-scene-honey">
    <stop offset="0" stop-color="currentColor" stop-opacity="0.75" />
    <stop offset="1" stop-color="currentColor" stop-opacity="0" />
  </radialGradient>
</defs>

<rect x="-10" y="-10" width="980" height="236" class="fill-scene-sky" />

{#if sun}
  <g transition:fade={{ duration: WEATHER_FADE_MS }}>
    <circle cx={sun.x} cy={sun.y} r={sun.r * 2.3} fill="url(#{id}-sun)" />
    <circle cx={sun.x} cy={sun.y} r={sun.r} class="fill-scene-honey" />
  </g>
{/if}

{#if mood.time === "night"}
  <!-- The night's tint lies over the whole place, stars too; a darker sky under them keeps them bright against it. -->
  <rect x="-10" y="-10" width="980" height="236" class="fill-portrait-suit/60" />
  {#if fair}
    {#each stars as star, index (index)}
      <circle cx={star.x} cy={star.y + 6} r={1 + star.size * 1.2} class="fill-white" />
    {/each}
  {/if}
{/if}

{#if !fair}
  <g transition:fade={{ duration: WEATHER_FADE_MS }}>
    <rect x="-10" y="-10" width="980" height="236" class="fill-scene-line/15" />
    {#if mood.weather === "cloudy"}
      <Cloud x={200} y={64} size={1.3} />
      <Cloud x={500} y={48} size={1.5} />
      <Cloud x={790} y={58} size={1.2} />
    {/if}
  </g>
{/if}
