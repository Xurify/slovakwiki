<script lang="ts">
  import { CEFR_ANCHOR, CEFR_LEVELS, cefrForScore } from "$lib/level-test/scale";

  let {
    score,
    compact = false,
  }: {
    score: number;
    compact?: boolean;
  } = $props();

  const current = $derived(cefrForScore(score));
</script>

<div class="grid gap-1.5" aria-hidden="true">
  <div class="relative {compact ? 'h-1.5' : 'h-2.5'} rounded-full bg-slate-200">
    <div
      class="absolute inset-y-0 left-0 rounded-full bg-blue-600"
      style:width={`${Math.max(2, Math.min(100, score))}%`}
    ></div>
  </div>

  {#if !compact}
    <div class="relative h-4 text-[0.68rem] font-semibold">
      {#each CEFR_LEVELS as level (level)}
        <span
          class="absolute -translate-x-1/2 {level === current
            ? 'text-blue-800'
            : 'text-slate-400'}"
          style:left={`${Math.min(96, Math.max(4, CEFR_ANCHOR[level]))}%`}
        >
          {level}
        </span>
      {/each}
    </div>
  {/if}
</div>
