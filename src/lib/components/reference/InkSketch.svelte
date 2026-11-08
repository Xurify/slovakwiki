<script lang="ts">
  import { cx } from "$lib/ui/classes";

  import {
    markedParts,
    sketchParts,
    type Tone,
  } from "$lib/components/reference/ink/sketches";

  let {
    slug,
    label,
    class: className = "",
  }: {
    slug: string;
    label: string;
    class?: string;
  } = $props();

  const parts = $derived(sketchParts(slug));
  const filterId = $derived(`ink-${slug}`);

  const noteSize = { small: "text-[11px]", normal: "text-[15px]", large: "text-[22px]" } as const;
  const noteTone: Record<Tone, string> = {
    ink: "fill-slate-900",
    soft: "fill-slate-500",
    mark: "fill-blue-800",
  };

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
          class={cx(
            "font-serif font-semibold",
            noteSize[part.size],
            noteTone[part.tone],
          )}
        >{#each markedParts(part.text) as piece, index (index)}<tspan class={piece.marked ? "fill-blue-800" : undefined}>{piece.text}</tspan>{/each}</text>
      {/if}
    {/each}
  </g>
</svg>
