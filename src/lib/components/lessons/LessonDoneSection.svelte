<script lang="ts">
  import type { Snippet } from "svelte";

  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";

  let {
    id,
    title,
    count,
    children,
  }: {
    id: string;
    title: string;
    /** After the title, e.g. how many checks to review. */
    count?: number;
    children: Snippet;
  } = $props();
</script>

<section aria-labelledby={id}>
  <h3 {id} class="{eyebrowMutedClass} mb-4 flex items-center gap-2">
    {title}

    {#if count !== undefined}
      <span class="font-normal text-slate-500">· {count}</span>
    {/if}
  </h3>

  {@render children()}
</section>
