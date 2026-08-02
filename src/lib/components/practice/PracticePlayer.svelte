<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";

  import { tick } from "svelte";
  import { answersMatch } from "$lib/client/practice-state";
  import AudioButton from "$lib/components/AudioButton.svelte";
  import type { PracticeItem } from "$lib/content/learning-types";

  let {
    items,
    mode,
    onresult,
  }: {
    items: PracticeItem[];
    mode: "review" | "topic";
    onresult: (result: { itemId: string; needsReview: boolean }) => void;
  } = $props();

  let activeIndex = $state(0);
  let builtTiles = $state<string[]>([]);
  let input = $state("");
  let selectedId = $state<string | null>(null);
  let submitted = $state(false);
  let revealed = $state(false);
  let finished = $state(false);
  let feedbackPanel = $state<HTMLElement | null>(null);

  const current = $derived(items[activeIndex]);
  const task = $derived(current.task);
  const correct = $derived.by(() => {
    if (!submitted || revealed) return false;
    if (task.type === "choice") return selectedId === task.answerId;
    if (task.type === "build")
      return (
        builtTiles.length === task.answer.length &&
        task.answer.every((tile, index) => tile === builtTiles[index])
      );
    return answersMatch(input, task.answer, task.acceptedAnswers);
  });
  const canCheck = $derived.by(() => {
    if (submitted) return false;
    if (task.type === "choice") return selectedId !== null;
    if (task.type === "build") return builtTiles.length === task.tiles.length;
    return input.trim().length > 0;
  });

  async function check(): Promise<void> {
    if (!canCheck) return;
    submitted = true;
    await tick();
    feedbackPanel?.focus();
  }

  async function reveal(): Promise<void> {
    if (submitted || task.type !== "typed") return;
    revealed = true;
    submitted = true;
    await tick();
    feedbackPanel?.focus();
  }

  function selectTile(tile: string): void {
    if (!submitted) builtTiles = [...builtTiles, tile];
  }

  function removeTile(index: number): void {
    if (!submitted) builtTiles = builtTiles.filter((_, tileIndex) => tileIndex !== index);
  }

  function next(): void {
    onresult({ itemId: current.id, needsReview: revealed || !correct });
    if (activeIndex === items.length - 1) {
      finished = true;
      return;
    }
    activeIndex += 1;
    builtTiles = [];
    input = "";
    selectedId = null;
    submitted = false;
    revealed = false;
  }
</script>

{#if finished}
  <section class="max-w-[590px] border-l-2 border-emerald-600 bg-emerald-50 py-2 pl-6">
    <p class="m-0 text-xs font-semibold uppercase tracking-widest text-emerald-700">
      Finished
    </p>
    <h2 id="practice-finished-heading" class="mb-1 mt-2 text-3xl">
      Keep the useful ones close.
    </h2>
    <span class="font-serif text-slate-700"
      >{mode === "review"
        ? "Anything still uncertain will remain in Review."
        : "Missed or revealed items are now in Review."}</span
    ><Button class="mt-5" href="/practice">Back to Practice</Button>
  </section>
{:else}
  <section class="max-w-[720px]" aria-labelledby="practice-question">
    <div
      class="flex justify-between gap-5 text-xs font-bold uppercase tracking-wide text-slate-500"
      aria-label={`Item ${activeIndex + 1} of ${items.length}`}
    >
      <span>{mode === "review" ? "Review" : "Practice"}</span>
      <span>{activeIndex + 1} of {items.length}</span>
    </div>

    <div class="mt-3 h-1 bg-slate-200">
      <span
        class="block h-full bg-blue-600 transition-[width]"
        style:width={`${((activeIndex + 1) / items.length) * 100}%`}
      ></span>
    </div>

    {#if task.context?.length}
      <div class="mt-8 grid border-t border-slate-200">
        {#each task.context as line (line.id)}
          <div
            class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2.5 border-b border-slate-200 py-3 max-[540px]:grid-cols-[1fr_auto]"
          >
            <span class="text-xs font-bold uppercase text-blue-700">{line.speaker}</span>
            <strong class="font-serif text-base" lang="sk">{line.slovak}</strong>
            <AudioButton
              src={line.audio?.src}
              text={line.audio?.transcript ?? line.slovak}
            />
            <small class="col-start-2 text-xs text-slate-500 max-[540px]:col-span-2">
              {line.english}
            </small>
          </div>
        {/each}
      </div>
    {/if}

    <h1 id="practice-question" class="mt-8 max-w-[25ch]">{task.prompt}</h1>

    {#if task.type === "choice"}
      <div class="mt-7 grid gap-2">
        {#each task.choices as choice (choice.id)}
          <button
            class={`min-h-14 w-full cursor-pointer rounded border px-4 py-3 text-left font-serif text-base font-semibold hover:border-blue-600 hover:bg-blue-50 disabled:cursor-default disabled:opacity-100 ${selectedId === choice.id ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-300 bg-white text-slate-900"}`}
            disabled={submitted}
            type="button"
            aria-pressed={selectedId === choice.id}
            onclick={() => (selectedId = choice.id)}
          >
            {choice.label}
          </button>
        {/each}
      </div>
    {:else if task.type === "build"}
      <div class="mt-7 grid gap-3">
        <div
          class="flex min-h-[62px] flex-wrap content-center gap-2 border border-slate-300 bg-slate-50 p-3"
          aria-live="polite"
        >
          {#if builtTiles.length}
            {#each builtTiles as tile, index (`${tile}-${index}`)}
              <button
                class="border border-slate-300 bg-white px-2.5 py-2 font-serif font-semibold text-blue-800"
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
          {#each task.tiles as tile, index (`${tile}-${index}`)}
            <button
              class="border border-slate-300 bg-white px-3 py-2 font-serif font-semibold text-blue-800 hover:border-blue-600 hover:bg-blue-50 disabled:opacity-40"
              type="button"
              disabled={submitted || builtTiles.includes(tile)}
              onclick={() => selectTile(tile)}
            >
              {tile}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <label class="mt-7 grid gap-2 text-xs font-bold text-slate-600">
        <span>{task.inputLabel}</span>
        <input
          class="min-h-[52px] w-full border border-slate-300 bg-white px-3 py-2 font-serif text-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
        class={`mt-7 grid gap-1 border-l-4 p-[18px] ${correct ? "border-emerald-600 bg-emerald-50" : "border-rose-600 bg-rose-50"}`}
        bind:this={feedbackPanel}
        aria-live="polite"
        tabindex="-1"
      >
        <p class="m-0 text-xs font-bold uppercase tracking-wide text-slate-600">
          {correct ? "That works." : "Try this."}
        </p>
        <strong class="font-serif text-lg" lang="sk">{current.feedback.correction}</strong
        >
        {#if current.feedback.english}
          <small class="text-slate-500">{current.feedback.english}</small>
        {/if}
        <span class="max-w-[65ch] font-serif leading-6 text-slate-700">
          {current.feedback.why}
        </span>
        {#if current.newUse}
          <em class="mt-1 font-serif not-italic text-blue-800">{current.newUse}</em>
        {/if}
      </div>

      <Button class="mt-5" type="button" onclick={next}>
        {activeIndex === items.length - 1 ? "Finish" : "Continue"}
      </Button>
    {:else}
      <div
        class="mt-6 flex items-center gap-4 max-[540px]:flex-col max-[540px]:items-stretch"
      >
        <Button
          class="mt-0 max-[540px]:w-full"
          type="button"
          disabled={!canCheck}
          onclick={check}
        >
          Check
        </Button>

        {#if task.type === "typed"}
          <button
            class="border-0 bg-transparent text-xs font-bold text-blue-800 underline underline-offset-2"
            type="button"
            onclick={reveal}
          >
            Reveal answer
          </button>
        {/if}
      </div>
    {/if}
  </section>
{/if}
