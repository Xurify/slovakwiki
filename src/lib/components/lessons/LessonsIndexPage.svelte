<script lang="ts">
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import LessonsContinueCard from "$lib/components/lessons/LessonsContinueCard.svelte";
  import LessonTrackSection from "$lib/components/lessons/LessonTrackSection.svelte";
  import { lessonTracks, lessons, lessonsForTrack } from "$lib/catalog/lessons";
  import { nextLessonInList } from "$lib/lesson-progress/progress";

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
    <header class="max-w-2xl">
      <h1 class="text-balance">Lessons</h1>
      <Lead class="text-pretty">
        Watch a short scene in Slovak, learn the pattern behind it, then try it yourself.
        Your progress stays in this browser.
      </Lead>
    </header>

    <div class="mt-10">
      <LessonsContinueCard
        {focusLesson}
        {lessonNumber}
        {lessons}
        track={focusGroup?.track ?? null}
        trackLessonCount={focusGroup?.lessons.length ?? 0}
      />
    </div>

    <div class="mt-16 space-y-16" data-lessons-hydrate>
      {#each trackGroups as group, groupIndex (group.track.id)}
        <LessonTrackSection
          eager={groupIndex === 0}
          track={group.track}
          lessons={group.lessons}
          statusFor={(lesson) => (focusLesson?.id === lesson.id ? "active" : "upcoming")}
        />
      {/each}
    </div>
  </PageShell>
</main>
