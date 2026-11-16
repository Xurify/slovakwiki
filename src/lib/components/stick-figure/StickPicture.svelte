<script lang="ts">
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
  const stripes = $derived(STRIPES[picture]);
  const clock = $derived(clockHands(picture));

  /** A stroke from `from` to `to` out from the clock's middle, `turns` of the way round from twelve. */
  function hand(turns: number, to: number, from = 0): string {
    const x = Math.sin(turns * 2 * Math.PI);
    const y = -Math.cos(turns * 2 * Math.PI);
    return `M${13 + x * from} ${8.5 + y * from}L${13 + x * to} ${8.5 + y * to}`;
  }
</script>

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
    <!-- A clock on a phone's screen, so the hands show the time said. -->
    <rect width={W} height={H} class="fill-portrait-ink" />
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
    <!-- A photo on a phone: a man standing with his big dog on a lawn. -->
    <rect width={W} height={H} class="fill-scene-sky" />
    <rect y="12" width={W} height="5" class="fill-scene-leaf" />
    <circle cx="9" cy="4.2" r="1.9" class="fill-portrait-skin stroke-portrait-ink" stroke-width="0.5" />
    <path d="M9 6.2v4.6M9 10.8l-1.6 3.4M9 10.8l1.6 3.4M9 7.6l-2 2M9 7.6l2.6 1.6" class="stroke-portrait-ink" stroke-width="0.9" />
    <path d="M13.4 9.6h7.4q1.4 0 1.4 1.4v1.2h-8.8Z" class="fill-scene-coffee" />
    <circle cx="21.6" cy="9" r="1.7" class="fill-scene-coffee" />
    <path d="M14.2 12v2.2M15.8 12v2.2M19.6 12v2.2M21.2 12v2.2M13.4 10l-1.4-1.4" class="stroke-scene-coffee" stroke-width="0.9" />
  {:else if picture === "photo-house"}
    <!-- A photo on a phone: a house by trees, a car in front. -->
    <rect width={W} height={H} class="fill-scene-sky" />
    <rect y="13" width={W} height="4" class="fill-scene-sand" />
    <circle cx="4" cy="7" r="3.4" class="fill-scene-leaf" />
    <circle cx="22.6" cy="7.6" r="3" class="fill-scene-leaf" />
    <path d="M7 13V7.6l5.5-4.4 5.5 4.4V13Z" class="fill-scene-honey" />
    <path d="M6 8l6.5-5.4L19 8" class="stroke-scene-red-mid" stroke-width="1.1" fill="none" />
    <rect x="11.2" y="9.2" width="2.6" height="3.8" class="fill-scene-coffee" />
    <path d="M14 15.6v-1.8l1.4-1.6h5l1.4 1.6v1.8Z" class="fill-scene-blue" />
    <circle cx="15.6" cy="15.8" r="0.9" class="fill-portrait-ink" />
    <circle cx="20.4" cy="15.8" r="0.9" class="fill-portrait-ink" />
  {:else if picture === "photo-mother-girl"}
    <!-- A photo on a phone: a woman and a small girl, hand in hand. -->
    <rect width={W} height={H} class="fill-scene-warm" />
    <circle cx="10" cy="4" r="1.9" class="fill-portrait-skin stroke-portrait-ink" stroke-width="0.5" />
    <path d="M8.1 4.2q0-3 1.9-3t1.9 3v2h-3.8Z" class="fill-portrait-hair" />
    <path d="M8.2 6.6h3.6l1 6.6h-5.6Z" class="fill-scene-red-mid" />
    <path d="M9 13.2v2.6M11 13.2v2.6" class="stroke-portrait-ink" stroke-width="0.9" />
    <circle cx="16.6" cy="8.4" r="1.5" class="fill-portrait-skin stroke-portrait-ink" stroke-width="0.5" />
    <path d="M15.4 10.2h2.4l0.8 3.8h-4Z" class="fill-scene-honey" />
    <path d="M16 14v1.8M17.2 14v1.8M12.2 9.4l3.4 1.6" class="stroke-portrait-ink" stroke-width="0.8" />
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
