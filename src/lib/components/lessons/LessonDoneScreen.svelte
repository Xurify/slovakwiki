<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import type { Lesson } from "$lib/content/learning-types";
  import { lessonPath } from "$lib/content/lessons";
  import { practiceSessionCount, type PracticeSet } from "$lib/content/practice";

  let {
    backHref,
    lesson,
    nextLesson,
    practiceSet,
    trackTitle,
  }: {
    backHref: string;
    lesson: Lesson;
    nextLesson: Lesson | null;
    practiceSet: PracticeSet | null;
    trackTitle: string;
  } = $props();
</script>

<div class="mx-auto w-full max-w-[560px]">
  <header>
    <p
      class="m-0 flex items-center gap-2 text-[0.64rem] font-bold tracking-[0.14em] text-emerald-700 uppercase"
    >
      <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          stroke="currentColor"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Lesson completed
    </p>

    <h1 class="m-0 mt-3">{lesson.title}</h1>
  </header>

  {#if nextLesson}
    <div class="mt-8">
      <Button variant="accent" class="px-7" href={lessonPath(nextLesson)}>
        Next lesson
        <ArrowRight />
      </Button>

      <p class="m-0 mt-3 font-serif text-sm text-slate-600">{nextLesson.title}</p>
    </div>
  {:else}
    <div class="mt-8">
      <Button variant="accent" class="px-7" href={backHref}>
        Back to {trackTitle}
        <ArrowRight />
      </Button>
    </div>
  {/if}

  <div
    class="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200/80 pt-5 text-sm"
  >
    {#if practiceSet}
      <TextLink href={`/practice/${practiceSet.id}`}>
        Practice this lesson ({practiceSessionCount(practiceSet)} questions)
      </TextLink>
    {/if}

    {#if nextLesson}
      <TextLink href={backHref}>{trackTitle}</TextLink>
    {/if}

    <TextLink href="/lessons">All lessons</TextLink>
  </div>
</div>
