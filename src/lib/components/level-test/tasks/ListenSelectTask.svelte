<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { gradeYesNo } from "$lib/level-test/grade";
  import { adaptiveResponse } from "$lib/level-test/session";
  import type { ListenSelectItem } from "$lib/level-test/types";

  import ClipButton from "../ClipButton.svelte";
  import TaskFrame from "../TaskFrame.svelte";
  import type { StepDone } from "../steps";

  let {
    items,
    seconds,
    ondone,
  }: {
    items: ListenSelectItem[];
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  let picked = $state<Set<string>>(new Set());
  let done = false;

  function toggle(id: string): void {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    picked = next;
  }

  /** Every sound counts: ticked means "real", unticked means "not a word". */
  function submit(): void {
    if (done) return;
    done = true;
    ondone({
      responses: items.map((item) =>
        adaptiveResponse(item, gradeYesNo(item.real, picked.has(item.id))),
      ),
    });
  }
</script>

<TaskFrame heading="Tick every real Slovak word you hear" {seconds} onexpire={submit}>
  <ul class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
    {#each items as item, index (item.id)}
      {@const isPicked = picked.has(item.id)}
      <li
        class="flex items-center justify-between gap-3 rounded-(--control-radius) border px-3 py-2.5 transition-[background-color,border-color] duration-150 ease-out {isPicked
          ? 'border-blue-600 bg-blue-50'
          : 'border-slate-300 bg-control'}"
      >
        <div class="flex items-center gap-3">
          <ClipButton src={item.audio} size="sm" label={`Play sound ${index + 1}`} />
          <span class="text-sm font-semibold text-slate-700">Sound {index + 1}</span>
        </div>

        <button
          class="inline-grid size-9 cursor-pointer place-items-center rounded-(--control-radius) border transition-[background-color,border-color] duration-150 ease-out {isPicked
            ? 'border-blue-600 bg-blue-600 text-paper'
            : 'border-slate-300 bg-surface text-slate-400 hover:border-blue-600'}"
          type="button"
          role="checkbox"
          aria-checked={isPicked}
          aria-label={`Sound ${index + 1} is a real word`}
          onclick={() => toggle(item.id)}
        >
          <svg
            class="size-5 fill-none stroke-current"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </button>
      </li>
    {/each}
  </ul>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={submit}>Next</Button>
  {/snippet}
</TaskFrame>
