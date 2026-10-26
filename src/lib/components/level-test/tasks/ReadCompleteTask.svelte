<script lang="ts">
  import { onMount } from "svelte";

  import Button from "$lib/components/ui/Button.svelte";
  import { gradeLetters } from "$lib/level-test/grade";
  import { adaptiveResponse } from "$lib/level-test/session";
  import type { CTestGap, ReadCompleteItem } from "$lib/level-test/types";

  import LetterGap from "../LetterGap.svelte";
  import SlovakKeys from "../SlovakKeys.svelte";
  import TaskFrame from "../TaskFrame.svelte";
  import { commitTyping } from "../level-test-ui";
  import type { StepDone } from "../steps";

  let {
    item,
    seconds,
    ondone,
  }: {
    item: ReadCompleteItem;
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  const gapIndexes = $derived(
    item.parts.flatMap((part, index) => (typeof part === "string" ? [] : [index])),
  );

  let values = $state<Record<number, string>>(emptyValues());
  let inputs = $state<Record<number, HTMLInputElement | undefined>>({});
  let lastInputs = $state<Record<number, HTMLInputElement | undefined>>({});
  let done = false;

  function emptyValues(): Record<number, string> {
    return Object.fromEntries(
      item.parts.flatMap((part, index) =>
        typeof part === "string" ? [] : [[index, ""]],
      ),
    );
  }

  onMount(() => inputs[gapIndexes[0] ?? -1]?.focus());

  function focusAfter(partIndex: number): void {
    const next = gapIndexes.find((index) => index > partIndex);
    if (next !== undefined) inputs[next]?.focus();
  }

  function focusBefore(partIndex: number): void {
    const previous = gapIndexes.findLast((index) => index < partIndex);
    if (previous !== undefined) lastInputs[previous]?.focus();
  }

  /** Each damaged word is scored as its own item. */
  function submit(): void {
    if (done) return;
    done = true;
    commitTyping();
    ondone({
      responses: gapIndexes.map((index) => {
        const gap = item.parts[index] as CTestGap;
        return adaptiveResponse(
          item,
          gradeLetters(gap.missing, values[index] ?? ""),
          gap.difficulty,
          `#${index}`,
          {
            expected: gap.prefix + gap.missing,
            given: gap.prefix + (values[index] ?? ""),
            tag: gap.tag,
          },
        );
      }),
    });
  }
</script>

<TaskFrame
  heading="Type the missing letters to complete the text"
  {seconds}
  onexpire={submit}
>
  <article class="grid gap-5">
    <h3 class="m-0 text-center font-serif text-lg font-semibold text-slate-900" lang="sk">
      {item.title}
    </h3>

    <p class="m-0 font-serif text-lg leading-[2.6] text-pretty text-slate-900" lang="sk">
      {#each item.parts as part, index (index)}
        {#if typeof part === "string"}
          {part}
        {:else}
          <LetterGap
            prefix={part.prefix}
            length={[...part.missing].length}
            bind:value={values[index]}
            bind:input={inputs[index]}
            bind:lastInput={lastInputs[index]}
            label={`Word starting “${part.prefix}”, ${[...part.missing].length} missing letters`}
            onfilled={() => focusAfter(index)}
            onbackout={() => focusBefore(index)}
          />
        {/if}
      {/each}
    </p>

    <SlovakKeys />
  </article>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={submit}>Next</Button>
  {/snippet}
</TaskFrame>
