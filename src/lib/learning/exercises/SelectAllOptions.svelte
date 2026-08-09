<script lang="ts">
  import ClockIllustration from "$lib/learning/time/ClockIllustration.svelte";
  import type { SelectAllExercise } from "$lib/learning/types";

  let {
    choices,
    promptClock,
    selectedIds = $bindable(new Set<string>()),
    submitted,
  }: {
    choices: SelectAllExercise["choices"];
    promptClock?: SelectAllExercise["clock"];
    selectedIds?: Set<string>;
    submitted: boolean;
  } = $props();

  function toggle(id: string): void {
    if (submitted) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selectedIds = next;
  }
</script>

{#if promptClock}
  <div class="mt-6 flex justify-center">
    <ClockIllustration hour={promptClock.hour} minute={promptClock.minute} size={120} />
  </div>
{/if}

<div class="mt-6 grid gap-2.5" aria-label="Answer choices">
  {#each choices as choice (choice.id)}
    <button
      class="press-key min-h-14 w-full cursor-pointer rounded-(--control-radius) border px-4 py-3.5 text-left font-serif text-base font-semibold"
      class:border-blue-600={selectedIds.has(choice.id)}
      class:bg-blue-50={selectedIds.has(choice.id)}
      class:border-slate-300={!selectedIds.has(choice.id)}
      disabled={submitted}
      type="button"
      aria-pressed={selectedIds.has(choice.id)}
      onclick={() => toggle(choice.id)}
    >
      <span class="flex items-start gap-3">
        <span
          class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-400 text-xs"
          class:bg-blue-600={selectedIds.has(choice.id)}
          class:text-white={selectedIds.has(choice.id)}
          aria-hidden="true"
        >
          {#if selectedIds.has(choice.id)}
            ✓
          {/if}
        </span>
        <span lang="sk">{choice.label}</span>
      </span>
    </button>
  {/each}
</div>
