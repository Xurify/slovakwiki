<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    class: className = "",
    children,
  }: {
    class?: string;
    children: Snippet;
  } = $props();
</script>

<div
  class="mx-auto w-[min(var(--workspace-max),calc(100%-64px))] max-[800px]:w-[min(100%-28px,680px)] {className}"
>
  {@render children()}
</div>
