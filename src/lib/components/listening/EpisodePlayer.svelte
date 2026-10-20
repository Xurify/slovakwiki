<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";

  import AudioButton from "$lib/audio/AudioButton.svelte";
  import { playFinishSfx, unlockSfx } from "$lib/audio/sfx";
  import type { ListeningEpisode } from "$lib/catalog/listening/types";
  import type { EpisodeAudioSrcs } from "$lib/catalog/listening/audio";
  import { episodeCheckCount, episodeLines } from "$lib/catalog/listening";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import MarkedNote from "$lib/components/lessons/MarkedNote.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { eyebrowMutedClass, panelClass, tagClass } from "$lib/components/ui/system-ui";
  import { hasPendingStoryAudio, primeStoryAudio } from "$lib/lesson-story/story-audio";
  import { getStoryShowEnglish } from "$lib/lesson-story/prefs";
  import { LinePlayer } from "$lib/listening/line-player.svelte";
  import {
    chapterIndexForLine,
    chapterRanges,
    isLastLineOfChapter,
    lineNumberInChapter,
  } from "$lib/listening/playlist";
  import { cx } from "$lib/ui/classes";

  import EpisodeCheck from "./EpisodeCheck.svelte";
  import EpisodeLine from "./EpisodeLine.svelte";
  import EpisodeTransport from "./EpisodeTransport.svelte";

  let {
    audioSrcs,
    episode,
    links,
  }: {
    audioSrcs: EpisodeAudioSrcs;
    episode: ListeningEpisode;
    /** Where to go after the last chapter. */
    links: Array<{ href: string; label: string }>;
  } = $props();

  type ChapterState = "upcoming" | "listening" | "checking" | "done";

  const lines = episodeLines(episode);
  const ranges = chapterRanges(episode);
  const totalChecks = episodeCheckCount(episode);

  let transcriptAlways = $state(false);
  let showEnglish = $state(false);
  /** Highest chapter the learner has opened. */
  let reached = $state(0);
  let listened = $state<ReadonlySet<number>>(new Set());
  let checkIndex = $state<Record<number, number>>({});
  let results = $state<Record<string, boolean>>({});
  let finished = $state(false);
  let root: HTMLDivElement | undefined = $state();

  const player = new LinePlayer(lines, audioSrcs.lines, {
    isLast: (index) => isLastLineOfChapter(ranges, index),
    onRunEnd: (index) => markListened(chapterIndexForLine(ranges, index)),
  });

  const cursor = $derived(player.cursor);
  const playing = $derived(player.playing);
  const currentChapter = $derived(chapterIndexForLine(ranges, cursor));
  const currentLine = $derived(lines[cursor]);
  const started = $derived(playing || cursor > 0 || listened.size > 0);
  const correctCount = $derived(Object.values(results).filter(Boolean).length);

  const chapterLabel = $derived.by(() => {
    const chapter = episode.chapters[currentChapter];
    return chapter ? `${currentChapter + 1} · ${chapter.titleSk}` : episode.titleSk;
  });

  const statusLabel = $derived.by(() => {
    const range = ranges[currentChapter];
    if (!currentLine || !range) return "Ready";
    if (!started) return "Press play to start";
    const position = `${lineNumberInChapter(ranges, cursor)} of ${range.end - range.start}`;
    if (playing) return `${currentLine.speaker} · line ${position}`;
    if (listened.has(currentChapter) && cursor === range.end - 1) return "Chapter played";
    return `Paused · line ${position}`;
  });

  function chapterState(index: number): ChapterState {
    if (index > reached) return "upcoming";
    if (!listened.has(index)) return "listening";
    const chapter = episode.chapters[index];
    if (chapter && (checkIndex[index] ?? 0) < chapter.checks.length) return "checking";
    return "done";
  }

  function stateLabel(state: ChapterState): string {
    if (state === "upcoming") return "Up next";
    if (state === "listening") return "Listen";
    if (state === "checking") return "Questions";
    return "Done";
  }

  function speakersIn(index: number): string[] {
    return [...new Set(episode.chapters[index]?.lines.map((line) => line.speaker))];
  }

  function transcriptVisible(index: number): boolean {
    return transcriptAlways || chapterState(index) === "done";
  }

  function chapterScore(index: number): { correct: number; total: number } {
    const checks = episode.chapters[index]?.checks ?? [];
    return {
      correct: checks.filter((check) => results[check.id]).length,
      total: checks.length,
    };
  }

  function pause(): void {
    player.pause();
  }

  function playFrom(index: number): void {
    const chapter = chapterIndexForLine(ranges, index);
    if (chapter > reached) reached = chapter;
    player.playFrom(index);
  }

  function markListened(index: number): void {
    if (listened.has(index)) return;
    listened = new Set([...listened, index]);

    const chapter = episode.chapters[index];
    if (!chapter?.checks.length) {
      completeChapter(index);
      return;
    }

    void scrollTo(`[data-chapter-checks="${index}"]`);
  }

  function completeChapter(index: number): void {
    if (index + 1 < episode.chapters.length) {
      reached = Math.max(reached, index + 1);
      return;
    }

    finished = true;
    playFinishSfx();
    void scrollTo("[data-episode-done]");
  }

  function resolveCheck(chapter: number, checkId: string, correct: boolean): void {
    results = { ...results, [checkId]: correct };
    const next = (checkIndex[chapter] ?? 0) + 1;
    checkIndex = { ...checkIndex, [chapter]: next };

    if (next >= (episode.chapters[chapter]?.checks.length ?? 0)) {
      completeChapter(chapter);
    }
  }

  function startChapter(index: number): void {
    const range = ranges[index];
    if (!range) return;
    reached = Math.max(reached, index);
    playFrom(range.start);
    void scrollTo(`#${episode.chapters[index]?.id}`);
  }

  function togglePlay(): void {
    if (playing) pause();
    else playFrom(cursor);
  }

  function previousLine(): void {
    const range = ranges[currentChapter];
    if (!range) return;
    playFrom(Math.max(range.start, cursor - 1));
  }

  function nextLine(): void {
    if (isLastLineOfChapter(ranges, cursor)) return;
    playFrom(cursor + 1);
  }

  function restartEpisode(): void {
    pause();
    player.cursor = 0;
    reached = 0;
    listened = new Set();
    checkIndex = {};
    results = {};
    finished = false;
    void scrollTo(`#${episode.chapters[0]?.id}`);
  }

  async function scrollTo(selector: string): Promise<void> {
    await tick();
    const target = root?.querySelector<HTMLElement>(selector);
    target?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  function isNativeTarget(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      target.closest("a, button, input, select, textarea, [contenteditable]") !== null
    );
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return;
    if (isNativeTarget(event.target)) return;

    if (event.key === " ") {
      event.preventDefault();
      togglePlay();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousLine();
    } else if (event.key === "ArrowRight" && !isLastLineOfChapter(ranges, cursor)) {
      event.preventDefault();
      nextLine();
    }
  }

  onMount(() => {
    showEnglish = getStoryShowEnglish() === "on";

    // Same unlock dance as the lesson player: any tap primes the shared element
    // so a later auto-played line is not blocked by the autoplay policy.
    const controls = "a, button, input, label, select, textarea";
    const gestures = ["touchend", "click", "keydown"] as const;

    function onGesture(event: Event): void {
      unlockSfx();
      const onControl = event.target instanceof Element && event.target.closest(controls);
      if (onControl && hasPendingStoryAudio()) return;
      primeStoryAudio();
    }

    for (const type of gestures) {
      window.addEventListener(type, onGesture, { passive: true });
    }

    return () => {
      for (const type of gestures) {
        window.removeEventListener(type, onGesture);
      }
    };
  });

  onDestroy(() => player.destroy());

  const chapterHeadClass =
    "flex items-start justify-between gap-4 border-b border-slate-200/70 px-4 py-4 sm:px-5";
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div bind:this={root} class="grid gap-8">
  <section aria-labelledby="listen-for-heading">
    <h2 id="listen-for-heading" class={eyebrowMutedClass}>Listen for these</h2>

    <ol
      class="m-0 mt-3 grid list-none grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2.5 p-0"
    >
      {#each episode.vocabulary as phrase (phrase.slovak)}
        <li class="{panelClass} flex flex-col gap-1 px-3.5 py-3">
          <div class="flex items-start justify-between gap-2">
            <p
              class="m-0 min-w-0 font-serif text-lg font-semibold leading-snug text-slate-900"
              lang="sk"
            >
              {phrase.slovak}
            </p>

            <AudioButton
              size="sm"
              src={audioSrcs.vocabulary[phrase.slovak]}
              text={phrase.slovak}
              label="Listen: {phrase.slovak}"
              beforePlay={pause}
            />
          </div>

          <p class="m-0 text-sm text-slate-500">{phrase.english}</p>

          {#if phrase.note}
            <p class="m-0 text-xs leading-4 text-slate-500">
              <MarkedNote text={phrase.note} />
            </p>
          {/if}
        </li>
      {/each}
    </ol>
  </section>

  <ol class="m-0 grid list-none gap-5 p-0" aria-label="Chapters">
    {#each episode.chapters as chapter, index (chapter.id)}
      {@const state = chapterState(index)}
      {@const range = ranges[index]}
      {@const active = currentChapter === index}
      {@const score = chapterScore(index)}
      {@const checkAt = checkIndex[index] ?? 0}
      {@const check = chapter.checks[checkAt]}

      <li>
        <article
          id={chapter.id}
          class="{panelClass} scroll-mt-24 overflow-hidden"
          data-chapter-state={state}
          aria-labelledby="{chapter.id}-title"
        >
          <header class={chapterHeadClass}>
            <div class="min-w-0">
              <p class={eyebrowMutedClass}>
                Chapter {index + 1} of {episode.chapters.length}
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                {chapter.lines.length} lines
                {#if chapter.checks.length}
                  <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                  {chapter.checks.length}
                  {chapter.checks.length === 1 ? "question" : "questions"}
                {/if}
              </p>

              <h2
                id="{chapter.id}-title"
                class="m-0 mt-1 font-serif text-xl tracking-tight text-pretty text-slate-900"
              >
                <span lang="sk">{chapter.titleSk}</span>
                <span class="font-normal text-slate-500"> · {chapter.title}</span>
              </h2>
            </div>

            <span
              class={cx(
                tagClass,
                "shrink-0",
                state === "done" && "bg-emerald-50 text-emerald-800",
                state === "checking" && "bg-blue-50 text-blue-800",
              )}
            >
              {stateLabel(state)}
            </span>
          </header>

          {#if state === "upcoming"}
            <div
              class="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
            >
              <p class="m-0 text-sm text-slate-500">Finish the chapter above first.</p>

              <TextLink onclick={() => startChapter(index)}>Start here instead</TextLink>
            </div>
          {:else}
            {#if state === "listening"}
              <div class="px-4 py-5 sm:px-5">
                <ul class="m-0 flex list-none flex-wrap gap-5 p-0" aria-label="Speaking">
                  {#each speakersIn(index) as speaker (speaker)}
                    {@const speaking =
                      playing && active && currentLine?.speaker === speaker}

                    <li class="flex w-16 flex-col items-center gap-1.5">
                      <LessonCharacterAvatar
                        {speaker}
                        size="lg"
                        class={speaking
                          ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-surface"
                          : ""}
                      />

                      <span
                        class="text-xs font-semibold {speaking
                          ? 'text-blue-800'
                          : 'text-slate-500'}"
                      >
                        {speaker}
                      </span>
                    </li>
                  {/each}
                </ul>

                {#if active && started}
                  <p class="m-0 mt-4 text-sm text-slate-600" aria-live="polite">
                    {statusLabel}
                  </p>
                {:else}
                  <p class="m-0 mt-4 text-sm text-slate-600">
                    Listen to the whole chapter once. Then answer a few questions.
                  </p>
                {/if}

                {#if !transcriptAlways}
                  <p class="m-0 mt-1 text-xs text-slate-500">
                    The transcript opens after the questions, or any time with the
                    Transcript toggle.
                  </p>
                {/if}

                {#if !active || !started}
                  <Button
                    class="mt-4"
                    type="button"
                    variant="accent"
                    onclick={() => startChapter(index)}
                  >
                    Play chapter
                  </Button>
                {/if}
              </div>
            {/if}

            {#if transcriptVisible(index) && range}
              <ol
                class="m-0 list-none p-0 {state === 'listening'
                  ? 'border-t border-slate-200/70'
                  : ''}"
                aria-label="Transcript"
              >
                {#each chapter.lines as line, offset (line.id)}
                  {@const flat = range.start + offset}

                  <EpisodeLine
                    {line}
                    number={offset + 1}
                    current={cursor === flat && started}
                    playing={playing && cursor === flat}
                    {showEnglish}
                    onplay={() => playFrom(flat)}
                    onpause={pause}
                  />
                {/each}
              </ol>
            {/if}

            {#if state === "checking" && check}
              <div
                class="scroll-mt-24 border-t border-slate-200/70 px-4 py-5 sm:px-5"
                data-chapter-checks={index}
              >
                {#key check.id}
                  <EpisodeCheck
                    {check}
                    index={checkAt + 1}
                    total={chapter.checks.length}
                    last={checkAt + 1 === chapter.checks.length}
                    replayLine={chapter.lines.find(
                      (line) => line.id === check.replayLineId,
                    )}
                    replaySrc={check.replayLineId
                      ? audioSrcs.lines[check.replayLineId]
                      : undefined}
                    onbeforereplay={pause}
                    onresolve={(correct) => resolveCheck(index, check.id, correct)}
                  />
                {/key}
              </div>
            {/if}

            {#if state === "done"}
              <footer
                class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 bg-subtle/60 px-4 py-3.5 sm:px-5"
              >
                <p class="m-0 text-sm text-slate-600">
                  {#if score.total > 0}
                    {score.correct} of {score.total} correct
                  {:else}
                    Chapter played
                  {/if}
                </p>

                <div class="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    class="min-h-10 px-3.5 text-sm"
                    onclick={() => startChapter(index)}
                  >
                    Listen again
                  </Button>

                  {#if index + 1 < episode.chapters.length}
                    <Button
                      type="button"
                      variant="accent"
                      class="min-h-10 px-3.5 text-sm"
                      onclick={() => startChapter(index + 1)}
                    >
                      Next chapter
                    </Button>
                  {/if}
                </div>
              </footer>
            {/if}
          {/if}
        </article>
      </li>
    {/each}
  </ol>

  {#if finished}
    <section
      class="{panelClass} scroll-mt-24 animate-rise px-5 py-6 sm:px-6"
      data-episode-done
      aria-labelledby="episode-done-heading"
    >
      <p class={eyebrowMutedClass}>Episode complete</p>

      <h2
        id="episode-done-heading"
        class="m-0 mt-1 font-serif text-2xl tracking-tight text-slate-900"
      >
        You heard it all.
      </h2>

      <p class="m-0 mt-2 text-sm text-slate-600">
        {correctCount} of {totalChecks} questions right. Every line above is still there to
        replay.
      </p>

      <ul class="m-0 mt-4 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
        {#each links as link (link.href)}
          <li>
            <TextLink href={link.href}>{link.label}</TextLink>
          </li>
        {/each}
      </ul>

      <Button class="mt-5" type="button" variant="secondary" onclick={restartEpisode}>
        Listen again from the start
      </Button>
    </section>
  {/if}

  <EpisodeTransport
    {chapterLabel}
    {statusLabel}
    {playing}
    slow={player.slow}
    transcript={transcriptAlways}
    english={showEnglish}
    canPrev={lines.length > 0}
    canNext={!isLastLineOfChapter(ranges, cursor)}
    ontoggle={togglePlay}
    onprev={previousLine}
    onnext={nextLine}
    onslow={() => player.toggleSlow()}
    ontranscript={() => (transcriptAlways = !transcriptAlways)}
    onenglish={() => (showEnglish = !showEnglish)}
  />
</div>
