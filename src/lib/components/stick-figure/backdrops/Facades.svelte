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
    /** What a shop shows in its windows. */
    wares?: "flowers";
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
    /** The shop fascia's top y, 186 unless lifted clear of cast heads. */
    fasciaY?: number;
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

  /** Half a shop window's width; a shop showing wares has a wider window to show them in. */
  function shopWindow(house: Facade, count: number): number {
    return Math.min(house.wares ? 20 : 15, (house.width / count - 8) / 2);
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
      {@const lift = balcony ? 6 : 0}
      <!-- A balcony's window is a door down to its floor, and rises to make room. -->
      {#if house.shutters}
        {#each [x - 9, x + WINDOW.width + 3] as leaf (leaf)}
          <rect x={leaf} y={y - 1} width="6" height={WINDOW.height + 2} class="fill-scene-board/55" />
          <path d="M{leaf + 1} {y + 5}h4M{leaf + 1} {y + 11}h4M{leaf + 1} {y + 17}h4" class="stroke-white/30" stroke-width="1" />
        {/each}
      {/if}
      {#if pediment}
        <path d="M{x - 4} {y - 3 - lift}L{column} {y - 10 - lift}L{x + WINDOW.width + 4} {y - 3 - lift}Z" class="fill-white/65" />
      {:else}
        <rect x={x - 3} y={y - 6} width={WINDOW.width + 6} height="3.5" class="fill-white/65" />
      {/if}
      <rect x={x - 2} y={y - 2 - lift} width={WINDOW.width + 4} height={WINDOW.height + 4 + lift} class="fill-white/55" />
      <rect {x} y={y - lift} width={WINDOW.width} height={WINDOW.height + lift + (balcony ? 2 : 0)} class="fill-scene-sky" />
      <path d="M{x} {y + 12}L{x + 9} {y}H{x + 14}L{x} {y + 19}Z" class="fill-white/25" />
      <path
        d="M{column} {y - lift}v{WINDOW.height + lift}M{x} {y + 8 - lift}h{WINDOW.width}"
        class="stroke-white/80"
        stroke-width="1.4"
      />
      {#if !balcony}
        <rect x={x - 3} y={y + WINDOW.height + 1} width={WINDOW.width + 6} height="3" class="fill-white/80" />
        <rect x={x - 3} y={y + WINDOW.height + 4} width={WINDOW.width + 6} height="1.5" class="fill-scene-line/12" />
      {/if}
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
    {@const fy = house.fasciaY ?? 186}
    <rect x={house.x + 6} y={fy} width={house.width - 12} height="10" rx="1" class="fill-scene-board" />
    {#each [house.x + 9, house.x + house.width - 9] as fixing (fixing)}
      <circle cx={fixing} cy={fy + 5} r="0.9" class="fill-white/50" />
    {/each}
    <text
      x={cx}
      y={fy + 7.8}
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
      <path d="M{column - half - 2} 226V{GROUND_FLOOR + 18}a{half + 2} {half + 2} 0 0 1 {half * 2 + 4} 0V226Z" class="fill-white/60" />
      <path d="M{column - half} 226V{GROUND_FLOOR + 18}a{half} {half} 0 0 1 {half * 2} 0V226Z" class="fill-scene-line/55" />
      <path d="M{column - half + 5} 226V{GROUND_FLOOR + 24}a{half - 5} {half - 5} 0 0 1 {half * 2 - 10} 0V226Z" class="fill-scene-line/20" />
      <rect x={column - 6} y="204" width="12" height="22" rx="1" class="fill-scene-coffee/70" />
      <rect x={column - 4} y="207" width="8" height="7" class="fill-scene-sky/70" />
    {:else if house.shop}
      {@const half = shopWindow(house, columns.length)}
      <rect x={column - half - 2} y="199" width={half * 2 + 4} height="25" class="fill-scene-line/45" />
      <rect x={column - half} y="201" width={half * 2} height="21" class="fill-scene-sky" />
      <path d="M{column - half} 212L{column - half + 10} 201H{column - half + 15}L{column - half} 218Z" class="fill-white/30" />
      <rect x={column - half} y="216" width={half * 2} height="6" class="fill-scene-line/15" />
      {#if house.wares === "flowers"}
        {#each [-0.6, 0, 0.6] as at, index (at)}
          {@const bx = column + at * half}
          <!-- Buckets of flowers out on the pavement in front of the window. -->
          <path d="M{bx - 3.5} 221.5h7l-1 7h-5Z" class="fill-scene-steel-dark" />
          <path d="M{bx} 222V218M{bx} 221L{bx - 3} 217.5M{bx} 221L{bx + 3} 217.5" class="stroke-scene-leaf" stroke-width="1" />
          {#each [-3, 0, 3] as dx (dx)}
            <circle cx={bx + dx} cy={dx === 0 ? 215.6 : 216.6} r="2" class={["fill-scene-red", "fill-scene-honey", "fill-scene-plum"][(index + Math.round(dx / 3) + 3) % 3]} />
          {/each}
        {/each}
      {/if}
    {:else}
      <rect x={column - 9} y="194" width="18" height="24" class="fill-white/55" />
      <rect x={column - 7} y="196" width="14" height="20" class="fill-scene-sky" />
      <path d="M{column} 196v20M{column - 7} 203h14" class="stroke-white/80" stroke-width="1.4" />
    {/if}
  {/each}
  {#if house.awning}
    <!-- An awning over each shop window: canvas sloping out from the wall, a scalloped valance at its edge. -->
    {#each columns as column, bay (column)}
      {#if !(house.door && bay === doorBay(house))}
        {@const half = shopWindow(house, columns.length) + 4}
        <rect x={column - half - 1} y="197" width={half * 2 + 2} height="2" class="fill-scene-line/50" />
        {#each [0, 1, 2, 3, 4] as index (index)}
          {@const top = column - half + 2 + index * ((half * 2 - 4) / 5)}
          {@const bottom = column - half - 3 + index * ((half * 2 + 6) / 5)}
          <path
            d="M{top} 198H{top + (half * 2 - 4) / 5}L{bottom + (half * 2 + 6) / 5} 209H{bottom}Z"
            class={index % 2 === 0 ? house.awning : "fill-white/95"}
          />
          <path
            d="M{bottom} 209H{bottom + (half * 2 + 6) / 5}V212A{(half * 2 + 6) / 10} 3 0 0 1 {bottom} 212Z"
            class={index % 2 === 0 ? house.awning : "fill-white/95"}
          />
        {/each}
        <rect x={column - half - 3} y="209" width={half * 2 + 6} height="1.5" class="fill-scene-line/15" />
        <rect x={column - half} y="215" width={half * 2} height="3" class="fill-scene-line/10" />
      {/if}
    {/each}
  {/if}
  {#if house.emblem}
    {@const at = house.x + 20}
    <rect x={house.x + 5} y="156" width="5" height="16" rx="1" class="fill-scene-line/70" />
    <circle cx={house.x + 7.5} cy="159" r="0.9" class="fill-white/60" />
    <circle cx={house.x + 7.5} cy="169" r="0.9" class="fill-white/60" />
    <path d="M{house.x + 10} 162H{at + 6}M{house.x + 10} 170L{at - 2} 162" class="stroke-scene-line/70" stroke-width="1.6" fill="none" />
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
