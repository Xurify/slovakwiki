<script lang="ts">
  import { onMount } from "svelte";

  import Button from "$lib/components/ui/Button.svelte";
  import DotLoader from "$lib/components/ui/DotLoader.svelte";
  import { eyebrowMutedClass, panelClass } from "$lib/components/ui/system-ui";
  import { buildPlan, planMinutes } from "$lib/level-test/plan";
  import type {
    LevelTestBank,
    PlanStep,
    ScoringCapabilities,
    TestMode,
  } from "$lib/level-test/types";

  import LevelTestRunner from "./LevelTestRunner.svelte";
  import { fetchBank, fetchCapabilities } from "./client";
  import { optionDotClass, optionRowClass } from "./level-test-ui";
  import { canRecord } from "./recorder";
  import { readSavedResult, type SavedResult } from "./storage";

  let capabilities = $state<ScoringCapabilities>({
    scoring: false,
    transcription: false,
  });
  let checked = $state(false);
  let mode = $state<TestMode>("quick");
  let timed = $state(true);
  let speaking = $state(true);
  let microphoneSupported = $state(false);
  let saved = $state<SavedResult | null>(null);
  let bank = $state<LevelTestBank | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let run = $state(0);
  let plan = $state<PlanStep[] | null>(null);

  const useSpeaking = $derived(speaking && microphoneSupported);
  const minutes = $derived({
    quick: planMinutes(buildPlan({ mode: "quick", capabilities, speaking: useSpeaking })),
    full: planMinutes(buildPlan({ mode: "full", capabilities, speaking: useSpeaking })),
  });

  onMount(() => {
    microphoneSupported = canRecord();
    saved = readSavedResult();
    void fetchCapabilities().then((value) => {
      capabilities = value;
      checked = true;
    });
  });

  async function start(): Promise<void> {
    error = null;
    if (!bank) {
      loading = true;
      try {
        bank = await fetchBank();
      } catch (cause) {
        error = cause instanceof Error ? cause.message : "Could not load the test";
        return;
      } finally {
        loading = false;
      }
    }
    plan = buildPlan({ mode, capabilities, speaking: useSpeaking });
    run += 1;
  }

  function close(): void {
    plan = null;
    saved = readSavedResult();
  }

  const MODES: { id: TestMode; title: string; summary: string }[] = [
    {
      id: "quick",
      title: "Quick check",
      summary: "Reading and listening only. The adaptive part of the test.",
    },
    {
      id: "full",
      title: "Full test",
      summary:
        "All four skills, with interactive reading, listening, writing and speaking.",
    },
  ];

  const checkboxClass =
    "mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--accent)] disabled:cursor-not-allowed";
</script>

<div class="{panelClass} grid gap-5 px-5 py-5">
  <div class="grid gap-1">
    <p class={eyebrowMutedClass}>Start the test</p>
    <p class="m-0 text-sm text-slate-600">
      No account needed. Your result stays on this device.
    </p>
  </div>

  <fieldset class="m-0 grid gap-2 border-0 p-0">
    <legend class="sr-only">Test length</legend>

    {#each MODES as option (option.id)}
      <button
        class={optionRowClass(mode === option.id, "font-sans text-base")}
        type="button"
        aria-pressed={mode === option.id}
        onclick={() => (mode = option.id)}
      >
        <span class={optionDotClass(mode === option.id)} aria-hidden="true"></span>
        <span class="grid gap-0.5">
          <span class="font-semibold">
            {option.title}
            <span class="font-normal text-slate-500"
              >· up to {minutes[option.id]} min</span
            >
          </span>
          <span class="text-sm text-slate-600">{option.summary}</span>
        </span>
      </button>
    {/each}
  </fieldset>

  <div class="grid gap-2.5 text-sm text-slate-700">
    <label class="flex cursor-pointer items-start gap-2.5">
      <input class={checkboxClass} type="checkbox" bind:checked={timed} />
      <span>Timed, like the real test</span>
    </label>

    {#if mode === "full"}
      <label class="flex cursor-pointer items-start gap-2.5">
        <input
          class={checkboxClass}
          type="checkbox"
          bind:checked={speaking}
          disabled={!microphoneSupported}
        />
        <span>
          Include speaking (uses your microphone)
          {#if !microphoneSupported}
            <span class="block text-xs text-slate-500"
              >This browser cannot record audio.</span
            >
          {/if}
        </span>
      </label>
    {/if}
  </div>

  {#if mode === "full" && checked && !capabilities.scoring}
    <p class="m-0 rounded-(--control-radius) bg-subtle px-3 py-2 text-xs text-slate-600">
      AI scoring is not switched on for this site yet, so writing and most speaking tasks
      appear as previews of what is planned.
    </p>
  {/if}

  {#if error}
    <p class="m-0 text-sm text-rose-700" role="alert">{error}</p>
  {/if}

  <Button variant="accent" class="w-full" disabled={loading} onclick={() => void start()}>
    {#if loading}
      <DotLoader label="Loading the test" class="text-paper" />
    {:else}
      Start {mode === "quick" ? "quick check" : "full test"}
    {/if}
  </Button>

  {#if saved}
    <p class="m-0 border-t border-slate-200 pt-4 text-sm text-slate-600">
      Last result:
      <span class="font-semibold text-slate-900">{saved.overall.level}</span>
      ({saved.overall.score}/100),
      {new Date(saved.takenAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </p>
  {/if}
</div>

{#if plan && bank}
  {#key run}
    <LevelTestRunner
      {bank}
      {plan}
      {mode}
      {capabilities}
      {timed}
      speaking={useSpeaking}
      onexit={close}
      onretake={() => void start()}
    />
  {/key}
{/if}
