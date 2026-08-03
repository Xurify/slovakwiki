<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { onMount } from "svelte";
  import { emptyPracticeState, readPracticeState } from "$lib/client/practice-state";
  import {
    lessonPath,
    lessonTracks,
    lessons,
    lessonsForTrack,
  } from "$lib/content/lessons";

  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  const trackGroups = lessonTracks.map((track) => {
    const trackLessons = lessonsForTrack(track.id);

    return {
      track,
      lessons: trackLessons.map((lesson) => ({
        lesson,
        preview: lesson.keyPhrases[0] ?? lesson.scene[0],
      })),
    };
  });

  const featured = $derived.by(() => {
    const waiting = lessons.find(
      (lesson) => !practiceState.completedLessonIds.includes(lesson.id),
    );
    const lesson = waiting ?? lessons[0];
    if (!lesson) return null;

    const preview = lesson.keyPhrases[0] ?? lesson.scene[0];
    const trackTitle =
      lessonTracks.find((entry) => entry.id === lesson.track)?.title ?? lesson.track;

    return {
      lesson,
      preview,
      trackTitle,
      completed: practiceState.completedLessonIds.includes(lesson.id),
    };
  });

  const primaryHref = $derived(
    featured ? lessonPath(featured.lesson) : "/lessons/everyday",
  );

  const primaryLabel = $derived(
    !featured
      ? "Browse tracks"
      : featured.completed
        ? `Open again · ${featured.lesson.title}`
        : `Start · ${featured.lesson.title}`,
  );

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });
</script>

<main>
  <section
    class="relative overflow-hidden border-b border-slate-200/80"
    aria-label="Lessons"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden select-none font-serif text-[clamp(5rem,18vw,11rem)] font-semibold leading-none tracking-[-0.06em] text-slate-900/5"
      aria-hidden="true"
    >
      <span class="absolute left-[4%] top-[12%] -rotate-[9deg]" lang="sk">ľ</span>
      <span class="absolute right-[6%] top-[22%] rotate-[7deg]" lang="sk">č</span>
      <span class="absolute bottom-[8%] left-[18%] rotate-[5deg]" lang="sk">š</span>
      <span class="absolute bottom-[14%] right-[10%] -rotate-6" lang="sk">ť</span>
    </div>

    <PageShell class="relative py-16 max-[600px]:py-12">
      <p
        class="m-0 font-serif text-[clamp(3rem,9vw,5.75rem)] font-semibold leading-[0.9] tracking-tighter text-slate-900"
      >
        Lessons
      </p>

      <p
        class="mt-5 min-h-[2.75em] max-w-160 font-serif text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug text-slate-700"
      >
        Short scenes that teach a pattern, then ask you to use it yourself.
      </p>

      <div class="mt-9 flex flex-wrap items-center gap-4">
        <Button href={primaryHref} class="min-w-48 px-6">
          {#if hydrated}
            {primaryLabel}
          {:else}
            Start
          {/if}
          <ArrowRight />
        </Button>

        <TextLink href="/practice" class="inline-flex items-center gap-1.5">
          Prefer drills instead
        </TextLink>
      </div>

      <div
        class="mt-14 flex flex-wrap gap-x-10 gap-y-3 border-t border-slate-200/90 pt-6 text-sm text-slate-500"
      >
        <p class="m-0">
          <span class="font-serif text-xl font-semibold tabular-nums text-slate-900">
            {lessonTracks.length}
          </span>
          tracks
        </p>
        <p class="m-0">
          <span class="font-serif text-xl font-semibold tabular-nums text-slate-900">
            {lessons.length}
          </span>
          lessons
        </p>
        <p class="m-0">
          {#if hydrated}
            <span class="font-serif text-xl font-semibold tabular-nums text-slate-900">
              {practiceState.completedLessonIds.filter((id) =>
                lessons.some((lesson) => lesson.id === id),
              ).length}
            </span>
            finished once
          {:else}
            …
          {/if}
        </p>
      </div>
    </PageShell>
  </section>

  {#if featured}
    <section class="border-b border-slate-200/80" aria-labelledby="start-heading">
      <PageShell class="py-12 max-[600px]:py-10">
        <div
          class="overflow-hidden rounded-(--frame-radius) bg-paper shadow-(--shadow-border)"
        >
          <div
            class="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] max-[760px]:grid-cols-1"
          >
            <a
              class="group relative block px-8 py-9 transition-colors hover:bg-slate-50 max-[600px]:px-5 max-[600px]:py-7"
              href={lessonPath(featured.lesson)}
              aria-labelledby="start-heading"
            >
              <Eyebrow>Start here</Eyebrow>
              <p
                class="m-0 mt-4 font-serif text-[clamp(1.8rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-slate-900"
                lang="sk"
              >
                {featured.preview.slovak}
              </p>
              {#if featured.preview.english}
                <p class="m-0 mt-3 font-serif text-base italic text-slate-600">
                  {featured.preview.english}
                </p>
              {/if}
              <span
                class="mt-8 inline-flex items-center gap-2 text-sm font-bold text-rose-600"
              >
                Open lesson
                <ArrowRight />
              </span>
            </a>

            <div
              class="border-l border-slate-200 bg-slate-50 px-8 py-9 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:px-5 max-[760px]:py-6"
            >
              <p
                class="m-0 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-slate-500"
              >
                {featured.trackTitle}
              </p>
              <h2 id="start-heading" class="m-0 mt-2 font-serif text-2xl text-slate-900">
                {featured.lesson.title}
              </h2>
              <p class="m-0 mt-3 text-sm leading-relaxed text-slate-600">
                {featured.lesson.promise}
              </p>
              <p class="m-0 mt-5 text-xs text-slate-500">
                {featured.lesson.scene.length}
                {featured.lesson.scene.length === 1 ? "line" : "lines"}
                ·
                {featured.lesson.keyPhrases.length}
                {featured.lesson.keyPhrases.length === 1 ? "phrase" : "phrases"}
                {#if hydrated && featured.completed}
                  · Done once
                {/if}
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    </section>
  {/if}

  <section aria-labelledby="tracks-heading">
    <PageShell class="py-14 pb-20 max-[600px]:py-10 max-[600px]:pb-14">
      <div class="mb-10 max-w-160">
        <Eyebrow>Lesson tracks</Eyebrow>
        <h2 id="tracks-heading" class="m-0">Pick a scene to enter</h2>
        <p class="mt-3 m-0 text-[0.95rem] leading-[1.65] text-slate-600">
          Each lesson opens with a short conversation, lifts the phrases worth keeping,
          then asks you to rebuild them.
        </p>
      </div>

      <div class="grid gap-12">
        {#each trackGroups as group (group.track.id)}
          <section aria-labelledby={`track-${group.track.id}`}>
            <div class="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h3
                  id={`track-${group.track.id}`}
                  class="m-0 font-serif text-lg text-slate-900"
                >
                  {group.track.title}
                </h3>
                <p class="m-0 mt-1 text-sm text-slate-500">
                  {group.track.description}
                </p>
              </div>
              <p class="m-0 text-xs tabular-nums text-slate-500">
                {group.lessons.length}
                {group.lessons.length === 1 ? "lesson" : "lessons"}
              </p>
            </div>

            <ul class="m-0 grid list-none gap-4 p-0">
              {#each group.lessons as entry (entry.lesson.id)}
                {@const completed =
                  hydrated && practiceState.completedLessonIds.includes(entry.lesson.id)}
                <li>
                  <a
                    class="group grid h-full grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] overflow-hidden rounded-(--frame-radius) bg-surface/80 shadow-(--shadow-border) transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-surface hover:shadow-(--shadow-border-hover) max-[700px]:grid-cols-1"
                    href={lessonPath(entry.lesson)}
                  >
                    <div class="flex flex-col p-6 max-[600px]:p-5">
                      {#if entry.lesson.group}
                        <p
                          class="m-0 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-slate-500"
                        >
                          {entry.lesson.group}
                        </p>
                      {/if}

                      {#if entry.preview}
                        <p
                          class="m-0 font-serif text-[clamp(1.45rem,2.8vw,1.85rem)] font-semibold leading-snug tracking-tight text-slate-900"
                          class:mt-3={Boolean(entry.lesson.group)}
                          lang="sk"
                        >
                          {entry.preview.slovak}
                        </p>

                        {#if entry.preview.english}
                          <p class="m-0 mt-2 text-sm text-slate-500">
                            {entry.preview.english}
                          </p>
                        {/if}
                      {/if}

                      <div
                        class="mt-auto flex items-center justify-between gap-3 pt-6 text-sm"
                      >
                        <span class="text-slate-500">
                          {entry.lesson.keyPhrases.length}
                          {entry.lesson.keyPhrases.length === 1 ? "phrase" : "phrases"}
                          {#if completed}
                            · Done
                          {/if}
                        </span>
                        <span
                          class="inline-flex items-center gap-1.5 font-bold text-blue-800"
                        >
                          Open
                          <ArrowRight />
                        </span>
                      </div>
                    </div>

                    <div
                      class="border-l border-slate-200 bg-slate-50/70 p-6 max-[700px]:border-l-0 max-[700px]:border-t max-[600px]:p-5"
                    >
                      <strong class="font-serif text-lg tracking-tight text-blue-800">
                        {entry.lesson.title}
                      </strong>
                      <p class="m-0 mt-2 text-sm leading-relaxed text-slate-600">
                        {entry.lesson.promise}
                      </p>
                    </div>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    </PageShell>
  </section>
</main>
