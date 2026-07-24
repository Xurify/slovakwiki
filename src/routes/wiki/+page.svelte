<script lang="ts">
  import { allEntries } from "$lib/content/data";
  import type { EntryKind } from "$lib/content/types";

  type KindFilter = "all" | EntryKind;

  const kindFilters: { label: string; value: KindFilter }[] = [
    { label: "All content", value: "all" },
    { label: "Dictionary", value: "word" },
    { label: "Grammar", value: "grammar" },
    { label: "Pronunciation", value: "pronunciation" },
  ];

  const routeBase: Record<EntryKind, string> = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };

  const categoryCounts = new Map<string, number>();
  for (const entry of allEntries) {
    categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
  }
  const categories = [...categoryCounts].toSorted(([first], [second]) =>
    first.localeCompare(second)
  );

  const normalize = (value: string): string =>
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase();

  let activeKind = $state<KindFilter>("all");
  let activeCategory = $state("all");
  let activeLetter = $state("all");
  let query = $state("");

  let kindEntries = $derived(
    allEntries.filter((entry) => activeKind === "all" || entry.kind === activeKind)
  );

  let availableLetters = $derived(
    [
      ...new Set(
        kindEntries.map((entry) => entry.slovak.at(0)?.toLocaleUpperCase("sk") ?? "#")
      ),
    ].toSorted((first, second) => first.localeCompare(second, "sk"))
  );

  let visibleEntries = $derived(
    kindEntries
      .filter((entry) => activeCategory === "all" || entry.category === activeCategory)
      .filter(
        (entry) =>
          activeLetter === "all" ||
          entry.slovak.at(0)?.toLocaleUpperCase("sk") === activeLetter
      )
      .filter((entry) => {
        const needle = normalize(query.trim());
        if (!needle) {
          return true;
        }
        return normalize(
          `${entry.slovak} ${entry.english} ${entry.category} ${entry.tags.join(" ")}`
        ).includes(needle);
      })
      .toSorted((first, second) => first.slovak.localeCompare(second.slovak, "sk"))
  );

  function clearFilters(): void {
    activeKind = "all";
    activeCategory = "all";
    activeLetter = "all";
    query = "";
  }

  function selectKind(kind: KindFilter): void {
    activeKind = kind;
    activeCategory = "all";
    activeLetter = "all";
  }
</script>

<svelte:head>
  <title>Slovak Wiki | Slovak Atlas</title>
  <meta
    name="description"
    content="Search Slovak words, grammar notes, and pronunciation guides."
  >
</svelte:head>

<main class="reference">
  <div class="reference-shell">
    <aside class="sidebar">
      <div class="sidebar-title">
        <strong>Slovak Wiki</strong>
        <span>{allEntries.length} articles</span>
      </div>

      <nav aria-label="Content type">
        <p class="nav-label">Browse</p>
        {#each kindFilters as filter}
          <button
            aria-pressed={activeKind === filter.value}
            class:active={activeKind === filter.value}
            type="button"
            onclick={() => selectKind(filter.value)}
          >
            <span>{filter.label}</span>
            <small>
              {filter.value === "all"
                ? allEntries.length
                : allEntries.filter((entry) => entry.kind === filter.value).length}
            </small>
          </button>
        {/each}
      </nav>

      <nav class="topics" aria-label="Topics">
        <p class="nav-label">Topics</p>
        <button
          aria-pressed={activeCategory === "all"}
          class:active={activeCategory === "all"}
          type="button"
          onclick={() => (activeCategory = "all")}
        >
          <span>All topics</span>
        </button>
        {#each categories as [ category, count ]}
          <button
            aria-pressed={activeCategory === category}
            class:active={activeCategory === category}
            type="button"
            onclick={() => (activeCategory = category)}
          >
            <span>{category}</span>
            <small>{count}</small>
          </button>
        {/each}
      </nav>
    </aside>

    <section class="content">
      <header class="content-header">
        <div>
          <p class="breadcrumb">Reference / Slovak</p>
          <h1>Wiki</h1>
          <p>Words, grammar, and pronunciation for English speakers.</p>
        </div>
      </header>

      <div class="search-area">
        <label for="wiki-search">Search all entries</label>
        <div class="search-control">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
          </svg>
          <input
            id="wiki-search"
            bind:value={query}
            placeholder="Search in English or Slovak"
            type="search"
          >
          {#if query}
            <button type="button" aria-label="Clear search" onclick={() => (query = "")}>
              Clear
            </button>
          {/if}
        </div>
      </div>

      <nav class="mobile-kinds" aria-label="Content type">
        {#each kindFilters as filter}
          <button
            aria-pressed={activeKind === filter.value}
            class:active={activeKind === filter.value}
            type="button"
            onclick={() => selectKind(filter.value)}
          >
            {filter.label}
          </button>
        {/each}
      </nav>

      <nav class="alphabet" aria-label="Filter by first letter">
        <button
          aria-pressed={activeLetter === "all"}
          class:active={activeLetter === "all"}
          type="button"
          onclick={() => (activeLetter = "all")}
        >
          All
        </button>
        {#each availableLetters as letter}
          <button
            aria-pressed={activeLetter === letter}
            class:active={activeLetter === letter}
            type="button"
            onclick={() => (activeLetter = letter)}
          >
            {letter}
          </button>
        {/each}
      </nav>

      <div class="results-toolbar">
        <p aria-atomic="true" aria-live="polite">
          <strong>{visibleEntries.length}</strong>
          {visibleEntries.length === 1 ? "result" : "results"}
        </p>
        {#if activeKind !== "all" || activeCategory !== "all" || activeLetter !== "all" || query}
          <button type="button" onclick={clearFilters}>Reset filters</button>
        {/if}
      </div>

      <div class="table-head" aria-hidden="true">
        <span>Slovak</span>
        <span>English</span>
        <span>Type</span>
      </div>

      {#if visibleEntries.length}
        <div class="results">
          {#each visibleEntries as entry}
            <a class="result" href="/{routeBase[entry.kind]}/{entry.slug}">
              <span class="slovak" lang="sk">{entry.slovak}</span>
              <span class="english">{entry.english}</span>
              <span class="type">
                {entry.kind === "word" ? entry.category : entry.kind}
              </span>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
          {/each}
        </div>
      {:else}
        <div class="empty">
          <h2>No matches</h2>
          <p>Try a shorter search or reset the filters.</p>
          <button type="button" onclick={clearFilters}>Show all entries</button>
        </div>
      {/if}
    </section>
  </div>
</main>

<style>
  :global(body) {
    background: oklch(0.985 0.002 250);
  }

  .reference {
    min-height: calc(100vh - 64px);
    background: oklch(0.985 0.002 250);
    color: oklch(0.23 0.012 255);
    font-family:
      Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .reference-shell {
    display: grid;
    width: min(1280px, calc(100% - 48px));
    grid-template-columns: 232px minmax(0, 1fr);
    margin: 0 auto;
  }

  .sidebar {
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    overflow-y: auto;
    padding: 34px 28px 48px 0;
    border-right: 1px solid oklch(0.9 0.006 250);
  }

  .sidebar-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 34px;
  }

  .sidebar-title strong {
    font-size: 0.94rem;
  }

  .sidebar-title span,
  .sidebar small {
    color: oklch(0.55 0.015 255);
    font-size: 0.7rem;
  }

  .nav-label {
    margin: 0 0 8px;
    color: oklch(0.5 0.02 255);
    font-size: 0.67rem;
    font-weight: 720;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .sidebar nav + nav {
    margin-top: 32px;
  }

  .sidebar button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 7px 10px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: oklch(0.39 0.018 255);
    cursor: pointer;
    font-size: 0.82rem;
    text-align: left;
  }

  .sidebar button:hover {
    background: oklch(0.96 0.006 250);
    color: oklch(0.23 0.012 255);
  }

  .sidebar button.active {
    background: oklch(0.94 0.025 250);
    color: oklch(0.42 0.14 255);
    font-weight: 680;
  }

  .content {
    min-width: 0;
    padding: 52px 0 96px 56px;
  }

  .content-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    padding-bottom: 32px;
  }

  .breadcrumb {
    margin: 0 0 18px;
    color: oklch(0.51 0.1 255);
    font-size: 0.73rem;
    font-weight: 680;
  }

  h1 {
    margin: 0;
    color: oklch(0.19 0.01 255);
    font-family: inherit;
    font-size: clamp(2.4rem, 4vw, 3.5rem);
    font-weight: 720;
    letter-spacing: -0.045em;
    line-height: 1;
  }

  .content-header p:last-child {
    margin: 12px 0 0;
    color: oklch(0.5 0.018 255);
    font-size: 0.92rem;
  }

  .search-area {
    margin-bottom: 26px;
  }

  .search-area > label {
    display: block;
    margin-bottom: 8px;
    color: oklch(0.36 0.02 255);
    font-size: 0.76rem;
    font-weight: 650;
  }

  .search-control {
    position: relative;
    display: flex;
    height: 44px;
    align-items: center;
    border: 1px solid oklch(0.82 0.012 255);
    border-radius: 6px;
    background: oklch(0.998 0.001 250);
  }

  .search-control:focus-within {
    border-color: oklch(0.51 0.14 255);
    box-shadow: 0 0 0 3px oklch(0.91 0.04 250);
  }

  .search-control svg {
    width: 18px;
    margin-left: 13px;
    fill: none;
    stroke: oklch(0.48 0.02 255);
    stroke-linecap: round;
    stroke-width: 1.8;
  }

  .search-control input {
    min-width: 0;
    flex: 1;
    padding: 0 12px;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font-size: 0.88rem;
  }

  .search-control button,
  .results-toolbar button {
    margin-right: 12px;
    border: 0;
    background: transparent;
    color: oklch(0.47 0.13 255);
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 650;
  }

  .mobile-kinds {
    display: none;
  }

  .alphabet {
    display: flex;
    overflow-x: auto;
    gap: 2px;
    padding-bottom: 18px;
    border-bottom: 1px solid oklch(0.87 0.008 255);
  }

  .alphabet button {
    min-width: 30px;
    height: 30px;
    padding: 0 7px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: oklch(0.44 0.06 255);
    cursor: pointer;
    font-size: 0.76rem;
    font-weight: 650;
  }

  .alphabet button:hover {
    background: oklch(0.95 0.01 250);
  }

  .alphabet button.active {
    background: oklch(0.47 0.15 255);
    color: oklch(0.985 0.002 250);
  }

  .results-toolbar {
    display: flex;
    min-height: 50px;
    align-items: center;
    justify-content: space-between;
  }

  .results-toolbar p {
    margin: 0;
    color: oklch(0.5 0.018 255);
    font-size: 0.76rem;
  }

  .results-toolbar strong {
    margin-right: 4px;
    color: oklch(0.24 0.012 255);
  }

  .table-head,
  .result {
    display: grid;
    grid-template-columns: minmax(160px, 0.8fr) minmax(220px, 1.25fr) 150px 24px;
    align-items: center;
    gap: 24px;
  }

  .table-head {
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid oklch(0.87 0.008 255);
    border-radius: 5px 5px 0 0;
    background: oklch(0.965 0.006 250);
    color: oklch(0.5 0.018 255);
    font-size: 0.66rem;
    font-weight: 720;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .results {
    border: 1px solid oklch(0.87 0.008 255);
    border-top: 0;
    border-radius: 0 0 5px 5px;
    background: oklch(0.998 0.001 250);
  }

  .result {
    min-height: 58px;
    padding: 8px 14px;
    border-bottom: 1px solid oklch(0.9 0.006 250);
  }

  .result:last-child {
    border-bottom: 0;
  }

  .result:hover {
    background: oklch(0.965 0.018 250);
  }

  .slovak {
    color: oklch(0.4 0.14 255);
    font-size: 0.96rem;
    font-weight: 690;
  }

  .english {
    color: oklch(0.3 0.012 255);
    font-size: 0.84rem;
  }

  .type {
    color: oklch(0.53 0.018 255);
    font-size: 0.72rem;
    text-transform: capitalize;
  }

  .result svg {
    width: 16px;
    fill: none;
    stroke: oklch(0.61 0.02 255);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .empty {
    padding: 72px 24px;
    border: 1px solid oklch(0.87 0.008 255);
    border-top: 0;
    text-align: center;
  }

  .empty h2 {
    margin: 0;
    font-family: inherit;
    font-size: 1rem;
  }

  .empty p {
    margin: 8px 0 18px;
    color: oklch(0.5 0.018 255);
    font-size: 0.84rem;
  }

  .empty button {
    padding: 8px 12px;
    border: 1px solid oklch(0.75 0.03 255);
    border-radius: 5px;
    background: transparent;
    color: oklch(0.42 0.14 255);
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 650;
  }

  @media (max-width: 760px) {
    .reference-shell {
      display: block;
      width: min(100% - 28px, 620px);
    }

    .sidebar {
      display: none;
    }

    .content {
      padding: 36px 0 72px;
    }

    .content-header {
      padding-bottom: 26px;
    }

    .breadcrumb {
      margin-bottom: 12px;
    }

    h1 {
      font-size: 2.55rem;
    }

    .mobile-kinds {
      display: flex;
      overflow-x: auto;
      gap: 5px;
      margin-bottom: 16px;
      padding-bottom: 2px;
    }

    .mobile-kinds button {
      flex: 0 0 auto;
      padding: 7px 10px;
      border: 1px solid oklch(0.84 0.012 255);
      border-radius: 5px;
      background: transparent;
      color: oklch(0.44 0.02 255);
      font-size: 0.74rem;
    }

    .mobile-kinds button.active {
      border-color: oklch(0.47 0.15 255);
      background: oklch(0.47 0.15 255);
      color: oklch(0.985 0.002 250);
    }

    .alphabet {
      padding-bottom: 14px;
    }

    .table-head {
      display: none;
    }

    .results {
      border-top: 1px solid oklch(0.87 0.008 255);
      border-radius: 5px;
    }

    .result {
      grid-template-columns: minmax(0, 1fr) 18px;
      gap: 2px 10px;
      min-height: 64px;
    }

    .slovak {
      grid-column: 1;
      font-size: 0.94rem;
    }

    .english {
      grid-column: 1;
      color: oklch(0.48 0.018 255);
      font-size: 0.78rem;
    }

    .type {
      display: none;
    }

    .result svg {
      grid-column: 2;
      grid-row: 1 / 3;
    }
  }
</style>
