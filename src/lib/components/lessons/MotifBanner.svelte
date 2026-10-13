<script lang="ts">
  import type { PracticeGraphicId } from "$lib/catalog/practice/motifs";
  import { motifArtSrc, motifPaper } from "$lib/catalog/motifs/art";
  import { cx } from "$lib/ui/classes";

  let {
    motif,
    loading,
  }: {
    motif: PracticeGraphicId;
    loading?: "lazy" | "eager";
  } = $props();

  // Tile at 4/3 of the banner height, centered on its own paper color: the
  // middle 75% of the art stays whole at any banner width.
  const imgClass = cx(
    "absolute top-1/2 left-1/2 aspect-square h-[133%] w-auto max-w-none",
    "-translate-x-1/2 -translate-y-1/2",
    "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
  );
</script>

<span
  class="absolute inset-0 overflow-hidden"
  style:background-color={motifPaper[motif]}
  aria-hidden="true"
>
  <img
    src={motifArtSrc(motif)}
    alt=""
    width="512"
    height="512"
    {loading}
    decoding="async"
    class={imgClass}
  />
</span>
