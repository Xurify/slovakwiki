<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import Button from "$lib/components/ui/Button.svelte";
  import { gradeChoice, gradeHighlight, type TokenSpan } from "$lib/level-test/grade";
  import {
    fillOpening,
    fullReadingPassage,
    spanOfSubstring,
    tokenizePassage,
  } from "$lib/level-test/passage";
  import { taskResponse } from "$lib/level-test/session";
  import type {
    InteractiveReadingSet,
    ItemResponse,
    ReadingBlank,
  } from "$lib/level-test/types";

  import TaskFrame from "../TaskFrame.svelte";
  import { optionDotClass, optionRowClass } from "../level-test-ui";
  import type { StepDone } from "../steps";

  let {
    set,
    seconds,
    ondone,
  }: {
    set: InteractiveReadingSet;
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  type Phase = "sentences" | "passage" | "highlight-0" | "highlight-1" | "idea" | "title";

  const PHASES: Phase[] = [
    "sentences",
    "passage",
    "highlight-0",
    "highlight-1",
    "idea",
    "title",
  ];

  const HEADINGS: Record<Phase, string> = {
    sentences: "Select the best word for each gap",
    passage: "Select the sentence that best fills the gap",
    "highlight-0": "Highlight the answer in the text",
    "highlight-1": "Highlight the answer in the text",
    idea: "Select the idea that is expressed in the passage",
    title: "Select the best title for the passage",
  };

  const MULTIPLE_CHOICE_GUESS = 0.25;

  let phaseIndex = $state(0);
  let blanks = $state<Record<string, number | null>>({});
  let missing = $state<number | null>(null);
  let idea = $state<number | null>(null);
  let title = $state<number | null>(null);
  let highlights = $state<[TokenSpan | null, TokenSpan | null]>([null, null]);
  let dragging = $state(false);
  let anchor: number | null = null;
  let moved = false;
  let done = false;

  const phase = $derived(PHASES[phaseIndex] ?? "title");
  const highlightIndex = $derived(phase === "highlight-1" ? 1 : 0);
  const passageText = $derived(fullReadingPassage(set));
  const tokens = $derived(tokenizePassage(passageText));
  const openingFilled = $derived(fillOpening(set.opening));
  const blankParts = $derived(
    set.opening.filter((part): part is ReadingBlank => typeof part !== "string"),
  );

  const canContinue = $derived.by(() => {
    if (phase === "sentences")
      return blankParts.every((blank) => blanks[blank.id] != null);
    if (phase === "passage") return missing !== null;
    if (phase === "idea") return idea !== null;
    if (phase === "title") return title !== null;
    return highlights[highlightIndex] !== null;
  });

  function finish(): void {
    if (done) return;
    done = true;
    const id = set.id;
    const difficulty = set.difficulty;
    const responses: ItemResponse[] = [
      ...blankParts.map((blank) =>
        taskResponse(
          `${id}#${blank.id}`,
          "irCompleteSentences",
          "reading",
          difficulty,
          gradeChoice(blank.answer, blanks[blank.id] ?? null),
          MULTIPLE_CHOICE_GUESS,
        ),
      ),
      taskResponse(
        `${id}#passage`,
        "irCompletePassage",
        "reading",
        difficulty,
        gradeChoice(set.missingSentence.answer, missing),
        MULTIPLE_CHOICE_GUESS,
      ),
      ...set.highlights.map((highlight, index) => {
        const gold = spanOfSubstring(tokens, passageText, highlight.answer);
        return taskResponse(
          `${id}#highlight-${index}`,
          "irHighlight",
          "reading",
          difficulty,
          gold ? gradeHighlight(gold, highlights[index] ?? null) : 0,
        );
      }),
      taskResponse(
        `${id}#idea`,
        "irIdentifyIdea",
        "reading",
        difficulty,
        gradeChoice(set.mainIdea.answer, idea),
        MULTIPLE_CHOICE_GUESS,
      ),
      taskResponse(
        `${id}#title`,
        "irTitle",
        "reading",
        difficulty,
        gradeChoice(set.title.answer, title),
        MULTIPLE_CHOICE_GUESS,
      ),
    ];
    ondone({ responses });
  }

  function next(): void {
    if (phaseIndex >= PHASES.length - 1) finish();
    else phaseIndex += 1;
  }

  function tokenIndexAt(x: number, y: number): number | null {
    const element = document.elementFromPoint(x, y);
    const index = element instanceof HTMLElement ? element.dataset.token : undefined;
    return index === undefined ? null : Number(index);
  }

  function setSpan(a: number, b: number): void {
    const next: [TokenSpan | null, TokenSpan | null] = [...highlights];
    next[highlightIndex] = { start: Math.min(a, b), end: Math.max(a, b) };
    highlights = next;
  }

  function pointerDown(event: PointerEvent, index: number): void {
    event.preventDefault();
    const current = highlights[highlightIndex];
    // A second tap extends a one-word pick into a range (touch has no drag-select).
    if (current && current.start === current.end && !dragging) {
      anchor = current.start;
    } else {
      anchor = index;
    }
    moved = false;
    dragging = true;
    setSpan(anchor, index);
  }

  function pointerMove(event: PointerEvent): void {
    if (!dragging || anchor === null) return;
    const index = tokenIndexAt(event.clientX, event.clientY);
    if (index === null || !tokens[index]?.word) return;
    moved = true;
    setSpan(anchor, index);
  }

  function pointerUp(): void {
    if (!dragging) return;
    dragging = false;
    if (moved) anchor = null;
  }

  function clearHighlight(): void {
    const next: [TokenSpan | null, TokenSpan | null] = [...highlights];
    next[highlightIndex] = null;
    highlights = next;
    anchor = null;
  }

  function isHighlighted(index: number): boolean {
    const span = highlights[highlightIndex];
    return span !== null && index >= span.start && index <= span.end;
  }

  const selectClass =
    "mx-0.5 inline-block cursor-pointer rounded-(--control-radius) border border-blue-600/60 bg-blue-50 px-2 py-0.5 align-baseline font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
</script>

<svelte:window onpointerup={pointerUp} onpointermove={pointerMove} />

<TaskFrame
  heading={HEADINGS[phase]}
  {seconds}
  timerLabel="for this passage"
  onexpire={finish}
  wide
  meta={`Part ${phaseIndex + 1} of ${PHASES.length}`}
>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
    <div class="min-w-0 rounded-(--control-radius) bg-subtle/60 px-5 py-4" lang="sk">
      {#if phase === "sentences"}
        <p class="m-0 font-serif text-lg leading-[2.4] text-pretty text-slate-900">
          {#each set.opening as part, index (index)}
            {#if typeof part === "string"}
              {part}
            {:else}
              <select
                class={selectClass}
                aria-label={`Gap ${blankParts.indexOf(part) + 1}`}
                value={blanks[part.id] ?? ""}
                onchange={(event) => {
                  const value = (event.currentTarget as HTMLSelectElement).value;
                  blanks = { ...blanks, [part.id]: value === "" ? null : Number(value) };
                }}
              >
                <option value="" disabled>Select…</option>

                {#each part.options as option, optionIndex (optionIndex)}
                  <option value={optionIndex}>{option}</option>
                {/each}
              </select>
            {/if}
          {/each}
        </p>
      {:else if phase === "passage"}
        <p class="m-0 font-serif text-lg leading-relaxed text-pretty text-slate-900">
          {openingFilled}
        </p>

        <p
          class="my-3 rounded-(--control-radius) border-2 border-dashed px-3 py-2 font-serif text-lg leading-snug {missing ===
          null
            ? 'border-slate-300 text-slate-400'
            : 'border-blue-600/60 bg-blue-50 text-slate-900'}"
        >
          {missing === null ? "Missing sentence" : set.missingSentence.options[missing]}
        </p>

        <p class="m-0 font-serif text-lg leading-relaxed text-pretty text-slate-900">
          {set.closing}
        </p>
      {:else if phase.startsWith("highlight")}
        <p
          class="m-0 cursor-text font-serif text-lg leading-relaxed text-pretty text-slate-900 select-none"
          style:touch-action={dragging ? "none" : "auto"}
        >
          {#each tokens as token, index (index)}
            {#if token.word}
              <span
                class="rounded-[2px] transition-colors duration-150 ease-out {isHighlighted(
                  index,
                )
                  ? 'bg-mark-time/25 text-slate-900'
                  : 'hover:bg-blue-50'}"
                data-token={index}
                role="presentation"
                onpointerdown={(event) => pointerDown(event, index)}
              >
                {token.text}
              </span>
            {:else}
              <span
                class={isHighlighted(index - 1) && isHighlighted(index + 1)
                  ? "bg-mark-time/25"
                  : ""}
                data-token={index}
              >
                {token.text}
              </span>
            {/if}
          {/each}
        </p>
      {:else}
        <p class="m-0 font-serif text-lg leading-relaxed text-pretty text-slate-900">
          {passageText}
        </p>
      {/if}
    </div>

    <div class="grid content-start gap-4">
      {#if phase === "sentences"}
        <p class="m-0 text-sm text-slate-600">
          Pick the form that fits each gap. The text stays here for the next parts.
        </p>
      {:else if phase === "passage"}
        <p class={eyebrowMutedClass}>Options</p>

        {#each set.missingSentence.options as option, index (index)}
          <button
            class={optionRowClass(missing === index)}
            type="button"
            lang="sk"
            onclick={() => (missing = index)}
          >
            <span class={optionDotClass(missing === index)} aria-hidden="true"></span>
            {option}
          </button>
        {/each}
      {:else if phase.startsWith("highlight")}
        {@const question = set.highlights[highlightIndex]}
        <p class={eyebrowMutedClass}>Question</p>

        <p
          class="m-0 font-serif text-xl font-semibold leading-snug text-slate-900"
          lang="sk"
        >
          {question?.question}
        </p>

        <p class="m-0 text-sm text-slate-500">{question?.english}</p>

        <p class="m-0 text-sm text-slate-600">
          Drag across the words that answer it, or tap the first word and then the last.
        </p>

        {#if highlights[highlightIndex]}
          <Button variant="secondary" class="justify-self-start" onclick={clearHighlight}>
            Clear highlight
          </Button>
        {/if}
      {:else}
        {@const question = phase === "idea" ? set.mainIdea : set.title}
        {@const chosen = phase === "idea" ? idea : title}
        <p class={eyebrowMutedClass}>Options</p>

        {#each question.options as option, index (index)}
          <button
            class={optionRowClass(chosen === index)}
            type="button"
            lang="sk"
            onclick={() => {
              if (phase === "idea") idea = index;
              else title = index;
            }}
          >
            <span class={optionDotClass(chosen === index)} aria-hidden="true"></span>
            {option}
          </button>
        {/each}
      {/if}
    </div>
  </div>

  {#snippet footer()}
    <Button variant="accent" class="min-w-32" onclick={next}>
      {#if !canContinue}
        Skip
      {:else if phaseIndex === PHASES.length - 1}
        Finish passage
      {:else}
        Next
      {/if}
    </Button>
  {/snippet}
</TaskFrame>
