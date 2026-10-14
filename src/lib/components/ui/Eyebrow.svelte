<script lang="ts">
  import { eyebrowClass } from "$lib/components/ui/system-ui";
  import type { Snippet } from "svelte";

  /**
   * The one small-caps label used above section titles, rail lists and card
   * headers. Same type everywhere; only the tone and bottom margin vary.
   */
  let {
    tone = "accent",
    compact = false,
    class: className = "",
    children,
  }: {
    tone?: "accent" | "muted" | "inverse";
    /** Rail and card use: a little more room before the list it labels. */
    compact?: boolean;
    class?: string;
    children: Snippet;
  } = $props();
</script>

<p
  class:mb-2={!compact}
  class:mb-3={compact}
  class:text-blue-800={tone === "accent"}
  class:text-slate-500={tone === "muted"}
  class:text-panel-inverse-ink={tone === "inverse"}
  class:opacity-80={tone === "inverse"}
  class="{eyebrowClass} {className}"
>
  {@render children()}
</p>
