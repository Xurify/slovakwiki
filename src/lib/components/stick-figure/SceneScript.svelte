<script lang="ts">
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { panelClass } from "$lib/components/ui/system-ui";
  import type { SceneLine } from "$lib/stick-figure/scene-line";
  import { cx } from "$lib/ui/classes";

  /** The script under the stage, or a talk's lines so far; a line starts the scene from there. */
  let {
    hidden,
    lines,
    onpick,
    open = $bindable(false),
    said = false,
    shown,
    showEnglish,
  }: {
    /** A line the learner is still to say, shown by its English only. */
    hidden: (index: number) => boolean;
    lines: readonly SceneLine[];
    onpick: (index: number) => void;
    /** The script is showing; bound, so it stays open while the questions hide it. */
    open?: boolean;
    /** The lines said so far, not a script: a talk that branches on Alex's replies. */
    said?: boolean;
    /** The line in the caption. */
    shown: number;
    showEnglish: boolean;
  } = $props();
</script>

<div class="mt-3 flex justify-end">
  <TextLink
    aria-expanded={open}
    onclick={() => {
      open = !open;
    }}
  >
    {#if said}
      {open ? "Hide what was said" : "Show what was said"}
    {:else}
      {open ? "Hide the script" : "Show the script"}
    {/if}
  </TextLink>
</div>

{#if open}
  <ol
    class="{panelClass} m-0 mt-3 list-none divide-y divide-slate-200 overflow-hidden p-0"
  >
    {#each lines as line, index (line.id)}
      <li>
        <button
          class={cx(
            "block w-full cursor-pointer border-0 px-5 py-3 text-left sm:px-6",
            "transition-colors duration-150 ease-out hover:bg-subtle",
            index === shown ? "bg-blue-50" : "bg-transparent",
          )}
          type="button"
          onclick={() => onpick(index)}
        >
          <span class="block text-sm font-semibold text-slate-500">{line.speaker}</span>

          {#if hidden(index)}
            <span class="mt-0.5 block text-base text-slate-500 italic">
              Your line: {line.english}
            </span>
          {:else}
            <span class="mt-0.5 block font-serif text-lg text-slate-900" lang="sk">
              <MarkedText text={line.slovak} marks={line.marks} />
            </span>
            {#if showEnglish}
              <span class="block text-sm text-slate-500">{line.english}</span>
            {/if}
          {/if}
        </button>
      </li>
    {/each}
  </ol>
{/if}
