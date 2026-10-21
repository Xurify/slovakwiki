<script lang="ts">
  import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
  import { backdropAlign } from "$lib/stick-figure/scene-things";
  import Cafe from "./backdrops/Cafe.svelte";
  import Classroom from "./backdrops/Classroom.svelte";
  import Home from "./backdrops/Home.svelte";
  import Market from "./backdrops/Market.svelte";
  import Park from "./backdrops/Park.svelte";
  import Plaza from "./backdrops/Plaza.svelte";
  import Registration from "./backdrops/Registration.svelte";
  import StageLight from "./backdrops/StageLight.svelte";

  let { class: className = "", setting }: { class?: string; setting: LessonSceneArtId } =
    $props();

  const align = $derived(backdropAlign(setting));
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
  viewBox="0 0 960 300"
  preserveAspectRatio="{align === 0 ? 'xMin' : align === 1 ? 'xMax' : 'xMid'}YMax slice"
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if setting === "cafe"}
    <Cafe />
  {:else if setting === "classroom"}
    <Classroom />
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
</svg>
