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
  <span class="mb-4 block h-3 w-28 animate-pulse rounded-sm bg-slate-200"></span>

  <section
    class="border border-slate-200 bg-surface/90 px-7 py-8 max-[560px]:px-4 max-[560px]:py-6"
  >
    <span class="mb-3 block h-3 w-20 animate-pulse rounded-sm bg-slate-200"></span>

    <div class="grid gap-2">
      <span class="h-6 w-full animate-pulse rounded-sm bg-slate-200"></span>
      <span class="h-6 w-[55%] animate-pulse rounded-sm bg-slate-200"></span>
    </div>

    <div class="mt-7 grid gap-2.5" aria-hidden="true">
      {#each [0, 1, 2] as row (row)}
        <div
          class="press-key flex min-h-14 items-center rounded-(--control-radius) px-4 py-3.5"
        >
          <span class="block h-5 w-[85%] animate-pulse rounded-sm bg-slate-200"></span>
        </div>
      {/each}
    </div>

    <div class="mt-7 flex items-center gap-4">
      <span class="h-11 w-[5.5rem] animate-pulse rounded-sm bg-slate-200"></span>
      <span class="h-3 w-24 animate-pulse rounded-sm bg-slate-200"></span>
    </div>
  </section>
</div>
