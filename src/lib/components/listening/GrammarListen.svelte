<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";

  import { playFinishSfx, unlockSfx } from "$lib/audio/sfx";
  import type { GrammarListen } from "$lib/catalog/listening/types";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import {
    chipClass,
    eyebrowMutedClass,
    panelClass,
    tagClass,
  } from "$lib/components/ui/system-ui";
  import { getStoryShowEnglish } from "$lib/lesson-story/prefs";
  import { hasPendingStoryAudio, primeStoryAudio } from "$lib/lesson-story/story-audio";
  import { LinePlayer } from "$lib/listening/line-player.svelte";
  import { cx } from "$lib/ui/classes";

  import EpisodeCheck from "./EpisodeCheck.svelte";
  import EpisodeLine from "./EpisodeLine.svelte";

  /**
   * The one-minute listen on a grammar page: play the dialogue once with the
   * text hidden, answer the questions, then read it with every line replayable.
   */
  let {
    audioSrcs,
    episodeHref,
    listen,
  }: {
    audioSrcs: Record<string, string>;
    /** The longer podcast episode on the same topic, when there is one. */
    episodeHref?: string;
    listen: GrammarListen;
  } = $props();

  type Stage = "idle" | "listening" | "checking" | "done";

  let root: HTMLElement | undefined = $state();
  let listened = $state(false);
  let checkAt = $state(0);
  let correctCount = $state(0);
  let transcriptAlways = $state(false);
  let showEnglish = $state(false);

  const player = new LinePlayer(listen.lines, audioSrcs, {
    isLast: (index) => index === listen.lines.length - 1,
    onRunEnd: () => {
      listened = true;
      void scrollTo("[data-listen-checks]");
    },
  });

  const speakers = [...new Set(listen.lines.map((line) => line.speaker))];
  const started = $derived(player.playing || player.cursor > 0 || listened);
  const check = $derived(listen.checks[checkAt]);
  const stage = $derived.by((): Stage => {
    if (!listened) return started ? "listening" : "idle";
    return check ? "checking" : "done";
  });
  const transcriptVisible = $derived(transcriptAlways || stage === "done");

  const statusLabel = $derived.by(() => {
    const line = player.line;
    if (!line || !started) return "";
    const position = `line ${player.cursor + 1} of ${listen.lines.length}`;
    if (player.playing) return `${line.speaker} · ${position}`;
    return listened ? "Played" : `Paused · ${position}`;
  });

  function resolveCheck(correct: boolean): void {
    if (correct) correctCount += 1;
    checkAt += 1;
    if (checkAt >= listen.checks.length) playFinishSfx();
  }

  function listenAgain(): void {
    player.playFrom(0);
  }

  function restart(): void {
    player.pause();
    listened = false;
    checkAt = 0;
    correctCount = 0;
    player.playFrom(0);
  }

  async function scrollTo(selector: string): Promise<void> {
    await tick();
    root?.querySelector<HTMLElement>(selector)?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  onMount(() => {
    showEnglish = getStoryShowEnglish() === "on";

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
</script>

<article
  bind:this={root}
  class="{panelClass} overflow-hidden"
  aria-labelledby="{listen.id}-title"
>
  <header
    class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-slate-200/70 px-4 py-4 sm:px-5"
  >
    <div class="min-w-0">
      <p class={eyebrowMutedClass}>
        {listen.lines.length} lines
        <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
        about a minute
        <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
        {listen.checks.length} questions
      </p>

      <h3
        id="{listen.id}-title"
        class="m-0 mt-1 font-serif text-xl tracking-tight text-pretty text-slate-900"
      >
        <span lang="sk">{listen.titleSk}</span>
        <span class="font-normal text-slate-500"> · {listen.title}</span>
      </h3>
    </div>

    <span
      class={cx(
        tagClass,
        "shrink-0",
        stage === "done" && "bg-emerald-50 text-emerald-800",
        stage === "checking" && "bg-blue-50 text-blue-800",
      )}
    >
      {stage === "idle"
        ? "Listen"
        : stage === "listening"
          ? "Playing"
          : stage === "checking"
            ? "Questions"
            : "Done"}
    </span>
  </header>

  <div class="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">
    <button
      class="inline-grid size-14 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-cta text-cta-ink transition-[background-color] duration-150 ease-out hover:bg-cta-strong"
      type="button"
      aria-label={player.playing ? "Pause" : "Play"}
      aria-pressed={player.playing}
      onclick={() => player.toggle()}
    >
      <svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {#if player.playing}
          <rect x="6.5" y="5" width="4" height="14" rx="1" />
          <rect x="13.5" y="5" width="4" height="14" rx="1" />
        {:else}
          <path d="M8 5v14l11-7Z" />
        {/if}
      </svg>
    </button>

    <ul class="m-0 flex list-none gap-3 p-0" aria-label="Speaking">
      {#each speakers as speaker (speaker)}
        {@const speaking = player.playing && player.line?.speaker === speaker}

        <li class="flex flex-col items-center gap-1">
          <LessonCharacterAvatar
            {speaker}
            size="md"
            class={speaking
              ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-surface"
              : ""}
          />

          <span
            class="text-xs font-semibold {speaking ? 'text-blue-800' : 'text-slate-500'}"
          >
            {speaker}
          </span>
        </li>
      {/each}
    </ul>

    <div class="min-w-0 flex-1 basis-48">
      <p class="m-0 text-sm text-slate-700" aria-live="polite">
        {#if statusLabel}
          {statusLabel}
        {:else}
          Listen once with the text hidden. Then answer {listen.checks.length} short questions.
        {/if}
      </p>

      <div class="mt-2 flex flex-wrap gap-1.5">
        <button
          class={chipClass(player.slow)}
          type="button"
          aria-pressed={player.slow}
          title="Play every line a little slower"
          onclick={() => player.toggleSlow()}
        >
          Slow
        </button>

        <button
          class={chipClass(transcriptAlways)}
          type="button"
          aria-pressed={transcriptAlways}
          title="Show the transcript while listening"
          onclick={() => (transcriptAlways = !transcriptAlways)}
        >
          Transcript
        </button>

        <button
          class={chipClass(showEnglish)}
          type="button"
          aria-pressed={showEnglish}
          title="Show English under every line"
          onclick={() => (showEnglish = !showEnglish)}
        >
          English
        </button>
      </div>
    </div>
  </div>

  {#if stage === "checking" && check}
    <div class="border-t border-slate-200/70 px-4 py-5 sm:px-5" data-listen-checks>
      {#key check.id}
        <EpisodeCheck
          {check}
          index={checkAt + 1}
          total={listen.checks.length}
          last={checkAt + 1 === listen.checks.length}
          replayLine={listen.lines.find((line) => line.id === check.replayLineId)}
          replaySrc={check.replayLineId ? audioSrcs[check.replayLineId] : undefined}
          onbeforereplay={() => player.pause()}
          onresolve={resolveCheck}
        />
      {/key}
    </div>
  {/if}

  {#if transcriptVisible}
    <ol class="m-0 list-none border-t border-slate-200/70 p-0" aria-label="Transcript">
      {#each listen.lines as line, index (line.id)}
        <EpisodeLine
          {line}
          number={index + 1}
          current={player.cursor === index && started}
          playing={player.playing && player.cursor === index}
          {showEnglish}
          onplay={() => player.playFrom(index)}
          onpause={() => player.pause()}
        />
      {/each}
    </ol>
  {/if}

  {#if stage === "done"}
    <footer
      class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 bg-subtle/60 px-4 py-3.5 sm:px-5"
    >
      <p class="m-0 text-sm text-slate-600">
        {correctCount} of {listen.checks.length} correct
        {#if episodeHref}
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          <TextLink href={episodeHref}>Hear the full episode</TextLink>
        {/if}
      </p>

      <div class="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          class="min-h-10 px-3.5 text-sm"
          onclick={listenAgain}
        >
          Listen again
        </Button>

        <Button
          type="button"
          variant="secondary"
          class="min-h-10 px-3.5 text-sm"
          onclick={restart}
        >
          Redo the questions
        </Button>
      </div>
    </footer>
  {/if}
</article>
