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
  <div class="flex justify-between gap-5">
    <span class="h-3 w-16 animate-pulse rounded-sm bg-slate-200"></span>
    <span class="h-3 w-12 animate-pulse rounded-sm bg-slate-200"></span>
  </div>

  <div class="mt-3 h-1 overflow-hidden bg-slate-200">
    <span class="block h-full w-1/4 animate-pulse bg-slate-300"></span>
  </div>

  <div class="mt-8 grid max-w-[25ch] gap-2.5">
    <span class="h-8 w-full animate-pulse rounded-sm bg-slate-200"></span>
    <span class="h-8 w-[70%] animate-pulse rounded-sm bg-slate-200"></span>
  </div>

  <div class="mt-7 grid gap-2">
    {#each [0, 1, 2] as row (row)}
      <div
        class="min-h-14 w-full animate-pulse rounded border border-slate-200 bg-slate-100"
      ></div>
    {/each}
  </div>

  <div class="mt-6 flex items-center gap-4">
    <span class="h-11 w-[5.5rem] animate-pulse rounded-sm bg-slate-200"></span>
  </div>
</section>
