<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { lessonTracks, lessons, lessonsForTrack } from "$lib/content/lessons";
  import LessonsKabinetLayout from "$lib/pages/lessons/LessonsKabinetLayout.svelte";

  const trackGroups = lessonTracks.map((track) => ({
    track,
    lessons: lessonsForTrack(track.id),
  }));

  const nextLesson = lessons[0] ?? null;
</script>

<main class="py-10 pb-20 max-[900px]:py-8">
  <PageShell class="max-w-[1180px]">
    <LessonsKabinetLayout
      hydrated={false}
      doneIds={new Set()}
      doneTotal={0}
      {nextLesson}
      {trackGroups}
    />
  </PageShell>
</main>
