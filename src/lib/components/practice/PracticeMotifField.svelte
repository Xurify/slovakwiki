<script lang="ts">
  import type { LessonMotifId } from "$lib/lesson-story/lesson-motifs";
  import LessonMotif from "$lib/components/lessons/LessonMotif.svelte";
  import { drillLetter, practiceMotifRailClass } from "$lib/catalog/practice/motifs";

  let {
    motif,
    slovak,
    size = "card",
  }: {
    motif: LessonMotifId;
    slovak: string;
    size?: "card" | "featured";
  } = $props();

  const letter = $derived(drillLetter(slovak));
  const featured = $derived(size === "featured");
</script>

<div
  class="relative isolate overflow-hidden {practiceMotifRailClass[motif]} {featured
    ? 'min-h-44 w-full min-[760px]:min-h-full min-[760px]:w-[13.5rem] min-[760px]:shrink-0'
    : 'w-[4.75rem] shrink-0 self-stretch max-[520px]:h-16 max-[520px]:w-full'}"
  aria-hidden="true"
>
  <div
    class="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(var(--line)_1px,transparent_1px)] [background-size:11px_11px]"
  ></div>

  <span
    class="pointer-events-none absolute font-serif font-semibold leading-none text-slate-900/10 {featured
      ? '-right-1 -bottom-7 text-[8.5rem] tracking-[-0.08em]'
      : '-right-1 -bottom-4 text-[4.25rem] tracking-[-0.08em] max-[520px]:-right-1 max-[520px]:-bottom-6'}"
    lang="sk"
  >
    {letter}
  </span>

  <div
    class="relative flex h-full items-center justify-center {featured
      ? 'min-h-44 p-6 min-[760px]:min-h-full'
      : 'p-3 max-[520px]:h-16'}"
  >
    <div class={featured ? "scale-[2.6]" : "scale-125"}>
      <LessonMotif {motif} size={featured ? "xl" : "lg"} bare />
    </div>
  </div>
</div>
