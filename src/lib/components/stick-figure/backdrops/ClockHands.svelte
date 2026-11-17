<script lang="ts">
  /** A wall clock's hands at `hour`, its minutes as a fraction (11.5 for half past eleven), from its centre at x, y. */
  let {
    hour,
    length,
    width,
    x,
    y,
  }: { hour: number; length: number; width: number; x: number; y: number } = $props();

  const angle = $derived(((hour % 12) / 12) * 2 * Math.PI);
  const minutes = $derived((hour % 1) * 2 * Math.PI);
  const hand = $derived({
    x: x + Math.sin(angle) * length * 0.58,
    y: y - Math.cos(angle) * length * 0.58,
  });
  const long = $derived({
    x: x + Math.sin(minutes) * length,
    y: y - Math.cos(minutes) * length,
  });
</script>

<!-- The hour hand short and heavy, the minute hand long and thin: drawn alike, 9:45 read as 9. -->
<path
  d="M{long.x.toFixed(2)} {long.y.toFixed(2)}L{x} {y}"
  class="stroke-scene-line"
  fill="none"
  stroke-linecap="round"
  stroke-width={width * 0.8}
/>
<path
  d="M{x} {y}L{hand.x.toFixed(2)} {hand.y.toFixed(2)}"
  class="stroke-scene-line"
  fill="none"
  stroke-linecap="round"
  stroke-width={width * 1.5}
/>
