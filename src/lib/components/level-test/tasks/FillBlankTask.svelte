<script lang="ts">
  import { onMount } from "svelte";

  import Button from "$lib/components/ui/Button.svelte";
  import { gradeLetters } from "$lib/level-test/grade";
  import { adaptiveResponse } from "$lib/level-test/session";
  import type { FillBlankItem } from "$lib/level-test/types";

  import LetterGap from "../LetterGap.svelte";
  import SlovakKeys from "../SlovakKeys.svelte";
  import TaskFrame from "../TaskFrame.svelte";
  import { commitTyping, taskReadingClass } from "../level-test-ui";
  import type { StepDone } from "../steps";

  let {
    item,
    seconds,
    ondone,
  }: {
    item: FillBlankItem;
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  let value = $state("");
  let input = $state<HTMLInputElement>();
  let done = false;

  onMount(() => input?.focus());

  function submit(): void {
    if (done) return;
    done = true;
    commitTyping();
    ondone({
      responses: [
        adaptiveResponse(item, gradeLetters(item.missing, value), undefined, "", {
          expected: item.prefix + item.missing,
          given: item.prefix + value,
          tag: item.tag,
        }),
      ],
    });
  }
</script>

<TaskFrame
  heading="Type the missing letters to complete the sentence"
  {seconds}
  onexpire={submit}
>
  <form
    class="grid gap-5"
    onsubmit={(event) => {
      event.preventDefault();
      submit();
    }}
  >
    <p class="{taskReadingClass} text-center" lang="sk">
      {item.before}<LetterGap
        prefix={item.prefix}
        length={[...item.missing].length}
        bind:value
        bind:input
        label={`Missing letters after “${item.prefix}”, ${[...item.missing].length} letters`}
      />{item.after}
    </p>

    <p class="m-0 text-center text-sm text-slate-500">{item.english}</p>

    <div class="flex justify-center">
      <SlovakKeys />
    </div>
  </form>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={submit}>Next</Button>
  {/snippet}
</TaskFrame>
