<script lang="ts">
  import { onDestroy, onMount, tick, type Snippet } from "svelte";

  import { unlockSfx } from "$lib/audio/sfx";
  import type { ListeningChapter } from "$lib/catalog/listening/types";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { getStoryShowEnglish } from "$lib/lesson-story/prefs";
  import { hasPendingStoryAudio, primeStoryAudio } from "$lib/lesson-story/story-audio";
  import { followFocus } from "$lib/listening/focus";
  import { LinePlayer } from "$lib/listening/line-player.svelte";
  import { cx } from "$lib/ui/classes";

  import EpisodeCheck from "./EpisodeCheck.svelte";
  import EpisodeLine from "./EpisodeLine.svelte";
  import ListenControl from "./ListenControl.svelte";

  /**
   * One dialogue, one action at a time: listen with the text hidden, answer the
   * questions, then read along. Used by the grammar page block and each episode
   * chapter; the parent supplies the frame and the title.
   */
  let {
    actions,
    afterResult,
    audioSrcs,
    autoplay = false,
    chapter,
    done = null,
    onfinish,
  }: {
    /** Rendered in the result row once the questions are answered. */
    actions?: Snippet;
    /** Rendered right under the result row, above the text. */
    afterResult?: Snippet;
    audioSrcs: Record<string, string>;
    /** Start playing on mount; only from a click, so autoplay is allowed. */
    autoplay?: boolean;
    chapter: ListeningChapter;
    /** Already answered: open on the result and the text. */
    done?: { correct: number } | null;
    onfinish?: (correct: number) => void;
  } = $props();

  type Stage = "idle" | "listening" | "checking" | "done";

  const COUNT_WORDS = ["one", "two", "three", "four", "five"];

  let root: HTMLElement | undefined = $state();
  let listened = $state(done !== null);
  let checkAt = $state(done ? chapter.checks.length : 0);
  let correct = $state(done?.correct ?? 0);
  let textOpen = $state(false);
  let english = $state(false);

  const lines = chapter.lines;
  const checks = chapter.checks;
  const speakers = [...new Set(lines.map((line) => line.speaker))];

  const player = new LinePlayer(lines, audioSrcs, {
    isLast: (index) => index === lines.length - 1,
    onRunEnd: () => {
      if (listened) return;
      listened = true;
      if (checks.length === 0) {
        onfinish?.(0);
        void reveal("[data-listen-done]", true);
        return;
      }
      void reveal("[data-listen-checks]");
    },
  });

  const check = $derived(checks[checkAt]);
  const stage = $derived.by((): Stage => {
    if (!listened) {
      return player.playing || player.cursor > 0 ? "listening" : "idle";
    }
    return check ? "checking" : "done";
  });
  const textVisible = $derived(textOpen || stage === "done");
  /** Once heard, Listen again steps back so the question or Next chapter leads. */
  const firstListen = $derived(stage === "idle" || stage === "listening");

  const idleCopy =
    checks.length === 0
      ? "Listen, then read along."
      : checks.length === 1
        ? "Listen first. The text opens after one short question."
        : `Listen first. The text opens after ${COUNT_WORDS[checks.length - 1] ?? checks.length} short questions.`;

  const status = $derived.by(() => {
    const line = player.line;
    const position = `line ${player.cursor + 1} of ${lines.length}`;
    if (player.playing && line) return `${line.speaker} · ${position}`;
    if (stage === "idle") return idleCopy;
    if (stage === "listening") return `Paused · ${position}`;
    if (stage === "checking") return "";
    return "Play it again and read along.";
  });

  const playLabel = $derived.by(() => {
    if (player.playing) return "Pause";
    if (stage === "idle") return "Listen";
    if (stage === "listening") return "Resume";
    return "Listen again";
  });

  /** Lets the parent stop the dialogue before it plays something else. */
  export function pause(): void {
    player.pause();
  }

  function togglePlay(): void {
    const atEnd = listened && !player.playing && player.cursor === lines.length - 1;
    if (atEnd) player.playFrom(0);
    else player.toggle();
  }

  function resolveCheck(isCorrect: boolean): void {
    if (isCorrect) correct += 1;
    checkAt += 1;
    if (checkAt < checks.length) return;
    onfinish?.(correct);
    void reveal("[data-listen-done]", true);
  }

  async function reveal(selector: string, focus = false): Promise<void> {
    await tick();
    const target = root?.querySelector<HTMLElement>(selector);
    if (focus) followFocus(target);
    target?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  onMount(() => {
    english = getStoryShowEnglish() === "on";

    // Any tap primes the shared story element, so a line played later from a
    // timer is not blocked by the autoplay policy (iOS Safari).
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

    if (autoplay && !done) player.playFrom(0);

    return () => {
      for (const type of gestures) {
        window.removeEventListener(type, onGesture);
      }
    };
  });

  // Keep the line being read on screen while the text is open; only during
  // playback, so reading back through the text never jumps.
  $effect(() => {
    if (!player.playing || !textVisible) return;
    void player.cursor;
    void tick().then(() => {
      root?.querySelector<HTMLElement>("[data-line-current]")?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  });

  onDestroy(() => player.destroy());
</script>

<div bind:this={root} data-listen-stage>
  <div class="px-4 pt-3 pb-4 sm:px-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <button
        class={cx(
          "inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-0 pr-5 pl-4 font-bold",
          "transition-[background-color,box-shadow,color] duration-150 ease-out",
          firstListen
            ? "bg-cta text-cta-ink hover:bg-cta-strong"
            : "bg-control text-blue-800 shadow-(--shadow-border) hover:bg-control-hover hover:shadow-(--shadow-border-hover)",
        )}
        type="button"
        onclick={togglePlay}
      >
        <svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          {#if player.playing}
            <rect x="6.5" y="5" width="4" height="14" rx="1" />
            <rect x="13.5" y="5" width="4" height="14" rx="1" />
          {:else}
            <path d="M8 5v14l11-7Z" />
          {/if}
        </svg>

        {playLabel}
      </button>

      <ul class="m-0 flex list-none gap-3 p-0" aria-label="Voices">
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
              class="text-xs font-semibold {speaking
                ? 'text-blue-800'
                : 'text-slate-500'}"
            >
              {speaker}
            </span>
          </li>
        {/each}
      </ul>
    </div>

    <div class="mt-4 flex gap-1" aria-hidden="true">
      {#each lines as line, index (line.id)}
        <span
          class={cx(
            "h-1 flex-1 rounded-full transition-colors duration-150 ease-out",
            index < player.cursor || (index === player.cursor && stage !== "idle")
              ? "bg-blue-600"
              : "bg-slate-200",
          )}
        ></span>
      {/each}
    </div>

    <p class="m-0 mt-2.5 text-sm text-slate-700 empty:hidden">{status}</p>

    <div class="mt-2 -ml-2.5 flex flex-wrap gap-1">
      {#if stage === "listening"}
        <ListenControl onclick={() => player.playFrom(player.cursor)}>
          Replay line
        </ListenControl>
      {/if}

      <ListenControl pressed={player.slow} onclick={() => player.toggleSlow()}>
        Slower
      </ListenControl>

      {#if stage !== "done"}
        <ListenControl onclick={() => (textOpen = !textOpen)}>
          {textOpen ? "Hide text" : "Show text"}
        </ListenControl>
      {/if}
    </div>
  </div>

  {#if stage === "checking" && check}
    <div
      class="scroll-mt-24 border-t border-slate-200/70 px-4 py-5 max-[800px]:scroll-mt-[136px] sm:px-5"
      data-listen-checks
    >
      {#key check.id}
        <EpisodeCheck
          {check}
          index={checkAt + 1}
          total={checks.length}
          replayLine={lines.find((line) => line.id === check.replayLineId)}
          replaySrc={check.replayLineId ? audioSrcs[check.replayLineId] : undefined}
          onbeforereplay={pause}
          onresolve={resolveCheck}
        />
      {/key}
    </div>
  {/if}

  {#if stage === "done"}
    <div
      class={cx(
        "flex scroll-mt-24 flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 bg-subtle/60 px-4 py-3 sm:px-5",
        "focus-visible:outline-none max-[800px]:scroll-mt-[136px]",
      )}
      tabindex="-1"
      data-listen-done
    >
      <p class="m-0 flex items-center gap-2 text-sm font-semibold text-slate-800">
        {#if checks.length > 0 && correct === checks.length}
          <svg
            class="size-4 fill-none stroke-current text-emerald-700"
            viewBox="0 0 24 24"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        {/if}

        {#if checks.length > 0}
          {correct} of {checks.length} right
        {:else}
          Played
        {/if}
      </p>

      {#if actions}
        <div class="flex flex-wrap items-center gap-3">
          {@render actions()}
        </div>
      {/if}
    </div>

    {#if afterResult}
      {@render afterResult()}
    {/if}
  {/if}

  {#if textVisible}
    <div class="border-t border-slate-200/70">
      <div class="flex items-center justify-between gap-3 px-4 pt-2.5 sm:px-5">
        <p class={eyebrowMutedClass}>Text</p>

        <ListenControl pressed={english} onclick={() => (english = !english)}>
          English
        </ListenControl>
      </div>

      <ol class="m-0 list-none p-0" aria-label="Transcript">
        {#each lines as line, index (line.id)}
          <EpisodeLine
            {line}
            number={index + 1}
            current={(player.playing || stage === "listening") && player.cursor === index}
            playing={player.playing && player.cursor === index}
            dimmed={player.playing && player.cursor !== index}
            showEnglish={english}
            onplay={() => player.playFrom(index)}
            onpause={pause}
          />
        {/each}
      </ol>
    </div>
  {/if}
</div>
