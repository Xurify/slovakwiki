<script lang="ts">
  import { fade } from "svelte/transition";

  import { scatter } from "$lib/stick-figure/scatter";
  import {
    BACKDROP_HEIGHT,
    BACKDROP_WIDTH,
    backdropScale,
    backdropToStage,
  } from "$lib/stick-figure/backdrop-geometry";
  import { PLACES, backdropAlign } from "$lib/stick-figure/places";
  import { WEATHER_FADE_MS, fallOf, type SceneMood } from "$lib/stick-figure/scene-mood";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";

  /**
   * Rain and snow falling over the stage, behind the cast: outside over the
   * whole place, indoors only in the window. Each layer is its own HTML box
   * whose transform loops, so the browser moves it without repainting the
   * backdrop under it; animated inside the backdrop's SVG it repainted the
   * whole stage every frame in WebKit.
   */
  let {
    height,
    mood,
    setting,
    width,
  }: { height: number; mood: SceneMood; setting: StageSetting; width: number } = $props();

  /** Drops are scattered over one fall's height, in backdrop units, and loop through it. */
  const FALL = BACKDROP_HEIGHT;
  /** Wider than the backdrop by this much a side, so drifting sideways never bares an edge. */
  const MARGIN = 100;

  // Near drops and flakes fall faster than far ones, so the weather has depth.
  const drops = scatter(170, 7, BACKDROP_WIDTH + 2 * MARGIN, FALL, -MARGIN);
  const flakes = scatter(130, 11, BACKDROP_WIDTH + 2 * MARGIN, FALL, -MARGIN);
  const FALLS = {
    rain: {
      // Sideways over one fall: the slant of a drop, 4 across for about 13 down.
      drift: -90,
      layers: [
        { items: drops.filter((drop) => drop.size < 0.5), seconds: 1 },
        { items: drops.filter((drop) => drop.size >= 0.5), seconds: 0.6 },
      ],
    },
    snow: {
      drift: 24,
      layers: [
        { items: flakes.filter((flake) => flake.size < 0.5), seconds: 14 },
        { items: flakes.filter((flake) => flake.size >= 0.5), seconds: 9 },
      ],
    },
  };

  const scale = $derived(backdropScale(width, height));
  const origin = $derived(
    backdropToStage({ x: 0, y: 0 }, width, height, backdropAlign(setting)),
  );
  /** Where the weather shows, in stage px, and how round its top is: an arched window's. */
  const area = $derived.by(() => {
    const { glass, outdoors } = PLACES[setting];
    if (outdoors) return { height, left: 0, round: 0, top: 0, width };

    if (!glass) return undefined;
    return {
      height: glass.height * scale,
      left: origin.x + glass.x * scale,
      round: glass.arch ? (glass.width / 2) * scale : 0,
      top: origin.y + glass.y * scale,
      width: glass.width * scale,
    };
  });
  const fall = $derived.by(() => {
    const falls = fallOf(mood.weather);
    return falls && FALLS[falls];
  });
</script>

{#if fall && area && width}
  {#key mood.weather}
    <div
      class="pointer-events-none absolute overflow-hidden"
      style:height="{area.height}px"
      style:left="{area.left}px"
      style:top="{area.top}px"
      style:width="{area.width}px"
      style:border-radius="{area.round}px {area.round}px 0 0"
      transition:fade={{ duration: WEATHER_FADE_MS }}
    >
      {#each fall.layers as layer, depth (depth)}
        <!-- Two copies a fall apart: as one slides out at the bottom the other has taken its place. -->
        <div
          class="absolute animate-fall will-change-transform"
          style:height="{2 * FALL * scale}px"
          style:left="{origin.x - MARGIN * scale - area.left}px"
          style:top="{origin.y - FALL * scale - area.top}px"
          style:width="{(BACKDROP_WIDTH + 2 * MARGIN) * scale}px"
          style:animation-duration="{layer.seconds}s"
          style:--fall-x="{fall.drift * scale}px"
          style:--fall-y="{FALL * scale}px"
        >
          <svg
            class="block size-full"
            viewBox="{-MARGIN} {-FALL} {BACKDROP_WIDTH + 2 * MARGIN} {2 * FALL}"
            aria-hidden="true"
          >
            {#each [0, 1] as copy (copy)}
              <g transform="translate({-copy * fall.drift} {-copy * FALL})">
                {#each layer.items as item, index (index)}
                  {#if mood.weather === "rain"}
                    <path
                      d="M{item.x} {item.y}l-4 {8 + item.size * 12}"
                      class="stroke-white"
                      stroke-opacity={0.2 + item.size * 0.5}
                      stroke-width={0.8 + item.size * 0.7}
                      stroke-linecap="round"
                    />
                  {:else}
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r={1.4 + item.size * 1.8}
                      class="fill-white/90"
                    />
                  {/if}
                {/each}
              </g>
            {/each}
          </svg>
        </div>
      {/each}
    </div>
  {/key}
{/if}
