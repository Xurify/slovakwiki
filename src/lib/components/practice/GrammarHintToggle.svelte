<script lang="ts">
  import type { ClozeHint } from "$lib/learning/types";

  let {
    hint,
    open = $bindable(false),
    variant = "bar",
  }: {
    hint: ClozeHint;
    open?: boolean;
    variant?: "bar" | "chip";
  } = $props();

  const barClass =
    "flex w-full items-center gap-3 rounded-(--control-radius) border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-100";

  const chipClass =
    "inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-blue-800 hover:border-blue-600 hover:bg-blue-50";
</script>

{#if variant === "bar"}
  <button
    class={barClass}
    type="button"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span
      class="shrink-0 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-slate-500"
    >
      Grammar
    </span>

    <span class="min-w-0 flex-1 font-serif text-sm font-semibold text-blue-800">
      {hint.chip}
    </span>

    <span
      class="shrink-0 text-sm leading-none text-slate-400 transition-transform"
      class:rotate-180={open}
      aria-hidden="true"
    >
      ▾
    </span>
  </button>
{:else}
  <button
    class={chipClass}
    type="button"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span class="text-[0.64rem] font-bold uppercase tracking-[0.08em] text-slate-500"
      >Grammar</span
    >
    <span class="text-slate-400" aria-hidden="true">·</span>
    <span>{hint.chip}</span>
  </button>
{/if}
