<script lang="ts">
  import GlossWithTerms from "$lib/components/dictionary/GlossWithTerms.svelte";

  /** Numbered English meanings of one sense. */
  let {
    glosses,
    class: className = "",
  }: {
    glosses: string[];
    class?: string;
  } = $props();
</script>

<ol class="m-0 list-none p-0 {className}">
  {#each glosses as gloss, index (gloss)}
    <li class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-x-2 py-1">
      <span class="text-xs font-bold tabular-nums text-slate-500">{index + 1}</span>
      <span class="text-lg leading-snug font-semibold text-slate-900">
        <GlossWithTerms text={gloss} />
      </span>
    </li>
  {/each}
</ol>
