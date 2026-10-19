<script lang="ts">
  import { splitRichText } from "$lib/components/practice/practice-feedback-ui";

  /** `**ten**` takes the scene's mark color, so a note points at the same word the dialogue lit up. */
  let {
    text,
    markClass = "text-mark-time",
  }: {
    text: string;
    /** Inverse panels pass their own ink; the mark color is tuned for paper. */
    markClass?: string;
  } = $props();

  const parts = $derived(splitRichText(text));
</script>

{#each parts as part, index (`${part.type}-${index}`)}
  {#if part.type === "em"}
    <strong class="font-semibold {markClass}" lang="sk">{part.value}</strong>
  {:else if part.type === "i"}
    <em lang="sk">{part.value}</em>
  {:else}
    {part.value}
  {/if}
{/each}
