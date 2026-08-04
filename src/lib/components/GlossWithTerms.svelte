<script lang="ts">
  import { splitGlossGrammarTerms } from "$lib/content/gloss-grammar-terms";

  let {
    text,
    variant = "default",
  }: {
    text: string;
    variant?: "default" | "inverse";
  } = $props();

  const segments = $derived(splitGlossGrammarTerms(text));
  const tipIdPrefix = $derived(
    `gloss-tip-${text
      .slice(0, 24)
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()}`,
  );

  const termClass = $derived(
    variant === "inverse"
      ? "relative inline rounded-sm underline decoration-dotted decoration-panel-inverse-ink/45 underline-offset-[3px] transition-colors hover:decoration-panel-inverse-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panel-inverse-ink"
      : "relative inline rounded-sm text-blue-800 underline decoration-dotted decoration-blue-800/45 underline-offset-[3px] transition-colors hover:decoration-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
  );

  const tipClass = $derived(
    variant === "inverse"
      ? "pointer-events-none absolute bottom-[calc(100%+0.4rem)] left-1/2 z-20 w-max max-w-[min(18rem,70vw)] -translate-x-1/2 rounded border border-slate-200 bg-paper px-2.5 py-1.5 font-sans text-xs font-normal leading-snug text-slate-900 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      : "pointer-events-none absolute bottom-[calc(100%+0.4rem)] left-1/2 z-20 w-max max-w-[min(18rem,70vw)] -translate-x-1/2 rounded border border-slate-200 bg-white px-2.5 py-1.5 font-sans text-xs font-normal leading-snug text-slate-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
  );
</script>

{#each segments as segment, index (`${segment.type}-${index}`)}
  {#if segment.type === "text"}
    {segment.value}
  {:else}
    {@const tipId = `${tipIdPrefix}-${index}`}
    <a class={`group ${termClass}`} href={segment.term.href} aria-describedby={tipId}>
      {segment.value}
      <span id={tipId} class={tipClass} role="tooltip">
        {segment.term.tip}
      </span>
    </a>
  {/if}
{/each}
