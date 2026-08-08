<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import ClockIllustration from "$lib/components/ClockIllustration.svelte";

  import { tick } from "svelte";
  import {
    canCheckBuild,
    gradeBuild,
    isBankTileUsed,
    resolveBuiltTiles,
  } from "$lib/client/build-tiles";
  import { answersMatch } from "$lib/client/practice-state";
  import { playAnswerSfx } from "$lib/client/sfx";
  import type { LessonExercise } from "$lib/content/learning-types";
  import SfxMuteToggle from "$lib/components/SfxMuteToggle.svelte";
  import PracticeDialogueBubble from "$lib/components/practice/PracticeDialogueBubble.svelte";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";

  let {
    exercise,
    onresolve,
    sceneAudioSrcs = {},
  }: {
    exercise: LessonExercise;
    onresolve: () => void;
    sceneAudioSrcs?: Record<string, string>;
  } = $props();

  let selectedId = $state<string | null>(null);
  let builtBankIndexes = $state<number[]>([]);
  let input = $state("");
  let submitted = $state(false);
  let revealed = $state(false);
  let feedbackPanel = $state<HTMLElement | null>(null);

  const graded = $derived(exercise.type !== "personal" ? exercise : null);
  const hasContext = $derived(Boolean(exercise.context?.length));
  const builtTiles = $derived(
    graded?.type === "build" ? resolveBuiltTiles(graded.tiles, builtBankIndexes) : [],
  );
  const correct = $derived.by(() => {
    if (!graded || !submitted || revealed) return false;
    if (graded.type === "choice") return selectedId === graded.answerId;
    if (graded.type === "build") return gradeBuild(builtTiles, graded.answer);
    return answersMatch(input, graded.answer, graded.acceptedAnswers);
  });
  const showCorrection = $derived(submitted && (revealed || !correct));
  const canCheck = $derived.by(() => {
    if (!graded || submitted) return false;
    if (graded.type === "choice") return selectedId !== null;
    if (graded.type === "build")
      return canCheckBuild(builtTiles.length, graded.answer.length);
    return input.trim().length > 0;
  });

  async function focusFeedback(): Promise<void> {
    await tick();
    feedbackPanel?.focus();
  }

  async function check(): Promise<void> {
    if (!canCheck || !graded) return;

    let kind: "correct" | "incorrect" = "incorrect";

    if (graded.type === "choice") {
      kind = selectedId === graded.answerId ? "correct" : "incorrect";
    } else if (graded.type === "build") {
      kind = gradeBuild(builtTiles, graded.answer) ? "correct" : "incorrect";
    } else {
      kind = answersMatch(input, graded.answer, graded.acceptedAnswers)
        ? "correct"
        : "incorrect";
    }

    submitted = true;
    playAnswerSfx(kind);
    await focusFeedback();
  }

  async function reveal(): Promise<void> {
    if (!graded || submitted) return;
    revealed = true;
    submitted = true;
    playAnswerSfx("incorrect");
    await focusFeedback();
  }

  function continueLesson(): void {
    onresolve();
  }

  function addTile(bankIndex: number): void {
    if (submitted || graded?.type !== "build") return;
    if (isBankTileUsed(builtBankIndexes, bankIndex)) return;
    if (builtBankIndexes.length >= graded.answer.length) return;
    builtBankIndexes = [...builtBankIndexes, bankIndex];
  }

  function removeTile(builtIndex: number): void {
    if (!submitted)
      builtBankIndexes = builtBankIndexes.filter((_, index) => index !== builtIndex);
  }
</script>

<section
  class="border border-slate-200 bg-surface/90 px-7 py-8 max-[560px]:px-4 max-[560px]:py-6"
  aria-labelledby="interaction-heading"
>
  {#if exercise.type === "personal"}
    <h2
      id="interaction-heading"
      class="font-serif text-xl font-semibold leading-snug text-pretty text-slate-900"
    >
      {exercise.prompt}
    </h2>

    {#if exercise.example}
      <p
        class="mt-5 rounded-(--control-radius) border border-slate-200 bg-slate-50/80 px-4 py-3.5 font-serif text-lg text-slate-900"
        lang="sk"
      >
        {exercise.example}
      </p>
    {/if}

    <Button class="mt-7" type="button" onclick={() => onresolve()}>I said it</Button>
  {:else}
    <div class="flex items-start justify-end">
      <SfxMuteToggle />
    </div>

    {#if hasContext}
      <div class="mt-4 grid gap-4">
        {#each exercise.context ?? [] as line (line.id)}
          <PracticeDialogueBubble {line} audioSrcs={sceneAudioSrcs} />
        {/each}
      </div>
    {/if}

    <h2
      id="interaction-heading"
      class="{hasContext
        ? 'mt-5'
        : 'mt-4'} m-0 font-serif text-xl font-semibold leading-snug text-pretty text-slate-900"
    >
      {exercise.prompt}
    </h2>

    {#if exercise.type === "choice"}
      {#if exercise.clock}
        <div class="mt-6 flex justify-center">
          <ClockIllustration
            hour={exercise.clock.hour}
            minute={exercise.clock.minute}
            size={120}
          />
        </div>
      {/if}

      <div class="mt-6 grid gap-2.5" aria-label="Answer choices">
        {#each exercise.choices as choice (choice.id)}
          <button
            class="press-key min-h-14 w-full cursor-pointer rounded-(--control-radius) px-4 py-3.5 text-left font-serif text-base font-semibold"
            disabled={submitted}
            type="button"
            aria-pressed={selectedId === choice.id}
            onclick={() => (selectedId = choice.id)}
          >
            <span lang="sk">{choice.label}</span>
          </button>
        {/each}
      </div>
    {:else if exercise.type === "build"}
      <div class="mt-6 grid gap-3" aria-label="Build the sentence">
        <div
          class="flex min-h-[calc(4.25rem+4px)] flex-wrap content-center gap-2 border border-slate-300 bg-slate-50 p-3.5"
          aria-live="polite"
        >
          {#if builtTiles.length}
            {#each builtTiles as tile, index (`${tile}-${index}`)}
              <button
                class="cursor-pointer border border-slate-300 bg-surface px-2.5 py-2 font-serif font-semibold leading-6 text-blue-800 disabled:cursor-default"
                type="button"
                disabled={submitted}
                onclick={() => removeTile(index)}
              >
                {tile}
              </button>
            {/each}
          {:else}
            <span
              class="border border-transparent px-2.5 py-2 font-serif text-sm font-semibold leading-6 text-slate-500"
            >
              Choose the words in order.
            </span>
          {/if}
        </div>

        <div class="flex flex-wrap gap-2">
          {#each exercise.tiles as tile, index (`${tile}-${index}`)}
            <button
              class="cursor-pointer border border-slate-300 bg-surface px-3 py-2 font-serif font-semibold text-blue-800 hover:border-blue-600 hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
              type="button"
              disabled={submitted || isBankTileUsed(builtBankIndexes, index)}
              onclick={() => addTile(index)}
            >
              {tile}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <label class="mt-6 grid gap-2 text-sm font-medium text-slate-600">
        <span>{exercise.inputLabel}</span>
        <input
          class="min-h-[50px] w-full rounded-(--control-radius) border border-slate-300 bg-control px-3 py-2 font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          bind:value={input}
          disabled={submitted}
          autocomplete="off"
          autocapitalize="none"
          lang="sk"
        />
      </label>
    {/if}

    {#if submitted}
      <div
        bind:this={feedbackPanel}
        class={`mt-6 grid gap-2 rounded-(--control-radius) border px-4 py-3.5 ${correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
        aria-live="polite"
        tabindex="-1"
      >
        <PracticeExerciseFeedback
          correction={exercise.feedback.correction}
          english={exercise.feedback.english}
          why={exercise.feedback.why}
          grade={correct ? "correct" : revealed ? "incorrect" : "incorrect"}
          revealed={revealed || !correct}
          {showCorrection}
        />
      </div>

      <Button class="mt-6" type="button" onclick={continueLesson}>Continue</Button>
    {:else}
      <div
        class="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        {#if exercise.type === "typed"}
          <button
            class="border-0 bg-transparent py-1 text-sm font-semibold text-blue-800 underline underline-offset-2"
            type="button"
            onclick={reveal}
          >
            Reveal answer
          </button>
        {:else}
          <span aria-hidden="true"></span>
        {/if}

        <Button
          class="w-full sm:min-w-36 sm:w-auto"
          type="button"
          disabled={!canCheck}
          onclick={check}
        >
          Check
        </Button>
      </div>
    {/if}
  {/if}
</section>
