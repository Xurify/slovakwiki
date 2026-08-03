<script lang="ts">
  /**
   * Hydration placeholder for PracticePlayer.
   * Keep layout in sync with PracticePlayer.svelte when that UI changes drastically.
   */
  let {
    mode = "topic",
    class: className = "",
  }: {
    mode?: "review" | "topic";
    class?: string;
  } = $props();

  const label = mode === "review" ? "Loading Review" : "Loading practice";
</script>

<section
  class="max-w-[720px] {className}"
  aria-busy="true"
  aria-live="polite"
  aria-label={label}
>
  <div class="flex justify-end" aria-hidden="true">
    <span class="h-3 w-12 animate-pulse rounded-sm bg-slate-200"></span>
  </div>

  <div class="mt-3 h-1 overflow-hidden bg-slate-200">
    <span class="block h-full w-0 bg-slate-300"></span>
  </div>

  <div class="mt-8 grid gap-2">
    <span class="h-6 w-full animate-pulse rounded-sm bg-slate-200"></span>
    <span class="h-6 w-[55%] animate-pulse rounded-sm bg-slate-200"></span>
  </div>

  <div class="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
    <div class="grid gap-3">
      <div class="flex flex-wrap items-baseline gap-2">
        <span class="h-8 w-24 animate-pulse rounded-sm bg-slate-200"></span>
        <span
          class="h-9 min-w-[7ch] animate-pulse rounded-sm border-b-2 border-slate-300 bg-slate-100"
        ></span>
        <span class="h-8 w-20 animate-pulse rounded-sm bg-slate-200"></span>
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="h-5 w-28 animate-pulse rounded-sm bg-slate-200"></span>
        <span class="h-6 w-32 animate-pulse rounded-full bg-slate-200"></span>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each [0, 1, 2, 3, 4, 5] as chip (chip)}
          <span class="h-8 w-9 animate-pulse rounded-sm bg-slate-100"></span>
        {/each}
      </div>
    </div>

    <div class="hidden border-t border-slate-200 pt-3 lg:block">
      <span class="mb-2 block h-3 w-16 animate-pulse rounded-sm bg-slate-200"></span>
      <span class="block h-16 w-full animate-pulse rounded-sm bg-slate-100"></span>
    </div>
  </div>

  <div class="mt-6 flex items-center gap-4">
    <span class="h-11 w-[5.5rem] animate-pulse rounded-sm bg-slate-200"></span>
  </div>
</section>
