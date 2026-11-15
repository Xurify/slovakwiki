<script lang="ts">
  /**
   * Setts laid in rows from y `from` down to the stage's front, each row
   * deeper and its stones wider than the one behind, so the paving reads as
   * running back across the square. Only the joints are drawn.
   */
  let { from = 236 }: { from?: number } = $props();

  const joints = $derived.by(() => {
    const rows: string[] = [];
    let y = from;
    let depth = 5;
    for (let row = 0; y < 310; row++) {
      const width = depth * 2.2;
      rows.push(`M-10 ${y}H970`);
      for (let x = -10 + (row % 2) * (width / 2); x < 970; x += width) {
        rows.push(`M${x.toFixed(1)} ${y}v${depth.toFixed(1)}`);
      }
      y += depth;
      depth *= 1.16;
    }
    return rows.join("");
  });
</script>

<path d={joints} class="stroke-scene-line/10" stroke-width="1" fill="none" />
