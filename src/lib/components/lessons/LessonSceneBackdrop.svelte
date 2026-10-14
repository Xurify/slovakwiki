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
    class="story-backdrop-photo absolute inset-0 size-full object-cover object-center"
    {src}
    alt=""
    width="1280"
    height="720"
    decoding="async"
  />

  <!-- Soft wash so title/chip stay readable over photography -->
  <div
    class="absolute inset-0 bg-linear-to-b from-slate-900/15 via-paper/25 to-paper"
  ></div>
  <div
    class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-paper via-paper/80 to-transparent"
  ></div>
</div>

<style>
  .story-backdrop-photo {
    animation: story-photo-drift 28s ease-in-out infinite alternate;
    transform-origin: center center;
  }

  @keyframes story-photo-drift {
    from {
      transform: scale(1.04) translate(0, 0);
    }
    to {
      transform: scale(1.08) translate(-1.2%, 0.6%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-backdrop-photo {
      animation: none;
      transform: scale(1.04);
    }
  }
</style>
