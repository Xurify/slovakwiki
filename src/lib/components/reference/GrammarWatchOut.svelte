<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";

  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";

  /** One trap per item. `**form**` marks the correct Slovak; `*form*` the one to avoid. */
  let { items }: { items: string[] } = $props();
</script>

<div
  id="watch-out"
  class="mt-6 max-w-[62ch] rounded-(--control-radius) bg-rose-50 px-4 py-3.5 ring-1 ring-rose-600/15 ring-inset"
>
  <Eyebrow tone="caution">Watch out</Eyebrow>

  <ul class="m-0 list-none p-0">
    {#each items as item (item)}
      <li
        class="border-t border-rose-600/15 py-2 text-[1.02rem] leading-relaxed text-pretty text-slate-800 first:border-t-0 first:pt-0 last:pb-0"
      >
        <GrammarRichText text={item} />
      </li>
    {/each}
  </ul>
</div>
