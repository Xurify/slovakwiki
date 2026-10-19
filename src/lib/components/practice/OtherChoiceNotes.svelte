<script lang="ts">
  import { splitEmphasis } from "$lib/components/practice/practice-feedback-ui";
  import type { OtherChoiceNote } from "$lib/learning/exercises/feedback-why";

  let {
    notes,
    class: className = "",
  }: {
    notes: OtherChoiceNote[];
    class?: string;
  } = $props();

  let open = $state(false);

  const panelId = $props.id();

  const toggleClass =
    "inline-flex items-center gap-1.5 text-sm font-semibold text-blue-800 transition-colors duration-150 ease-out hover:text-blue-900";

  const panelClass =
    "m-0 mt-2 grid max-h-[40vh] animate-rise list-none overflow-y-auto rounded-(--control-radius) bg-surface p-0 ring-1 ring-slate-200 ring-inset";
</script>

{#if notes.length}
  <div class={className}>
    <button
      class={toggleClass}
      type="button"
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      onclick={() => (open = !open)}
    >
      Why not the others?
      <svg
        class="size-4 shrink-0 fill-none stroke-current stroke-2 transition-transform duration-150 ease-out"
        class:rotate-180={open}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    {#if open}
      <ul id={panelId} class={panelClass}>
        {#each notes as note, index (index)}
          <li
            class="grid gap-0.5 border-b border-slate-200 px-3.5 py-2.5 last:border-b-0"
          >
            <p
              class="m-0 font-serif text-[0.9375rem] font-semibold text-slate-900"
              lang="sk"
            >
              {note.label}
            </p>

            <p class="m-0 max-w-[65ch] text-sm leading-snug text-slate-600">
              {#each splitEmphasis(note.why) as part, partIndex (`${part.type}-${partIndex}`)}
                {#if part.type === "em" || part.type === "i"}
                  <strong class="font-semibold text-slate-800">{part.value}</strong>
                {:else}
                  {part.value}
                {/if}
              {/each}
            </p>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
