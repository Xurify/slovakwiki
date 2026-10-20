<script lang="ts">
  import { tick } from "svelte";

  import { playFinishSfx } from "$lib/audio/sfx";
  import { episodeCheckCount } from "$lib/catalog/listening";
  import type { EpisodeAudioSrcs } from "$lib/catalog/listening/audio";
  import type { EpisodeNextSteps, ListeningEpisode } from "$lib/catalog/listening/types";
  import Button from "$lib/components/ui/Button.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { eyebrowMutedClass, panelClass } from "$lib/components/ui/system-ui";
  import { playStoryLineAudio } from "$lib/lesson-story/story-audio";
  import { cx } from "$lib/ui/classes";

  import ListenStage from "./ListenStage.svelte";

  let {
    audioSrcs,
    episode,
    next,
  }: {
    audioSrcs: EpisodeAudioSrcs;
    episode: ListeningEpisode;
    /** Where to go once every chapter is done. */
    next: EpisodeNextSteps;
  } = $props();

  let active = $state(0);
  let autoplay = $state(false);
  let scores = $state<Record<string, number>>({});
  /** Bumped by Start again so a chapter that is already open mounts fresh. */
  let run = $state(0);
  let stage = $state<{ pause: () => void }>();
  let stageEl: HTMLElement | undefined = $state();

  const totalChecks = episodeCheckCount(episode);
  const chapter = $derived(episode.chapters[active]!);
  const allDone = $derived(
    episode.chapters.every((entry) => scores[entry.id] !== undefined),
  );
  const totalCorrect = $derived(
    Object.values(scores).reduce((sum, score) => sum + score, 0),
  );

  /** The next chapter still to do, after this one first, then from the top. */
  const nextIndex = $derived.by(() => {
    const open = (index: number) => scores[episode.chapters[index]!.id] === undefined;
    const indexes = episode.chapters.map((_, index) => index);
    return (
      indexes.find((index) => index > active && open(index)) ??
      indexes.find((index) => open(index)) ??
      null
    );
  });

  function openChapter(index: number, play = false): void {
    stage?.pause();
    active = index;
    autoplay = play;
    void scrollToStage();
  }

  function finishChapter(correct: number): void {
    scores = { ...scores, [chapter.id]: correct };
    if (allDone) playFinishSfx();
  }

  function restart(): void {
    scores = {};
    run += 1;
    openChapter(0);
  }

  function playWord(slovak: string): void {
    stage?.pause();
    playStoryLineAudio(audioSrcs.vocabulary[slovak], slovak);
  }

  async function scrollToStage(): Promise<void> {
    await tick();
    stageEl?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
</script>

{#snippet nextChapter()}
  {#if nextIndex !== null}
    <Button
      type="button"
      variant="accent"
      class="min-h-10 px-4 text-sm"
      onclick={() => openChapter(nextIndex, true)}
    >
      Next chapter
    </Button>
  {/if}
{/snippet}

{#snippet episodeDone()}
  {#if allDone}
    <div
      class="animate-rise border-t border-slate-200/70 px-4 py-5 sm:px-5"
      aria-live="polite"
    >
      <p class="m-0 font-serif text-xl text-slate-900">Episode done</p>

      <p class="m-0 mt-1 text-sm text-slate-600">
        {totalCorrect} of {totalChecks} answers right.
      </p>

      <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        {#if next.practiceHref}
          <Button href={next.practiceHref} variant="accent">Practice these forms</Button>
        {/if}

        <TextLink href={next.grammarHref}>Grammar page</TextLink>

        {#if next.lessonHref}
          <TextLink href={next.lessonHref}>Lesson</TextLink>
        {/if}

        <TextLink onclick={restart}>Start again</TextLink>
      </div>
    </div>
  {/if}
{/snippet}

<div class="grid gap-8">
  <section aria-labelledby="words-heading">
    <h2 id="words-heading" class={eyebrowMutedClass}>Words you'll hear</h2>

    <ul class="m-0 mt-2.5 flex list-none flex-wrap gap-2 p-0">
      {#each episode.vocabulary as phrase (phrase.slovak)}
        <li>
          <button
            class={cx(
              "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-surface px-3.5 py-1.5",
              "transition-[background-color,border-color] duration-150 ease-out hover:border-blue-700 hover:bg-blue-50",
            )}
            type="button"
            aria-label="Listen: {phrase.slovak}, {phrase.english}"
            onclick={() => playWord(phrase.slovak)}
          >
            <svg
              class="size-4 shrink-0 fill-none stroke-current text-blue-800"
              viewBox="0 0 24 24"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
              <path d="M15.2 9.2a4.2 4.2 0 0 1 0 5.6M18.2 7a7 7 0 0 1 0 10" />
            </svg>

            <span class="font-serif font-semibold text-slate-900" lang="sk">
              {phrase.slovak}
            </span>

            <span class="text-sm text-slate-500">{phrase.english}</span>
          </button>
        </li>
      {/each}
    </ul>
  </section>

  <section
    bind:this={stageEl}
    class="{panelClass} scroll-mt-24 overflow-hidden"
    aria-labelledby="stage-title"
  >
    <header class="px-4 pt-4 sm:px-5">
      <p class={eyebrowMutedClass}>
        Chapter {active + 1} of {episode.chapters.length}
      </p>

      <h2
        id="stage-title"
        class="m-0 mt-1 font-serif text-xl tracking-tight text-pretty text-slate-900"
      >
        <span lang="sk">{chapter.titleSk}</span>
        <span class="font-normal text-slate-500"> · {chapter.title}</span>
      </h2>
    </header>

    {#key `${chapter.id}-${run}`}
      <ListenStage
        bind:this={stage}
        {chapter}
        audioSrcs={audioSrcs.lines}
        {autoplay}
        done={scores[chapter.id] === undefined ? null : { correct: scores[chapter.id]! }}
        onfinish={finishChapter}
        actions={nextChapter}
        afterResult={episodeDone}
      />
    {/key}
  </section>

  <nav aria-labelledby="chapters-heading">
    <h2 id="chapters-heading" class={eyebrowMutedClass}>Chapters</h2>

    <ol class="{dataPanelClass} m-0 mt-2.5 list-none p-0">
      {#each episode.chapters as entry, index (entry.id)}
        {@const score = scores[entry.id]}
        {@const current = index === active}

        <li class="border-b border-slate-200/70 last:border-b-0">
          <button
            class={cx(
              "flex w-full cursor-pointer items-center gap-3 border-0 px-4 py-3 text-left sm:px-5",
              "transition-colors duration-150 ease-out hover:bg-blue-50/50",
              current ? "bg-blue-50/40" : "bg-transparent",
            )}
            type="button"
            aria-current={current ? "step" : undefined}
            onclick={() => openChapter(index)}
          >
            <span
              class={cx(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                score !== undefined
                  ? "bg-emerald-50 text-emerald-700"
                  : current
                    ? "bg-blue-600 text-paper"
                    : "bg-subtle text-slate-500",
              )}
              aria-hidden="true"
            >
              {#if score !== undefined}
                <svg
                  class="size-3.5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              {:else}
                {index + 1}
              {/if}
            </span>

            <span class="min-w-0 flex-1">
              <span
                class="block font-serif text-base leading-snug {current
                  ? 'font-semibold text-slate-900'
                  : 'text-slate-800'}"
                lang="sk"
              >
                {entry.titleSk}
              </span>

              <span class="block text-sm leading-snug text-slate-500">{entry.title}</span>
            </span>

            {#if score !== undefined && entry.checks.length > 0}
              <span class="shrink-0 text-xs text-slate-500 tabular-nums">
                {score} of {entry.checks.length}
              </span>
            {/if}
          </button>
        </li>
      {/each}
    </ol>
  </nav>
</div>
