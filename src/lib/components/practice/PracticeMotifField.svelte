<script lang="ts">
  import { practiceGraphicId } from "$lib/catalog/practice/motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";

  let {
    setId,
    lessonId,
    variant = "card",
  }: {
    setId: string;
    lessonId: string;
    variant?: "card" | "hero" | "panel";
  } = $props();

  const graphic = $derived(practiceGraphicId(setId, lessonId));
  const src = $derived(motifArtSrc(graphic));
  const hero = $derived(variant === "hero");
  const panel = $derived(variant === "panel");
</script>

<div
  class={hero
    ? "size-40 max-[600px]:size-28"
    : panel
      ? "relative min-h-44 overflow-hidden max-[700px]:order-first max-[700px]:h-40"
      : "w-[8.75rem] shrink-0 self-stretch overflow-hidden max-[520px]:w-[6.5rem]"}
  aria-hidden="true"
>
  <img
    {src}
    alt=""
    width="512"
    height="512"
    decoding="async"
    class={[
      hero
        ? "size-full object-contain"
        : "object-cover outline outline-1 -outline-offset-1 outline-slate-900/8",
      panel && "absolute inset-0 size-full",
      !hero && !panel && "size-full min-h-full",
    ]}
  />
</div>
