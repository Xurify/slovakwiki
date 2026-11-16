<script lang="ts">
  /**
   * Slovak granite cobblestones ("štiepané žulové kocky / mačacie hlavy"),
   * laid in authentic arched fans ("vejárová dlažba") characteristic of
   * Bratislava's historic Old Town squares (Hlavné námestie, Michalská ulica).
   * Arcs and cubic setts scale with perspective towards the viewer.
   */
  let { from = 248, to = 310 }: { from?: number; to?: number } = $props();

  const { arcs, joints } = $derived.by(() => {
    const arcList: string[] = [];
    const jointList: string[] = [];
    let y = from + 3;
    let span = 13.5;
    let arch = 6.4;

    for (let row = 0; y < to + arch; row++) {
      const step = span * 2;
      const offset = (row % 2) * span;
      for (let cx = -20 + offset; cx < 980 + span; cx += step) {
        // 3 concentric fan arcs per segmental fan
        const ratios = [0.42, 0.72, 1.0];
        for (let k = 0; k < ratios.length; k++) {
          const r = ratios[k];
          const s = span * r;
          const h = arch * r;
          const lx = cx - s;
          const rx = cx + s;
          const top = y - h;
          arcList.push(`M${lx.toFixed(1)} ${y.toFixed(1)}Q${cx.toFixed(1)} ${top.toFixed(1)} ${rx.toFixed(1)} ${y.toFixed(1)}`);
        }

        // Inner ring radial joints (3 setts)
        const innerTicks = 3;
        for (let t = 1; t <= innerTicks; t++) {
          const frac = t / (innerTicks + 1);
          const ang = Math.PI * (1 - frac);
          const x1 = cx - Math.cos(ang) * span * 0.42;
          const y1 = y - Math.sin(ang) * arch * 0.42;
          const x2 = cx - Math.cos(ang) * span * 0.72;
          const y2 = y - Math.sin(ang) * arch * 0.72;
          jointList.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
        }

        // Outer ring radial joints (5 setts, staggered)
        const outerTicks = 5;
        for (let t = 1; t <= outerTicks; t++) {
          const frac = (t - 0.5) / outerTicks;
          const ang = Math.PI * (1 - frac);
          const x1 = cx - Math.cos(ang) * span * 0.72;
          const y1 = y - Math.sin(ang) * arch * 0.72;
          const x2 = cx - Math.cos(ang) * span * 1.0;
          const y2 = y - Math.sin(ang) * arch * 1.0;
          jointList.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
        }
      }
      y += arch * 0.96;
      span *= 1.08;
      arch *= 1.08;
    }
    return { arcs: arcList.join(''), joints: jointList.join('') };
  });
</script>

<path d={arcs} class="stroke-scene-line/35" stroke-width="0.9" fill="none" />
<path d={joints} class="stroke-scene-line/25" stroke-width="0.75" fill="none" />
