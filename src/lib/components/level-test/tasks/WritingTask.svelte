<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import Button from "$lib/components/ui/Button.svelte";
  import {
    INTERACTIVE_WRITING_FOLLOW_UP_SECONDS,
    PREPARE_SECONDS,
  } from "$lib/level-test/plan";
  import type { PhotoPrompt, WritingPrompt } from "$lib/level-test/types";

  import PhotoFigure from "../PhotoFigure.svelte";
  import SlovakKeys from "../SlovakKeys.svelte";
  import TaskFrame from "../TaskFrame.svelte";
  import { textAreaClass, wordCount } from "../level-test-ui";
  import type { StepDone } from "../steps";

  type Content =
    | { kind: "writePhoto"; photo: PhotoPrompt }
    | { kind: "interactiveWriting"; prompt: WritingPrompt }
    | { kind: "writingSample"; prompt: WritingPrompt };

  let {
    content,
    seconds,
    timed,
    ondone,
  }: {
    content: Content;
    seconds: number | null;
    timed: boolean;
    ondone: StepDone;
  } = $props();

  const PHOTO_PROMPT = {
    slovak: "Napíšte aspoň jednu vetu o tom, čo vidíte na fotke.",
    english: "Write at least one sentence about what you see in the photo.",
  };

  const question = $derived(
    content.kind === "writePhoto" ? PHOTO_PROMPT : content.prompt,
  );
  const followUp = $derived(
    content.kind === "interactiveWriting" ? content.prompt.followUp : undefined,
  );

  let phase = $state<"prepare" | "write" | "followUp">(initialPhase());
  let first = $state("");
  let second = $state("");
  let done = false;

  function initialPhase(): "prepare" | "write" {
    return content.kind === "writePhoto" ? "write" : "prepare";
  }

  function finish(): void {
    if (done) return;
    done = true;
    const parts = followUp ? [first.trim(), second.trim()] : [first.trim()];
    const hasText = Boolean(first.trim() || second.trim());

    ondone({
      responses: [],
      production: [
        {
          kind: content.kind,
          skill: "writing",
          prompt: followUp ? `${question.slovak} / ${followUp.slovak}` : question.slovak,
          response: hasText ? parts.join("\n\n") : "",
          imageUrl: content.kind === "writePhoto" ? content.photo.src : undefined,
        },
      ],
    });
  }

  function afterWrite(): void {
    if (followUp && phase === "write") phase = "followUp";
    else finish();
  }

  const heading = $derived(
    content.kind === "writePhoto"
      ? "Write about the photo"
      : phase === "followUp"
        ? "Answer the follow-up question"
        : content.kind === "interactiveWriting"
          ? "Answer the question in writing"
          : "Write about the topic below",
  );

  const timeLimit = $derived.by(() => {
    if (!timed) return null;
    if (phase === "prepare") return PREPARE_SECONDS[content.kind] ?? 30;
    if (phase === "followUp") return INTERACTIVE_WRITING_FOLLOW_UP_SECONDS;
    return seconds;
  });
</script>

{#key phase}
  <TaskFrame
    {heading}
    seconds={timeLimit}
    timerLabel={phase === "prepare" ? "to prepare" : "to write"}
    onexpire={phase === "prepare" ? () => (phase = "write") : afterWrite}
    wide={content.kind === "writePhoto"}
  >
    <div
      class={content.kind === "writePhoto"
        ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start"
        : "grid gap-5"}
    >
      {#if content.kind === "writePhoto"}
        <PhotoFigure photo={content.photo} />
      {/if}

      <div class="grid content-start gap-4">
        <div class="grid gap-1">
          <p
            class="m-0 font-serif text-xl font-semibold leading-snug text-slate-900"
            lang="sk"
          >
            {question.slovak}
          </p>

          <p class="m-0 text-sm text-slate-500">{question.english}</p>
        </div>

        {#if phase === "prepare"}
          <p class="m-0 text-sm text-slate-600">
            Take a moment to think. Writing starts when the clock runs out, or now if you
            are ready.
          </p>
        {:else}
          {#if phase === "followUp" && followUp}
            <div class="grid gap-2 rounded-(--control-radius) bg-subtle/60 px-4 py-3">
              <p class={eyebrowMutedClass}>Your first answer</p>
              <p
                class="m-0 font-serif text-base whitespace-pre-wrap text-slate-700"
                lang="sk"
              >
                {first.trim() || "—"}
              </p>
            </div>

            <div class="grid gap-1">
              <p
                class="m-0 font-serif text-xl font-semibold leading-snug text-slate-900"
                lang="sk"
              >
                {followUp.slovak}
              </p>

              <p class="m-0 text-sm text-slate-500">{followUp.english}</p>
            </div>
          {/if}

          <label class="sr-only" for="level-test-writing">Your answer</label>
          {#if phase === "followUp"}
            <textarea
              id="level-test-writing"
              class={textAreaClass}
              bind:value={second}
              spellcheck="false"
              lang="sk"></textarea>
          {:else}
            <textarea
              id="level-test-writing"
              class="{textAreaClass} {content.kind === 'writingSample' ? 'min-h-56' : ''}"
              bind:value={first}
              spellcheck="false"
              lang="sk"></textarea>
          {/if}

          <div class="flex flex-wrap items-center justify-between gap-3">
            <SlovakKeys />

            <p class="m-0 text-xs tabular-nums text-slate-500">
              {wordCount(phase === "followUp" ? second : first)} words
            </p>
          </div>
        {/if}
      </div>
    </div>

    {#snippet footer()}
      {#if phase === "prepare"}
        <Button variant="accent" class="min-w-32" onclick={() => (phase = "write")}>
          Start writing
        </Button>
      {:else}
        <Button variant="accent" class="min-w-32" onclick={afterWrite}>Next</Button>
      {/if}
    {/snippet}
  </TaskFrame>
{/key}
