<script lang="ts">
  import {
    practiceTaskKindLabel,
    type PracticeTaskKind,
  } from "$lib/catalog/practice/hub";

  let {
    kinds,
    size = "sm",
    class: className = "",
  }: {
    kinds: PracticeTaskKind[];
    size?: "sm" | "md";
    class?: string;
  } = $props();

  const chipClass = $derived(
    size === "md"
      ? "inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200/90 ring-inset"
      : "inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[0.68rem] font-bold text-slate-600 ring-1 ring-slate-200/90 ring-inset",
  );
</script>

{#if kinds.length > 0}
  <ul
    class="m-0 flex list-none flex-wrap gap-1.5 p-0 {className}"
    aria-label="Exercise types"
  >
    {#each kinds as kind (kind)}
      <li class={chipClass}>
        {practiceTaskKindLabel[kind]}
      </li>
    {/each}
  </ul>
{/if}
