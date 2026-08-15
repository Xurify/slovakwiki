<script lang="ts">
  import type { Lesson, LessonTrack } from "$lib/learning/types";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LessonMotif from "$lib/components/lessons/LessonMotif.svelte";
  import { lessonPath } from "$lib/catalog/lessons";
  import { lessonMotifId } from "$lib/lesson-story/lesson-motifs";

  let {
    focusLesson,
    lessonNumber,
    trackLessonCount,
    track,
    lessons,
  }: {
    focusLesson: Lesson | null;
    lessonNumber: number;
    trackLessonCount: number;
    track: LessonTrack | null;
    /** All lessons — pre-render motifs so boot can reveal the focus one without FOUC. */
    lessons: Lesson[];
  } = $props();

  const phrase = $derived(focusLesson?.keyPhrases[0] ?? null);
</script>

{#if focusLesson && track}
  <section
    class="overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
    aria-labelledby="continue-heading"
    data-lessons-hydrate
  >
    <div class="border-b border-slate-200/70 px-5 pt-5 pb-4">
      <div class="flex flex-col items-center gap-3">
        <div class="relative size-14 shrink-0">
          {#each lessons as lesson (lesson.id)}
            <span
              class="absolute inset-0 flex items-center justify-center {lesson.id ===
              focusLesson.id
                ? ''
                : 'hidden'}"
              data-continue-motif={lesson.id}
            >
              <LessonMotif motif={lessonMotifId(lesson.id)} size="lg" />
            </span>
          {/each}
        </div>

        <div class="min-w-0 text-center">
          <p
            class="m-0 min-h-[1.4rem] font-serif text-lg leading-snug font-semibold tracking-tight text-balance text-slate-900"
            lang="sk"
            data-continue-phrase-sk
          >
            {phrase?.slovak ?? ""}
          </p>

          <p
            class="m-0 mt-1 min-h-[1.2rem] text-sm leading-snug text-pretty text-slate-600"
            data-continue-phrase-en
          >
            {phrase?.english ?? ""}
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-col px-5 pt-5 pb-5">
      <p class="m-0">
        <a
          class="text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase no-underline hover:text-blue-800 hover:underline"
          href="/lessons/{track.id}"
          data-continue-track-link
        >
          <span data-continue-track-title>{track.title}</span>
        </a>
      </p>

      <h2
        id="continue-heading"
        class="m-0 mt-2 min-h-[1.75rem] font-serif text-xl leading-snug tracking-tight text-balance text-slate-900"
        data-continue-lesson-title
      >
        {focusLesson.title}
      </h2>

      <p
        class="m-0 mt-2 min-h-[2.5rem] text-sm leading-relaxed text-pretty text-slate-600"
        data-continue-promise
      >
        {focusLesson.promise}
      </p>

      <div class="mt-4">
        <p class="m-0 text-xs tabular-nums text-slate-500">
          Lesson <span data-continue-lesson-number>{lessonNumber}</span>
          of <span data-continue-lesson-total>{trackLessonCount}</span>
        </p>

        <span class="mt-2 block h-1 overflow-hidden rounded-full bg-slate-200">
          <span
            class="block h-full rounded-full bg-blue-600"
            data-continue-progress-bar
            style:width="0%"
          ></span>
        </span>
      </div>

      <div class="mt-5 flex flex-col gap-3">
        <Button
          href={lessonPath(focusLesson)}
          variant="accent"
          class="w-full px-4"
          data-continue-cta
        >
          <span data-continue-cta-label>Continue</span>
          <ArrowRight />
        </Button>

        <a
          class="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline"
          href="/lessons/{track.id}"
          data-continue-track-link
        >
          View track
          <ArrowRight />
        </a>
      </div>
    </div>
  </section>
{/if}
