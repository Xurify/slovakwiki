<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import { practiceGraphicId } from "$lib/catalog/practice/motifs";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";

  let {
    sheets,
    featuredId,
  }: {
    sheets: PracticeHubSheet[];
    featuredId: string;
  } = $props();
</script>

<section aria-label="Start here">
  <PageShell class="py-8 max-[600px]:py-6">
    <div data-practice-hydrate>
      {#each sheets as candidate (candidate.set.id)}
        {@const graphic = practiceGraphicId(candidate.set.id, candidate.set.lessonId)}
        {@const src = motifArtSrc(graphic)}

        <article
          class="grid overflow-clip rounded-2xl bg-surface ring-1 ring-slate-200/80 ring-inset max-[699px]:grid-rows-[9rem_auto] min-[700px]:grid-cols-[minmax(0,1fr)_13rem]"
          data-featured-sheet={candidate.set.id}
          data-featured-lesson={candidate.set.lessonId}
          hidden={candidate.set.id !== featuredId}
        >
          <div class="flex min-h-0 flex-col gap-4 p-6 max-[600px]:p-5">
            <Eyebrow tone="muted" compact class="mb-0">Start here</Eyebrow>

            <div class="min-w-0">
              <h2
                class="m-0 font-serif text-[clamp(1.45rem,2.2vw,1.85rem)] tracking-tight text-balance text-slate-900"
              >
                {candidate.set.title}
              </h2>

              <p
                class="m-0 mt-2 max-w-xl text-[0.95rem] leading-relaxed text-pretty text-slate-600"
              >
                {candidate.purpose}
              </p>

              <p class="m-0 mt-3 text-xs tabular-nums text-slate-500">
                {candidate.exerciseCount}
                {candidate.exerciseCount === 1 ? "exercise" : "exercises"}
              </p>
            </div>

            {#if candidate.drill.slovak}
              <div class="min-w-0">
                <PracticeDrillLine
                  slovak={candidate.drill.slovak}
                  class="text-lg text-slate-700"
                />

                {#if candidate.drill.english}
                  <p class="m-0 mt-1 text-sm text-pretty text-slate-500">
                    {candidate.drill.english}
                  </p>
                {/if}
              </div>
            {/if}

            <Button
              class="mt-auto w-fit"
              href="/practice/{candidate.set.id}"
              variant="accent"
              data-hero-cta=""
            >
              Start set
            </Button>
          </div>

          <div
            class="relative min-h-36 overflow-clip max-[699px]:order-first max-[699px]:h-36"
          >
            <img
              {src}
              alt=""
              width="512"
              height="512"
              decoding="async"
              class="absolute inset-0 size-full object-cover"
            />
          </div>
        </article>
      {/each}
    </div>
  </PageShell>
</section>
