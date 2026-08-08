<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    footer,
    footerClass = "border-t border-slate-200 bg-paper/70",
  }: {
    children: Snippet;
    footer?: Snippet;
    footerClass?: string;
  } = $props();
</script>

<section
  class="overflow-hidden rounded-(--frame-radius) border border-slate-200 bg-surface shadow-(--shadow-border)"
>
  <div class="px-7 py-8 max-[560px]:px-4 max-[560px]:py-6">
    {@render children()}
  </div>

  {#if footer}
    <footer class="px-7 py-5 max-[560px]:px-4 max-[560px]:py-4 {footerClass}">
      {@render footer()}
    </footer>
  {/if}
</section>
