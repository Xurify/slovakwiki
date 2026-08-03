<script lang="ts">
  /**
   * Hydration placeholder for the lesson practice block (step label + LessonInteraction).
   * Keep layout in sync with LessonPage.svelte + LessonInteraction.svelte when those
   * UIs change drastically.
   */
  let { class: className = "" }: { class?: string } = $props();
</script>

<div
  class={className}
  aria-busy="true"
  aria-live="polite"
  aria-label="Loading your lesson"
>
  <span class="mb-3 block h-3 w-28 animate-pulse rounded-sm bg-slate-200"></span>

  <section
    class="border border-slate-200 bg-surface/90 p-7 max-[560px]:px-4 max-[560px]:py-5"
  >
    <span class="mb-3 block h-3 w-20 animate-pulse rounded-sm bg-slate-200"></span>

    <div class="grid max-w-[31ch] gap-2.5">
      <span class="h-8 w-full animate-pulse rounded-sm bg-slate-200"></span>
      <span class="h-8 w-[65%] animate-pulse rounded-sm bg-slate-200"></span>
    </div>

    <div class="mt-6 grid border-t border-slate-200" aria-hidden="true">
      {#each [0, 1, 2] as row (row)}
        <div class="border-b border-slate-200 px-3 py-4">
          <span class="block h-5 w-[85%] animate-pulse rounded-sm bg-slate-200"></span>
        </div>
      {/each}
    </div>

    <div class="mt-6 flex items-center gap-4">
      <span class="h-11 w-[5.5rem] animate-pulse rounded-sm bg-slate-200"></span>
      <span class="h-3 w-24 animate-pulse rounded-sm bg-slate-200"></span>
    </div>
  </section>
</div>
