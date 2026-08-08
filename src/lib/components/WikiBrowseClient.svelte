<script lang="ts">
  import { onMount } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import {
    buildBrowseQueryHref,
    buildPageItems,
    buildWikiViewFromEntries,
    browseStateNeedsIndex,
    DICTIONARY_PAGE_SIZE,
    hasActiveBrowseFilters,
    parseBrowseSearchParams,
    resetBrowseHref,
    type BrowseTopicSlug,
    type DictionaryIndexEntry,
    type WikiPageView,
  } from "$lib/content/dictionary-browse-utils";

  const INDEX_URL = "/dictionary/index.json";

  let { initialData }: { initialData: WikiPageView } = $props();

  const initialTopic = initialData.topic;
  const initialLetter = initialData.letter;
  const initialPage = initialData.page;

  let entries = $state<DictionaryIndexEntry[] | null>(null);
  let loadError = $state("");
  let topic = $state(initialTopic);
  let letter = $state(initialLetter);
  let page = $state(initialPage);

  const view = $derived(
    entries ? buildWikiViewFromEntries(entries, topic, letter, page) : initialData,
  );

  const showDefaultSsrList = $derived(
    !entries && !loadError && !browseStateNeedsIndex({ topic, letter, page }),
  );

  const pageItems = $derived(buildPageItems(view.page, view.totalPages));
  const hasActiveFilters = $derived(hasActiveBrowseFilters(topic, letter));

  const rangeFrom = $derived((view.page - 1) * DICTIONARY_PAGE_SIZE + 1);
  const rangeTo = $derived(
    (view.page - 1) * DICTIONARY_PAGE_SIZE + view.visibleEntries.length,
  );
  const rangeLabel = $derived(
    view.totalCount === 0 ? "0 results" : `${rangeFrom}–${rangeTo} of ${view.totalCount}`,
  );

  const chipClass = (active: boolean): string =>
    `cursor-pointer ${
      active
        ? "border-blue-800 bg-blue-800 text-white"
        : "border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:text-slate-900"
    }`;

  const pagerLinkClass =
    "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-(--control-radius) border px-2.5 text-xs font-semibold tabular-nums transition-colors";

  const rowLinkClass =
    "group flex items-start justify-between gap-4 border-b border-slate-200 -mx-4 px-4 py-3.5 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_55%,transparent)]";

  function syncFromUrl(url: URL): void {
    const next = parseBrowseSearchParams(url.searchParams);
    topic = next.topic;
    letter = next.letter;
    page = next.page;
  }

  function pushBrowseState(
    nextTopic: BrowseTopicSlug,
    nextLetter: string,
    nextPage: number,
  ): void {
    topic = nextTopic;
    letter = nextLetter;
    page = nextPage;

    const href = buildBrowseQueryHref(nextTopic, nextLetter, nextPage);
    window.history.pushState(null, "", href);
  }

  function selectTopic(nextTopic: BrowseTopicSlug): void {
    if (!entries) {
      return;
    }

    pushBrowseState(nextTopic, letter, 1);
  }

  function selectLetter(nextLetter: string): void {
    if (!entries) {
      return;
    }

    pushBrowseState(topic, nextLetter, 1);
  }

  function selectPage(nextPage: number): void {
    if (!entries) {
      return;
    }

    pushBrowseState(topic, letter, nextPage);
  }

  function resetFilters(): void {
    if (!entries) {
      return;
    }

    pushBrowseState("all", "all", 1);
  }

  async function loadIndex(): Promise<void> {
    loadError = "";

    try {
      const response = await fetch(INDEX_URL);

      if (!response.ok) {
        throw new Error("Index unavailable");
      }

      const data = (await response.json()) as DictionaryIndexEntry[];

      if (!Array.isArray(data)) {
        throw new Error("Index malformed");
      }

      entries = data;
      syncFromUrl(new URL(window.location.href));
      document.documentElement.classList.remove("dictionary-browse-pending");
    } catch {
      loadError = "Browse filters need the dictionary index. Reload or try again.";
      document.documentElement.classList.remove("dictionary-browse-pending");
    }
  }

  onMount(() => {
    syncFromUrl(new URL(window.location.href));
    void loadIndex();

    const onPopState = (): void => {
      syncFromUrl(new URL(window.location.href));
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  });
</script>

<div class="mt-10" id="wiki-search-section">
  <form action="/search" method="get" role="search">
    <label class="sr-only" for="wiki-search">Search dictionary words</label>
    <div
      class="flex min-h-[50px] items-stretch overflow-hidden rounded-(--control-radius) border border-slate-300 bg-surface/90 shadow-(--shadow-border) transition-[box-shadow,border-color] focus-within:border-blue-600 focus-within:shadow-[0_0_0_4px_var(--accent-soft)]"
    >
      <svg
        class="ml-4 w-4 shrink-0 fill-none stroke-slate-400 stroke-[1.8]"
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
      </svg>
      <input
        class="min-w-0 flex-1 border-0 bg-transparent px-3 text-[0.95rem] outline-none"
        id="wiki-search"
        name="q"
        placeholder="Search in English or Slovak"
        type="search"
      />
    </div>
  </form>
</div>

<nav class="mt-6 flex flex-wrap gap-1.5" aria-label="Filter dictionary by category">
  {#each view.topicOptions as option (option.slug)}
    {#if entries}
      <button
        class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors {chipClass(
          topic === option.slug,
        )}"
        type="button"
        aria-current={topic === option.slug ? "true" : undefined}
        onclick={() => selectTopic(option.slug)}
      >
        {option.label}
        <span class="ml-1 opacity-70">{option.count}</span>
      </button>
    {:else}
      <a
        class="rounded-full border px-3 py-1.5 text-xs font-semibold no-underline transition-colors {chipClass(
          topic === option.slug,
        )}"
        href={buildBrowseQueryHref(option.slug, letter, 1)}
        aria-current={topic === option.slug ? "true" : undefined}
      >
        {option.label}
        <span class="ml-1 opacity-70">{option.count}</span>
      </a>
    {/if}
  {/each}
</nav>

<nav
  id="wiki-alphabet"
  class="mt-4 flex flex-wrap gap-1"
  aria-label="Filter dictionary by first letter"
>
  {#if entries}
    <button
      class="flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-semibold transition-colors {chipClass(
        letter === 'all',
      )}"
      type="button"
      aria-current={letter === "all" ? "true" : undefined}
      onclick={() => selectLetter("all")}
    >
      All
    </button>

    {#each view.letters as letterOption (letterOption)}
      <button
        class="flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-semibold transition-colors {chipClass(
          letter === letterOption,
        )}"
        type="button"
        aria-current={letter === letterOption ? "true" : undefined}
        onclick={() => selectLetter(letterOption)}
      >
        {letterOption}
      </button>
    {/each}
  {:else}
    <a
      class="flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-semibold no-underline transition-colors {chipClass(
        letter === 'all',
      )}"
      href={buildBrowseQueryHref(topic, "all", 1)}
      aria-current={letter === "all" ? "true" : undefined}
    >
      All
    </a>

    {#each view.letters as letterOption (letterOption)}
      <a
        class="flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-semibold no-underline transition-colors {chipClass(
          letter === letterOption,
        )}"
        href={buildBrowseQueryHref(topic, letterOption, 1)}
        aria-current={letter === letterOption ? "true" : undefined}
      >
        {letterOption}
      </a>
    {/each}
  {/if}
</nav>

<div
  class="mt-8 flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 pb-3"
>
  <p class="m-0 text-sm text-slate-500">
    <strong class="tabular-nums text-slate-900">{rangeLabel}</strong>
    {#if view.totalPages > 1}
      <span class="text-slate-400">
        · page {view.page} of {view.totalPages}
      </span>
    {/if}
  </p>

  {#if hasActiveFilters}
    {#if entries}
      <button
        class="cursor-pointer text-xs font-semibold text-blue-800 underline underline-offset-2"
        type="button"
        onclick={resetFilters}
      >
        Reset filters
      </button>
    {:else}
      <a
        class="text-xs font-semibold text-blue-800 underline underline-offset-2"
        href={resetBrowseHref()}
      >
        Reset filters
      </a>
    {/if}
  {/if}
</div>

{#if loadError}
  <p class="mt-4 text-sm text-rose-800" role="alert">{loadError}</p>
{/if}

<div id="wiki-results" class="mt-0">
  <div
    id="wiki-results-pending"
    class="flex min-h-48 items-center justify-center py-8"
    aria-hidden={showDefaultSsrList || Boolean(entries) || Boolean(loadError)}
  >
    <DotLoader label="Loading dictionary browse…" />
  </div>

  {#if showDefaultSsrList && view.visibleEntries.length}
    <ul
      id="wiki-default-results"
      class="m-0 list-none p-0"
      aria-label="Dictionary entries"
    >
      {#each view.visibleEntries as entry (entry.slug)}
        <li>
          <a class={rowLinkClass} href="/dictionary/{entry.slug}">
            <div class="min-w-0">
              <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <strong class="font-serif text-lg text-blue-800" lang="sk">
                  {entry.slovak}
                </strong>
                <span class="text-xs text-slate-400">{entry.category}</span>
              </div>
              <span class="mt-0.5 block text-[0.95rem] leading-snug text-slate-600">
                {entry.english}
              </span>
            </div>
            <ArrowRight class="mt-1.5 shrink-0 text-blue-800" />
          </a>
        </li>
      {/each}
    </ul>

    {#if view.totalPages > 1}
      <nav
        id="wiki-default-pager"
        class="mt-8 flex flex-col items-center gap-3"
        aria-label="Dictionary pages"
      >
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          {#if view.page > 1}
            {#if entries}
              <button
                class="{pagerLinkClass} {chipClass(false)}"
                type="button"
                onclick={() => selectPage(view.page - 1)}
              >
                Previous
              </button>
            {:else}
              <a
                class="{pagerLinkClass} {chipClass(false)} no-underline"
                href={buildBrowseQueryHref(topic, letter, view.page - 1)}
              >
                Previous
              </a>
            {/if}
          {:else}
            <span
              class="{pagerLinkClass} {chipClass(false)} pointer-events-none opacity-40"
              aria-hidden="true"
            >
              Previous
            </span>
          {/if}

          {#each pageItems as item, index (typeof item === "number" ? item : `gap-${index}`)}
            {#if item === "gap"}
              <span class="px-1 text-xs text-slate-400" aria-hidden="true">…</span>
            {:else if entries}
              <button
                class="{pagerLinkClass} {chipClass(item === view.page)}"
                type="button"
                aria-current={item === view.page ? "page" : undefined}
                onclick={() => selectPage(item)}
              >
                {item}
              </button>
            {:else}
              <a
                class="{pagerLinkClass} {chipClass(item === view.page)} no-underline"
                href={buildBrowseQueryHref(topic, letter, item)}
                aria-current={item === view.page ? "page" : undefined}
              >
                {item}
              </a>
            {/if}
          {/each}

          {#if view.page < view.totalPages}
            {#if entries}
              <button
                class="{pagerLinkClass} {chipClass(false)}"
                type="button"
                onclick={() => selectPage(view.page + 1)}
              >
                Next
              </button>
            {:else}
              <a
                class="{pagerLinkClass} {chipClass(false)} no-underline"
                href={buildBrowseQueryHref(topic, letter, view.page + 1)}
              >
                Next
              </a>
            {/if}
          {:else}
            <span
              class="{pagerLinkClass} {chipClass(false)} pointer-events-none opacity-40"
              aria-hidden="true"
            >
              Next
            </span>
          {/if}
        </div>
      </nav>
    {/if}
  {:else if entries}
    {#if view.visibleEntries.length}
      <ul class="m-0 list-none p-0" aria-label="Dictionary entries">
        {#each view.visibleEntries as entry (entry.slug)}
          <li>
            <a class={rowLinkClass} href="/dictionary/{entry.slug}">
              <div class="min-w-0">
                <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <strong class="font-serif text-lg text-blue-800" lang="sk">
                    {entry.slovak}
                  </strong>
                  <span class="text-xs text-slate-400">{entry.category}</span>
                </div>
                <span class="mt-0.5 block text-[0.95rem] leading-snug text-slate-600">
                  {entry.english}
                </span>
              </div>
              <ArrowRight class="mt-1.5 shrink-0 text-blue-800" />
            </a>
          </li>
        {/each}
      </ul>

      {#if view.totalPages > 1}
        <nav class="mt-8 flex flex-col items-center gap-3" aria-label="Dictionary pages">
          <div class="flex flex-wrap items-center justify-center gap-1.5">
            {#if view.page > 1}
              <button
                class="{pagerLinkClass} {chipClass(false)}"
                type="button"
                onclick={() => selectPage(view.page - 1)}
              >
                Previous
              </button>
            {:else}
              <span
                class="{pagerLinkClass} {chipClass(false)} pointer-events-none opacity-40"
                aria-hidden="true"
              >
                Previous
              </span>
            {/if}

            {#each pageItems as item, index (typeof item === "number" ? item : `gap-${index}`)}
              {#if item === "gap"}
                <span class="px-1 text-xs text-slate-400" aria-hidden="true">…</span>
              {:else}
                <button
                  class="{pagerLinkClass} {chipClass(item === view.page)}"
                  type="button"
                  aria-current={item === view.page ? "page" : undefined}
                  onclick={() => selectPage(item)}
                >
                  {item}
                </button>
              {/if}
            {/each}

            {#if view.page < view.totalPages}
              <button
                class="{pagerLinkClass} {chipClass(false)}"
                type="button"
                onclick={() => selectPage(view.page + 1)}
              >
                Next
              </button>
            {:else}
              <span
                class="{pagerLinkClass} {chipClass(false)} pointer-events-none opacity-40"
                aria-hidden="true"
              >
                Next
              </span>
            {/if}
          </div>
        </nav>
      {/if}
    {:else}
      <div class="py-16 text-center">
        <h2 class="text-xl">No matches</h2>
        <p class="mt-2 text-sm text-slate-500">
          Try a shorter search or reset the filters.
        </p>
        <button
          class="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-(--control-radius) bg-blue-800 px-4 font-sans font-bold text-white"
          type="button"
          onclick={resetFilters}
        >
          Show all entries
        </button>
      </div>
    {/if}
  {:else if loadError}
    <div class="flex min-h-24 items-center justify-center py-8">
      <DotLoader label="Browse index unavailable" />
    </div>
  {/if}
</div>
