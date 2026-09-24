<script lang="ts">
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
  import type { GrammarNeighbors } from "$lib/catalog/reference/grammar-path";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import { cx } from "$lib/ui/classes";

  let { neighbors }: { neighbors: GrammarNeighbors } = $props();

  const links = $derived(
    [
      neighbors.previous && {
        label: "Previous",
        topic: neighbors.previous,
        align: "start",
      },
      neighbors.next && { label: "Next", topic: neighbors.next, align: "end" },
    ].filter((link) => link !== undefined),
  );

  const cardClass = cx(
    "group flex items-center gap-3.5 rounded-(--frame-radius) bg-surface/80 px-3 py-3 no-underline shadow-(--shadow-border)",
    "transition-[background-color,box-shadow] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)",
  );
</script>

{#if links.length > 0}
  <nav class="grid gap-3 sm:grid-cols-2" aria-label="More grammar topics">
    {#each links as link (link.label)}
      <a
        class={cx(
          cardClass,
          link.align === "end" && "sm:col-start-2 sm:flex-row-reverse",
        )}
        href="/grammar/{link.topic.slug}"
        rel={link.label === "Next" ? "next" : "prev"}
      >
        <span
          class="block size-12 shrink-0 overflow-hidden rounded-(--control-radius) ring-1 ring-slate-900/10 ring-inset"
          aria-hidden="true"
        >
          <img
            src={motifArtSrc(grammarMotifId(link.topic.slug))}
            alt=""
            width="512"
            height="512"
            loading="lazy"
            decoding="async"
            class="size-full object-cover"
          />
        </span>

        <span class={cx("min-w-0", link.align === "end" && "sm:text-right")}>
          <span
            class="block font-sans text-[0.64rem] font-[750] tracking-[0.1em] text-slate-500 uppercase"
          >
            {link.label} topic
          </span>

          <strong
            class="mt-0.5 block font-serif text-base leading-snug text-blue-800 underline-offset-2 group-hover:underline"
          >
            {sentenceCase(link.topic.english)}
          </strong>

          <span class="block font-serif text-sm text-slate-500" lang="sk">
            {link.topic.slovak}
          </span>
        </span>
      </a>
    {/each}
  </nav>
{/if}
