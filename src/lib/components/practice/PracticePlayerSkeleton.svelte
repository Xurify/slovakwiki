<script lang="ts">
  /**
   * Hydration placeholder for PracticePlayer.
   * Keep layout in sync with PracticePlayer.svelte when that UI changes drastically.
   */
  let { class: className = "" }: { class?: string } = $props();
</script>

<div
  class="mx-auto w-full max-w-[640px] {className}"
  aria-busy="true"
  aria-live="polite"
  aria-label="Loading practice"
>
  <header class="mb-6 grid gap-3" aria-hidden="true">
    <div class="flex items-center justify-between">
      <span class="size-9 animate-pulse rounded-full bg-slate-200"></span>
      <span class="h-3 w-10 animate-pulse rounded-sm bg-slate-200"></span>
    </div>

    <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
      <span class="block h-full w-0 rounded-full bg-slate-300"></span>
    </div>
  </header>

  <section
    class="overflow-hidden rounded-(--frame-radius) border border-slate-200 bg-surface shadow-(--shadow-border)"
    aria-hidden="true"
  >
    <div class="px-7 py-8 max-[560px]:px-4 max-[560px]:py-6">
      <span class="mb-5 block h-3 w-28 animate-pulse rounded-sm bg-slate-200"></span>

      <div
        class="my-5 rounded-(--control-radius) border border-slate-200 bg-slate-50 px-4 py-3.5"
      >
        <span class="block h-6 w-3/4 animate-pulse rounded-sm bg-slate-200"></span>
        <span class="mt-2 block h-4 w-1/2 animate-pulse rounded-sm bg-slate-100"></span>
      </div>

      <span class="block h-6 w-full animate-pulse rounded-sm bg-slate-200"></span>
      <span class="mt-2 block h-6 w-[65%] animate-pulse rounded-sm bg-slate-200"></span>

      <span
        class="mt-6 block h-[3.25rem] w-full animate-pulse rounded-(--control-radius) border border-slate-200 bg-slate-50"
      ></span>

      <div class="mt-3 flex flex-wrap gap-1.5">
        {#each [0, 1, 2, 3, 4, 5, 6, 7] as chip (chip)}
          <span class="h-8 w-9 animate-pulse rounded-(--control-radius) bg-slate-100"
          ></span>
        {/each}
      </div>
    </div>

    <footer class="border-t border-slate-200 bg-paper/70 px-7 py-4 max-[560px]:px-4">
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <span class="h-4 w-24 animate-pulse rounded-sm bg-slate-200"></span>
        <span
          class="h-11 w-full animate-pulse rounded-(--control-radius) bg-slate-200 sm:w-36"
        ></span>
      </div>
    </footer>
  </section>
</div>
