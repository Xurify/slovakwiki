<script lang="ts">
  import type { LessonMotifId } from "$lib/lesson-story/lesson-motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";

  let {
    motif,
    size = "sm",
    fill = false,
    bare = false,
    class: className = "",
  }: {
    motif: LessonMotifId;
    size?: "sm" | "lg" | "xl";
    fill?: boolean;
    bare?: boolean;
    class?: string;
  } = $props();

  const src = $derived(motifArtSrc(motif));

  const shellClass = $derived(
    fill
      ? "block size-full overflow-hidden"
      : size === "xl"
        ? "inline-flex size-[5.5rem] shrink-0 overflow-hidden rounded-(--control-radius)"
        : size === "lg"
          ? "inline-flex size-16 shrink-0 overflow-hidden rounded-(--control-radius)"
          : "inline-flex size-[3.25rem] shrink-0 overflow-hidden rounded-(--control-radius)",
  );
</script>

{#snippet mark(imgClass: string)}
  <img
    {src}
    alt=""
    width="512"
    height="512"
    decoding="async"
    class="size-full object-cover {imgClass}"
  />
{/snippet}

{#if bare}
  <span aria-hidden="true" class={className}>
    {@render mark("")}
  </span>
{:else}
  <span
    class="{shellClass} {fill
      ? ''
      : 'outline outline-1 outline-slate-900/10 -outline-offset-1'} {className}"
    aria-hidden="true"
  >
    {@render mark("")}
  </span>
{/if}
