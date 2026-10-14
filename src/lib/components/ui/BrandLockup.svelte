<script lang="ts">
  import SiteMark from "$lib/components/ui/SiteMark.svelte";

  let {
    size = "header",
    tone = "default",
    class: className = "",
  }: {
    size?: "header" | "footer";
    /** `inverse` sits on the top bar. */
    tone?: "default" | "inverse";
    class?: string;
  } = $props();

  const inkClass = $derived(
    tone === "inverse" ? "text-panel-inverse-ink" : "text-(--ink)",
  );

  const markClass = $derived(size === "header" ? "size-7" : "size-5");

  const wordmarkClass = $derived(
    size === "header"
      ? "font-serif text-[1.05rem] font-semibold leading-none tracking-tight"
      : "font-serif text-[0.95rem] leading-none",
  );
</script>

<span class="inline-flex items-center gap-2.5 leading-none {className}">
  <SiteMark class={markClass} decorative {tone} />

  <strong class="{wordmarkClass} {inkClass}">Slovak Wiki</strong>
</span>
