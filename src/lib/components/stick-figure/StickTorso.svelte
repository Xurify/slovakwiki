<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { STICK_SHIRT_CLASS } from "./stick-figure-ui";

  /**
   * Clothes from the neck to the hem, drawn in torso space: hip at 0,0, neck
   * at 0,-30, shoulders at ±4,-26. The parent rotates this by the lean, so
   * garments bend with the body. Skirts and aprons hang over the legs, which
   * are drawn first.
   */
  let { characterId }: { characterId: LessonCharacterId } = $props();
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
{:else if characterId === "guide"}
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
  <circle cx="0" cy="-20.7" r="1.5" class="fill-sky-400" />
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
{:else}
  <path d="M0 0L0 -30" class={STICK_SHIRT_CLASS[characterId]} stroke-width="10" />
{/if}
