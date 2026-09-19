<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import { practiceGraphicId } from "$lib/catalog/practice/motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";

  let { sheet }: { sheet: PracticeHubSheet } = $props();

  const graphic = $derived(practiceGraphicId(sheet.set.id, sheet.set.lessonId));
  const src = $derived(motifArtSrc(graphic));
</script>

<div
  class="relative isolate size-28 shrink-0 overflow-clip rounded-2xl ring-1 ring-slate-900/10 ring-inset"
>
  <img
    {src}
    alt=""
    width="512"
    height="512"
    decoding="async"
    class="size-full rounded-[inherit] object-cover"
  />
  <span class="sr-only">{sheet.set.title}</span>
</div>
