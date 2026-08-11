<script lang="ts">
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import LessonsContinueCard from "$lib/components/lessons/LessonsContinueCard.svelte";
  import LessonTrackSection from "$lib/components/lessons/LessonTrackSection.svelte";
  import { lessonTracks, lessons, lessonsForTrack } from "$lib/content/lessons";
  import { nextLessonInList } from "$lib/lessons/progress";

  const trackGroups = lessonTracks.map((track) => ({
    track,
    lessons: lessonsForTrack(track.id),
  }));

  // SSR assumes no progress; LessonsProgressBoot paints before first paint.
  const doneIds = new Set<string>();

  const focusLesson = nextLessonInList(doneIds, lessons);

  const focusGroup =
    trackGroups.find((group) => group.track.id === focusLesson?.track) ?? null;

  const lessonNumber =
    focusGroup && focusLesson
      ? focusGroup.lessons.findIndex((lesson) => lesson.id === focusLesson.id) + 1
      : 1;
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div
      class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start lg:gap-12"
    >
      <aside class="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
        <LessonsContinueCard
          {focusLesson}
          {lessonNumber}
          {lessons}
          track={focusGroup?.track ?? null}
          trackLessonCount={focusGroup?.lessons.length ?? 0}
        />
      </aside>

      <div class="order-2 min-w-0 lg:order-1">
        <header class="max-w-xl">
          <h1 class="text-balance">Lessons</h1>
          <Lead class="text-pretty">
            Short interactive lessons you can finish in one sitting. Progress stays in
            this browser — pick any track and continue where you left off.
          </Lead>
        </header>

        <div class="mt-12 space-y-12">
          {#each trackGroups as group (group.track.id)}
            <LessonTrackSection
              track={group.track}
              lessons={group.lessons}
              statusFor={(lesson) =>
                focusLesson?.id === lesson.id ? "active" : "upcoming"}
            />
          {/each}
        </div>
      </div>
    </div>
  </PageShell>
</main>
