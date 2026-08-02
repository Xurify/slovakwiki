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

<p class="mt-3.5 max-w-[680px] font-serif text-[1.04rem] text-slate-600 {className}">
  {@render children()}
</p>
