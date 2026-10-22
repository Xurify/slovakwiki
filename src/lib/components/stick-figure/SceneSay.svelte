<script lang="ts">
  import { onDestroy } from "svelte";

  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import type { TextMark } from "$lib/learning/marked-text";
  import { MicrophoneError, record, type Recording } from "$lib/stick-figure/recorder";
  import type { Take } from "$lib/stick-figure/take";
  import SceneAction from "./SceneAction.svelte";
  import SceneIcon from "./SceneIcon.svelte";

  let {
    english,
    marks,
    onhear,
    ontake,
    showEnglish,
    slovak,
    speaker,
  }: {
    english: string;
    marks?: TextMark[];
    /** Play the line as the cast says it, and stay on this turn. */
    onhear: () => void;
    /** The learner's take goes into the scene in place of the speaker's clip. */
    ontake: (take: Take) => void;
    showEnglish: boolean;
    slovak: string;
    speaker: string;
  } = $props();

  type Mic = "ready" | "starting" | "recording" | "blocked" | "missing";

  /** Quiet this long after speaking ends the take, so nobody has to reach for Stop. */
  const QUIET_MS = 1200;
  const MAX_MS = 10_000;

  let mic = $state<Mic>("ready");
  let take = $state<Take>();
  let meter = $state(0);
  let silent = $state(false);

  let recording: Recording | undefined;
  let frame = 0;
  let used = false;

  onDestroy(() => {
    cancelAnimationFrame(frame);
    recording?.cancel();
    if (take && !used) URL.revokeObjectURL(take.src);
  });

  async function start(): Promise<void> {
    if (take) URL.revokeObjectURL(take.src);
    take = undefined;
    silent = false;
    mic = "starting";

    try {
      recording = await record();
    } catch (error) {
      mic = error instanceof MicrophoneError && error.blocked ? "blocked" : "missing";
      return;
    }

    mic = "recording";
    const startedAt = performance.now();
    let loudest = 0;
    let quietSince = 0;

    const tick = (now: number) => {
      const level = recording?.level() ?? 0;
      meter = level;
      loudest = Math.max(loudest, level);

      const speaking = loudest > 0.08;
      if (speaking && level < loudest * 0.15) quietSince ||= now;
      else quietSince = 0;

      if ((quietSince && now - quietSince > QUIET_MS) || now - startedAt > MAX_MS) {
        void stop();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  async function stop(): Promise<void> {
    cancelAnimationFrame(frame);
    const ending = recording;
    recording = undefined;
    meter = 0;
    if (!ending) return;

    const result = await ending.stop().catch(() => undefined);
    mic = "ready";
    take = result;
    silent = !result;
  }

  function use(): void {
    if (!take) return;
    used = true;
    ontake(take);
  }
</script>

<div class="animate-rise">
  <p class={eyebrowMutedClass}>Say it</p>
  <p
    class="m-0 mt-1 font-serif text-2xl leading-snug text-slate-900 max-[600px]:text-xl"
    lang="sk"
  >
    <MarkedText text={slovak} {marks} />
  </p>
  {#if showEnglish}
    <p class="m-0 mt-1 text-base text-slate-600">{english}</p>
  {/if}

  {#if mic === "recording"}
    <div class="mt-4 flex flex-wrap items-center gap-4">
      <Button variant="secondary" onclick={stop}>
        <SceneIcon name="stop" />
        Stop
      </Button>
      <div class="h-2 w-40 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
        <div class="h-full rounded-full bg-rose-500" style:width="{meter * 100}%"></div>
      </div>
      <span class="text-sm text-slate-600" role="status">Recording</span>
    </div>
  {:else if take}
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <Button class="mr-2" variant="accent" onclick={use}>
        <SceneIcon name="play" />
        Play it in the scene
      </Button>
      <SceneAction icon="mic" onclick={start}>Record again</SceneAction>
      <SceneAction icon="listen" onclick={onhear}>Hear {speaker}</SceneAction>
    </div>
  {:else}
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <Button class="mr-2" variant="accent" disabled={mic === "starting"} onclick={start}>
        <SceneIcon name="mic" />
        Record
      </Button>
      <SceneAction icon="listen" onclick={onhear}>Hear {speaker} first</SceneAction>
    </div>
  {/if}

  {#if mic === "blocked"}
    <p class="m-0 mt-3 text-sm text-rose-800" role="status">
      The microphone is blocked. Allow it for this page to record, or pick another way to
      answer above.
    </p>
  {:else if mic === "missing"}
    <p class="m-0 mt-3 text-sm text-rose-800" role="status">
      No microphone was found. Plug one in, or pick another way to answer above.
    </p>
  {:else if silent}
    <p class="m-0 mt-3 text-sm text-rose-800" role="status">
      Nothing came through. Check the microphone and record again.
    </p>
  {/if}

  <p class="m-0 mt-3 text-xs text-slate-500">Recordings stay on this device.</p>
</div>
