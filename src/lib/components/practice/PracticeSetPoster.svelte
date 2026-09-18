<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import { practiceGraphicId } from "$lib/catalog/practice/motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";

  let {
    sheet,
    size,
    cta,
  }: {
    sheet: PracticeHubSheet;
    size: "hero" | "peek" | "chip" | "thumb";
    cta?: string;
  } = $props();

  const graphic = $derived(practiceGraphicId(sheet.set.id, sheet.set.lessonId));
  const src = $derived(motifArtSrc(graphic));
  const showGloss = $derived(
    Boolean(sheet.drill.english) && (size === "hero" || size === "peek"),
  );

  const drillClass = $derived(
    size === "hero"
      ? "text-[clamp(1.85rem,3.4vw,3rem)] text-slate-900"
      : size === "peek"
        ? "text-[clamp(1.5rem,2.6vw,2.25rem)] text-slate-900"
        : "line-clamp-3 text-xl text-slate-900",
  );
</script>

{#snippet art(artClass: string)}
  <img
    {src}
    alt=""
    width="512"
    height="512"
    decoding="async"
    class="rounded-[inherit] object-cover {artClass}"
  />
{/snippet}

{#if size === "thumb"}
  <div
    class="relative isolate size-28 shrink-0 overflow-clip rounded-2xl ring-1 ring-slate-900/10 ring-inset"
  >
    {@render art("size-full")}
    <span class="sr-only">{sheet.set.title}</span>
  </div>
{:else if size === "chip"}
  <div class="relative isolate flex h-full min-h-32 flex-col overflow-clip rounded-2xl">
    {@render art("absolute inset-0 size-full")}
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper from-30% via-paper/75 to-paper/15"
    ></div>
    <div class="relative z-10 mt-auto flex flex-col p-4">
      <PracticeDrillLine slovak={sheet.drill.slovak} class={drillClass} />
      <p class="m-0 mt-2 text-xs text-slate-700">{sheet.set.title}</p>
    </div>
  </div>
{:else}
  <div
    class="isolate grid h-full min-h-[20rem] overflow-clip rounded-2xl bg-surface max-[600px]:min-h-64 min-[700px]:grid-cols-[minmax(0,1fr)_15rem]"
  >
    <div class="flex h-full min-h-0 flex-col p-6 max-[600px]:p-5">
      <p class="m-0 text-sm tabular-nums text-slate-700">
        {sheet.exerciseCount}
        {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
        {#if size === "hero"}
          <span data-featured-done hidden> · Done once</span>
        {/if}
      </p>

      <div class="mt-3 min-w-0">
        <PracticeDrillLine slovak={sheet.drill.slovak} class={drillClass} />

        {#if showGloss}
          <p class="m-0 mt-2 text-sm text-pretty text-slate-600">
            {sheet.drill.english}
          </p>
        {/if}
      </div>

      {#if cta}
        <span
          class="mt-auto inline-flex min-h-11 w-fit items-center justify-center rounded-(--control-radius) bg-blue-600 px-4 font-sans font-bold text-paper transition-[background-color] duration-150 ease-out group-hover:bg-blue-700"
          data-hero-cta={size === "hero" ? "" : undefined}
        >
          {cta}
        </span>
      {/if}
    </div>

    <div class="relative min-h-40 overflow-clip max-[699px]:order-first max-[699px]:h-40">
      {@render art("absolute inset-0 size-full")}
    </div>
  </div>
{/if}
