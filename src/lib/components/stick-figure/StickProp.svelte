<script lang="ts">
  import type { StickPropId } from "$lib/stick-figure/props";

  /** Drawn around the hand at 0,0, which grips its lower edge; it stays upright as the arm moves. */
  let { prop }: { prop: StickPropId } = $props();
</script>

<g class="stroke-portrait-ink" stroke-width="0.8">
  {#if prop === "apple"}
    <path d="M0 -8.6q.4-2 1.8-2.8" fill="none" />
    <ellipse
      cx="2.6"
      cy="-10.6"
      rx="1.8"
      ry="0.9"
      transform="rotate(-25 2.6 -10.6)"
      class="fill-scene-leaf"
    />
    <path
      d="M0 -8.4q-4.6-1.6-4.6 3q0 4.6 4.6 5q4.6-.4 4.6-5q0-4.6-4.6-3Z"
      class="fill-scene-leaf"
    />
    <circle cx="-2" cy="-5.6" r="1" class="fill-white/60" stroke="none" />
  {:else if prop === "bag"}
    <!-- Hangs from the hand by its handles. -->
    <path d="M-4 6Q-4 -1 0 -1Q4 -1 4 6" fill="none" stroke-width="1.1" />
    <path d="M-7 5h14l-1 12a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2Z" class="fill-scene-clay" />
    <path d="M-6.6 9h13.2" class="stroke-white/50" stroke-width="1.2" />
  {:else if prop === "ball"}
    <!-- A dog's rubber ball, held up in the fingers. -->
    <circle cx="0" cy="-4.4" r="4.2" class="fill-scene-apple" />
    <path
      d="M-3.6 -6.4q3.6 2.4 7.2 0"
      class="stroke-white/70"
      stroke-width="0.9"
      fill="none"
    />
  {:else if prop === "basket"}
    <path d="M-6 7Q-6 -1 0 -1Q6 -1 6 7" fill="none" stroke-width="1.1" />
    <circle cx="-3.6" cy="6.4" r="2.2" class="fill-scene-red-mid" />
    <circle cx="0.4" cy="5.8" r="2.2" class="fill-scene-red-mid" />
    <circle cx="4" cy="6.6" r="2.2" class="fill-scene-red-mid" />
    <path d="M-8 7h16l-2 8.5h-12Z" class="fill-scene-wood" />
    <path d="M-7 10h14M-6.4 13h12.8" class="stroke-scene-line/40" stroke-width="0.7" />
  {:else if prop === "book"}
    <rect x="-4" y="-11" width="9" height="11.5" rx="1" class="fill-scene-honey" />
    <path d="M-2.2 -11V0.5" stroke-width="0.6" />
    <path d="M0 -8.2h3M0 -6.4h2" class="stroke-portrait-bib" stroke-width="0.7" />
  {:else if prop === "camera"}
    <rect x="-3.6" y="-10.8" width="4" height="2.2" rx="0.6" class="fill-portrait-vest" />
    <rect x="-6" y="-9" width="13" height="8.5" rx="1.8" class="fill-portrait-vest" />
    <circle cx="1.2" cy="-4.8" r="2.6" class="fill-portrait-ground stroke-portrait-bib" />
    <circle cx="5" cy="-7.4" r="0.7" class="fill-scene-honey" stroke="none" />
  {:else if prop === "card"}
    <rect x="-3" y="-8" width="9.5" height="6" rx="1" class="fill-scene-honey" />
    <path d="M-2.6 -6.2h8.8" class="stroke-portrait-vest" stroke-width="1.1" />
  {:else if prop === "clipboard"}
    <rect x="-5" y="-13" width="10" height="13.5" rx="1.2" class="fill-scene-wood" />
    <rect
      x="-3.6"
      y="-11"
      width="7.2"
      height="10"
      class="fill-portrait-bib"
      stroke="none"
    />
    <path d="M-2.4 -8.4h4.8M-2.4 -6.4h4.8M-2.4 -4.4h3" class="stroke-scene-edge" />
    <rect x="-2" y="-14" width="4" height="2.4" rx="0.6" class="fill-scene-edge" />
  {:else if prop === "cup"}
    <ellipse cx="0" cy="-1.8" rx="6.5" ry="1.4" class="fill-portrait-bib" />
    <path d="M4 -7.6q2.6 0 2.4 2.2q-.2 1.8-2.6 1.6" />
    <path
      d="M-4 -9h8v4.5a3.5 3 0 0 1-3.5 3h-1a3.5 3 0 0 1-3.5-3Z"
      class="fill-portrait-bib"
    />
    <path d="M-1 -11.6q1-1.2 0-2.4M1.8 -11.6q1-1.2 0-2.4" class="stroke-scene-edge" />
  {:else if prop === "keys"}
    <circle cx="0" cy="-3.6" r="2.2" />
    <path d="M1 -1.8l2.5 6.5M-1 -1.6l-1.2 7" stroke-width="2.6" />
    <path
      d="M1 -1.8l2.5 6.5M-1 -1.6l-1.2 7"
      class="stroke-scene-honey"
      stroke-width="1.2"
    />
  {:else if prop === "letter"}
    <rect x="-5" y="-8" width="11" height="7.5" rx="0.8" class="fill-portrait-bib" />
    <path d="M-5 -8l5.5 4 5.5-4" stroke-width="0.7" />
    <rect x="3" y="-7.2" width="2" height="2" class="fill-scene-clay" stroke="none" />
  {:else if prop === "menu"}
    <rect x="-4" y="-13" width="8.5" height="13" rx="1" class="fill-scene-board" />
    <path
      d="M-2 -10h4.5M-2 -7.6h4.5M-2 -5.2h3"
      class="stroke-portrait-bib"
      stroke-width="0.7"
    />
  {:else if prop === "newspaper"}
    <rect x="-5" y="-12" width="11" height="12.5" class="fill-portrait-bib" />
    <path d="M-3 -9.6h7" stroke-width="1.2" />
    <path d="M-3 -7h7M-3 -4.8h7M-3 -2.6h4" class="stroke-scene-edge" />
  {:else if prop === "phone"}
    <rect x="-2.6" y="-10" width="5.6" height="10" rx="1.2" class="fill-portrait-vest" />
    <rect
      x="-1.7"
      y="-9"
      width="3.8"
      height="7.6"
      rx="0.6"
      class="fill-portrait-ground"
      stroke="none"
    />
  {/if}
</g>
