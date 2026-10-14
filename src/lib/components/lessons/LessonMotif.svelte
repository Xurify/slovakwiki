<script lang="ts">
  import type { LessonMotifId } from "$lib/lesson-story/lesson-motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";

  let {
    motif,
    class: className = "",
  }: {
    motif: LessonMotifId;
    class?: string;
  } = $props();

  const src = $derived(motifArtSrc(motif));
</script>

<span
  class="inline-flex size-[3.25rem] shrink-0 overflow-hidden rounded-(--control-radius) outline outline-1 -outline-offset-1 outline-slate-900/10 {className}"
  aria-hidden="true"
>
  <img
    {src}
    alt=""
    width="512"
    height="512"
    decoding="async"
    class="size-full object-cover"
  />
</span>
