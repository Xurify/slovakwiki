<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import type {
    DictionaryImageAuditRow,
    ImageAuditSource,
  } from "$lib/catalog/dictionary/image-audit";

  const PAGE_SIZE = 48;
  const STORAGE_KEY = "slovak-wiki-image-audit-reject";

  let { rows }: { rows: DictionaryImageAuditRow[] } = $props();

  let query = $state("");
  let category = $state("all");
  let source = $state("all");
  let page = $state(0);
  let copied = $state(false);
  let rejectSlugs = $state<Record<string, true>>(loadRejects());

  const categories = $derived(
    [...new Set(rows.map((row) => row.category))].sort((a, b) =>
      a.localeCompare(b, "en"),
    ),
  );

  const filtered = $derived.by(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (category !== "all" && row.category !== category) return false;
      if (source !== "all" && row.source !== source) return false;
      if (!needle) return true;
      return (
        row.slug.includes(needle) ||
        row.slovak.toLowerCase().includes(needle) ||
        row.english.toLowerCase().includes(needle) ||
        (row.commonsFile?.toLowerCase().includes(needle) ?? false) ||
        (row.wikiTitle?.toLowerCase().includes(needle) ?? false)
      );
    });
  });

  const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const safePage = $derived(Math.min(page, pageCount - 1));
  const pageRows = $derived(
    filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
  );
  const rejectList = $derived(
    Object.keys(rejectSlugs).sort((a, b) => a.localeCompare(b, "en")),
  );
  const rejectCommand = $derived(
    rejectList.length === 0
      ? ""
      : `bun scripts/images/reject.ts -- --slugs ${rejectList.join(",")}`,
  );

  function loadRejects(): Record<string, true> {
    if (typeof localStorage === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return {};
      const next: Record<string, true> = {};
      for (const slug of parsed) {
        if (typeof slug === "string" && slug) next[slug] = true;
      }
      return next;
    } catch {
      return {};
    }
  }

  function persist(next: Record<string, true>): void {
    rejectSlugs = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.keys(next)));
  }

  function toggleReject(slug: string): void {
    const next = { ...rejectSlugs };
    if (next[slug]) delete next[slug];
    else next[slug] = true;
    persist(next);
    copied = false;
  }

  function clearRejects(): void {
    persist({});
    copied = false;
  }

  async function copyCommand(): Promise<void> {
    if (!rejectCommand) return;
    await navigator.clipboard.writeText(rejectCommand);
    copied = true;
  }

  function sourceLabel(value: ImageAuditSource): string {
    if (value === "sk-wiki") return "SK wiki";
    if (value === "en-wiki") return "EN wiki";
    return "Commons";
  }
</script>

<main class="py-12 pb-28 max-[600px]:py-8">
  <PageShell class="max-w-[1100px]">
    <header class="max-w-[680px]">
      <p
        class="m-0 font-mono text-xs font-medium tracking-widest text-blue-700 uppercase"
      >
        Images
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
        Dictionary image audit
      </h1>
      <Lead class="mt-3">
        Mark junk, copy the reject command, run it locally. Unmarked stay live. New
        fetches only auto-pick Food / Places / People / Travel / Everyday. Compare source
        order on
        <a
          class="underline decoration-slate-300 hover:text-slate-800"
          href="/dev/images/compare"
        >
          /dev/images/compare
        </a>.
      </Lead>
    </header>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <label class="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-slate-600">
        Search
        <input
          class="min-h-11 rounded-(--control-radius) border border-slate-200 bg-surface px-3 font-sans text-slate-900"
          type="search"
          bind:value={query}
          oninput={() => {
            page = 0;
          }}
        />
      </label>

      <label class="flex min-w-[10rem] flex-col gap-1 text-sm text-slate-600">
        Category
        <select
          class="min-h-11 rounded-(--control-radius) border border-slate-200 bg-surface px-3 font-sans text-slate-900"
          bind:value={category}
          onchange={() => {
            page = 0;
          }}
        >
          <option value="all">All</option>
          {#each categories as item (item)}
            <option value={item}>{item}</option>
          {/each}
        </select>
      </label>

      <label class="flex min-w-[10rem] flex-col gap-1 text-sm text-slate-600">
        Source
        <select
          class="min-h-11 rounded-(--control-radius) border border-slate-200 bg-surface px-3 font-sans text-slate-900"
          bind:value={source}
          onchange={() => {
            page = 0;
          }}
        >
          <option value="all">All</option>
          <option value="sk-wiki">SK wiki</option>
          <option value="en-wiki">EN wiki</option>
          <option value="commons">Commons</option>
        </select>
      </label>
    </div>

    <p class="mt-4 m-0 text-sm text-slate-500">
      {filtered.length} shown · {rows.length} live · {rejectList.length} marked
    </p>

    <ul class="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {#each pageRows as row (row.slug)}
        <li
          class="flex flex-col overflow-hidden rounded-(--frame-radius) bg-surface ring-1 ring-slate-200 ring-inset"
        >
          <a class="block bg-slate-50" href="/dictionary/{row.slug}">
            <img
              alt={row.caption}
              class="aspect-[4/3] h-auto w-full object-cover"
              decoding="async"
              height="192"
              loading="lazy"
              src={row.src}
              width="256"
            />
          </a>

          <div class="flex flex-1 flex-col gap-2 p-4">
            <div>
              <a
                class="font-serif text-lg font-semibold text-blue-950 hover:underline"
                href="/dictionary/{row.slug}"
              >
                {row.slovak}
              </a>
              <p class="m-0 text-sm text-slate-600">{row.english}</p>
            </div>

            <p class="m-0 font-mono text-xs break-all text-slate-500">
              {row.commonsFile ?? row.wikiTitle ?? row.file}
            </p>

            <p class="m-0 text-xs text-slate-500">
              {row.category} · {sourceLabel(row.source)}
            </p>

            <button
              class="mt-auto min-h-10 rounded-(--control-radius) px-3 text-sm font-semibold
                {rejectSlugs[row.slug]
                ? 'bg-rose-600 text-white'
                : 'bg-control text-blue-800 shadow-(--shadow-border)'}"
              type="button"
              onclick={() => toggleReject(row.slug)}
            >
              {rejectSlugs[row.slug] ? "Marked reject" : "Reject"}
            </button>
          </div>
        </li>
      {/each}
    </ul>

    {#if filtered.length === 0}
      <p class="mt-8 text-slate-600">No images match.</p>
    {/if}

    {#if pageCount > 1}
      <div class="mt-8 flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          disabled={safePage === 0}
          onclick={() => {
            page = Math.max(0, safePage - 1);
          }}
        >
          Previous
        </Button>
        <p class="m-0 text-sm text-slate-500">
          {safePage + 1} / {pageCount}
        </p>
        <Button
          variant="secondary"
          disabled={safePage >= pageCount - 1}
          onclick={() => {
            page = Math.min(pageCount - 1, safePage + 1);
          }}
        >
          Next
        </Button>
      </div>
    {/if}
  </PageShell>

  {#if rejectList.length > 0}
    <div
      class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-paper/95 px-4 py-3 backdrop-blur-sm"
    >
      <PageShell class="max-w-[1100px]">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="m-0 min-w-0 font-mono text-xs break-all text-slate-700">
            {rejectCommand}
          </p>
          <div class="flex shrink-0 gap-2">
            <Button variant="secondary" onclick={clearRejects}>Clear</Button>
            <Button variant="accent" onclick={copyCommand}>
              {copied ? "Copied" : "Copy command"}
            </Button>
          </div>
        </div>
      </PageShell>
    </div>
  {/if}
</main>
