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
  <PageShell class="max-w-[720px]">
    <header class="max-w-[560px]">
      <h1 class="text-balance">Lessons</h1>
      <Lead class="text-pretty">
        Short interactive lessons. Your progress is saved in this browser.
      </Lead>
    </header>

    <div class="mt-9">
      <LessonsContinueCard
        {focusLesson}
        {lessonNumber}
        {lessons}
        track={focusGroup?.track ?? null}
        trackLessonCount={focusGroup?.lessons.length ?? 0}
      />
    </div>

    <div class="mt-14 space-y-12">
      {#each trackGroups as group (group.track.id)}
        <LessonTrackSection
          track={group.track}
          lessons={group.lessons}
          statusFor={(lesson) => (focusLesson?.id === lesson.id ? "active" : "upcoming")}
        />
      {/each}
    </div>
  </PageShell>
</main>
