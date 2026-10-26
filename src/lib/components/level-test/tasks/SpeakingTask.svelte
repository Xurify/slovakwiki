<script lang="ts">
  import { onDestroy } from "svelte";

  import Button from "$lib/components/ui/Button.svelte";
  import { PREPARE_SECONDS, TIME_LIMIT_SECONDS } from "$lib/level-test/plan";
  import type { PhotoPrompt, ReadAloudItem, SpeakingPrompt } from "$lib/level-test/types";

  import PhotoFigure from "../PhotoFigure.svelte";
  import TaskFrame from "../TaskFrame.svelte";
  import { startRecording } from "../recorder";
  import type { StepDone } from "../steps";

  type Content =
    | { kind: "readAloud"; item: ReadAloudItem }
    | { kind: "speakPhoto"; photo: PhotoPrompt }
    | { kind: "readThenSpeak"; prompt: SpeakingPrompt }
    | { kind: "speakingSample"; prompt: SpeakingPrompt };

  let {
    content,
    stream,
    timed,
    ondone,
  }: {
    content: Content;
    stream: MediaStream | null;
    timed: boolean;
    ondone: StepDone;
  } = $props();

  const PHOTO_PROMPT: Omit<SpeakingPrompt, "level"> = {
    id: "photo",
    slovak: "Povedzte, čo vidíte na fotke. Opíšte čo najviac detailov.",
    english: "Say what you see in the photo. Describe as much detail as you can.",
  };

  let phase = $state<"prepare" | "record" | "saving">(initialPhase());
  let elapsed = $state(0);
  let started = $state(false);
  let recording: ReturnType<typeof startRecording> | null = null;
  let ticker: ReturnType<typeof setInterval> | undefined;
  let done = false;

  function initialPhase(): "prepare" | "record" {
    return content.kind === "readAloud" ? "record" : "prepare";
  }

  const prompt = $derived(
    content.kind === "speakPhoto"
      ? PHOTO_PROMPT
      : content.kind === "readAloud"
        ? null
        : content.prompt,
  );
  const limit = $derived(TIME_LIMIT_SECONDS[content.kind] ?? 90);
  const recordingNow = $derived(phase === "record" && started);
  const clock = $derived(
    `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`,
  );

  const heading = $derived(
    content.kind === "readAloud"
      ? "Record yourself saying the sentence"
      : content.kind === "speakPhoto"
        ? "Speak about the photo"
        : content.kind === "readThenSpeak"
          ? "Read the question, then speak"
          : "Speak about the topic below",
  );

  function begin(): void {
    if (!stream || started) return;
    started = true;
    phase = "record";
    recording = startRecording(stream);
    const startedAt = performance.now();
    elapsed = 0;
    ticker = setInterval(() => {
      elapsed = Math.floor((performance.now() - startedAt) / 1000);
      if (elapsed >= limit) void stop();
    }, 250);
  }

  async function stop(): Promise<void> {
    if (done) return;
    done = true;
    clearInterval(ticker);
    if (!recording) {
      ondone({ responses: [] });
      return;
    }
    phase = "saving";
    const { audio, seconds } = await recording.stop();

    if (content.kind === "readAloud") {
      ondone({ responses: [], readAloud: { item: content.item, audio } });
      return;
    }

    ondone({
      responses: [],
      production: [
        {
          kind: content.kind,
          skill: "speaking",
          prompt: prompt?.slovak ?? "",
          audio,
          seconds,
          imageUrl: content.kind === "speakPhoto" ? content.photo.src : undefined,
        },
      ],
    });
  }

  function skip(): void {
    if (done) return;
    done = true;
    ondone({ responses: [] });
  }

  onDestroy(() => clearInterval(ticker));
</script>

{#key phase === "prepare"}
  <TaskFrame
    {heading}
    seconds={phase === "prepare" && timed ? (PREPARE_SECONDS[content.kind] ?? 20) : null}
    timerLabel="to prepare"
    onexpire={begin}
    wide={content.kind === "speakPhoto"}
  >
    <div
      class={content.kind === "speakPhoto"
        ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start"
        : "grid gap-6"}
    >
      {#if content.kind === "speakPhoto"}
        <PhotoFigure photo={content.photo} />
      {/if}

      <div class="grid content-start gap-5">
        {#if content.kind === "readAloud"}
          <p
            class="m-0 text-center font-serif text-2xl font-semibold leading-snug text-balance text-slate-900"
            lang="sk"
          >
            „{content.item.text}“
          </p>
        {:else if prompt}
          <div class="grid gap-1">
            <p
              class="m-0 font-serif text-xl font-semibold leading-snug text-slate-900"
              lang="sk"
            >
              {prompt.slovak}
            </p>

            <p class="m-0 text-sm text-slate-500">{prompt.english}</p>
          </div>

          {#if prompt.points?.length}
            <ul class="m-0 grid gap-1.5 pl-5">
              {#each prompt.points as point (point.slovak)}
                <li class="font-serif text-lg text-slate-900" lang="sk">
                  {point.slovak}
                  <span class="font-sans text-sm text-slate-500">— {point.english}</span>
                </li>
              {/each}
            </ul>
          {/if}
        {/if}

        {#if !stream}
          <p
            class="m-0 rounded-(--control-radius) bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            The microphone is not available, so this task is skipped.
          </p>
        {:else if phase === "prepare"}
          <p class="m-0 text-sm text-slate-600">
            Recording starts when the clock runs out, or now if you are ready. You get one
            take.
          </p>
        {:else}
          <div class="flex flex-col items-center gap-3">
            {#if !started}
              <button
                class="inline-grid size-20 cursor-pointer place-items-center rounded-full border-0 bg-blue-600 text-paper transition-colors duration-150 ease-out hover:bg-blue-700"
                type="button"
                aria-label="Start recording"
                onclick={begin}
              >
                <svg class="size-9 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-6a3.5 3.5 0 1 0-7 0v6A3.5 3.5 0 0 0 12 15Zm6-3.5h-1.8a4.2 4.2 0 0 1-8.4 0H6a6 6 0 0 0 5 5.9V20h2v-2.6a6 6 0 0 0 5-5.9Z"
                  />
                </svg>
              </button>

              <p class="m-0 text-xs font-semibold text-blue-800">
                Click to record · one take
              </p>
            {:else}
              <p
                class="m-0 inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
                role="status"
              >
                <span class="size-2.5 rounded-full bg-rose-600" aria-hidden="true"></span>
                {phase === "saving"
                  ? "Saving…"
                  : `Recording · ${clock} of ${Math.floor(limit / 60)}:${String(limit % 60).padStart(2, "0")}`}
              </p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    {#snippet footer()}
      {#if !stream}
        <Button variant="accent" class="min-w-32" onclick={skip}>Continue</Button>
      {:else if phase === "prepare"}
        <Button variant="accent" class="min-w-32" onclick={begin}>Start recording</Button>
      {:else if recordingNow}
        <Button variant="accent" class="min-w-32" onclick={() => void stop()}
          >Stop and continue</Button
        >
      {:else}
        <Button variant="secondary" class="min-w-32" onclick={skip}>Skip</Button>
      {/if}
    {/snippet}
  </TaskFrame>
{/key}
