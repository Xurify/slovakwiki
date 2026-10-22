<script lang="ts">
  /**
   * Bratislava Castle as it reads from the Danube: a white palace with a red
   * hipped roof and a taller corner tower at each end, each under its own
   * pointed roof. Its foot is centred on x, y.
   */
  let { size = 1, x, y }: { size?: number; x: number; y: number } = $props();

  const BLOCK_WINDOWS = [-25, -15, -5, 5, 15, 25];
  const BLOCK_ROWS = [-37, -26, -15];
  const TOWER_ROWS = [-49, -37, -25, -13];
</script>

<g transform="translate({x} {y}) scale({size})">
  <path d="M-37 -44L-28 -60H28L37 -44Z" class="fill-scene-clay" />
  <path d="M28 -60L37 -44H20Z" class="fill-scene-line/10" />
  <rect x="-36" y="-44" width="72" height="44" class="fill-portrait-bib" />
  <rect x="-36" y="-44" width="72" height="3" class="fill-scene-line/10" />

  {#each BLOCK_ROWS as row (row)}
    {#each BLOCK_WINDOWS as column (column)}
      <rect
        x={column - 2.5}
        y={row}
        width="5"
        height="7"
        rx="1"
        class="fill-scene-line/25"
      />
    {/each}
  {/each}

  {#each [-1, 1] as side (side)}
    {@const cx = side * 38}
    <rect
      x={side > 0 ? 27 : -30}
      y="-41"
      width="3"
      height="41"
      class="fill-scene-line/8"
    />
    <rect x={cx - 8} y="-56" width="16" height="56" class="fill-white" />
    <rect x={cx - 8} y="-56" width="16" height="2.5" class="fill-scene-line/10" />
    <path d="M{cx - 9.5} -56L{cx} -73L{cx + 9.5} -56Z" class="fill-scene-clay" />
    <path d="M{cx} -73L{cx + 9.5} -56H{cx}Z" class="fill-scene-line/10" />
    <path
      d="M{cx} -73v-5"
      class="stroke-scene-line/50"
      stroke-width="1.2"
      stroke-linecap="round"
    />

    {#each TOWER_ROWS as row (row)}
      <rect x={cx - 2.5} y={row} width="5" height="7" rx="1" class="fill-scene-line/25" />
    {/each}
  {/each}
</g>
