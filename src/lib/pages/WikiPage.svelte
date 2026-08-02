<script lang="ts">
  import { contextRail, cx, railLabel } from "$lib/ui/classes";

  import { allEntries } from "$lib/content/data";
  import type { EntryKind } from "$lib/content/types";

  const routeBase: Record<EntryKind, string> = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };

  const dictionaryEntries = allEntries.filter((entry) => entry.kind === "word");
  const categoryCounts = new Map<string, number>();

  for (const entry of dictionaryEntries) {
    categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
  }

  const categories = [...categoryCounts].toSorted(([first], [second]) =>
    first.localeCompare(second),
  );
  const availableLetters = [
    ...new Set(
      dictionaryEntries.map((entry) => entry.slovak.at(0)?.toLocaleUpperCase("sk") ?? "#"),
    ),
  ].toSorted((first, second) => first.localeCompare(second, "sk"));
  const topicOptions = [
    { value: "all", label: "All topics", count: dictionaryEntries.length },
    ...categories.map(([category, count]) => ({
      value: category,
      label: category,
      count,
    })),
  ];
  const letterOptions = [
    { value: "all", label: "All" },
    ...availableLetters.map((letter) => ({ value: letter, label: letter })),
  ];

  let activeCategory = $state("all");
  let activeLetter = $state("all");
  let query = $state("");

  const visibleEntries = $derived(
    dictionaryEntries
      .filter((entry) => activeCategory === "all" || entry.category === activeCategory)
      .filter(
        (entry) =>
          activeLetter === "all" || entry.slovak.at(0)?.toLocaleUpperCase("sk") === activeLetter,
      )
      .filter((entry) => {
        const needle = normalize(query.trim());
        return (
          !needle ||
          normalize(
            `${entry.slovak} ${entry.english} ${entry.category} ${entry.tags.join(" ")}`,
          ).includes(needle)
        );
      })
      .toSorted((first, second) => first.slovak.localeCompare(second.slovak, "sk")),
  );
  const hasActiveFilters = $derived(
    activeCategory !== "all" || activeLetter !== "all" || Boolean(query),
  );

  function normalize(value: string): string {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase();
  }

  function clearFilters(): void {
    activeCategory = "all";
    activeLetter = "all";
    query = "";
  }

  function filterClass(active: boolean): string {
    return active ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100";
  }
</script>

<main class="min-h-[calc(100vh-58px)]">
  <div
    class="grid grid-cols-[215px_minmax(0,1fr)_205px] max-[1100px]:grid-cols-[215px_minmax(0,1fr)] max-[760px]:block"
  >
    <aside
      class="sticky top-(--header-height) h-[calc(100vh-var(--header-height)-28px)] overflow-y-auto border-r border-slate-200 px-5 pb-12 pt-7 max-[760px]:hidden"
      aria-label="Dictionary filters"
    >
      <div class="mb-8 flex items-baseline justify-between">
        <strong class="font-serif text-base text-slate-900">Slovak Wiki</strong>
        <span class="text-xs text-slate-500">{dictionaryEntries.length} words</span>
      </div>

      <nav class="grid gap-1" aria-label="Reference sections">
        <p class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Reference</p>
        <a
          class="grid gap-1 border-l-2 border-slate-200 px-2 py-2 font-serif text-sm text-blue-800 hover:border-blue-600 hover:bg-blue-50"
          href="/grammar"
        >
          <strong>Grammar</strong>
          <span class="text-xs text-slate-500">Rules and patterns →</span>
        </a>
        <a
          class="grid gap-1 border-l-2 border-slate-200 px-2 py-2 font-serif text-sm text-blue-800 hover:border-blue-600 hover:bg-blue-50"
          href="/pronunciation"
        >
          <strong>Pronunciation</strong>
          <span class="text-xs text-slate-500">Sounds and spelling →</span>
        </a>
      </nav>

      <section class="mt-8" aria-labelledby="desktop-topic-heading">
        <p
          id="desktop-topic-heading"
          class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500"
        >
          Topics
        </p>
        <div class="grid gap-1" aria-label="Filter dictionary by topic">
          {#each topicOptions as option (option.value)}
            <button
              class={`flex min-h-9 w-full cursor-pointer items-center justify-between rounded px-2 py-1.5 text-left text-sm ${filterClass(activeCategory === option.value)}`}
              type="button"
              aria-pressed={activeCategory === option.value}
              onclick={() => (activeCategory = option.value)}
            >
              <span>{option.label}</span>
              {#if option.count !== undefined}<small>{option.count}</small>{/if}
            </button>
          {/each}
        </div>
      </section>
    </aside>

    <section
      class="min-w-0 px-8 py-9 pb-20 max-[760px]:px-3.5 max-[760px]:py-8"
      aria-label="Dictionary results"
    >
      <header class="pb-8">
        <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Reference / Dictionary
        </p>
        <h1 class="text-5xl">Dictionary</h1>
        <p class="mt-3 font-serif text-sm text-slate-600">
          Look up Slovak words by topic, letter, or English meaning.
        </p>
      </header>

      <div id="wiki-search-section" class="mb-6">
        <label class="mb-2 block text-sm font-semibold text-slate-700" for="wiki-search">
          Search dictionary words
        </label>
        <div class="flex h-11 items-center border border-slate-300 bg-white">
          <svg class="ml-3 w-4 fill-none stroke-slate-400" aria-hidden="true" viewBox="0 0 24 24">
            <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
          </svg>
          <input
            class="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-0"
            id="wiki-search"
            bind:value={query}
            placeholder="Search in English or Slovak"
            type="search"
          />
          {#if query}
            <button
              class="mr-3 cursor-pointer border-0 bg-transparent text-xs font-semibold text-blue-700"
              type="button"
              aria-label="Clear search"
              onclick={() => (query = "")}
            >
              Clear
            </button>
          {/if}
        </div>
      </div>

      <nav
        class="mb-4 hidden gap-1 overflow-x-auto max-[760px]:flex"
        aria-label="Reference sections"
      >
        <a
          class="shrink-0 rounded border border-slate-200 px-2.5 py-2 text-xs text-blue-800"
          href="/grammar"
        >
          Grammar
        </a>
        <a
          class="shrink-0 rounded border border-slate-200 px-2.5 py-2 text-xs text-blue-800"
          href="/pronunciation"
        >
          Pronunciation
        </a>
      </nav>

      <nav
        class="mb-4 hidden gap-1 overflow-x-auto max-[760px]:flex"
        aria-label="Filter dictionary by topic"
      >
        {#each topicOptions as option (option.value)}
          <button
            class={`shrink-0 rounded border border-slate-200 px-2.5 py-2 text-xs ${filterClass(activeCategory === option.value)}`}
            type="button"
            aria-pressed={activeCategory === option.value}
            onclick={() => (activeCategory = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </nav>

      <nav
        id="wiki-alphabet"
        class="flex gap-0.5 overflow-x-auto border-b border-slate-200 pb-4"
        aria-label="Filter dictionary by first letter"
      >
        {#each letterOptions as option (option.value)}
          <button
            class={`h-8 min-w-8 rounded px-2 text-xs font-semibold ${filterClass(activeLetter === option.value)}`}
            type="button"
            aria-pressed={activeLetter === option.value}
            onclick={() => (activeLetter = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </nav>

      <div class="flex min-h-12 items-center justify-between">
        <p class="m-0 text-xs text-slate-500">
          <strong class="mr-1 text-slate-900">{visibleEntries.length}</strong>
          {visibleEntries.length === 1 ? "result" : "results"}
        </p>
        {#if hasActiveFilters}
          <button
            class="cursor-pointer border-0 bg-transparent text-xs font-semibold text-blue-700"
            type="button"
            onclick={clearFilters}
          >
            Reset filters
          </button>
        {/if}
      </div>

      <div
        class="grid min-h-12 grid-cols-[minmax(160px,.8fr)_minmax(220px,1.25fr)_150px_24px] items-center gap-6 rounded-t border border-slate-300 bg-slate-100 px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-600 max-[760px]:hidden"
        aria-hidden="true"
      >
        <span>Slovak</span>
        <span>English</span>
        <span>Topic</span>
      </div>

      <div id="wiki-results">
        {#if visibleEntries.length}
          <ul
            class="m-0 list-none border border-t-0 border-slate-200 bg-white p-0 max-[760px]:border-t"
            aria-label="Dictionary entries"
          >
            {#each visibleEntries as entry (entry.slug)}
              <li class="border-b border-slate-200 last:border-b-0">
                <a
                  class="grid min-h-16 grid-cols-[minmax(160px,.8fr)_minmax(220px,1.25fr)_150px_24px] items-center gap-6 px-5 py-3 hover:bg-slate-50 max-[760px]:grid-cols-[minmax(0,1fr)_18px] max-[760px]:gap-1.5 max-[760px]:px-3.5"
                  href="/{routeBase[entry.kind]}/{entry.slug}"
                >
                  <span class="font-semibold text-blue-700 max-[760px]:col-start-1" lang="sk">
                    {entry.slovak}
                  </span>
                  <span class="text-[0.95rem] text-slate-900 max-[760px]:col-start-1">
                    {entry.english}
                  </span>
                  <span class="text-xs text-slate-500 max-[760px]:hidden">
                    {entry.category}
                  </span>
                  <svg
                    class="w-4 fill-none stroke-slate-400 max-[760px]:col-start-2 max-[760px]:row-span-2"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </a>
              </li>
            {/each}
          </ul>
        {:else}
          <div
            class="border border-t-0 border-slate-200 px-6 py-[72px] text-center max-[760px]:border-t"
          >
            <h2 class="text-base">No matches</h2>
            <p class="text-sm text-slate-500">Try a shorter search or reset the filters.</p>
            <button
              class="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700"
              type="button"
              onclick={clearFilters}
            >
              Show all entries
            </button>
          </div>
        {/if}
      </div>
    </section>

    <aside
      class={cx(
        contextRail,
        "sticky",
        "top-(--header-height)",
        "h-fit",
        "border-l",
        "border-slate-200",
        "px-4",
        "py-8",
        "pb-12",
        "max-[1100px]:col-start-2",
        "max-[1100px]:grid",
        "max-[1100px]:grid-cols-3",
        "max-[1100px]:gap-6",
        "max-[1100px]:border-l-0",
        "max-[1100px]:border-t",
        "max-[1100px]:px-8",
        "max-[1100px]:py-6",
        "max-[760px]:static",
        "max-[760px]:grid-cols-1",
        "max-[760px]:gap-6",
        "max-[760px]:px-3.5",
      )}
      aria-label="Wiki context"
    >
      <section>
        <p class={railLabel}>On this page</p>
        <nav class="grid">
          <a
            class="border-l-2 border-blue-600 py-1.5 pl-2.5 font-serif text-sm text-blue-800"
            href="#wiki-search-section"
          >
            Search
          </a>
          <a
            class="border-l-2 border-slate-200 py-1.5 pl-2.5 font-serif text-sm text-slate-700 hover:border-blue-600 hover:text-blue-800 hover:underline"
            href="#wiki-alphabet"
          >
            Alphabet
          </a>
          <a
            class="border-l-2 border-slate-200 py-1.5 pl-2.5 font-serif text-sm text-slate-700 hover:border-blue-600 hover:text-blue-800 hover:underline"
            href="#wiki-results"
          >
            Entries
          </a>
        </nav>
      </section>

      <section>
        <p class={railLabel}>Current view</p>
        <dl class="grid gap-3">
          <div>
            <dt class="text-xs uppercase text-slate-500">Reference</dt>
            <dd class="font-serif text-sm text-slate-700">Dictionary</dd>
          </div>
          <div>
            <dt class="text-xs uppercase text-slate-500">Topic</dt>
            <dd class="font-serif text-sm text-slate-700">
              {activeCategory === "all" ? "All topics" : activeCategory}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase text-slate-500">Letter</dt>
            <dd class="font-serif text-sm text-slate-700">
              {activeLetter === "all" ? "Any" : activeLetter}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <p class={railLabel}>Continue</p>
        <nav class="grid">
          <a class="py-1.5 font-serif text-sm text-blue-800 hover:underline" href="/grammar">
            Grammar
          </a>
          <a class="py-1.5 font-serif text-sm text-blue-800 hover:underline" href="/pronunciation">
            Pronunciation
          </a>
          <a class="py-1.5 font-serif text-sm text-blue-800 hover:underline" href="/lessons">
            Lessons
          </a>
          <a class="py-1.5 font-serif text-sm text-blue-800 hover:underline" href="/practice">
            Practice
          </a>
        </nav>
      </section>
    </aside>
  </div>
</main>
