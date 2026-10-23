<script lang="ts">
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { chipClass, eyebrowMutedClass, panelClass } from "$lib/components/ui/system-ui";
  import {
    ACCENT_SLIP_INFO,
    NEXT_STEPS,
    STUDY_AREA_INFO,
    type AreaSummary,
    type Diagnosis,
  } from "$lib/level-test/diagnose";
  import type { CefrLevel } from "$lib/level-test/scale";

  import LevelTestRadar from "./LevelTestRadar.svelte";

  let { diagnosis, level }: { diagnosis: Diagnosis; level: CefrLevel } = $props();

  /** A spider needs three legs; fewer areas read better as the table alone. */
  const MIN_AREAS_FOR_CHART = 3;

  const strong = $derived(new Set(diagnosis.strengths.map((summary) => summary.area)));
  const weak = $derived(new Set(diagnosis.gaps.map((gap) => gap.area)));

  function counted(summary: AreaSummary): string {
    return `${summary.percent}% right over ${summary.total} answers`;
  }
</script>

{#if diagnosis.areas.length}
  <section aria-labelledby="level-test-areas" class="grid gap-3">
    <h3 id="level-test-areas" class={eyebrowMutedClass}>Strengths and gaps</h3>

    <div
      class="{panelClass} grid items-center gap-6 px-6 py-6 max-[560px]:px-4"
      class:md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]={diagnosis.areas.length >=
        MIN_AREAS_FOR_CHART}
    >
      {#if diagnosis.areas.length >= MIN_AREAS_FOR_CHART}
        <LevelTestRadar areas={diagnosis.areas} center={diagnosis.center} />
      {/if}

      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-xs text-slate-500">
            <th class="py-2 pr-3 font-semibold" scope="col">Area</th>
            <th class="px-3 py-2 font-semibold" scope="col">Level</th>
            <th class="py-2 pl-3 text-right font-semibold" scope="col">Right</th>
          </tr>
        </thead>

        <tbody>
          {#each diagnosis.areas as summary (summary.area)}
            <tr class="border-b border-slate-200 last:border-b-0">
              <th class="py-2 pr-3 text-left font-semibold text-slate-900" scope="row">
                {STUDY_AREA_INFO[summary.area].label}

                {#if strong.has(summary.area)}
                  <span class="ml-1 text-xs font-semibold text-emerald-700">Strong</span>
                {:else if weak.has(summary.area)}
                  <span class="ml-1 text-xs font-semibold text-rose-700">To work on</span>
                {/if}
              </th>
              <td class="px-3 py-2 whitespace-nowrap text-slate-700">
                {summary.level} · <span class="tabular-nums">{summary.score}</span>
              </td>
              <td
                class="py-2 pl-3 text-right whitespace-nowrap text-slate-600 tabular-nums"
              >
                {summary.percent}%
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <p class="m-0 px-1 text-xs text-slate-500">
      Each area starts at your overall level and moves with your answers, so a single slip
      does not count as a gap.
    </p>
  </section>
{/if}

{#if diagnosis.strengths.length}
  <section aria-labelledby="level-test-strengths" class="grid gap-3">
    <h3 id="level-test-strengths" class={eyebrowMutedClass}>What you do well</h3>

    <ul class="{panelClass} m-0 grid list-none p-0">
      {#each diagnosis.strengths as summary (summary.area)}
        <li class="grid gap-0.5 border-b border-slate-200 px-5 py-3 last:border-b-0">
          <p class="m-0 font-semibold text-slate-900">
            {STUDY_AREA_INFO[summary.area].label}
            <span class="font-normal text-slate-500">
              · {summary.level} · {counted(summary)}</span
            >
          </p>
          <p class="m-0 text-sm text-slate-600">
            Above your overall level: {STUDY_AREA_INFO[summary.area].what}.
          </p>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<section aria-labelledby="level-test-study" class="grid gap-3">
  <h3 id="level-test-study" class={eyebrowMutedClass}>What to study next</h3>

  {#if diagnosis.gaps.length}
    <ol class="{panelClass} m-0 grid list-none p-0">
      {#each diagnosis.gaps as gap, index (gap.area)}
        <li class="grid gap-3 border-b border-slate-200 px-5 py-4 last:border-b-0">
          <div class="grid gap-0.5">
            <p class="m-0 font-semibold text-slate-900">
              {index + 1}. {STUDY_AREA_INFO[gap.area].label}

              {#if gap.summary}
                <span class="font-normal text-slate-500">
                  · {gap.summary.level} · {counted(gap.summary)}</span
                >
              {/if}
            </p>
            <p class="m-0 text-sm text-slate-600">
              {gap.summary
                ? `Below your overall level: ${STUDY_AREA_INFO[gap.area].what}.`
                : `Your writing or speaking slipped here more than once: ${STUDY_AREA_INFO[gap.area].what}.`}
            </p>
          </div>

          {#if gap.area === "accents" && diagnosis.accentSlips.length}
            <ul class="m-0 grid list-none gap-1 p-0 text-sm text-slate-700">
              {#each diagnosis.accentSlips as slip (slip.kind)}
                <li>
                  {ACCENT_SLIP_INFO[slip.kind].label}:
                  <span class="tabular-nums">{slip.count}</span>
                  {slip.count === 1 ? "slip" : "slips"}
                </li>
              {/each}
            </ul>
          {/if}

          {#if gap.examples.length}
            <ul
              class="m-0 grid list-none overflow-hidden rounded-(--control-radius) p-0 text-sm ring-1 ring-slate-200 ring-inset"
            >
              {#each gap.examples as example, exampleIndex (exampleIndex)}
                <li
                  class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-slate-200 bg-subtle px-3 py-2 last:border-b-0"
                >
                  <span class="font-serif text-slate-900" lang="sk"
                    >{example.expected}</span
                  >
                  <span class="text-slate-500">
                    you wrote
                    <span class="font-serif text-rose-700 line-through" lang="sk"
                      >{example.given || "nothing"}</span
                    >
                  </span>

                  {#if example.note}
                    {#if example.href}
                      <TextLink class="ml-auto" href={example.href} lang="sk"
                        >{example.note}</TextLink
                      >
                    {:else}
                      <span class="ml-auto text-xs text-slate-500" lang="sk"
                        >{example.note}</span
                      >
                    {/if}
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}

          <ul class="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
            {#each gap.links as link (link.href)}
              <li>
                <TextLink href={link.href}>{link.label}</TextLink>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ol>
  {:else}
    <div class="{panelClass} grid gap-3 px-5 py-4">
      <p class="m-0 text-sm text-slate-700">
        No area sits below your overall level. Next steps for {level}:
      </p>

      <ul class="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
        {#each NEXT_STEPS[level] as link (link.href)}
          <li>
            <TextLink href={link.href}>{link.label}</TextLink>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</section>

{#if diagnosis.wordsToLearn.length}
  <section aria-labelledby="level-test-words" class="grid gap-3">
    <h3 id="level-test-words" class={eyebrowMutedClass}>
      Real words you marked as made up
    </h3>

    <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
      {#each diagnosis.wordsToLearn as word (word.text)}
        <li>
          {#if word.href}
            <a class={chipClass(false)} href={word.href} title={word.english}>
              <span lang="sk">{word.text}</span>
            </a>
          {:else}
            <span class={chipClass(false)} title={word.english} lang="sk"
              >{word.text}</span
            >
          {/if}
        </li>
      {/each}
    </ul>

    {#if diagnosis.fakeWordsAccepted >= 2}
      <p class="m-0 px-1 text-xs text-slate-500">
        You also took {diagnosis.fakeWordsAccepted} made-up words for real ones. Each counts
        as a mistake, the same as a missed real word.
      </p>
    {/if}
  </section>
{/if}
