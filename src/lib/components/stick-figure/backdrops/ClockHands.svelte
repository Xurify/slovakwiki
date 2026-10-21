<script lang="ts">
  /** A wall clock's hands at `hour` o'clock sharp, from its centre at x, y. */
  let {
    hour,
    length,
    width,
    x,
    y,
  }: { hour: number; length: number; width: number; x: number; y: number } = $props();

  const angle = $derived((((hour % 12) / 12) * 360 * Math.PI) / 180);
  const hand = $derived({
    x: x + Math.sin(angle) * length * 0.66,
    y: y - Math.cos(angle) * length * 0.66,
  });
</script>

<path
  d="M{x} {y - length}V{y}L{hand.x.toFixed(2)} {hand.y.toFixed(2)}"
  class="stroke-scene-line"
  fill="none"
  stroke-width={width}
/>
