<script lang="ts">
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";

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
    "border-b border-slate-200/70 px-4 py-3 last:border-b-0",
    "sm:col-span-3 sm:grid-cols-subgrid sm:px-5",
  );

  const formClass =
    "inline-flex items-baseline gap-2 whitespace-nowrap font-serif text-lg";
</script>

{#snippet mark(kind: "wrong" | "right")}
  <svg
    class={cx(
      "size-3.5 shrink-0 translate-y-0.5 fill-none stroke-current",
      kind === "wrong" ? "text-rose-600" : "text-emerald-600",
    )}
    viewBox="0 0 24 24"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if kind === "wrong"}
      <path d="M6 6l12 12M18 6L6 18" />
    {:else}
      <path d="M5 13l4 4L19 7" />
    {/if}
  </svg>
{/snippet}

<section id="watch-out" class="mt-8" aria-labelledby="watch-out-heading">
  <h2 id="watch-out-heading" class={grammarHeadingClass}>Watch out</h2>

  <div class={cx(dataPanelClass, "mt-3")}>
    <ul class={listClass}>
      {#each items as item, index (index)}
        {#if typeof item === "string"}
          <li class={cx(rowClass, "text-[0.95rem] leading-relaxed text-slate-700")}>
            <span class="col-span-full">
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
  </div>
</section>
