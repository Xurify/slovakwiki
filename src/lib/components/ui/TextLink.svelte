<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    href,
    class: className = "",
    children,
    ...rest
  }: {
    href: string;
    class?: string;
    children: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<a
  class="text-[0.82rem] font-bold text-blue-800 underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)] underline-offset-[3px] {className}"
  {href}
  {...rest}
>
  {@render children()}
</a>
