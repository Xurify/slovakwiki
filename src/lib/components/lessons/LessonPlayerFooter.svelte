<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";

  let {
    disabled = false,
    label,
    onclick,
  }: {
    disabled?: boolean;
    label: string;
    onclick: () => void;
  } = $props();
</script>

<div class="shrink-0 border-t border-slate-200 bg-paper px-4 py-4 sm:px-8 sm:py-5">
  <div class="mx-auto flex max-w-2xl justify-end">
    <Button variant="accent" class="min-w-36 px-8" type="button" {disabled} {onclick}>
      {label}
    </Button>
  </div>
</div>
