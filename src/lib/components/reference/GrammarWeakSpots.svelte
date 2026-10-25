<script lang="ts">
  import { onMount } from "svelte";

  import { grammarHeadingClass } from "$lib/components/reference/grammar-topic-ui";
  import { localDayKey, readReviewMemory } from "$lib/practice/review-memory";
  import {
    weakSpotsWorstFirst,
    type PracticeRule,
    type WeakSpot,
  } from "$lib/practice/weak-spots";

  let { rules }: { rules: PracticeRule[] } = $props();

  let weakSpots = $state<WeakSpot[]>([]);

  onMount(() => {
    const memory = readReviewMemory(localStorage);
    weakSpots = weakSpotsWorstFirst(memory, rules, localDayKey(new Date()));
  });

  const settledTone = "text-emerald-700";
  const waitingTone = "text-slate-500";

  function reviewStatus(spot: WeakSpot): { label: string; tone: string } {
    if (spot.missed === 0) return { label: "Solid", tone: settledTone };
    if (spot.daysUntilReview === null) return { label: "Learned", tone: settledTone };
    if (spot.daysUntilReview === 0) return { label: "Due today", tone: "text-rose-700" };
    if (spot.daysUntilReview === 1) return { label: "Back tomorrow", tone: waitingTone };
    return { label: `Back in ${spot.daysUntilReview} days`, tone: waitingTone };
  }
</script>

{#if weakSpots.length > 0}
  <section id="weak-spots" class="mt-8 animate-rise" aria-labelledby="weak-spots-heading">
    <h2 id="weak-spots-heading" class={grammarHeadingClass}>Your weak spots</h2>

    <p class="m-0 mt-1.5 max-w-[75ch] text-sm leading-relaxed text-slate-600">
      From your practice on this device. The rules you miss most are at the top.
    </p>

    <ul
      class="m-0 mt-3 list-none divide-y divide-slate-200 rounded-(--frame-radius) bg-surface p-0 ring-1 ring-slate-200 ring-inset"
    >
      {#each weakSpots as spot (spot.formId)}
        {@const missedPercent = Math.round((spot.missed / spot.seen) * 100)}
        {@const status = reviewStatus(spot)}

        <li class="flex items-center gap-4 px-4 py-3">
          <div class="min-w-0 flex-1">
            <p class="m-0 text-sm font-semibold text-pretty text-slate-900">
              {spot.label}
            </p>

            <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                class="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-emerald-100"
                aria-hidden="true"
              >
                <span class="block h-full bg-rose-500" style:width="{missedPercent}%"
                ></span>
              </span>

              <span class="text-xs text-slate-600 tabular-nums">
                Missed {spot.missed} of {spot.seen}
              </span>

              <span class="text-xs font-semibold {status.tone}">{status.label}</span>
            </div>
          </div>

          <a
            class="shrink-0 text-sm font-semibold text-blue-800 no-underline hover:underline"
            href={spot.practiceHref}
          >
            Practice
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}
