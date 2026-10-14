<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import {
    buildBrowseQueryHref,
    buildPageItems,
    buildDictionaryViewFromEntries,
    browseStateNeedsIndex,
    categoryForTopic,
    DICTIONARY_PAGE_SIZE,
    fetchDictionaryIndex,
    hasActiveBrowseFilters,
    parseBrowseSearchParams,
    type BrowseQueryState,
    type BrowseTopicSlug,
    type DictionaryIndexEntry,
    type DictionaryBrowseView,
  } from "$lib/catalog/dictionary/browse-query";
  import { dictionaryPathFromIndexFields } from "$lib/catalog/dictionary/lemma-senses";
  import {
    dataColumnHeadClass,
    dataEmptyClass,
    dataGlossClass,
    dataMetaClass,
    dataPanelClass,
    dataPanelFootClass,
    dataPanelHeadClass,
    dataRangeClass,
    dataRowClass,
    dataWordClass,
  } from "$lib/components/ui/data-list-ui";

  const SKELETON_ROWS = 8;

  let {
    initialData,
    initialBrowse,
  }: { initialData: DictionaryBrowseView; initialBrowse: BrowseQueryState } = $props();

  function readBootState(): BrowseQueryState {
    if (typeof window === "undefined") {
      return initialBrowse;
    }

    return parseBrowseSearchParams(new URL(window.location.href).searchParams);
  }

  const bootState = readBootState();

  let entries = $state<DictionaryIndexEntry[] | null>(null);
  let loadError = $state("");
  let canAnimateList = $state(false);
  let hasUsedClientBrowse = $state(false);
  let topic = $state(bootState.topic);
  let letter = $state(bootState.letter);
  let page = $state(bootState.page);

  function matchesInitialView(
    nextTopic: BrowseTopicSlug,
    nextLetter: string,
    nextPage: number,
  ): boolean {
    return (
      nextTopic === initialBrowse.topic &&
      nextLetter === initialBrowse.letter &&
      nextPage === initialBrowse.page
    );
  }

  const needsFilteredIndex = $derived(browseStateNeedsIndex({ topic, letter, page }));

  const view = $derived(
    entries && (hasUsedClientBrowse || !matchesInitialView(topic, letter, page))
      ? buildDictionaryViewFromEntries(entries, topic, letter, page)
      : matchesInitialView(topic, letter, page)
        ? initialData
        : {
            ...initialData,
            topic,
            letter,
            page,
            totalCount: 0,
            totalPages: 1,
            visibleEntries: [],
          },
  );

  const waitingForFilteredView = $derived(
    !entries &&
      !loadError &&
      !matchesInitialView(topic, letter, page) &&
      needsFilteredIndex,
  );

  const topicOptions = $derived(
    !hasUsedClientBrowse && matchesInitialView(topic, letter, page)
      ? initialData.topicOptions
      : view.topicOptions,
  );

  const alphabetLetters = $derived(
    !hasUsedClientBrowse && matchesInitialView(topic, letter, page)
      ? initialData.letters
      : view.letters,
  );

  const listKey = $derived(
    `${topic}-${letter}-${page}-${waitingForFilteredView ? "loading" : "ready"}`,
  );

  const pageItems = $derived(buildPageItems(view.page, view.totalPages));
  const displayTopic = $derived(view.topic);
  const displayLetter = $derived(view.letter);
  const hasActiveFilters = $derived(hasActiveBrowseFilters(displayTopic, displayLetter));
  const showEntryCategory = $derived(categoryForTopic(displayTopic) === null);

  const rangeFrom = $derived((view.page - 1) * DICTIONARY_PAGE_SIZE + 1);
  const rangeTo = $derived(
    (view.page - 1) * DICTIONARY_PAGE_SIZE + view.visibleEntries.length,
  );
  const rangeLabel = $derived(
    waitingForFilteredView
      ? "Loading…"
      : view.totalCount === 0
        ? "0 results"
        : `${rangeFrom.toLocaleString("en")}–${rangeTo.toLocaleString("en")} of ${view.totalCount.toLocaleString("en")}`,
  );

  const showPager = $derived(
    view.totalPages > 1 && !waitingForFilteredView && view.visibleEntries.length > 0,
  );

  const chipClass = (active: boolean): string =>
    `cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-[color,background-color,border-color,box-shadow] duration-150 ${
      active
        ? "border-blue-600 bg-blue-600 text-paper shadow-none"
        : "border-slate-300 bg-surface text-slate-600 shadow-(--shadow-border) hover:border-slate-400 hover:bg-blue-50 hover:text-slate-900"
    }`;

  const letterChipClass = (active: boolean): string =>
    `flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border px-2 text-xs font-semibold transition-[color,background-color,border-color,box-shadow] duration-150 ${
      active
        ? "border-blue-600 bg-blue-600 text-paper shadow-none"
        : "border-slate-300 bg-surface text-slate-600 shadow-(--shadow-border) hover:border-slate-400 hover:bg-blue-50 hover:text-slate-900"
    }`;

  const pagerChipClass = (active: boolean): string =>
    active
      ? "border-blue-600 bg-blue-600 text-paper shadow-none"
      : "border-slate-300 bg-surface text-slate-600 shadow-(--shadow-border) hover:border-slate-400 hover:bg-blue-50 hover:text-slate-900";

  const pagerLinkClass =
    "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-(--control-radius) border px-2.5 text-xs font-semibold tabular-nums transition-colors";

  /** word · meaning (· part of speech when no topic narrows it). Phones stack the cells. */
  const browseTrack = $derived(
    showEntryCategory
      ? "gap-x-4 gap-y-0.5 grid-cols-1 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_7rem]"
      : "gap-x-4 gap-y-0.5 grid-cols-1 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]",
  );

  const indexPromise: Promise<DictionaryIndexEntry[]> | null =
    typeof window !== "undefined" ? fetchDictionaryIndex<DictionaryIndexEntry>() : null;

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
    hasUsedClientBrowse = true;
    topic = nextTopic;
    letter = nextLetter;
    page = nextPage;

    const href = buildBrowseQueryHref(nextTopic, nextLetter, nextPage);
    window.history.pushState(null, "", href);
  }

  function selectTopic(nextTopic: BrowseTopicSlug): void {
    pushBrowseState(nextTopic, letter, 1);
  }

  function selectLetter(nextLetter: string): void {
    pushBrowseState(topic, nextLetter, 1);
  }

  function selectPage(nextPage: number): void {
    pushBrowseState(topic, letter, nextPage);
  }

  function resetFilters(): void {
    pushBrowseState("all", "all", 1);
  }

  async function loadIndex(): Promise<void> {
    if (!indexPromise) {
      return;
    }

    loadError = "";

    try {
      entries = await indexPromise;
    } catch {
      loadError = "Browse filters need the dictionary index. Reload or try again.";
    }
  }

  onMount(() => {
    void loadIndex();

    const enableListAnimation = (): void => {
      canAnimateList = true;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(enableListAnimation);
    });

    const onPopState = (): void => {
      syncFromUrl(new URL(window.location.href));
      hasUsedClientBrowse = !matchesInitialView(topic, letter, page);
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
  {#each topicOptions as option (option.slug)}
    <button
      class={chipClass(displayTopic === option.slug)}
      type="button"
      aria-current={displayTopic === option.slug ? "true" : undefined}
      onclick={() => selectTopic(option.slug)}
    >
      {option.label}
      <span class="ml-1 opacity-70">{option.count}</span>
    </button>
  {/each}
</nav>

<nav
  id="wiki-alphabet"
  class="mt-4 flex flex-wrap gap-1"
  aria-label="Filter dictionary by first letter"
>
  <button
    class={letterChipClass(displayLetter === "all")}
    type="button"
    aria-current={displayLetter === "all" ? "true" : undefined}
    onclick={() => selectLetter("all")}
  >
    All
  </button>

  {#each alphabetLetters as letterOption (letterOption)}
    <button
      class={letterChipClass(displayLetter === letterOption)}
      type="button"
      aria-current={displayLetter === letterOption ? "true" : undefined}
      onclick={() => selectLetter(letterOption)}
    >
      {letterOption}
    </button>
  {/each}
</nav>

<section class="{dataPanelClass} mt-10" id="wiki-results" aria-label="Dictionary results">
  <div class={dataPanelHeadClass}>
    <p class={dataRangeClass}>
      <strong class="font-semibold tabular-nums text-slate-900">{rangeLabel}</strong>
      {#if view.totalPages > 1 && !waitingForFilteredView && view.totalCount > 0}
        <span class="tabular-nums text-slate-400">
          · page {view.page} of {view.totalPages}
        </span>
      {/if}
    </p>

    {#if hasActiveFilters}
      <button
        class="cursor-pointer border-0 bg-transparent p-0 text-xs font-bold text-blue-800 hover:underline"
        type="button"
        onclick={resetFilters}
      >
        Reset filters
      </button>
    {/if}
  </div>

  <div class="{dataColumnHeadClass} {browseTrack}" aria-hidden="true">
    <span>Word</span>
    <span>Meaning</span>
    {#if showEntryCategory}
      <span class="text-right">Part of speech</span>
    {/if}
  </div>

  {#if loadError}
    <p class="m-0 px-4 py-3 text-sm text-rose-800 sm:px-5" role="alert">{loadError}</p>
  {/if}

  {#key listKey}
    <div
      in:fade={canAnimateList ? { duration: 140 } : undefined}
      out:fade={canAnimateList ? { duration: 100 } : undefined}
    >
      {#if waitingForFilteredView}
        <ul
          class="m-0 list-none p-0"
          aria-busy="true"
          aria-label="Loading dictionary entries"
        >
          {#each Array.from({ length: SKELETON_ROWS }, (_, index) => index) as row (row)}
            <li class="border-b border-slate-200/70 px-4 py-3 last:border-b-0 sm:px-5">
              <div
                class="h-4 w-[38%] max-w-48 animate-pulse rounded bg-slate-200/70"
              ></div>
              <div
                class="mt-2 h-3 w-[62%] max-w-md animate-pulse rounded bg-slate-100"
              ></div>
            </li>
          {/each}
        </ul>
      {:else if view.visibleEntries.length}
        <ul class="m-0 list-none p-0" aria-label="Dictionary entries">
          {#each view.visibleEntries as entry (entry.slug)}
            <li>
              <a
                class="{dataRowClass} {browseTrack}"
                href={dictionaryPathFromIndexFields(entry)}
              >
                <span class="min-w-0 truncate {dataWordClass}" lang="sk"
                  >{entry.slovak}</span
                >

                <span class="min-w-0 {dataGlossClass}">{entry.english}</span>

                {#if showEntryCategory}
                  <span class="text-right {dataMetaClass} max-sm:hidden"
                    >{entry.category}</span
                  >
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      {:else if entries}
        <div class={dataEmptyClass}>
          <p class="m-0 font-serif text-lg text-slate-900">No matches</p>
          <p class="m-0 mt-1 text-sm text-slate-500">
            Try a shorter search or reset the filters.
          </p>
          <button
            class="mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-(--control-radius) bg-blue-600 px-4 font-sans text-sm font-bold text-paper"
            type="button"
            onclick={resetFilters}
          >
            Show all entries
          </button>
        </div>
      {/if}
    </div>
  {/key}

  {#if showPager}
    <nav class={dataPanelFootClass} aria-label="Dictionary pages">
      {#if view.page > 1}
        <button
          class="{pagerLinkClass} {pagerChipClass(false)}"
          type="button"
          onclick={() => selectPage(view.page - 1)}
        >
          Previous
        </button>
      {:else}
        <span
          class="{pagerLinkClass} {pagerChipClass(false)} pointer-events-none opacity-40"
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
            class="{pagerLinkClass} {pagerChipClass(item === view.page)}"
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
          class="{pagerLinkClass} {pagerChipClass(false)}"
          type="button"
          onclick={() => selectPage(view.page + 1)}
        >
          Next
        </button>
      {:else}
        <span
          class="{pagerLinkClass} {pagerChipClass(false)} pointer-events-none opacity-40"
          aria-hidden="true"
        >
          Next
        </span>
      {/if}
    </nav>
  {/if}
</section>
