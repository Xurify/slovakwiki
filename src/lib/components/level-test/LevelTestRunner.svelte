<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";

  import { iconButtonClass, iconButtonToneClass } from "$lib/components/ui/system-ui";
  import { addCoverage } from "$lib/level-test/areas";
  import { gradeReadAloud } from "$lib/level-test/grade";
  import { SECTION_LABEL, TIME_LIMIT_SECONDS, seededRandom } from "$lib/level-test/plan";
  import {
    currentTheta,
    resolveStep,
    taskResponse,
    type Picker,
    type StepContent,
  } from "$lib/level-test/session";
  import type {
    ItemResponse,
    LevelTestBank,
    PlanStep,
    ProductionRecord,
    ScoringCapabilities,
    TestMode,
    TestSection,
  } from "$lib/level-test/types";

  import LevelTestResults from "./LevelTestResults.svelte";
  import SectionIntro from "./SectionIntro.svelte";
  import { requestScore, requestTranscript } from "./client";
  import { portal } from "./portal";
  import { closeMicrophone, openMicrophone } from "./recorder";
  import { readSeenItems, rememberSeenItems } from "./storage";
  import type { ProductionDraft, StepResult } from "./steps";
  import ChooseVerbTask from "./tasks/ChooseVerbTask.svelte";
  import FillBlankTask from "./tasks/FillBlankTask.svelte";
  import InteractiveListeningTask from "./tasks/InteractiveListeningTask.svelte";
  import InteractiveReadingTask from "./tasks/InteractiveReadingTask.svelte";
  import ListenLengthTask from "./tasks/ListenLengthTask.svelte";
  import ListenSelectTask from "./tasks/ListenSelectTask.svelte";
  import ListenTypeTask from "./tasks/ListenTypeTask.svelte";
  import PlaceCliticTask from "./tasks/PlaceCliticTask.svelte";
  import PlannedTask from "./tasks/PlannedTask.svelte";
  import ReadCompleteTask from "./tasks/ReadCompleteTask.svelte";
  import ReadSelectTask from "./tasks/ReadSelectTask.svelte";
  import SpeakingTask from "./tasks/SpeakingTask.svelte";
  import WritingTask from "./tasks/WritingTask.svelte";

  let {
    bank,
    plan,
    mode,
    capabilities,
    timed,
    speaking,
    onexit,
    onretake,
  }: {
    bank: LevelTestBank;
    plan: PlanStep[];
    mode: TestMode;
    capabilities: ScoringCapabilities;
    timed: boolean;
    speaking: boolean;
    onexit: () => void;
    onretake: () => void;
  } = $props();

  const SPEAKING_KINDS = new Set([
    "readAloud",
    "speakPhoto",
    "readThenSpeak",
    "speakingSample",
  ]);

  let index = $state(-1);
  let content = $state<StepContent | null>(null);
  let introFor = $state<TestSection | null>(null);
  let responses = $state<ItemResponse[]>([]);
  let production = $state<ProductionRecord[]>([]);
  let finished = $state(false);
  let microphone = $state<MediaStream | null>(null);
  let microphoneAsked = false;
  let askingMicrophone = $state(false);
  let overlay = $state<HTMLElement>();

  const picker: Picker = {
    used: new Set(),
    balance: 0,
    random: seededRandom(Date.now()),
    seen: readSeenItems(),
    coverage: new Map(),
  };

  const step = $derived(plan[index]);
  const section = $derived(introFor ?? step?.section ?? "adaptive");
  const progress = $derived(plan.length ? Math.max(0, index) / plan.length : 0);
  const seconds = $derived.by(() => {
    if (!timed || !content || content.kind === "planned") return null;
    return TIME_LIMIT_SECONDS[content.kind] ?? null;
  });

  async function enter(nextIndex: number): Promise<void> {
    content = null;
    for (let at = nextIndex; at < plan.length; at++) {
      const next = plan[at];
      if (!next) break;

      if (SPEAKING_KINDS.has(next.kind) && !microphoneAsked) {
        microphoneAsked = true;
        askingMicrophone = true;
        microphone = await openMicrophone();
        askingMicrophone = false;
      }

      const resolved = resolveStep(bank, next, currentTheta(responses), picker);
      if (!resolved) continue;

      const previous = plan[index];
      index = at;
      if (!previous || previous.section !== next.section) introFor = next.section;
      content = resolved;
      await tick();
      overlay?.scrollTo({ top: 0 });
      return;
    }
    index = plan.length;
    finished = true;
  }

  function updateRecord(id: string, patch: Partial<ProductionRecord>): void {
    production = production.map((record) =>
      record.id === id ? { ...record, ...patch } : record,
    );
  }

  async function processDraft(id: string, draft: ProductionDraft): Promise<void> {
    try {
      let text = draft.response ?? "";
      let durationSeconds = draft.seconds;
      if (draft.audio) {
        const transcript = await requestTranscript(draft.audio);
        text = transcript.text;
        durationSeconds = transcript.durationSeconds ?? durationSeconds;
      }
      if (!text.trim()) {
        updateRecord(id, { status: "empty", response: "" });
        return;
      }
      updateRecord(id, { response: text });
      const result = await requestScore({
        kind: draft.kind,
        prompt: draft.prompt,
        response: text,
        durationSeconds,
        contentKey: draft.contentKey,
        imageUrl: draft.imageUrl,
      });
      updateRecord(id, { status: "scored", result });
    } catch {
      updateRecord(id, { status: "failed" });
    }
  }

  async function processReadAloud(
    result: NonNullable<StepResult["readAloud"]>,
  ): Promise<void> {
    const { item, audio } = result;
    let score = 0;
    try {
      const transcript = await requestTranscript(audio);
      score = gradeReadAloud(item.text, transcript.text);
    } catch {
      return;
    }
    responses = [
      ...responses,
      taskResponse(item.id, "readAloud", "speaking", item.difficulty, score),
    ];
  }

  function stepDone(result: StepResult): void {
    responses = [...responses, ...result.responses];
    addCoverage(picker.coverage, result.responses);
    rememberSeenItems(picker.used);

    for (const draft of result.production ?? []) {
      const id = `${draft.kind}-${production.length}`;
      const empty = !draft.audio && !draft.response?.trim();
      production = [
        ...production,
        {
          id,
          kind: draft.kind,
          skill: draft.skill,
          prompt: draft.prompt,
          response: draft.response ?? "",
          status: empty ? "empty" : "pending",
        },
      ];
      if (!empty) void processDraft(id, draft);
    }

    if (result.readAloud) void processReadAloud(result.readAloud);
    void enter(index + 1);
  }

  function leave(): void {
    if (finished || window.confirm("Leave the test? Your answers so far will be lost.")) {
      onexit();
    }
  }

  onMount(() => {
    document.documentElement.style.overflow = "hidden";
    void enter(0);
  });

  onDestroy(() => {
    document.documentElement.style.overflow = "";
    closeMicrophone(microphone);
  });

  $effect(() => {
    if (finished) closeMicrophone(microphone);
  });
</script>

<div
  class="fixed inset-0 z-[90] overflow-y-auto bg-paper"
  bind:this={overlay}
  use:portal
  role="dialog"
  aria-modal="true"
  aria-label="Slovak level test"
>
  <header class="sticky top-0 z-10 border-b border-slate-200 bg-surface/95 backdrop-blur">
    <div
      class="mx-auto flex max-w-[1080px] items-center gap-4 px-6 py-3 max-[560px]:px-4"
    >
      <div class="min-w-0 flex-1">
        <p class="m-0 truncate font-serif text-base font-semibold text-slate-900">
          Slovak level test
        </p>

        <p class="m-0 truncate text-xs text-slate-500">
          {finished ? "Results" : SECTION_LABEL[section]}
        </p>
      </div>

      {#if !finished}
        <p
          class="m-0 shrink-0 text-xs font-semibold tabular-nums text-slate-500"
          aria-hidden="true"
        >
          {Math.min(index + 1, plan.length)} / {plan.length}
        </p>
      {/if}

      <button
        class="{iconButtonClass} {iconButtonToneClass} -mr-1.5 size-9"
        type="button"
        aria-label={finished ? "Close results" : "Leave the test"}
        onclick={leave}
      >
        <svg
          class="size-5 fill-none stroke-current"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <div
      class="h-1 bg-slate-200"
      role="progressbar"
      aria-label="Test progress"
      aria-valuemin={0}
      aria-valuemax={plan.length}
      aria-valuenow={Math.max(0, index)}
    >
      <div
        class="h-full bg-blue-600 transition-[width] duration-200 ease-out"
        style:width={`${(finished ? 1 : progress) * 100}%`}
      ></div>
    </div>
  </header>

  <main class="px-6 py-10 max-[560px]:px-3 max-[560px]:py-6">
    {#if finished}
      <LevelTestResults
        {bank}
        {plan}
        {mode}
        {capabilities}
        {responses}
        {production}
        microphone={microphone !== null}
        onclose={onexit}
        {onretake}
      />
    {:else if introFor}
      <SectionIntro
        section={introFor}
        {plan}
        {timed}
        oncontinue={() => (introFor = null)}
      />
    {:else if content}
      {#key index}
        {#if content.kind === "readSelect"}
          <ReadSelectTask item={content.item} {seconds} ondone={stepDone} />
        {:else if content.kind === "listenSelect"}
          <ListenSelectTask items={content.items} {seconds} ondone={stepDone} />
        {:else if content.kind === "listenLength"}
          <ListenLengthTask items={content.items} {seconds} ondone={stepDone} />
        {:else if content.kind === "fillBlank"}
          <FillBlankTask item={content.item} {seconds} ondone={stepDone} />
        {:else if content.kind === "chooseVerb"}
          <ChooseVerbTask items={content.items} {seconds} ondone={stepDone} />
        {:else if content.kind === "placeClitic"}
          <PlaceCliticTask items={content.items} {seconds} ondone={stepDone} />
        {:else if content.kind === "readComplete"}
          <ReadCompleteTask item={content.item} {seconds} ondone={stepDone} />
        {:else if content.kind === "listenType"}
          <ListenTypeTask item={content.item} {seconds} ondone={stepDone} />
        {:else if content.kind === "interactiveReading"}
          <InteractiveReadingTask set={content.set} {seconds} ondone={stepDone} />
        {:else if content.kind === "interactiveListening"}
          <InteractiveListeningTask
            set={content.set}
            {seconds}
            scoring={capabilities.scoring}
            ondone={stepDone}
          />
        {:else if content.kind === "writePhoto" || content.kind === "interactiveWriting" || content.kind === "writingSample"}
          <WritingTask {content} {seconds} {timed} ondone={stepDone} />
        {:else if content.kind === "planned"}
          <PlannedTask
            tasks={content.tasks}
            {capabilities}
            microphone={speaking}
            ondone={stepDone}
          />
        {:else}
          <SpeakingTask {content} stream={microphone} {timed} ondone={stepDone} />
        {/if}
      {/key}
    {:else if askingMicrophone}
      <p class="m-0 py-16 text-center text-sm text-slate-600" role="status">
        Allow the microphone when your browser asks, so the speaking tasks can record you.
      </p>
    {/if}
  </main>
</div>
