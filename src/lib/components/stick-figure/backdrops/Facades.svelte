<script lang="ts" module>
  /** One old-town facade: the floor line is at y 226, so `top` is its eaves. */
  export interface Facade {
    door: boolean;
    gable: boolean;
    paint: string;
    top: number;
    width: number;
    x: number;
  }
</script>

<script lang="ts">
  let { houses }: { houses: readonly Facade[] } = $props();

  const WINDOW_ROWS = [106, 140, 174];

  function housePath(house: Facade): string {
    const right = house.x + house.width;
    const roof = house.gable ? `L${house.x + house.width / 2} ${house.top - 30}` : "";
    return `M${house.x} 226V${house.top}${roof}L${right} ${house.top}V226Z`;
  }

  function windowXs(house: Facade): number[] {
    const count = Math.max(1, Math.floor(house.width / 40));
    const step = house.width / count;
    return Array.from(
      { length: count },
      (_, index) => house.x + step * (index + 0.5) - 7,
    );
  }
</script>

{#each houses as house (house.x)}
  <path d={housePath(house)} class={house.paint} />

  {#if house.gable}
    <circle
      cx={house.x + house.width / 2}
      cy={house.top - 10}
      r="5"
      class="fill-white/60"
    />
  {:else}
    <rect
      x={house.x}
      y={house.top}
      width={house.width}
      height="5"
      class="fill-white/35"
    />
  {/if}

  {#each windowXs(house) as x (x)}
    {#each WINDOW_ROWS.filter((y) => y > house.top + 8) as y (y)}
      <rect {x} {y} width="14" height="20" rx="1.5" class="fill-white/70" />
      <rect x={x + 2} y={y + 2} width="10" height="16" rx="1" class="fill-scene-sky" />
    {/each}
  {/each}

  {#if house.door}
    <path
      d="M{house.x + house.width / 2 - 9} 226V206a9 9 0 0 1 18 0V226Z"
      class="fill-scene-line/25"
    />
  {/if}
{/each}
