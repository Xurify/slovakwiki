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
  <title>Slovak Wiki — Slovak language reference and lessons</title>
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
        {#each kindFilters as filter (filter.value)}
          <button
            aria-pressed={activeKind === filter.value}
            class={activeKind === filter.value ? "active" : ""}
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
          class={activeCategory === "all" ? "active" : ""}
          type="button"
          onclick={() => (activeCategory = "all")}
        >
          <span>All topics</span>
        </button>
        {#each categories as [ category, count ] (category)}
          <button
            aria-pressed={activeCategory === category}
            class={activeCategory === category ? "active" : ""}
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

      <div class="search-area" id="wiki-search-section">
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
        {#each kindFilters as filter (filter.value)}
          <button
            aria-pressed={activeKind === filter.value}
            class={activeKind === filter.value ? "active" : ""}
            type="button"
            onclick={() => selectKind(filter.value)}
          >
            {filter.label}
          </button>
        {/each}
      </nav>

      <nav class="mobile-topics" aria-label="Topics">
        <button
          aria-pressed={activeCategory === "all"}
          class={activeCategory === "all" ? "active" : ""}
          type="button"
          onclick={() => (activeCategory = "all")}
        >
          All topics
        </button>
        {#each categories as [category] (category)}
          <button
            aria-pressed={activeCategory === category}
            class={activeCategory === category ? "active" : ""}
            type="button"
            onclick={() => (activeCategory = category)}
          >
            {category}
          </button>
        {/each}
      </nav>

      <nav class="alphabet" id="wiki-alphabet" aria-label="Filter by first letter">
        <button
          aria-pressed={activeLetter === "all"}
          class={activeLetter === "all" ? "active" : ""}
          type="button"
          onclick={() => (activeLetter = "all")}
        >
          All
        </button>
        {#each availableLetters as letter (letter)}
          <button
            aria-pressed={activeLetter === letter}
            class={activeLetter === letter ? "active" : ""}
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
        <div class="results" id="wiki-results">
          {#each visibleEntries as entry (entry.slug)}
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

    <aside class="context-rail" aria-label="Wiki context">
      <section>
        <p class="rail-label">On this page</p>
        <nav aria-label="Wiki page sections">
          <a href="#wiki-search-section">Search</a>
          <a href="#wiki-alphabet">Alphabet</a>
          <a href="#wiki-results">Entries</a>
        </nav>
      </section>

      <section>
        <p class="rail-label">Current view</p>
        <dl>
          <div>
            <dt>Type</dt>
            <dd>{kindFilters.find((filter) => filter.value === activeKind)?.label}</dd>
          </div>
          <div>
            <dt>Topic</dt>
            <dd>{activeCategory === "all" ? "All topics" : activeCategory}</dd>
          </div>
          <div>
            <dt>Letter</dt>
            <dd>{activeLetter === "all" ? "Any" : activeLetter}</dd>
          </div>
        </dl>
      </section>

      <section>
        <p class="rail-label">Continue</p>
        <nav aria-label="Continue learning">
          <a href="/learn">Beginner path</a>
          <a href="/quiz">Vocabulary quiz</a>
        </nav>
      </section>
    </aside>
  </div>
</main>

<style>
  .reference {
    min-height: calc(100vh - 58px);
    background: transparent;
  }

  .reference-shell {
    display: grid;
    width: 100%;
    grid-template-columns: 215px minmax(0, 1fr) 205px;
    margin: 0 auto;
  }

  .sidebar {
    position: sticky;
    top: var(--header-height);
    height: calc(100vh - var(--header-height) - 28px);
    overflow-y: auto;
    padding: 30px 18px 48px 20px;
    border-right: 1px solid var(--line);
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
    color: var(--muted);
    font-size: 0.7rem;
  }

  .nav-label {
    margin: 0 0 8px;
    color: var(--muted);
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
    min-height: 36px;
    padding: 7px 9px;
    border: 0;
    border-radius: 2px;
    background: transparent;
    color: var(--muted-strong);
    cursor: pointer;
    font-size: 0.82rem;
    text-align: left;
  }

  .sidebar button:hover {
    background: var(--surface-subtle);
    color: var(--ink);
  }

  .sidebar button.active {
    box-shadow: inset 3px 0 var(--blue);
    background: var(--surface-selected);
    color: var(--blue);
    font-weight: 680;
  }

  .content {
    min-width: 0;
    padding: 38px 32px 78px;
  }

  .content-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    padding-bottom: 32px;
  }

  .breadcrumb {
    margin: 0 0 18px;
    color: var(--blue);
    font-size: 0.73rem;
    font-weight: 680;
  }

  h1 {
    margin: 0;
    font-size: clamp(2.35rem, 4vw, 3.35rem);
    font-weight: 720;
    letter-spacing: -0.045em;
    line-height: 1;
  }

  .content-header p:last-child {
    margin: 12px 0 0;
    color: var(--muted);
    font-family: var(--font-reading);
    font-size: 0.92rem;
  }

  .search-area {
    margin-bottom: 26px;
  }

  .search-area > label {
    display: block;
    margin-bottom: 8px;
    color: var(--muted-strong);
    font-size: 0.76rem;
    font-weight: 650;
  }

  .search-control {
    position: relative;
    display: flex;
    height: 44px;
    align-items: center;
    border: 1px solid var(--line-strong);
    border-radius: 0;
    background: var(--surface);
  }

  .search-control:focus-within {
    border-color: var(--blue);
  }

  .search-control svg {
    width: 18px;
    margin-left: 13px;
    fill: none;
    stroke: var(--muted);
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
    color: var(--blue);
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 650;
  }

  .mobile-kinds,
  .mobile-topics {
    display: none;
  }

  .alphabet {
    display: flex;
    overflow-x: auto;
    gap: 2px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--line);
  }

  .alphabet button {
    min-width: 30px;
    height: 30px;
    padding: 0 7px;
    border: 0;
    border-radius: 2px;
    background: transparent;
    color: var(--blue);
    cursor: pointer;
    font-size: 0.76rem;
    font-weight: 650;
  }

  .alphabet button:hover {
    background: var(--surface-subtle);
  }

  .alphabet button.active {
    background: var(--blue);
    color: white;
  }

  .results-toolbar {
    display: flex;
    min-height: 50px;
    align-items: center;
    justify-content: space-between;
  }

  .results-toolbar p {
    margin: 0;
    color: var(--muted);
    font-size: 0.76rem;
  }

  .results-toolbar strong {
    margin-right: 4px;
    color: var(--ink);
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
    border: 1px solid var(--line);
    border-radius: 0;
    background: var(--surface-subtle);
    color: var(--muted);
    font-size: 0.66rem;
    font-weight: 720;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .results {
    border: 1px solid var(--line);
    border-top: 0;
    border-radius: 0;
    background: var(--surface);
  }

  .context-rail {
    position: sticky;
    top: var(--header-height);
    min-width: 0;
    height: fit-content;
    padding: 30px 20px 48px 16px;
    border-left: 1px solid var(--line);
  }

  .context-rail section + section {
    margin-top: 30px;
  }

  .rail-label {
    margin: 0 0 10px;
    color: var(--muted);
    font-size: 0.62rem;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .context-rail nav {
    display: grid;
    border-left: 2px solid var(--line);
  }

  .context-rail nav a {
    padding: 5px 0 5px 10px;
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-size: 0.8rem;
  }

  .context-rail nav a:first-child {
    border-left: 2px solid var(--accent);
    margin-left: -2px;
  }

  .context-rail nav a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .context-rail dl {
    display: grid;
    gap: 10px;
    margin: 0;
  }

  .context-rail dl div {
    display: grid;
    gap: 2px;
  }

  .context-rail dt {
    color: var(--muted);
    font-size: 0.62rem;
    text-transform: uppercase;
  }

  .context-rail dd {
    overflow: hidden;
    margin: 0;
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: 0.8rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result {
    min-height: 58px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--line);
  }

  .result:last-child {
    border-bottom: 0;
  }

  .result:hover {
    background: var(--surface-subtle);
  }

  .slovak {
    color: var(--blue);
    font-size: 0.96rem;
    font-weight: 690;
  }

  .english {
    color: var(--ink);
    font-size: 0.84rem;
  }

  .type {
    color: var(--muted);
    font-size: 0.72rem;
    text-transform: capitalize;
  }

  .result svg {
    width: 16px;
    fill: none;
    stroke: var(--muted);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .empty {
    padding: 72px 24px;
    border: 1px solid var(--line);
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
    color: var(--muted);
    font-size: 0.84rem;
  }

  .empty button {
    padding: 8px 12px;
    border: 1px solid var(--line-strong);
    border-radius: 2px;
    background: transparent;
    color: var(--blue);
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 650;
  }

  @media (max-width: 1100px) {
    .reference-shell {
      grid-template-columns: 215px minmax(0, 1fr);
    }

    .context-rail {
      position: static;
      display: grid;
      grid-column: 2;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 24px;
      padding: 24px 32px 42px;
      border-top: 1px solid var(--line);
      border-left: 0;
    }

    .context-rail section + section {
      margin-top: 0;
    }
  }

  @media (max-width: 760px) {
    .reference-shell {
      display: block;
      width: 100%;
    }

    .sidebar {
      display: none;
    }

    .content {
      padding: 32px 14px 58px;
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

    .mobile-kinds,
    .mobile-topics {
      display: flex;
      overflow-x: auto;
      gap: 5px;
      margin-bottom: 16px;
      padding-bottom: 2px;
      scrollbar-width: none;
    }

    .mobile-kinds::-webkit-scrollbar,
    .mobile-topics::-webkit-scrollbar,
    .alphabet::-webkit-scrollbar {
      display: none;
    }

    .mobile-kinds button,
    .mobile-topics button {
      flex: 0 0 auto;
      min-height: 36px;
      padding: 7px 10px;
      border: 1px solid var(--line);
      border-radius: 2px;
      background: transparent;
      color: var(--muted-strong);
      font-size: 0.74rem;
    }

    .mobile-kinds button.active,
    .mobile-topics button.active {
      border-color: var(--blue);
      background: var(--blue);
      color: white;
    }

    .mobile-topics {
      margin-top: -7px;
    }

    .alphabet {
      padding-bottom: 14px;
      scrollbar-width: none;
    }

    .table-head {
      display: none;
    }

    .results {
      border-top: 1px solid var(--line);
      border-radius: 0;
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
      color: var(--muted);
      font-size: 0.78rem;
    }

    .type {
      display: none;
    }

    .result svg {
      grid-column: 2;
      grid-row: 1 / 3;
    }

    .context-rail {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 26px 14px 40px;
    }
  }
</style>
