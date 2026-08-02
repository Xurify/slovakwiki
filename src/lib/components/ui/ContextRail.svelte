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

<aside class="grid gap-8 [&_dd]:mt-1 [&_dt]:leading-tight [&_section]:min-w-0 {className}">
  {@render children()}
</aside>
