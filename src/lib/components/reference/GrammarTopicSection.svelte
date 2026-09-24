<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    id,
    title,
    intro,
    children,
  }: {
    id: string;
    title: string;
    intro?: string;
    children: Snippet;
  } = $props();
</script>

<section {id} class="scroll-mt-24" aria-labelledby="{id}-heading">
  <h2
    id="{id}-heading"
    class="m-0 font-serif text-xl tracking-tight text-balance text-slate-900 sm:text-2xl"
  >
    {title}
  </h2>

  {#if intro}
    <p class="m-0 mt-1.5 max-w-[62ch] text-sm leading-relaxed text-pretty text-slate-600">
      {intro}
    </p>
  {/if}

  <div class="mt-4">
    {@render children()}
  </div>
</section>
