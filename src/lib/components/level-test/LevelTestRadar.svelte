<script lang="ts">
  import { STUDY_AREA_INFO, type AreaSummary } from "$lib/level-test/diagnose";
  import { CEFR_ANCHOR, CEFR_LEVELS } from "$lib/level-test/scale";

  /** One learner, several areas, on the test's 0–100 scale; CEFR rings are the grid. */
  let { areas, center }: { areas: AreaSummary[]; center: number } = $props();

  const SIZE = 340;
  const MID = SIZE / 2;
  const RADIUS = 112;
  const LABEL_GAP = 16;

  let active = $state<number | null>(null);

  const angles = $derived(
    areas.map((_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / areas.length),
  );

  function point(angle: number, score: number, extra = 0): { x: number; y: number } {
    const r = (Math.max(0, Math.min(100, score)) / 100) * RADIUS + extra;
    return { x: MID + r * Math.cos(angle), y: MID + r * Math.sin(angle) };
  }

  const vertices = $derived(
    areas.map((area, index) => point(angles[index] ?? 0, area.score)),
  );

  const outline = $derived(vertices.map(({ x, y }) => `${x},${y}`).join(" "));

  const rings = CEFR_LEVELS.filter((level) => CEFR_ANCHOR[level] > 0);

  function anchor(angle: number): "start" | "middle" | "end" {
    const cos = Math.cos(angle);
    if (cos > 0.3) return "start";
    if (cos < -0.3) return "end";
    return "middle";
  }

  function baseline(angle: number): number {
    const sin = Math.sin(angle);
    if (sin > 0.3) return 12;
    if (sin < -0.3) return -4;
    return 4;
  }
</script>

<figure class="m-0 grid gap-3">
  <div class="relative mx-auto w-full max-w-[400px]">
    <svg
      class="block h-auto w-full overflow-visible"
      viewBox="-50 0 {SIZE + 100} {SIZE}"
      role="img"
      aria-label="Your level in each area, on the CEFR scale"
    >
      {#each rings as level (level)}
        <circle
          class="fill-none stroke-slate-200"
          cx={MID}
          cy={MID}
          r={(CEFR_ANCHOR[level] / 100) * RADIUS}
          stroke-width="1"
        />
        <text
          class="fill-slate-500 text-[11px]"
          x={MID + 4}
          y={MID - (CEFR_ANCHOR[level] / 100) * RADIUS - 3}>{level}</text
        >
      {/each}

      {#each angles as angle, index (index)}
        {@const end = point(angle, 100)}
        <line
          class="stroke-slate-200"
          x1={MID}
          y1={MID}
          x2={end.x}
          y2={end.y}
          stroke-width="1"
        />
      {/each}

      <circle
        class="fill-none stroke-slate-500"
        cx={MID}
        cy={MID}
        r={(Math.max(0, center) / 100) * RADIUS}
        stroke-width="1.5"
      />

      <polygon
        class="fill-blue-600/15 stroke-blue-600"
        points={outline}
        stroke-width="2"
        stroke-linejoin="round"
      />

      {#each areas as area, index (area.area)}
        {@const angle = angles[index] ?? 0}
        {@const vertex = vertices[index] ?? { x: MID, y: MID }}
        {@const label = point(angle, 100, LABEL_GAP)}
        <text
          class="fill-slate-700 text-[15px] font-semibold"
          x={label.x}
          y={label.y + baseline(angle)}
          text-anchor={anchor(angle)}>{STUDY_AREA_INFO[area.area].short}</text
        >

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
          aria-label={`${STUDY_AREA_INFO[area.area].label}: ${area.level}, ${area.score}`}
          onpointerenter={() => (active = index)}
          onpointerleave={() => (active = null)}
          onfocus={() => (active = index)}
          onblur={() => (active = null)}
        />
      {/each}
    </svg>

    {#if active !== null && areas[active] && vertices[active]}
      {@const area = areas[active]}
      {@const vertex = vertices[active]}
      <div
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-(--control-radius) bg-surface px-3 py-2 text-xs whitespace-nowrap shadow-(--shadow-float) ring-1 ring-slate-200"
        style:left="{((vertex.x + 50) / (SIZE + 100)) * 100}%"
        style:top="{(vertex.y / SIZE) * 100}%"
      >
        <p class="m-0 font-semibold text-slate-900">{STUDY_AREA_INFO[area.area].label}</p>
        <p class="m-0 text-slate-600">
          {area.level} · {area.score} · {area.percent}% right over {area.total} answers
        </p>
      </div>
    {/if}
  </div>

  <figcaption class="m-0 text-center text-xs text-pretty text-slate-600">
    The blue shape is your level in each area; the grey circle is your overall level,
    {center}. Rings mark the CEFR levels.
  </figcaption>
</figure>
