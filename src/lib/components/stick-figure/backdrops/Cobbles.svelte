<script lang="ts">
  /**
   * Slovak granite cobblestones ("štiepané žulové kocky / mačacie hlavy"),
   * laid in authentic arched fans ("vejárová dlažba") characteristic of
   * Bratislava's historic Old Town squares (Hlavné námestie, Michalská ulica).
   * Arcs and cubic setts scale with perspective towards the viewer.
   */
  let { from = 236, to = 310 }: { from?: number; to?: number } = $props();

  const joints = $derived.by(() => {
    const paths: string[] = [];
    let y = from;
    let span = 15;
    let arch = 4.2;

    for (let row = 0; y < to; row++) {
      const step = span * 1.8;
      const offset = (row % 2) * (step / 2);
      for (let cx = -20 + offset; cx < 980 + span; cx += step) {
        const leftX = (cx - span).toFixed(1);
        const rightX = (cx + span).toFixed(1);
        const topY = (y - arch).toFixed(1);
        const base = y.toFixed(1);
        paths.push(`M${leftX} ${base}Q${cx.toFixed(1)} ${topY} ${rightX} ${base}`);

        const midY = (y - arch * 0.75).toFixed(1);
        const qtrLeftX = (cx - span * 0.5).toFixed(1);
        const qtrRightX = (cx + span * 0.5).toFixed(1);
        const dy = Math.min(arch * 0.6, to - y).toFixed(1);
        paths.push(`M${cx.toFixed(1)} ${topY}v${dy}`);
        paths.push(`M${qtrLeftX} ${midY}l${(span * 0.1).toFixed(1)} ${dy}`);
        paths.push(`M${qtrRightX} ${midY}l${(-span * 0.1).toFixed(1)} ${dy}`);
      }
      y += arch * 1.45;
      span *= 1.07;
      arch *= 1.07;
    }
    return paths.join("");
  });
</script>

<path d={joints} class="stroke-scene-line/15" stroke-width="0.9" fill="none" />
