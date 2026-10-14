<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import {
    dataPanelClass,
    dataPanelHeadClass,
    dataRangeClass,
  } from "$lib/components/ui/data-list-ui";
  import {
    chipClass,
    eyebrowMutedClass,
    iconButtonClass,
    iconButtonToneClass,
    panelClass,
    tagClass,
  } from "$lib/components/ui/system-ui";
  import { exportAndDownload } from "$lib/catalog/downloads/client";
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

  interface CategoryCount {
    lemmas: number;
    examples: number;
  }

  const EXPORT_URL = "/downloads/dictionary-export.json";

  const PACKS: Pack[] = [
    {
      id: "full",
      title: "Full dictionary",
      description: "Lemmas, glosses, related words and example sentences.",
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
      description: "Example sentences as cards: Slovak, then English.",
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

  const FORMATS: DownloadFormat[] = ["json", "csv", "tsv"];

  /**
   * Counts and categories come from the build, so the page and the dialog
   * render at once; the 6 MB export only loads when a download starts.
   */
  let {
    categories,
    categoryCounts,
    lemmaCount,
    exampleCount,
  }: {
    categories: string[];
    categoryCounts: Record<string, CategoryCount>;
    lemmaCount: number;
    exampleCount: number;
  } = $props();

  let loadState = $state<LoadState>("idle");
  let loadError = $state("");
  let exportFile = $state.raw<DictionaryExportFile | null>(null);

  let format = $state<DownloadFormat>("json");
  let customPack = $state<PackId>("full");
  let selectedCategories = $state<string[]>([...categories]);
  let busy = $state(false);
  let pendingPack = $state<PackId | "custom" | null>(null);
  let statusMessage = $state("");
  let dialogEl = $state<HTMLDialogElement | null>(null);
  let statusTimer: ReturnType<typeof setTimeout> | undefined;

  const allCategoriesSelected = $derived(selectedCategories.length === categories.length);
  const canDownloadCustom = $derived(selectedCategories.length > 0 && !busy);
  const rowsBusy = $derived(busy || loadState === "loading");

  const filteredCounts = $derived.by(() => {
    let lemmas = 0;
    let examples = 0;

    for (const category of selectedCategories) {
      const count = categoryCounts[category];
      if (!count) continue;
      lemmas += count.lemmas;
      examples += count.examples;
    }

    return { lemmas, examples };
  });

  async function ensureExportLoaded(): Promise<boolean> {
    if (exportFile) return true;
    if (loadState === "loading") return false;

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
    dialogEl?.showModal();
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
          ? "Downloaded the words and examples files."
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

  async function downloadPack(pack: Pack): Promise<void> {
    pendingPack = pack.id;

    try {
      const ready = await ensureExportLoaded();
      if (!ready) return;

      await runDownload({
        fields: pack.fields,
        exampleFields: pack.exampleFields,
        format: pack.format,
        categories,
        includeHeader: pack.includeHeader,
        includeAttributionComment: pack.includeAttributionComment,
      });
    } finally {
      pendingPack = null;
    }
  }

  async function downloadCustom(): Promise<void> {
    const pack = PACK_BY_ID[customPack];
    pendingPack = "custom";

    try {
      const ready = await ensureExportLoaded();
      if (!ready) {
        closeCustomize();
        return;
      }

      await runDownload({
        fields: pack.fields,
        exampleFields: pack.exampleFields,
        format: pack.id === "anki" ? "tsv" : format,
        categories: selectedCategories,
        includeHeader: pack.includeHeader,
        includeAttributionComment: pack.includeAttributionComment,
        closeModal: true,
      });
    } finally {
      pendingPack = null;
    }
  }

  function selectPack(pack: Pack): void {
    customPack = pack.id;

    if (pack.id === "anki") {
      format = "tsv";
    }
  }

  // Phones: the text takes the full row and the tag + button drop underneath.
  const rowClass =
    "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-slate-200/70 px-4 py-4 last:border-b-0 sm:px-5";

  const rowTextClass = "min-w-0 flex-1 basis-[16rem]";

  const rowActionsClass =
    "flex shrink-0 items-center gap-3 max-sm:w-full max-sm:justify-between";

  const rowTitleClass =
    "m-0 font-serif text-base font-semibold leading-snug text-slate-900";

  const rowNoteClass = "m-0 mt-0.5 text-sm leading-snug text-slate-600";

  const rowButtonClass = "min-h-9 px-3.5 text-sm";

  const inlineLinkClass =
    "cursor-pointer border-0 bg-transparent p-0 text-xs font-bold text-blue-800 hover:underline";

  const packOptionClass =
    "flex cursor-pointer items-start gap-3 border-b border-slate-200/70 px-4 py-3 transition-colors duration-150 ease-out last:border-b-0 hover:bg-subtle has-[:checked]:bg-blue-50/60";
</script>

{#if loadState === "error"}
  <div
    class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-(--control-radius) bg-rose-50 px-4 py-3 text-sm text-rose-900"
    role="alert"
  >
    <p class="m-0">{loadError}</p>

    <button class={inlineLinkClass} type="button" onclick={() => void loadExport()}>
      Retry
    </button>
  </div>
{/if}

<section class={dataPanelClass} aria-labelledby="downloads-packs">
  <h2 id="downloads-packs" class="sr-only">Downloads</h2>

  <div class={dataPanelHeadClass}>
    <p class={dataRangeClass}>
      <strong class="font-semibold tabular-nums text-slate-900">
        {lemmaCount.toLocaleString("en")} lemmas
      </strong>
      <span class="text-slate-400">·</span>
      <span class="tabular-nums">{exampleCount.toLocaleString("en")} sentences</span>
    </p>

    {#if loadState === "loading"}
      <DotLoader label="Preparing the file…" />
    {/if}
  </div>

  <ul class="m-0 list-none p-0">
    {#each PACKS as pack (pack.id)}
      <li class={rowClass}>
        <div class={rowTextClass}>
          <p class={rowTitleClass}>{pack.title}</p>
          <p class={rowNoteClass}>{pack.description}</p>
        </div>

        <div class={rowActionsClass}>
          <span class={tagClass}>{pack.formatNote}</span>

          <Button
            type="button"
            variant="secondary"
            class={rowButtonClass}
            disabled={rowsBusy}
            onclick={() => void downloadPack(pack)}
          >
            {pendingPack === pack.id ? "Preparing…" : "Download"}
          </Button>
        </div>
      </li>
    {/each}

    <li class={rowClass}>
      <div class={rowTextClass}>
        <p class={rowTitleClass}>Custom export</p>
        <p class={rowNoteClass}>
          Pick the pack, a format, and the categories to include.
        </p>
      </div>

      <div class={rowActionsClass}>
        <span class={tagClass}>JSON · CSV · TSV</span>

        <Button
          type="button"
          variant="secondary"
          class={rowButtonClass}
          disabled={rowsBusy}
          onclick={openCustomize}
        >
          Customize
        </Button>
      </div>
    </li>
  </ul>
</section>

{#if statusMessage}
  <div
    class="fixed bottom-6 left-1/2 z-50 max-w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 animate-rise rounded-(--control-radius) bg-surface px-4 py-3 text-sm text-slate-800 shadow-(--shadow-float)"
    role="status"
  >
    {statusMessage}
  </div>
{/if}

<dialog
  bind:this={dialogEl}
  class="m-auto w-[min(30rem,calc(100%-2rem))] max-h-[min(90vh,44rem)] overflow-hidden rounded-(--frame-radius) bg-surface p-0 text-slate-900 shadow-(--shadow-float) backdrop:bg-black/50"
  aria-labelledby="downloads-modal-title"
>
  <form
    class="flex max-h-[min(90vh,44rem)] flex-col"
    method="dialog"
    onsubmit={(event) => {
      event.preventDefault();
    }}
  >
    <header class="flex items-center justify-between gap-4 px-5 pt-4 pb-3 sm:px-6">
      <h2
        id="downloads-modal-title"
        class="m-0 font-serif text-xl tracking-tight text-slate-900"
      >
        Custom export
      </h2>

      <button
        type="button"
        class="{iconButtonClass} {iconButtonToneClass} -mr-1.5 size-9"
        aria-label="Close"
        onclick={closeCustomize}
      >
        <svg
          class="size-5 fill-none stroke-current stroke-2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </header>

    <div
      class="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-5 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent sm:px-6"
    >
      <div>
        <p id="downloads-pack-label" class="{eyebrowMutedClass} mb-2">Pack</p>

        <div
          class="{panelClass} overflow-hidden"
          role="radiogroup"
          aria-labelledby="downloads-pack-label"
        >
          {#each PACKS as pack (pack.id)}
            <label class={packOptionClass}>
              <input
                class="mt-0.5 size-4 shrink-0 accent-blue-600"
                type="radio"
                name="download-pack"
                value={pack.id}
                checked={customPack === pack.id}
                onchange={() => selectPack(pack)}
              />

              <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-900"
                  >{pack.title}</span
                >
                <span
                  class="mt-0.5 block text-xs leading-snug text-pretty text-slate-500"
                >
                  {pack.description}
                </span>
              </span>
            </label>
          {/each}
        </div>
      </div>

      <div class="mt-5">
        <p id="downloads-format-label" class="{eyebrowMutedClass} mb-2">Format</p>

        {#if customPack === "anki"}
          <p class="m-0 text-sm text-slate-600">
            Anki phrases is always a headerless TSV, Slovak then English.
          </p>
        {:else}
          <div
            class="flex flex-wrap gap-1.5"
            role="radiogroup"
            aria-labelledby="downloads-format-label"
          >
            {#each FORMATS as option (option)}
              <label class={chipClass(format === option)}>
                <input
                  class="sr-only"
                  type="radio"
                  name="download-format"
                  value={option}
                  checked={format === option}
                  onchange={() => {
                    format = option;
                  }}
                />
                <span class="uppercase">{option}</span>
              </label>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mt-5">
        <div class="mb-2 flex items-baseline justify-between gap-3">
          <p id="downloads-categories-label" class={eyebrowMutedClass}>Categories</p>

          <div class="flex gap-3">
            <button class={inlineLinkClass} type="button" onclick={selectAllCategories}>
              All
            </button>
            <button class={inlineLinkClass} type="button" onclick={clearCategories}>
              None
            </button>
          </div>
        </div>

        <div
          class="{panelClass} grid grid-cols-1 gap-x-6 px-4 py-2 sm:grid-cols-2"
          role="group"
          aria-labelledby="downloads-categories-label"
        >
          {#each categories as category (category)}
            <label
              class="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-slate-800"
            >
              <input
                type="checkbox"
                class="size-4 shrink-0 accent-blue-600"
                checked={selectedCategories.includes(category)}
                onchange={() => toggleCategory(category)}
              />
              <span class="min-w-0 flex-1">{category}</span>
              <span class="text-xs text-slate-400 tabular-nums">
                {categoryCounts[category]?.lemmas.toLocaleString("en") ?? ""}
              </span>
            </label>
          {/each}
        </div>

        <p class="m-0 mt-2 text-xs text-slate-500 tabular-nums" aria-live="polite">
          {#if selectedCategories.length === 0}
            Select at least one category.
          {:else if allCategoriesSelected}
            Everything: {filteredCounts.lemmas.toLocaleString("en")} lemmas,
            {filteredCounts.examples.toLocaleString("en")} sentences.
          {:else}
            {selectedCategories.length} of {categories.length} categories:
            {filteredCounts.lemmas.toLocaleString("en")} lemmas,
            {filteredCounts.examples.toLocaleString("en")} sentences.
          {/if}
        </p>
      </div>
    </div>

    <footer
      class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-subtle/60 px-5 py-4 sm:px-6"
    >
      <Button type="button" variant="secondary" onclick={closeCustomize}>Cancel</Button>

      <Button
        type="button"
        variant="accent"
        class="min-w-[9rem]"
        disabled={!canDownloadCustom}
        onclick={() => void downloadCustom()}
      >
        {pendingPack === "custom" ? "Preparing…" : "Download"}
      </Button>
    </footer>
  </form>
</dialog>
