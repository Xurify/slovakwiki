<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { LOOKS } from "$lib/stick-figure/looks";

  /**
   * Clothes from the neck to the hem, drawn in torso space: hip at 0,0, neck
   * at 0,-30, shoulders at ±4,-26. The parent rotates this by the lean, so
   * garments bend with the body. Skirts and aprons hang over the legs, which
   * are drawn first.
   */
  let {
    characterId,
    scarf = false,
  }: {
    characterId: LessonCharacterId;
    /** Wrapped round the neck outdoors in the snow. */
    scarf?: boolean;
  } = $props();

  const look = $derived(LOOKS[characterId]);
</script>

{#if characterId === "receptionist"}
  <!-- navy pencil skirt under a blue blazer, white blouse, name badge -->
  <path
    d="M-5.4 -0.5L5.4 -0.5L5.9 13.5Q0 14.6 -5.9 13.5Z"
    class="fill-portrait-suit stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path
    d="M-6 -27.6Q-6.4 -30.8 -3 -31L3 -31Q6.4 -30.8 6 -27.6L4.7 -14Q5.9 -6.5 5.6 0.6Q0 1.8 -5.6 0.6Q-5.9 -6.5 -4.7 -14Z"
    class="fill-blue-600 stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path d="M-2.7 -30.8L0 -23.2L2.7 -30.8Z" class="fill-portrait-bib" />
  <path
    d="M-2.7 -30.8L0 -23.2L2.7 -30.8M-3.9 -30.4L-1.6 -21.8M3.9 -30.4L1.6 -21.8"
    class="stroke-portrait-ink"
    stroke-width="0.8"
  />
  <circle cx="0" cy="-17.4" r="0.75" class="fill-portrait-ink" />
  <circle cx="0" cy="-12.6" r="0.75" class="fill-portrait-ink" />
  <rect
    x="1.7"
    y="-25.6"
    width="3.1"
    height="1.9"
    rx="0.4"
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="0.6"
  />
{:else if characterId === "waiter"}
  <!-- long bistro apron, white shirt, dark waistcoat, bow tie -->
  <path
    d="M-6.4 -3.2L6.4 -3.2L7.2 22Q0 23.4 -7.2 22Z"
    class="fill-portrait-vest stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path d="M-6.1 -3.2H6.1" class="stroke-portrait-bib" stroke-width="0.9" />
  <path
    d="M-5.4 -27.8Q-5.8 -30.9 -2.8 -31.1L2.8 -31.1Q5.8 -30.9 5.4 -27.8L4.9 -3.2L-4.9 -3.2Z"
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path
    d="M-5.4 -27.6Q-5.7 -30.6 -3.3 -30.9L0 -20.6L3.3 -30.9Q5.7 -30.6 5.4 -27.6L5 -4.6L0 -2.6L-5 -4.6Z"
    class="fill-portrait-vest stroke-portrait-ink"
    stroke-width="1"
  />
  <circle cx="0" cy="-16.6" r="0.65" class="fill-portrait-bib" />
  <circle cx="0" cy="-12.4" r="0.65" class="fill-portrait-bib" />
  <circle cx="0" cy="-8.2" r="0.65" class="fill-portrait-bib" />
  <path d="M-3.4 -31.7v3.2l3.4-1.6ZM3.4 -31.7v3.2l-3.4-1.6Z" class="fill-portrait-ink" />
{:else if look.robot}
  <!-- robot chassis to match the visor head: light casing, chest screen -->
  <rect
    x="-2"
    y="-34.2"
    width="4"
    height="3.6"
    rx="1"
    class="fill-slate-700 stroke-portrait-ink"
    stroke-width="0.9"
  />
  <rect
    x="-6.4"
    y="-31"
    width="12.8"
    height="32"
    rx="4.2"
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="1.3"
  />
  <rect
    x="-3.8"
    y="-25.2"
    width="7.6"
    height="9"
    rx="2"
    class="fill-slate-800 stroke-portrait-ink"
    stroke-width="0.9"
  />
  <circle cx="0" cy="-20.7" r="1.5" class={look.robot.chest} />
  <path d="M-4.8 -6.4H4.8" class="stroke-portrait-ink" stroke-width="0.8" />
  <circle cx="-2.6" cy="-3" r="0.7" class="fill-sky-400" />
  <circle cx="0" cy="-3" r="0.7" class="fill-rose-500" />
  <circle cx="2.6" cy="-3" r="0.7" class="fill-sky-400" />
{:else if characterId === "lucia"}
  <!-- green A-line dress with a scoop neck and a shop name tag -->
  <path
    d="M-5.2 -28.4Q-5.6 -30.8 -2.7 -31L2.7 -31Q5.6 -30.8 5.2 -28.4L4.2 -12.2L8.6 11.8Q0 13.8 -8.6 11.8L-4.2 -12.2Z"
    class="fill-emerald-600 stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path
    d="M-2.5 -30.9Q0 -27.4 2.5 -30.9Z"
    class="fill-portrait-skin stroke-portrait-ink"
    stroke-width="0.8"
  />
  <path d="M-4.2 -12.2H4.2" class="stroke-portrait-ink" stroke-width="0.9" />
  <rect
    x="1.5"
    y="-26"
    width="3"
    height="1.7"
    rx="0.4"
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="0.6"
  />
{:else if characterId === "alex"}
  <!-- blue zip hoodie over a white tee, the hood bunched behind the neck -->
  <path
    d="M-4 -32.4Q0 -35.4 4 -32.4L4.6 -29.6H-4.6Z"
    class="fill-blue-600 stroke-portrait-ink"
    stroke-width="1"
  />
  <path
    d="M-6 -27.8Q-6.4 -30.9 -3 -31.1L3 -31.1Q6.4 -30.9 6 -27.8L5.6 -1.6Q0 0.4 -5.6 -1.6Z"
    class="fill-blue-600 stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path d="M-2 -31L0 -26.6L2 -31Z" class="fill-portrait-bib" />
  <path
    d="M0 -26.6V-1M-5.6 -3.8Q0 -1.8 5.6 -3.8M-4.4 -9.6Q0 -11.4 4.4 -9.6"
    class="stroke-portrait-ink"
    stroke-width="0.8"
  />
  <path
    d="M-1.5 -29.6l-.4 4.4M1.5 -29.6l.4 4.4"
    class="stroke-portrait-bib"
    stroke-width="0.7"
  />
{:else if characterId === "anna"}
  <!-- rose knit sweater over a white collar, a bag on a strap across -->
  <path
    d="M-5.8 -27.8Q-6.2 -30.9 -3 -31.1L3 -31.1Q6.2 -30.9 5.8 -27.8L5.4 -2.4Q0 -0.6 -5.4 -2.4Z"
    class="fill-rose-500 stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path
    d="M-3.2 -31Q-1.6 -27.6 0 -29.2Q1.6 -27.6 3.2 -31Z"
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="0.7"
  />
  <path d="M-5.4 -4.6Q0 -2.8 5.4 -4.6" class="stroke-portrait-ink" stroke-width="0.7" />
  <path d="M-4.4 -29.6L5.6 -8.6" class="stroke-portrait-hair" stroke-width="1.3" />
  <rect
    x="3.4"
    y="-9.8"
    width="5.2"
    height="4.6"
    rx="1"
    class="fill-portrait-hair stroke-portrait-ink"
    stroke-width="0.7"
  />
{:else if characterId === "maria"}
  <!-- rose cardigan open over a white blouse, long navy skirt -->
  <path
    d="M-5.6 -1L5.6 -1L7.4 22Q0 23.4 -7.4 22Z"
    class="fill-portrait-suit stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path
    d="M-5 -27.8H5L4.6 -1.4H-4.6Z"
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="1"
  />
  <path
    d="M-6 -27.8Q-6.4 -30.9 -3 -31.1L-1.4 -31L-1.8 -0.8Q-4 -0.4 -5.6 -1.4Z"
    class="fill-rose-500 stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path
    d="M6 -27.8Q6.4 -30.9 3 -31.1L1.4 -31L1.8 -0.8Q4 -0.4 5.6 -1.4Z"
    class="fill-rose-500 stroke-portrait-ink"
    stroke-width="1.1"
  />
  <circle
    cx="-3.6"
    cy="-23.6"
    r="0.9"
    class="fill-scene-honey stroke-portrait-ink"
    stroke-width="0.5"
  />
{:else if characterId === "marek"}
  <!-- charcoal sweater over a collared shirt -->
  <path
    d="M-6 -27.8Q-6.4 -30.9 -3 -31.1L3 -31.1Q6.4 -30.9 6 -27.8L5.6 -1.6Q0 0.4 -5.6 -1.6Z"
    class="fill-portrait-vest stroke-portrait-ink"
    stroke-width="1.1"
  />
  <path
    d="M-3.6 -31.2L0 -28.2L-1.4 -26ZM3.6 -31.2L0 -28.2L1.4 -26Z"
    class="fill-portrait-bib stroke-portrait-ink"
    stroke-width="0.6"
  />
  <path
    d="M-5.6 -3.8Q0 -1.8 5.6 -3.8"
    class="stroke-portrait-bib/40"
    stroke-width="0.8"
  />
{/if}

{#if scarf && look.scarfClass}
  <path
    d="M2 -28.4L4.6 -17.8L1.4 -17.4L0 -27.6Z"
    class="{look.scarfClass} stroke-portrait-ink"
    stroke-width="0.9"
  />
  <path
    d="M-5.6 -32.2Q0 -29 5.6 -32.2L5.8 -28.4Q0 -25.4 -5.8 -28.4Z"
    class="{look.scarfClass} stroke-portrait-ink"
    stroke-width="1"
  />
{/if}
