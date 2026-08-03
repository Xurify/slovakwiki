<script lang="ts">
  import { onMount } from "svelte";

  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import {
    clearSearchHistory,
    pushSearchHistory,
    readSearchHistory,
    type SearchHistoryItem,
  } from "$lib/client/search-history";
  import {
    normalizeSearchText,
    searchIdleHints,
    searchKindChips,
    searchKindLabels,
    type SearchDocKind,
  } from "$lib/content/search-ui";
  import {
    getPagefind,
    isSearchDocKind,
    type PagefindResultData,
  } from "$lib/search/pagefind-client";
  import { cx } from "$lib/ui/classes";

  let {
    class: className = "",
    id = "site-search",
    initialQuery = "",
    placeholder = "Search…",
    size = "header",
  }: {
    class?: string;
    id?: string;
    initialQuery?: string;
    placeholder?: string;
    size?: "header" | "hero";
  } = $props();

  let query = $state(initialQuery);
  let open = $state(false);
  let loading = $state(false);
  let unavailable = $state(false);
  let activeIndex = $state(0);
  let results = $state<PagefindResultData[]>([]);
  let recent = $state<SearchHistoryItem[]>([]);
  let inputEl = $state<HTMLInputElement | null>(null);
  let rootEl = $state<HTMLDivElement | null>(null);
  let searchGeneration = 0;

  const trimmedQuery = $derived(query.trim());
  const showPanel = $derived(open);
  const showIdle = $derived(showPanel && !trimmedQuery);
  const showResults = $derived(showPanel && Boolean(trimmedQuery));
  const idleOptions = $derived([
    ...recent.map((item) => ({ href: item.href, source: "recent" as const })),
    ...searchIdleHints.map((hint) => ({
      href: hint.href,
      source: "hint" as const,
    })),
  ]);
  const idleHintsOffset = $derived(recent.length);
  const shellClass = $derived(
    size === "hero"
      ? cx("relative z-30 w-full max-w-[480px]", className)
      : cx("relative ml-auto w-full max-w-[320px] min-w-0", className),
  );

  const fieldClass = $derived(
    size === "hero"
      ? "flex min-h-[52px] items-stretch overflow-hidden rounded-full border border-slate-300/90 bg-surface/80 shadow-(--shadow-border) backdrop-blur-sm transition-[box-shadow,border-color,background-color] focus-within:border-blue-600 focus-within:bg-surface focus-within:shadow-[0_0_0_4px_var(--accent-soft),var(--shadow-border)] max-[520px]:rounded-(--frame-radius)"
      : "flex min-h-10 w-full items-center rounded-(--control-radius) border border-(--line-strong) bg-(--surface) transition-[box-shadow,border-color] focus-within:border-(--accent) focus-within:shadow-[0_0_0_3px_var(--accent-soft)]",
  );

  const inputClass = $derived(
    size === "hero"
      ? "min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[0.95rem] text-slate-900 outline-none placeholder:text-slate-400"
      : "min-h-[38px] min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[0.8rem] text-(--ink) outline-none",
  );

  function kindLabel(kind: string | undefined): string {
    if (isSearchDocKind(kind)) {
      return searchKindLabels[kind];
    }
    return "Result";
  }

  function refreshRecent(): void {
    recent = readSearchHistory(localStorage);
  }

  function rememberLookup(input: { href: string; kind?: string; label: string }): void {
    const kind: SearchDocKind = isSearchDocKind(input.kind) ? input.kind : "word";
    recent = pushSearchHistory(localStorage, {
      href: input.href,
      kind,
      label: input.label,
    });
  }

  function rememberResult(result: PagefindResultData): void {
    rememberLookup({
      href: result.url,
      kind: result.meta.kind,
      label: result.meta.title ?? result.url,
    });
  }

  function clearRecent(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    clearSearchHistory(localStorage);
    recent = [];
    activeIndex = 0;
  }

  function closePanel(): void {
    open = false;
    activeIndex = 0;
  }

  function openPanel(): void {
    open = true;
    refreshRecent();
    void getPagefind().then((api) => {
      if (!api) {
        unavailable = true;
      }
    });
  }

  async function runSearch(value: string): Promise<void> {
    const normalized = normalizeSearchText(value);
    if (!normalized) {
      results = [];
      loading = false;
      return;
    }

    const generation = ++searchGeneration;
    loading = true;

    const api = await getPagefind();
    if (!api) {
      if (generation === searchGeneration) {
        unavailable = true;
        loading = false;
        results = [];
      }
      return;
    }

    unavailable = false;
    void api.preload(normalized);

    const response = await api.debouncedSearch(normalized, undefined, 180);
    if (response === null || generation !== searchGeneration) {
      return;
    }

    const page = await Promise.all(
      response.results.slice(0, 8).map((result) => result.data()),
    );

    if (generation !== searchGeneration) {
      return;
    }

    results = page;
    activeIndex = 0;
    loading = false;
  }

  function onInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    query = target.value;
    open = true;
    void runSearch(query);
  }

  function onFocus(): void {
    openPanel();
    if (trimmedQuery) {
      void runSearch(query);
    }
  }

  function goTo(url: string): void {
    closePanel();
    window.location.assign(url);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!open) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      inputEl?.blur();
      return;
    }

    const options = trimmedQuery
      ? results.map((result) => ({ href: result.url, result }))
      : idleOptions;

    if (options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % options.length;
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + options.length) % options.length;
      return;
    }

    if (event.key === "Enter") {
      const selected = options[activeIndex];
      if (!selected) {
        return;
      }

      event.preventDefault();

      if ("result" in selected && selected.result) {
        rememberResult(selected.result);
      } else if (!trimmedQuery && activeIndex < recent.length) {
        const item = recent[activeIndex];
        if (item) {
          rememberLookup(item);
        }
      }

      goTo(selected.href);
    }
  }

  onMount(() => {
    refreshRecent();

    if (query.trim()) {
      open = true;
      void runSearch(query);
    }
  });

  $effect(() => {
    function onDocumentPointerDown(event: PointerEvent): void {
      if (!rootEl) {
        return;
      }
      if (event.target instanceof Node && !rootEl.contains(event.target)) {
        closePanel();
      }
    }

    function onGlobalKeydown(event: KeyboardEvent): void {
      if (size !== "header") {
        return;
      }

      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      event.preventDefault();
      openPanel();
      inputEl?.focus();
      inputEl?.select();
    }

    document.addEventListener("pointerdown", onDocumentPointerDown);
    document.addEventListener("keydown", onGlobalKeydown);

    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      document.removeEventListener("keydown", onGlobalKeydown);
    };
  });
</script>

<div class={shellClass} bind:this={rootEl}>
  <div class={fieldClass} role="search">
    <label class="sr-only" for={id}>Search Slovak Wiki</label>

    <svg
      class={cx(
        "shrink-0 fill-none stroke-[1.8]",
        size === "hero"
          ? "ml-4 w-4 stroke-slate-400 max-[520px]:hidden"
          : "ml-3 w-4 stroke-(--muted)",
      )}
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
    </svg>

    <input
      class={inputClass}
      bind:this={inputEl}
      {id}
      value={query}
      type="search"
      {placeholder}
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      aria-autocomplete="list"
      aria-controls={`${id}-listbox`}
      aria-expanded={showPanel}
      aria-activedescendant={showPanel ? `${id}-option-${activeIndex}` : undefined}
      role="combobox"
      oninput={onInput}
      onfocus={onFocus}
      onkeydown={onKeydown}
    />

    {#if size === "header"}
      <kbd
        class="mr-2 hidden rounded border border-(--line) px-1.5 py-0.5 text-[0.65rem] font-semibold text-(--muted) min-[900px]:inline"
      >
        /
      </kbd>
    {/if}
  </div>

  {#if showPanel}
    <div
      class={cx(
        "absolute z-[60] mt-2 overflow-y-auto border border-(--line) bg-(--surface) shadow-(--shadow-border)",
        "max-h-[min(22rem,calc(100dvh-8rem))]",
        size === "hero"
          ? "left-0 right-0 rounded-(--frame-radius)"
          : "right-0 w-[min(22rem,calc(100vw-1.5rem))] rounded-(--control-radius) max-[800px]:left-0 max-[800px]:right-0 max-[800px]:w-auto",
      )}
      id={`${id}-listbox`}
      role="listbox"
      aria-label="Search suggestions"
    >
      {#if showIdle}
        <div class="border-b border-(--line) px-3.5 py-3">
          <p
            class="m-0 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-(--muted)"
          >
            You can search
          </p>

          <div class="mt-2 flex flex-wrap gap-1.5">
            {#each searchKindChips as kind (kind)}
              <span
                class="rounded-(--control-radius) bg-(--surface-subtle) px-2 py-1 text-[0.72rem] font-semibold text-(--muted-strong)"
              >
                {searchKindLabels[kind]}
              </span>
            {/each}
          </div>
        </div>

        {#if recent.length > 0}
          <div class="flex items-center justify-between gap-3 px-3.5 pb-1 pt-3">
            <p
              class="m-0 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-(--muted)"
            >
              Recent
            </p>

            <button
              class="m-0 border-0 bg-transparent p-0 text-[0.68rem] font-semibold text-(--muted) underline-offset-2 hover:text-(--ink-soft) hover:underline"
              type="button"
              onclick={clearRecent}
            >
              Clear
            </button>
          </div>

          {#each recent as item, index (item.href)}
            <a
              class={cx(
                "flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors",
                activeIndex === index
                  ? "bg-(--surface-selected) text-(--accent-strong)"
                  : "text-(--ink-soft) hover:bg-(--surface-subtle)",
              )}
              id={`${id}-option-${index}`}
              href={item.href}
              role="option"
              aria-selected={activeIndex === index}
              onmouseenter={() => (activeIndex = index)}
              onclick={() => rememberLookup(item)}
            >
              <span class="font-serif text-[0.95rem]" lang="sk">{item.label}</span>
              <span
                class="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-(--muted)"
              >
                {searchKindLabels[item.kind]}
              </span>
            </a>
          {/each}
        {/if}

        <p
          class="m-0 px-3.5 pb-1 pt-3 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-(--muted)"
        >
          Try
        </p>

        {#each searchIdleHints as hint, index (hint.href)}
          <a
            class={cx(
              "flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors",
              activeIndex === idleHintsOffset + index
                ? "bg-(--surface-selected) text-(--accent-strong)"
                : "text-(--ink-soft) hover:bg-(--surface-subtle)",
            )}
            id={`${id}-option-${idleHintsOffset + index}`}
            href={hint.href}
            role="option"
            aria-selected={activeIndex === idleHintsOffset + index}
            onmouseenter={() => (activeIndex = idleHintsOffset + index)}
          >
            <span class="font-serif text-[0.95rem]" lang={hint.lang}>{hint.label}</span>
            <span
              class="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-(--muted)"
            >
              {searchKindLabels[hint.kind]}
            </span>
          </a>
        {/each}
      {:else if showResults}
        {#if unavailable}
          <p class="m-0 px-3.5 py-4 font-serif text-sm text-(--muted-strong)">
            Search index not built yet. Run a production build once, then refresh.
          </p>
        {:else if loading && results.length === 0}
          <div class="flex items-center px-3.5 py-2.5">
            <DotLoader label="Searching…" />
          </div>
        {:else if results.length === 0}
          <p class="m-0 px-3.5 py-4 font-serif text-sm text-(--muted-strong)">
            No matches for “{trimmedQuery}”. Try a shorter word or an English meaning.
          </p>
        {:else}
          {#each results as result, index (result.url)}
            <a
              class={cx(
                "flex items-start justify-between gap-3 px-3.5 py-2.5 transition-colors",
                activeIndex === index
                  ? "bg-(--surface-selected) text-(--accent-strong)"
                  : "text-(--ink-soft) hover:bg-(--surface-subtle)",
              )}
              id={`${id}-option-${index}`}
              href={result.url}
              role="option"
              aria-selected={activeIndex === index}
              onmouseenter={() => (activeIndex = index)}
              onclick={() => rememberResult(result)}
            >
              <span class="min-w-0">
                <span class="block font-serif text-[0.95rem] text-(--ink)" lang="sk">
                  {result.meta.title ?? result.url}
                </span>
                {#if result.meta.summary}
                  <span class="mt-0.5 block truncate text-[0.75rem] text-(--muted)">
                    {result.meta.summary}
                  </span>
                {/if}
              </span>

              <span
                class="shrink-0 rounded-(--control-radius) bg-(--surface-subtle) px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-(--muted-strong)"
              >
                {kindLabel(result.meta.kind)}
              </span>
            </a>
          {/each}
        {/if}
      {/if}
    </div>
  {/if}
</div>
