<script lang="ts">
  import { tick } from "svelte";

  import type { ListenerAsk } from "$lib/learning/types";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { focusUnlessTyping } from "$lib/listening/focus";
  import { cx } from "$lib/ui/classes";

  import ListenControl from "./ListenControl.svelte";

  let {
    answerer,
    ask,
    onpick,
    onskip,
    picked,
    revealed,
  }: {
    /** Who gives the answer once the listener has had their go. */
    answerer: string;
    ask: ListenerAsk;
    onpick: (id: string) => void;
    onskip: () => void;
    picked: string | null;
    /** The answer has been heard, so the listener's pick can be marked. */
    revealed: boolean;
  } = $props();

  let root: HTMLElement | undefined = $state();

  const right = $derived(picked === ask.answerId);
  const answer = $derived(ask.choices.find((choice) => choice.id === ask.answerId));
  /** The same English under every choice would only repeat itself, and a different one could give the answer away. */
  const glossed = $derived(new Set(ask.choices.map((choice) => choice.english)).size > 1);
  const status = $derived.by(() => {
    if (!picked) return "";
    if (!revealed) return `${answerer} is answering…`;
    return right ? "Right." : `Not quite. The answer is ${answer?.label}.`;
  });

  $effect(() => {
    void tick().then(() =>
      focusUnlessTyping(root?.querySelector<HTMLElement>("button:not([aria-disabled])")),
    );
  });
</script>

<div
  bind:this={root}
  class="animate-rise border-t border-slate-200/70 bg-subtle/60 px-4 pt-4 pb-3 sm:px-5"
  role="group"
  aria-labelledby="listener-ask-prompt"
>
  <p class={eyebrowMutedClass}>Your turn</p>

  <p
    id="listener-ask-prompt"
    class="m-0 mt-0.5 font-serif text-lg font-semibold text-slate-900"
    lang="sk"
  >
    {ask.prompt}
  </p>

  <div class="mt-3 flex flex-wrap items-center gap-2">
    {#each ask.choices as choice (choice.id)}
      {@const chosen = picked === choice.id}
      {@const markWrong = revealed && chosen && !right}
      {@const markRight = revealed && choice.id === ask.answerId && (chosen || !right)}

      <button
        class={cx(
          "inline-flex min-h-12 min-w-32 items-center justify-center gap-2 rounded-(--control-radius) border px-4 py-2",
          "transition-[background-color,border-color,color] duration-150 ease-out",
          picked ? "cursor-default" : "cursor-pointer",
          markRight && "border-emerald-600 bg-emerald-50 text-emerald-800",
          markWrong && "border-rose-600 bg-rose-50 text-rose-800",
          chosen && !revealed && "border-blue-600 bg-blue-50 text-blue-800",
          !markRight &&
            !markWrong &&
            !(chosen && !revealed) &&
            "border-slate-300 bg-surface text-slate-900",
          !picked && "hover:border-blue-700 hover:bg-blue-50",
        )}
        type="button"
        aria-pressed={chosen}
        aria-disabled={picked !== null ? "true" : undefined}
        onclick={() => {
          if (picked === null) onpick(choice.id);
        }}
      >
        {#if markRight || markWrong}
          <svg
            class="size-4 shrink-0 fill-none stroke-current"
            viewBox="0 0 24 24"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            {#if markRight}
              <path d="M5 13l4 4L19 7" />
            {:else}
              <path d="M6 6l12 12M18 6 6 18" />
            {/if}
          </svg>
        {/if}

        <span class="font-serif font-semibold" lang="sk">{choice.label}</span>
        {#if glossed}
          <span class="text-sm text-slate-700">{choice.english}</span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="mt-1 -ml-2.5 min-h-11">
    {#if !picked}
      <ListenControl onclick={onskip}>Let {answerer} answer</ListenControl>
    {/if}
  </div>

  <p class="sr-only" aria-live="polite">{status}</p>
</div>
