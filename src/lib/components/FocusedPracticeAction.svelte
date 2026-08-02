<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import {
    readPracticeState,
    saveReferenceItem,
    writePracticeState,
  } from "$lib/client/practice-state";

  let { itemId }: { itemId: string } = $props();

  function save(): void {
    const current = readPracticeState(localStorage);
    writePracticeState(localStorage, saveReferenceItem(current, itemId));
  }
</script>

<a
  class="mt-2.5 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-blue-800 underline underline-offset-2"
  href="/practice/reference/{itemId}"
  onclick={save}
>
  Practice this <ArrowRight />
</a>
