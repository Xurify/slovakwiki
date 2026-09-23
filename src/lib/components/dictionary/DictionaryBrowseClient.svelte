<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import {
    buildBrowseQueryHref,
    buildPageItems,
    buildDictionaryViewFromEntries,
    browseStateNeedsIndex,
    categoryForTopic,
    DICTIONARY_BROWSE_INDEX_URL,
    DICTIONARY_PAGE_SIZE,
    hasActiveBrowseFilters,
    parseBrowseSearchParams,
    type BrowseQueryState,
    type BrowseTopicSlug,
    type DictionaryIndexEntry,
    type DictionaryBrowseView,
  } from "$lib/catalog/dictionary/browse-query";
  import { dictionaryPathFromIndexFields } from "$lib/catalog/dictionary/lemma-senses";

  const INDEX_URL = DICTIONARY_BROWSE_INDEX_URL;
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

  const segmentClass = (active: boolean): string =>
    `inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[calc(var(--control-radius)-2px)] px-3 text-sm font-semibold transition-colors ${
      active
        ? "bg-surface text-slate-900 shadow-(--shadow-border)"
        : "text-slate-600 hover:text-slate-900"
    }`;

  const squareClass = (active: boolean): string =>
    `inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-(--control-radius) px-2 text-sm font-semibold tabular-nums transition-colors ${
      active
        ? "bg-blue-50 text-blue-800 ring-1 ring-blue-600/40 ring-inset"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const pagerStepClass =
    "inline-flex h-9 cursor-pointer items-center rounded-(--control-radius) bg-surface px-3 text-sm font-semibold text-blue-800 shadow-(--shadow-border) transition-shadow hover:shadow-(--shadow-border-hover)";

  const cardClass =
    "overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)";

  const indexPromise: Promise<DictionaryIndexEntry[]> | null =
    typeof window !== "undefined"
      ? fetch(INDEX_URL).then(async (response) => {
          if (!response.ok) {
            throw new Error("Index unavailable");
          }

          const data = (await response.json()) as DictionaryIndexEntry[];

          if (!Array.isArray(data)) {
            throw new Error("Index malformed");
          }

          return data;
        })
      : null;

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

<div id="wiki-search-section">
  <form action="/search" method="get" role="search">
    <label class="sr-only" for="wiki-search">Search dictionary words</label>
    <div
      class="flex min-h-[52px] items-stretch overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border) transition-shadow focus-within:shadow-[0_0_0_2px_var(--accent),0_0_0_6px_var(--accent-soft)]"
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

<div class="{cardClass} mt-4 divide-y divide-slate-200/70">
  <div
    class="grid items-center gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[5.5rem_minmax(0,1fr)]"
  >
    <p class="m-0 text-xs font-semibold text-slate-500">Show</p>

    <nav
      class="flex flex-wrap gap-1 rounded-(--control-radius) bg-slate-100 p-1"
      aria-label="Filter dictionary by category"
    >
      {#each topicOptions as option (option.slug)}
        <button
          class={segmentClass(displayTopic === option.slug)}
          type="button"
          aria-pressed={displayTopic === option.slug}
          onclick={() => selectTopic(option.slug)}
        >
          {option.label}
          <span class="text-xs font-medium text-slate-500 tabular-nums">
            {option.count.toLocaleString("en")}
          </span>
        </button>
      {/each}
    </nav>
  </div>

  <div
    class="grid items-start gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[5.5rem_minmax(0,1fr)]"
  >
    <p class="m-0 text-xs font-semibold text-slate-500 sm:pt-2">Starts with</p>

    <nav
      id="wiki-alphabet"
      class="flex flex-wrap gap-0.5"
      aria-label="Filter dictionary by first letter"
    >
      <button
        class={squareClass(displayLetter === "all")}
        type="button"
        aria-pressed={displayLetter === "all"}
        onclick={() => selectLetter("all")}
      >
        All
      </button>

      {#each alphabetLetters as letterOption (letterOption)}
        <button
          class={squareClass(displayLetter === letterOption)}
          type="button"
          aria-pressed={displayLetter === letterOption}
          lang="sk"
          onclick={() => selectLetter(letterOption)}
        >
          {letterOption}
        </button>
      {/each}
    </nav>
  </div>
</div>

<div class="mt-8" id="wiki-results">
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
    <p class="m-0 text-sm text-slate-500">
      <strong class="font-semibold text-slate-900 tabular-nums">{rangeLabel}</strong>
      {#if view.totalPages > 1 && !waitingForFilteredView && view.totalCount > 0}
        <span class="text-slate-400 tabular-nums">
          · page {view.page} of {view.totalPages}
        </span>
      {/if}
    </p>

    {#if hasActiveFilters}
      <button
        class="cursor-pointer text-xs font-semibold text-blue-800 underline underline-offset-2"
        type="button"
        onclick={resetFilters}
      >
        Reset filters
      </button>
    {/if}
  </div>

  {#if loadError}
    <p class="m-0 mt-4 text-sm text-rose-700" role="alert">{loadError}</p>
  {/if}

  {#key listKey}
    <div
      in:fade={canAnimateList ? { duration: 140 } : undefined}
      out:fade={canAnimateList ? { duration: 100 } : undefined}
    >
      {#if waitingForFilteredView}
        <ul
          class="{cardClass} m-0 mt-3 list-none divide-y divide-slate-200/70 p-0"
          aria-busy="true"
          aria-label="Loading dictionary entries"
        >
          {#each Array.from({ length: SKELETON_ROWS }, (_, index) => index) as row (row)}
            <li class="px-5 py-3">
              <div
                class="h-5 w-[38%] max-w-48 animate-pulse rounded bg-slate-200/70"
              ></div>
              <div
                class="mt-2 h-4 w-[62%] max-w-md animate-pulse rounded bg-slate-100"
              ></div>
            </li>
          {/each}
        </ul>
      {:else if view.visibleEntries.length}
        <ul
          class="{cardClass} m-0 mt-3 list-none divide-y divide-slate-200/70 p-0"
          aria-label="Dictionary entries"
        >
          {#each view.visibleEntries as entry (entry.slug)}
            <li>
              <a
                class="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 no-underline transition-colors hover:bg-slate-50"
                href={dictionaryPathFromIndexFields(entry)}
              >
                <span class="min-w-0">
                  <span
                    class="block font-serif text-[1.05rem] leading-snug font-semibold text-slate-900 group-hover:text-blue-800"
                    lang="sk"
                  >
                    {entry.slovak}
                  </span>
                  <span class="mt-0.5 block truncate text-sm text-slate-600">
                    {entry.english}
                  </span>
                </span>

                <span class="flex items-center gap-3 text-xs text-slate-500">
                  {#if showEntryCategory}
                    <span class="max-sm:hidden">{entry.category}</span>
                  {/if}
                  <span
                    class="text-slate-400 transition-colors group-hover:text-blue-800"
                    aria-hidden="true">→</span
                  >
                </span>
              </a>
            </li>
          {/each}
        </ul>
      {:else if entries}
        <div class="{cardClass} mt-3 px-6 py-14 text-center">
          <h2 class="m-0 font-serif text-xl text-slate-900">No matches</h2>
          <p class="m-0 mt-2 text-sm text-slate-600">
            Try another letter, or reset the filters.
          </p>
          <button
            class="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-(--control-radius) bg-blue-600 px-4 font-sans font-bold text-paper hover:bg-blue-700"
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
    <nav
      class="mt-6 flex flex-wrap items-center justify-between gap-3"
      aria-label="Dictionary pages"
    >
      {#if view.page > 1}
        <button
          class={pagerStepClass}
          type="button"
          onclick={() => selectPage(view.page - 1)}
        >
          ← Previous
        </button>
      {:else}
        <span class="{pagerStepClass} pointer-events-none opacity-40" aria-hidden="true">
          ← Previous
        </span>
      {/if}

      <div class="flex flex-wrap items-center justify-center gap-0.5 max-sm:hidden">
        {#each pageItems as item, index (typeof item === "number" ? item : `gap-${index}`)}
          {#if item === "gap"}
            <span class="px-1 text-xs text-slate-400" aria-hidden="true">…</span>
          {:else}
            <button
              class={squareClass(item === view.page)}
              type="button"
              aria-current={item === view.page ? "page" : undefined}
              onclick={() => selectPage(item)}
            >
              {item}
            </button>
          {/if}
        {/each}
      </div>

      {#if view.page < view.totalPages}
        <button
          class={pagerStepClass}
          type="button"
          onclick={() => selectPage(view.page + 1)}
        >
          Next →
        </button>
      {:else}
        <span class="{pagerStepClass} pointer-events-none opacity-40" aria-hidden="true">
          Next →
        </span>
      {/if}
    </nav>
  {/if}
</div>
