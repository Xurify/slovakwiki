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
  import ToolButton from "$lib/components/ui/ToolButton.svelte";
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
  import { LinePlayer, SLOW_RATE } from "$lib/listening/line-player.svelte";
  import { cardAt, nextOnPath, onPath, prevOnPath } from "$lib/listening/listener-path";
  import type { StagedScene } from "$lib/stick-figure/scene-line";
  import { cx } from "$lib/ui/classes";

  import EpisodeCheck from "./EpisodeCheck.svelte";
  import EpisodeLine from "./EpisodeLine.svelte";
  import ListenerAsk from "./ListenerAsk.svelte";
  import { episodeSpeakerName } from "./episode-speaker";
  import ListenScene from "./ListenScene.svelte";
  import SceneIcon from "$lib/components/stick-figure/SceneIcon.svelte";
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
  // Keyed by its segment (EpisodePlayer): it starts from what the episode knows of it, then keeps its own state.
  let listened = $state(untrack(() => done !== null || heard));
  let checkAt = $state(untrack(() => (done ? chapter.checks.length : 0)));
  let correct = $state(untrack(() => done?.correct ?? 0));
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

  const lines = untrack(() => chapter.lines);
  const speakers = [...new Set(lines.map((line) => line.speaker))];
  // Switching questions on mid-segment changes only what comes at its end.
  const checks = $derived(questions ? chapter.checks : []);

  const asks = lines.some((line) => line.ask);

  const player = new LinePlayer(
    lines,
    untrack(() => audioSrcs),
    {
      stage: () => sceneStage,
      holdsAfter: (index) => playAlong && Boolean(lines[index]?.ask),
      isLast: (index) => nextOnPath(lines, picks, index) === undefined,
      next: (index) => nextOnPath(lines, picks, index),
      prev: (index) => prevOnPath(lines, picks, index),
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
    },
  );

  const askAt = $derived(cardAt(lines, picks, player.cursor, player.held));
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
      return player.playing || player.paused || player.cursor > 0 ? "listening" : "idle";
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

  /** Before the first line, what comes goes in the empty subtitle strip, where the lines will appear. */
  const hintInStrip = $derived(Boolean(scene) && subtitles);

  const note = $derived.by(() => {
    // Paused mid-line the voice is still held, so Paused comes before the speaker's name.
    if (player.paused || (stage === "listening" && !player.playing)) return "Paused";
    if (stage === "idle" && !hintInStrip) return idleCopy;
    return "";
  });

  /** Whose line is on: lit among the faces and named beside them. */
  const voice = $derived(stage === "listening" ? (player.line?.speaker ?? null) : null);
  /** Only just begun, the back button goes to the line before, as a player's previous does. */
  const back = $derived(player.justBegun && player.canGoBack);
  const playLabel = $derived.by(() => {
    if (player.playing) return "Pause";
    if (player.paused) return "Resume";
    if (stage === "idle") return "Listen";
    if (stage === "listening") return "Resume";
    return "Listen again";
  });

  /** Stop the segment: its line and voice, so the next play starts the line again. */
  export function halt(): void {
    player.halt();
  }

  export function playing(): boolean {
    return player.playing;
  }

  function toggleSubtitles(): void {
    subtitles = !subtitles;
    setStorySubtitles(subtitles ? "on" : "off");
  }

  function toggleEnglish(): void {
    english = !english;
    setStoryShowEnglish(english ? "on" : "off");
  }

  // What a listener changes mid-episode (speed, subtitles, English) sits in the
  // bar under the player. The panel keeps what is set once.
  const settings = $derived<SceneSetting[]>([
    {
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
            icon: "wind" as const,
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
      icon: "people",
      label: "Speaker faces",
      on: showVoices,
      ontoggle: () => {
        showVoices = !showVoices;
        setListenShowVoices(showVoices ? "on" : "off");
      },
    },
    ...(asks
      ? [
          {
            description: "Pause when the hosts invite you to guess",
            icon: "ask" as const,
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
            icon: "hold" as const,
            label: "Pause at questions",
            on: questions,
            ontoggle: ontogglequestions,
          },
        ]
      : []),
  ]);

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
      hint={stage === "idle" ? idleCopy : undefined}
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
    <ol class="m-0 -my-2 flex list-none gap-1 p-0" aria-label="Lines">
      {#each path as { index, line }, step (line.id)}
        {@const ahead = index > (shownPath.at(-1)?.index ?? -1)}
        <li class="flex-1">
          <button
            class={cx(
              "block w-full border-0 bg-transparent px-0 py-2",
              ahead ? "cursor-default" : "group cursor-pointer",
            )}
            type="button"
            aria-label="Play line {step + 1} of {path.length}, {episodeSpeakerName(
              line.speaker,
            )}"
            aria-current={index === player.cursor && stage !== "idle"
              ? "true"
              : undefined}
            aria-disabled={ahead ? "true" : undefined}
            onclick={() => {
              // Past the next unanswered question: jumping there would skip it.
              if (!ahead) player.playFrom(index);
            }}
          >
            <span
              class={cx(
                "block h-1 rounded-full transition-colors duration-150 ease-out",
                index < player.cursor || (index === player.cursor && stage !== "idle")
                  ? "bg-blue-600"
                  : "bg-slate-200 group-hover:bg-slate-300",
              )}
            ></span>
          </button>
        </li>
      {/each}
    </ol>

    <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
      <div class="flex items-center gap-1">
        {#if !player.held}
          <Button
            class={cx(
              "min-h-12 max-sm:size-12 max-sm:rounded-full max-sm:p-0",
              "sm:min-w-32 sm:pr-5 sm:pl-4",
            )}
            variant={firstListen ? "accent" : "secondary"}
            onclick={() => player.toggle()}
          >
            <SceneIcon class="size-5" name={player.playing ? "pause" : "play"} />
            <span class="max-sm:sr-only">{playLabel}</span>
          </Button>
        {/if}

        <!-- Held in place when it has nothing to replay, so the play button never moves under the pointer. -->
        <ToolButton
          class={cx(stage !== "listening" && "invisible")}
          disabled={stage !== "listening"}
          icon={back ? "previous" : "replay"}
          label={back ? "Previous line" : "Replay line"}
          onclick={() => player.back()}
        />
      </div>

      {#if !player.held}
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
          {#if showVoices}
            <ul class="m-0 flex shrink-0 list-none p-0" aria-label="Speakers">
              {#each speakers as speaker, index (speaker)}
                {@const lit = speaker === voice}

                <li
                  class={cx(
                    "relative rounded-full bg-surface p-0.5 shadow-[0_0_0_0_transparent] transition-[box-shadow,opacity] duration-150 ease-out",
                    index > 0 && "-ml-3",
                    lit && "z-10 shadow-[0_0_10px_3px] shadow-amber-300/80",
                    voice && !lit && "opacity-55",
                  )}
                  title={episodeSpeakerName(speaker)}
                >
                  <LessonCharacterAvatar {speaker} size="sm" />
                  <span class="sr-only">{episodeSpeakerName(speaker)}</span>
                </li>
              {/each}
            </ul>
          {/if}

          <p
            class="m-0 min-w-40 flex-1 text-sm leading-snug text-slate-600 empty:hidden"
            aria-live="polite"
          >
            {note}
          </p>

          {#if !note && voice}
            <p class="m-0 min-w-0 truncate text-sm font-semibold text-slate-900">
              {episodeSpeakerName(voice)}
            </p>
          {/if}
        </div>
      {/if}

      <div
        class="-mr-2.5 flex items-center max-sm:-ml-2.5 max-sm:w-full max-sm:justify-between sm:ml-auto"
        role="group"
        aria-label="Player options"
      >
        {#if scene}
          <ToolButton
            icon="captions"
            label="Subtitles"
            pressed={subtitles}
            onclick={toggleSubtitles}
          />
        {/if}

        <ToolButton
          icon="translate"
          label="Show English"
          pressed={english}
          tip="English translation"
          onclick={toggleEnglish}
        />

        <ToolButton
          label="Slower"
          pressed={player.slow}
          tip={player.slow ? "Normal speed" : "Slower speed"}
          onclick={() => player.toggleSlow()}
        >
          <span class="text-[0.8125rem] leading-none font-bold tabular-nums">
            {player.slow ? `${SLOW_RATE}×` : "1×"}
          </span>
        </ToolButton>

        <ToolButton
          icon="transcript"
          label="Transcript"
          pressed={textOpen}
          tip={textOpen ? "Hide transcript" : "Show transcript"}
          onclick={() => (textOpen = !textOpen)}
        />

        <SceneSettings label="Listening settings" {settings} side="top" />
      </div>
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
          onbeforereplay={halt}
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
            current={(player.playing || player.paused || stage === "listening") && player.cursor === index}
            playing={player.playing && player.cursor === index}
            showEnglish={english}
            onplay={() => player.playLine(index)}
            onpause={() => player.pause()}
          />
        {/each}
      </ol>
    </div>
  {/if}
</div>
