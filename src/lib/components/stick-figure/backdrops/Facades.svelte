<script lang="ts" module>
  /** One old-town burgher house: the floor line is at y 226, so `top` is its cornice. */
  export interface Facade {
    /** A front door under a stone arch, in the ground floor's middle bay. */
    door: boolean;
    /** A curved baroque gable on the street front; otherwise a tiled roof slopes back from the cornice. */
    gable: boolean;
    paint: string;
    top: number;
    width: number;
    x: number;
    /** A shop in the ground floor: its name on a board over wide display windows. */
    shop?: string;
    /** A striped awning over the shop windows, in this paint. */
    awning?: string;
    /** Red geraniums in boxes on the first-floor sills. */
    flowers?: boolean;
    /** Painted shutters folded back beside the upper windows. */
    shutters?: boolean;
    /** A wrought-iron balcony in front of the middle first-floor window. */
    balcony?: boolean;
    /** An arcade along the ground floor: open arches on piers instead of windows. */
    arcade?: boolean;
    /** A sign hung out from the wall on a bracket: a pharmacy's green cross or a café's cup. */
    emblem?: "cross" | "cup";
  }
</script>

<script lang="ts">
  let { houses }: { houses: readonly Facade[] } = $props();

  /** Upper-floor window tops; the ground floor is below the string course at 184. */
  const FLOORS = [110, 146];
  const GROUND_FLOOR = 184;
  const WINDOW = { width: 14, height: 24 };

  function bays(house: Facade): number[] {
    const count = Math.max(1, Math.floor(house.width / 38));
    const step = house.width / count;
    return Array.from({ length: count }, (_, index) => house.x + step * (index + 0.5));
  }

  /** Which bay the door takes: a shop's is at its left end, beside its windows; a house's in the middle. */
  function doorBay(house: Facade): number {
    return house.shop ? 0 : Math.floor(bays(house).length / 2);
  }

  /** A baroque gable: scrolls at the shoulders, upright sides, a cornice and a triangular pediment. */
  function gablePath({ top, width, x }: Facade, lift = 0): string {
    const cx = x + width / 2;
    const half = Math.min(width * 0.28, 32);
    const t = top - lift;
    return [
      `M${cx - half - 14} ${top}`,
      `Q${cx - half - 14} ${t - 16} ${cx - half} ${t - 18}`,
      `V${t - 30}H${cx - half - 3}L${cx} ${t - 46}L${cx + half + 3} ${t - 30}H${cx + half}V${t - 18}`,
      `Q${cx + half + 14} ${t - 16} ${cx + half + 14} ${top}Z`,
    ].join("");
  }

  /** A house's chimney, if it has one: on every other house, off-centre so the roofline varies. */
  function chimney(house: Facade): number | null {
    return Math.round(house.x / 10) % 2 === 0 ? house.x + house.width * 0.72 : null;
  }
</script>

{#each houses as house (house.x)}
  {@const right = house.x + house.width}
  {@const cx = house.x + house.width / 2}
  {@const columns = bays(house)}

  <!-- The roof: seen behind a gable, or sloping back from the cornice with a dormer. -->
  {#if house.gable}
    <path
      d="M{house.x - 2} {house.top - 3}L{cx} {house.top - 50}L{right + 2} {house.top - 3}Z"
      class="fill-scene-red-mid"
    />
    <path d="M{cx} {house.top - 50}L{right + 2} {house.top - 3}H{cx}Z" class="fill-scene-line/10" />
  {:else}
    {@const stack = chimney(house)}
    {#if stack !== null}
      <rect x={stack - 4} y={house.top - 36} width="9" height="16" class="fill-scene-clay" />
      <rect x={stack - 4} y={house.top - 36} width="9" height="16" class="fill-scene-line/15" />
      <rect x={stack - 5.5} y={house.top - 38} width="12" height="3" class="fill-scene-line/30" />
    {/if}
    <path
      d="M{house.x - 3} {house.top - 3}L{house.x + 9} {house.top - 28}H{right - 9}L{right + 3} {house.top - 3}Z"
      class="fill-scene-red-mid"
    />
    {#each [-12, -20] as dy (dy)}
      <path
        d="M{house.x + 4 - dy * 0.1} {house.top + dy}H{right - 4 + dy * 0.1}"
        class="stroke-scene-line/12"
        stroke-width="1"
      />
    {/each}
    {#if house.width >= 100}
      <!-- A dormer window in the roof. -->
      <path d="M{cx - 9} {house.top - 4}V{house.top - 18}L{cx} {house.top - 26}L{cx + 9} {house.top - 18}V{house.top - 4}Z" class={house.paint} />
      <path d="M{cx - 11} {house.top - 17}L{cx} {house.top - 27}L{cx + 11} {house.top - 17}" class="stroke-scene-red-mid" stroke-width="3" fill="none" />
      <rect x={cx - 4.5} y={house.top - 16} width="9" height="11" rx="1" class="fill-scene-sky" />
      <path d="M{cx} {house.top - 16}v11" class="stroke-white/70" stroke-width="1.2" />
    {/if}
  {/if}

  <rect x={house.x} y={house.top} width={house.width} height={226 - house.top} class={house.paint} />

  {#if house.gable}
    <path d={gablePath(house, 3)} class="fill-white/60" />
    <path d={gablePath(house)} class={house.paint} />
    <rect x={cx - Math.min(house.width * 0.28, 32) - 3} y={house.top - 31} width={Math.min(house.width * 0.56, 64) + 6} height="3" class="fill-white/65" />
    <rect x={cx - 6} y={house.top - 26} width="12" height="18" rx="6" class="fill-white/55" />
    <rect x={cx - 4} y={house.top - 24} width="8" height="15" rx="4" class="fill-scene-sky" />
    <circle cx={cx} cy={house.top - 38} r="2.5" class="fill-white/60" />
  {/if}

  <!-- Depth: the house front's shaded right edge, the cornice and its shadow, the string course, the plinth. -->
  <rect x={right - 4} y={house.top} width="4" height={226 - house.top} class="fill-scene-line/6" />
  <rect x={house.x - 2} y={house.top - 3} width={house.width + 4} height="5" class="fill-white/65" />
  <rect x={house.x} y={house.top + 2} width={house.width} height="2.5" class="fill-scene-line/12" />
  <rect x={house.x} y={GROUND_FLOOR - 4} width={house.width} height="3.5" class="fill-white/50" />
  <rect x={house.x} y={GROUND_FLOOR - 0.5} width={house.width} height="1.5" class="fill-scene-line/10" />
  <rect x={house.x} y="219" width={house.width} height="7" class="fill-scene-line/12" />

  {#each FLOORS.filter((y) => y > house.top + 12) as y, floor (y)}
    {@const pediment = floor === FLOORS.filter((row) => row > house.top + 12).length - 1}
    {#each columns as column, bay (column)}
      {@const x = column - WINDOW.width / 2}
      {@const balcony = house.balcony && pediment && bay === Math.floor(columns.length / 2)}
      {#if house.shutters}
        {#each [x - 9, x + WINDOW.width + 3] as leaf (leaf)}
          <rect x={leaf} y={y - 1} width="6" height={WINDOW.height + 2} class="fill-scene-board/55" />
          <path d="M{leaf + 1} {y + 5}h4M{leaf + 1} {y + 11}h4M{leaf + 1} {y + 17}h4" class="stroke-white/30" stroke-width="1" />
        {/each}
      {/if}
      {#if pediment}
        <path d="M{x - 4} {y - 3}L{column} {y - 10}L{x + WINDOW.width + 4} {y - 3}Z" class="fill-white/65" />
      {:else}
        <rect x={x - 3} y={y - 6} width={WINDOW.width + 6} height="3.5" class="fill-white/65" />
      {/if}
      <rect x={x - 2} y={y - 2} width={WINDOW.width + 4} height={WINDOW.height + 4} class="fill-white/55" />
      <rect {x} {y} width={WINDOW.width} height={WINDOW.height} class="fill-scene-sky" />
      <path d="M{x} {y + 12}L{x + 9} {y}H{x + 14}L{x} {y + 19}Z" class="fill-white/25" />
      <path
        d="M{column} {y}v{WINDOW.height}M{x} {y + 8}h{WINDOW.width}"
        class="stroke-white/80"
        stroke-width="1.4"
      />
      <rect x={x - 3} y={y + WINDOW.height + 1} width={WINDOW.width + 6} height="3" class="fill-white/80" />
      <rect x={x - 3} y={y + WINDOW.height + 4} width={WINDOW.width + 6} height="1.5" class="fill-scene-line/12" />
      {#if balcony}
        <rect x={x - 10} y={y + WINDOW.height + 2} width={WINDOW.width + 20} height="4" class="fill-white/80" />
        <rect x={x - 10} y={y + WINDOW.height + 6} width={WINDOW.width + 20} height="2" class="fill-scene-line/15" />
        <path
          d="M{x - 9} {y + 12}H{x + WINDOW.width + 9}M{x - 9} {y + 12}V{y + WINDOW.height + 2}M{x + WINDOW.width + 9} {y + 12}V{y + WINDOW.height + 2}M{x - 4} {y + 12}V{y + WINDOW.height + 2}M{x + 1} {y + 12}V{y + WINDOW.height + 2}M{x + 6} {y + 12}V{y + WINDOW.height + 2}M{x + 13} {y + 12}V{y + WINDOW.height + 2}M{x + 18} {y + 12}V{y + WINDOW.height + 2}"
          class="stroke-scene-line/60"
          stroke-width="1.2"
          fill="none"
        />
      {/if}
      {#if house.flowers && pediment && !balcony}
        <rect x={x - 1} y={y + WINDOW.height - 4} width={WINDOW.width + 2} height="5" rx="1" class="fill-scene-wood" />
        {#each [0, 4, 8, 12] as dx (dx)}
          <circle cx={x + 1 + dx} cy={y + WINDOW.height - 5.5} r="2.2" class="fill-scene-leaf" />
          <circle cx={x + 1 + dx} cy={y + WINDOW.height - 7} r="1.6" class="fill-scene-red" />
        {/each}
      {/if}
    {/each}
  {/each}

  <!-- The ground floor: a shop's sign, awning and display windows, a door under an arch, or plain windows. -->
  {#if house.shop}
    <rect x={house.x + 6} y="186" width={house.width - 12} height="10" rx="1" class="fill-scene-board" />
    <text
      x={cx}
      y="193.8"
      text-anchor="middle"
      font-size="7.5"
      font-weight="700"
      letter-spacing="0.6"
      class="fill-white/90 font-sans">{house.shop.toUpperCase()}</text
    >
  {/if}
  {#each columns as column, bay (column)}
    {#if house.door && bay === doorBay(house)}
      <path d="M{column - 13} 226V{GROUND_FLOOR + 22}a13 13 0 0 1 26 0V226Z" class="fill-white/55" />
      <path d="M{column - 10} 226V{GROUND_FLOOR + 22}a10 10 0 0 1 20 0V226Z" class="fill-scene-coffee/60" />
      <path d="M{column} {GROUND_FLOOR + 12}V226" class="stroke-scene-line/30" stroke-width="1" />
      <circle cx={column - 3} cy="212" r="1" class="fill-scene-honey" />
      <circle cx={column + 3} cy="212" r="1" class="fill-scene-honey" />
      <rect x={column - 15} y="223" width="30" height="3" class="fill-white/60" />
    {:else if house.arcade}
      {@const half = house.width / columns.length / 2 - 4}
      <path d="M{column - half} 226V{GROUND_FLOOR + 18}a{half} {half} 0 0 1 {half * 2} 0V226Z" class="fill-scene-line/35" />
      <path d="M{column - half + 4} 226V{GROUND_FLOOR + 22}a{half - 4} {half - 4} 0 0 1 {half * 2 - 8} 0V226Z" class="fill-scene-line/15" />
      <rect x={column - 5} y="206" width="10" height="20" rx="1" class="fill-scene-coffee/50" />
    {:else if house.shop}
      {@const half = Math.min(15, (house.width / columns.length - 8) / 2)}
      <rect x={column - half - 2} y="199" width={half * 2 + 4} height="25" class="fill-scene-line/45" />
      <rect x={column - half} y="201" width={half * 2} height="21" class="fill-scene-sky" />
      <path d="M{column - half} 212L{column - half + 10} 201H{column - half + 15}L{column - half} 218Z" class="fill-white/30" />
      <rect x={column - half} y="216" width={half * 2} height="6" class="fill-scene-line/15" />
    {:else}
      <rect x={column - 9} y="194" width="18" height="24" class="fill-white/55" />
      <rect x={column - 7} y="196" width="14" height="20" class="fill-scene-sky" />
      <path d="M{column} 196v20M{column - 7} 203h14" class="stroke-white/80" stroke-width="1.4" />
    {/if}
  {/each}
  {#if house.awning}
    {@const stripes = Math.max(3, Math.round((house.width - 8) / 12))}
    {@const stripe = (house.width - 8) / stripes}
    {#each Array.from({ length: stripes }, (_, index) => house.x + 4 + index * stripe) as x, index (x)}
      <path
        d="M{x + stripe * 0.15} 197H{x + stripe * 0.85}L{x + stripe} 205V207A{stripe / 2} 3 0 0 1 {x} 207V205Z"
        class={index % 2 === 0 ? house.awning : "fill-white/90"}
      />
    {/each}
  {/if}
  {#if house.emblem}
    {@const at = house.x + 14}
    <path d="M{house.x} 162H{at + 6}M{house.x} 168L{at - 2} 162" class="stroke-scene-line/60" stroke-width="1.5" fill="none" />
    <path d="M{at + 4} 162v3" class="stroke-scene-line/60" stroke-width="1" />
    {#if house.emblem === "cross"}
      <path d="M{at + 1} 165h6v6h6v6h-6v6h-6v-6h-6v-6h6Z" class="fill-scene-green" />
      <path d="M{at + 2.5} 166.5h3v6h6v3h-6v6h-3v-6h-6v-3h6Z" class="fill-white/30" />
    {:else}
      <circle cx={at + 4} cy="174" r="9" class="fill-scene-board" />
      <path d="M{at - 1} 171h9v4a4.5 4.5 0 0 1 -9 0ZM{at + 8} 172.5a2 2 0 0 1 0 4" class="fill-white/85 stroke-white/85" stroke-width="1" />
      <path d="M{at - 3} 180.5h14" class="stroke-white/85" stroke-width="1.2" />
    {/if}
  {/if}
{/each}
