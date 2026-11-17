<script lang="ts">
  import { MAREK_CURL_LINES, MAREK_CURLS } from "$lib/stick-figure/marek-hair";
  import { clockHands, type StickPictureId } from "$lib/stick-figure/pictures";

  /** A 26×17 flag or photo centred on 0,0. */
  let { picture }: { picture: StickPictureId } = $props();

  type Stripes = { paints: string[]; vertical?: boolean };

  /** Flags that are only stripes, top to bottom or left to right. */
  const STRIPES: Partial<Record<StickPictureId, Stripes>> = {
    "flag-at": { paints: ["fill-flag-red", "fill-white", "fill-flag-red"] },
    "flag-de": { paints: ["fill-flag-black", "fill-flag-red", "fill-flag-gold"] },
    "flag-fr": {
      paints: ["fill-flag-blue", "fill-white", "fill-flag-red"],
      vertical: true,
    },
    "flag-hu": { paints: ["fill-flag-red", "fill-white", "fill-flag-green"] },
    "flag-it": {
      paints: ["fill-flag-green", "fill-white", "fill-flag-red"],
      vertical: true,
    },
    "flag-pl": { paints: ["fill-white", "fill-flag-red"] },
    "flag-ua": { paints: ["fill-flag-blue", "fill-flag-gold"] },
  };

  const W = 26;
  const H = 17;

  type Hair = "short" | "long" | "buns" | "marek";
  /**
   * Hair on a head of radius 1 at 0,0, a little outside the skull and outlined like it: a flat cap
   * with no outline read as a helmet. Short is swept to one side from a parting, long is parted in
   * the middle and falls to the shoulders behind, buns sit high behind the ears.
   */
  const HAIR_FRONT: Record<Exclude<Hair, "marek">, string> = {
    short: "M-1.04 0.04A1.08 1.08 0 1 1 1.05 0.1Q1 -0.36 0.34 -0.62Q-0.3 -0.3 -1.04 0.04Z",
    long: "M-1.08 0.5Q-1.2 -1.12 0 -1.12T1.08 0.5Q1 -0.3 0.04 -0.58Q-1 -0.3 -1.08 0.5Z",
    buns: "M-1.06 0.12A1.08 1.08 0 1 1 1.06 0.12Q0.7 -0.44 0 -0.5Q-0.7 -0.44 -1.06 0.12Z",
  };
  const HAIR_BACK =
    "M-1.08 0C-1.3 1.2-1.22 1.9-0.78 2.05L0.78 2.05C1.22 1.9 1.3 1.2 1.08 0A1.08 1.08 0 0 0 -1.08 0Z";

  const stripes = $derived(STRIPES[picture]);
  const clock = $derived(clockHands(picture));

  /** A stroke from `from` to `to` out from the clock's middle, `turns` of the way round from twelve. */
  function hand(turns: number, to: number, from = 0): string {
    const x = Math.sin(turns * 2 * Math.PI);
    const y = -Math.cos(turns * 2 * Math.PI);
    return `M${13 + x * from} ${8.5 + y * from}L${13 + x * to} ${8.5 + y * to}`;
  }
</script>

{#snippet person(
  x: number,
  y: number,
  r: number,
  width: number,
  shirt: string,
  hair: Hair,
  paint: string,
  laughing = false,
)}
  {@const neckY = y + r + 1}
  {@const k = width * 0.28}
  <!-- Someone from the waist up, in the cast's face: hair behind, shoulders past the photo's edge, neck, head, hair in front. -->
  {#if hair === "long"}
    <path
      transform="translate({x} {y}) scale({r})"
      d={HAIR_BACK}
      class="{paint} stroke-portrait-ink"
      stroke-width={0.9 / r}
    />
  {:else if hair === "buns"}
    {#each [-1, 1] as side (side)}
      <circle
        cx={x + side * r * 1.04}
        cy={y - r * 0.36}
        r={r * 0.42}
        class="{paint} stroke-portrait-ink"
        stroke-width="0.9"
      />
    {/each}
  {/if}
  <path
    d="M{x - width / 2} 72V{neckY + k}q0 {-k} {k} {-k}h{width - 2 * k}q{k} 0 {k} {k}V72Z"
    class="{shirt} stroke-portrait-ink"
    stroke-width="0.9"
  />
  <rect x={x - r * 0.3} y={neckY - 3} width={r * 0.6} height="4" class="fill-portrait-skin" />
  <circle cx={x} cy={y} {r} class="fill-portrait-skin stroke-portrait-ink" stroke-width="0.9" />
  {#each [-1, 1] as dx (dx)}
    <ellipse
      cx={x + dx * r * 0.34}
      cy={y + r * 0.1}
      rx={r * 0.1}
      ry={r * 0.14}
      class="fill-portrait-ink"
    />
    <circle
      cx={x + dx * r * 0.56}
      cy={y + r * 0.44}
      r={r * 0.15}
      class="fill-scene-red-mid"
      opacity="0.55"
    />
  {/each}
  {#if laughing}
    <path
      d="M{x - r * 0.28} {y + r * 0.42}h{r * 0.56}q0 {r * 0.34} {-r * 0.28} {r * 0.34}t{-r * 0.28} {-r * 0.34}Z"
      class="fill-portrait-ink"
    />
  {:else}
    <path
      d="M{x - r * 0.24} {y + r * 0.46}q{r * 0.24} {r * 0.24} {r * 0.48} 0"
      class="stroke-portrait-ink"
      fill="none"
      stroke-width={r * 0.09}
      stroke-linecap="round"
    />
  {/if}
  {#if hair === "marek"}
    <!-- His own curls, as on stage: the stage head's face is a 13.2 × 15.2 ellipse at 32,29, the photo's a circle. -->
    <g transform="translate({x} {y}) scale({r / 13.2} {r / 15.2}) translate(-32 -29)">
      <path d={MAREK_CURLS} class="{paint} stroke-portrait-ink" stroke-width={(0.9 * 14) / r} />
      <path d={MAREK_CURL_LINES} class="stroke-portrait-ink" stroke-width={(0.55 * 14) / r} fill="none" />
    </g>
  {:else}
    <path
      transform="translate({x} {y}) scale({r})"
      d={HAIR_FRONT[hair]}
      class="{paint} stroke-portrait-ink"
      stroke-width={0.9 / r}
      stroke-linejoin="round"
    />
  {/if}
{/snippet}

{#snippet tie(x: number, y: number)}
  <path d="M{x - 3} {y}l3 2.6 3-2.6" class="fill-portrait-bib stroke-portrait-ink" stroke-width="0.6" />
  <path d="M{x} {y + 2.4}l-1.3 1.4 1.3 7 1.3-7Z" class="fill-scene-red" />
{/snippet}


<g transform="translate({-W / 2} {-H / 2})">
  {#if stripes}
    {#each stripes.paints as paint, index (index)}
      {#if stripes.vertical}
        <rect
          x={(W / stripes.paints.length) * index}
          y="0"
          width={W / stripes.paints.length}
          height={H}
          class={paint}
        />
      {:else}
        <rect
          x="0"
          y={(H / stripes.paints.length) * index}
          width={W}
          height={H / stripes.paints.length}
          class={paint}
        />
      {/if}
    {/each}
  {:else if clock}
    <!-- A clock app's dial, so the hands show the time said; StickFigure draws it large in a bubble of its own. -->
    <circle cx="13" cy="8.5" r="8.4" class="fill-portrait-ink" />
    <circle cx="13" cy="8.5" r="7.4" class="fill-white" />
    {#each [0, 1, 2, 3] as quarter (quarter)}
      <path
        d={hand(quarter / 4, 6.6, 5.2)}
        class="stroke-portrait-ink"
        stroke-width="0.9"
      />
    {/each}
    <path
      d={hand(((clock.hour % 12) + clock.minute / 60) / 12, 3.6)}
      class="stroke-portrait-ink"
      stroke-width="1.3"
      stroke-linecap="round"
    />
    <path
      d={hand(clock.minute / 60, 5.8)}
      class="stroke-portrait-ink"
      stroke-width="0.8"
      stroke-linecap="round"
    />
    <circle cx="13" cy="8.5" r="0.8" class="fill-portrait-ink" />
  {:else if picture === "computing"}
    <rect width={W} height={H} class="fill-portrait-ink" />
    {#each [0, 1, 2] as dot (dot)}
      <circle
        cx={7 + dot * 6}
        cy="6.4"
        r="1.7"
        class="fill-scene-honey motion-safe:animate-compute-dot"
        style:animation-delay="{dot * 0.3}s"
      />
    {/each}
    <rect x="4" y="11" width="18" height="2.6" rx="1.3" class="fill-scene-line" />
    <rect
      x="4"
      y="11"
      width="18"
      height="2.6"
      rx="1.3"
      class="fill-scene-honey motion-safe:animate-compute"
      style:transform-box="fill-box"
      style:transform-origin="left"
    />
  {:else if picture === "photo-man-dog"}
    <!--
      Peter in the park with his dog Dunčo sitting up beside him, so big his head is above Peter's,
      Peter's arm round him. Drawn four times finer than the picture, as the summer photo is.
    -->
    <g transform="scale(0.25)">
      <rect width="104" height="68" class="fill-scene-sky" />
      <path d="M0 34q30-6 56-2t48-3V68H0Z" class="fill-scene-sage" />
      <circle cx="8" cy="30" r="8" class="fill-scene-green-mid" />
      <circle cx="17" cy="33" r="6" class="fill-scene-leaf" />
      <circle cx="98" cy="28" r="9" class="fill-scene-green-mid" />
      <path d="M0 46q34-5 64-1t40-2V68H0Z" class="fill-scene-leaf" />
      {@render person(30, 28, 9.4, 24, "fill-scene-carrot", "short", "fill-scene-coffee")}

      <path d="M58 72V50q0-12 14-12h4q14 0 14 12v22Z" class="fill-scene-wood stroke-portrait-ink" stroke-width="0.9" />
      {#each [64, 76] as x (x)}
        <path d="M{x} 48h7v15q0 2.2-2.2 2.2h-2.6q-2.2 0-2.2-2.2Z" class="fill-scene-wood stroke-portrait-ink" stroke-width="0.9" />
        <path d="M{x + 2.3} 62.4v2.8M{x + 4.7} 62.4v2.8" class="stroke-portrait-ink" stroke-width="0.6" />
      {/each}
      <path d="M63 38.6q11 5 22 0" class="stroke-scene-red" fill="none" stroke-width="2.4" stroke-linecap="round" />
      <path d="M61.6 20q-6.4 1.2-5.8 11 .4 5 4.6 5 2.6-7.4 3-16Z" class="fill-scene-potato stroke-portrait-ink" stroke-width="0.9" />
      <path d="M86.4 20q6.4 1.2 5.8 11-.4 5-4.6 5-2.6-7.4-3-16Z" class="fill-scene-potato stroke-portrait-ink" stroke-width="0.9" />
      <ellipse cx="74" cy="26" rx="12" ry="10.8" class="fill-scene-wood stroke-portrait-ink" stroke-width="0.9" />
      <ellipse cx="74" cy="32" rx="6.6" ry="5" class="fill-scene-sand" />
      <ellipse cx="74" cy="29.4" rx="2.4" ry="1.7" class="fill-portrait-ink" />
      <path d="M74 31v1.8M71.2 33.2q2.8 1.8 5.6 0" class="stroke-portrait-ink" fill="none" stroke-width="0.7" stroke-linecap="round" />
      <path d="M72.8 34.2q1.2 3.8 2.6 0" class="fill-scene-red-mid" />
      <ellipse cx="69.2" cy="23.6" rx="1.2" ry="1.6" class="fill-portrait-ink" />
      <ellipse cx="78.8" cy="23.6" rx="1.2" ry="1.6" class="fill-portrait-ink" />

      <path d="M40 46q10-4 19.4-3.6" class="stroke-scene-carrot" fill="none" stroke-width="4.6" stroke-linecap="round" />
      <circle cx="60" cy="42.6" r="2.7" class="fill-portrait-skin stroke-portrait-ink" stroke-width="0.9" />
    </g>
  {:else if picture === "photo-house"}
    <!-- A photo of his parents' house by the forest, their old car in front. Drawn four times finer than the picture, as the summer photo is. -->
    <g transform="scale(0.25)">
      <rect class="fill-scene-sky" width="104" height="68" />
      <path class="fill-scene-sage" d="M0 40q26-6 52-2t52-2V68H0Z" />
      <path class="fill-scene-green" d="M8 17.2l7.2 13.2h-3.12l5.28 9.6h-18.72l5.28-9.6h-3.12Z" /><path class="fill-scene-green" d="M18 22l6 11h-2.6l4.4 8h-15.6l4.4-8h-2.6Z" /><path class="fill-scene-green" d="M84 17.2l7.2 13.2h-3.12l5.28 9.6h-18.72l5.28-9.6h-3.12Z" /><path class="fill-scene-green" d="M94 21.6l6.6 12.1h-2.86l4.84 8.8h-17.16l4.84-8.8h-2.86Z" /><path class="fill-scene-green" d="M74 25.4l5.4 9.9h-2.34l3.96 7.2h-14.04l3.96-7.2h-2.34Z" /><path class="fill-scene-green" d="M100 18l6 11h-2.6l4.4 8h-15.6l4.4-8h-2.6Z" />
      <path class="fill-scene-green-mid" d="M2 38q6-14 12 0ZM20 40q5-12 10 0ZM70 40q6-13 12 0ZM88 38q6-15 12 0Z" />
      <path class="fill-scene-leaf" d="M0 50h104V68H0Z" />
      <path class="fill-scene-warm stroke-portrait-ink" d="M30 52V30h44v22Z" stroke-width="0.9" />
      <path class="fill-scene-red stroke-portrait-ink" d="M26 31l26-17 26 17Z" stroke-width="0.9" stroke-linejoin="round" />
      <rect class="fill-scene-red-mid stroke-portrait-ink" x="61" y="12" width="5" height="9" stroke-width="0.8" />
      <rect class="fill-scene-coffee stroke-portrait-ink" x="47" y="38" width="10" height="14" rx="1" stroke-width="0.8" />
      <circle class="fill-scene-honey" cx="55" cy="45.4" r="0.7" />
      <rect class="fill-scene-sky stroke-portrait-ink" x="35" y="36" width="7" height="7" stroke-width="0.8" /><path class="stroke-portrait-ink" d="M38.5 36v7M35 39.5h7" stroke-width="0.5" /><rect class="fill-scene-sky stroke-portrait-ink" x="63" y="36" width="7" height="7" stroke-width="0.8" /><path class="stroke-portrait-ink" d="M66.5 36v7M63 39.5h7" stroke-width="0.5" />
      <!-- Their old car: boxy, round lamps, a chrome bumper. -->
      <path
        d="M19 63v-6q0-1.2 1.2-1.2h3.6l3-5.6q.6-1 1.8-1h13.6q1.2 0 1.8 1l3 5.6h3.6q1.2 0 1.2 1.2v6Z"
        class="fill-scene-green-mid stroke-portrait-ink"
        stroke-width="0.9"
        stroke-linejoin="round"
      />
      <path d="M28.6 55.6l2.4-4.4h5.4v4.4ZM38.6 55.6v-4.4h5.4l2.4 4.4Z" class="fill-scene-sky stroke-portrait-ink" stroke-width="0.6" />
      <rect x="18.4" y="61.4" width="34.6" height="2" rx="1" class="fill-scene-steel stroke-portrait-ink" stroke-width="0.5" />
      <circle cx="52" cy="58.4" r="1.4" class="fill-scene-honey stroke-portrait-ink" stroke-width="0.5" />
      {#each [26, 46] as x (x)}
        <circle cx={x} cy="63.4" r="3.2" class="fill-portrait-ink" />
        <circle cx={x} cy="63.4" r="1.2" class="fill-scene-steel" />
      {/each}
    </g>
  {:else if picture === "photo-summer"}
    <!--
      A summer group photo, drawn four times finer than the picture's 26×17 and framed close, so
      faces read on a phone. Each person the lines ask about is told apart at a glance: Tom with his
      beard and Eva with long hair, their two children in front, his colleagues in shirts and ties
      behind them, and Marek, the only one with curls, a step apart and waving.
    -->
    <g transform="scale(0.25)">
      <rect width="104" height="68" class="fill-scene-sky" />
      <circle cx="96" cy="8" r="4.5" class="fill-scene-honey" />
      <path d="M0 36q24-10 50-5t54-3V68H0Z" class="fill-scene-sage" />
      <path d="M0 48q30-5 60 0t44-2V68H0Z" class="fill-scene-leaf" />
      <circle cx="68" cy="34" r="9" class="fill-scene-green-mid" />
      <circle cx="61" cy="39" r="6" class="fill-scene-leaf" />

      {@render person(28, 15, 7.4, 17, "fill-scene-steel", "short", "fill-portrait-hair")}
      {@render tie(28, 23.4)}
      {@render person(48, 15, 7.4, 17, "fill-portrait-suit", "short", "fill-scene-potato")}
      {@render tie(48, 23.4)}
      <path
        d="M47.3 16.1h1.4M47.3 16.1a2 2 0 1 0-4 0a2 2 0 1 0 4 0M52.7 16.1a2 2 0 1 0-4 0a2 2 0 1 0 4 0"
        class="stroke-portrait-ink"
        fill="none"
        stroke-width="0.7"
      />

      {@render person(14, 31, 8.8, 22, "fill-scene-green-mid", "short", "fill-portrait-hair")}
      <path
        d="M5.4 34q.4 7 8.6 7t8.6-7q-1.4 3.4-3.6 3.6-1.8-.8-5-.8t-5 .8q-2.2-.2-3.6-3.6Z"
        class="fill-portrait-hair stroke-portrait-ink"
        stroke-width="0.9"
        stroke-linejoin="round"
      />

      {@render person(36, 33, 8.2, 19, "fill-scene-honey", "long", "fill-scene-coffee")}

      {@render person(23, 53, 6.6, 15, "fill-scene-red-mid", "buns", "fill-scene-coffee")}
      {@render person(43, 54, 6.6, 15, "fill-scene-blue", "short", "fill-portrait-hair")}

      <path d="M93 46l6-15" class="stroke-portrait-vest" stroke-width="4.4" stroke-linecap="round" />
      <circle cx="99.6" cy="29.4" r="2.6" class="fill-portrait-skin stroke-portrait-ink" stroke-width="0.9" />
      {@render person(85, 33, 8.6, 20, "fill-portrait-vest", "marek", "fill-portrait-hair", true)}
      <path d="M81 42.6l4 4 4-4" class="fill-scene-clay" />
    </g>
  {:else if picture === "photo-mother-girl"}
    <!-- A photo of his sister Zuzana and her daughter, five, at home. Drawn four times finer than the picture, as the summer photo is. -->
    <g transform="scale(0.25)">
      <rect class="fill-scene-warm" width="104" height="68" />
      <path class="fill-scene-sand" d="M0 44h104V68H0Z" />
      <rect class="fill-scene-sky stroke-scene-coffee" x="72" y="8" width="20" height="16" rx="1" stroke-width="1.6" />
      <path class="stroke-scene-coffee" d="M82 8v16M72 16h20" stroke-width="0.8" />
      {@render person(39, 30, 9.4, 24, "fill-scene-plum", "long", "fill-scene-honey")}
      <path d="M70 72V54h18v18Z" class="fill-scene-coffee" />
      <path d="M79 54q-8-6-4-14 6 4 4 14ZM79 54q8-6 4-14-6 4-4 14ZM79 54q-1-10 0-16 1 6 0 16Z" class="fill-scene-leaf stroke-portrait-ink" stroke-width="0.6" />
      {@render person(62, 42, 8.4, 19, "fill-scene-red", "buns", "fill-scene-honey", true)}
      <path d="M46 47q6-1 10.6 3.4" class="stroke-scene-plum" fill="none" stroke-width="4.4" stroke-linecap="round" />
      <circle cx="56.8" cy="51" r="2.5" class="fill-portrait-skin stroke-portrait-ink" stroke-width="0.9" />
      <circle class="fill-scene-blue" cx="55.4" cy="36.4" r="1.2" /><circle class="fill-scene-blue" cx="68.6" cy="36.4" r="1.2" />
    </g>
  {:else if picture === "flag-ca"}
    <rect width={W} height={H} class="fill-white" />
    <rect width="6.5" height={H} class="fill-flag-red" />
    <rect x="19.5" width="6.5" height={H} class="fill-flag-red" />
    <path
      d="M13 3.2l1 2 1.6-.7-.3 2.6 1.9-1.2.2 1.4 1.6-.3-.9 2 .9.7-3.5 1.6.3 1.3-2-.4V14h-1.6v-1.8l-2 .4.3-1.3-3.5-1.6.9-.7-.9-2 1.6.3.2-1.4 1.9 1.2-.3-2.6 1.6.7Z"
      class="fill-flag-red"
    />
  {:else if picture === "flag-cz"}
    <rect width={W} height={H / 2} class="fill-white" />
    <rect y={H / 2} width={W} height={H / 2} class="fill-flag-red" />
    <path d="M0 0L13 {H / 2}L0 {H}Z" class="fill-flag-blue" />
  {:else if picture === "flag-sk"}
    <rect width={W} height={H / 3} class="fill-white" />
    <rect y={H / 3} width={W} height={H / 3} class="fill-flag-blue" />
    <rect y={(2 * H) / 3} width={W} height={H / 3} class="fill-flag-red" />
    <path d="M4.4 3.6h7.2v6.2q0 3.6-3.6 4.8q-3.6-1.2-3.6-4.8Z" class="fill-white" />
    <path d="M5.1 4.3h5.8v5.5q0 3-2.9 4q-2.9-1-2.9-4Z" class="fill-flag-red" />
    <path
      d="M7.6 5h.8v1.2h1.4v.7H8.4v1.1h1.8v.7H8.4v2.1h-.8V8.7H5.8V8h1.8V6.9H6.2v-.7h1.4Z"
      class="fill-white"
    />
    <path
      d="M5.4 12q1.3-1.6 2.6-.4q1.3-1.2 2.6.4q-1.2 1.6-2.6 2.2q-1.4-.6-2.6-2.2Z"
      class="fill-flag-blue"
    />
  {:else if picture === "flag-us"}
    {#each [0, 1, 2, 3, 4, 5, 6] as stripe (stripe)}
      <rect
        y={(H / 7) * stripe}
        width={W}
        height={H / 7}
        class={stripe % 2 === 0 ? "fill-flag-red" : "fill-white"}
      />
    {/each}
    <rect width="11" height={(H / 7) * 4} class="fill-flag-blue" />
    <path
      d="M2.2 2h.8M5.2 2h.8M8.2 2h.8M3.7 4.4h.8M6.7 4.4h.8M2.2 6.8h.8M5.2 6.8h.8M8.2 6.8h.8"
      class="stroke-white"
      stroke-width="1"
    />
  {/if}
  <rect
    width={W}
    height={H}
    rx="1.5"
    class="stroke-portrait-ink"
    fill="none"
    stroke-width="0.9"
  />
</g>
