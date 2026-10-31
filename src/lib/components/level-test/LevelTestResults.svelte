<script lang="ts">
  import RichTeachingText from "$lib/components/practice/RichTeachingText.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import { panelClass, tagClass, eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { diagnose } from "$lib/level-test/diagnose";
  import {
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
    transcribing = 0,
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
    /** Read-aloud answers still at speech-to-text; they count as pending too. */
    transcribing?: number;
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

  const LEVEL_TITLES: Record<CefrLevel, { en: string; sk: string }> = {
    A1: { en: "Breakthrough", sk: "Začiatočník" },
    A2: { en: "Waystage", sk: "Základná úroveň" },
    B1: { en: "Threshold", sk: "Samostatný používateľ" },
    B2: { en: "Vantage", sk: "Pokročilý používateľ" },
    C1: { en: "Effective Operational Proficiency", sk: "Skúsený používateľ" },
    C2: { en: "Mastery", sk: "Majstrovská úroveň" },
  };

  const SKILL_SLOVAK: Record<Skill, string> = {
    reading: "Čítanie",
    listening: "Počúvanie",
    writing: "Písanie",
    speaking: "Hovorenie",
  };

  const SKILL_DESCRIPTIONS: Record<Skill, Record<CefrLevel, string>> = {
    reading: {
      A1: "Understands familiar names, words and very simple sentences.",
      A2: "Understands short, simple texts and finds specific predictable information.",
      B1: "Understands texts consisting mainly of everyday or work-related language.",
      B2: "Follows articles, reports and contemporary literary prose with ease.",
      C1: "Understands long, complex factual and literary texts in detail.",
      C2: "Interprets virtually all forms of written Slovak with nuance.",
    },
    listening: {
      A1: "Recognizes familiar words and basic phrases spoken slowly and clearly.",
      A2: "Catches main points in short, clear messages and announcements.",
      B1: "Understands main points of clear standard speech on familiar matters.",
      B2: "Understands extended speech and follows complex lines of argument.",
      C1: "Follows extended speech with ease, including idioms and colloquial shifts.",
      C2: "Understands any kind of spoken Slovak at natural native speed.",
    },
    writing: {
      A1: "Writes simple phrases and sentences about familiar things.",
      A2: "Writes short, simple notes, messages and basic personal correspondence.",
      B1: "Writes straightforward connected texts on familiar or personal topics.",
      B2: "Writes clear, detailed texts on a wide range of subjects with good cohesion.",
      C1: "Writes well-structured, complex texts in an assured style.",
      C2: "Writes clear, smoothly flowing texts with effective stylistic nuances.",
    },
    speaking: {
      A1: "Interacts simply when the interlocutor speaks slowly and clearly.",
      A2: "Communicates in simple, routine tasks requiring a direct exchange of information.",
      B1: "Enters unprepared into conversations and connects phrases to describe experiences.",
      B2: "Interacts with a high degree of fluency and spontaneity with native speakers.",
      C1: "Expresses ideas fluently and spontaneously without much search for expressions.",
      C2: "Takes part effortlessly in any conversation with colloquial flexibility.",
    },
  };

  const INTEGRATED_DETAILS: Record<
    IntegratedSkill,
    { label: string; slovak: string; formula: string }
  > = {
    comprehension: {
      label: "Comprehension",
      slovak: "Porozumenie",
      formula: "Reading + Listening",
    },
    literacy: {
      label: "Literacy",
      slovak: "Gramotnosť",
      formula: "Reading + Writing",
    },
    conversation: {
      label: "Conversation",
      slovak: "Konverzácia",
      formula: "Listening + Speaking",
    },
    production: {
      label: "Production",
      slovak: "Produkcia",
      formula: "Writing + Speaking",
    },
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
    production.filter((record) => record.status === "pending").length + transcribing,
  );
  const result = $derived(computeResult(responses, production));
  const diagnosis = $derived(
    diagnose(responses, production, result.overall?.score ?? currentTheta(responses), {
      stepKinds: new Set(plan.map((step) => step.kind)),
      mode,
      microphone,
      transcription: capabilities.transcription,
    }),
  );
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
    if (skill === "speaking" && !capabilities.transcription)
      return "Planned: needs speech recognition.";
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
      <p class="m-0 text-sm text-slate-700 text-pretty">
        Scoring {pending === 1 ? "one answer" : `${pending} answers`} from the writing and speaking
        sections. Your level updates when they are in.
      </p>
      <DotLoader label="Scoring answers" />
    </div>
  {/if}

  <!-- Overall Result Card -->
  <section
    class="{panelClass} grid gap-6 px-7 py-8 max-[560px]:px-5"
    aria-labelledby="level-test-result"
  >
    {#if result.overall}
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div class="grid gap-1.5">
          <p class={eyebrowMutedClass}>Estimated CEFR Level</p>
          <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2
              id="level-test-result"
              class="m-0 font-serif text-[clamp(3.5rem,10vw,4.75rem)] leading-none font-semibold text-slate-900 focus-visible:outline-none"
              tabindex="-1"
            >
              {result.overall.level}
            </h2>
            <div class="grid">
              <span class="text-base font-semibold text-slate-800">
                {LEVEL_TITLES[result.overall.level]?.en ?? ""}
              </span>
              <span class="font-serif text-sm text-slate-600 italic" lang="sk">
                {LEVEL_TITLES[result.overall.level]?.sk ?? ""}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1">
          <span class="text-xs font-semibold text-slate-600">Overall score</span>
          <p class="m-0 text-sm text-slate-600">
            <span class="font-serif text-3xl font-semibold tabular-nums text-slate-900">
              {result.overall.score}
            </span>
            <span class="text-slate-500">/ 100</span>
          </p>
        </div>
      </div>

      <ScaleBar score={result.overall.score} />

      <p class="m-0 font-serif text-base leading-relaxed text-slate-800 text-pretty">
        {CAN_DO[result.overall.level]}
      </p>
    {:else}
      <h2
        id="level-test-result"
        class="m-0 font-serif text-2xl font-semibold text-slate-900"
      >
        Not enough answers to place you
      </h2>
      <p class="m-0 text-slate-700">Try again and answer a few more questions.</p>
    {/if}
  </section>

  <!-- Skills Breakdown Grid -->
  <section aria-labelledby="level-test-skills" class="grid gap-4">
    <div class="flex items-baseline justify-between gap-4">
      <h3 id="level-test-skills" class={eyebrowMutedClass}>Core Language Skills</h3>
      <span class="text-xs text-slate-600">4 modalities</span>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      {#each SKILLS as skill (skill)}
        {@const summary = result.skills[skill]}
        <div class="{panelClass} grid gap-3 px-5 py-4">
          <div class="flex items-baseline justify-between gap-3">
            <div>
              <p class="m-0 font-semibold text-slate-900">
                {SKILL_LABEL[skill]}
                <span class="ml-1 font-serif text-xs font-normal text-slate-600 italic" lang="sk">
                  {SKILL_SLOVAK[skill]}
                </span>
              </p>
            </div>

            {#if summary}
              <p class="m-0 text-sm text-slate-600">
                <span class="font-serif text-lg font-semibold text-slate-900">
                  {summary.level}
                </span>
                <span class="text-slate-400"> · </span>
                <span class="tabular-nums font-medium text-slate-800">{summary.score}</span>
              </p>
            {:else}
              <span class={tagClass}>Not measured</span>
            {/if}
          </div>

          {#if summary}
            <ScaleBar score={summary.score} compact />
            <p class="m-0 text-xs leading-relaxed text-slate-700 text-pretty">
              {SKILL_DESCRIPTIONS[skill][summary.level]}
            </p>
          {:else}
            <p class="m-0 text-xs text-slate-600">{unmeasuredReason(skill)}</p>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Integrated Communicative Profile -->
    <div class="{panelClass} grid gap-3 p-5">
      <p class="m-0 text-xs font-semibold text-slate-600">
        Communicative Profile
      </p>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {#each (["comprehension", "literacy", "conversation", "production"] as const) as key (key)}
          {@const summary = result.integrated[key]}
          {@const info = INTEGRATED_DETAILS[key]}
          <div class="grid gap-1 rounded-(--control-radius) bg-subtle p-3">
            <span class="text-xs font-semibold text-slate-900">
              {info.label}
            </span>
            <span class="text-xs text-slate-600">
              {info.formula}
            </span>

            <div class="mt-1 flex items-baseline justify-between">
              <span class="font-serif text-base font-semibold text-slate-900">
                {summary ? summary.level : "—"}
              </span>
              <span class="text-xs tabular-nums text-slate-700">
                {summary ? `${summary.score} pts` : ""}
              </span>
            </div>

            {#if summary}
              <div class="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full bg-blue-600"
                  style:width={`${Math.max(4, Math.min(100, summary.score))}%`}
                ></div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Strengths and Linguistic Diagnosis -->
  {#if result.overall}
    <LevelTestDiagnosis {diagnosis} level={result.overall.level} />
  {/if}

  <!-- Writing and Speaking Qualitative Feedback -->
  {#if production.length}
    <section aria-labelledby="level-test-feedback" class="grid gap-3">
      <h3 id="level-test-feedback" class={eyebrowMutedClass}>
        Writing and speaking feedback
      </h3>

      <ul class="m-0 grid list-none gap-3 p-0">
        {#each production as record (record.id)}
          <li class="{panelClass} grid gap-3.5 px-6 py-5">
            <div class="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div class="grid gap-0.5">
                <p class="m-0 font-semibold text-slate-900">{productionLabel(record)}</p>
                {#if record.prompt}
                  <p class="m-0 text-sm font-medium text-slate-700 text-pretty" lang="sk">{record.prompt}</p>
                {/if}
              </div>

              {#if record.status === "scored" && record.result}
                <p class="m-0 text-sm text-slate-600">
                  <span class="font-serif text-lg font-semibold text-slate-900">
                    {record.result.level}
                  </span>
                  <span class="text-slate-400"> · </span>
                  <span class="tabular-nums font-medium text-slate-800">{record.result.score} pts</span>
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
              <div class="grid gap-1">
                <span class="text-xs font-semibold text-slate-600">Your response</span>
                <blockquote
                  class="m-0 border-l-2 border-blue-600 pl-4 font-serif text-base leading-relaxed text-slate-900 text-pretty"
                  lang="sk"
                >
                  "{record.response}"
                </blockquote>
              </div>
            {/if}

            {#if record.result?.feedback}
              <div class="grid gap-1.5 rounded-(--control-radius) bg-subtle p-4">
                <span class="text-xs font-semibold text-slate-600">Evaluation</span>
                <RichTeachingText
                  class="text-sm leading-relaxed text-slate-800 text-pretty"
                  text={record.result.feedback}
                />
              </div>
            {/if}

            {#if record.result?.issues?.length}
              <div class="grid gap-1.5 pt-1">
                <span class="text-xs font-semibold text-slate-600">Spelling & grammar notes</span>
                <ul class="m-0 grid list-none gap-1.5 p-0 text-sm">
                  {#each record.result.issues as issue, issueIndex (issueIndex)}
                    <li class="flex flex-wrap items-baseline gap-x-2">
                      <span class="font-serif text-rose-700 line-through" lang="sk">
                        {issue.wrote}
                      </span>
                      <span class="text-slate-400">→</span>
                      <span class="font-serif font-semibold text-slate-900" lang="sk">
                        {issue.correct}
                      </span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- Task Performance Breakdown Table -->
  <section aria-labelledby="level-test-tasks" class="grid gap-3">
    <div class="flex items-baseline justify-between gap-4">
      <h3 id="level-test-tasks" class={eyebrowMutedClass}>By task</h3>
      <span class="text-xs text-slate-600">{byTask.length} tasks measured</span>
    </div>

    <div class="{panelClass} overflow-hidden">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-xs text-slate-600">
            <th class="px-5 py-3 font-semibold" scope="col">Task</th>
            <th class="px-3 py-3 text-right font-semibold" scope="col">Items</th>
            <th class="px-5 py-3 text-right font-semibold" scope="col">Score</th>
          </tr>
        </thead>

        <tbody>
          {#each byTask as row (row.task)}
            <tr class="border-b border-slate-200/80 last:border-b-0 hover:bg-subtle/50 transition-colors">
              <th class="px-5 py-3 text-left font-medium text-slate-900" scope="row">
                {TASK_INFO[row.task]?.label ?? row.task}
              </th>
              <td class="px-3 py-3 text-right tabular-nums text-slate-700">
                {row.count}
              </td>
              <td class="px-5 py-3 text-right">
                <div class="inline-flex items-center justify-end gap-2.5">
                  <div class="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 sm:block">
                    <div
                      class="h-full rounded-full bg-blue-600"
                      style:width={`${Math.max(2, Math.min(100, row.percent))}%`}
                    ></div>
                  </div>
                  <span class="tabular-nums font-semibold text-slate-900">{row.percent}%</span>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <p class="m-0 px-1 text-xs text-slate-600 text-pretty">
      Percentages are raw. Your level weighs each answer by how hard the question was.
    </p>
  </section>

  <!-- Planned Tasks -->
  {#if plannedHere.length}
    <section aria-labelledby="level-test-planned" class="grid gap-3">
      <h3 id="level-test-planned" class={eyebrowMutedClass}>Coming later</h3>

      <ul class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {#each plannedHere as task (task)}
          <li
            class="flex items-center justify-between gap-3 rounded-(--control-radius) border border-dashed border-slate-300 px-4 py-2.5"
          >
            <span class="text-sm font-semibold text-slate-800">
              {TASK_INFO[task].label}
            </span>
            <span class={plannedTagClass}>Planned</span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- Disclaimer and Action Buttons -->
  <section class="grid gap-5 border-t border-slate-200 pt-6">
    <p class="m-0 max-w-2xl text-sm leading-relaxed text-slate-600 text-pretty">
      This is an estimate, not a certificate. Question difficulty is predicted from word
      frequency, sentence length and text level; it gets more precise as more people take
      the test.
    </p>

    <div class="flex flex-wrap gap-3">
      <Button variant="accent" onclick={onretake}>Take it again</Button>
      <Button variant="secondary" href="/practice">Practice</Button>
      <Button variant="secondary" onclick={onclose}>Close</Button>
    </div>
  </section>
</div>
