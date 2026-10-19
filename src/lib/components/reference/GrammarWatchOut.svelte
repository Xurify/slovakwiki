<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import { splitRichText } from "$lib/components/practice/practice-feedback-ui";

  /** `**form**` marks the correct Slovak; `*form*` marks the one to avoid. */
  let { text }: { text: string } = $props();

  const parts = $derived(splitRichText(text));
</script>

<div
  id="watch-out"
  class="mt-6 max-w-[62ch] rounded-(--control-radius) bg-rose-50 px-4 py-3.5 ring-1 ring-rose-600/15 ring-inset"
>
  <Eyebrow tone="caution">Watch out</Eyebrow>

  <p class="m-0 text-[1.02rem] leading-relaxed text-pretty text-slate-800">
    {#each parts as part, index (`${part.type}-${index}`)}
      {#if part.type === "em"}
        <strong class="font-semibold text-slate-900" lang="sk">{part.value}</strong>
      {:else if part.type === "i"}
        <s class="text-slate-600 decoration-rose-600/60" lang="sk">{part.value}</s>
      {:else}
        {part.value}
      {/if}
    {/each}
  </p>
</div>
