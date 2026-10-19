<script lang="ts">
  let {
    count,
    tone = "neutral",
  }: {
    count: number;
    tone?: "neutral" | "rose";
  } = $props();
</script>

<span
  class={[
    "inline-grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full px-1.5 font-sans text-[0.68rem] leading-none font-semibold tracking-normal tabular-nums normal-case",
    tone === "rose" ? "bg-rose-50 text-rose-700" : "bg-subtle text-slate-600",
  ]}
>
  {count}
</span>
