<script lang="ts">
  import { n } from "$lib/stick-figure/draw";

  /**
   * Setts laid in fans ("vejárová dlažba"), as on Bratislava's old-town squares,
   * from y `from` down to `to`: rows of arcs, each row deeper and wider than
   * the one behind it. Only each fan's outer course is drawn, as pale stones
   * with the ground showing between them. Stones are dashes of one thick
   * stroke, never thin joint lines: a mesh of joints read as scratchy and
   * busier than the cast standing on it.
   */
  let { from = 246, to = 310 }: { from?: number; to?: number } = $props();

  const FIRST_DEPTH = 7;
  const GROWTH = 1.2;
  /** A fan is about twice as wide as deep, seen from low down. */
  const WIDTH = 5.6;
  const RISE = 0.5;
  /** A stone's size across its course and along it, and the joint after it, as parts of its row's depth. */
  const STONE = { thick: 0.3, long: 0.62, joint: 0.2 };

  /** The length of a fan's arc, a quadratic curve from one foot to the other. */
  function arcLength(width: number, rise: number): number {
    let length = 0;
    let last = { x: 0, y: 0 };
    for (let step = 1; step <= 24; step++) {
      const t = step / 24;
      const point = { x: width * t, y: -4 * rise * t * (1 - t) };
      length += Math.hypot(point.x - last.x, point.y - last.y);
      last = point;
    }
    return length;
  }

  const courses = $derived.by(() => {
    const rows: { d: string; thick: number; dash: string; offset: number }[] = [];
    let depth = FIRST_DEPTH;
    for (let y = from + depth * RISE + 1, row = 0; y < to + depth * RISE; row++) {
      const width = depth * WIDTH;
      const rise = depth * RISE;
      const thick = depth * STONE.thick;
      const length = arcLength(width, rise);
      // A whole number of stones to a fan, half a joint at each foot, so two fans meet in a joint.
      const pitch = length / Math.round(length / (depth * (STONE.long + STONE.joint)));
      const joint = pitch * (STONE.joint / (STONE.long + STONE.joint));
      let d = "";
      for (let x = -10 - width * (row % 2 ? 1 : 0.5); x < 970; x += width) {
        d += `M${n(x)} ${n(y)}Q${n(x + width / 2)} ${n(y - 2 * rise)} ${n(x + width)} ${n(y)}`;
      }
      // Round caps reach half a stroke past each dash, so the dash is that much shorter than the stone.
      rows.push({ d, thick, dash: `${n(pitch - joint - thick)} ${n(joint + thick)}`, offset: n(-(joint + thick) / 2) });
      y += depth;
      depth *= GROWTH;
    }
    return rows;
  });
</script>

{#each courses as course (course.d)}
  <path
    d={course.d}
    class="stroke-white/40"
    fill="none"
    stroke-width={n(course.thick)}
    stroke-dasharray={course.dash}
    stroke-dashoffset={course.offset}
    stroke-linecap="round"
  />
{/each}
