<script lang="ts">
  let {
    activeIndex = 0,
    backHref,
    backLabel = "Practice",
    complete = false,
    sessionTitle,
    total,
  }: {
    activeIndex?: number;
    backHref?: string;
    backLabel?: string;
    complete?: boolean;
    sessionTitle?: string;
    total: number;
  } = $props();

  const displayIndex = $derived(complete ? total : activeIndex + 1);
  const progressPercent = $derived(
    complete || total <= 0 ? 100 : (activeIndex / total) * 100,
  );
</script>

<header class="mb-6 grid gap-3">
  <div class="flex items-center gap-3">
    {#if backHref}
      <a
        class="inline-grid size-9 shrink-0 place-items-center rounded-full border border-slate-300 bg-surface text-slate-700 shadow-(--shadow-border) transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-slate-400 hover:bg-slate-50 hover:shadow-(--shadow-border-hover) active:scale-[0.98]"
        href={backHref}
        aria-label={`Back to ${backLabel}`}
      >
        <svg
          class="size-5 fill-none stroke-current"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </a>
    {/if}

    {#if complete}
      <p class="m-0 min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
        {sessionTitle}
      </p>

      <span
        class="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-emerald-800 uppercase"
      >
        Done
      </span>
    {:else}
      <span class="flex-1" aria-hidden="true"></span>

      <span
        class="shrink-0 text-xs font-semibold tabular-nums text-slate-500"
        aria-label={`Question ${displayIndex} of ${total}`}
      >
        {displayIndex} / {total}
      </span>
    {/if}
  </div>

  {#if !complete}
    <div class="h-1.5 overflow-hidden rounded-full bg-slate-200/80" aria-hidden="true">
      <span
        class="block h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
        style:width={`${progressPercent}%`}
      ></span>
    </div>
  {/if}
</header>
