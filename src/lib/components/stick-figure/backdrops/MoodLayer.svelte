<script lang="ts">
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import { isOutdoors, type SceneMood } from "$lib/stick-figure/scene-mood";
  import { SCENE_THINGS, thingBoxes } from "$lib/stick-figure/scene-things";
  import { fade } from "svelte/transition";

  /**
   * Light and weather over a drawn place, in front of it; what hangs in
   * the sky is SkyLayer's. Lamps from the place's things glow from evening
   * on, and rain and snow fall outside, indoors only in the window. Falling
   * rain and snow is the one thing on the stage that moves while nobody
   * speaks.
   */
  let { mood, setting }: { mood: SceneMood; setting: StageSetting } = $props();

  const id = $props.id();

  /** Slow enough that rain coming on or easing off reads as weather, not a cut. */
  const WEATHER_MS = 900;

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
  const fair = $derived(mood.weather === "clear" || mood.weather === "sunny");

  /** The same scatter every time, so the weather does not reshuffle between renders. */
  function scatter(count: number, seed: number, width: number, height: number) {
    let state = seed;
    const next = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
    return Array.from({ length: count }, () => ({
      size: next(),
      x: next() * width,
      y: next() * height,
    }));
  }

  /** Drops are scattered over one fall's height and loop through it, so the loop has no seam. */
  const FALL_HEIGHT = 300;
  /** Sideways over one fall: the slant of a drop, 4 across for about 13 down. */
  const RAIN_DRIFT = -90;
  const SNOW_DRIFT = 24;

  // Wider than the stage, so drifting sideways never bares an edge.
  const drops = scatter(170, 7, 1180, FALL_HEIGHT).map((drop) => ({
    ...drop,
    x: drop.x - 100,
  }));
  const flakes = scatter(130, 11, 1180, FALL_HEIGHT).map((flake) => ({
    ...flake,
    x: flake.x - 100,
  }));
  // Near drops and flakes fall faster than far ones, so the weather has depth.
  const rain = [
    { items: drops.filter((drop) => drop.size < 0.5), seconds: 1 },
    { items: drops.filter((drop) => drop.size >= 0.5), seconds: 0.6 },
  ];
  const snow = [
    { items: flakes.filter((flake) => flake.size < 0.5), seconds: 14 },
    { items: flakes.filter((flake) => flake.size >= 0.5), seconds: 9 },
  ];
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
  {#if windowBox}
    <clipPath id="{id}-window">
      <rect
        x={windowBox.x}
        y={windowBox.y}
        width={windowBox.width}
        height={windowBox.height}
      />
    </clipPath>
  {/if}
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

{#if !outdoors && windowBox && !fair}
  <rect
    x={windowBox.x}
    y={windowBox.y}
    width={windowBox.width}
    height={windowBox.height}
    class="fill-scene-line/20"
    transition:fade={{ duration: WEATHER_MS }}
  />
{/if}

{#if mood.weather === "rain"}
  <g transition:fade={{ duration: WEATHER_MS }}>
    <g clip-path={outdoors || !windowBox ? undefined : `url(#${id}-window)`}>
      {#each rain as layer, depth (depth)}
        <g
          class="animate-fall"
          style:animation-duration="{layer.seconds}s"
          style:--fall-x="{RAIN_DRIFT}px"
          style:--fall-y="{FALL_HEIGHT}px"
        >
          {#each [0, 1] as copy (copy)}
            <g transform="translate({-copy * RAIN_DRIFT} {-copy * FALL_HEIGHT})">
              {#each layer.items as drop, index (index)}
                <path
                  d="M{drop.x} {drop.y}l-4 {8 + drop.size * 12}"
                  class="stroke-white"
                  stroke-opacity={0.2 + drop.size * 0.5}
                  stroke-width={0.8 + drop.size * 0.7}
                  stroke-linecap="round"
                />
              {/each}
            </g>
          {/each}
        </g>
      {/each}
    </g>

    {#if outdoors}
      <rect x="-10" y="-10" width="980" height="320" class="fill-portrait-suit/10" />
      {#each [110, 450, 880] as x (x)}
        <ellipse cx={x} cy={262 + (x % 3) * 8} rx="54" ry="5" class="fill-scene-sky/70" />
      {/each}
    {/if}
  </g>
{/if}

{#if mood.weather === "snow"}
  <g transition:fade={{ duration: WEATHER_MS }}>
    <g clip-path={outdoors || !windowBox ? undefined : `url(#${id}-window)`}>
      {#each snow as layer, depth (depth)}
        <g
          class="animate-fall"
          style:animation-duration="{layer.seconds}s"
          style:--fall-x="{SNOW_DRIFT}px"
          style:--fall-y="{FALL_HEIGHT}px"
        >
          {#each [0, 1] as copy (copy)}
            <g transform="translate({-copy * SNOW_DRIFT} {-copy * FALL_HEIGHT})">
              {#each layer.items as flake, index (index)}
                <circle
                  cx={flake.x}
                  cy={flake.y}
                  r={1.4 + flake.size * 1.8}
                  class="fill-white/90"
                />
              {/each}
            </g>
          {/each}
        </g>
      {/each}
    </g>

    {#if outdoors}
      <!-- From the floor line down, so the snow lies on the ground, not over the houses. -->
      <path d="M-10 232Q240 226 480 230T970 229V310H-10Z" class="fill-white/75" />
    {/if}
  </g>
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
