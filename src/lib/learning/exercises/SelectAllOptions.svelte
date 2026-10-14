<script lang="ts">
  import PromptClock from "$lib/learning/time/PromptClock.svelte";
  import type { SelectAllExercise } from "$lib/learning/types";

  import { choiceRowIdleClass, optionGradedClass, optionRowClass } from "./option-ui";
  import { selectAllRowMarker, selectAllRowState } from "./select-all";

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

  function rowButtonClass(
    state: ReturnType<typeof selectAllRowState>,
    submitted: boolean,
  ): string {
    if (!submitted) return choiceRowIdleClass;
    if (state === "correct-selected")
      return `${optionRowClass} ${optionGradedClass("right")}`;
    if (state === "correct-missed")
      return `${optionRowClass} ${optionGradedClass("missed")}`;
    if (state === "wrong-selected")
      return `${optionRowClass} ${optionGradedClass("wrong")}`;
    return optionRowClass;
  }

  function rowCheckboxClass(
    state: ReturnType<typeof selectAllRowState>,
    selected: boolean,
  ): string {
    if (state === "correct-selected") {
      return "border-emerald-600 bg-emerald-600 text-paper";
    }
    if (state === "correct-missed") {
      return "border-dashed border-slate-400 bg-paper text-slate-600";
    }
    if (state === "wrong-selected") {
      return "border-rose-600 bg-rose-600 text-paper";
    }
    if (!state && selected) {
      return "border-blue-600 bg-blue-600 text-paper";
    }
    return "border-slate-400";
  }

  function rowStatusLabel(state: ReturnType<typeof selectAllRowState>): string | null {
    if (!state) return null;
    if (state === "correct-selected") return "Correct — you picked it";
    if (state === "correct-missed") return "Correct — you missed it";
    if (state === "wrong-selected") return "Wrong — you picked it";
    return "Wrong — left alone";
  }
</script>

{#if promptClock}
  <PromptClock hour={promptClock.hour} minute={promptClock.minute} {submitted} />
{/if}

<div class="mt-6 grid gap-2.5" aria-label="Answer choices">
  {#each choices as choice (choice.id)}
    {@const selected = selectedIds.has(choice.id)}
    {@const rowState = selectAllRowState(choice, selectedIds, submitted)}
    {@const marker = selectAllRowMarker(rowState, selected)}
    {@const statusLabel = rowStatusLabel(rowState)}

    <button
      class={rowButtonClass(rowState, submitted)}
      disabled={submitted}
      type="button"
      aria-pressed={submitted ? false : selected}
      aria-label={statusLabel ? `${choice.label} — ${statusLabel}` : choice.label}
      onclick={() => toggle(choice.id)}
    >
      <span
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-semibold transition-colors duration-150 {rowCheckboxClass(
          rowState,
          selected,
        )}"
        aria-hidden="true"
      >
        {#if marker}
          {marker}
        {/if}
      </span>

      <span class="grid min-w-0 flex-1 gap-0.5">
        <span lang="sk">{choice.label}</span>

        {#if statusLabel}
          <span class="font-sans text-xs text-slate-500">{statusLabel}</span>
        {/if}
      </span>
    </button>
  {/each}
</div>
