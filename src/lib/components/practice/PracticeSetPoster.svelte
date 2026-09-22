<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import { practiceGraphicId } from "$lib/catalog/practice/motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";

  let { sheet }: { sheet: PracticeHubSheet } = $props();

  const graphic = $derived(practiceGraphicId(sheet.set.id, sheet.set.lessonId));
  const src = $derived(motifArtSrc(graphic));
</script>

<span
  class="relative isolate block size-[4.5rem] shrink-0 overflow-hidden rounded-(--control-radius) ring-1 ring-slate-900/10 ring-inset"
  aria-hidden="true"
>
  <img
    {src}
    alt=""
    width="512"
    height="512"
    decoding="async"
    class="size-full rounded-[inherit] object-cover outline-0 transition-transform duration-300 ease-out group-hover:scale-105"
  />
</span>
