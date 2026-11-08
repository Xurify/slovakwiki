<script lang="ts">
  import { caseSketchParts, type Tone } from "$lib/components/reference/ink/case-sketches";

  let {
    slug,
    label,
    class: className = "",
  }: {
    slug: string;
    label: string;
    class?: string;
  } = $props();

  const parts = $derived(caseSketchParts(slug));
  const filterId = $derived(`ink-${slug}`);

  const toneClass: Record<Tone, string> = {
    ink: "stroke-slate-900",
    soft: "stroke-slate-500",
    mark: "stroke-blue-800",
  };
</script>

<svg viewBox="0 0 340 132" role="img" aria-label={label} class={className}>
  <defs>
    <filter id={filterId} filterUnits="userSpaceOnUse" x="0" y="0" width="340" height="132">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.04"
        numOctaves="2"
        seed="4"
        result="grain"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="grain"
        scale="1.5"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </defs>

  <g filter="url(#{filterId})">
    {#each parts as part, index (index)}
      {#if part.type === "stroke"}
        <path
          d={part.d}
          fill="none"
          class={toneClass[part.tone]}
          stroke-width={part.width}
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity={part.opacity}
        />
      {:else if part.type === "patch"}
        <path d={part.d} class="fill-blue-600/20" />
      {:else if part.type === "dot"}
        <path d={part.d} class="fill-blue-800" />
      {:else}
        <text
          x={part.x}
          y={part.y}
          text-anchor="middle"
          class="fill-slate-900 font-serif text-[15px] font-semibold"
        >
          {part.text}
        </text>
      {/if}
    {/each}
  </g>
</svg>
