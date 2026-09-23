<script lang="ts">
  let {
    choiceCount = 0,
    mode = "check",
  }: {
    choiceCount?: number;
    mode?: "check" | "continue";
  } = $props();

  const kbdClass =
    "inline-grid min-w-5 place-items-center rounded-[4px] border border-slate-300 bg-surface px-1 py-px font-sans text-[0.68rem] font-semibold leading-4 text-slate-600 shadow-[0_1px_0_0_var(--line-strong)]";
</script>

<p
  class="m-0 flex items-center gap-3 text-xs text-slate-500 max-sm:hidden"
  aria-hidden="true"
>
  <span
    class="inline-flex items-center gap-1"
    data-key-hints-choose
    hidden={mode !== "check" || choiceCount < 2}
  >
    <kbd class={kbdClass}>1</kbd>
    <span>–</span>
    <kbd class={kbdClass} data-key-hints-count
      >{Math.min(Math.max(choiceCount, 2), 9)}</kbd
    >
    <span class="ml-0.5">choose</span>
  </span>

  <span class="inline-flex items-center gap-1">
    <kbd class={kbdClass}>Enter</kbd>
    <span class="ml-0.5">{mode === "continue" ? "continue" : "check"}</span>
  </span>
</p>
