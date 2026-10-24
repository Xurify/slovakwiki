<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { TASK_INFO, plannedReason } from "$lib/level-test/task-info";
  import type { PlannedTask, ScoringCapabilities } from "$lib/level-test/types";

  import TaskFrame from "../TaskFrame.svelte";
  import { plannedTagClass } from "../level-test-ui";
  import type { StepDone } from "../steps";

  let {
    tasks,
    capabilities,
    microphone,
    ondone,
  }: {
    tasks: PlannedTask[];
    capabilities: ScoringCapabilities;
    microphone: boolean;
    ondone: StepDone;
  } = $props();
</script>

<TaskFrame
  heading={tasks.length === 1
    ? "This task is coming later"
    : "These tasks are coming later"}
>
  <ul class="m-0 grid list-none gap-3 p-0">
    {#each tasks as task (task)}
      {@const info = TASK_INFO[task]}
      <li
        class="grid gap-1.5 rounded-(--control-radius) border border-dashed border-slate-300 px-4 py-3"
      >
        <div class="flex flex-wrap items-center gap-2">
          <p class="m-0 font-semibold text-slate-900">{info.label}</p>
          <span class={plannedTagClass}>Planned</span>
        </div>

        <p class="m-0 text-sm text-slate-600">{info.description}</p>
        <p class="m-0 text-xs text-slate-500">
          {plannedReason(task, capabilities, microphone)}
        </p>
      </li>
    {/each}
  </ul>

  <p class="m-0 mt-5 text-sm text-slate-500">
    They are not part of your score. The rest of the test still places you on the scale.
  </p>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={() => ondone({ responses: [] })}>
      Continue
    </Button>
  {/snippet}
</TaskFrame>
