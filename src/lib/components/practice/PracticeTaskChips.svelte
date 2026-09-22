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
      ? "inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600"
      : "inline-flex items-center rounded-full border border-slate-200 px-2 py-px text-[0.68rem] font-semibold text-slate-600",
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
