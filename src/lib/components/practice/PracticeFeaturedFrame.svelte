<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import {
    practiceFeaturedFieldClass,
    practiceFeaturedOnDark,
    practiceGraphicId,
  } from "$lib/catalog/practice/motifs";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";
  import PracticeMotifField from "$lib/components/practice/PracticeMotifField.svelte";

  let {
    sheet,
    completed = false,
  }: {
    sheet: PracticeHubSheet;
    completed?: boolean;
  } = $props();

  const graphic = $derived(practiceGraphicId(sheet.set.id, sheet.set.lessonId));
  const onDark = $derived(practiceFeaturedOnDark(graphic));
</script>

<section class="border-b border-slate-200/80" aria-labelledby="continue-heading">
  <PageShell class="py-12 max-[600px]:py-10">
    <a
      class={[
        "group flex max-w-3xl overflow-hidden rounded-(--frame-radius) shadow-(--shadow-border)",
        "transition-[box-shadow,transform,scale] duration-200 ease-out",
        "hover:shadow-(--shadow-border-hover) active:scale-[0.98]",
        practiceFeaturedFieldClass[graphic],
      ]}
      href="/practice/{sheet.set.id}"
      aria-labelledby="continue-heading"
    >
      <div
        class="flex min-w-0 flex-1 flex-col px-8 py-8 max-[600px]:px-5 max-[600px]:py-6"
      >
        <h2
          id="continue-heading"
          class={[
            "m-0 font-serif text-2xl tracking-tight text-balance",
            onDark ? "text-white" : "text-slate-900",
          ]}
        >
          {sheet.set.title}
        </h2>

        <p
          class={[
            "m-0 mt-2 max-w-prose text-sm leading-relaxed text-pretty",
            onDark ? "text-blue-100" : "text-slate-700",
          ]}
        >
          {sheet.purpose}
        </p>

        <div
          class="mt-8 flex items-end gap-5 max-[600px]:flex-col max-[600px]:items-start"
        >
          <div class="relative min-w-0 flex-1">
            <div class="rounded-2xl bg-white px-5 py-4 shadow-(--shadow-border)">
              <PracticeDrillLine slovak={sheet.drill.slovak} />

              {#if sheet.drill.english}
                <p class="m-0 mt-1 text-sm text-pretty text-slate-500">
                  {sheet.drill.english}
                </p>
              {/if}
            </div>

            <span
              class="pointer-events-none absolute top-8 right-0 hidden translate-x-full border-y-8 border-l-8 border-y-transparent border-l-white min-[600px]:block"
              aria-hidden="true"
            ></span>
          </div>

          <PracticeMotifField
            setId={sheet.set.id}
            lessonId={sheet.set.lessonId}
            variant="stage"
          />
        </div>

        <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <span
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-(--control-radius) bg-rose-600 px-5 font-bold text-white transition-[background-color] duration-150 ease-out group-hover:bg-rose-700"
          >
            Continue
            <ArrowRight />
          </span>

          <p
            class={[
              "m-0 text-sm tabular-nums",
              onDark ? "text-blue-200" : "text-slate-600",
            ]}
          >
            {sheet.exerciseCount}
            {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
            {#if completed}
              · Done once
            {/if}
          </p>
        </div>
      </div>
    </a>
  </PageShell>
</section>
