<script lang="ts">
  import type { Snippet } from "svelte";

  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";

  import { grammarNoteClass } from "$lib/components/reference/grammar-topic-ui";

  let {
    id,
    index,
    label,
    title,
    intro,
    action,
    children,
  }: {
    id: string;
    /** Two-digit section number shown in the margin, like the home page. */
    index: string;
    label: string;
    title: string;
    intro?: string;
    action?: Snippet;
    children: Snippet;
  } = $props();
</script>

<section
  {id}
  class="grid scroll-mt-24 grid-cols-[7rem_minmax(0,1fr)] gap-x-14 border-t border-slate-200 py-16 max-[880px]:grid-cols-1 max-[880px]:gap-y-6 max-[880px]:py-12"
  aria-labelledby="{id}-heading"
>
  <div
    class="sticky top-[calc(var(--header-height)+2rem)] self-start max-[880px]:static max-[880px]:flex max-[880px]:items-baseline max-[880px]:gap-3"
  >
    <p
      class="m-0 font-serif text-[1.7rem] leading-none font-semibold tracking-[-0.05em] text-slate-300 tabular-nums"
    >
      {index}
    </p>

    <Eyebrow class="mt-3.5 max-[880px]:mt-0">{label}</Eyebrow>
  </div>

  <div class="min-w-0">
    <div class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
      <h2 id="{id}-heading" class="m-0 text-balance">{title}</h2>

      {#if action}
        {@render action()}
      {/if}
    </div>

    {#if intro}
      <p class={[grammarNoteClass, "mt-4"]}>{intro}</p>
    {/if}

    <div class="mt-9 max-[880px]:mt-7">
      {@render children()}
    </div>
  </div>
</section>
