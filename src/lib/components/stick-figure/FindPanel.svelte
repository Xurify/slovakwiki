<script lang="ts">
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import { splitEmphasis } from "$lib/components/practice/practice-feedback-ui";
  import Button from "$lib/components/ui/Button.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import type { FindRound } from "$lib/stick-figure/find-round.svelte";
  import {
    accusativeOf,
    accusativeRule,
    findPrompt,
    formChanges,
  } from "$lib/stick-figure/scene-find";
  import type { SceneThing } from "$lib/stick-figure/thing-words";
  import { cx } from "$lib/ui/classes";
  import SceneAction from "./SceneAction.svelte";
  import SceneIcon from "./SceneIcon.svelte";

  /** Find it in the dialogue box: what to tap, how the tap went, and the round's end. */
  let {
    next,
    onagain,
    onnext,
    round,
    things,
  }: {
    /** The next scene's name, when there is one to go on to. */
    next?: string;
    onagain: () => void;
    onnext?: () => void;
    round: FindRound;
    things: readonly SceneThing[];
  } = $props();
</script>

{#if round.target && round.ask}
  {@const prompt = findPrompt(round.target, round.ask)}

  <p class={eyebrowMutedClass}>Tap it in the scene</p>
  {#key prompt.slovak}
    <p
      class="m-0 mt-1 animate-rise font-serif text-3xl text-slate-900 max-[600px]:text-2xl"
      lang="sk"
    >
      <MarkedText text={prompt.slovak} marks={prompt.marks} />
    </p>
  {/key}

  {#if round.note}
    <p
      class={cx(
        "m-0 mt-3 animate-rise text-sm leading-relaxed text-pretty",
        round.note.tone === "right" && "text-emerald-800",
        round.note.tone === "wrong" && "text-rose-800",
        round.note.tone === "shown" && "text-slate-700",
      )}
      role="status"
    >
      <span class="font-serif text-base font-semibold" lang="sk">
        {round.note.text}
      </span>
      <span class="mr-1 ml-1.5 text-slate-600">{round.note.english}</span>
      {#if round.note.why}
        {#each splitEmphasis(round.note.why) as part, index (index)}
          {#if part.type === "em"}
            <strong class="font-semibold">{part.value}</strong>
          {:else}
            {part.value}
          {/if}
        {/each}
      {/if}
    </p>
  {/if}
{:else if round.queue.length > 0}
  <div class="animate-rise">
    <p class="m-0 font-serif text-2xl text-slate-900">
      {round.firstTaps} of {round.queue.length} found on the first tap.
    </p>
    <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
      After <span class="font-serif text-base" lang="sk">ukáž na</span> a noun is in the
      accusative,
      <span class="font-serif text-base" lang="sk">akuzatív</span>: the case that answers
      <span class="font-serif text-base" lang="sk">Koho? Čo?</span>, whom? what? Some
      nouns change their ending for it, and the rest stay the same.
    </p>

    <ul
      class="m-0 mt-3 list-none divide-y divide-slate-200 rounded-(--control-radius) p-0 ring-1 ring-slate-200 ring-inset"
    >
      {#each round.inOrder(things) as thing (thing.id)}
        <li class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-3 py-2">
          <span class="font-serif text-base text-slate-900" lang="sk">
            {thing.word}
            {#if formChanges(thing)}
              <span class="text-slate-400" aria-hidden="true">→</span>
              <span class="text-emerald-700">{accusativeOf(thing)}</span>
            {/if}
          </span>
          <span class="text-sm text-slate-600">{thing.english}</span>
          <span class="text-sm text-slate-500">{accusativeRule(thing)}</span>
        </li>
      {/each}
    </ul>

    <div class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
      {#if next && onnext}
        <Button class="mr-2" variant="accent" onclick={onnext}>
          <SceneIcon name="next" />
          <span>Next scene: <span lang="sk">{next}</span></span>
        </Button>
        <SceneAction icon="replay" onclick={onagain}>Play again</SceneAction>
      {:else}
        <Button variant="accent" onclick={onagain}>
          <SceneIcon name="replay" />
          Play again
        </Button>
      {/if}
    </div>
  </div>
{:else}
  <p class="m-0 text-slate-600">Nothing to find in this place yet.</p>
{/if}
