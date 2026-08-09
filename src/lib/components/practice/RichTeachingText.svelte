<script lang="ts">
  import { splitRichText } from "$lib/components/practice/practice-feedback-ui";

  let {
    text,
    class: className = "",
  }: {
    text: string;
    class?: string;
  } = $props();

  const parts = $derived(splitRichText(text));
</script>

<p class="m-0 font-serif {className}">
  {#each parts as part, index (`${part.type}-${index}`)}
    {#if part.type === "em"}
      <strong class="font-semibold text-slate-900">{part.value}</strong>
    {:else if part.type === "i"}
      <em class="font-semibold not-italic text-slate-800">{part.value}</em>
    {:else}
      {part.value}
    {/if}
  {/each}
</p>
