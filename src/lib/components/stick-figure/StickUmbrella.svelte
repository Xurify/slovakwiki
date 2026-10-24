<script lang="ts">
  import { n } from "$lib/stick-figure/draw";
  import { HEAD_RADIUS, type StickRig } from "$lib/stick-figure/rig";

  /**
   * The umbrella in a figure's lead hand: open over the holder and whoever
   * stands beside them, or folded and hung from the hand by its crook.
   * It comes out the way the weather on the holder calls for (dress.ts).
   */
  let { open, rig }: { open: boolean; rig: StickRig } = $props();

  const hand = $derived(rig.leadArm.end);
  const top = $derived({ x: rig.head.x + 18, y: rig.head.y - HEAD_RADIUS - 7 });
</script>

{#if open}
  <g class="stroke-portrait-ink" stroke-linejoin="round">
    <path d="M{n(top.x)} {n(top.y)}L{n(hand.x)} {n(hand.y)}" stroke-width="1.6" />
    <path
      d="M{n(hand.x)} {n(hand.y)}q0 5.5 -4 5.5q-2.6 0 -2.6 -2.4"
      fill="none"
      stroke-width="1.6"
    />
    <g transform="translate({n(top.x)} {n(top.y)})" stroke-width="1">
      <path
        d="M-46 0C-46 -18 -26 -27 0 -27C26 -27 46 -18 46 0Q34.5 -5 23 0Q11.5 -5 0 0Q-11.5 -5 -23 0Q-34.5 -5 -46 0Z"
        class="fill-rose-500"
      />
      <path
        d="M-23 0Q-11.5 -5 0 0Q-4 -14 0 -27Q-17 -16 -23 0ZM23 0Q34.5 -5 46 0Q40 -18 0 -27Q17 -16 23 0Z"
        class="fill-white/30"
        stroke="none"
      />
      <path
        d="M0 -27Q-17 -16 -23 0M0 -27Q-4 -14 0 0M0 -27Q17 -16 23 0"
        fill="none"
        stroke-width="0.8"
      />
      <path d="M0 -27v-5" stroke-width="1.6" />
    </g>
  </g>
{:else}
  <g
    class="stroke-portrait-ink"
    stroke-linejoin="round"
    transform="translate({n(hand.x)} {n(hand.y)})"
  >
    <path d="M0 26V-2q0-4 3.4-4q3.4 0 3.4 3.4" fill="none" stroke-width="1.6" />
    <path d="M0 5Q-3.6 14 0 23Q3.6 14 0 5Z" class="fill-rose-500" stroke-width="1" />
    <path d="M-1.6 9.5l3.2 1.2" stroke-width="0.8" />
  </g>
{/if}
