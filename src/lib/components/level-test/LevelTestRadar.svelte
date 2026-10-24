<script lang="ts" module>
  import type { AreaSummary } from "$lib/level-test/diagnose";

  export interface RadarAxis {
    id: string;
    label: string;
    /** Null when the test could not measure this axis. */
    summary: AreaSummary | null;
  }
</script>

<script lang="ts">
  import { CEFR_ANCHOR, CEFR_LEVELS } from "$lib/level-test/scale";

  /** One learner on the test's 0–100 scale; CEFR rings are the grid. */
  let { axes, center }: { axes: RadarAxis[]; center: number } = $props();

  const SIZE = 340;
  const MID = SIZE / 2;
  const RADIUS = 112;
  const LABEL_GAP = 16;

  let active = $state<number | null>(null);

  const angles = $derived(
    axes.map((_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / axes.length),
  );

  function point(angle: number, score: number, extra = 0): { x: number; y: number } {
    const r = (Math.max(0, Math.min(100, score)) / 100) * RADIUS + extra;
    return { x: MID + r * Math.cos(angle), y: MID + r * Math.sin(angle) };
  }

  const vertices = $derived(
    axes.map((axis, index) =>
      axis.summary ? point(angles[index] ?? 0, axis.summary.score) : null,
    ),
  );

  /**
   * The shape joins the measured axes in order and steps over an unmeasured one,
   * whose spoke is dashed and label grey, so the gap reads as missing data.
   */
  const outline = $derived(
    vertices.flatMap((vertex) => (vertex ? [`${vertex.x},${vertex.y}`] : [])).join(" "),
  );
  const measuredCount = $derived(vertices.filter((vertex) => vertex !== null).length);

  const rings = CEFR_LEVELS.filter((level) => CEFR_ANCHOR[level] > 0);

  function anchor(angle: number): "start" | "middle" | "end" {
    const cos = Math.cos(angle);
    if (cos > 0.3) return "start";
    if (cos < -0.3) return "end";
    return "middle";
  }

  /** Two-line labels: keep them off the ring above and below the chart. */
  function baseline(angle: number): number {
    const sin = Math.sin(angle);
    if (sin > 0.3) return 12;
    if (sin < -0.3) return -18;
    return -4;
  }
</script>

<figure class="m-0 grid gap-3">
  <div class="relative mx-auto w-full max-w-[420px]">
    <svg
      class="block h-auto w-full overflow-visible"
      viewBox="-60 0 {SIZE + 120} {SIZE}"
      role="img"
      aria-label="Your level in each part of Slovak, on the CEFR scale"
    >
      {#each rings as level (level)}
        <circle
          class="fill-none stroke-slate-200"
          cx={MID}
          cy={MID}
          r={(CEFR_ANCHOR[level] / 100) * RADIUS}
          stroke-width="1"
        />
      {/each}

      {#each angles as angle, index (index)}
        {@const end = point(angle, 100)}
        <line
          class={axes[index]?.summary ? "stroke-slate-200" : "stroke-slate-300"}
          x1={MID}
          y1={MID}
          x2={end.x}
          y2={end.y}
          stroke-width="1"
          stroke-dasharray={axes[index]?.summary ? undefined : "3 4"}
        />
      {/each}

      <circle
        class="fill-none stroke-slate-500"
        cx={MID}
        cy={MID}
        r={(Math.max(0, center) / 100) * RADIUS}
        stroke-width="1.5"
      />

      {#if measuredCount >= 3}
        <polygon
          class="fill-blue-600/15 stroke-blue-600"
          points={outline}
          stroke-width="2"
          stroke-linejoin="round"
        />
      {/if}

      {#each rings as level (level)}
        <text
          class="fill-slate-500 stroke-surface text-[11px]"
          x={MID + 4}
          y={MID - (CEFR_ANCHOR[level] / 100) * RADIUS - 3}
          stroke-width="3"
          paint-order="stroke">{level}</text
        >
      {/each}

      {#each axes as axis, index (axis.id)}
        {@const angle = angles[index] ?? 0}
        {@const vertex = vertices[index]}
        {@const label = point(angle, 100, LABEL_GAP)}
        <text
          class="text-[15px] font-semibold {axis.summary
            ? 'fill-slate-700'
            : 'fill-slate-400'}"
          x={label.x}
          y={label.y + baseline(angle)}
          text-anchor={anchor(angle)}
        >
          <tspan x={label.x}>{axis.label}</tspan>
          <tspan class="text-[12px] font-normal" x={label.x} dy="16"
            >{axis.summary
              ? `${axis.summary.level} · ${axis.summary.score}`
              : "not measured"}</tspan
          >
        </text>

        {#if vertex && axis.summary}
          <circle
            class="fill-blue-600 stroke-surface"
            cx={vertex.x}
            cy={vertex.y}
            r={active === index ? 6 : 4.5}
            stroke-width="2"
          />

          <!-- Bigger than the dot, so it is easy to hover or tap. -->
          <circle
            class="cursor-default fill-transparent outline-none"
            cx={vertex.x}
            cy={vertex.y}
            r="14"
            role="button"
            tabindex="0"
            aria-label={`${axis.label}: ${axis.summary.level}, ${axis.summary.score}`}
            onpointerenter={() => (active = index)}
            onpointerleave={() => (active = null)}
            onfocus={() => (active = index)}
            onblur={() => (active = null)}
          />
        {/if}
      {/each}
    </svg>

    {#if active !== null}
      {@const axis = axes[active]}
      {@const vertex = vertices[active]}
      {#if axis?.summary && vertex}
        <div
          class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-(--control-radius) bg-surface px-3 py-2 text-xs whitespace-nowrap shadow-(--shadow-float) ring-1 ring-slate-200"
          style:left="{((vertex.x + 60) / (SIZE + 120)) * 100}%"
          style:top="{(vertex.y / SIZE) * 100}%"
        >
          <p class="m-0 font-semibold text-slate-900">{axis.label}</p>
          <p class="m-0 text-slate-600">
            {axis.summary.level} · {axis.summary.score} · {axis.summary.percent}% right
            over {axis.summary.total} answers
          </p>
        </div>
      {/if}
    {/if}
  </div>

  <figcaption class="m-0 text-center text-xs text-pretty text-slate-600">
    The blue shape is your level in each part; the grey circle is your overall level,
    {center}. Rings mark the CEFR levels. A dashed line with its name in grey is a part
    this run could not measure.
  </figcaption>
</figure>
