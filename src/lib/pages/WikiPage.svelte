<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import type { WordOrigin } from "$lib/content/types";

  export interface DictionaryIndexEntry {
    category: string;
    english: string;
    /** SNK rank when known — used by the Common filter. */
    frequencyRank?: number;
    origin?: WordOrigin;
    slug: string;
    slovak: string;
  }

  let { entries }: { entries: DictionaryIndexEntry[] } = $props();

  /** SNK rank ceiling for the Common chip (top ~500 per POS → ~1500 lemmas). */
  const COMMON_RANK_MAX = 500;
  const PAGE_SIZE = 50;

  /** Fixed browse chips — thematic Food/Greetings/… live on a future Essentials page. */
  const BROWSE_CATEGORIES = [
    "Nouns",
    "Verbs",
    "Adjectives",
    "Places",
    "Phrases",
  ] as const;

  const categoryCounts = new Map<string, number>();

  for (const entry of entries) {
    categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
  }

  const featuredCount = entries.filter((entry) => entry.origin === "curated").length;
  const commonCount = entries.filter(
    (entry) =>
      entry.frequencyRank !== undefined && entry.frequencyRank <= COMMON_RANK_MAX,
  ).length;

  const availableLetters = [
    ...new Set(
      entries.map((entry) => entry.slovak.at(0)?.toLocaleUpperCase("sk") ?? "#"),
    ),
  ].toSorted((first, second) => first.localeCompare(second, "sk"));

  const topicOptions = [
    { value: "all", label: "All words", count: entries.length },
    { value: "featured", label: "Featured", count: featuredCount },
    { value: "common", label: "Common", count: commonCount },
    ...BROWSE_CATEGORIES.map((category) => ({
      value: category,
      label: category,
      count: categoryCounts.get(category) ?? 0,
    })).filter((option) => option.count > 0),
  ];
  const letterOptions = [
    { value: "all", label: "All" },
    ...availableLetters.map((letter) => ({ value: letter, label: letter })),
  ];

  let activeCategory = $state("all");
  let activeLetter = $state("all");
  let query = $state("");
  let currentPage = $state(1);
  let pageInput = $state("1");

  const filteredEntries = $derived(
    entries
      .filter((entry) => {
        if (activeCategory === "all") return true;
        if (activeCategory === "featured") return entry.origin === "curated";
        if (activeCategory === "common") {
          return (
            entry.frequencyRank !== undefined && entry.frequencyRank <= COMMON_RANK_MAX
          );
        }
        return entry.category === activeCategory;
      })
      .filter(
        (entry) =>
          activeLetter === "all" ||
          entry.slovak.at(0)?.toLocaleUpperCase("sk") === activeLetter,
      )
      .filter((entry) => {
        const needle = normalize(query.trim());
        return (
          !needle ||
          normalize(`${entry.slovak} ${entry.english} ${entry.category}`).includes(needle)
        );
      })
      .toSorted((first, second) => first.slovak.localeCompare(second.slovak, "sk")),
  );

  const totalPages = $derived(Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE)));
  const safePage = $derived(Math.min(currentPage, totalPages));
  const pageStart = $derived((safePage - 1) * PAGE_SIZE);
  const visibleEntries = $derived(
    filteredEntries.slice(pageStart, pageStart + PAGE_SIZE),
  );
  const rangeLabel = $derived.by(() => {
    if (filteredEntries.length === 0) return "0 results";
    const from = pageStart + 1;
    const to = pageStart + visibleEntries.length;
    return `${from}–${to} of ${filteredEntries.length}`;
  });
  const pageItems = $derived(buildPageItems(safePage, totalPages));
  const hasActiveFilters = $derived(
    activeCategory !== "all" || activeLetter !== "all" || Boolean(query),
  );

  $effect(() => {
    pageInput = String(safePage);
  });

  function normalize(value: string): string {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase();
  }

  function buildPageItems(current: number, total: number): Array<number | "gap"> {
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items: Array<number | "gap"> = [];
    const windowStart = Math.max(2, current - 1);
    const windowEnd = Math.min(total - 1, current + 1);

    items.push(1);
    if (windowStart > 2) items.push("gap");
    for (let page = windowStart; page <= windowEnd; page += 1) {
      items.push(page);
    }
    if (windowEnd < total - 1) items.push("gap");
    items.push(total);

    return items;
  }

  function resetPage(): void {
    currentPage = 1;
  }

  function clearFilters(): void {
    activeCategory = "all";
    activeLetter = "all";
    query = "";
    resetPage();
  }

  function setCategory(value: string): void {
    activeCategory = value;
    resetPage();
  }

  function setLetter(value: string): void {
    activeLetter = value;
    resetPage();
  }

  function setPage(page: number): void {
    currentPage = Math.min(Math.max(1, page), totalPages);
  }

  function commitPageInput(): void {
    const parsed = Number.parseInt(pageInput.trim(), 10);
    if (Number.isNaN(parsed)) {
      pageInput = String(safePage);
      return;
    }
    setPage(parsed);
  }

  function onPageInputKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      commitPageInput();
    }
  }

  function chipClass(active: boolean): string {
    return active
      ? "border-blue-800 bg-blue-800 text-white"
      : "border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:text-slate-900";
  }

  const pagerButtonClass =
    "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-(--control-radius) border px-2.5 text-xs font-semibold tabular-nums transition-colors disabled:cursor-default disabled:opacity-40";

  const pageInputClass =
    "h-9 w-14 rounded-(--control-radius) border border-slate-300 bg-transparent px-2 text-center text-xs font-semibold tabular-nums text-slate-800 outline-none focus:border-blue-600";

  const rowLinkClass =
    "group flex items-start justify-between gap-4 border-b border-slate-200 -mx-4 px-4 py-3.5 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_55%,transparent)]";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <header class="max-w-[640px]">
      <Eyebrow>Reference</Eyebrow>
      <h1>Dictionary</h1>
      <Lead>
        Search or browse every lemma by letter and part of speech. Featured is a short
        curated starter set; Common is the SNK top 500 per list. For full ranked lists,
        open Most common.
      </Lead>
      <p class="mt-4 text-sm text-slate-500">
        Also browse the
        <TextLink href="/dictionary/common/verb"
          >most common verbs, nouns, and adjectives</TextLink
        >.
      </p>
    </header>

    <div class="mt-10" id="wiki-search-section">
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
          bind:value={query}
          oninput={resetPage}
          placeholder="Search in English or Slovak"
          type="search"
        />
        {#if query}
          <button
            class="mr-3 cursor-pointer border-0 bg-transparent text-xs font-semibold text-blue-800"
            type="button"
            aria-label="Clear search"
            onclick={() => {
              query = "";
              resetPage();
            }}
          >
            Clear
          </button>
        {/if}
      </div>
    </div>

    <nav class="mt-6 flex flex-wrap gap-1.5" aria-label="Filter dictionary by category">
      {#each topicOptions as option (option.value)}
        <button
          class="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors {chipClass(
            activeCategory === option.value,
          )}"
          type="button"
          aria-pressed={activeCategory === option.value}
          onclick={() => setCategory(option.value)}
        >
          {option.label}
          {#if option.count !== undefined}
            <span class="ml-1 opacity-70">{option.count}</span>
          {/if}
        </button>
      {/each}
    </nav>

    <nav
      id="wiki-alphabet"
      class="mt-4 flex flex-wrap gap-1"
      aria-label="Filter dictionary by first letter"
    >
      {#each letterOptions as option (option.value)}
        <button
          class="h-8 min-w-8 cursor-pointer rounded-full border px-2 text-xs font-semibold transition-colors {chipClass(
            activeLetter === option.value,
          )}"
          type="button"
          aria-pressed={activeLetter === option.value}
          onclick={() => setLetter(option.value)}
        >
          {option.label}
        </button>
      {/each}
    </nav>

    <div
      class="mt-8 flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 pb-3"
    >
      <p class="m-0 text-sm text-slate-500">
        <strong class="tabular-nums text-slate-900">{rangeLabel}</strong>
        {#if totalPages > 1}
          <span class="text-slate-400">
            · page {safePage} of {totalPages}
          </span>
        {/if}
      </p>
      {#if hasActiveFilters}
        <button
          class="cursor-pointer border-0 bg-transparent text-xs font-semibold text-blue-800 underline underline-offset-2"
          type="button"
          onclick={clearFilters}
        >
          Reset filters
        </button>
      {/if}
    </div>

    <div id="wiki-results" class="mt-0">
      {#if visibleEntries.length}
        <ul class="m-0 list-none p-0" aria-label="Dictionary entries">
          {#each visibleEntries as entry (entry.slug)}
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

        {#if totalPages > 1}
          <nav
            class="mt-8 flex flex-col items-center gap-3"
            aria-label="Dictionary pages"
          >
            <div class="flex flex-wrap items-center justify-center gap-1.5">
              <button
                class="{pagerButtonClass} {chipClass(false)}"
                type="button"
                disabled={safePage <= 1}
                onclick={() => setPage(safePage - 1)}
              >
                Previous
              </button>

              {#each pageItems as item, index (typeof item === "number" ? item : `gap-${index}`)}
                {#if item === "gap"}
                  <span class="px-1 text-xs text-slate-400" aria-hidden="true">…</span>
                {:else}
                  <button
                    class="{pagerButtonClass} {chipClass(item === safePage)}"
                    type="button"
                    aria-current={item === safePage ? "page" : undefined}
                    aria-label="Page {item}"
                    onclick={() => setPage(item)}
                  >
                    {item}
                  </button>
                {/if}
              {/each}

              <button
                class="{pagerButtonClass} {chipClass(false)}"
                type="button"
                disabled={safePage >= totalPages}
                onclick={() => setPage(safePage + 1)}
              >
                Next
              </button>
            </div>

            <label class="flex items-center gap-2 text-xs text-slate-500">
              <span>Go to page</span>
              <input
                class={pageInputClass}
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                autocomplete="off"
                aria-label="Page number"
                bind:value={pageInput}
                onkeydown={onPageInputKeydown}
                onblur={commitPageInput}
              />
              <span class="tabular-nums">of {totalPages}</span>
            </label>
          </nav>
        {/if}
      {:else}
        <div class="py-16 text-center">
          <h2 class="text-xl">No matches</h2>
          <p class="mt-2 text-sm text-slate-500">
            Try a shorter search or reset the filters.
          </p>
          <Button class="mt-4" type="button" onclick={clearFilters}>
            Show all entries
          </Button>
        </div>
      {/if}
    </div>

    <nav
      class="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-8 text-sm"
      aria-label="Other reference"
    >
      <TextLink href="/dictionary/common/verb">Most common</TextLink>
      <TextLink href="/grammar">Grammar</TextLink>
      <TextLink href="/pronunciation">Pronunciation</TextLink>
      <TextLink href="/glossary">Glossary</TextLink>
      <TextLink href="/references">References</TextLink>
      <TextLink href="/lessons">Lessons</TextLink>
    </nav>
  </PageShell>
</main>
