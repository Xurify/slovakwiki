<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    class: className = "",
    children,
    ...rest
  }: {
    class?: string;
    children: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<aside
  class="grid gap-8 [&_dd]:mt-1 [&_dt]:leading-tight [&_section]:min-w-0 {className}"
  {...rest}
>
  {@render children()}
</aside>
