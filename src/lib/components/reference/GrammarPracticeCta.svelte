<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import { practiceItemHref } from "$lib/catalog/practice";

  let { itemId }: { itemId: string } = $props();

  const href = $derived(practiceItemHref(itemId));
</script>

{#if href}
  <a
    class="mt-2.5 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-blue-800 underline underline-offset-2"
    {href}
  >
    Practice this <ArrowRight />
  </a>
{/if}
