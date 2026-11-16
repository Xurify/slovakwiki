<script lang="ts">
  import { n } from "$lib/stick-figure/draw";

  /**
   * Setts in rows from y `from` down to `to`, each row deeper and its stones
   * wider than the one behind, so the paving runs back across the square.
   * Only faint joints are drawn: fans, rings and dashed stones all read as a
   * pattern louder than the cast standing on it.
   */
  let { from = 246, to = 310 }: { from?: number; to?: number } = $props();

  const FIRST_DEPTH = 4.5;
  const GROWTH = 1.17;
  /** A sett seen from low down: about twice as wide as it looks deep. */
  const WIDTH = 2.1;

  const joints = $derived.by(() => {
    let d = "";
    let depth = FIRST_DEPTH;
    for (let y = from, row = 0; y < to; row++) {
      const width = depth * WIDTH;
      const height = Math.min(depth, to - y);
      d += `M-10 ${n(y)}H970`;
      for (let x = -10 + (row % 2) * (width / 2); x < 970; x += width) d += `M${n(x)} ${n(y)}v${n(height)}`;
      y += depth;
      depth *= GROWTH;
    }
    return d;
  });
</script>

<path d={joints} class="stroke-scene-line/10" stroke-width="0.8" fill="none" />
