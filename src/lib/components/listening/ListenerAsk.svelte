<script lang="ts">
  import { tick } from "svelte";

  import type { ListenerAsk } from "$lib/learning/types";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { checkChoiceOrder } from "$lib/listening/check-order";
  import { focusUnlessTyping } from "$lib/listening/focus";
  import { cx } from "$lib/ui/classes";

  import ListenControl from "./ListenControl.svelte";

  let {
    answerer,
    ask,
    id,
    judged,
    onpick,
    onskip,
    picked,
    revealed,
  }: {
    /** Who gives the answer once the listener has had their go. */
    answerer: string;
    ask: ListenerAsk;
    /** The asking line's id, which fixes the order its choices come in. */
    id: string;
    /** The line the ask follows: quoted when the question is only right or wrong, so the card says what is judged. */
    judged?: string;
    onpick: (id: string) => void;
    onskip: () => void;
    picked: string | null;
    /** The answer has been heard, so the listener's pick can be marked. */
    revealed: boolean;
  } = $props();

  let root: HTMLElement | undefined = $state();

  const right = $derived(picked === ask.answerId);
  const verdict = $derived(
    ask.choices.length === 2 && ask.choices.every((choice) => ["right", "wrong"].includes(choice.id)),
  );
  const answer = $derived(ask.choices.find((choice) => choice.id === ask.answerId));
  /** Right then wrong reads as a pair, so a verdict keeps it; any other ask written answer first would give it away. */
  const choices = $derived(verdict ? ask.choices : checkChoiceOrder(id, ask.choices));
  /** The same English under every choice would only repeat itself, and a different one could give the answer away. */
  const glossed = $derived(new Set(ask.choices.map((choice) => choice.english)).size > 1);
  const fold = (text: string) =>
    text.trim().normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("sk");
  /** A name glossed with itself, Marek under Marek, says nothing. */
  const glossOf = (choice: ListenerAsk["choices"][number]) =>
    glossed && fold(choice.english) !== fold(choice.label) ? choice.english : undefined;
  const whyWrong = $derived(
    revealed && picked && !right
      ? ask.choices.find((choice) => choice.id === picked)?.whyWrong
      : undefined,
  );
  /** A label written as a sentence keeps its own stop: "Čaká na Mareka." took a second one. */
  const sentence = (text: string) => (/[.!?…]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);
  const status = $derived.by(() => {
    if (!picked) return "";
    if (!revealed) return `${answerer} is answering…`;
    return right
      ? "Right."
      : `Not quite. The answer is ${sentence(answer?.label ?? "")}${whyWrong ? ` ${whyWrong}` : ""}`;
  });

  $effect(() => {
    void tick().then(() =>
      focusUnlessTyping(root?.querySelector<HTMLElement>("button:not([aria-disabled])")),
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

  {#if verdict && judged}
    <blockquote class="m-0 mt-1 border-l-2 border-slate-300 pl-3 font-serif text-lg text-slate-700" lang="sk">
      {judged}
    </blockquote>
  {/if}

  <p
    id="listener-ask-prompt"
    class="m-0 mt-0.5 font-serif text-lg font-semibold text-slate-900"
    lang="sk"
  >
    {ask.prompt}
  </p>

  <!-- Below 480px one choice to a row, all one height: two to a row squeezed a word to a line and the buttons came out uneven. -->
  <div class="mt-3 grid auto-rows-fr gap-2 min-[480px]:flex min-[480px]:flex-wrap min-[480px]:items-stretch">
    {#each choices as choice (choice.id)}
      {@const chosen = picked === choice.id}
      {@const markWrong = revealed && chosen && !right}
      {@const markRight = revealed && choice.id === ask.answerId && (chosen || !right)}
      {@const gloss = glossOf(choice)}

      <button
        class={cx(
          "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-(--control-radius) border px-4 py-2 text-balance min-[480px]:w-auto min-[480px]:min-w-32 min-[480px]:flex-1 sm:flex-none",
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
        {#if gloss}
          <span class="text-sm text-slate-700">{gloss}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if !picked}
    <!-- Under the choices, its box on the card's left edge like the choice buttons: pulled out by its padding, the hover fill stuck out 10px past the prompt. Pushed to the far right it sat alone, hundreds of px from the question. -->
    <ListenControl class="mt-1 min-h-11" onclick={onskip}>
      Let {answerer} answer
    </ListenControl>
  {/if}

  {#if whyWrong}
    <p class="m-0 mt-3 text-sm text-slate-700">{whyWrong}</p>
  {/if}

  <p class="sr-only" aria-live="polite">{status}</p>
</div>
