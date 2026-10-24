<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { adaptiveResponse } from "$lib/level-test/session";
  import type { ChooseVerbItem } from "$lib/level-test/types";

  import TaskFrame from "../TaskFrame.svelte";
  import type { StepDone } from "../steps";

  let {
    items,
    seconds,
    ondone,
  }: {
    items: ChooseVerbItem[];
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  let picked = $state<Record<string, number>>({});
  let done = false;

  /** A sentence left unanswered counts as a miss; the guess rate in the model covers luck. */
  function submit(): void {
    if (done) return;
    done = true;
    ondone({
      responses: items.map((item) => {
        const choice = picked[item.id];
        return {
          ...adaptiveResponse(item, choice === item.answer ? 1 : 0),
          choice: {
            expected: `${item.before}${item.options[item.answer]}${item.after}`,
            given: choice === undefined ? "" : (item.options[choice] ?? ""),
            why: item.why,
          },
        };
      }),
    });
  }
</script>

<TaskFrame heading="Choose the verb that fits each sentence" {seconds} onexpire={submit}>
  <ol class="m-0 grid list-none gap-3 p-0">
    {#each items as item, index (item.id)}
      {@const choice = picked[item.id]}
      <li
        class="grid gap-3 rounded-(--control-radius) border border-slate-300 bg-control px-4 py-3"
      >
        <p class="m-0 font-serif text-lg leading-relaxed text-slate-900" lang="sk">
          {item.before}<span
            class={choice === undefined
              ? "inline-block min-w-16 border-b-2 border-slate-400 align-baseline"
              : "border-b-2 border-blue-600 font-semibold text-blue-800"}
            >{choice === undefined ? " " : item.options[choice]}</span
          >{item.after}
        </p>

        <div
          class="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label={`Sentence ${index + 1}`}
        >
          {#each item.options as option, optionIndex (option)}
            <button
              class="min-w-20 cursor-pointer rounded-(--control-radius) border px-3 py-1.5 font-serif text-base transition-[background-color,border-color,color] duration-150 ease-out {choice ===
              optionIndex
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-slate-300 bg-surface text-slate-800 hover:border-blue-600'}"
              type="button"
              role="radio"
              aria-checked={choice === optionIndex}
              lang="sk"
              onclick={() => (picked = { ...picked, [item.id]: optionIndex })}
            >
              {option}
            </button>
          {/each}
        </div>
      </li>
    {/each}
  </ol>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={submit}>Next</Button>
  {/snippet}
</TaskFrame>
