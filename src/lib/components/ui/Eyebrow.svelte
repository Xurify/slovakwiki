<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    tone = "accent",
    compact = false,
    class: className = "",
    children,
  }: {
    tone?: "accent" | "muted" | "inverse";
    compact?: boolean;
    class?: string;
    children: Snippet;
  } = $props();
</script>

<p
  class:mb-2={!compact}
  class:mb-3={compact}
  class:text-accent={tone === "accent"}
  class:text-muted={tone === "muted"}
  class:text-panel-inverse-ink={tone === "inverse"}
  class:opacity-80={tone === "inverse"}
  class="m-0 font-sans font-[750] uppercase tracking-[0.1em] {compact
    ? 'text-[0.64rem] leading-tight'
    : 'text-[0.67rem]'} {className}"
>
  {@render children()}
</p>
