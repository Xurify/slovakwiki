<script lang="ts">
  import type { Snippet } from "svelte";

  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import type { PlayTurns } from "$lib/stick-figure/play-turns.svelte";
  import type { SceneLine } from "$lib/stick-figure/scene-line";
  import {
    defaultReply,
    fits,
    replyChoices,
    type TalkNode,
  } from "$lib/stick-figure/talk";
  import type { Take } from "$lib/stick-figure/take";
  import ChipGroup from "./ChipGroup.svelte";
  import SceneAction from "./SceneAction.svelte";
  import SceneSay from "./SceneSay.svelte";
  import SceneTurn from "./SceneTurn.svelte";

  /**
   * The learner's turn in Play as: pick the line, build it or say it, and
   * in a talk first choose what to say when more than one reply fits.
   */
  let {
    heard,
    node,
    onanswer,
    onhear,
    onhearfirst,
    onmiss,
    ontake,
    showEnglish,
    turn,
    turns,
  }: {
    /** In a talk, the other person's line this turn answers, over it. */
    heard?: Snippet;
    /** In a talk, the node this turn answers. */
    node?: TalkNode<SceneLine>;
    onanswer: (firstTry: boolean, choiceId?: string) => void;
    /** The cast says the line in the learner's place. */
    onhear: () => void;
    /** The cast's clip of the line, to copy before recording it. */
    onhearfirst: () => void;
    onmiss: (said: string, choiceId?: string) => void;
    ontake: (take: Take) => void;
    showEnglish: boolean;
    turn: SceneLine;
    turns: PlayTurns;
  } = $props();

  const step = $derived(turns.now);
  const pick = $derived(node ? (turns.picks[node.id] ?? defaultReply(node)) : 0);
  /** In a talk, the replies that fit, when there is more than one to choose between. */
  const intents = $derived(
    (node?.replies ?? []).flatMap((reply, index) =>
      fits(reply) ? [{ id: index, label: reply.line.english }] : [],
    ),
  );
  /** In a talk the English is the reply chosen below when there is a choice of them. */
  const english = $derived(
    node && (step === "pick" || intents.length > 1) ? undefined : turn.english,
  );
</script>

{#snippet answerKinds()}
  <ChipGroup
    label="How to answer"
    onselect={(id) => {
      turns.kind = id;
    }}
    options={turns.kinds}
    selected={turns.kind}
  />
{/snippet}

{#if heard}
  <div class="mb-5 border-b border-slate-200 pb-4">
    {@render heard()}
  </div>
{/if}

{#if node && step !== "pick" && intents.length > 1}
  <div class="mb-4">
    <p class={eyebrowMutedClass}>What do you want to say?</p>
    <ChipGroup
      class="mt-2"
      label="What to say"
      onselect={(index) => turns.choose(node.id, index)}
      options={intents}
      selected={pick}
    />
  </div>
{/if}

{#key `${turn.id}-${pick}-${step}`}
  {#if step === "say"}
    <SceneSay
      aside={answerKinds}
      {english}
      marks={turn.marks}
      onhear={onhearfirst}
      {ontake}
      {showEnglish}
      slovak={turn.slovak}
      speaker={turn.speaker}
    />
  {:else}
    <SceneTurn
      aside={answerKinds}
      {english}
      id={turn.id}
      ondone={onanswer}
      {onmiss}
      sayChoices={step !== "pick"
        ? undefined
        : node
          ? replyChoices(node)
          : turn.sayChoices}
      slovak={turn.slovak}
    />
  {/if}
{/key}

<SceneAction class="mt-3 -ml-2.5" icon="listen" onclick={onhear}>
  {step === "say" ? `Let ${turn.speaker} say it` : `Hear ${turn.speaker} say it`}
</SceneAction>
