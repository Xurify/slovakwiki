<script lang="ts">
  import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
  import { isOutdoors, type SceneMood } from "$lib/stick-figure/scene-mood";
  import { SCENE_THINGS, thingBoxes } from "$lib/stick-figure/scene-things";

  /**
   * Light and weather over a drawn place, all still: the stage moves only
   * while someone speaks. Lamps from the place's things glow from evening
   * on; rain and snow fall outside, and indoors only in the window.
   */
  let { mood, setting }: { mood: SceneMood; setting: LessonSceneArtId } = $props();

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

  const drops = scatter(90, 7, 980, 230);
  const flakes = scatter(110, 11, 980, 300);
  const stars = scatter(26, 3, 960, 70);
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
  {#if outdoors && mood.weather === "clear"}
    <circle cx="96" cy="44" r="40" fill="url(#{id}-glow)" />
    <circle cx="96" cy="44" r="17" class="fill-scene-honey" />
  {/if}
{:else if mood.time === "evening"}
  <rect x="-10" y="-10" width="980" height="240" fill="url(#{id}-dusk)" />
  <rect x="-10" y="-10" width="980" height="320" class="fill-scene-clay/12" />
  <rect x="-10" y="-10" width="980" height="320" class="fill-portrait-suit/10" />
{:else if mood.time === "night"}
  <rect x="-10" y="-10" width="980" height="320" class="fill-portrait-suit/55" />
  {#if outdoors}
    {#each stars as star, index (index)}
      <circle cx={star.x} cy={star.y + 6} r={0.8 + star.size} class="fill-white/80" />
    {/each}
  {/if}
{/if}

{#if mood.weather !== "clear"}
  <g clip-path={outdoors || !windowBox ? undefined : `url(#${id}-window)`}>
    {#if !outdoors && windowBox}
      <rect
        x={windowBox.x}
        y={windowBox.y}
        width={windowBox.width}
        height={windowBox.height}
        class="fill-scene-line/20"
      />
    {/if}

    {#if mood.weather === "rain"}
      {#each drops as drop, index (index)}
        <path
          d="M{drop.x} {drop.y}l-5 {10 + drop.size * 8}"
          class="stroke-white/60"
          stroke-width="1.3"
        />
      {/each}
    {:else}
      {#each flakes as flake, index (index)}
        <circle
          cx={flake.x}
          cy={flake.y}
          r={1.4 + flake.size * 1.8}
          class="fill-white/90"
        />
      {/each}
    {/if}
  </g>

  {#if outdoors && mood.weather === "rain"}
    <rect x="-10" y="-10" width="980" height="320" class="fill-portrait-suit/10" />
    {#each [140, 430, 720] as x (x)}
      <ellipse cx={x} cy={262 + (x % 3) * 8} rx="54" ry="5" class="fill-scene-sky/70" />
    {/each}
  {:else if outdoors && mood.weather === "snow"}
    <path d="M-10 230Q240 220 480 228T970 226V310H-10Z" class="fill-white/75" />
  {/if}
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
