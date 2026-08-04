<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { onMount } from "svelte";
  import { emptyPracticeState, readPracticeState } from "$lib/client/practice-state";
  import { lessonTracks, lessons, lessonsForTrack } from "$lib/content/lessons";
  import LessonsKabinetLayout from "$lib/pages/lessons/LessonsKabinetLayout.svelte";

  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  const trackGroups = lessonTracks.map((track) => ({
    track,
    lessons: lessonsForTrack(track.id),
  }));

  const doneIds = $derived(new Set(practiceState.completedLessonIds));

  const doneTotal = $derived(lessons.filter((lesson) => doneIds.has(lesson.id)).length);

  const nextLesson = $derived(
    lessons.find((lesson) => !doneIds.has(lesson.id)) ?? lessons[0] ?? null,
  );

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });
</script>

<main class="py-10 pb-20 max-[900px]:py-8">
  <PageShell class="max-w-[1180px]">
    <LessonsKabinetLayout {hydrated} {doneIds} {doneTotal} {nextLesson} {trackGroups} />
  </PageShell>
</main>
