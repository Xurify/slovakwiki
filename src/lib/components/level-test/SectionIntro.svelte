<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { SECTION_LABEL, planMinutes } from "$lib/level-test/plan";
  import { TASK_INFO } from "$lib/level-test/task-info";
  import type { PlanStep, TestSection } from "$lib/level-test/types";

  import { plannedTagClass } from "./level-test-ui";

  let {
    section,
    plan,
    timed,
    oncontinue,
  }: {
    section: TestSection;
    plan: PlanStep[];
    timed: boolean;
    oncontinue: () => void;
  } = $props();

  const NOTES: Record<TestSection, string> = {
    adaptive:
      "Words, sentences and short texts. Every answer sets the difficulty of the next question, so some will feel hard. That is how the test finds your level.",
    reading:
      "One passage and five kinds of question about it. The passage stays on screen the whole time.",
    listening:
      "Listen to a short scenario, note what you heard, then take part in a conversation. Each line in the conversation plays only once.",
    writing:
      "Write in Slovak. An AI scorer rates content, organisation, grammar and vocabulary.",
    speaking:
      "Speak in Slovak. Allow the microphone when your browser asks. You get one take for each answer.",
  };

  const steps = $derived(plan.filter((step) => step.section === section));
  const kinds = $derived([
    ...new Set(steps.flatMap((step) => (step.kind === "planned" ? [] : [step.kind]))),
  ]);
  const planned = $derived(steps.flatMap((step) => step.planned ?? []));
  const minutes = $derived(planMinutes(steps));
</script>

<section
  class="mx-auto grid w-full max-w-[640px] gap-6 rounded-(--frame-radius) bg-surface px-7 py-8 shadow-(--shadow-border) animate-rise max-[560px]:px-4"
  aria-labelledby="level-test-section"
>
  <div class="grid gap-2">
    <h2
      id="level-test-section"
      class="m-0 font-serif text-2xl font-semibold text-slate-900 focus-visible:outline-none"
      tabindex="-1"
    >
      {SECTION_LABEL[section]}
    </h2>
    <p class="m-0 text-slate-600">{NOTES[section]}</p>
  </div>

  <ul class="m-0 grid list-none p-0">
    {#each kinds as kind (kind)}
      <li class="grid gap-0.5 border-b border-slate-200 py-2.5 first:pt-0">
        <span class="font-semibold text-slate-900">{TASK_INFO[kind].label}</span>
        <span class="text-sm text-slate-600">{TASK_INFO[kind].description}</span>
      </li>
    {/each}

    {#each planned as task (task)}
      <li class="grid gap-0.5 border-b border-slate-200 py-2.5 first:pt-0">
        <span class="flex items-center gap-2 font-semibold text-slate-500">
          {TASK_INFO[task].label}
          <span class={plannedTagClass}>Planned</span>
        </span>
        <span class="text-sm text-slate-500">{TASK_INFO[task].description}</span>
      </li>
    {/each}
  </ul>

  <div class="flex flex-wrap items-center justify-between gap-3">
    <p class="m-0 text-sm text-slate-600">
      {timed && minutes > 0 ? `Up to ${minutes} min` : "Take the time you need"}
    </p>

    <Button variant="accent" class="min-w-36" onclick={oncontinue}>Start section</Button>
  </div>
</section>
