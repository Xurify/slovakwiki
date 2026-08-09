<script lang="ts">
  import RichTeachingText from "$lib/components/practice/RichTeachingText.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import type { ClozeHint } from "$lib/learning/types";

  let {
    hint,
    open = $bindable(false),
    variant = "bar",
    panelPlacement = "inline",
    class: className = "",
  }: {
    hint: ClozeHint;
    open?: boolean;
    variant?: "bar" | "chip";
    /** Inline panel under toggle, or omit when parent renders rail panel. */
    panelPlacement?: "inline" | "none";
    class?: string;
  } = $props();

  const shellClass =
    "rounded-(--control-radius) border border-dashed border-slate-300 bg-slate-50/90";

  const barButtonClass =
    "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-100/80";

  const chipButtonClass =
    "inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50/60";
</script>

{#snippet chevron()}
  <svg
    class="size-4 shrink-0 fill-none stroke-slate-400 stroke-2 transition-transform duration-200"
    class:rotate-180={open}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet panel()}
  <RichTeachingText class="text-sm leading-6 text-slate-700" text={hint.note} />

  {#if hint.grammarTopicId}
    <TextLink class="mt-2 inline-block text-sm" href={`/grammar/${hint.grammarTopicId}`}>
      Open grammar topic
    </TextLink>
  {/if}
{/snippet}

{#if variant === "bar"}
  <div class="{shellClass} {className}">
    <button
      class={barButtonClass}
      type="button"
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800"
        aria-hidden="true"
      >
        ?
      </span>

      <span class="min-w-0 flex-1">
        <span class="block text-sm font-semibold text-slate-900">Grammar hint</span>
        <span class="block text-sm text-slate-600">{hint.chip}</span>
      </span>

      <span class="shrink-0 text-xs font-semibold text-blue-800">
        {open ? "Hide" : "Show"}
      </span>

      {@render chevron()}
    </button>

    {#if open && panelPlacement === "inline"}
      <div class="border-t border-dashed border-slate-300 px-3.5 py-3">
        {@render panel()}
      </div>
    {/if}
  </div>
{:else}
  <div class={className}>
    <button
      class={chipButtonClass}
      type="button"
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      <span class="font-bold text-blue-800">{open ? "Hide hint" : "Show hint"}</span>
      <span class="text-slate-400" aria-hidden="true">·</span>
      <span>{hint.chip}</span>
      {@render chevron()}
    </button>

    {#if open && panelPlacement === "inline"}
      <div class="mt-2 {shellClass} px-3 py-2.5">
        {@render panel()}
      </div>
    {/if}
  </div>
{/if}
