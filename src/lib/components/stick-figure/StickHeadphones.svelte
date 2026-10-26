<script lang="ts" module>
  import type { Point } from "$lib/stick-figure/rig";

  /** How far the band rises over the cups' tops, as a curve's handles: about 3/4 of it shows. */
  const ARCH = 11;
  /** From a cup's middle to its top. */
  const CUP_TOP = 4.5;

  /**
   * The band between the cups `far` and `near`, cut at its top into the half
   * that goes behind the head and the half in front of it.
   */
  export function bandHalves(far: Point, near: Point): { far: string; near: string } {
    const a = { x: far.x, y: far.y - CUP_TOP };
    const d = { x: near.x, y: near.y - CUP_TOP };
    const b = { x: a.x, y: a.y - ARCH };
    const c = { x: d.x, y: d.y - ARCH };
    const mid = (p: Point, q: Point) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
    const ab = mid(a, b);
    const bc = mid(b, c);
    const cd = mid(c, d);
    const abc = mid(ab, bc);
    const bcd = mid(bc, cd);
    const top = mid(abc, bcd);
    const at = (p: Point) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    return {
      far: `M${at(a)}C${at(ab)} ${at(abc)} ${at(top)}`,
      near: `M${at(top)}C${at(bcd)} ${at(cd)} ${at(d)}`,
    };
  }
</script>

<script lang="ts">
  /**
   * Over-ear headphones by their cups' middles, in rig units: lying on a
   * desk, or in two hands with a hand on each cup. `part` draws the far cup
   * and the band's far half, the near ones, or all, so a figure can put the
   * far half behind its head.
   */
  let {
    far,
    near,
    part = "all",
  }: { far: Point; near: Point; part?: "far" | "near" | "all" } = $props();

  const band = $derived(bandHalves(far, near));
</script>

{#snippet cup(at: Point)}
  <ellipse
    cx={at.x}
    cy={at.y}
    rx="3.2"
    ry={CUP_TOP}
    class="fill-portrait-vest stroke-portrait-ink"
    stroke-width="1.1"
  />
  <ellipse cx={at.x - 0.4} cy={at.y - 0.6} rx="1.2" ry="2.2" class="fill-scene-line/60" />
{/snippet}

{#snippet half(d: string)}
  <path {d} class="stroke-portrait-ink" stroke-width="2.6" fill="none" />
  <path {d} class="stroke-scene-line" stroke-width="1.2" fill="none" />
{/snippet}

{#if part !== "near"}
  {@render half(band.far)}
  {@render cup(far)}
{/if}
{#if part !== "far"}
  {@render half(band.near)}
  {@render cup(near)}
{/if}
