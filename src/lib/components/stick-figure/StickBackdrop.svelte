<script lang="ts">
  import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
  import Cafe from "./backdrops/Cafe.svelte";
  import Classroom from "./backdrops/Classroom.svelte";
  import Home from "./backdrops/Home.svelte";
  import Market from "./backdrops/Market.svelte";
  import Park from "./backdrops/Park.svelte";
  import Plaza from "./backdrops/Plaza.svelte";
  import Registration from "./backdrops/Registration.svelte";

  let { class: className = "", setting }: { class?: string; setting: LessonSceneArtId } =
    $props();
</script>

<!--
  960×300 with the floor line at y 226. Slice keeps the floor on the bottom
  edge and trims the sides on a narrow stage, so what names the place sits
  near the middle or above head height (y < 70).
-->
<svg
  class="block {className}"
  viewBox="0 0 960 300"
  preserveAspectRatio="xMidYMax slice"
  fill="none"
  stroke-width="1.6"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <g class="stroke-scene-line">
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
  </g>
</svg>
