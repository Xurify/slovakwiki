<script lang="ts">
  import RichTeachingText from "$lib/components/practice/RichTeachingText.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import { panelClass, tagClass, eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { diagnose } from "$lib/level-test/diagnose";
  import {
    INTEGRATED_SKILLS,
    SKILLS,
    SKILL_LABEL,
    computeResult,
    type IntegratedSkill,
  } from "$lib/level-test/results";
  import type { CefrLevel } from "$lib/level-test/scale";
  import { currentTheta } from "$lib/level-test/session";
  import { TASK_INFO, type TaskKind } from "$lib/level-test/task-info";
  import type {
    ItemResponse,
    LevelTestBank,
    PlanStep,
    PlannedTask,
    ProductionRecord,
    ScoringCapabilities,
    Skill,
    TestMode,
  } from "$lib/level-test/types";

  import LevelTestDiagnosis from "./LevelTestDiagnosis.svelte";
  import ScaleBar from "./ScaleBar.svelte";
  import { plannedTagClass } from "./level-test-ui";
  import { saveResult } from "./storage";

  let {
    bank,
    plan,
    mode,
    capabilities,
    responses,
    production,
    microphone,
    onclose,
    onretake,
  }: {
    bank: LevelTestBank;
    plan: PlanStep[];
    mode: TestMode;
    capabilities: ScoringCapabilities;
    responses: ItemResponse[];
    production: ProductionRecord[];
    microphone: boolean;
    onclose: () => void;
    onretake: () => void;
  } = $props();

  const CAN_DO: Record<CefrLevel, string> = {
    A1: "You understand and use familiar everyday words and very basic phrases.",
    A2: "You handle simple, routine exchanges about familiar things.",
    B1: "You cope with most everyday situations and can describe experiences and plans.",
    B2: "You follow complex texts and talk with Slovaks without strain on either side.",
    C1: "You use Slovak flexibly for social, study and work purposes.",
    C2: "You understand virtually everything and express yourself precisely.",
  };

  /** Response kinds from the interactive sections, grouped under their task. */
  const KIND_TASK: Record<string, TaskKind> = {
    irCompleteSentences: "interactiveReading",
    irCompletePassage: "interactiveReading",
    irHighlight: "interactiveReading",
    irIdentifyIdea: "interactiveReading",
    irTitle: "interactiveReading",
    ilComplete: "interactiveListening",
    ilRespond: "interactiveListening",
  };

  const pending = $derived(
    production.filter((record) => record.status === "pending").length,
  );
  const result = $derived(computeResult(responses, production));
  const diagnosis = $derived(diagnose(responses, production, currentTheta(responses)));
  let saved = false;

  $effect(() => {
    if (pending === 0 && !saved && result.overall) {
      saved = true;
      saveResult(mode, result);
    }
  });

  const byTask = $derived.by(() => {
    const groups = new Map<TaskKind, number[]>();
    for (const response of responses) {
      const task = (KIND_TASK[response.kind] ?? response.kind) as TaskKind;
      groups.set(task, [...(groups.get(task) ?? []), response.score]);
    }
    return [...groups.entries()].map(([task, scores]) => ({
      task,
      count: scores.length,
      percent: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100),
    }));
  });

  const plannedHere = $derived.by(() => {
    const tasks = new Set<PlannedTask>(plan.flatMap((step) => step.planned ?? []));
    if (mode === "full" && !capabilities.scoring) tasks.add("summarizeConversation");
    return [...tasks];
  });

  function unmeasuredReason(skill: Skill): string {
    if (mode === "quick" && (skill === "writing" || skill === "speaking")) {
      return "Not part of the quick test.";
    }
    if (skill === "speaking" && !microphone) return "No microphone in this run.";
    if (skill === "writing" || skill === "speaking") {
      const failed = production.some(
        (record) => record.skill === skill && record.status === "failed",
      );
      if (failed) return "The scorer could not be reached.";
      if (!capabilities.scoring && skill === "writing")
        return "Planned: needs AI scoring.";
      if (!capabilities.transcription) return "Planned: needs speech recognition.";
      return "No answer to score.";
    }
    return "No answers yet.";
  }

  function productionLabel(record: ProductionRecord): string {
    return TASK_INFO[record.kind].label;
  }
</script>

<div class="mx-auto grid w-full max-w-[920px] gap-8 animate-rise">
  {#if pending > 0}
    <div class="{panelClass} flex items-center justify-between gap-4 px-6 py-4">
      <p class="m-0 text-sm text-slate-600">
        Scoring {pending === 1 ? "one answer" : `${pending} answers`} from the writing and speaking
        sections. Your level updates when they are in.
      </p>
      <DotLoader label="Scoring answers" />
    </div>
  {/if}

  <section
    class="{panelClass} grid gap-6 px-7 py-8 max-[560px]:px-4"
    aria-labelledby="level-test-result"
  >
    {#if result.overall}
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="grid gap-1">
          <p class={eyebrowMutedClass}>Estimated level</p>
          <h2
            id="level-test-result"
            class="m-0 font-serif text-[clamp(3rem,10vw,4.5rem)] leading-none font-semibold text-slate-900"
          >
            {result.overall.level}
          </h2>
        </div>

        <p class="m-0 text-right text-sm text-slate-500">
          <span class="font-serif text-3xl font-semibold tabular-nums text-slate-900">
            {result.overall.score}
          </span>
          / 100
        </p>
      </div>

      <ScaleBar score={result.overall.score} />

      <p class="m-0 max-w-[60ch] text-pretty text-slate-700">
        {CAN_DO[result.overall.level]}
      </p>
    {:else}
      <h2
        id="level-test-result"
        class="m-0 font-serif text-2xl font-semibold text-slate-900"
      >
        Not enough answers to place you
      </h2>
      <p class="m-0 text-slate-600">Try again and answer a few more questions.</p>
    {/if}
  </section>

  <section aria-labelledby="level-test-skills" class="grid gap-3">
    <h3 id="level-test-skills" class={eyebrowMutedClass}>Skills</h3>

    <div class="grid gap-3 sm:grid-cols-2">
      {#each SKILLS as skill (skill)}
        {@const summary = result.skills[skill]}
        <div class="{panelClass} grid gap-3 px-5 py-4">
          <div class="flex items-baseline justify-between gap-3">
            <p class="m-0 font-semibold text-slate-900">{SKILL_LABEL[skill]}</p>

            {#if summary}
              <p class="m-0 text-sm text-slate-500">
                <span class="font-serif text-xl font-semibold text-slate-900"
                  >{summary.level}</span
                >
                · {summary.score}
              </p>
            {:else}
              <span class={tagClass}>Not measured</span>
            {/if}
          </div>

          {#if summary}
            <ScaleBar score={summary.score} compact />
          {:else}
            <p class="m-0 text-sm text-slate-500">{unmeasuredReason(skill)}</p>
          {/if}
        </div>
      {/each}
    </div>

    <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-2 px-1 pt-2 sm:grid-cols-4">
      {#each Object.entries(INTEGRATED_SKILLS) as [key, info] (key)}
        {@const summary = result.integrated[key as IntegratedSkill]}
        <div class="grid gap-0.5">
          <dt class="text-xs text-slate-500">{info.label}</dt>
          <dd class="m-0 text-sm font-semibold text-slate-900">
            {summary ? `${summary.level} · ${summary.score}` : "—"}
          </dd>
        </div>
      {/each}
    </dl>
  </section>

  {#if result.overall}
    <LevelTestDiagnosis {diagnosis} level={result.overall.level} />
  {/if}

  {#if production.length}
    <section aria-labelledby="level-test-feedback" class="grid gap-3">
      <h3 id="level-test-feedback" class={eyebrowMutedClass}>
        Writing and speaking feedback
      </h3>

      <ul class="m-0 grid list-none gap-3 p-0">
        {#each production as record (record.id)}
          <li class="{panelClass} grid gap-2 px-5 py-4">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="m-0 font-semibold text-slate-900">{productionLabel(record)}</p>

              {#if record.status === "scored" && record.result}
                <p class="m-0 text-sm text-slate-500">
                  <span class="font-serif text-lg font-semibold text-slate-900">
                    {record.result.level}
                  </span>
                  · {record.result.score}
                </p>
              {:else if record.status === "pending"}
                <DotLoader label="Scoring" />
              {:else}
                <span class={tagClass}>
                  {record.status === "empty" ? "No answer" : "Not scored"}
                </span>
              {/if}
            </div>

            {#if record.response}
              <p
                class="m-0 font-serif text-base whitespace-pre-wrap text-slate-600"
                lang="sk"
              >
                {record.response}
              </p>
            {/if}

            {#if record.result?.feedback}
              <RichTeachingText
                class="text-sm text-slate-700"
                text={record.result.feedback}
              />
            {/if}

            {#if record.result?.issues?.length}
              <ul class="m-0 grid list-none gap-1 p-0 text-sm">
                {#each record.result.issues as issue, issueIndex (issueIndex)}
                  <li class="flex flex-wrap items-baseline gap-x-2">
                    <span class="font-serif text-rose-700 line-through" lang="sk"
                      >{issue.wrote}</span
                    >
                    <span class="font-serif text-slate-900" lang="sk"
                      >{issue.correct}</span
                    >
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <section aria-labelledby="level-test-tasks" class="grid gap-3">
    <h3 id="level-test-tasks" class={eyebrowMutedClass}>By task</h3>

    <div class="{panelClass} overflow-hidden">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-xs text-slate-500">
            <th class="px-5 py-2.5 font-semibold" scope="col">Task</th>
            <th class="px-3 py-2.5 text-right font-semibold" scope="col">Items</th>
            <th class="px-5 py-2.5 text-right font-semibold" scope="col">Score</th>
          </tr>
        </thead>

        <tbody>
          {#each byTask as row (row.task)}
            <tr class="border-b border-slate-200 last:border-b-0">
              <th class="px-5 py-2.5 text-left font-semibold text-slate-900" scope="row">
                {TASK_INFO[row.task]?.label ?? row.task}
              </th>
              <td class="px-3 py-2.5 text-right tabular-nums text-slate-600"
                >{row.count}</td
              >
              <td class="px-5 py-2.5 text-right tabular-nums text-slate-900"
                >{row.percent}%</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <p class="m-0 px-1 text-xs text-slate-500">
      Percentages are raw. Your level weighs each answer by how hard the question was.
    </p>
  </section>

  {#if plannedHere.length}
    <section aria-labelledby="level-test-planned" class="grid gap-3">
      <h3 id="level-test-planned" class={eyebrowMutedClass}>Coming later</h3>

      <ul class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {#each plannedHere as task (task)}
          <li
            class="flex items-center justify-between gap-3 rounded-(--control-radius) border border-dashed border-slate-300 px-4 py-2.5"
          >
            <span class="text-sm font-semibold text-slate-700"
              >{TASK_INFO[task].label}</span
            >
            <span class={plannedTagClass}>Planned</span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <section class="grid gap-4 border-t border-slate-200 pt-6">
    <p class="m-0 max-w-[70ch] text-sm text-slate-500">
      This is an estimate, not a certificate. Question difficulty comes from word
      frequency, sentence length and the level each text was written for, the way the
      Duolingo English Test was first built; it gets more precise as more people take the
      test.
    </p>

    <div class="flex flex-wrap gap-3">
      <Button variant="accent" onclick={onretake}>Take it again</Button>
      <Button variant="secondary" href="/practice">Practice</Button>
      <Button variant="secondary" onclick={onclose}>Close</Button>
    </div>
  </section>
</div>
