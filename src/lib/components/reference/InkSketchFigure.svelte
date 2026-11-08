<script lang="ts">
  import InkSketch from "$lib/components/reference/InkSketch.svelte";
  import { markedParts } from "$lib/components/reference/ink/sketches";
  import type { InkSketchCaption } from "$lib/catalog/types";

  let { slug, sketch }: { slug: string; sketch: InkSketchCaption } = $props();
</script>

<figure class="m-0 my-6">
  <InkSketch {slug} label={sketch.alt} class="mx-auto block h-auto w-full max-w-sm" />
  <figcaption class="mt-3 text-center">
    <span class="block font-serif text-2xl text-balance text-slate-900" lang="sk">
      {#each markedParts(sketch.sentence) as part, index (index)}
        {#if part.marked}<span class="text-blue-800">{part.text}</span>{:else}{part.text}{/if}
      {/each}
    </span>
    <span class="mt-0.5 block text-[0.95rem] text-slate-600">{sketch.english}</span>
  </figcaption>
</figure>
