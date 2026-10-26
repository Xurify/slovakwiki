<script lang="ts">
  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import { grammarHeadingClass } from "$lib/components/reference/grammar-topic-ui";
  import type { GrammarWatchOut } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let { items }: { items: GrammarWatchOut[] } = $props();

  // Subgrid keeps the wrong / right / why columns aligned across rows from sm up.
  const listClass =
    "m-0 grid list-none p-0 sm:grid-cols-[max-content_max-content_minmax(0,1fr)]";

  const rowClass = cx(
    "grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-5 gap-y-1",
    "border-b border-slate-200 py-2.5",
    "sm:col-span-3 sm:grid-cols-subgrid",
  );

  const formClass =
    "inline-flex items-baseline gap-2 whitespace-nowrap font-serif text-lg";
</script>

{#snippet mark(kind: "wrong" | "right" | "tip")}
  <svg
    class={cx(
      "size-3.5 shrink-0 translate-y-0.5 fill-none stroke-current",
      kind === "wrong" && "text-rose-600",
      kind === "right" && "text-emerald-600",
      kind === "tip" && "text-rose-600",
    )}
    viewBox="0 0 24 24"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if kind === "wrong"}
      <path d="M6 6l12 12M18 6L6 18" />
    {:else if kind === "tip"}
      <circle cx="12" cy="12" r="9.5" stroke-width="2.25" />
      <path d="M12 7.5v5.5M12 16.5v.5" />
    {:else}
      <path d="M5 13l4 4L19 7" />
    {/if}
  </svg>
{/snippet}

<section id="watch-out" class="mt-8" aria-labelledby="watch-out-heading">
  <h2 id="watch-out-heading" class={grammarHeadingClass}>Watch out</h2>

  <!-- Ruled rows on the page's own edges, like a reference list: a panel around
       one tip boxed a sentence. -->
  <ul class={cx(listClass, "mt-3 border-t border-slate-200")}>
    {#each items as item, index (index)}
      {#if typeof item === "string"}
        <li class={rowClass}>
          {@render mark("tip")}

          <span class="text-[0.95rem] leading-relaxed text-slate-700 sm:col-span-2">
            <GrammarRichText text={item} />
          </span>
        </li>
      {:else}
        <li class={rowClass}>
          <span class={cx(formClass, "text-slate-500")}>
            {@render mark("wrong")}
            <s class="decoration-rose-500/70" lang="sk">{item.wrong}</s>
          </span>

          <span class={cx(formClass, "font-semibold text-slate-900")}>
            {@render mark("right")}
            <span lang="sk">{item.right}</span>
          </span>

          <span class="text-sm leading-snug text-slate-600 max-sm:col-span-full">
            <GrammarRichText text={item.why} />
          </span>
        </li>
      {/if}
    {/each}
  </ul>
</section>
