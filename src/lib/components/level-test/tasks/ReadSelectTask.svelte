<script lang="ts">
  import { gradeYesNo } from "$lib/level-test/grade";
  import { adaptiveResponse } from "$lib/level-test/session";
  import type { ReadSelectItem } from "$lib/level-test/types";

  import TaskFrame from "../TaskFrame.svelte";
  import type { StepDone } from "../steps";

  let {
    item,
    seconds,
    ondone,
  }: {
    item: ReadSelectItem;
    seconds: number | null;
    ondone: StepDone;
  } = $props();

  let answered = false;

  function answer(value: boolean | null): void {
    if (answered) return;
    answered = true;
    ondone({ responses: [adaptiveResponse(item, gradeYesNo(item.real, value))] });
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "y" || key === "arrowleft") answer(true);
    if (key === "n" || key === "arrowright") answer(false);
  }

  const buttonClass =
    "flex min-w-32 cursor-pointer flex-col items-center gap-2 rounded-(--frame-radius) border border-slate-300 bg-control px-6 py-4 font-sans text-sm font-semibold text-slate-700 transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-blue-600 hover:bg-control-hover focus-visible:border-blue-600";
</script>

<svelte:window onkeydown={onKeydown} />

<TaskFrame heading="Is this a real Slovak word?" {seconds} onexpire={() => answer(null)}>
  <p
    class="m-0 text-center font-serif text-[clamp(2rem,6vw,3rem)] font-semibold text-slate-900"
    lang="sk"
  >
    {item.word}
  </p>

  <div class="mt-9 flex justify-center gap-4">
    <button class={buttonClass} type="button" onclick={() => answer(true)}>
      <svg
        class="size-7 fill-none stroke-emerald-600"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      Yes
    </button>

    <button class={buttonClass} type="button" onclick={() => answer(false)}>
      <svg
        class="size-7 fill-none stroke-rose-600"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
      No
    </button>
  </div>

  <p class="m-0 mt-6 text-center text-xs text-slate-500">
    Keys: <kbd class="font-sans font-semibold">Y</kbd> yes ·
    <kbd class="font-sans font-semibold">N</kbd> no
  </p>
</TaskFrame>
