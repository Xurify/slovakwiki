<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { gradeDictation } from "$lib/level-test/grade";
  import { adaptiveResponse } from "$lib/level-test/session";
  import type { ListenTypeItem } from "$lib/level-test/types";

  import ClipButton from "../ClipButton.svelte";
  import SlovakKeys from "../SlovakKeys.svelte";
  import TaskFrame from "../TaskFrame.svelte";
  import { textAreaClass } from "../level-test-ui";
  import type { StepDone } from "../steps";

  let {
    item,
    seconds,
    ondone,
  }: {
    item: ListenTypeItem;
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  let typed = $state("");
  let field = $state<HTMLTextAreaElement>();
  let unplayable = $state(false);
  let done = false;

  function submit(): void {
    if (done) return;
    done = true;
    ondone({
      responses: unplayable
        ? []
        : [adaptiveResponse(item, gradeDictation(item.text, typed))],
    });
  }
</script>

<TaskFrame heading="Type the Slovak sentence you hear" {seconds} onexpire={submit}>
  <div class="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-8">
    <div class="flex justify-center pt-1">
      <ClipButton
        src={item.audio}
        maxPlays={3}
        onended={() => field?.focus()}
        onfailed={() => (unplayable = true)}
      />
    </div>

    <div class="grid gap-3">
      <label class="sr-only" for="level-test-dictation">Your answer</label>
      <textarea
        id="level-test-dictation"
        class="{textAreaClass} min-h-28"
        bind:this={field}
        bind:value={typed}
        placeholder="Type what you hear…"
        autocomplete="off"
        autocapitalize="sentences"
        spellcheck="false"
        lang="sk"></textarea>

      <SlovakKeys />
    </div>
  </div>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={submit}>
      {unplayable ? "Skip" : "Next"}
    </Button>
  {/snippet}
</TaskFrame>
