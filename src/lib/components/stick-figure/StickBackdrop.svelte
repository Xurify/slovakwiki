<script lang="ts">
  import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
  import { SCENE_THINGS, backdropAlign } from "$lib/stick-figure/scene-things";
  import { cx } from "$lib/ui/classes";
  import Cafe from "./backdrops/Cafe.svelte";
  import Classroom from "./backdrops/Classroom.svelte";
  import Home from "./backdrops/Home.svelte";
  import Market from "./backdrops/Market.svelte";
  import Park from "./backdrops/Park.svelte";
  import Plaza from "./backdrops/Plaza.svelte";
  import Registration from "./backdrops/Registration.svelte";
  import StageLight from "./backdrops/StageLight.svelte";

  let {
    board,
    class: className = "",
    lit = [],
    onpick,
    picked,
    setting,
  }: {
    /** A line to chalk on the classroom board. */
    board?: string;
    class?: string;
    /** Things to light up: named in the line playing. */
    lit?: readonly string[];
    /** Makes each thing a button that reports its id. */
    onpick?: (id: string) => void;
    picked?: string;
    setting: LessonSceneArtId;
  } = $props();

  let focused = $state<string>();

  const align = $derived(backdropAlign(setting));
  const things = $derived(SCENE_THINGS[setting] ?? []);
  // The smallest on top, so the clock on the tower gets its own tap.
  const hitOrder = $derived(
    [...things].sort((a, b) => b.box.width * b.box.height - a.box.width * a.box.height),
  );
</script>

<!--
  960×300 with the floor line at y 226. Slice keeps the floor on the bottom
  edge and trims the sides on a narrow stage, so what names the place sits
  near the middle (or the end the setting keeps) or above head height
  (y < 70). Shapes are flat, without outlines, so the ink-outlined cast
  stands in front of them.
-->
<svg
  class="block {className}"
  aria-hidden={onpick ? undefined : "true"}
  viewBox="0 0 960 300"
  preserveAspectRatio="{align === 0 ? 'xMin' : align === 1 ? 'xMax' : 'xMid'}YMax slice"
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  {#if setting === "cafe"}
    <Cafe />
  {:else if setting === "classroom"}
    <Classroom {board} />
  {:else if setting === "home"}
    <Home />
  {:else if setting === "market"}
    <Market />
  {:else if setting === "plaza"}
    <Plaza />
  {:else if setting === "registration" || setting === "counter"}
    <Registration />
  {:else}
    <Park />
  {/if}

  <StageLight />

  {#each things as thing (thing.id)}
    <rect
      x={thing.box.x - 5}
      y={thing.box.y - 5}
      width={thing.box.width + 10}
      height={thing.box.height + 10}
      rx="8"
      class={cx(
        "fill-white/20 stroke-blue-500 transition-opacity duration-150 ease-out",
        lit.includes(thing.id) || picked === thing.id || focused === thing.id
          ? "opacity-100"
          : "opacity-0",
      )}
      stroke-width="2.5"
    />
  {/each}

  {#if onpick}
    {#each hitOrder as thing (thing.id)}
      <rect
        x={thing.box.x - 5}
        y={thing.box.y - 5}
        width={thing.box.width + 10}
        height={thing.box.height + 10}
        rx="8"
        fill="transparent"
        class="cursor-pointer outline-none"
        role="button"
        tabindex="0"
        aria-label={thing.word}
        aria-pressed={picked === thing.id}
        onclick={() => onpick(thing.id)}
        onfocus={() => {
          focused = thing.id;
        }}
        onblur={() => {
          focused = undefined;
        }}
        onkeydown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onpick(thing.id);
        }}
      />
    {/each}
  {/if}
</svg>
