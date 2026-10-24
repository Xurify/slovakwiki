<script lang="ts" module>
  /** What a market crate holds: fruit and vegetables a Slovak market sells in season. */
  export type Crate = "apples" | "pears" | "plums" | "strawberries" | "vegetables";
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
  };

  /**
   * Five to a crate, 14 apart. The vegetable crate is heaped with what a
   * Slovak stall sells in autumn: cibuľa, zemiaky and kaleráb at the back,
   * mrkva, cvikla, kapusta and paprika in front, the cabbage last so it
   * sits in front of its neighbours.
   */
  const items = $derived<Array<{ at: number; back?: boolean; item: Item }>>(
    crate === "vegetables"
      ? [
          { at: 0.5, back: true, item: "onion" },
          { at: 1.6, back: true, item: "potato" },
          { at: 3.5, back: true, item: "kohlrabi" },
          { at: 0, item: "carrots" },
          { at: 1, item: "beet" },
          { at: 3, item: "pepper" },
          { at: 4, item: "yellow-pepper" },
          { at: 2, item: "cabbage" },
        ]
      : [0, 1, 2, 3, 4].map((at) => ({ at, item: ITEMS[crate] })),
  );
</script>

{#each items as { at, back, item } (at)}
  {@const c = x + 10 + at * 14}

  <!-- The back row sits a little higher, behind the front one. -->
  <g transform={back ? "translate(0 -5)" : undefined}>
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
      <circle cx={c} cy="145" r="6.5" class="fill-scene-apple" />
      <circle cx={c - 2.2} cy="142.6" r="1.8" class="fill-white/40" />
    {:else if item === "pear"}
      <path
        d="M{c} 137l.6-2.8"
        class="stroke-scene-wood"
        stroke-width="1.1"
        fill="none"
      />
      <path
        d="M{c} 136.6C{c + 2.6} 136.6 {c + 2.8} 140 {c + 3.6} 142C{c + 6.8} 145 {c +
          6.4} 151 {c} 151.5C{c - 6.4} 151 {c - 6.8} 145 {c - 3.6} 142C{c - 2.8} 140 {c -
          2.6} 136.6 {c} 136.6Z"
        class="fill-scene-pear"
      />
      <circle cx={c - 2.2} cy="145" r="1.5" class="fill-white/35" />
    {:else if item === "plum"}
      <ellipse cx={c} cy="146" rx="5" ry="6" class="fill-scene-plum" />
      <path
        d="M{c} 140.4Q{c + 2} 146 {c} 151.6"
        class="stroke-white/25"
        stroke-width="0.8"
        fill="none"
      />
      <circle cx={c - 1.8} cy="143.4" r="1.4" class="fill-white/30" />
    {:else if item === "strawberry"}
      <path
        d="M{c - 6} 142Q{c} 140 {c + 6} 142Q{c + 5} 150 {c} 154Q{c - 5} 150 {c - 6} 142Z"
        class="fill-rose-500"
      />
      <path d="M{c - 4} 142l4 -3l4 3Z" class="fill-scene-leaf" />
      <circle cx={c - 2} cy="146" r="0.9" class="fill-white/60" />
      <circle cx={c + 2} cy="149" r="0.9" class="fill-white/60" />
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
          7} 149 {c + 5.5} 141Q{c} 138.5 {c - 5.5} 141Z"
        class={item === "pepper" ? "fill-scene-apple" : "fill-scene-honey"}
      />
      <path d="M{c} 141.6V150" class="stroke-black/10" stroke-width="0.8" fill="none" />
      <path
        d="M{c} 140v-2.6l1.6-1"
        class="stroke-scene-leaf"
        stroke-width="1.4"
        fill="none"
      />
    {/if}
  </g>
{/each}
