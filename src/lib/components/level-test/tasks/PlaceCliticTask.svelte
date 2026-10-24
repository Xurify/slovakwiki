<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { adaptiveResponse } from "$lib/level-test/session";
  import type { PlaceCliticItem } from "$lib/level-test/types";

  import TaskFrame from "../TaskFrame.svelte";
  import type { StepDone } from "../steps";

  let {
    items,
    seconds,
    ondone,
  }: {
    items: PlaceCliticItem[];
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  let placed = $state<Record<string, number>>({});
  let done = false;

  function sentence(item: PlaceCliticItem, gap: number): string {
    return [...item.words.slice(0, gap), item.clitic, ...item.words.slice(gap)].join(" ");
  }

  function gapLabel(item: PlaceCliticItem, gap: number): string {
    if (gap === 0) return `Before “${item.words[0] ?? ""}”`;
    return `After “${item.words[gap - 1] ?? ""}”`;
  }

  /** A sentence left unanswered counts as a miss; the guess rate in the model covers luck. */
  function submit(): void {
    if (done) return;
    done = true;
    ondone({
      responses: items.map((item) => {
        const gap = placed[item.id];
        return {
          ...adaptiveResponse(item, gap === item.answer ? 1 : 0),
          choice: {
            expected: sentence(item, item.answer),
            given: gap === undefined ? "" : sentence(item, gap),
            why: item.why,
          },
        };
      }),
    });
  }
</script>

{#snippet gapButton(item: PlaceCliticItem, gap: number | undefined, slot: number)}
  <button
    class="cursor-pointer rounded-[3px] border transition-[background-color,border-color] duration-150 ease-out {gap ===
    slot
      ? 'border-blue-600 bg-blue-50 px-1.5 font-semibold text-blue-800'
      : 'h-7 w-4 border-dashed border-slate-300 bg-transparent hover:border-blue-600 hover:bg-blue-50'}"
    type="button"
    role="radio"
    aria-checked={gap === slot}
    aria-label={gapLabel(item, slot)}
    onclick={() => (placed = { ...placed, [item.id]: slot })}
  >
    {gap === slot ? item.clitic : ""}
  </button>
{/snippet}

<TaskFrame
  heading="Click where the words in blue belong in each sentence"
  {seconds}
  onexpire={submit}
>
  <ol class="m-0 grid list-none gap-3 p-0">
    {#each items as item, index (item.id)}
      {@const gap = placed[item.id]}
      <li
        class="grid gap-3 rounded-(--control-radius) border border-slate-300 bg-control px-4 py-3"
      >
        <p class="m-0 font-serif text-base text-blue-800" lang="sk">
          <span class="rounded-[3px] bg-blue-50 px-1.5 py-0.5 font-semibold"
            >{item.clitic}</span
          >
        </p>

        <div
          class="m-0 flex flex-wrap items-center gap-x-1.5 gap-y-2 font-serif text-lg text-slate-900"
          role="radiogroup"
          aria-label={`Sentence ${index + 1}: where “${item.clitic}” goes`}
          lang="sk"
        >
          <!-- Each gap wraps with the word after it, so a line never ends in an empty gap. -->
          {#each item.words as word, slot (slot)}
            <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
              {@render gapButton(item, gap, slot)}
              <span>{word}</span>
              {#if slot === item.words.length - 1}
                {@render gapButton(item, gap, slot + 1)}
              {/if}
            </span>
          {/each}
        </div>
      </li>
    {/each}
  </ol>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={submit}>Next</Button>
  {/snippet}
</TaskFrame>
