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
  const clampedScore = $derived(Math.max(2, Math.min(100, score)));
</script>

<div class="grid gap-1.5" aria-hidden="true">
  <div
    class="relative {compact ? 'h-1.5' : 'h-2.5'} overflow-visible rounded-full bg-slate-200"
  >
    <div
      class="h-full rounded-full bg-blue-600 transition-all duration-300"
      style:width={`${clampedScore}%`}
    ></div>

    {#if !compact}
      <div
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 border-surface bg-blue-600 shadow-xs transition-all duration-300"
        style:left={`${clampedScore}%`}
      ></div>
    {/if}
  </div>

  {#if !compact}
    <div class="relative h-4 text-xs font-semibold">
      {#each CEFR_LEVELS as level (level)}
        <span
          class="absolute -translate-x-1/2 transition-colors {level === current
            ? 'font-bold text-blue-600'
            : 'text-slate-600'}"
          style:left={`${Math.min(96, Math.max(4, CEFR_ANCHOR[level]))}%`}
        >
          {level}
        </span>
      {/each}
    </div>
  {/if}
</div>
