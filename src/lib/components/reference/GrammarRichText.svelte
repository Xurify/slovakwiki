<script lang="ts">
  import { splitRichText } from "$lib/components/practice/practice-feedback-ui";

  /** `**form**` marks Slovak to notice; `*form*` marks a form to avoid. */
  let { text }: { text: string } = $props();

  const parts = $derived(splitRichText(text));
</script>

{#each parts as part, index (`${part.type}-${index}`)}
  {#if part.type === "em"}
    <strong class="font-semibold text-slate-900" lang="sk">{part.value}</strong>
  {:else if part.type === "i"}
    <s class="text-slate-600 decoration-rose-600/60" lang="sk">{part.value}</s>
  {:else}
    {part.value}
  {/if}
{/each}
