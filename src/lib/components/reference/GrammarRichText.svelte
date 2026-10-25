<script lang="ts">
  import { splitGrammarRichText } from "$lib/components/reference/grammar-rich-text";

  /** `**form**` marks Slovak to notice; `*form*` marks a form to avoid; `[text](/path)` links a page. */
  let { text }: { text: string } = $props();

  const parts = $derived(splitGrammarRichText(text));
</script>

{#each parts as part, index (`${part.type}-${index}`)}
  {#if part.type === "em"}
    <strong class="font-semibold text-slate-900" lang="sk">{part.value}</strong>
  {:else if part.type === "i"}
    <s class="text-slate-600 decoration-rose-600/60" lang="sk">{part.value}</s>
  {:else if part.type === "link"}
    <a
      href={part.href}
      class="font-semibold text-blue-800 underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)] underline-offset-[3px] hover:decoration-current"
      >{part.value}</a
    >
  {:else}
    {part.value}
  {/if}
{/each}
