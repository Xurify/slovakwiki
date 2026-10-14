<script lang="ts">
  import {
    lessonSceneSrc,
    type LessonSceneArtId,
  } from "$lib/lesson-story/story-settings";

  let {
    art,
    class: className = "",
  }: {
    art: LessonSceneArtId;
    class?: string;
  } = $props();

  const src = $derived(lessonSceneSrc[art]);
</script>

<div
  class="pointer-events-none absolute inset-0 overflow-hidden {className}"
  aria-hidden="true"
>
  <img
    class="absolute inset-0 size-full object-cover object-center"
    {src}
    alt=""
    width="1280"
    height="720"
    decoding="async"
  />

  <!-- Fade the bottom edge into the header paper -->
  <div
    class="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-paper to-transparent"
  ></div>
</div>
