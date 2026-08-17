<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { exportAndDownload } from "$lib/catalog/downloads/client";
  import { distinctCategories } from "$lib/catalog/downloads/serialize";
  import {
    ANKI_PHRASES_EXAMPLE_FIELDS,
    DEFAULT_EXAMPLE_FIELDS,
    DEFAULT_WORD_FIELDS,
    EXAMPLES_ONLY_WORD_FIELDS,
    type DictionaryExportFile,
    type DownloadExampleField,
    type DownloadFormat,
    type DownloadWordField,
  } from "$lib/catalog/downloads/types";

  type LoadState = "idle" | "loading" | "ready" | "error";
  type PackId = "full" | "anki";

  interface Pack {
    id: PackId;
    title: string;
    description: string;
    fields: readonly DownloadWordField[];
    exampleFields: readonly DownloadExampleField[];
    format: DownloadFormat;
    formatNote: string;
    includeHeader: boolean;
    includeAttributionComment: boolean;
  }

  const EXPORT_URL = "/downloads/dictionary-export.json";

  const PACKS: Pack[] = [
    {
      id: "full",
      title: "Full dictionary",
      description: "Lemmas, glosses, related links, and example sentences.",
      fields: DEFAULT_WORD_FIELDS,
      exampleFields: DEFAULT_EXAMPLE_FIELDS,
      format: "json",
      formatNote: "JSON",
      includeHeader: true,
      includeAttributionComment: true,
    },
    {
      id: "anki",
      title: "Anki phrases",
      description: "Headerless TSV — Slovak sentence, then English.",
      fields: EXAMPLES_ONLY_WORD_FIELDS,
      exampleFields: ANKI_PHRASES_EXAMPLE_FIELDS,
      format: "tsv",
      formatNote: "TSV",
      includeHeader: false,
      includeAttributionComment: false,
    },
  ];

  const PACK_BY_ID = Object.fromEntries(PACKS.map((pack) => [pack.id, pack])) as Record<
    PackId,
    Pack
  >;

  let loadState = $state<LoadState>("idle");
  let loadError = $state("");
  let exportFile = $state.raw<DictionaryExportFile | null>(null);

  let format = $state<DownloadFormat>("json");
  let customPack = $state<PackId>("full");
  let selectedCategories = $state<string[]>([]);
  let categories = $state<string[]>([]);
  let busy = $state(false);
  let statusMessage = $state("");
  let dialogEl = $state<HTMLDialogElement | null>(null);
  let statusTimer: ReturnType<typeof setTimeout> | undefined;

  const lemmaCount = $derived(exportFile?.words.length ?? 0);
  const exampleCount = $derived(
    exportFile?.words.reduce((total, word) => total + word.examples.length, 0) ?? 0,
  );

  const allCategoriesSelected = $derived(
    categories.length > 0 && selectedCategories.length === categories.length,
  );
  const canDownloadCustom = $derived(selectedCategories.length > 0 && !busy);

  const filteredCounts = $derived.by(() => {
    if (!exportFile) {
      return { lemmas: 0, examples: 0 };
    }

    const selected = new Set(selectedCategories);
    let lemmas = 0;
    let examples = 0;

    for (const word of exportFile.words) {
      if (!selected.has(word.category)) {
        continue;
      }

      lemmas += 1;
      examples += word.examples.length;
    }

    return { lemmas, examples };
  });

  async function ensureExportLoaded(): Promise<boolean> {
    if (exportFile) {
      return true;
    }

    if (loadState === "loading") {
      return false;
    }

    await loadExport();
    return exportFile !== null;
  }

  async function loadExport(): Promise<void> {
    loadState = "loading";
    loadError = "";

    try {
      const response = await fetch(EXPORT_URL);

      if (!response.ok) {
        if (import.meta.env.DEV) {
          console.error(
            response.status === 404
              ? "Export file missing. Run bun scripts/downloads/export.ts (also runs on bun run build)."
              : `Failed to load export (${response.status}).`,
          );
        }

        throw new Error("Downloads aren't available right now. Try again later.");
      }

      const data = (await response.json()) as DictionaryExportFile;

      if (!data?.words || !Array.isArray(data.words)) {
        if (import.meta.env.DEV) {
          console.error("Export file is malformed.");
        }

        throw new Error("Downloads aren't available right now. Try again later.");
      }

      exportFile = data;
      categories = distinctCategories(data.words);
      selectedCategories = [...categories];
      loadState = "ready";
    } catch (error) {
      loadState = "error";

      if (import.meta.env.DEV) {
        console.error(error);
      }

      loadError =
        error instanceof Error
          ? error.message
          : "Downloads aren't available right now. Try again later.";
    }
  }

  function toggleCategory(category: string): void {
    if (selectedCategories.includes(category)) {
      selectedCategories = selectedCategories.filter((item) => item !== category);
    } else {
      selectedCategories = [...selectedCategories, category];
    }
  }

  function selectAllCategories(): void {
    selectedCategories = [...categories];
  }

  function clearCategories(): void {
    selectedCategories = [];
  }

  function openCustomize(): void {
    statusMessage = "";
    void ensureExportLoaded().then((ready) => {
      if (ready) {
        dialogEl?.showModal();
      }
    });
  }

  function closeCustomize(): void {
    dialogEl?.close();
  }

  function showStatus(message: string): void {
    statusMessage = message;

    if (statusTimer) {
      clearTimeout(statusTimer);
    }

    statusTimer = setTimeout(() => {
      statusMessage = "";
    }, 4000);
  }

  function formatUpdatedAt(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  async function runDownload(options: {
    fields: readonly DownloadWordField[];
    exampleFields: readonly DownloadExampleField[];
    format: DownloadFormat;
    categories: readonly string[];
    includeHeader: boolean;
    includeAttributionComment: boolean;
    closeModal?: boolean;
  }): Promise<void> {
    if (!exportFile || busy) {
      return;
    }

    if (options.categories.length === 0) {
      showStatus("Select at least one category.");
      return;
    }

    busy = true;
    statusMessage = "";

    try {
      const count = await exportAndDownload(exportFile, {
        format: options.format,
        fields: options.fields,
        exampleFields: options.exampleFields,
        categories: options.categories,
        includeHeader: options.includeHeader,
        includeAttributionComment: options.includeAttributionComment,
      });

      if (options.closeModal) {
        closeCustomize();
      }

      showStatus(
        count === 2
          ? "Downloaded words + examples files."
          : count === 1
            ? "Download started."
            : "Nothing to download for this selection.",
      );
    } catch (error) {
      showStatus(error instanceof Error ? error.message : "Download failed.");
    } finally {
      busy = false;
    }
  }

  function downloadPack(pack: Pack): void {
    void ensureExportLoaded().then((ready) => {
      if (!ready) {
        return;
      }

      runDownload({
        fields: pack.fields,
        exampleFields: pack.exampleFields,
        format: pack.format,
        categories,
        includeHeader: pack.includeHeader,
        includeAttributionComment: pack.includeAttributionComment,
      });
    });
  }

  function downloadCustom(): void {
    const pack = PACK_BY_ID[customPack];

    void runDownload({
      fields: pack.fields,
      exampleFields: pack.exampleFields,
      format: pack.id === "anki" ? "tsv" : format,
      categories: selectedCategories,
      includeHeader: pack.includeHeader,
      includeAttributionComment: pack.includeAttributionComment,
      closeModal: true,
    });
  }

  const labelClass = "text-sm font-semibold text-slate-900";
  const optionRowClass =
    "relative flex min-h-10 cursor-pointer items-center gap-3 px-1 py-2.5 text-sm text-slate-700 transition-colors hover:text-slate-900";
  const choiceIdleClass =
    "bg-control text-slate-900 shadow-(--shadow-border) transition-[box-shadow,background-color] duration-150 ease-out hover:bg-control-hover hover:shadow-(--shadow-border-hover)";
  const choiceActiveClass =
    "bg-blue-50 text-slate-900 shadow-[0_0_0_1px_var(--color-blue-600)]";
  const packCardClass =
    "flex h-full flex-col rounded-(--control-radius) border border-slate-200 bg-surface p-5 text-left shadow-(--shadow-border) transition-[border-color,box-shadow] duration-150 ease-out hover:border-slate-300 hover:shadow-(--shadow-border-hover)";
</script>

{#if loadState === "error"}
  <div
    class="rounded-(--control-radius) border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
    role="alert"
  >
    <p>{loadError}</p>
    <p class="mt-2">
      <button
        type="button"
        class="font-semibold text-blue-800 underline underline-offset-2"
        onclick={() => void loadExport()}
      >
        Retry
      </button>
    </p>
  </div>
{:else}
  {#if loadState === "loading"}
    <div class="mb-6 flex min-h-16 items-center">
      <DotLoader label="Loading dictionary export…" />
    </div>
  {/if}

  {#if exportFile}
    <p class="text-sm tabular-nums text-slate-500">
      {lemmaCount.toLocaleString()} lemmas · {exampleCount.toLocaleString()} sentences · updated
      {formatUpdatedAt(exportFile.generatedAt)}
    </p>
  {/if}

  <section class="mt-8" aria-labelledby="downloads-packs">
    <h2 id="downloads-packs" class="text-balance font-serif text-2xl text-blue-800">
      Ready packs
    </h2>
    <p class="mt-2 max-w-160 text-pretty text-sm leading-relaxed text-slate-600">
      One-click packs. Need CSV, TSV, or a subset? Customize below.
    </p>

    <ul class="mt-5 grid gap-4 sm:grid-cols-2">
      {#each PACKS as pack (pack.id)}
        <li>
          <article class={packCardClass}>
            <h3 class="text-balance font-serif text-lg font-semibold text-slate-900">
              {pack.title}
            </h3>
            <p class="mt-2 flex-1 text-pretty text-sm leading-relaxed text-slate-600">
              {pack.description}
            </p>
            <div
              class="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4"
            >
              <span class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                {pack.formatNote}
              </span>
              <Button
                type="button"
                class="min-h-10 px-3 text-sm"
                disabled={busy || loadState === "loading"}
                onclick={() => downloadPack(pack)}
              >
                Download
              </Button>
            </div>
          </article>
        </li>
      {/each}
    </ul>
  </section>

  <div class="mt-8">
    <Button
      type="button"
      variant="secondary"
      disabled={busy || loadState === "loading"}
      onclick={openCustomize}
    >
      Customize export…
    </Button>
  </div>

  <p class="mt-6 max-w-160 text-pretty text-xs leading-relaxed text-slate-500">
    CSV/TSV with examples yields two files (words + examples), joined by
    <code class="font-mono text-[0.7rem]">slug</code>; examples include spelled
    <code class="font-mono text-[0.7rem]">lemma</code>. Anki phrases: headerless TSV
    (Slovak → English). Tatoeba lines: CC BY 2.0 FR —
    <TextLink href="/references">References</TextLink>.
  </p>

  {#if statusMessage}
    <div
      class="fixed bottom-6 left-1/2 z-50 max-w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 rounded-(--control-radius) bg-surface px-4 py-3 text-sm text-slate-800 shadow-(--shadow-border)"
      role="status"
    >
      {statusMessage}
    </div>
  {/if}

  <dialog
    bind:this={dialogEl}
    class="m-auto w-[min(28rem,calc(100%-2rem))] max-h-[min(90vh,40rem)] overflow-hidden rounded-(--frame-radius) bg-surface p-0 text-slate-900 shadow-(--shadow-border) backdrop:bg-black/50"
    aria-labelledby="downloads-modal-title"
  >
    <form
      class="flex max-h-[min(90vh,40rem)] flex-col"
      method="dialog"
      onsubmit={(event) => {
        event.preventDefault();
      }}
    >
      <header
        class="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4"
      >
        <div>
          <h2
            id="downloads-modal-title"
            class="text-balance font-serif text-xl font-semibold text-slate-900"
          >
            Customize export
          </h2>
          <p class="mt-1 text-pretty text-sm text-slate-600">
            Pack, format, and categories.
          </p>
        </div>
        <button
          type="button"
          class="relative -mr-1 -mt-1 flex size-10 shrink-0 items-center justify-center text-lg leading-none text-slate-500 transition-colors hover:text-slate-900"
          aria-label="Close"
          onclick={closeCustomize}
        >
          ×
        </button>
      </header>

      <div
        class="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent px-5 py-4"
      >
        <div>
          <p class={labelClass} id="downloads-pack-label">Pack</p>
          <div
            class="mt-2 flex flex-col gap-2"
            role="radiogroup"
            aria-labelledby="downloads-pack-label"
          >
            {#each PACKS as pack (pack.id)}
              <label
                class="flex cursor-pointer items-start gap-3 rounded-(--control-radius) px-3 py-2.5 text-sm {customPack ===
                pack.id
                  ? choiceActiveClass
                  : choiceIdleClass}"
              >
                <input
                  class="mt-0.5 size-4 accent-blue-600"
                  type="radio"
                  name="download-pack"
                  value={pack.id}
                  checked={customPack === pack.id}
                  onchange={() => {
                    customPack = pack.id;

                    if (pack.id === "anki") {
                      format = "tsv";
                    }
                  }}
                />
                <span>
                  <span class="font-semibold">{pack.title}</span>
                  <span
                    class="mt-0.5 block text-pretty text-xs leading-relaxed text-slate-600"
                  >
                    {pack.description}
                  </span>
                </span>
              </label>
            {/each}
          </div>
        </div>

        <div class="mt-6">
          <p class={labelClass} id="downloads-format-label">Format</p>
          {#if customPack === "anki"}
            <p class="mt-2 text-sm text-slate-600">
              Locked to TSV for Anki (Slovak → English, no header).
            </p>
          {:else}
            <div
              class="mt-2 flex flex-wrap gap-2"
              role="radiogroup"
              aria-labelledby="downloads-format-label"
            >
              {#each ["json", "csv", "tsv"] as option (option)}
                <label
                  class="inline-flex min-h-10 cursor-pointer items-center rounded-(--control-radius) px-3 text-sm {format ===
                  option
                    ? choiceActiveClass
                    : choiceIdleClass}"
                >
                  <input
                    class="sr-only"
                    type="radio"
                    name="download-format"
                    value={option}
                    checked={format === option}
                    onchange={() => {
                      format = option as DownloadFormat;
                    }}
                  />
                  <span class="uppercase">{option}</span>
                </label>
              {/each}
            </div>
          {/if}
        </div>

        <div class="mt-6">
          <div class="flex flex-wrap items-baseline justify-between gap-3">
            <p class={labelClass} id="downloads-categories-label">Categories</p>
            <div class="flex gap-3 text-xs">
              <button
                type="button"
                class="min-h-10 text-blue-800 underline underline-offset-2"
                onclick={selectAllCategories}
              >
                All
              </button>
              <button
                type="button"
                class="min-h-10 text-blue-800 underline underline-offset-2"
                onclick={clearCategories}
              >
                None
              </button>
            </div>
          </div>

          <div
            class="mt-1 divide-y divide-slate-200"
            role="group"
            aria-labelledby="downloads-categories-label"
          >
            {#each categories as category (category)}
              <label class={optionRowClass}>
                <input
                  type="checkbox"
                  class="size-4 accent-blue-600"
                  checked={selectedCategories.includes(category)}
                  onchange={() => toggleCategory(category)}
                />
                {category}
              </label>
            {/each}
          </div>

          {#if selectedCategories.length > 0}
            <p class="mt-2 text-xs tabular-nums text-slate-500">
              {#if allCategoriesSelected}
                All categories · {filteredCounts.lemmas.toLocaleString()} lemmas ·
                {filteredCounts.examples.toLocaleString()} sentences
              {:else}
                {selectedCategories.length} of {categories.length} ·
                {filteredCounts.lemmas.toLocaleString()} lemmas ·
                {filteredCounts.examples.toLocaleString()} sentences
              {/if}
            </p>
          {/if}
        </div>
      </div>

      <footer
        class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-5 py-4"
      >
        <Button type="button" variant="secondary" onclick={closeCustomize}>Cancel</Button>
        <Button type="button" disabled={!canDownloadCustom} onclick={downloadCustom}>
          {busy ? "Preparing…" : "Download"}
        </Button>
      </footer>
    </form>
  </dialog>
{/if}
