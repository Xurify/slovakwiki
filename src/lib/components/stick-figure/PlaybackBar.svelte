<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import type { ScenePlayback } from "$lib/stick-figure/scene-playback.svelte";
  import SceneAction from "./SceneAction.svelte";
  import SceneIcon from "./SceneIcon.svelte";

  /** Under the dialogue box while a scene plays: Play or Pause, Again, and where it is. */
  let {
    count,
    learnerName,
    listenFirst,
    onplay,
    ontogglevoice,
    ownVoice,
    playback,
    voiced,
  }: {
    /** Lines in the scene. */
    count: number;
    learnerName: string;
    listenFirst: boolean;
    onplay: () => void;
    ontogglevoice: () => void;
    /** The learner's recordings in place of the cast's clips. */
    ownVoice: boolean;
    playback: ScenePlayback;
    /** The learner has recorded lines to hear in the scene. */
    voiced: boolean;
  } = $props();
</script>

<div
  class="flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-slate-200 px-5 py-3 sm:px-6"
>
  {#if playback.phase === "playing"}
    <Button class="mr-2" variant="secondary" onclick={() => playback.pause()}>
      <SceneIcon name="pause" />
      Pause
    </Button>
  {:else}
    <Button class="mr-2" variant="accent" onclick={onplay}>
      <SceneIcon name="play" />
      {#if playback.phase === "paused"}
        {listenFirst ? "Next line" : "Resume"}
      {:else}
        Play scene
      {/if}
    </Button>
  {/if}

  {#if playback.shown >= 0}
    <SceneAction onclick={() => playback.again()}>Again</SceneAction>
  {/if}

  {#if voiced}
    <SceneAction aria-pressed={ownVoice} icon="mic" onclick={ontogglevoice}>
      {ownVoice ? `Use ${learnerName}'s voice` : "Use your voice"}
    </SceneAction>
  {/if}

  <span class="ml-auto text-sm text-slate-500">
    {#if playback.shown < 0 && playback.phase === "ready"}
      {count} {count === 1 ? "line" : "lines"}
    {:else}
      Line {Math.min(playback.at + 1, count)} of {count}
    {/if}
  </span>
</div>
