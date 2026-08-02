<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  let { itemId }: { itemId: string } = $props();
</script>

<a
  class="mt-2.5 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-blue-800 underline underline-offset-2"
  href="/practice/reference/{itemId}"
>
  Practice this <ArrowRight />
</a>
