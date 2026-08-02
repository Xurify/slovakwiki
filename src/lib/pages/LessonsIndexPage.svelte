<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TrackCard from "$lib/components/lessons/TrackCard.svelte";
  import { lessonTracks, lessonsForTrack } from "$lib/content/lessons";
</script>

<main class="py-14 pb-20 max-[800px]:py-[30px] max-[800px]:pb-[50px]">
  <PageShell class="max-w-[1050px] pt-14 max-[600px]:pt-8">
  <header class="max-w-[700px]">
    <Eyebrow>Lessons</Eyebrow>
    <h1>Learn Slovak in context</h1>
    <Lead>
      Short, focused scenes that help you understand a pattern, then use it yourself.
    </Lead>
  </header>

  <section
    class="mt-10 grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-1"
    aria-label="Lesson tracks"
  >
    {#each lessonTracks as track (track.id)}
      {@const trackLessons = lessonsForTrack(track.id)}
      <TrackCard
        {track}
        lessonCount={trackLessons.length}
        preview={trackLessons[0]?.keyPhrases[0]}
      />
    {/each}
  </section>
  </PageShell>
</main>
