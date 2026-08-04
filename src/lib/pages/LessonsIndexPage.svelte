<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
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

  const trackGroups = lessonTracks.map((track) => ({
    track,
    lessons: lessonsForTrack(track.id).map((lesson) => ({
      lesson,
      outcomes: lesson.keyPhrases.slice(0, 3),
      exerciseCount: lesson.exercises.filter((exercise) => exercise.type !== "personal")
        .length,
    })),
  }));

  const doneIds = $derived(new Set(practiceState.completedLessonIds));

  const trackProgress = $derived(
    trackGroups.map((group) => ({
      id: group.track.id,
      title: group.track.title,
      total: group.lessons.length,
      done: group.lessons.filter((entry) => doneIds.has(entry.lesson.id)).length,
    })),
  );

  const doneTotal = $derived(lessons.filter((lesson) => doneIds.has(lesson.id)).length);

  const nextLesson = $derived(
    lessons.find((lesson) => !doneIds.has(lesson.id)) ?? lessons[0] ?? null,
  );

  const primaryHref = $derived(nextLesson ? lessonPath(nextLesson) : "/lessons/everyday");

  const primaryLabel = $derived(
    !nextLesson
      ? "Browse lessons"
      : doneIds.has(nextLesson.id)
        ? `Open again · ${nextLesson.title}`
        : doneTotal > 0
          ? `Continue · ${nextLesson.title}`
          : `Start · ${nextLesson.title}`,
  );

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });
</script>

<main class="py-12 pb-24 max-[600px]:py-8">
  <PageShell class="max-w-[1060px]">
    <header class="max-w-[640px]">
      <Eyebrow>Curriculum</Eyebrow>
      <h1>Lessons</h1>
      <Lead>Short scenes that teach one pattern, then ask you to use it.</Lead>

      <div class="mt-7 flex flex-wrap items-center gap-4">
        <Button href={primaryHref} class="px-6">
          {#if hydrated}
            {primaryLabel}
          {:else}
            Start learning
          {/if}
          <ArrowRight />
        </Button>

        <TextLink href="/practice">Prefer drills instead</TextLink>
      </div>
    </header>

    <div
      class="mt-14 grid gap-14 min-[940px]:grid-cols-[15rem_minmax(0,1fr)] min-[940px]:gap-16"
    >
      <aside class="min-[940px]:sticky min-[940px]:top-24 min-[940px]:self-start">
        <p
          class="m-0 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-slate-500"
        >
          Your path
        </p>

        <ul class="m-0 mt-4 list-none space-y-4 p-0">
          {#each trackProgress as entry (entry.id)}
            <li>
              <a class="group block no-underline" href={`#track-${entry.id}`}>
                <span
                  class="flex items-baseline justify-between gap-3 text-sm text-slate-700 group-hover:text-blue-800"
                >
                  <span class="font-medium">{entry.title}</span>
                  <span class="shrink-0 tabular-nums text-xs text-slate-500">
                    {hydrated ? entry.done : 0}/{entry.total}
                  </span>
                </span>

                <span
                  class="mt-2 block h-[3px] w-full overflow-hidden rounded-full bg-slate-200"
                >
                  <span
                    class="block h-full rounded-full bg-blue-800 transition-[width] duration-500"
                    style={`width: ${entry.total ? ((hydrated ? entry.done : 0) / entry.total) * 100 : 0}%`}
                  ></span>
                </span>
              </a>
            </li>
          {/each}
        </ul>

        <p class="m-0 mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
          {hydrated ? doneTotal : 0} of {lessons.length} lessons done
        </p>
      </aside>

      <div class="space-y-16">
        {#each trackGroups as group (group.track.id)}
          <section class="scroll-mt-24" aria-labelledby={`track-${group.track.id}`}>
            <h2 id={`track-${group.track.id}`} class="m-0 text-xl">
              {group.track.title}
            </h2>

            <p class="m-0 mt-1 text-sm text-slate-500">
              {group.track.description}
            </p>

            <ol class="m-0 mt-6 list-none space-y-3 p-0">
              {#each group.lessons as entry, index (entry.lesson.id)}
                {@const completed = hydrated && doneIds.has(entry.lesson.id)}

                <li>
                  <a
                    class="group grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-lg border-l-2 border-slate-200 py-4 pl-4 pr-4 -ml-px no-underline transition-colors hover:border-blue-800 hover:bg-[color-mix(in_srgb,var(--surface-subtle)_45%,transparent)] max-[560px]:grid-cols-1 max-[560px]:gap-y-2"
                    href={lessonPath(entry.lesson)}
                  >
                    <span
                      class="pt-0.5 font-sans text-xs font-bold tabular-nums text-slate-400 max-[560px]:hidden"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div class="min-w-0">
                      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <strong class="font-serif text-lg text-blue-800">
                          {entry.lesson.title}
                        </strong>

                        {#if completed}
                          <span class="text-xs font-medium text-emerald-700">Done</span>
                        {/if}
                      </div>

                      <p class="m-0 mt-1 text-sm leading-relaxed text-slate-600">
                        {entry.lesson.promise}
                      </p>

                      {#if entry.outcomes.length}
                        <ul class="m-0 mt-3 list-none space-y-1 p-0">
                          {#each entry.outcomes as outcome (outcome.slovak)}
                            <li
                              class="grid grid-cols-[0.6rem_minmax(0,1fr)] gap-2 text-sm text-slate-600"
                            >
                              <span class="text-slate-300" aria-hidden="true">—</span>

                              <span class="min-w-0">
                                <span class="font-serif text-slate-800" lang="sk">
                                  {outcome.slovak}
                                </span>
                                <span class="text-slate-500"> · {outcome.english}</span>
                              </span>
                            </li>
                          {/each}
                        </ul>
                      {/if}

                      <p
                        class="m-0 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500"
                      >
                        <span>
                          {entry.lesson.scene.length} line{entry.lesson.scene.length === 1
                            ? ""
                            : "s"}
                        </span>
                        <span>
                          {entry.exerciseCount} exercise{entry.exerciseCount === 1
                            ? ""
                            : "s"}
                        </span>
                        <span
                          class="inline-flex items-center gap-1.5 font-medium text-blue-800 opacity-0 transition-opacity group-hover:opacity-100 max-[560px]:opacity-100"
                        >
                          Open lesson
                          <ArrowRight />
                        </span>
                      </p>
                    </div>
                  </a>
                </li>
              {/each}
            </ol>
          </section>
        {/each}
      </div>
    </div>
  </PageShell>
</main>
