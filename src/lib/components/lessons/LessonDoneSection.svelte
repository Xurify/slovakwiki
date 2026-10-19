<script lang="ts">
  import type { Snippet } from "svelte";

  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import CountBadge from "$lib/components/ui/CountBadge.svelte";

  let {
    id,
    title,
    count,
    children,
  }: {
    id: string;
    title: string;
    /** Rose badge after the title, e.g. how many checks to review. */
    count?: number;
    children: Snippet;
  } = $props();
</script>

<section aria-labelledby={id}>
  <h3 {id} class="{eyebrowMutedClass} mb-4 flex items-center gap-2">
    {title}

    {#if count !== undefined}
      <CountBadge {count} tone="rose" />
    {/if}
  </h3>

  {@render children()}
</section>
