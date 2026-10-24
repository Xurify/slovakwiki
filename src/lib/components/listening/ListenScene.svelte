<script lang="ts">
  import StickStage from "$lib/components/stick-figure/StickStage.svelte";
  import { directScene } from "$lib/stick-figure/scene-direction";
  import type { StagedScene } from "$lib/stick-figure/scene-line";
  import { sceneMood } from "$lib/stick-figure/scene-mood";

  /**
   * A podcast segment acted out on the stick-figure stage: the segment's
   * line player hands each line to `play`, and the cast says it and acts it
   * out. Jumping to a line puts everyone where the segment finds them.
   */
  let {
    class: className = "",
    scene,
    thingWords = {},
  }: {
    class?: string;
    scene: StagedScene;
    /** Dictionary link and clip for each thing's word, for the card a tap opens. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  let stage = $state<ReturnType<typeof StickStage>>();
  /** The line on stage: the one playing, or the last one played. */
  let at = $state(-1);
  let waiting = 0;

  const direction = $derived(directScene(scene.lines, scene.setting, scene.order));
  const mood = $derived(
    sceneMood(
      scene.lines.map((line) => line.slovak),
      Math.max(at, 0),
    ),
  );

  export function play(index: number, onEnded: () => void, rate: number): void {
    window.clearTimeout(waiting);
    if (index !== at + 1) stage?.place(index);
    at = index;
    // Someone still walking over gets there before they speak.
    const walk = stage?.walking(scene.lines[index]?.characterId ?? null) ?? 0;
    waiting = window.setTimeout(() => stage?.play(index, onEnded, rate), walk);
  }

  export function stop(): void {
    window.clearTimeout(waiting);
    stage?.stop();
  }
</script>

<StickStage
  bind:this={stage}
  class={className}
  {direction}
  lines={scene.lines}
  {mood}
  setting={scene.setting}
  {thingWords}
/>
