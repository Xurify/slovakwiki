<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import type { ReferenceNeighbors } from "$lib/catalog/reference/grammar-path";

  let {
    neighbors,
    nextLabel = "Next topic",
    previousLabel = "Previous",
    slovakNames = true,
  }: {
    neighbors: ReferenceNeighbors;
    nextLabel?: string;
    previousLabel?: string;
    /** When false, the secondary line is English (e.g. case questions). */
    slovakNames?: boolean;
  } = $props();

  const next = $derived(neighbors.next);
  const previous = $derived(neighbors.previous);
</script>

{#if next || previous}
  <nav
    class="mt-12 grid gap-3 border-t border-slate-200 pt-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
    aria-label="Topic navigation"
  >
    {#if previous}
      <a
        class="group flex min-w-0 flex-col justify-center rounded-(--frame-radius) px-4 py-3 no-underline transition-colors duration-150 hover:bg-surface/70 max-sm:order-2"
        href={previous.href}
      >
        <span class="text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
          <span aria-hidden="true">←</span>
          {previousLabel}
        </span>

        <span
          class="mt-1 font-serif text-base leading-snug tracking-tight text-blue-800 group-hover:underline"
        >
          {previous.title}
        </span>
      </a>
    {:else}
      <span class="max-sm:hidden"></span>
    {/if}

    {#if next}
      <a
        class="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-(--frame-radius) bg-surface px-5 py-4 no-underline shadow-(--shadow-border) transition-[box-shadow] duration-150 hover:shadow-(--shadow-border-hover)"
        href={next.href}
      >
        <span class="min-w-0">
          <span
            class="block text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
          >
            {nextLabel}
          </span>

          <span
            class="mt-1 block font-serif text-lg leading-snug tracking-tight text-balance text-blue-800 group-hover:underline"
          >
            {next.title}
          </span>

          <span
            class="mt-0.5 block text-sm leading-snug text-slate-500"
            lang={slovakNames ? "sk" : undefined}
          >
            {next.slovak}
          </span>
        </span>

        <span
          class="flex size-9 items-center justify-center rounded-full bg-blue-600 text-paper transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <ArrowRight />
        </span>
      </a>
    {/if}
  </nav>
{/if}
