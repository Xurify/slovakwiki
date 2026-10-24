<script lang="ts" module>
  import type { SceneIconName } from "./SceneIcon.svelte";

  export interface DoneAction {
    icon: SceneIconName;
    label: string;
    run: () => void;
    /** A Slovak name after the label: the next scene's. */
    slovak?: string;
  }
</script>

<script lang="ts">
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import type { SceneLine } from "$lib/stick-figure/scene-line";
  import { thingWithDemonstrative, type SceneThing } from "$lib/stick-figure/thing-words";
  import { cx } from "$lib/ui/classes";
  import SceneAction from "./SceneAction.svelte";
  import SceneIcon from "./SceneIcon.svelte";

  /**
   * The end of a scene in the dialogue box: how it went, what the learner
   * said in a talk, the things the dialogue named, and where to go next.
   * The first action is the main one.
   */
  let {
    actions,
    href,
    hrefLabel,
    learnerName,
    said = [],
    score,
    thingWords,
    words,
  }: {
    actions: readonly DoneAction[];
    /** Where the scene comes from: its lesson or episode. */
    href?: string;
    hrefLabel?: string;
    learnerName: string;
    /** In a talk, the learner's lines and whether each was right the first time. */
    said?: ReadonlyArray<{ firstTry: boolean | undefined; line: SceneLine }>;
    /** How it went, in a sentence; none when there was nothing to score. */
    score?: string;
    thingWords: Record<string, { href?: string; src?: string }>;
    /** The things the dialogue named, in the order it named them. */
    words: readonly SceneThing[];
  } = $props();
</script>

<div class="animate-rise">
  {#if score}
    <p class="m-0 font-serif text-2xl text-slate-900">{score}</p>
  {/if}

  {#if said.length > 0}
    <p class="{eyebrowMutedClass} mt-4">What {learnerName} said</p>
    <ol
      class="m-0 mt-2 grid list-none gap-1 rounded-(--control-radius) p-3 ring-1 ring-slate-200 ring-inset"
    >
      {#each said as { firstTry, line }, index (index)}
        <li class="flex flex-wrap items-baseline gap-x-2.5">
          <span
            class={cx(
              "font-serif text-base",
              firstTry === false ? "text-rose-800" : "text-slate-900",
            )}
            lang="sk"
          >
            {line.slovak}
          </span>
          <span class="text-sm text-slate-500">{line.english}</span>
        </li>
      {/each}
    </ol>
    {#if said.some(({ firstTry }) => firstTry === false)}
      <p class="m-0 mt-2 text-sm text-slate-600">
        The lines that took another try are red.
      </p>
    {/if}
  {/if}

  {#if words.length > 0}
    <p class={cx(eyebrowMutedClass, (score || said.length > 0) && "mt-4")}>
      Things the dialogue named
    </p>
    <ul class="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
      {#each words as thing (thing.id)}
        {@const word = thingWords[thing.word]}
        <li
          class="inline-flex items-center gap-2 rounded-(--control-radius) bg-subtle py-1.5 pr-3 pl-1.5"
        >
          {#if word?.src}
            <AudioButton
              label="Listen: {thing.word}"
              size="sm"
              src={word.src}
              text={thing.word}
            />
          {/if}
          <span class="font-serif text-base text-slate-900" lang="sk">
            {thingWithDemonstrative(thing)}
          </span>
          <span class="text-sm text-slate-500">{thing.english}</span>
        </li>
      {/each}
    </ul>
  {/if}

  <div
    class={cx(
      "flex flex-wrap items-center gap-x-2 gap-y-2",
      (score || said.length > 0 || words.length > 0) && "mt-4",
    )}
  >
    {#each actions as action, index (action.label)}
      {#if index === 0}
        <Button class="mr-2" variant="accent" onclick={action.run}>
          <SceneIcon name={action.icon} />
          <span>
            {action.label}{#if action.slovak}:
              <span lang="sk">{action.slovak}</span>{/if}
          </span>
        </Button>
      {:else}
        <SceneAction icon={action.icon} onclick={action.run}>
          {action.label}
        </SceneAction>
      {/if}
    {/each}
    {#if href}
      <SceneAction {href} icon="book">{hrefLabel}</SceneAction>
    {/if}
  </div>
</div>
