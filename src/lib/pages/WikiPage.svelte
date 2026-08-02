<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { allEntries } from "$lib/content/data";
  import type { EntryKind } from "$lib/content/types";

  const routeBase: Record<EntryKind, string> = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };

  const MASS_CATEGORIES = new Set(["Verbs", "Nouns", "Adjectives", "Names", "Places"]);
  const PAGE_SIZE = 60;

  const dictionaryEntries = allEntries.filter((entry) => entry.kind === "word");
  const categoryCounts = new Map<string, number>();

  for (const entry of dictionaryEntries) {
    categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
  }

  const curatedCategories = [...categoryCounts]
    .filter(([category]) => !MASS_CATEGORIES.has(category))
    .toSorted(([first], [second]) => first.localeCompare(second));
  const massCategories = [...categoryCounts]
    .filter(([category]) => MASS_CATEGORIES.has(category))
    .toSorted(([first], [second]) => first.localeCompare(second));

  const featuredCount = dictionaryEntries.filter(
    (entry) => entry.origin === "curated",
  ).length;

  const availableLetters = [
    ...new Set(
      dictionaryEntries.map(
        (entry) => entry.slovak.at(0)?.toLocaleUpperCase("sk") ?? "#",
      ),
    ),
  ].toSorted((first, second) => first.localeCompare(second, "sk"));

  const topicOptions = [
    { value: "featured", label: "Featured", count: featuredCount },
    ...curatedCategories.map(([category, count]) => ({
      value: category,
      label: category,
      count,
    })),
    { value: "all", label: "All words", count: dictionaryEntries.length },
    ...massCategories.map(([category, count]) => ({
      value: category,
      label: category,
      count,
    })),
  ];
  const letterOptions = [
    { value: "all", label: "All" },
    ...availableLetters.map((letter) => ({ value: letter, label: letter })),
  ];

  let activeCategory = $state("featured");
  let activeLetter = $state("all");
  let query = $state("");
  let visibleLimit = $state(PAGE_SIZE);

  const filteredEntries = $derived(
    dictionaryEntries
      .filter((entry) => {
        if (activeCategory === "all") return true;
        if (activeCategory === "featured") return entry.origin === "curated";
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
          normalize(
            `${entry.slovak} ${entry.english} ${entry.category} ${entry.tags.join(" ")}`,
          ).includes(needle)
        );
      })
      .toSorted((first, second) => first.slovak.localeCompare(second.slovak, "sk")),
  );

  const visibleEntries = $derived(filteredEntries.slice(0, visibleLimit));
  const hasMore = $derived(filteredEntries.length > visibleLimit);
  const hasActiveFilters = $derived(
    activeCategory !== "featured" || activeLetter !== "all" || Boolean(query),
  );

  function normalize(value: string): string {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase();
  }

  function clearFilters(): void {
    activeCategory = "featured";
    activeLetter = "all";
    query = "";
    visibleLimit = PAGE_SIZE;
  }

  function setCategory(value: string): void {
    activeCategory = value;
    visibleLimit = PAGE_SIZE;
  }

  function setLetter(value: string): void {
    activeLetter = value;
    visibleLimit = PAGE_SIZE;
  }

  function chipClass(active: boolean): string {
    return active
      ? "border-blue-800 bg-blue-800 text-white"
      : "border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:text-slate-900";
  }

  const rowLinkClass =
    "group flex items-start justify-between gap-4 border-b border-slate-200 -mx-4 px-4 py-3.5 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_55%,transparent)]";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <header class="max-w-[640px]">
      <Eyebrow>Reference</Eyebrow>
      <h1>Dictionary</h1>
      <Lead>
        Start with curated essentials, or browse the full list by letter and topic. For
        frequency-ranked lemmas, open Most common.
      </Lead>
      <p class="mt-4 text-sm text-slate-500">
        Also browse the
        <TextLink href="/dictionary/common"
          >most common verbs, nouns, and adjectives</TextLink
        >.
      </p>
    </header>

    <div class="mt-10" id="wiki-search-section">
      <label class="sr-only" for="wiki-search">Search dictionary words</label>
      <div
        class="flex min-h-[50px] items-stretch overflow-hidden rounded-(--control-radius) border border-slate-300 bg-white/90 shadow-(--shadow-border) transition-[box-shadow,border-color] focus-within:border-blue-600 focus-within:shadow-[0_0_0_4px_var(--accent-soft)]"
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
          oninput={() => (visibleLimit = PAGE_SIZE)}
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
              visibleLimit = PAGE_SIZE;
            }}
          >
            Clear
          </button>
        {/if}
      </div>
    </div>

    <nav class="mt-6 flex flex-wrap gap-1.5" aria-label="Filter dictionary by topic">
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
      class="mt-8 flex min-h-10 items-center justify-between gap-4 border-b border-slate-200 pb-3"
    >
      <p class="m-0 text-sm text-slate-500">
        <strong class="tabular-nums text-slate-900">{filteredEntries.length}</strong>
        {filteredEntries.length === 1 ? "result" : "results"}
        {#if hasMore}
          <span class="text-slate-400">
            · showing {visibleEntries.length}
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
              <a class={rowLinkClass} href="/{routeBase[entry.kind]}/{entry.slug}">
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

        {#if hasMore}
          <div class="mt-6 flex justify-center">
            <Button type="button" onclick={() => (visibleLimit += PAGE_SIZE)}>
              Show more
            </Button>
          </div>
        {/if}
      {:else}
        <div class="py-16 text-center">
          <h2 class="text-xl">No matches</h2>
          <p class="mt-2 text-sm text-slate-500">
            Try a shorter search or reset the filters.
          </p>
          <Button class="mt-4" type="button" onclick={clearFilters}>
            Show featured entries
          </Button>
        </div>
      {/if}
    </div>

    <nav
      class="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-8 text-sm"
      aria-label="Other reference"
    >
      <TextLink href="/dictionary/common">Most common</TextLink>
      <TextLink href="/grammar">Grammar</TextLink>
      <TextLink href="/pronunciation">Pronunciation</TextLink>
      <TextLink href="/grammar/terms">Language terms</TextLink>
      <TextLink href="/references">References</TextLink>
      <TextLink href="/lessons">Lessons</TextLink>
    </nav>
  </PageShell>
</main>
