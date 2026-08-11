<script lang="ts">
  import type { Lesson, LessonTrack } from "$lib/content/learning-types";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LessonMotif from "$lib/components/lessons/LessonMotif.svelte";
  import { lessonPath } from "$lib/content/lessons";
  import { lessonMotifId } from "$lib/lessons/lesson-motifs";

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
    <div
      class="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-stretch max-[720px]:grid-cols-1"
    >
      <div
        class="flex min-h-[14rem] flex-col justify-center gap-5 bg-subtle px-7 py-8 max-[600px]:min-h-[11rem] max-[600px]:px-5 max-[600px]:py-6"
      >
        <div class="relative min-h-28 w-full max-w-[14rem]">
          {#each lessons as lesson (lesson.id)}
            <span
              class="absolute inset-x-0 top-0 {lesson.id === focusLesson.id
                ? ''
                : 'hidden'}"
              data-continue-motif={lesson.id}
            >
              <LessonMotif motif={lessonMotifId(lesson.id)} size="lg" />
            </span>
          {/each}
        </div>

        <div>
          <p
            class="m-0 font-serif text-[clamp(1.35rem,2.8vw,1.85rem)] leading-[1.15] font-semibold tracking-tight text-balance text-slate-900"
            lang="sk"
            data-continue-phrase-sk
          >
            {phrase?.slovak ?? ""}
          </p>

          <p
            class="m-0 mt-1.5 min-h-[1.5rem] font-serif text-base text-pretty text-slate-600"
            data-continue-phrase-en
          >
            {phrase?.english ?? ""}
          </p>
        </div>
      </div>

      <div
        class="flex min-h-[14rem] flex-col px-7 py-8 max-[600px]:min-h-0 max-[600px]:px-5 max-[600px]:py-6"
      >
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
          class="m-0 mt-2 min-h-[2rem] font-serif text-2xl tracking-tight text-balance text-slate-900"
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

        <div class="mt-5">
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

        <div
          class="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6 max-[600px]:flex-col max-[600px]:items-stretch"
        >
          <Button
            href={lessonPath(focusLesson)}
            variant="accent"
            class="px-6 max-[600px]:w-full"
            data-continue-cta
          >
            <span data-continue-cta-label>Continue</span>
            <ArrowRight />
          </Button>

          <a
            class="inline-flex items-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline max-[600px]:justify-center"
            href="/lessons/{track.id}"
            data-continue-track-link
          >
            View track
            <ArrowRight />
          </a>
        </div>
      </div>
    </div>
  </section>
{/if}
