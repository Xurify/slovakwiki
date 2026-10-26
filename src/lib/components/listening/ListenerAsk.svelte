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
  const status = $derived.by(() => {
    if (!picked) return null;
    if (!revealed) return `Let's hear ${answerer}…`;
    return right ? "You got it." : "Not this time.";
  });

  $effect(() => {
    void tick().then(() =>
      focusUnlessTyping(root?.querySelector<HTMLElement>("button:not(:disabled)")),
    );
  });
</script>

<div
  bind:this={root}
  class="animate-rise border-t border-slate-200/70 bg-subtle/60 px-4 py-4 sm:px-5"
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
  <p class="m-0 text-sm text-slate-600">{ask.promptEnglish}</p>

  <div class="mt-3 flex flex-wrap items-center gap-2">
    {#each ask.choices as choice (choice.id)}
      {@const chosen = picked === choice.id}
      {@const marked = revealed && chosen}

      <button
        class={cx(
          "inline-flex min-h-12 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-(--control-radius) border px-4 py-2",
          "transition-[background-color,border-color,color] duration-150 ease-out disabled:cursor-default",
          marked && right && "border-emerald-600 bg-emerald-50 text-emerald-900",
          marked && !right && "border-rose-600 bg-rose-50 text-rose-900",
          chosen && !marked && "border-blue-600 bg-blue-50 text-blue-900",
          !chosen &&
            "border-slate-300 bg-surface text-slate-900 enabled:hover:border-blue-700 enabled:hover:bg-blue-50 disabled:opacity-60",
        )}
        type="button"
        aria-pressed={chosen}
        disabled={picked !== null}
        onclick={() => onpick(choice.id)}
      >
        {#if marked}
          <svg
            class="size-4 shrink-0 fill-none stroke-current"
            viewBox="0 0 24 24"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            {#if right}
              <path d="M5 13l4 4L19 7" />
            {:else}
              <path d="M6 6l12 12M18 6 6 18" />
            {/if}
          </svg>
        {/if}

        <span class="font-serif font-semibold" lang="sk">{choice.label}</span>
        <span class="text-sm opacity-70">{choice.english}</span>
      </button>
    {/each}

    {#if !picked}
      <ListenControl onclick={onskip}>Let {answerer} answer</ListenControl>
    {/if}
  </div>

  <p class="m-0 mt-2 min-h-5 text-sm text-slate-700" aria-live="polite">{status}</p>
</div>
