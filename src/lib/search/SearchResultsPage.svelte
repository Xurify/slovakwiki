<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import { chipClass, panelClass } from "$lib/components/ui/system-ui";
  import { wordCategoryLabel } from "$lib/catalog/search/pronouns";
  import type { SearchTopic } from "$lib/catalog/search/topics";
  import { normalizeSearchText } from "$lib/catalog/search/ui";
  import { cx } from "$lib/ui/classes";

  import {
    dictionaryEntryHref,
    loadPreparedIndex,
    type PreparedEntry,
  } from "./dictionary-lookup";
  import { suggestSpelling, type SpellingCandidate } from "./did-you-mean";
  import MarkedText from "./MarkedText.svelte";
  import {
    getPagefind,
    type PagefindResultData,
    type PagefindSearchResult,
  } from "./pagefind-client";
  import {
    clearRecentQueries,
    pushRecentQuery,
    readRecentQueries,
    type RecentQuery,
  } from "./recent-queries";
  import SearchBestMatch from "./SearchBestMatch.svelte";
  import {
    clearSearchHistory,
    pushSearchHistory,
    readSearchHistory,
    type SearchHistoryItem,
    type SearchVisit,
  } from "./search-history";
  import SearchIdle from "./SearchIdle.svelte";
  import SearchSkeleton from "./SearchSkeleton.svelte";
  import {
    buildSpellingCandidates,
    buildWordResults,
    groupTopicHits,
    namedTopicHits,
    parseExamplesMeta,
    pickExample,
    usesWholeWord,
    wordMetaLabel,
    type ExampleMatch,
    type TopicRow,
    type WordResults,
  } from "./search-page-model";
  import {
    dividedListClass,
    inlineLinkClass,
    rowLinkClass,
    sectionLabelClass,
  } from "./search-results-ui";

  let { topics }: { topics: SearchTopic[] } = $props();

  type Filter = "all" | "words" | "topics" | "examples";

  interface ExampleItem {
    category?: string;
    example: ExampleMatch | null;
    summary: string;
    title: string;
    url: string;
  }

  const TYPE_DELAY_MS = 250;
  const EXAMPLE_PREVIEW = 3;
  const EXAMPLE_PAGE = 20;
  const TOPIC_LIMIT = 12;
  const TOPIC_KINDS = [
    "grammar",
    "case",
    "pronunciation",
    "lesson",
    "listening",
    "practice",
  ];

  let mounted = $state(false);
  let query = $state("");
  let activeQuery = $state("");
  let corrected = $state<{ from: string; to: string } | null>(null);
  let suggestion = $state<string | null>(null);
  let filter = $state<Filter>("all");

  let wordResults = $state.raw<WordResults>({ best: null, others: [] });
  let topicRows = $state.raw<TopicRow[]>([]);
  let exampleHits = $state.raw<PagefindSearchResult[]>([]);
  let examples = $state.raw<ExampleItem[]>([]);
  let examplesExhausted = $state(false);
  let loadingExamples = $state(false);
  let pagefindPending = $state(false);
  /** Only the first search waits on the dictionary index; later ones match instantly. */
  let wordsPending = $state(false);
  let pagefindUnavailable = $state(false);

  let recentQueries = $state<RecentQuery[]>([]);
  let viewed = $state<SearchHistoryItem[]>([]);

  let inputEl = $state<HTMLInputElement>();
  let resultsEl = $state<HTMLDivElement>();

  let dictionary: PreparedEntry[] | null = null;
  let spellingCandidates: SpellingCandidate[] | null = null;
  let exampleCursor = 0;
  let generation = 0;
  let typeTimer: ReturnType<typeof setTimeout> | undefined;

  const shownQuery = $derived(corrected?.to ?? activeQuery);

  const coveredUrls = $derived(
    new Set([
      ...(wordResults.best?.entry ? [dictionaryEntryHref(wordResults.best.entry)] : []),
      ...wordResults.others.flatMap((other) =>
        other.type === "word" ? [dictionaryEntryHref(other.match.entry)] : [],
      ),
    ]),
  );

  const leadTopic = $derived(
    wordResults.best?.type === "pronoun"
      ? topicRows.find((row) => row.key === wordResults.best?.pronoun.topicId)
      : undefined,
  );
  /** The best-match card already links its own topic; don't list it again below. */
  const listedTopicRows = $derived(
    filter === "topics" ? topicRows : topicRows.filter((row) => row !== leadTopic),
  );

  const wordCount = $derived((wordResults.best ? 1 : 0) + wordResults.others.length);
  const exampleCount = $derived(
    examplesExhausted
      ? examples.length
      : Math.max(examples.length, exampleHits.length - coveredUrls.size),
  );
  const totalCount = $derived(wordCount + topicRows.length + exampleCount);
  const nothingFound = $derived(totalCount === 0 && !pagefindPending);

  const visibleExamples = $derived(
    filter === "examples" ? examples : examples.slice(0, EXAMPLE_PREVIEW),
  );

  const filters = $derived<Array<{ count: number; id: Filter; label: string }>>([
    { id: "all", label: "All", count: totalCount },
    { id: "words", label: "Words", count: wordCount },
    { id: "topics", label: "Grammar & lessons", count: topicRows.length },
    { id: "examples", label: "In examples", count: exampleCount },
  ]);

  const shows = (section: Exclude<Filter, "all">): boolean =>
    filter === "all" || filter === section;

  const fieldClass = cx(
    "flex min-h-[52px] items-stretch overflow-hidden rounded-[4px] border-[1.5px] border-brand bg-surface",
    "transition-[box-shadow] duration-150 ease-out focus-within:shadow-[0_0_0_3px_var(--accent-soft)]",
  );

  const rowClass = "flex items-baseline justify-between gap-3 py-3";

  function syncUrl(value: string, spellOff: boolean): void {
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (value && spellOff) params.set("spell", "off");
    const search = params.toString();
    history.replaceState(history.state, "", search ? `/search?${search}` : "/search");
    document.title = value ? `${value} — Search | Slovak Wiki` : "Search | Slovak Wiki";
  }

  async function ensureDictionary(): Promise<PreparedEntry[]> {
    if (dictionary) return dictionary;
    try {
      dictionary = await loadPreparedIndex();
    } catch {
      return [];
    }
    return dictionary;
  }

  async function searchPagefind(
    normalized: string,
  ): Promise<{ examples: PagefindSearchResult[]; topics: PagefindResultData[] } | null> {
    const api = await getPagefind();
    if (!api) return null;

    try {
      const [words, others] = await Promise.all([
        api.search(normalized, { filters: { kind: "word" } }),
        api.search(normalized, { filters: { kind: { any: TOPIC_KINDS } } }),
      ]);
      const topicData = await Promise.all(
        others.results.slice(0, TOPIC_LIMIT).map((result) => result.data()),
      );
      return { examples: words.results, topics: topicData };
    } catch {
      return null;
    }
  }

  function resetResults(): void {
    wordResults = { best: null, others: [] };
    topicRows = [];
    exampleHits = [];
    examples = [];
    exampleCursor = 0;
    examplesExhausted = false;
    loadingExamples = false;
    suggestion = null;
    corrected = null;
    filter = "all";
  }

  /** `remember` stores the query once it resolves, so a corrected typo is saved as the fix. */
  async function runSearch(
    raw: string,
    { spell = true, remember = false } = {},
  ): Promise<void> {
    const value = raw.trim();
    const current = ++generation;
    clearTimeout(typeTimer);
    syncUrl(value, !spell);
    resetResults();
    activeQuery = value;

    if (!value) {
      pagefindPending = false;
      wordsPending = false;
      return;
    }

    wordsPending = dictionary === null;
    const index = await ensureDictionary();
    if (current !== generation) return;
    wordsPending = false;

    const words = buildWordResults(value, index);
    wordResults = words;
    pagefindPending = true;

    const found = await searchPagefind(normalizeSearchText(value));
    if (current !== generation) return;

    pagefindUnavailable = found === null;

    if (!words.best && spell && index.length > 0) {
      spellingCandidates ??= buildSpellingCandidates(index);
      const fix = suggestSpelling(value, spellingCandidates)?.text ?? null;
      // A lesson that happens to mention the typo doesn't make it a word.
      const empty = words.others.length === 0 && (found?.examples.length ?? 0) === 0;

      if (fix && empty) {
        if (remember) rememberQuery(fix);
        await showCorrected(value, fix, current);
        return;
      }
      suggestion = fix;
    }

    if (remember) rememberQuery(value);
    applyPagefind(found);
    await loadMoreExamples(EXAMPLE_PREVIEW, current, value);

    if (suggestion && examples.some((item) => usesWholeWord(item.example, value))) {
      suggestion = null;
    }
  }

  async function showCorrected(from: string, to: string, current: number): Promise<void> {
    const index = await ensureDictionary();
    const words = buildWordResults(to, index);
    const found = await searchPagefind(normalizeSearchText(to));
    if (current !== generation) return;

    wordResults = words;
    corrected = { from, to };
    applyPagefind(found);
    await loadMoreExamples(EXAMPLE_PREVIEW, current, to);
  }

  function applyPagefind(
    found: { examples: PagefindSearchResult[]; topics: PagefindResultData[] } | null,
  ): void {
    const leadTopicId =
      wordResults.best?.type === "pronoun" ? wordResults.best.pronoun.topicId : undefined;
    const topicHits = found?.topics ?? [];
    topicRows = groupTopicHits(
      wordResults.best ? namedTopicHits(topicHits) : topicHits,
      topics,
      leadTopicId,
    );
    exampleHits = found?.examples ?? [];
    examplesExhausted = exampleHits.length === 0;
    pagefindPending = false;
  }

  async function loadMoreExamples(
    wanted: number,
    current: number,
    value: string,
  ): Promise<void> {
    loadingExamples = true;
    const added: ExampleItem[] = [];

    while (added.length < wanted && exampleCursor < exampleHits.length) {
      const batch = exampleHits.slice(exampleCursor, exampleCursor + wanted);
      exampleCursor += batch.length;
      const data = await Promise.all(batch.map((result) => result.data()));
      if (current !== generation) return;

      for (const hit of data) {
        if (coveredUrls.has(hit.url)) continue;
        added.push({
          url: hit.url,
          title: hit.meta.title ?? hit.url,
          summary: hit.meta.summary ?? "",
          ...(hit.meta.category ? { category: hit.meta.category } : {}),
          example: pickExample(parseExamplesMeta(hit.meta.examples), value),
        });
      }
    }

    examples = [...examples, ...added];
    examplesExhausted = exampleCursor >= exampleHits.length;
    loadingExamples = false;
  }

  async function showMoreExamples(): Promise<void> {
    const wanted = filter === "examples" ? EXAMPLE_PAGE : EXAMPLE_PAGE - examples.length;
    filter = "examples";
    if (wanted > 0) {
      await loadMoreExamples(wanted, generation, shownQuery);
    }
  }

  function rememberQuery(value = activeQuery): void {
    if (value.trim()) {
      recentQueries = pushRecentQuery(localStorage, value);
    }
  }

  function visit(item: SearchVisit): void {
    rememberQuery(shownQuery);
    viewed = pushSearchHistory(localStorage, item);
  }

  function clearHistory(): void {
    clearRecentQueries(localStorage);
    clearSearchHistory(localStorage);
    recentQueries = [];
    viewed = [];
  }

  function onInput(event: Event): void {
    query = (event.currentTarget as HTMLInputElement).value;
    clearTimeout(typeTimer);
    typeTimer = setTimeout(() => void runSearch(query), TYPE_DELAY_MS);
  }

  function resultLinks(): HTMLAnchorElement[] {
    return resultsEl ? [...resultsEl.querySelectorAll<HTMLAnchorElement>("a[href]")] : [];
  }

  function onInputKeydown(event: KeyboardEvent): void {
    if (event.key !== "ArrowDown") return;
    const first = resultLinks()[0];
    if (!first) return;
    event.preventDefault();
    first.focus();
  }

  function onResultsKeydown(event: KeyboardEvent): void {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = resultLinks();
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (at === -1) return;
    event.preventDefault();

    const next = at + (event.key === "ArrowDown" ? 1 : -1);
    if (next < 0) {
      inputEl?.focus();
    } else {
      links[Math.min(next, links.length - 1)]?.focus();
    }
  }

  function onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    void runSearch(query, { remember: true });
  }

  function pickRecent(value: string): void {
    query = value;
    void runSearch(value, { remember: true });
  }

  function searchInstead(value: string): void {
    query = value;
    void runSearch(value, { spell: false });
  }

  onMount(() => {
    recentQueries = readRecentQueries(localStorage);
    viewed = readSearchHistory(localStorage);

    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q")?.trim() ?? "";
    query = initial;
    mounted = true;

    if (initial) {
      void runSearch(initial, { spell: params.get("spell") !== "off", remember: true });
    }
  });

  onDestroy(() => {
    generation += 1;
    clearTimeout(typeTimer);
  });
</script>

<form action="/search" method="get" class={fieldClass} role="search" onsubmit={onSubmit}>
  <label class="sr-only" for="search-page-input">Search Slovak Wiki</label>

  <input
    class="min-w-0 flex-1 border-0 bg-transparent px-4 text-[1.05rem] text-slate-900 outline-none placeholder:text-slate-500"
    id="search-page-input"
    name="q"
    type="search"
    value={query}
    placeholder="ahoj, tohto, genitive, meet someone…"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    bind:this={inputEl}
    oninput={onInput}
    onkeydown={onInputKeydown}
  />

  <button
    class="cursor-pointer border-0 bg-brand px-5 text-[0.95rem] font-semibold text-brand-ink transition-opacity duration-150 ease-out hover:opacity-90"
    type="submit"
  >
    Search
  </button>
</form>

{#if !mounted}
  <p class="sr-only" role="status">Loading search…</p>

  <!-- search.astro marks <html> before paint when the URL has a query. -->
  <SearchSkeleton class="hidden [[data-search-query]_&]:block" variant="results" />
  <SearchSkeleton class="[[data-search-query]_&]:hidden" variant="idle" />
{:else if !activeQuery}
  <div class="mt-8">
    <SearchIdle
      queries={recentQueries}
      {viewed}
      onclear={clearHistory}
      onpick={pickRecent}
      onvisit={visit}
    />
  </div>
{:else if wordsPending}
  <p class="sr-only" role="status">Loading results…</p>

  <SearchSkeleton variant="results" />
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="mt-5 flex flex-col gap-8"
    aria-live="polite"
    aria-busy={pagefindPending}
    bind:this={resultsEl}
    onkeydown={onResultsKeydown}
  >
    {#if corrected || suggestion}
      <div class="animate-rise text-sm text-slate-700">
        {#if corrected}
          <p class="m-0">
            Showing results for
            <span class="font-serif font-semibold text-slate-900" lang="sk"
              >{corrected.to}</span
            >.
          </p>

          <p class="m-0 mt-1 text-slate-500">
            Search instead for
            <button
              class="cursor-pointer border-0 bg-transparent p-0 font-serif text-blue-800 hover:underline"
              type="button"
              onclick={() => corrected && searchInstead(corrected.from)}
            >
              {corrected.from}
            </button>
          </p>
        {:else if suggestion}
          <p class="m-0">
            Did you mean
            <button
              class="cursor-pointer border-0 bg-transparent p-0 font-serif font-semibold text-blue-800 hover:underline"
              type="button"
              onclick={() => suggestion && pickRecent(suggestion)}
            >
              {suggestion}</button
            >?
          </p>
        {/if}
      </div>
    {/if}

    {#if totalCount > 0}
      <div class="-mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter results">
        {#each filters as option (option.id)}
          <button
            class={chipClass(filter === option.id)}
            type="button"
            aria-pressed={filter === option.id}
            disabled={option.count === 0 && option.id !== "all"}
            onclick={() => (filter = option.id)}
          >
            {option.label}
            <span class="ml-1.5 font-normal tabular-nums opacity-80">{option.count}</span>
          </button>
        {/each}
      </div>
    {/if}

    {#if nothingFound}
      <p class="m-0 font-serif text-slate-700">
        No matches for “{shownQuery}”. Try a shorter word, the English meaning, or leave
        out an ending.
      </p>
    {/if}

    {#if wordResults.best && shows("words")}
      <section aria-labelledby="best-match-label">
        <h2 class="{sectionLabelClass} mb-3" id="best-match-label">Best match</h2>

        <SearchBestMatch match={wordResults.best} topic={leadTopic} onvisit={visit} />
      </section>
    {/if}

    {#if wordResults.others.length > 0 && shows("words")}
      <section aria-labelledby="other-words-label">
        <h2 class={sectionLabelClass} id="other-words-label">
          {wordResults.best ? "Other words" : "Words"}
          <span class="font-normal">{wordResults.others.length}</span>
        </h2>

        <ul class="{dividedListClass} mt-1">
          {#each wordResults.others as other (other.type === "word" ? dictionaryEntryHref(other.match.entry) : other.pronoun.id)}
            <li class={rowClass}>
              {#if other.type === "word"}
                {@const entry = other.match.entry}
                {@const href = dictionaryEntryHref(entry)}

                <div class="min-w-0">
                  <a
                    class={rowLinkClass}
                    {href}
                    lang="sk"
                    onclick={() =>
                      visit({
                        href,
                        kind: "word",
                        label: entry.slovak,
                        category: wordCategoryLabel(entry.slovak, entry.category),
                      })}
                  >
                    {entry.slovak}
                  </a>

                  <span class="ml-2 text-sm text-slate-700">{entry.english}</span>

                  {#if other.kind === "form" && other.match.form}
                    <p class="m-0 mt-0.5 text-xs text-slate-500">
                      Has the form <span class="font-serif" lang="sk"
                        >{other.match.form}</span
                      >
                    </p>
                  {/if}
                </div>

                <span class="shrink-0 text-right text-xs text-slate-500">
                  {wordMetaLabel(entry)}
                </span>
              {:else}
                <div class="min-w-0">
                  <a
                    class={rowLinkClass}
                    href={`/search?q=${encodeURIComponent(other.pronoun.lemma)}`}
                    lang="sk"
                  >
                    {other.pronoun.lemma}
                  </a>

                  <span class="ml-2 text-sm text-slate-700">{other.pronoun.english}</span>
                </div>

                <span class="shrink-0 text-xs text-slate-500">Pronoun</span>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if pagefindPending && topicRows.length === 0 && examples.length === 0}
      <DotLoader label="Searching lessons and examples…" />
    {:else if pagefindUnavailable}
      <p class="m-0 text-sm text-slate-500">
        Lessons and example sentences can't be searched right now: the search index isn't
        built yet.
      </p>
    {/if}

    {#if listedTopicRows.length > 0 && shows("topics")}
      <section aria-labelledby="topics-label">
        <h2 class="{sectionLabelClass} mb-3" id="topics-label">
          Grammar & lessons
          <span class="font-normal">{listedTopicRows.length}</span>
        </h2>

        <ul class="{panelClass} {dividedListClass}">
          {#each listedTopicRows as row (row.key)}
            <li class="px-5 py-4 max-[600px]:px-4">
              <p class="m-0 font-serif text-[1.05rem] text-slate-900">{row.title}</p>

              {#if row.slovak || row.summary}
                <p class="m-0 mt-1 text-sm text-slate-600">
                  {#if row.slovak}
                    <span lang="sk">{row.slovak}</span>
                    {#if row.summary}
                      ·
                    {/if}
                  {/if}
                  {row.summary}
                </p>
              {/if}

              <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                {#each row.links as link (link.href)}
                  <a
                    class={inlineLinkClass}
                    href={link.href}
                    onclick={() =>
                      visit({ href: link.href, kind: link.kind, label: row.title })}
                  >
                    {link.label}
                  </a>
                {/each}
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if examples.length > 0 && shows("examples")}
      <section aria-labelledby="examples-label">
        <h2 class={sectionLabelClass} id="examples-label">
          Found in examples
          <span class="font-normal">{exampleCount}</span>
        </h2>

        <ul class="{dividedListClass} mt-1">
          {#each visibleExamples as item (item.url)}
            <li class="py-3">
              {#if item.example}
                <p class="m-0 font-serif text-[1.02rem] text-slate-900" lang="sk">
                  <MarkedText segments={item.example.slovak} />
                </p>

                <p class="m-0 mt-0.5 text-sm text-slate-600">
                  <MarkedText segments={item.example.english} />
                </p>

                <p class="m-0 mt-1 text-xs text-slate-500">
                  from
                  <a
                    class="text-blue-800 no-underline hover:underline"
                    href={item.url}
                    lang="sk"
                    onclick={() =>
                      visit({
                        href: item.url,
                        kind: "word",
                        label: item.title,
                        ...(item.category ? { category: item.category } : {}),
                      })}
                  >
                    {item.title}
                  </a>
                </p>
              {:else}
                <a
                  class={rowLinkClass}
                  href={item.url}
                  lang="sk"
                  onclick={() =>
                    visit({
                      href: item.url,
                      kind: "word",
                      label: item.title,
                      ...(item.category ? { category: item.category } : {}),
                    })}
                >
                  {item.title}
                </a>

                <span class="ml-2 text-sm text-slate-600">{item.summary}</span>
              {/if}
            </li>
          {/each}
        </ul>

        {#if loadingExamples}
          <div class="mt-3"><DotLoader label="Loading more examples…" /></div>
        {:else if filter === "examples" ? !examplesExhausted : exampleCount > EXAMPLE_PREVIEW}
          <button
            class="{inlineLinkClass} mt-3 cursor-pointer border-0 bg-transparent p-0"
            type="button"
            onclick={showMoreExamples}
          >
            {filter === "examples"
              ? "Show more examples"
              : `Show all ${exampleCount} example matches`}
          </button>
        {/if}
      </section>
    {/if}
  </div>
{/if}
