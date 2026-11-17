<script lang="ts">
  import type { Lesson, LessonTrack } from "$lib/learning/types";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { panelClass } from "$lib/components/ui/system-ui";
  import { lessonCoverSrc, lessonPath } from "$lib/catalog/lessons";
  import { cx } from "$lib/ui/classes";

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
    /** Every lesson's cover is in the page, so the progress boot shows the right one before first paint. */
    lessons: Lesson[];
  } = $props();

  const phrase = $derived(focusLesson?.keyPhrases[0] ?? null);
</script>

{#if focusLesson && track}
  <section
    class={cx(
      panelClass,
      "grid overflow-hidden md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]",
    )}
    aria-labelledby="continue-heading"
    data-lessons-hydrate
  >
    <a
      class="relative block aspect-[2/1] border-slate-900/10 bg-subtle max-md:border-b md:aspect-auto md:min-h-72 md:border-r"
      href={lessonPath(focusLesson)}
      tabindex="-1"
      aria-hidden="true"
      data-continue-cta
    >
      {#each lessons as lesson (lesson.id)}
        <img
          src={lessonCoverSrc(lesson)}
          alt=""
          width="960"
          height="480"
          loading={lesson.id === focusLesson.id ? "eager" : "lazy"}
          decoding="async"
          class="absolute inset-0 size-full object-cover {lesson.id === focusLesson.id
            ? ''
            : 'hidden'}"
          data-continue-motif={lesson.id}
        />
      {/each}
    </a>

    <div class="flex flex-col p-5 sm:p-7">
      <a
        class="self-start text-sm text-slate-500 no-underline hover:text-blue-800 hover:underline"
        href="/lessons/{track.id}"
        data-continue-track-link
      >
        <span data-continue-track-title>{track.title}</span>
        · Lesson <span data-continue-lesson-number>{lessonNumber}</span>
        of <span data-continue-lesson-total>{trackLessonCount}</span>
      </a>

      <h2
        id="continue-heading"
        class="m-0 mt-2 font-serif text-2xl leading-tight tracking-tight text-balance text-slate-900 sm:text-[1.75rem]"
        data-continue-lesson-title
      >
        {focusLesson.title}
      </h2>

      <p
        class="m-0 mt-2.5 text-[0.9375rem] leading-relaxed text-pretty text-slate-600"
        data-continue-promise
      >
        {focusLesson.promise}
      </p>

      <p class="m-0 mt-5 border-l-2 border-slate-300 pl-3.5">
        <span
          class="block font-serif text-lg leading-snug text-slate-900"
          lang="sk"
          data-continue-phrase-sk
        >
          {phrase?.slovak ?? ""}
        </span>
        <span class="block text-sm text-slate-500" data-continue-phrase-en>
          {phrase?.english ?? ""}
        </span>
      </p>

      <div class="mt-auto flex items-center gap-4 pt-7">
        <Button
          href={lessonPath(focusLesson)}
          variant="accent"
          class="px-5 max-sm:flex-1"
          data-continue-cta
        >
          <span data-continue-cta-label>Start lesson</span>
          <ArrowRight />
        </Button>

        <span
          class="block h-1 min-w-12 flex-1 overflow-hidden rounded-full bg-slate-200 max-sm:hidden"
          aria-hidden="true"
        >
          <span
            class="block h-full rounded-full bg-blue-600"
            data-continue-progress-bar
            style:width="0%"
          ></span>
        </span>
      </div>
    </div>
  </section>
{/if}
