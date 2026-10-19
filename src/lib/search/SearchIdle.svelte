<script lang="ts">
  import { searchIdleHints, searchMetaLabel } from "$lib/catalog/search/ui";

  import type { RecentQuery } from "./recent-queries";
  import type { SearchHistoryItem, SearchVisit } from "./search-history";
  import { dividedListClass, rowLinkClass, sectionLabelClass } from "./search-results-ui";

  let {
    onclear,
    onpick,
    onvisit,
    queries,
    viewed,
  }: {
    onclear: () => void;
    /** Re-run a query the learner typed before. */
    onpick: (query: string) => void;
    onvisit: (visit: SearchVisit) => void;
    queries: RecentQuery[];
    viewed: SearchHistoryItem[];
  } = $props();

  const hasHistory = $derived(queries.length > 0 || viewed.length > 0);

  const chipClass =
    "cursor-pointer rounded-full border border-slate-300 bg-surface px-3 py-1.5 font-serif text-sm text-slate-800 transition-colors duration-150 ease-out hover:border-slate-400 hover:bg-subtle";
  const rowClass = "flex items-baseline justify-between gap-3 py-2.5";
  const metaClass = "shrink-0 text-xs text-slate-500";
</script>

<div class="flex flex-col gap-8">
  {#if queries.length > 0}
    <section aria-labelledby="recent-searches-label">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class={sectionLabelClass} id="recent-searches-label">Recent searches</h2>

        <button
          class="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline"
          type="button"
          onclick={onclear}
        >
          Clear history
        </button>
      </div>

      <ul class="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
        {#each queries as item (item.query)}
          <li>
            <button class={chipClass} type="button" onclick={() => onpick(item.query)}>
              {item.query}
            </button>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if viewed.length > 0}
    <section aria-labelledby="recently-viewed-label">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class={sectionLabelClass} id="recently-viewed-label">Recently viewed</h2>

        {#if queries.length === 0}
          <button
            class="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline"
            type="button"
            onclick={onclear}
          >
            Clear history
          </button>
        {/if}
      </div>

      <ul class="{dividedListClass} mt-1">
        {#each viewed as item (item.href)}
          <li class={rowClass}>
            <a class={rowLinkClass} href={item.href} onclick={() => onvisit(item)}>
              {item.label}
            </a>

            <span class={metaClass}>{searchMetaLabel(item.kind, item.category)}</span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <section aria-labelledby="search-try-label">
    <h2 class={sectionLabelClass} id="search-try-label">
      {hasHistory ? "Try" : "Try one of these"}
    </h2>

    <ul class="{dividedListClass} mt-1">
      {#each searchIdleHints as hint (hint.href)}
        <li class={rowClass}>
          <a
            class={rowLinkClass}
            href={hint.href}
            lang={hint.lang}
            onclick={() =>
              onvisit({
                href: hint.href,
                kind: hint.kind,
                label: hint.label,
                ...(hint.category ? { category: hint.category } : {}),
              })}
          >
            {hint.label}
          </a>

          <span class={metaClass}>{searchMetaLabel(hint.kind, hint.category)}</span>
        </li>
      {/each}
    </ul>
  </section>
</div>
