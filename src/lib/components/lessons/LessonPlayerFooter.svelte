<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import LessonBackButton from "$lib/components/lessons/LessonBackButton.svelte";

  let {
    disabled = false,
    label,
    onback,
    onclick,
  }: {
    disabled?: boolean;
    label: string;
    onback?: () => void;
    onclick: () => void;
  } = $props();
</script>

<div class="shrink-0 border-t border-slate-200 bg-paper px-4 py-4 sm:px-8 sm:py-5">
  <div class="mx-auto flex max-w-[640px] items-center justify-end gap-2">
    {#if onback}
      <LessonBackButton onclick={onback} />
    {/if}

    <Button variant="accent" class="min-w-36 px-8" type="button" {disabled} {onclick}>
      {label}
    </Button>
  </div>
</div>
