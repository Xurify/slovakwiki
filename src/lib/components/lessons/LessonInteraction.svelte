<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import ClockIllustration from "$lib/components/ClockIllustration.svelte";

  import { tick } from "svelte";
  import { answersMatch } from "$lib/client/practice-state";
  import type { LessonExercise } from "$lib/content/learning-types";
  import LessonScene from "./LessonScene.svelte";

  let {
    exercise,
    onresolve,
  }: {
    exercise: LessonExercise;
    onresolve: () => void;
  } = $props();

  let selectedId = $state<string | null>(null);
  let builtTiles = $state<string[]>([]);
  let input = $state("");
  let submitted = $state(false);
  let revealed = $state(false);
  let feedbackPanel = $state<HTMLElement | null>(null);

  const graded = $derived(exercise.type !== "personal" ? exercise : null);
  const correct = $derived.by(() => {
    if (!graded || !submitted || revealed) return false;
    if (graded.type === "choice") return selectedId === graded.answerId;
    if (graded.type === "build")
      return (
        builtTiles.length === graded.answer.length &&
        builtTiles.every((tile, index) => tile === graded.answer[index])
      );
    return answersMatch(input, graded.answer, graded.acceptedAnswers);
  });
  const canCheck = $derived.by(() => {
    if (!graded || submitted) return false;
    if (graded.type === "choice") return selectedId !== null;
    if (graded.type === "build") return builtTiles.length === graded.tiles.length;
    return input.trim().length > 0;
  });

  async function focusFeedback(): Promise<void> {
    await tick();
    feedbackPanel?.focus();
  }

  async function check(): Promise<void> {
    if (!canCheck || !graded) return;
    submitted = true;
    await focusFeedback();
  }

  async function reveal(): Promise<void> {
    if (!graded || submitted) return;
    revealed = true;
    submitted = true;
    await focusFeedback();
  }

  function continueLesson(): void {
    onresolve();
  }

  function addTile(tile: string): void {
    if (!submitted) builtTiles = [...builtTiles, tile];
  }

  function removeTile(index: number): void {
    if (!submitted) builtTiles = builtTiles.filter((_, tileIndex) => tileIndex !== index);
  }
</script>

<section
  class="border border-slate-200 bg-surface/90 p-7 max-[560px]:px-4 max-[560px]:py-5"
  aria-labelledby="interaction-heading"
>
  {#if exercise.type === "personal"}
    <Eyebrow>Say it yourself</Eyebrow>
    <h2
      id="interaction-heading"
      class="font-serif text-xl font-semibold leading-snug text-slate-900"
    >
      {exercise.prompt}
    </h2>

    {#if exercise.example}
      <p
        class="mt-4 border-l-4 border-blue-600 bg-slate-50 px-3.5 py-3 font-serif text-lg text-blue-800"
        lang="sk"
      >
        {exercise.example}
      </p>
    {/if}

    <Button class="mt-6" type="button" onclick={() => onresolve()}>I said it</Button>
  {:else}
    <Eyebrow>Your turn</Eyebrow>
    <h2
      id="interaction-heading"
      class="font-serif text-xl font-semibold leading-snug text-slate-900"
    >
      {exercise.prompt}
    </h2>

    {#if exercise.context?.length}
      <div class="mt-5">
        <LessonScene scene={exercise.context} />
      </div>
    {/if}

    {#if exercise.type === "choice"}
      {@const hasClocks = exercise.choices.some((choice) => choice.clock)}
      <div
        class={hasClocks
          ? "mt-6 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3"
          : "mt-6 grid gap-2 border-t border-slate-200"}
        aria-label="Answer choices"
      >
        {#each exercise.choices as choice (choice.id)}
          <button
            class={hasClocks
              ? `grid w-full cursor-pointer justify-items-center gap-2 border px-3 py-4 text-center font-serif text-sm font-semibold hover:border-blue-600 hover:bg-blue-50 disabled:cursor-default disabled:opacity-100 ${selectedId === choice.id ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-200 bg-transparent text-slate-900"}`
              : `w-full cursor-pointer border-0 border-b border-slate-200 px-3 py-4 text-left font-serif text-base font-semibold transition-[background-color,color,padding-left] hover:bg-blue-50 disabled:cursor-default disabled:opacity-100 ${selectedId === choice.id ? "bg-blue-50 pl-4 text-blue-800" : "bg-transparent text-slate-900"}`}
            disabled={submitted}
            type="button"
            aria-pressed={selectedId === choice.id}
            onclick={() => (selectedId = choice.id)}
          >
            {#if choice.clock}
              <ClockIllustration
                hour={choice.clock.hour}
                minute={choice.clock.minute}
                size={88}
              />
            {/if}
            <span lang="sk">{choice.label}</span>
          </button>
        {/each}
      </div>
    {:else if exercise.type === "build"}
      <div class="mt-6 grid gap-3" aria-label="Build the sentence">
        <div
          class="flex min-h-[60px] flex-wrap content-center gap-2 border border-slate-300 bg-slate-50 p-3"
          aria-live="polite"
        >
          {#if builtTiles.length}
            {#each builtTiles as tile, index (`${tile}-${index}`)}
              <button
                class="cursor-pointer border border-slate-300 bg-surface px-2.5 py-1.5 font-serif font-semibold text-blue-800 disabled:cursor-default"
                type="button"
                disabled={submitted}
                onclick={() => removeTile(index)}
              >
                {tile}
              </button>
            {/each}
          {:else}
            <span class="text-sm text-slate-500">Choose the words in order.</span>
          {/if}
        </div>

        <div class="flex flex-wrap gap-2">
          {#each exercise.tiles as tile, index (`${tile}-${index}`)}
            <button
              class="cursor-pointer border border-slate-300 bg-surface px-3 py-2 font-serif font-semibold text-blue-800 hover:border-blue-600 hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
              type="button"
              disabled={submitted || builtTiles.includes(tile)}
              onclick={() => addTile(tile)}
            >
              {tile}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <label class="mt-6 grid gap-2 text-xs font-bold text-slate-600">
        <span>{exercise.inputLabel}</span>
        <input
          class="min-h-[50px] w-full border border-slate-300 bg-surface px-3 py-2 font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
        class={`mt-6 grid gap-1 border-l-4 p-4 ${correct ? "border-emerald-600 bg-emerald-50" : "border-rose-600 bg-rose-50"}`}
        aria-live="polite"
        tabindex="-1"
      >
        <p class="m-0 text-xs font-bold uppercase text-slate-600">
          {correct ? "That works." : "Try this."}
        </p>

        {#if exercise.feedback.correction}
          <strong class="font-serif text-lg text-slate-900" lang="sk">
            {exercise.feedback.correction}
          </strong>
        {/if}
        {#if exercise.feedback.english}
          <small class="text-slate-500">{exercise.feedback.english}</small>
        {/if}
        <span class="mt-1 max-w-[67ch] font-serif leading-6 text-slate-700">
          {exercise.feedback.why}
        </span>
      </div>

      <Button class="mt-6" type="button" onclick={continueLesson}>Continue</Button>
    {:else}
      <div
        class="mt-6 flex items-center gap-4 max-[560px]:flex-col max-[560px]:items-stretch"
      >
        <Button
          class="mt-0 max-[560px]:w-full"
          type="button"
          disabled={!canCheck}
          onclick={check}
        >
          Check
        </Button>

        {#if exercise.type === "typed"}
          <button
            class="cursor-pointer border-0 bg-transparent text-xs font-bold text-blue-800 underline underline-offset-2"
            type="button"
            onclick={reveal}
          >
            Reveal answer
          </button>
        {/if}
      </div>
    {/if}
  {/if}
</section>
