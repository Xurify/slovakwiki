<script lang="ts">
  import ClockIllustration from "$lib/learning/time/ClockIllustration.svelte";
  import type { SelectAllExercise } from "$lib/learning/types";

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

  const idleRowShell =
    "press-key min-h-14 w-full rounded-(--control-radius) border px-4 py-3.5 text-left font-serif text-base font-semibold";

  const gradedRowShell =
    "min-h-14 w-full rounded-(--control-radius) border-2 px-4 py-3.5 text-left font-serif text-base font-semibold";

  function rowButtonClass(
    state: ReturnType<typeof selectAllRowState>,
    submitted: boolean,
  ): string {
    if (!submitted) {
      return `${idleRowShell} cursor-pointer border-slate-300`;
    }

    if (state === "correct-selected") {
      return `${gradedRowShell} cursor-default border-emerald-600 bg-emerald-50 shadow-[0_2px_0_0_var(--green)]`;
    }
    if (state === "correct-missed") {
      return `${gradedRowShell} cursor-default border-dashed border-slate-400 bg-paper shadow-none`;
    }
    if (state === "wrong-selected") {
      return `${gradedRowShell} cursor-default border-rose-600 bg-rose-50 shadow-[0_2px_0_0_var(--action)]`;
    }
    return `${gradedRowShell} cursor-default border-slate-300 bg-surface shadow-[0_2px_0_0_var(--line-strong)]`;
  }

  function rowCheckboxClass(
    state: ReturnType<typeof selectAllRowState>,
    selected: boolean,
  ): string {
    if (state === "correct-selected") {
      return "border-emerald-600 bg-emerald-600 text-white";
    }
    if (state === "correct-missed") {
      return "border-dashed border-slate-400 bg-paper text-slate-600";
    }
    if (state === "wrong-selected") {
      return "border-rose-600 bg-rose-600 text-white";
    }
    if (!state && selected) {
      return "border-blue-600 bg-blue-600 text-white";
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
  <div class="mt-6 flex justify-center">
    <ClockIllustration hour={promptClock.hour} minute={promptClock.minute} size={120} />
  </div>
{/if}

<div class="mt-6 grid gap-2.5" aria-label="Answer choices">
  {#each choices as choice (choice.id)}
    {@const selected = selectedIds.has(choice.id)}
    {@const rowState = selectAllRowState(choice, selectedIds, submitted)}
    {@const marker = selectAllRowMarker(rowState, selected)}
    {@const statusLabel = rowStatusLabel(rowState)}

    <button
      class={rowButtonClass(rowState, submitted)}
      class:border-blue-600={!rowState && selected && !submitted}
      class:bg-blue-50={!rowState && selected && !submitted}
      class:shadow-[0_2px_0_0_var(--accent)]={!rowState && selected && !submitted}
      disabled={submitted}
      type="button"
      aria-pressed={submitted ? false : selected}
      aria-label={statusLabel ? `${choice.label} — ${statusLabel}` : choice.label}
      onclick={() => toggle(choice.id)}
    >
      <span class="flex items-start gap-3">
        <span
          class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-semibold {rowCheckboxClass(
            rowState,
            selected,
          )}"
          aria-hidden="true"
        >
          {#if marker}
            {marker}
          {/if}
        </span>

        <span class="grid gap-0.5">
          <span lang="sk">{choice.label}</span>

          {#if statusLabel}
            <span class="font-sans text-xs font-medium text-slate-600">{statusLabel}</span
            >
          {/if}
        </span>
      </span>
    </button>
  {/each}
</div>
