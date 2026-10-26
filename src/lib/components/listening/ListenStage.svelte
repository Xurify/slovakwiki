<script lang="ts">
  import { onDestroy, onMount, tick, untrack, type Snippet } from "svelte";

  import { unlockSfx } from "$lib/audio/sfx";
  import {
    AUDIO_VOLUME_CHANGE_EVENT,
    getAudioVolume,
    setAudioVolume,
  } from "$lib/audio/volume";
  import type { ListeningChapter } from "$lib/catalog/listening/types";
  import Button from "$lib/components/ui/Button.svelte";
  import {
    getListenPlayAlong,
    getListenShowVoices,
    getStoryPlaceSound,
    getStoryShowEnglish,
    getStorySubtitles,
    setListenPlayAlong,
    setListenShowVoices,
    setStoryPlaceSound,
    setStoryShowEnglish,
    setStorySubtitles,
  } from "$lib/lesson-story/prefs";
  import { hasPendingStoryAudio, primeStoryAudio } from "$lib/lesson-story/story-audio";
  import { focusUnlessTyping } from "$lib/listening/focus";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import { LinePlayer } from "$lib/listening/line-player.svelte";
  import { nextOnPath, onPath } from "$lib/listening/listener-path";
  import type { StagedScene } from "$lib/stick-figure/scene-line";
  import { cx } from "$lib/ui/classes";

  import EpisodeCheck from "./EpisodeCheck.svelte";
  import EpisodeLine from "./EpisodeLine.svelte";
  import ListenerAsk from "./ListenerAsk.svelte";
  import { episodeSpeakerName } from "./episode-speaker";
  import ListenControl from "./ListenControl.svelte";
  import ListenScene from "./ListenScene.svelte";
  import SceneSettings, {
    type SceneSetting,
  } from "$lib/components/stick-figure/SceneSettings.svelte";

  let {
    actions,
    afterResult,
    audioSrcs,
    autoplay = false,
    chapter,
    done = null,
    heard = false,
    onfinish,
    onlistened,
    ontogglequestions,
    questions = true,
    scene,
    thingWords,
  }: {
    actions?: Snippet;
    afterResult?: Snippet;
    audioSrcs: Record<string, string>;
    autoplay?: boolean;
    chapter: ListeningChapter;
    done?: { correct: number } | null;
    /** Played through already, so its questions come straight away. */
    heard?: boolean;
    onfinish?: (correct: number) => void;
    /** The segment has played to its end. */
    onlistened?: () => void;
    ontogglequestions?: () => void;
    /** Stop for the segment's questions once it has played; off, it only plays. */
    questions?: boolean;
    /** The segment acted out on the stick-figure stage as it plays. */
    scene?: StagedScene;
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  type Stage = "idle" | "listening" | "checking" | "done";

  const COUNT_WORDS = ["one", "two", "three", "four", "five"];

  let root: HTMLElement | undefined = $state();
  let listened = $state(done !== null || heard);
  let checkAt = $state(done ? chapter.checks.length : 0);
  let correct = $state(done?.correct ?? 0);
  let textOpen = $state(false);
  let english = $state(false);
  let placeSound = $state(true);
  let subtitles = $state(true);
  let volume = $state(1);
  let sceneStage = $state<ReturnType<typeof ListenScene>>();
  let playAlong = $state(true);
  let showVoices = $state(true);
  /** The listener's answer to each line that asks for one, this time through. */
  let picks = $state<Record<string, string>>({});
  /** The ask whose answer has started to be heard, so the pick can be marked. */
  let revealedFor = $state<string | null>(null);

  const lines = chapter.lines;
  const speakers = [...new Set(lines.map((line) => line.speaker))];
  // Switching questions on mid-segment changes only what comes at its end.
  const checks = $derived(questions ? chapter.checks : []);

  const asks = lines.some((line) => line.ask);

  const player = new LinePlayer(lines, audioSrcs, {
    stage: () => sceneStage,
    holdsAfter: (index) => playAlong && Boolean(lines[index]?.ask),
    isLast: (index) => nextOnPath(lines, picks, index) === undefined,
    next: (index) => nextOnPath(lines, picks, index),
    onRunEnd: () => {
      const first = !listened;
      listened = true;
      // Every play-through goes on to the next segment, not only the first.
      onlistened?.();
      if (!questions || !first) return;
      if (checks.length === 0) {
        onfinish?.(0);
        void reveal("[data-listen-done]", true);
        return;
      }
      void reveal("[data-listen-checks]");
    },
  });

  /** The asking line whose card shows: held for an answer, or answered until the next ask. */
  const askAt = $derived.by(() => {
    if (player.held) return lines[player.cursor]?.ask ? player.cursor : -1;
    for (let index = player.cursor - 1; index >= 0; index -= 1) {
      const line = lines[index]!;
      if (line.ask) return picks[line.id] ? index : -1;
    }
    return -1;
  });
  /** The lines this listener's answers lead through, in order. */
  const path = $derived(
    lines
      .map((line, index) => ({ index, line }))
      .filter(({ line }) => onPath(line, lines, picks)),
  );
  /** The transcript stops at the next question still to come, so it never gives the answer away. */
  const shownPath = $derived.by(() => {
    if (listened) return path;
    const ahead = path.findIndex(
      ({ index, line }) => line.ask && index >= player.cursor && !(line.id in picks),
    );
    return ahead < 0 ? path : path.slice(0, ahead + 1);
  });
  const askLine = $derived(askAt >= 0 ? lines[askAt] : undefined);

  // Held again, as after replaying the question: a fresh go at it.
  $effect(() => {
    if (!player.held) return;
    const id = lines[player.cursor]?.id;
    untrack(() => {
      if (!id || !(id in picks)) return;
      const { [id]: _, ...rest } = picks;
      picks = rest;
      revealedFor = null;
    });
  });

  $effect(() => {
    const judge = askLine?.ask?.judge;
    const speaker = lines[player.cursor]?.speaker;
    if (
      askLine &&
      player.speaking &&
      player.cursor > askAt &&
      (!judge || speaker === judge)
    ) {
      revealedFor = askLine.id;
    }
  });

  function pick(id: string): void {
    if (!askLine) return;
    picks = { ...picks, [askLine.id]: id };
    player.answered();
  }

  const check = $derived(checks[checkAt]);
  const stage = $derived.by((): Stage => {
    if (!listened) {
      return player.playing || player.cursor > 0 ? "listening" : "idle";
    }
    return check ? "checking" : "done";
  });
  const firstListen = $derived(stage === "idle" || stage === "listening");

  const idleCopy = $derived(
    !questions
      ? "Listen straight through, or read along."
      : checks.length === 0
        ? "Listen, then read along."
        : checks.length === 1
          ? "Listen first, then answer one short question."
          : `Listen first, then answer ${COUNT_WORDS[checks.length - 1] ?? checks.length} short questions.`,
  );

  /** How far through this listener's path the segment is, in percent. */
  const progress = $derived.by(() => {
    if (stage === "idle") return 0;
    if (listened && !player.playing && !player.held) return 100;
    const step = path.findIndex(({ index }) => index === player.cursor);
    return Math.round(((step + 1) / Math.max(path.length, 1)) * 100);
  });

  const status = $derived.by(() => {
    const line = player.line;
    if (player.speaking && line)
      return showVoices ? "" : episodeSpeakerName(line.speaker);
    if (stage === "idle") return idleCopy;
    if (stage === "listening" && !player.playing) return "Paused";
    return "";
  });

  const playLabel = $derived.by(() => {
    if (player.playing) return "Pause";
    if (stage === "idle") return "Listen";
    if (stage === "listening") return "Resume";
    return "Listen again";
  });

  export function pause(): void {
    player.pause();
  }

  export function playing(): boolean {
    return player.playing;
  }

  const settings = $derived<SceneSetting[]>([
    {
      description: "How loud the episode and the place under it play",
      kind: "volume",
      label: "Volume",
      oninput: (value) => {
        volume = setAudioVolume(value);
      },
      value: volume,
    },
    ...(scene
      ? [
          {
            description: "The line being said, under the stage",
            label: "Subtitles",
            on: subtitles,
            ontoggle: () => {
              subtitles = !subtitles;
              setStorySubtitles(subtitles ? "on" : "off");
            },
          },
        ]
      : []),
    {
      description: "Translations under the Slovak lines and the subtitles",
      label: "Show English",
      on: english,
      ontoggle: () => {
        english = !english;
        setStoryShowEnglish(english ? "on" : "off");
      },
    },
    {
      description: "Lines play at four-fifths speed",
      label: "Slower",
      on: player.slow,
      ontoggle: () => player.toggleSlow(),
    },
    ...(scene
      ? [
          {
            description: "The sound of the place, quieter under the voices",
            label: "Background sound",
            on: placeSound,
            ontoggle: () => {
              placeSound = !placeSound;
              setStoryPlaceSound(placeSound ? "on" : "off");
            },
          },
        ]
      : []),
    {
      description: "The hosts' faces beside the play button",
      label: "Voices",
      on: showVoices,
      ontoggle: () => {
        showVoices = !showVoices;
        setListenShowVoices(showVoices ? "on" : "off");
      },
    },
    ...(asks
      ? [
          {
            description: "Stop when the hosts ask you to guess along",
            label: "Play along",
            on: playAlong,
            ontoggle: () => {
              playAlong = !playAlong;
              setListenPlayAlong(playAlong ? "on" : "off");
            },
          },
        ]
      : []),
    ...(ontogglequestions
      ? [
          {
            description: "Pause at the end of each segment for its questions",
            label: "Pause at questions",
            on: questions,
            ontoggle: ontogglequestions,
          },
        ]
      : []),
  ]);

  function togglePlay(): void {
    const atEnd =
      listened &&
      !player.playing &&
      nextOnPath(lines, picks, player.cursor) === undefined;
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
    if (focus) focusUnlessTyping(target);
    target?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  onMount(() => {
    english = getStoryShowEnglish() === "on";
    placeSound = getStoryPlaceSound() === "on";
    subtitles = getStorySubtitles() === "on";
    playAlong = getListenPlayAlong() === "on";
    showVoices = getListenShowVoices() === "on";
    volume = getAudioVolume();

    function onVolumeChange(): void {
      volume = getAudioVolume();
    }

    const controls = "a, button, input, label, select, textarea";
    const gestures = ["touchend", "click", "keydown"] as const;

    function primePlaybackOnGesture(event: Event): void {
      unlockSfx();
      const onControl = event.target instanceof Element && event.target.closest(controls);
      if (onControl && hasPendingStoryAudio()) return;
      primeStoryAudio();
    }

    for (const type of gestures) {
      window.addEventListener(type, primePlaybackOnGesture, { passive: true });
    }

    if (autoplay && !done) player.playFrom(0);

    window.addEventListener(AUDIO_VOLUME_CHANGE_EVENT, onVolumeChange);

    return () => {
      window.removeEventListener(AUDIO_VOLUME_CHANGE_EVENT, onVolumeChange);

      for (const type of gestures) {
        window.removeEventListener(type, primePlaybackOnGesture);
      }
    };
  });

  // Played through, the text opens to read along; it closes like any other time.
  $effect(() => {
    if (stage === "done") untrack(() => (textOpen = true));
  });

  onDestroy(() => player.destroy());
</script>

<div bind:this={root} data-listen-stage>
  {#if scene}
    <ListenScene
      bind:this={sceneStage}
      class="mt-3 border-y border-slate-200/70"
      follows={autoplay}
      {scene}
      showEnglish={english}
      sound={placeSound}
      {subtitles}
      {thingWords}
      turns={lines}
    />
  {/if}

  {#if askLine?.ask}
    {@const answerer = lines[nextOnPath(lines, picks, askAt) ?? -1]?.speaker}

    {#key askLine.id}
      <ListenerAsk
        answerer={answerer ? episodeSpeakerName(answerer) : "the host"}
        ask={askLine.ask}
        onpick={pick}
        onskip={() => player.answered()}
        picked={picks[askLine.id] ?? null}
        revealed={revealedFor === askLine.id}
      />
    {/key}
  {/if}

  <div class="px-4 pt-3 pb-4 sm:px-5">
    <div
      class="h-1 overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      aria-label="Segment progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        class="h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
        style:width="{progress}%"
      ></div>
    </div>

    {#if !player.held}
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          class="min-h-12 pr-5 pl-4"
          variant={firstListen ? "accent" : "secondary"}
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
        </Button>

        <p class="m-0 text-sm text-slate-700 empty:hidden" aria-live="polite">{status}</p>

        {#if showVoices}
          <ul class="m-0 ml-auto flex list-none gap-3 p-0" aria-label="Voices">
            {#each speakers as speaker (speaker)}
              {@const speaking = player.speaking && player.line?.speaker === speaker}

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
                  {episodeSpeakerName(speaker)}
                </span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <div class="mt-2 -ml-2.5 flex flex-wrap items-center gap-1">
      {#if stage === "listening"}
        <ListenControl onclick={() => player.back()}>
          {player.justBegun && player.cursor > 0 ? "Previous line" : "Replay line"}
        </ListenControl>
      {/if}

      <ListenControl onclick={() => (textOpen = !textOpen)}>
        {textOpen ? "Hide transcript" : "Show transcript"}
      </ListenControl>

      <SceneSettings
        class="ml-auto -mr-1.5"
        label="Listening settings"
        {settings}
        side="top"
      />
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
          questionNumber={checkAt + 1}
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

  {#if textOpen}
    <div class="border-t border-slate-200/70">
      <ol class="m-0 list-none p-0" aria-label="Transcript">
        {#each shownPath as { index, line }, step (line.id)}
          <EpisodeLine
            {line}
            number={step + 1}
            current={(player.playing || stage === "listening") && player.cursor === index}
            playing={player.playing && player.cursor === index}
            showEnglish={english}
            onplay={() => player.playFrom(index)}
            onpause={pause}
          />
        {/each}
      </ol>
    </div>
  {/if}
</div>
