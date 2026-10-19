<script lang="ts">
  import { onMount, tick } from "svelte";

  import { eyebrowClass, eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import LessonBackButton from "$lib/components/lessons/LessonBackButton.svelte";
  import LessonDoneAction from "$lib/components/lessons/LessonDoneAction.svelte";
  import LessonDoneSection from "$lib/components/lessons/LessonDoneSection.svelte";
  import MarkedNote from "$lib/components/lessons/MarkedNote.svelte";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import { answerGloss } from "$lib/components/practice/practice-session-ui";
  import type { LessonGradeResult } from "$lib/components/lessons/lesson-review";
  import type { LessonStep } from "$lib/learning/lesson-steps";
  import type { GradedLessonExercise, Lesson } from "$lib/learning/types";
  import { lessonPath } from "$lib/catalog/lessons";
  import { practiceSessionCount, type PracticeSet } from "$lib/catalog/practice";

  let {
    answers,
    backHref,
    lesson,
    nextLesson,
    onback,
    onRestart,
    practiceSet,
    steps,
    trackTitle,
  }: {
    answers: Record<string, LessonGradeResult>;
    backHref: string;
    lesson: Lesson;
    nextLesson: Lesson | null;
    onback: () => void;
    onRestart: () => void;
    practiceSet: PracticeSet | null;
    steps: LessonStep[];
    trackTitle: string;
  } = $props();

  type CheckResult = {
    beatIndex: number;
    exercise: GradedLessonExercise;
    number: number;
    result: LessonGradeResult;
  };

  type BeatSummary = {
    correct: number;
    id: string;
    total: number;
    title: string;
  };

  let footerEl: HTMLDivElement | undefined = $state();

  const checks = $derived.by((): CheckResult[] => {
    const rows: CheckResult[] = [];
    for (const step of steps) {
      if (step.kind !== "check" || step.exercise.type === "personal") continue;
      const result = answers[step.id];
      if (!result) continue;
      rows.push({
        beatIndex: step.beatIndex,
        exercise: step.exercise,
        number: rows.length + 1,
        result,
      });
    }
    return rows;
  });

  const misses = $derived(checks.filter((row) => !row.result.correct));
  const checkCount = $derived(checks.length);
  const correctCount = $derived(checkCount - misses.length);
  const accentsCount = $derived(
    checks.filter((row) => row.result.correct && row.result.grade === "accents").length,
  );
  const perfect = $derived(checkCount > 0 && misses.length === 0);
  const practiceFirst = $derived(misses.length > 0 && practiceSet !== null);

  const beats = $derived<BeatSummary[]>(
    lesson.beats.map((beat, index) => {
      const inBeat = checks.filter((row) => row.beatIndex === index);
      return {
        correct: inBeat.filter((row) => row.result.correct).length,
        id: beat.id,
        total: inBeat.length,
        title: beat.title,
      };
    }),
  );

  const headline = $derived.by(() => {
    if (checkCount === 0) return "Lesson complete";
    if (perfect) return `All ${checkCount} correct`;
    return `${correctCount} of ${checkCount} correct`;
  });

  const subline = $derived.by(() => {
    if (checkCount === 0) return lesson.promise;
    if (perfect && accentsCount > 0) {
      return accentsCount === 1
        ? "One answer slipped on accents. Everything else landed first time."
        : `${accentsCount} answers slipped on accents. Everything else landed first time.`;
    }
    if (perfect) return "Every check right on the first try.";

    const them =
      misses.length === 1 ? "the one you missed" : `the ${misses.length} you missed`;
    return practiceSet
      ? `Go over ${them} below, then lock the pattern in with practice (${practiceSessionCount(practiceSet)} questions).`
      : `Go over ${them} below before moving on.`;
  });

  const forwardHref = $derived(nextLesson ? lessonPath(nextLesson) : backHref);
  const practiceHref = $derived(practiceSet ? `/practice/${practiceSet.id}` : null);

  onMount(async () => {
    await tick();
    footerEl
      ?.querySelector<HTMLElement>("[data-done-primary]")
      ?.focus({ preventScroll: true });
  });
</script>

{#snippet forwardLabel()}
  {#if nextLesson}
    Next lesson
  {:else}
    <span class="max-sm:hidden">Back to</span>
    {trackTitle}
  {/if}
{/snippet}

{#snippet missRow(row: CheckResult)}
  {@const revealed = row.result.revealed === true}
  {@const promptLang = row.exercise.promptLang}

  <li class="grid gap-3 border-b border-slate-200/70 px-4 py-4 last:border-b-0 sm:px-5">
    <div class="flex items-baseline gap-2.5">
      <span class="w-4 shrink-0 text-xs font-semibold tabular-nums text-slate-400">
        {row.number}
      </span>

      <p
        class="m-0 min-w-0 flex-1 text-sm font-medium leading-snug text-slate-700"
        lang={promptLang === "sk" ? "sk" : "en"}
      >
        {row.exercise.prompt}
      </p>

      {#if revealed}
        <span class="shrink-0 text-xs text-slate-500">Revealed</span>
      {/if}
    </div>

    <div class="sm:pl-6.5">
      <PracticeExerciseFeedback
        attempt={row.result.attempt && !revealed ? row.result.attempt : undefined}
        correction={row.result.correction}
        english={answerGloss(row.result.english, row.exercise.prompt, promptLang)}
        why={row.result.why}
        grade="incorrect"
        {revealed}
        markWords={row.result.markWords}
        showCorrection={row.result.showCorrection ?? true}
        density="compact"
        correctionLabelTone="emerald"
      />
    </div>
  </li>
{/snippet}

{#snippet beatRow(beat: BeatSummary)}
  {@const missed = beat.total > 0 && beat.correct < beat.total}

  <li
    class="flex items-baseline gap-3 border-b border-slate-200/70 px-4 py-3 last:border-b-0 sm:px-5"
  >
    <span
      class={[
        "grid size-4 shrink-0 translate-y-0.5 place-items-center rounded-full",
        missed ? "bg-rose-400/15 text-rose-700" : "bg-emerald-600/12 text-emerald-700",
      ]}
      aria-hidden="true"
    >
      {#if missed}
        <span class="size-1.5 rounded-full bg-current"></span>
      {:else}
        <svg class="size-2.5" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </span>

    <p class="m-0 min-w-0 flex-1 font-serif text-base leading-snug text-slate-900">
      <MarkedNote text={beat.title} markClass="" />
    </p>

    {#if beat.total > 0}
      <span
        class={[
          "shrink-0 text-xs font-semibold tabular-nums",
          missed ? "text-rose-700" : "text-slate-400",
        ]}
      >
        {beat.correct}/{beat.total}
      </span>
    {/if}
  </li>
{/snippet}

<div
  class="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent"
>
  <div class="mx-auto w-full max-w-[640px] px-4 py-8 sm:px-8 sm:py-10">
    <header class="animate-rise">
      <p class="{eyebrowClass} inline-flex items-center gap-1.5 text-emerald-700">
        <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            stroke="currentColor"
            stroke-width="2.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Lesson complete
      </p>

      <h2
        class="m-0 mt-2 font-serif text-xl tracking-tight text-pretty text-slate-900 sm:text-2xl"
      >
        {headline}
      </h2>

      <p class="m-0 mt-2 max-w-[56ch] text-sm leading-relaxed text-pretty text-slate-600">
        {subline}
      </p>
    </header>

    <div class="mt-8 grid gap-8">
      {#if misses.length > 0}
        <LessonDoneSection
          id="lesson-review-heading"
          title="To review"
          count={misses.length}
        >
          <ol class="{dataPanelClass} m-0 list-none p-0">
            {#each misses as row (row.exercise.id)}
              {@render missRow(row)}
            {/each}
          </ol>
        </LessonDoneSection>
      {/if}

      {#if lesson.pattern}
        <LessonDoneSection id="lesson-pattern-heading" title="Takeaway">
          <p class="m-0 font-serif text-lg font-semibold leading-snug text-slate-900">
            {lesson.pattern.title}
          </p>

          <p
            class="m-0 mt-2 max-w-[62ch] text-[1.02rem] leading-relaxed text-pretty text-slate-800"
          >
            <MarkedNote text={lesson.pattern.body} />
          </p>
        </LessonDoneSection>
      {/if}

      <LessonDoneSection id="lesson-covered-heading" title="What you covered">
        <ul class="{dataPanelClass} m-0 list-none p-0">
          {#each beats as beat (beat.id)}
            {@render beatRow(beat)}
          {/each}
        </ul>
      </LessonDoneSection>

      {#if lesson.referenceLinks.length > 0}
        <section
          class="grid grid-cols-[7.5rem_1fr] items-baseline gap-x-4 max-[560px]:grid-cols-1 max-[560px]:gap-y-1.5"
          aria-labelledby="lesson-deeper-heading"
        >
          <h3 id="lesson-deeper-heading" class={eyebrowMutedClass}>Go deeper</h3>

          <ul class="m-0 flex list-none flex-wrap items-baseline gap-x-5 gap-y-2 p-0">
            {#each lesson.referenceLinks as link (link.href)}
              <li>
                <TextLink href={link.href}>{link.label}</TextLink>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <div
        class={[
          "flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-slate-200/80 pt-5",
          lesson.referenceLinks.length > 0 && "min-[561px]:pl-34",
        ]}
      >
        <TextLink onclick={onRestart}>Replay lesson</TextLink>

        {#if nextLesson}
          <TextLink href={backHref}>{trackTitle}</TextLink>
        {/if}

        <TextLink href="/lessons">All lessons</TextLink>
      </div>
    </div>
  </div>
</div>

<div
  bind:this={footerEl}
  class="shrink-0 border-t border-slate-200 bg-paper px-4 py-4 sm:px-8 sm:py-5"
>
  <div class="mx-auto flex max-w-[640px] items-center justify-end gap-2">
    <LessonBackButton onclick={onback} />

    {#if practiceFirst && practiceHref}
      <LessonDoneAction href={forwardHref}>
        {@render forwardLabel()}
      </LessonDoneAction>

      <LessonDoneAction href={practiceHref} primary>Practice</LessonDoneAction>
    {:else}
      {#if practiceHref}
        <LessonDoneAction href={practiceHref}>Practice</LessonDoneAction>
      {/if}

      <LessonDoneAction href={forwardHref} primary>
        {@render forwardLabel()}
      </LessonDoneAction>
    {/if}
  </div>
</div>
