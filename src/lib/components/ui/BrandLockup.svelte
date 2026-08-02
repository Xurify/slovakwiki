<script lang="ts">
  import SiteMark from "$lib/components/ui/SiteMark.svelte";

  let {
    size = "header",
    class: className = "",
  }: {
    size?: "header" | "footer";
    class?: string;
  } = $props();

  const markClass = $derived(size === "header" ? "size-7" : "size-5");

  const wordmarkClass = $derived(
    size === "header"
      ? "font-serif text-[1.05rem] font-semibold leading-none tracking-tight text-(--ink)"
      : "font-serif text-[0.95rem] leading-none text-(--ink)",
  );
</script>

<span class="inline-flex items-center gap-2.5 leading-none {className}">
  <SiteMark class={markClass} decorative />

  <strong class={wordmarkClass}>Slovak Wiki</strong>
</span>
