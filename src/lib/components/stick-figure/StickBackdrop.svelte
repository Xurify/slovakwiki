<script lang="ts">
  import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
  import {
    SCENE_THINGS,
    backdropAlign,
    thingBoxes,
  } from "$lib/stick-figure/scene-things";
  import { cx } from "$lib/ui/classes";
  import Cafe from "./backdrops/Cafe.svelte";
  import Classroom from "./backdrops/Classroom.svelte";
  import Home from "./backdrops/Home.svelte";
  import Market from "./backdrops/Market.svelte";
  import Park from "./backdrops/Park.svelte";
  import Plaza from "./backdrops/Plaza.svelte";
  import Registration from "./backdrops/Registration.svelte";
  import MoodLayer from "./backdrops/MoodLayer.svelte";
  import StageLight from "./backdrops/StageLight.svelte";
  import { CLOCK_HOURS, DAYTIME, type SceneMood } from "$lib/stick-figure/scene-mood";

  let {
    board,
    class: className = "",
    found = [],
    lit = [],
    mood = DAYTIME,
    onpick,
    picked,
    setting,
  }: {
    /** A line to chalk on the classroom board. */
    board?: string;
    class?: string;
    /** Things found in a game, ringed in green for the rest of it. */
    found?: readonly string[];
    /** Things to light up: named in the line playing. */
    lit?: readonly string[];
    /** Time of day and weather, from the dialogue or picked in the lab. */
    mood?: SceneMood;
    /** Makes each thing a button that reports its id. */
    onpick?: (id: string) => void;
    picked?: string;
    setting: LessonSceneArtId;
  } = $props();

  let focused = $state<string>();

  const align = $derived(backdropAlign(setting));
  const hour = $derived(CLOCK_HOURS[mood.time]);
  const things = $derived(SCENE_THINGS[setting] ?? []);
  const boxes = $derived(
    things.flatMap((thing) =>
      thingBoxes(thing).map((box, copy) => ({ box, copy, thing })),
    ),
  );
  // The smallest on top, so the clock on the tower gets its own tap.
  const hitOrder = $derived(
    [...boxes].sort((a, b) => b.box.width * b.box.height - a.box.width * a.box.height),
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
    <Classroom {board} {hour} />
  {:else if setting === "home"}
    <Home />
  {:else if setting === "market"}
    <Market />
  {:else if setting === "plaza"}
    <Plaza {hour} />
  {:else if setting === "registration" || setting === "counter"}
    <Registration {hour} />
  {:else}
    <Park />
  {/if}

  <MoodLayer {mood} {setting} />
  <StageLight />

  {#each boxes as { box, copy, thing } (`${thing.id}-${copy}`)}
    {@const done = found.includes(thing.id)}
    <rect
      x={box.x - 5}
      y={box.y - 5}
      width={box.width + 10}
      height={box.height + 10}
      rx="8"
      class={cx(
        "fill-white/20 transition-opacity duration-150 ease-out",
        done ? "stroke-emerald-500" : "stroke-blue-500",
        done || lit.includes(thing.id) || picked === thing.id || focused === thing.id
          ? "opacity-100"
          : "opacity-0",
      )}
      stroke-width="2.5"
    />
  {/each}

  {#if onpick}
    {#each hitOrder as { box, copy, thing } (`${thing.id}-${copy}`)}
      <rect
        x={box.x - 5}
        y={box.y - 5}
        width={box.width + 10}
        height={box.height + 10}
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
