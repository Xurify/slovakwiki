<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import LessonBackButton from "$lib/components/lessons/LessonBackButton.svelte";

  let {
    disabled = false,
    label,
    onback,
    onclick,
    queues = false,
    wide = false,
  }: {
    disabled?: boolean;
    label: string;
    onback?: () => void;
    onclick: () => void;
    /** A press before the page is ready is kept and acted on once it is (see the lesson page's inline script). */
    queues?: boolean;
    /** As wide as a lesson with its stage beside the steps. */
    wide?: boolean;
  } = $props();
</script>

<div class="shrink-0 border-t border-slate-200 bg-paper px-4 py-4 sm:px-8 sm:py-5">
  <div
    class="mx-auto flex items-center justify-end gap-2 {wide
      ? 'max-w-[1120px]'
      : 'max-w-[640px]'}"
  >
    {#if onback}
      <LessonBackButton onclick={onback} />
    {/if}

    <Button
      variant="accent"
      class="min-w-36 px-8"
      type="button"
      data-lesson-play={queues ? "" : undefined}
      {disabled}
      {onclick}
    >
      <span class="[html[data-lesson-play-queued]_&]:hidden">{label}</span>
      <span class="hidden [html[data-lesson-play-queued]_&]:inline">Starting…</span>
    </Button>
  </div>
</div>
