<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { adaptiveResponse } from "$lib/level-test/session";
  import type { ListenLengthItem } from "$lib/level-test/types";

  import ClipButton from "../ClipButton.svelte";
  import TaskFrame from "../TaskFrame.svelte";
  import type { StepDone } from "../steps";

  let {
    items,
    seconds,
    ondone,
  }: {
    items: ListenLengthItem[];
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  let picked = $state<Record<string, string>>({});
  let unplayable = $state<Set<string>>(new Set());
  let done = false;

  /** A sound left unanswered counts as a miss; the guess rate in the model covers luck. */
  function submit(): void {
    if (done) return;
    done = true;
    ondone({
      responses: items
        .filter((item) => !unplayable.has(item.id))
        .map((item) => adaptiveResponse(item, picked[item.id] === item.word ? 1 : 0)),
    });
  }
</script>

<TaskFrame heading="Which word do you hear?" {seconds} onexpire={submit}>
  <div class="grid gap-4">
    <p class="m-0 text-sm text-slate-600">
      Each pair differs in one vowel only: short, or long with a length mark (á, é, í, ó,
      ú, ý).
    </p>

    <ul class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
      {#each items as item, index (item.id)}
        <li
          class="flex items-center justify-between gap-3 rounded-(--control-radius) border border-slate-300 bg-control px-3 py-2.5"
        >
          <div class="flex items-center gap-3">
            <ClipButton
              src={item.audio}
              size="sm"
              label={`Play sound ${index + 1}`}
              onfailed={() => (unplayable = new Set(unplayable).add(item.id))}
            />
            <span class="text-sm font-semibold whitespace-nowrap text-slate-700"
              >Sound {index + 1}</span
            >
          </div>

          <div class="flex gap-1.5" role="radiogroup" aria-label={`Sound ${index + 1}`}>
            {#each [item.short, item.long] as word (word)}
              {@const isPicked = picked[item.id] === word}
              <button
                class="min-w-14 cursor-pointer rounded-(--control-radius) border px-2.5 py-1.5 font-serif sm:min-w-16 sm:px-3 text-base transition-[background-color,border-color,color] duration-150 ease-out {isPicked
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-slate-300 bg-surface text-slate-800 hover:border-blue-600'}"
                type="button"
                role="radio"
                aria-checked={isPicked}
                lang="sk"
                onclick={() => (picked = { ...picked, [item.id]: word })}
              >
                {word}
              </button>
            {/each}
          </div>
        </li>
      {/each}
    </ul>
  </div>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={submit}>Next</Button>
  {/snippet}
</TaskFrame>
