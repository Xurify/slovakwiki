<script lang="ts" module>
  /** What a market crate holds: fruit and vegetables a Slovak market sells in season. */
  export type Crate =
    | "apples"
    | "pears"
    | "plums"
    | "strawberries"
    | "potatoes"
    | "onions"
    | "vegetables";
</script>

<script lang="ts">
  /** One crate's produce, sitting on the crate whose left edge is `x`; the crate front hides below y 148. */
  let { crate, x }: { crate: Crate; x: number } = $props();

  type Item =
    | "apple"
    | "pear"
    | "plum"
    | "strawberry"
    | "carrots"
    | "beet"
    | "cabbage"
    | "pepper"
    | "yellow-pepper"
    | "onion"
    | "potato"
    | "kohlrabi";

  const ITEMS: Record<Exclude<Crate, "vegetables">, Item> = {
    apples: "apple",
    pears: "pear",
    plums: "plum",
    strawberries: "strawberry",
    potatoes: "potato",
    onions: "onion",
  };

  /**
   * Heaped, as a stall keeps its crates: three staggered rows rising to the
   * middle, each fruit turned a little its own way, so the crate reads full
   * rather than as one line of fruit along its rim.
   */
  const ROWS = [
    { lift: 10, ats: [1, 2, 3] },
    { lift: 5, ats: [0.5, 1.5, 2.5, 3.5] },
    { lift: 0, ats: [0, 1, 2, 3, 4] },
  ];
  const MIXED: Item[][] = [
    ["kohlrabi", "cabbage", "onion"],
    ["potato", "onion", "beet", "yellow-pepper"],
    ["carrots", "beet", "cabbage", "pepper", "yellow-pepper"],
  ];
  const TILT = [-8, 5, -3, 7, -6, 4, -2, 6, -5, 3, -7, 2, 8, -4];

  const items = $derived(
    ROWS.flatMap(({ lift, ats }, row) =>
      ats.map((at, index) => ({
        at,
        lift,
        item: crate === "vegetables" ? MIXED[row]![index]! : ITEMS[crate],
      })),
    ).map((entry, index) => ({ ...entry, tilt: TILT[index % TILT.length]! })),
  );
</script>

<path d="M{x + 3} 149Q{x + 38} 124 {x + 73} 149Z" class="fill-scene-line/25" />
{#each items as { at, lift, item, tilt }, i (i)}
  {@const c = x + 10 + at * 14}
  <g transform="translate(0 {-lift}) rotate({tilt} {c} 146)">
    {#if item === "apple"}
      <path
        d="M{c} 139q.4-2.6 1.8-3.6"
        class="stroke-scene-wood"
        stroke-width="1.1"
        fill="none"
      />
      <ellipse
        cx={c + 2.8}
        cy="136.6"
        rx="2.2"
        ry="1"
        transform="rotate(-25 {c + 2.8} 136.6)"
        class="fill-scene-leaf"
      />
      <path
        d="M{c} 140C{c + 3.8} 138.2 {c + 7} 141.5 {c + 6.6} 146C{c + 6} 150 {c +
          2.8} 151.8 {c} 151.2C{c - 2.8} 151.8 {c - 6} 150 {c - 6.6} 146C{c -
          7} 141.5 {c - 3.8} 138.2 {c} 140Z"
        class="fill-scene-apple"
      />
      <circle cx={c - 2.2} cy="142.8" r="1.6" class="fill-white/35" />
    {:else if item === "pear"}
      <path
        d="M{c} 137l.6-2.8"
        class="stroke-scene-wood"
        stroke-width="1.1"
        fill="none"
      />
      <ellipse
        cx={c + 2.4}
        cy="134.8"
        rx="2"
        ry="0.9"
        transform="rotate(-20 {c + 2.4} 134.8)"
        class="fill-scene-leaf"
      />
      <path
        d="M{c} 136.6C{c + 2.6} 136.6 {c + 2.8} 140 {c + 3.6} 142C{c + 6.8} 145 {c +
          6.4} 151 {c} 151.5C{c - 6.4} 151 {c - 6.8} 145 {c - 3.6} 142C{c - 2.8} 140 {c -
          2.6} 136.6 {c} 136.6Z"
        class="fill-scene-pear"
      />
      <circle cx={c - 2.2} cy="145" r="1.5" class="fill-white/35" />
    {:else if item === "plum"}
      <!-- Plums with stems, leaves, teardrop shape, cleft groove and bloom highlight -->
      <path
        d="M{c} 139.8q.3-2.6 1.6-3.6"
        class="stroke-scene-wood"
        stroke-width="0.9"
        fill="none"
      />
      <ellipse
        cx={c + 2.4}
        cy="136.6"
        rx="1.9"
        ry="0.9"
        transform="rotate(-20 {c + 2.4} 136.6)"
        class="fill-scene-leaf"
      />
      <path
        d="M{c} 140.5C{c + 5.2} 140.5 {c + 6.2} 145.5 {c + 4.5} 149.5C{c +
          3} 152.8 {c} 153.2 {c} 153.2C{c} 153.2 {c - 3} 152.8 {c - 4.5} 149.5C{c -
          6.2} 145.5 {c - 5.2} 140.5 {c} 140.5Z"
        class="fill-scene-plum"
      />
      <path
        d="M{c} 140.8Q{c + 1.2} 146 {c} 152.2"
        class="stroke-black/20"
        stroke-width="0.8"
        fill="none"
      />
      <ellipse
        cx={c - 2.2}
        cy="144.5"
        rx="1.5"
        ry="3"
        transform="rotate(-15 {c - 2.2} 144.5)"
        class="fill-white/25"
      />
    {:else if item === "strawberry"}
      <path
        d="M{c} 153C{c - 3} 151 {c - 6.2} 146 {c - 6} 142.6C{c - 5.8} 140 {c - 3} 139.4 {c} 140.4C{c +
          3} 139.4 {c + 5.8} 140 {c + 6} 142.6C{c + 6.2} 146 {c + 3} 151 {c} 153Z"
        class="fill-scene-red"
      />
      <path
        d="M{c - 5} 141l2.5-2 1.2 1.4 1.3-2.4 1.3 2.4 1.2-1.4 2.5 2Q{c} 142.8 {c - 5} 141Z"
        class="fill-scene-leaf"
      />
      {#each [[-2.6, 145], [2, 144.6], [-0.2, 147.8], [2.8, 148.4], [-2.2, 149.4], [0.6, 151]] as [dx, y] (`${dx}-${y}`)}
        <ellipse cx={c + dx!} cy={y} rx="0.45" ry="0.65" class="fill-scene-honey" />
      {/each}
      <ellipse cx={c - 3} cy="143.4" rx="1" ry="1.8" class="fill-white/30" />
    {:else if item === "carrots"}
      <!-- Two carrots standing in the crate, tips down, tops up. -->
      {#each [c - 3.4, c + 3.4] as cx (cx)}
        <path
          d="M{cx} 140l-2.6-6.5M{cx} 140v-7.5M{cx} 140l2.6-6.5"
          class="stroke-scene-leaf"
          stroke-width="1.4"
          fill="none"
        />
        <path d="M{cx - 2.8} 140H{cx + 2.8}L{cx} 156Z" class="fill-scene-carrot" />
        <path
          d="M{cx - 1.8} 143.5h2.2M{cx - 0.8} 146.5h2"
          class="stroke-black/15"
          stroke-width="0.6"
        />
      {/each}
    {:else if item === "beet"}
      <path
        d="M{c} 140l-3-6M{c} 140l2.4-6.6"
        class="stroke-scene-beet"
        stroke-width="1"
        fill="none"
      />
      <ellipse cx={c - 3.4} cy="133.4" rx="2.2" ry="1.4" class="fill-scene-leaf" />
      <ellipse cx={c + 2.8} cy="132.8" rx="2.2" ry="1.4" class="fill-scene-leaf" />
      <circle cx={c} cy="145.5" r="5.6" class="fill-scene-beet" />
      <circle cx={c - 1.8} cy="143.4" r="1.2" class="fill-white/25" />
    {:else if item === "cabbage"}
      <circle cx={c} cy="143.5" r="8.5" class="fill-scene-cabbage" />
      <path
        d="M{c - 8} 142Q{c - 3} 138 {c} 135.4M{c} 135.4Q{c + 4} 139 {c + 8} 143M{c -
          5.4} 149Q{c} 141 {c + 5.8} 149"
        class="stroke-scene-leaf"
        stroke-width="0.9"
        fill="none"
      />
    {:else if item === "onion"}
      <path
        d="M{c} 136Q{c + 6} 141 {c + 5.2} 146Q{c + 4.4} 151 {c} 151.2Q{c - 4.4} 151 {c -
          5.2} 146Q{c - 6} 141 {c} 136Z"
        class="fill-scene-onion"
      />
      <path
        d="M{c} 136.4V133.6"
        class="stroke-scene-potato"
        stroke-width="1"
        fill="none"
      />
      <path
        d="M{c - 2} 140Q{c - 3} 146 {c - 1.4} 150.6"
        class="stroke-white/30"
        stroke-width="0.7"
        fill="none"
      />
    {:else if item === "potato"}
      <ellipse
        cx={c}
        cy="146"
        rx="6.4"
        ry="4.6"
        transform="rotate(-12 {c} 146)"
        class="fill-scene-potato"
      />
      <circle cx={c - 2.4} cy="145" r="0.6" class="fill-black/20" />
      <circle cx={c + 2} cy="147.4" r="0.6" class="fill-black/20" />
    {:else if item === "kohlrabi"}
      <path
        d="M{c - 2} 141l-2.4-5M{c} 140.6v-6M{c + 2} 141l2.4-5"
        class="stroke-scene-leaf"
        stroke-width="1"
        fill="none"
      />
      <ellipse cx={c - 4.6} cy="135.4" rx="1.8" ry="1.2" class="fill-scene-leaf" />
      <ellipse cx={c + 4.6} cy="135.4" rx="1.8" ry="1.2" class="fill-scene-leaf" />
      <circle cx={c} cy="146" r="5.4" class="fill-scene-cabbage" />
      <circle cx={c - 1.8} cy="144" r="1.2" class="fill-white/35" />
    {:else}
      <!-- A bell pepper: three lobes at the bottom, a green stalk on top. -->
      <path
        d="M{c - 5.5} 141Q{c - 7} 149 {c - 3.5} 151.5Q{c} 150 {c + 3.5} 151.5Q{c +
          7} 149 {c + 5.5} 141Q{c + 4.5} 138 {c} 138Q{c - 4.5} 138 {c - 5.5} 141Z"
        class={item === "pepper" ? "fill-scene-red" : "fill-scene-honey"}
      />
      <path d="M{c} 138.5V135" class="stroke-scene-leaf" stroke-width="1.3" fill="none" />
    {/if}
  </g>
{/each}
